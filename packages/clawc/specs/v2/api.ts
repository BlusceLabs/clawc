// @ts-nocheck

import { OpenCode } from "@clawc/core"
import { ReadTool } from "@clawc/core/tools"

const clawc = OpenCode.make({})

clawc.tool.add(ReadTool)

clawc.tool.add({
  name: "bash",
  schema: {
    type: "object",
    properties: {
      command: {
        type: "string",
        description: "The command to run.",
      },
    },
    required: ["command"],
  },
  execute(input, ctx) {},
})

clawc.auth.add({
  provider: "openai",
  type: "api",
  value: process.env.OPENAI_API_KEY,
})

clawc.agent.add({
  name: "build",
  permissions: [],
  model: {
    id: "gpt-5-5",
    provider: "openai",
    variant: "xhigh",
  },
})

const sessionID = await clawc.session.create({
  agent: "build",
})

clawc.subscribe((event) => {
  console.log(event)
})

await clawc.session.prompt({
  sessionID,
  text: "hey what is up",
})

await clawc.session.prompt({
  sessionID,
  text: "what is up with this",
  files: [
    {
      mime: "image/png",
      uri: "data:image/png;base64,xxxx",
    },
  ],
})

await clawc.session.wait()

console.log(await clawc.session.messages(sessionID))
