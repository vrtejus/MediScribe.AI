const { Deepgram } = require("@deepgram/sdk");
const WS = require("ws");

// Add Deepgram so we can get the transcription
const deepgram = new Deepgram("ef15d0c8fafbf8c16fbbbe6e2d4025337ed09178");

// Add WebSocket
const wss = new WS.Server({ port: 3002 });

// Open WebSocket Connection and initiate live transcription
wss.on("connection", (ws: WebSocket) => {
  const transcriptionOptions = {
    interim_results: false,
    punctuate: true,
    endpointing: true,
    vad_turnoff: 500,
  };

  const deepgramLive = deepgram.transcription.live(transcriptionOptions);

  deepgramLive.addListener("open", () => console.log("dg onopen"));

  deepgramLive.addListener("error", (error: Error) => console.log({ error }));

  ws.onmessage = (event) => deepgramLive.send(event.data);

  ws.onclose = () => deepgramLive.finish();

  deepgramLive.addListener("transcriptReceived", (data: any) => ws.send(data));
});
