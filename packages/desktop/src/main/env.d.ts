interface ImportMetaEnv {
  readonly CLAWC_CHANNEL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module "virtual:clawc-server" {
  export namespace Server {
    export const listen: typeof import("../../../clawc/dist/types/src/node").Server.listen
    export type Listener = import("../../../clawc/dist/types/src/node").Server.Listener
  }
  export namespace Config {
    export const get: typeof import("../../../clawc/dist/types/src/node").Config.get
    export type Info = import("../../../clawc/dist/types/src/node").Config.Info
  }
  export const bootstrap: typeof import("../../../clawc/dist/types/src/node").bootstrap
}
