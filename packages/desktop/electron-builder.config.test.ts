import { expect, test } from "bun:test"
import type { Configuration } from "electron-builder"

const legacyDesktopEntry = "resources/linux/clawc-desktop.desktop"

const channels = [
  { channel: "dev", appId: "ai.clawc.desktop.dev" },
  { channel: "beta", appId: "ai.clawc.desktop.beta" },
  { channel: "prod", appId: "ai.clawc.desktop" },
] as const

for (const channel of channels) {
  test(`uses one Linux desktop identity for ${channel.channel}`, async () => {
    const previous = process.env.CLAWC_CHANNEL
    process.env.CLAWC_CHANNEL = channel.channel

    const module = await import(`./electron-builder.config.ts?channel=${channel.channel}`)
    const config = module.default as Configuration

    if (previous === undefined) delete process.env.CLAWC_CHANNEL
    else process.env.CLAWC_CHANNEL = previous

    expect(config.appId).toBe(channel.appId)
    expect(config.extraMetadata?.desktopName).toBe(`${channel.appId}.desktop`)
    expect(config.linux?.executableName).toBe(channel.appId)
    expect(config.linux?.desktop?.entry?.StartupWMClass).toBe(channel.appId)
  })
}

test("keeps a hidden prod launcher for old Linux pins", async () => {
  const previous = process.env.CLAWC_CHANNEL
  process.env.CLAWC_CHANNEL = "prod"

  const module = await import("./electron-builder.config.ts?compat=prod")
  const config = module.default as Configuration

  if (previous === undefined) delete process.env.CLAWC_CHANNEL
  else process.env.CLAWC_CHANNEL = previous

  expect(config.deb?.fpm?.[0]).toEndWith(`${legacyDesktopEntry}=/usr/share/applications/clawc-desktop.desktop`)
  expect(config.rpm?.fpm?.[0]).toEndWith(`${legacyDesktopEntry}=/usr/share/applications/clawc-desktop.desktop`)

  const desktop = await Bun.file(legacyDesktopEntry).text()
  expect(desktop).toContain("Exec=/opt/OpenCode/ai.clawc.desktop %U")
  expect(desktop).toContain("Icon=ai.clawc.desktop")
  expect(desktop).toContain("StartupWMClass=ai.clawc.desktop")
  expect(desktop).toContain("NoDisplay=true")
})
