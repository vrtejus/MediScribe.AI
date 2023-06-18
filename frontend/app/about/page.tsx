"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import TranscriptionStore from "@/stores/TranscriptionStore"
import { MicrophoneIcon } from "@heroicons/react/24/solid"

import { siteConfig } from "@/config/site"
import { buttonVariants } from "@/components/ui/button"

export default function IndexPage() {
  const [affirmation, setAffirmation] = useState("")
  const socketRef = useRef(null)

  const [isTranscribing, setIsTranscribing] = useState(false) // Add a state to track if transcription is in progress

  const handleTranscriptionClick = async () => {
    setIsTranscribing(true) // Set the state to indicate transcription is in progress
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    })
    const audioTrack = mediaStream.getAudioTracks()[0]
    await TranscriptionStore.startTranscription(audioTrack)
    setIsTranscribing(false) // Reset the state after transcription is complete
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
          console.log(transcript)
          setAffirmation(transcript)
        }
      }

      socket.onclose = () => {
        console.log({ event: "onclose" })
      }

      socket.onerror = (error) => {
        console.log({ event: "onerror", error })
      }

      // @ts-ignore
      socketRef.current = socket
    })
  }

  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
          Beautifully designed components <br className="hidden sm:inline" />
          built with Radix UI and Tailwind CSS.
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground">
          Accessible and customizable components that you can copy and paste
          into your apps. Free. Open Source. And Next.js 13 Ready.
        </p>
      </div>
      <div className="flex gap-4 items-center content-streth">
        <Link
          href={siteConfig.links.docs}
          target="_blank"
          rel="noreferrer"
          className={buttonVariants()}
        >
          Documentation
        </Link>
        <Link
          target="_blank"
          rel="noreferrer"
          href={siteConfig.links.github}
          className={buttonVariants({ variant: "outline" })}
        >
          GitHub
        </Link>
        <button
          className={buttonVariants()}
          onClick={activateMicrophone} // Add the onClick event handler
          disabled={isTranscribing} // Disable the button while transcription is in progress
        >
          <MicrophoneIcon className="h-5 w-5" /> {/* Add the microphone icon */}
        </button>
      </div>
    </section>
  )
}
