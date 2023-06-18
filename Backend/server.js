// Add Deepgram so we can get the transcription
const { Deepgram } = require("@deepgram/sdk");
const deepgram = new Deepgram("ef15d0c8fafbf8c16fbbbe6e2d4025337ed09178");

// Add WebSocket
const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 3002 });

// Open WebSocket Connection and initiate live transcription
wss.on("connection", (ws) => {
  const deepgramLive = deepgram.transcription.live({
    interim_results: false,
    punctuate: true,
    endpointing: true,
    vad_turnoff: 500,
  });

  deepgramLive.addListener("open", () => console.log("dg onopen"));

  deepgramLive.addListener("error", (error) => console.log({ error }));

  ws.onmessage = (event) => deepgramLive.send(event.data);

  ws.onclose = () => deepgramLive.finish();

  deepgramLive.addListener("transcriptReceived", (data) => ws.send(data));
});
