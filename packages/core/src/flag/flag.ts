import { Config } from "effect"

export function truthy(key: string) {
  const value = process.env[key]?.toLowerCase()
  return value === "true" || value === "1"
}

const copy = process.env["CLAWC_EXPERIMENTAL_DISABLE_COPY_ON_SELECT"]
const fff = process.env["CLAWC_DISABLE_FFF"]

function enabledByExperimental(key: string) {
  return process.env[key] === undefined ? truthy("CLAWC_EXPERIMENTAL") : truthy(key)
}

export const Flag = {
  OTEL_EXPORTER_OTLP_ENDPOINT: process.env["OTEL_EXPORTER_OTLP_ENDPOINT"],
  OTEL_EXPORTER_OTLP_HEADERS: process.env["OTEL_EXPORTER_OTLP_HEADERS"],

  CLAWC_AUTO_HEAP_SNAPSHOT: truthy("CLAWC_AUTO_HEAP_SNAPSHOT"),
  CLAWC_GIT_BASH_PATH: process.env["CLAWC_GIT_BASH_PATH"],
  CLAWC_CONFIG: process.env["CLAWC_CONFIG"],
  CLAWC_CONFIG_CONTENT: process.env["CLAWC_CONFIG_CONTENT"],
  CLAWC_DISABLE_AUTOUPDATE: truthy("CLAWC_DISABLE_AUTOUPDATE"),
  CLAWC_ALWAYS_NOTIFY_UPDATE: truthy("CLAWC_ALWAYS_NOTIFY_UPDATE"),
  CLAWC_DISABLE_PRUNE: truthy("CLAWC_DISABLE_PRUNE"),
  CLAWC_DISABLE_TERMINAL_TITLE: truthy("CLAWC_DISABLE_TERMINAL_TITLE"),
  CLAWC_SHOW_TTFD: truthy("CLAWC_SHOW_TTFD"),
  CLAWC_DISABLE_AUTOCOMPACT: truthy("CLAWC_DISABLE_AUTOCOMPACT"),
  CLAWC_DISABLE_MODELS_FETCH: truthy("CLAWC_DISABLE_MODELS_FETCH"),
  CLAWC_DISABLE_MOUSE: truthy("CLAWC_DISABLE_MOUSE"),
  CLAWC_FAKE_VCS: process.env["CLAWC_FAKE_VCS"],
  CLAWC_SERVER_PASSWORD: process.env["CLAWC_SERVER_PASSWORD"],
  CLAWC_SERVER_USERNAME: process.env["CLAWC_SERVER_USERNAME"],
  CLAWC_DISABLE_FFF: fff === undefined ? process.platform === "win32" : truthy("CLAWC_DISABLE_FFF"),

  // Experimental
  CLAWC_EXPERIMENTAL_FILEWATCHER: Config.boolean("CLAWC_EXPERIMENTAL_FILEWATCHER").pipe(
    Config.withDefault(false),
  ),
  CLAWC_EXPERIMENTAL_DISABLE_FILEWATCHER: Config.boolean("CLAWC_EXPERIMENTAL_DISABLE_FILEWATCHER").pipe(
    Config.withDefault(false),
  ),
  CLAWC_EXPERIMENTAL_DISABLE_COPY_ON_SELECT:
    copy === undefined ? process.platform === "win32" : truthy("CLAWC_EXPERIMENTAL_DISABLE_COPY_ON_SELECT"),
  CLAWC_MODELS_URL: process.env["CLAWC_MODELS_URL"],
  CLAWC_MODELS_PATH: process.env["CLAWC_MODELS_PATH"],
  CLAWC_DB: process.env["CLAWC_DB"],

  CLAWC_WORKSPACE_ID: process.env["CLAWC_WORKSPACE_ID"],
  CLAWC_EXPERIMENTAL_WORKSPACES: enabledByExperimental("CLAWC_EXPERIMENTAL_WORKSPACES"),

  // Evaluated at access time (not module load) because tests, the CLI, and
  // external tooling set these env vars at runtime.
  get CLAWC_DISABLE_PROJECT_CONFIG() {
    return truthy("CLAWC_DISABLE_PROJECT_CONFIG")
  },
  get CLAWC_EXPERIMENTAL_REFERENCES() {
    return enabledByExperimental("CLAWC_EXPERIMENTAL_REFERENCES")
  },
  get CLAWC_TUI_CONFIG() {
    return process.env["CLAWC_TUI_CONFIG"]
  },
  get CLAWC_CONFIG_DIR() {
    return process.env["CLAWC_CONFIG_DIR"]
  },
  get CLAWC_PURE() {
    return truthy("CLAWC_PURE")
  },
  get CLAWC_PERMISSION() {
    return process.env["CLAWC_PERMISSION"]
  },
  get CLAWC_PLUGIN_META_FILE() {
    return process.env["CLAWC_PLUGIN_META_FILE"]
  },
  get CLAWC_CLIENT() {
    return process.env["CLAWC_CLIENT"] ?? "cli"
  },
}
