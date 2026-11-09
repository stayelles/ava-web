import fs from 'node:fs/promises'
import { createHash } from 'node:crypto'

const release = JSON.parse(await fs.readFile('release/desktop.json', 'utf8'))
const checksums = JSON.parse(await fs.readFile('out/downloads/SHA256SUMS.json', 'utf8'))
const base = 'https://call-ava.com/downloads/'
const verified = []
async function get(file) {
  const response = await fetch(new URL(file, base), { signal: AbortSignal.timeout(600_000), headers: { 'Cache-Control': 'no-cache' } })
  if (!response.ok) throw new Error(`${file}: HTTP ${response.status}`)
  return response
}
const binaries = Object.entries(checksums).filter(([name]) => /\.(?:exe|dmg|zip|blockmap|ex5)$/.test(name))
for (let i = 0; i < binaries.length; i += 3) {
  await Promise.all(binaries.slice(i, i + 3).map(async ([name, expected]) => {
    if (name.includes('/') || name.includes('..')) throw new Error('Invalid artifact name')
    const response = await get(name)
    const hash = createHash('sha256')
    for await (const chunk of response.body) hash.update(chunk)
    const actual = hash.digest('hex')
    if (actual !== expected) throw new Error(`Published checksum mismatch: ${name}`)
    verified.push({ name, sha256: actual })
    console.log(`Verified ${name}`)
  }))
}
for (const name of ['latest.yml', 'latest-mac.yml', 'mac-arm64/latest-mac.yml', 'mac-x64/latest-mac.yml']) {
  const text = await (await get(name)).text()
  if (!text.includes(`version: ${release.version}`)) throw new Error(`Stale published feed: ${name}`)
  if (name.includes('mac-')) {
    const arch = name.includes('arm64') ? 'arm64' : 'x64'
    if (!text.includes(`Ava-${release.version}-${arch}.zip`)) throw new Error(`Incomplete published feed: ${name}`)
    const response = await fetch(`${base}mac-${arch}/Ava-${release.version}-${arch}.zip`, { method: 'HEAD' })
    if (!response.ok) throw new Error(`Missing updater ZIP: ${arch}`)
  }
}
const manifest = await (await get('ava-cloud-manifest.json')).json()
if (!manifest.safe_updates || manifest.ava?.windows_url || manifest.bridge?.url) throw new Error('Unsafe legacy Cloud rollout')
const safeCloud = manifest.safe_updates
const agentFile = `AvaCloudAgent-${release.agentVersion}.zip`
if (manifest.agent?.version !== release.agentVersion || manifest.agent?.sha256 !== checksums[agentFile]) throw new Error('Cloud agent manifest mismatch')
if (safeCloud.ava.version !== release.version || safeCloud.bridge.version !== release.bridgeVersion || safeCloud.ava.sha256 !== checksums[`AvaSetup-${release.version}.exe`] || safeCloud.bridge.sha256 !== checksums[`AvaBridgeEA-${release.bridgeVersion}.ex5`]) throw new Error('Stale published Cloud manifest')
await fs.writeFile('release-verification.json', JSON.stringify({ verifiedAt: new Date().toISOString(), version: release.version, verified }, null, 2))
console.log('All public downloads, update feeds and Cloud manifest verified.')
