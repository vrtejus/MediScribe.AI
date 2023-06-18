import { firestore } from "@/firebaseConfig"
import { DEEPGRAM_API_KEY } from "@/secrets"
// @ts-expect-error
import { Deepgram } from "@deepgram/sdk/browser"
import firebase from "firebase/app"

import "firebase/firestore"
import { doc, setDoc } from "firebase/firestore"

const deepgram = new Deepgram(DEEPGRAM_API_KEY)

class TranscriptionStore {
  async startTranscription(track: MediaStreamTrack) {
    const websocket = deepgram.transcription.live({
      interm_results: true,
      punctuate: true,
      times: false,
    })

    websocket.on("data", async (data: any) => {
      const { payload } = data
      if (payload && payload.type === "transcript" && payload.final) {
        // Create a new document in the "transcripts" collection
        const transcriptRef = await setDoc(doc(firestore, "transcripts"), {
          transcript: payload.transcript,
          timestamp: new Date(),
        })
        console.log("payload: ", payload)
      }
    })

    websocket.on("error", (error: any) => {
      console.error("WebSocket error:", error)
    })

    websocket.on("close", () => {
      console.log("WebSocket connection closed")
    })

    // Audio data handling and sending to the Deepgram WebSocket logic
    const audioContext = new AudioContext()
    const mediaStreamSource = audioContext.createMediaStreamSource(
      new MediaStream([track])
    )

    const scriptProcessorNode = audioContext.createScriptProcessor(4096, 1, 1)
    scriptProcessorNode.onaudioprocess = (
      audioProcessingEvent: AudioProcessingEvent
    ) => {
      const audioData = audioProcessingEvent.inputBuffer.getChannelData(0)
      websocket.send(audioData)
    }

    mediaStreamSource.connect(scriptProcessorNode)
    scriptProcessorNode.connect(audioContext.destination)
  }
}

export default new TranscriptionStore()
