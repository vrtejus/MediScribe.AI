import { firestore } from "@/firebaseConfig"
import { DEEPGRAM_API_KEY } from "@/secrets"
// @ts-expect-error
import { Deepgram } from "@deepgram/sdk/browser"
import firebase from "firebase/app"
import {observable, makeObservable} from 'mobx'

import "firebase/firestore"

const deepgram = new Deepgram(DEEPGRAM_API_KEY)

class TranscriptionStore {
  websockets: Record<string, WebSocket> = {}
  audioContexts: Record<string, AudioContext> = {}

  @observable transcripts: Array<string> = ['']

  constructor() {
    makeObservable(this)
  }

  async startTranscription(track: MediaStreamTrack) {
    const media = new MediaStream([track])

    const websocket = deepgram.transcription.live({
      interm_results: true,
      punctuate: true,
      times: false,
    })

    this.websockets["microphone"] = websocket

    websocket.onopen = () => {
      console.log("[socket] opened")
      const audioContext = this.audioContexts["microphone"] // Retrieve the audioContext from audioContexts object
      if (!audioContext) {
        console.error("[socket] error because audioContext null")
        return
      }
      if (audioContext?.state !== "closed") audioContext?.suspend()
      const input = audioContext.createMediaStreamSource(media)
      const output = audioContext.createMediaStreamDestination()
      input.connect(output)

      const mediaRecorder = new MediaRecorder(output.stream, {
        mimeType: "audio/webm",
      })

      mediaRecorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0 && websocket.readyState === WebSocket.OPEN) {
          websocket.send(event.data)
        }
      })

      mediaRecorder.start(100)

      if (audioContext.state === "suspended") {
        audioContext.resume()
      }
    }

    websocket.onclose = () => {
      console.log("[socket] recv onclose event")
      if (this.audioContexts["microphone"]?.state !== "closed") {
        try {
          this.audioContexts["microphone"]?.close()
        } catch (error) {
          console.log("[transcription] problem closing audio context", error)
        }
      }
      delete this.audioContexts["microphone"]
    }

    websocket.onmessage = (event: any) => {
      const received: {
        channel?: {
          alternatives: [
            {
              transcript: string
            }
          ]
        }
        speech_final: boolean
        is_final: boolean
      } = JSON.parse(event.data)

      const transcript = received.channel?.alternatives[0].transcript

      if (!transcript || !transcript.length || transcript.trim().length < 2) {
        // ignore empty transcribes
        return
      }

      // Write transcript to Firestore
      //   firestore.collection("transcripts").add({
      //     transcript: transcript,
      //     timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      //   });
    }

    websocket.onerror = console.error

    // Audio data handling and sending to the Deepgram WebSocket logic
    const audioContext = new AudioContext()
    this.audioContexts["microphone"] = audioContext // Store audioContext in audioContexts object
    const mediaStreamSource = audioContext.createMediaStreamSource(
      new MediaStream([track])
    )

    const scriptProcessorNode = audioContext.createScriptProcessor(4096, 1, 1)
    scriptProcessorNode.onaudioprocess = (
      audioProcessingEvent: AudioProcessingEvent
    ) => {
      const audioData = audioProcessingEvent.inputBuffer.getChannelData(0)
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.send(audioData)
      }
    }

    mediaStreamSource.connect(scriptProcessorNode)
    scriptProcessorNode.connect(audioContext.destination)
  }
}

export default new TranscriptionStore()
