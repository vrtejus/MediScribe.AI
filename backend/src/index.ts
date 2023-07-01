import express from "express";

import { Deepgram } from "@deepgram/sdk";

import WS from "ws";

// Add Deepgram so we can get the transcription
const deepgram = new Deepgram("ef15d0c8fafbf8c16fbbbe6e2d4025337ed09178");

const ws = new WS.Server({ port: 4000 });

// Open WebSocket Connection and initiate live transcription
ws.on("connection", (ws: WebSocket) => {
  const transcriptionOptions = {
    interim_results: false,
    punctuate: true,
    endpointing: true,
    vad_turnoff: 500,
  };

  const deepgramLive = deepgram.transcription.live(transcriptionOptions);

  deepgramLive.addListener("open", () => console.log("dg websocket opened"));

  deepgramLive.addListener("error", (error: Error) => console.log({ error }));

  ws.onmessage = (event) => deepgramLive.send(event.data);

  ws.onclose = () => deepgramLive.finish();

  deepgramLive.addListener("transcriptReceived", (data: any) => {
    // Add a new document in collection "appointments" with ID 'transcription' in Firebase

    console.log("test 1 hot reload");

    ws.send(data);
  });
});
