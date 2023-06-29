"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import TranscriptionStore from "@/stores/TranscriptionStore"
import { MicrophoneIcon } from "@heroicons/react/24/solid"

import { siteConfig } from "@/config/site"
import { buttonVariants } from "@/components/ui/button"

export default function IndexPage() {
  const [affirmation, setAffirmation] = useState("") // nb: this is actually a hack to get the state to update
  const socketRef = useRef<WebSocket | null>(null) // Specify the type as WebSocket | null

  const [isTranscribing, setIsTranscribing] = useState(false) // Add a state to track if transcription is in progress

  const closeSocket = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.close()
    }
  }

  const activateMicrophone = () => {
    console.log("Submit")

    //Add microphone access
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      if (!MediaRecorder.isTypeSupported("audio/webm"))
        return alert("Browser not supported")
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      })

      //create a websocket connection
      const socket = new WebSocket("ws://localhost:3002")
      socket.onopen = () => {
        setIsTranscribing(true) // Set the state to true when transcription starts
        console.log({ event: "onopen" })
        mediaRecorder.addEventListener("dataavailable", async (event) => {
          if (event.data.size > 0 && socket.readyState === 1) {
            socket.send(event.data)
          }
        })
        mediaRecorder.start(1000)
      }

      socket.onmessage = (message) => {
        const received = JSON.parse(message.data)
        const transcript = received.channel.alternatives[0].transcript
        if (transcript) {
          TranscriptionStore.addEnglishTranscript(transcript)
          console.log(transcript)
          setAffirmation(transcript)
          console.log("result array: ", TranscriptionStore.transcripts)
        }
      }

      socket.onclose = () => {
        setIsTranscribing(false) // Set the state to false when transcription ends
        console.log({ event: "onclose" })
      }

      socket.onerror = (error) => {
        console.log({ event: "onerror", error })
      }

      socketRef.current = socket
    })
  }

  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl font-serif">
          Transcribe <br className="hidden sm:inline" />
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground">
          record your medical examination session for a curated visit summary
        </p>
      </div>
      <div className="flex flex-col items-center content-streth">
        <button
          className={buttonVariants()}
          onClick={!isTranscribing ? activateMicrophone : closeSocket} // Add the onClick event handler
        >
          <MicrophoneIcon className="h-5 w-5 mr-3" />
          {!isTranscribing ? "Start Transcription" : "Stop Transcription"}
        </button>

        {affirmation && (
          <div className="flex justify-between mx-10 mt-8">
            <div className="w-1/2 min-w-0 min-w-0 border border-gray-300 p-8">
              <h2 className="text-xl font-bold">Physician</h2>
              <div className="w-full">
                <text>{TranscriptionStore.transcripts.join(" ")}</text>
              </div>
            </div>
            <div className="w-1/2 min-w-0 border border-gray-300 p-8">
              <h2 className="text-xl font-bold">Patient</h2>
              <div className="w-full">
                <text>
                  {Array.from(TranscriptionStore.translations.values()).join(
                    " "
                  )}
                </text>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
