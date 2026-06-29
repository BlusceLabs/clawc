declare global {
  const CLAWC_VERSION: string
  const CLAWC_CHANNEL: string
}

export const InstallationVersion = typeof CLAWC_VERSION === "string" ? CLAWC_VERSION : "local"
export const InstallationChannel = typeof CLAWC_CHANNEL === "string" ? CLAWC_CHANNEL : "local"
export const InstallationLocal = InstallationChannel === "local"
