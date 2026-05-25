<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Deployment Guardrails

Do not replace the Hostinger deploy workflow with an SFTP/SSH deploy action.

The production deploy for `call-ava.com` must use:

- `.github/workflows/deploy.yml`
- `SamKirkland/FTP-Deploy-Action@v4.3.5`
- GitHub Actions secrets `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`
- Hostinger FTP account credentials, not SSH credentials
- `local-dir: ./out/`
- `server-dir: /public_html/`

Known regression: switching this workflow to `wlixcc/SFTP-Deploy-Action` caused failed deploys because the GitHub secrets are FTP credentials. Hostinger SSH/SFTP may use port `65002`, but this site deployment is intentionally FTP on the Hostinger FTP account. If deploy fails with `530 Login incorrect`, update the FTP password secret in GitHub instead of changing the workflow protocol.

## Download Artifacts

The landing page points Ava Desktop downloads to versioned files under:

`https://call-ava.com/downloads/`

When changing desktop download links, keep filenames versioned so older installers remain available. The current expected Ava Trading files are:

- `Ava-1.0.9-arm64.dmg`
- `Ava-1.0.9-x64.dmg`
- `AvaSetup-1.0.9.exe`
- `AvaBridgeEA-1.0.9.mq5`
