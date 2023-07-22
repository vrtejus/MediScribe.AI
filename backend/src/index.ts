import express from "express";

import { Deepgram } from "@deepgram/sdk";

import WS from "ws";

import cors from "cors";

import { Configuration, OpenAIApi } from "openai";
const configuration = new Configuration({
  organization: "org-xACdb2oe7uOMfDChhMbcoC8X",
  apiKey: "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",
});
const openai = new OpenAIApi(configuration);

// Add Deepgram so we can get the transcription
const deepgram = new Deepgram("ef15d0c8fafbf8c16fbbbe6e2d4025337ed09178");

const ws = new WS.Server({ port: 4000 });
const app = express();
app.use(express.json());

// @ts-ignore
app.use(cors());

// Open WebSocket Connection and initiate live transcription
ws.on("connection", (ws: WebSocket) => {
  const transcriptionOptions = {
    interim_results: false,
    punctuate: true,
    endpointing: true,
    vad_turnoff: 500,
  };

  const deepgramLive = deepgram.transcription.live(transcriptionOptions);

  // @ts-ignore
  deepgramLive.addListener("open", () => console.log("dg websocket opened"));

  // @ts-ignore
  deepgramLive.addListener("error", (error: Error) => console.log({ error }));

  ws.onmessage = (event) => deepgramLive.send(event.data);

  ws.onclose = () => deepgramLive.finish();

  // @ts-ignore
  deepgramLive.addListener("transcriptReceived", (data: any) => {
    // Add a new document in collection "appointments" with ID 'transcription' in Firebase

    console.log("test 1 hot reload");
    console.log("data: ", data);

    ws.send(data);
  });
});

// Define the HTTP routes
app.get("/", (req, res) => {
  console.log("Handling GET request to /");
  res.send("Hello, world!");
});

app.post("/sendDialogue", async (req, res) => {
  try {
    console.log("Handling POST request to /sendDialogue");

    const { dialogue } = req.body;
    if (!dialogue) throw new Error("No dialogue provided");

    console.log("dialogue: ", dialogue);

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "The user will tell you something. Match it and say what category they are referring to.",
        },
        {
          role: "user",
          content:
            "The possible categories I might be referring to are: Conversation or small talk, Asking a follow-up question, Making a referral, Mentioning a condition or symptom, or Ordering prescriptions. If no matching category is found, say No task identified.",
        },
        { role: "user", content: dialogue },
      ],
    });
    const result =
      typeof completion.data.choices[0].message !== "string"
        ? completion.data.choices[0].message?.content
        : completion.data.choices[0].message ?? "No response";

    res.send(result);
  } catch (e) {
    console.error("Error handling POST request to /sendDialogue", e);
    res.status(500).send(e);
  }
});

// Listen on port 4001
app.listen(4001, () => {
  console.log("HTTP Server running on port 4001");
});
