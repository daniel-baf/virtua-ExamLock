const { createAgentApp } = require('./src/app/http/createAgentApp');
const { createSseHub } = require('./src/app/sse/createSseHub');
const { createSessionState } = require('./src/app/state/sessionState');

const serverUrl = process.env.SERVER_URL;
const port = process.env.AGENT_PORT ?? 7878;

createAgentApp({
  serverUrl,
  port,
  state: createSessionState(),
  sse: createSseHub(),
});
