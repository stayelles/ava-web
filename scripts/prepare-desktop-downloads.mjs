import fs from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import path from 'node:path'

const release = JSON.parse(await fs.readFile('release/desktop.json', 'utf8'))
for (const value of [release.version, release.bridgeVersion, release.agentVersion]) {
  if (!/^\d+\.\d+(?:\.\d+)?$/.test(value)) throw new Error('Invalid release version')
}
const repo = 'stayelles/ava-desktop-releases'
const root = 'out/downloads'
await fs.mkdir(root, { recursive: true })
function download(tag, pattern, dir = root) {
  execFileSync('gh', ['release', 'download', tag, '--repo', repo, '--pattern', pattern, '--dir', dir, '--clobber'], { stdio: 'inherit' })
}
const binaries = [
  `AvaSetup-${release.version}.exe`, `AvaSetup-${release.version}.exe.blockmap`,
  ...['arm64', 'x64'].flatMap(arch => ['dmg', 'dmg.blockmap', 'zip', 'zip.blockmap'].map(ext => `Ava-${release.version}-${arch}.${ext}`)),
  `AvaBridgeEA-${release.bridgeVersion}.ex5`,
]
for (const file of [...binaries, 'latest.yml', 'latest-mac.yml', 'latest-mac-arm64.yml', 'latest-mac-x64.yml', 'SHA256SUMS.json']) download(`v${release.version}`, file)
const checksums = JSON.parse(await fs.readFile(path.join(root, 'SHA256SUMS.json'), 'utf8'))
for (const file of binaries) {
  const digest = createHash('sha256').update(await fs.readFile(path.join(root, file))).digest('hex')
  if (checksums[file] !== digest) throw new Error(`Release checksum mismatch: ${file}`)
}
// Each Mac feed has both the ZIP used by the updater and the DMG used by the download page.
for (const arch of ['arm64', 'x64']) {
  const dir = path.join(root, `mac-${arch}`)
  await fs.mkdir(dir, { recursive: true })
  const metadata = await fs.readFile(path.join(root, `latest-mac-${arch}.yml`), 'utf8')
  if (!metadata.includes(`version: ${release.version}`) || !metadata.includes(`Ava-${release.version}-${arch}.zip`)) throw new Error(`Incomplete Mac feed: ${arch}`)
  await fs.writeFile(path.join(dir, 'latest-mac.yml'), metadata)
  for (const ext of ['dmg', 'dmg.blockmap', 'zip', 'zip.blockmap']) await fs.copyFile(path.join(root, `Ava-${release.version}-${arch}.${ext}`), path.join(dir, `Ava-${release.version}-${arch}.${ext}`))
}
download(release.agentRelease, `AvaCloudAgent-${release.agentVersion}.zip`)
download('v1.2.5', 'AvaBridgeEA-1.34.ex5')
const cloud = JSON.parse(await fs.readFile('public/downloads/ava-cloud-manifest.json', 'utf8'))
if (cloud.ava.version !== release.version || cloud.bridge.version !== release.bridgeVersion || cloud.ava.sha256 !== checksums[`AvaSetup-${release.version}.exe`] || cloud.bridge.sha256 !== checksums[`AvaBridgeEA-${release.bridgeVersion}.ex5`]) throw new Error('Cloud manifest does not match release binaries')
// Publish discovery metadata only after every binary and the website have reached Hostinger.
const feeds = ['latest.yml', 'latest-mac.yml', 'latest-mac-arm64.yml', 'latest-mac-x64.yml', 'mac-arm64/latest-mac.yml', 'mac-x64/latest-mac.yml', 'ava-cloud-manifest.json']
for (const file of feeds) {
  const target = path.join('release-metadata/downloads', file)
  await fs.mkdir(path.dirname(target), { recursive: true })
  await fs.rename(path.join(root, file), target)
}
console.log(`Verified Desktop ${release.version}, Bridge ${release.bridgeVersion}; update feeds staged last.`)
if (process.env.GITHUB_OUTPUT) await fs.appendFile(process.env.GITHUB_OUTPUT, `version=${release.version}\n`)
