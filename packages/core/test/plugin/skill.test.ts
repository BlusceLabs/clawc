import { describe, expect } from "bun:test"
import { Effect, Layer } from "effect"
import { AgentV2 } from "@clawc/core/agent"
import { FSUtil } from "@clawc/core/fs-util"
import { SkillPlugin } from "@clawc/core/plugin/skill"
import { SkillV2 } from "@clawc/core/skill"
import { SkillDiscovery } from "@clawc/core/skill/discovery"
import { testEffect } from "../lib/effect"
import { host } from "./host"

const it = testEffect(
  SkillV2.layer.pipe(
    Layer.provide(FSUtil.defaultLayer),
    Layer.provide(SkillDiscovery.defaultLayer),
    Layer.provideMerge(AgentV2.locationLayer),
  ),
)

describe("SkillPlugin.Plugin", () => {
  it.effect("registers the built-in customize-clawc skill", () =>
    Effect.gen(function* () {
      const skill = yield* SkillV2.Service
      yield* SkillPlugin.Plugin.effect(host({ skill: { ...skill, reload: skill.reload } }))

      expect(yield* skill.list()).toContainEqual(
        expect.objectContaining({
          name: "customize-clawc",
          description: expect.stringContaining("clawc's own configuration"),
        }),
      )
    }),
  )
})
