export const AVA_DESKTOP_VERSION = '1.5.52'
export const AVA_BRIDGE_EA_VERSION = '1.68'
export const DOWNLOAD_BASE_URL = 'https://call-ava.com/downloads'

export const DESKTOP_DOWNLOAD_URLS = {
  macArm: `${DOWNLOAD_BASE_URL}/Ava-${AVA_DESKTOP_VERSION}-arm64.dmg`,
  macIntel: `${DOWNLOAD_BASE_URL}/Ava-${AVA_DESKTOP_VERSION}-x64.dmg`,
  windows: `${DOWNLOAD_BASE_URL}/AvaSetup-${AVA_DESKTOP_VERSION}.exe`,
} as const
