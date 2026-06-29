import { expect, test } from "bun:test"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { Flag } from "@clawc/core/flag/flag"
import { Effect, Option, Schema, Stream } from "effect"

test("embedded client uses the real router and handlers", async () => {
  const directory = await mkdtemp(join(tmpdir(), "clawc-embedded-"))
  const database = Flag.CLAWC_DB
  Flag.CLAWC_DB = join(directory, "clawc.sqlite")
  const { AbsolutePath, Agent, Location, Model, OpenCode, Prompt, Provider, Session, Tool } = await import("../src")
  const sessionID = Session.ID.make(`ses_embedded_${crypto.randomUUID()}`)
  const model = Model.Ref.make({ id: Model.ID.make("embedded"), providerID: Provider.ID.make("test") })

  try {
    const program = Effect.gen(function* () {
      const clawc = yield* OpenCode.create()
      yield* clawc.tools.register({
        embedded_tool: Tool.make({
          description: "Embedded test tool",
          input: Schema.Struct({}),
          output: Schema.Struct({ ok: Schema.Boolean }),
          execute: () => Effect.succeed({ ok: true }),
        }),
      })

      const created = yield* clawc.sessions.create({
        id: sessionID,
        agent: Agent.ID.make("build"),
        location: Location.Ref.make({ directory: AbsolutePath.make(directory) }),
      })
      yield* clawc.sessions.switchModel({ sessionID, model })
      const selected = yield* clawc.sessions.get({ sessionID })
      const page = yield* clawc.sessions.list({ directory: AbsolutePath.make(directory) })
      const admitted = yield* clawc.sessions.prompt({
        sessionID,
        prompt: Prompt.make({ text: "Do not run" }),
        resume: false,
      })
      const context = yield* clawc.sessions.context({ sessionID })
      const event = yield* clawc.sessions
        .events({ sessionID })
        .pipe(Stream.take(1), Stream.runHead, Effect.map(Option.getOrUndefined))
      const modelMessage = Option.fromNullishOr(context.find((message) => message.type === "model-switched")).pipe(
        Option.getOrThrow,
      )
      const message = yield* clawc.sessions.message({ sessionID, messageID: modelMessage.id })
      yield* clawc.sessions.interrupt({ sessionID })
      const other = yield* clawc.sessions.create({
        location: Location.Ref.make({ directory: AbsolutePath.make(directory) }),
      })
      const missingSessionID = Session.ID.make(`ses_missing_${crypto.randomUUID()}`)
      const missing = yield* Effect.all(
        [
          clawc.sessions.events({ sessionID: missingSessionID }).pipe(Stream.runHead, Effect.flip),
          clawc.sessions.interrupt({ sessionID: missingSessionID }).pipe(Effect.flip),
          clawc.sessions.message({ sessionID: missingSessionID, messageID: modelMessage.id }).pipe(Effect.flip),
        ],
        { concurrency: "unbounded" },
      )
      const missingMessage = yield* Effect.flip(
        clawc.sessions.message({
          sessionID: other.id,
          messageID: modelMessage.id,
        }),
      )

      expect(created.id).toBe(sessionID)
      expect(selected.model?.id).toBe(model.id)
      expect(selected.model?.providerID).toBe(model.providerID)
      expect(page.data.some((session) => session.id === sessionID)).toBe(true)
      expect(admitted.sessionID).toBe(sessionID)
      expect(context.some((message) => message.type === "model-switched")).toBe(true)
      expect(event).toMatchObject({ type: "session.next.model.switched", durable: { seq: 1 } })
      expect(message).toEqual(modelMessage)
      expect(missing.map((error) => error._tag)).toEqual([
        "SessionNotFoundError",
        "SessionNotFoundError",
        "SessionNotFoundError",
      ])
      expect(missingMessage._tag).toBe("MessageNotFoundError")
    })
    await Effect.runPromise(Effect.scoped(program))
  } finally {
    Flag.CLAWC_DB = database
    await rm(directory, { recursive: true, force: true })
  }
})

test("embedded client is available as a Layer service", async () => {
  const directory = await mkdtemp(join(tmpdir(), "clawc-embedded-layer-"))
  const database = Flag.CLAWC_DB
  Flag.CLAWC_DB = join(directory, "clawc.sqlite")
  const { AbsolutePath, Location, OpenCode, Session } = await import("../src")
  const sessionID = Session.ID.make(`ses_embedded_${crypto.randomUUID()}`)

  try {
    const created = await Effect.runPromise(
      Effect.gen(function* () {
        const clawc = yield* OpenCode.Service
        return yield* clawc.sessions.create({
          id: sessionID,
          location: Location.Ref.make({ directory: AbsolutePath.make(directory) }),
        })
      }).pipe(Effect.provide(OpenCode.layer), Effect.scoped),
    )

    expect(created.id).toBe(sessionID)
  } finally {
    Flag.CLAWC_DB = database
    await rm(directory, { recursive: true, force: true })
  }
})
