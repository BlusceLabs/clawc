import { $ } from "bun"

await $`bun ./scripts/copy-icons.ts ${process.env.CLAWC_CHANNEL ?? "dev"}`

await $`cd ../clawc && bun script/build-node.ts`
