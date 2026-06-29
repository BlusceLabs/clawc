const stage = process.env.SST_STAGE || "dev"

export default {
  url: stage === "production" ? "https://clawc.ai" : `https://${stage}.clawc.ai`,
  console: stage === "production" ? "https://clawc.ai/auth" : `https://${stage}.clawc.ai/auth`,
  email: "help@anoma.ly",
  socialCard: "https://social-cards.sst.dev",
  github: "https://github.com/anomalyco/clawc",
  discord: "https://clawc.ai/discord",
  headerLinks: [
    { name: "app.header.home", url: "/" },
    { name: "app.header.docs", url: "/docs/" },
  ],
}
