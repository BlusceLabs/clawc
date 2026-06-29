import { run as runTui, type TuiInput } from "@clawc/tui"
import { Global } from "@clawc/core/global"
import { Effect } from "effect"

export function run(input: TuiInput) {
  return runTui(input).pipe(Effect.provide(Global.defaultLayer))
}
