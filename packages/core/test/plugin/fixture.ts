import { Credential } from "@clawc/core/credential"
import { EventV2 } from "@clawc/core/event"
import { FileSystem } from "@clawc/core/filesystem"
import { FSUtil } from "@clawc/core/fs-util"
import { Global } from "@clawc/core/global"
import { Npm } from "@clawc/core/npm"
import { PluginV2 } from "@clawc/core/plugin"
import { RepositoryCache } from "@clawc/core/repository-cache"
import { Ripgrep } from "@clawc/core/ripgrep"
import { SkillDiscovery } from "@clawc/core/skill/discovery"
import { Effect, Layer } from "effect"
import { FetchHttpClient } from "effect/unstable/http"
import { tempLocationLayer } from "../fixture/location"

export const PluginTestLayer = Layer.mergeAll(FileSystem.locationLayer, PluginV2.locationLayer).pipe(
  Layer.provideMerge(
    Layer.mergeAll(
      Credential.defaultLayer,
      EventV2.defaultLayer,
      FetchHttpClient.layer,
      FSUtil.defaultLayer,
      Global.defaultLayer,
      Layer.succeed(
        Npm.Service,
        Npm.Service.of({
          add: () => Effect.succeed({ directory: "", entrypoint: undefined }),
          install: () => Effect.void,
          which: () => Effect.succeed(undefined),
        }),
      ),
      RepositoryCache.defaultLayer,
      SkillDiscovery.defaultLayer,
      Ripgrep.defaultLayer,
      tempLocationLayer,
    ),
  ),
)
