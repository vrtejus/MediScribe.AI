import express from "express";

import { Deepgram } from "@deepgram/sdk";

import WS from "ws";

import cors from "cors";

import { Configuration, OpenAIApi } from "openai";
import { Resend } from "resend";

const resend = new Resend("re_hW8dbdEh_CZb9M65pnpHbcqKGkMGMyZNw");

import admin, { firestore } from "firebase-admin";
import { initializeApp, applicationDefault, cert } from "firebase-admin/app";
import {
  getFirestore,
  Timestamp,
  FieldValue,
  Filter,
} from "firebase-admin/firestore";

import dotenv from "dotenv";
dotenv.config();

const serviceAccount = require("./mediscribe-ai-c9c4ffefae18.json");

initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://mediscribe-ai.firebaseio.com",
});

const configuration = new Configuration({
  organization: process.env.OPENAI_ORG_ID,
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const db = getFirestore();

// Add Deepgram so we can get the transcription
const deepgram = new Deepgram(process.env.DEEPGRAM_API_KEY);

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
app.get("/", async (req, res) => {
  try {
    console.log("Handling GET request to /");

    const data = {
      name: "Los Angeles",
      state: "CA",
      country: "USA",
    };

    // Add a new document in collection "cities" with ID 'LA'
    const result = await db.collection("cities").doc("LA").set(data);
    res.send("Hello, world!");
  } catch (e) {
    console.error("Error handling GET request to /", e);
    res.status(500).send(e);
  }
});

app.post("/sendEmail", async (req, res) => {
  try {
    console.log("Handling POST request to /sendEmail");
    const { to, subject, body } = req.body;

    const response = await resend.emails.send({
      from: "vishnu@vishnu.fyi",
      to: "vrtejus@gmail.com",
      subject: subject,
      html: `<p>${body}</p>`,
    });

    console.log("response: ", response);
    res.send("done");
  } catch (e) {
    console.error("Error handling POST request to /sendEmail", e);
    res.status(500).send(e);
  }
});

app.post("/sendDialogue", async (req, res) => {
  try {
    console.log("Handling POST request to /sendDialogue");

    const { dialogue, patientHistory, speaker } = req.body;
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
          content: `The possible categories I might be referring to are: Conversation or small talk, Asking a follow-up question, Making a referral, ${
            speaker === "patient"
              ? `Mentioning a condition or symptom`
              : "Asking the patient for more information"
          }, or Ordering a prescription from a pharmacy. If no matching category is found, say No task identified.`,
        },
        { role: "user", content: dialogue },
      ],
    });
    let result =
      (typeof completion.data.choices[0].message !== "string"
        ? completion.data.choices[0].message?.content
        : completion.data.choices[0].message ?? "No response") ?? "";

    result = result.replace("Category: ", "");

    const firestoreWrite = await db.collection("agentActivities").add({
      completed: false,
      title: result,
      items: [],
      createdAt: Timestamp.now(),
    });

    const activityDocRef = db
      .collection("agentActivities")
      .doc(firestoreWrite.id);

    if (
      result.includes("No task identified") ||
      result.includes("Asking a follow-up question")
    ) {
      await activityDocRef.update({
        completed: true,
        items: ["No further action needed"],
      });
    } else if (result.includes("Conversation or small talk")) {
      // const completion = await openai.createChatCompletion({
      //   model: "gpt-3.5-turbo",
      //   messages: [
      //     {
      //       role: "system",
      //       content:
      //         "Tell me possible sentiments this small talk is about. Be very brief and concise. Return array of strings in JSON and nothing else.",
      //     },
      //     { role: "user", content: dialogue },
      //   ],
      // });
      // let result = JSON.parse(
      //   (typeof completion.data.choices[0].message !== "string"
      //     ? completion.data.choices[0].message?.content
      //     : completion.data.choices[0].message ?? "No response") ??
      //     "No further action needed"
      // );

      const result = ["No further action needed."];

      await activityDocRef.update({
        completed: true,
        items: result,
      });
    } else if (result.includes("Making a referral")) {
      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "Tell me the name of the person the doctor is referring to. Return an array of 4 strings in JSON and nothing else, consisting of (1) Referring to NAME, (2) Found email ${compute first name dot made up last name at paloaltomedical.com and write it as a valid email}, (3) Subject line: ${create a subject line}, (4) Body: ${Create a paragraph asking for an appointment from 2-3 pm on Thursdays, from Mark Thompson}.",
          },
          { role: "user", content: dialogue },
        ],
      });

      const result: Array<string> = [
        "email",
        "Referring to Dr. Smith",
        "Found email drsmith@paloaltomedical.com",
        "Subject line: Request for Appointment",
        "Body: Dear Dr. Smith, I am writing to request an appointment for a consultation regarding my headaches and migraines. I would greatly appreciate if we could schedule the appointment for 2-3 pm on Thursdays. Thank you, Mark Thompson",
      ];

      try {
        await activityDocRef.update({
          completed: true,
          items: [
            "email",
            ...JSON.parse(
              (typeof completion.data.choices[0].message !== "string"
                ? completion.data.choices[0].message?.content
                : completion.data.choices[0].message ?? "No response") ??
                "No further action needed"
            ),
          ],
        });
      } catch (e) {
        await activityDocRef.update({
          completed: true,
          items: ["email", ...result],
        });
        console.error("errored parsing json", e);
      }
    } else if (result.includes("Mentioning a condition or symptom")) {
      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "Reason about the reason for the symptom or condition the patient mentioned based on their current medications and patient history. Be very concise and just list the reasons objectively.",
          },
          {
            role: "user",
            content: patientHistory ?? "No patient history found.",
          },
          { role: "user", content: dialogue },
        ],
      });
      let result =
        (typeof completion.data.choices[0].message !== "string"
          ? completion.data.choices[0].message?.content
          : completion.data.choices[0].message ?? "No response") ??
        "No further action needed";

      await activityDocRef.update({
        completed: true,
        items: [
          "Based on the patient's medical history, let us reason to find any possible causes",
          result,
        ],
      });
    } else if (result.includes("Ordering a prescription from a pharmacy")) {
      await activityDocRef.update({
        completed: false,
        items: ["Finding nearby pharmacies"],
      });
      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content:
              "Make up four random pharmacy names and addresses in Hillsborough, CA. Be brief and consise. Only return the names and addresses.",
          },
        ],
      });
      await activityDocRef.update({
        completed: false,
        items: [
          completion.data.choices[0].message?.content ??
            "No pharmacies found nearby",
        ],
      });
      const completion2 = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "Write the body of an email for this prescription and drug as it is from Dr. Vishnu Rajan Tejus. A doctor is ordering a prescription for Mark Thompson from a pharmacy, who is the recipient of this email. Address it to Dear Pharmacy Staff. Be brief and concise. Do not include a subject line.",
          },
          {
            role: "user",
            content: dialogue,
          },
        ],
      });
      const result: Array<string> = [
        "email",
        "Sending order request for Mark Thompson",
        "Found email pharmacy@paloaltomedical.com",
        "Subject line: Order request for Mark Thompson",
        `Body: ${
          completion2.data.choices[0].message?.content ??
          "No drugs found in inventory."
        }`,
      ];
      await activityDocRef.update({
        completed: true,
        items: result,
      });
    } else if (result.includes("Asking the patient for more information")) {
      await activityDocRef.update({
        completed: false,
        items: ["Summarizing and updating patient history"],
      });
      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Summarize the patient's history. Be brief and concise.",
          },
          {
            role: "user",
            content: patientHistory ?? "No patient history found.",
          },
        ],
      });
      await activityDocRef.update({
        completed: true,
        items: [
          completion.data.choices[0].message?.content ?? "No summary created.",
        ],
      });
    }

    res.send("done");
  } catch (e) {
    console.error("Error handling POST request to /sendDialogue", e);
    res.status(500).send(e);
  }
});

// Listen on port 4001
app.listen(4001, () => {
  console.log("HTTP Server running on port 4001");
});
