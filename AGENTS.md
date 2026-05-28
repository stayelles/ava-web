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

Keep `public/downloads/.htaccess` deployed with the site. It forces `.dmg`, `.exe`, and `.mq5` files to download instead of rendering inline in Chrome/Safari. If Mac installers or the MT5 bridge open as garbled text in the browser, fix the download headers here rather than changing the file URLs.

When changing desktop download links, keep filenames versioned so older installers remain available. The current expected Ava Trading files are:

- `Ava-1.1.5-arm64.dmg`
- `Ava-1.1.5-x64.dmg`
- `AvaSetup-1.1.5.exe`
- `AvaBridgeEA-1.12.mq5`

## macOS Signature & Notarization (Apple Developer)

To ensure macOS desktop builds are not blocked by Gatekeeper upon installation:
- **Certificate**: A valid Apple "Developer ID Application" certificate must be installed in the Keychain of the build host.
- **Identity**: Configured in `package.json` as `"Woonix LTD (YW93WGC3RQ)"`.
- **Entitlements**: Uses `build/entitlements.mac.plist` (which allows JIT, micro access, and location).
- **Notarization**: Apple notarization requires the following env vars to be present when running the release command:
  - `APPLE_ID`: The Apple Developer account email address.
  - `APPLE_APP_SPECIFIC_PASSWORD`: An app-specific password generated on appleid.apple.com.
  - `APPLE_TEAM_ID`: `YW93WGC3RQ` (also specified in `package.json` under `notarize.teamId`).
- **Release Command**:
  ```bash
  APPLE_ID="your-apple-id@dev.com" APPLE_APP_SPECIFIC_PASSWORD="abcd-efgh-ijkl-mnop" GH_TOKEN="your_github_token" npm run release:mac
  ```
