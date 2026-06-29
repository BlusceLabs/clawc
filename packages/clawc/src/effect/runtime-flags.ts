import { Config, ConfigProvider, Context, Effect, Layer, Option } from "effect"
import { ConfigService } from "@/effect/config-service"

const bool = (name: string) => Config.boolean(name).pipe(Config.withDefault(false))
const positiveInteger = (name: string) =>
  Config.number(name).pipe(
    Config.map((value) => (Number.isInteger(value) && value > 0 ? value : undefined)),
    Config.orElse(() => Config.succeed(undefined)),
  )
const experimental = bool("CLAWC_EXPERIMENTAL")
const enabledByExperimental = (name: string) =>
  Config.all({ experimental, enabled: Config.boolean(name).pipe(Config.option) }).pipe(
    Config.map((flags) => Option.getOrElse(flags.enabled, () => flags.experimental)),
  )

export class Service extends ConfigService.Service<Service>()("@clawc/RuntimeFlags", {
  autoShare: bool("CLAWC_AUTO_SHARE"),
  pure: bool("CLAWC_PURE"),
  disableDefaultPlugins: bool("CLAWC_DISABLE_DEFAULT_PLUGINS"),
  disableEmbeddedWebUi: bool("CLAWC_DISABLE_EMBEDDED_WEB_UI"),
  disableExternalSkills: bool("CLAWC_DISABLE_EXTERNAL_SKILLS"),
  disableLspDownload: bool("CLAWC_DISABLE_LSP_DOWNLOAD"),
  disableClaudeCodePrompt: Config.all({
    broad: bool("CLAWC_DISABLE_CLAUDE_CODE"),
    direct: bool("CLAWC_DISABLE_CLAUDE_CODE_PROMPT"),
  }).pipe(Config.map((flags) => flags.broad || flags.direct)),
  disableClaudeCodeSkills: Config.all({
    broad: bool("CLAWC_DISABLE_CLAUDE_CODE"),
    direct: bool("CLAWC_DISABLE_CLAUDE_CODE_SKILLS"),
  }).pipe(Config.map((flags) => flags.broad || flags.direct)),
  enableExa: Config.all({
    experimental,
    enabled: bool("CLAWC_ENABLE_EXA"),
    legacy: bool("CLAWC_EXPERIMENTAL_EXA"),
  }).pipe(Config.map((flags) => flags.experimental || flags.enabled || flags.legacy)),
  enableParallel: Config.all({
    enabled: bool("CLAWC_ENABLE_PARALLEL"),
    legacy: bool("CLAWC_EXPERIMENTAL_PARALLEL"),
  }).pipe(Config.map((flags) => flags.enabled || flags.legacy)),
  enableExperimentalModels: bool("CLAWC_ENABLE_EXPERIMENTAL_MODELS"),
  enableQuestionTool: bool("CLAWC_ENABLE_QUESTION_TOOL"),
  experimentalReferences: enabledByExperimental("CLAWC_EXPERIMENTAL_REFERENCES"),
  experimentalBackgroundSubagents: enabledByExperimental("CLAWC_EXPERIMENTAL_BACKGROUND_SUBAGENTS"),
  experimentalLspTy: bool("CLAWC_EXPERIMENTAL_LSP_TY"),
  experimentalLspTool: enabledByExperimental("CLAWC_EXPERIMENTAL_LSP_TOOL"),
  experimentalOxfmt: enabledByExperimental("CLAWC_EXPERIMENTAL_OXFMT"),
  experimentalPlanMode: enabledByExperimental("CLAWC_EXPERIMENTAL_PLAN_MODE"),
  experimentalEventSystem: enabledByExperimental("CLAWC_EXPERIMENTAL_EVENT_SYSTEM"),
  experimentalWorkspaces: enabledByExperimental("CLAWC_EXPERIMENTAL_WORKSPACES"),
  experimentalIconDiscovery: enabledByExperimental("CLAWC_EXPERIMENTAL_ICON_DISCOVERY"),
  outputTokenMax: positiveInteger("CLAWC_EXPERIMENTAL_OUTPUT_TOKEN_MAX"),
  bashDefaultTimeoutMs: positiveInteger("CLAWC_EXPERIMENTAL_BASH_DEFAULT_TIMEOUT_MS"),
  experimentalNativeLlm: bool("CLAWC_EXPERIMENTAL_NATIVE_LLM"),
  experimentalWebSockets: bool("CLAWC_EXPERIMENTAL_WEBSOCKETS"),
  client: Config.string("CLAWC_CLIENT").pipe(Config.withDefault("cli")),
}) {}

export type Info = Context.Service.Shape<typeof Service>

const emptyConfigLayer = Service.defaultLayer.pipe(
  Layer.provide(ConfigProvider.layer(ConfigProvider.fromUnknown({}))),
  Layer.orDie,
)

export const layer = (overrides: Partial<Info> = {}) =>
  Layer.effect(
    Service,
    Effect.gen(function* () {
      const flags = yield* Service
      return Service.of({ ...flags, ...overrides })
    }),
  ).pipe(Layer.provide(emptyConfigLayer))

export const defaultLayer = Service.defaultLayer.pipe(Layer.orDie)

export const node = LayerNode.make({ service: Service, layer: defaultLayer, deps: [] })

export * as RuntimeFlags from "./runtime-flags"
import { LayerNode } from "@clawc/core/effect/layer-node"
