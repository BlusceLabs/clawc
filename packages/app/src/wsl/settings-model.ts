import type { WslClawcCheck, WslServerRuntime } from "./types"

export const wslRuntimeRetryable = (runtime: WslServerRuntime) =>
  runtime.kind === "failed" || runtime.kind === "stopped"

export async function enterWslClawcStep(
  distro: string,
  probe: (distro: string) => Promise<unknown>,
  select: (step: "clawc") => void,
) {
  await probe(distro)
  select("clawc")
}

export function wslClawcAction(check?: WslClawcCheck) {
  if (!check) return
  if (!check.resolvedPath) return "Install ClawC"
  if (check.matchesDesktop === false) return "Update ClawC"
}
