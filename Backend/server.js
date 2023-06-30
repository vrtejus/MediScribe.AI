var Deepgram = require("@deepgram/sdk").Deepgram;
var WS = require("ws");
// Add Deepgram so we can get the transcription
var deepgram = new Deepgram("ef15d0c8fafbf8c16fbbbe6e2d4025337ed09178");
// Add WebSocket
var wss = new WS.Server({ port: 3002 });
// Open WebSocket Connection and initiate live transcription
wss.on("connection", function (ws) {
    var transcriptionOptions = {
        interim_results: false,
        punctuate: true,
        endpointing: true,
        vad_turnoff: 500,
    };
    var deepgramLive = deepgram.transcription.live(transcriptionOptions);
    deepgramLive.addListener("open", function () { return console.log("dg onopen"); });
    deepgramLive.addListener("error", function (error) { return console.log({ error: error }); });
    ws.onmessage = function (event) { return deepgramLive.send(event.data); };
    ws.onclose = function () { return deepgramLive.finish(); };
    deepgramLive.addListener("transcriptReceived", function (data) { return ws.send(data); });
});
