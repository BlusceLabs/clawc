import { Context } from "effect"
import type { InstanceContext } from "@/project/instance-context"
import type { WorkspaceV2 } from "@clawc/core/workspace"

export const InstanceRef = Context.Reference<InstanceContext | undefined>("~clawc/InstanceRef", {
  defaultValue: () => undefined,
})

export const WorkspaceRef = Context.Reference<WorkspaceV2.ID | undefined>("~clawc/WorkspaceRef", {
  defaultValue: () => undefined,
})
