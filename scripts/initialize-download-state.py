"""Initialize a missing release state without replacing an existing FTP state."""
import ftplib
import io
import json
import os
import re
import time


def initialize(ftp, version):
    if not re.fullmatch(r"\d+\.\d+\.\d+", version):
        raise ValueError("Invalid release version")
    ftp.cwd("/public_html/downloads")
    name = f".ftp-deploy-desktop-{version}.json"
    ftp.voidcmd("TYPE I")
    try:
        ftp.size(name)
        return False
    except ftplib.error_perm as error:
        if not str(error).startswith("550"):
            raise
    # SIZE can also fail for a permission issue: confirm absence before writing.
    if name in {entry.rsplit("/", 1)[-1] for entry in ftp.nlst()}:
        raise RuntimeError("Existing state cannot be read; refusing replacement")
    state = {"description": "FTP Deploy release state", "version": "1.0.0",
             "generatedTime": int(time.time() * 1000), "data": []}
    ftp.storbinary("STOR " + name, io.BytesIO(json.dumps(state).encode()))
    return True


if __name__ == "__main__":
    version = json.load(open("release/desktop.json"))["version"]
    for attempt in range(3):
        try:
            with ftplib.FTP(timeout=60) as ftp:
                ftp.connect(os.environ["FTP_SERVER"])
                ftp.login(os.environ["FTP_USERNAME"], os.environ["FTP_PASSWORD"])
                created = initialize(ftp, version)
            print("Release state initialized" if created else "Existing release state preserved")
            break
        except (OSError, ftplib.Error, RuntimeError) as error:
            # Server replies can contain account details; do not log their body.
            print(f"FTP state check attempt {attempt + 1}: {type(error).__name__}")
            if attempt == 2:
                raise SystemExit("Cannot safely initialize release state") from None
            time.sleep(8)
