export * as Database from "./database"

import { EffectDrizzleSqlite } from "@clawc/effect-drizzle-sqlite"
import { layer as sqliteLayer } from "#sqlite"
import { Context, Effect, Layer } from "effect"
import { Global } from "../global"
import { Flag } from "../flag/flag"
import { isAbsolute, join } from "path"
import { DatabaseMigration } from "./migration"
import { InstallationChannel } from "../installation/version"
import { LayerNode } from "../effect/layer-node"

const makeDatabase = EffectDrizzleSqlite.makeWithDefaults()
type DatabaseShape = Effect.Success<typeof makeDatabase>

export interface Interface {
  db: DatabaseShape
}

export class Service extends Context.Service<Service, Interface>()("@clawc/v2/storage/Database") {}

export const layer = Layer.effect(
  Service,
  Effect.gen(function* () {
    const db = yield* makeDatabase

    // Batch PRAGMA statements for faster initialization
    yield* db.run(`
      PRAGMA journal_mode = WAL;
      PRAGMA synchronous = NORMAL;
      PRAGMA busy_timeout = 5000;
      PRAGMA cache_size = -64000;
      PRAGMA foreign_keys = ON;
      PRAGMA wal_checkpoint(PASSIVE)
    `)
    yield* DatabaseMigration.apply(db)

    return { db }
  }).pipe(Effect.orDie),
)

export function layerFromPath(filename: string) {
  return layer.pipe(Layer.provide(sqliteLayer({ filename })))
}

export function path() {
  if (Flag.CLAWC_DB) {
    if (Flag.CLAWC_DB === ":memory:" || isAbsolute(Flag.CLAWC_DB)) return Flag.CLAWC_DB
    return join(Global.Path.data, Flag.CLAWC_DB)
  }
  if (
    ["latest", "beta", "prod"].includes(InstallationChannel) ||
    process.env.CLAWC_DISABLE_CHANNEL_DB === "1" ||
    process.env.CLAWC_DISABLE_CHANNEL_DB === "true"
  )
    return join(Global.Path.data, "clawc.db")
  return join(Global.Path.data, `clawc-${InstallationChannel.replace(/[^a-zA-Z0-9._-]/g, "-")}.db`)
}

export const defaultLayer = Layer.unwrap(
  Effect.gen(function* () {
    return layerFromPath(path())
  }),
).pipe(Layer.provide(Global.defaultLayer))

export const node = LayerNode.make({ service: Service, layer: layerFromPath(path()), deps: [] })
