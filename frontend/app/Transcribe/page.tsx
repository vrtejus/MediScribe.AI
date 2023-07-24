"use client"

import { useEffect, useRef, useState } from "react"
import AgentStore from "@/stores/AgentStore"
import PatientStore from "@/stores/PatientStore"
import TranscriptionStore from "@/stores/TranscriptionStore"
import { MicrophoneIcon } from "@heroicons/react/24/solid"
import { observer } from "mobx-react"
import { IoMdSkipForward, IoMdTrash } from "react-icons/io"

import { buttonVariants } from "@/components/ui/button"

import AgentActivity from "./AgentActivity"
import ShowPatientHistory from "./ShowPatientHistory"

const IndexPage = () => {
  const [affirmation, setAffirmation] = useState("") // nb: this is actually a hack to get the state to update
  const socketRef = useRef<WebSocket | null>(null) // Specify the type as WebSocket | null

  const [isTranscribing, setIsTranscribing] = useState(false) // Add a state to track if transcription is in progress

  const closeSocket = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.close()
    }
  }

  useEffect(() => {
    const init = async () => {
      await AgentStore.subscribeToAgentActivities()
    }

    init()
  }, [])

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
      const socket = new WebSocket("ws://localhost:4000")
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

  const buttonRef = useRef<HTMLButtonElement | null>(null)

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
          ref={buttonRef}
          className={buttonVariants()}
          onClick={!isTranscribing ? activateMicrophone : closeSocket} // Add the onClick event handler
        >
          <MicrophoneIcon className="h-5 w-5 mr-3" />
          {!isTranscribing ? "Start Transcription" : "Stop Transcription"}
        </button>
        <div className="max-w-3/4 mx-auto mt-8">
          <div className="flex justify-between">
            <div className="w-1/2 min-w-0 border border-gray-300 p-8">
              <div className="flex justify-between items-center pb-4">
                <h2 className="text-xl font-bold mr-5">Patient</h2>
                {PatientStore.currentPatient && (
                  <ShowPatientHistory patient={PatientStore.currentPatient} />
                )}
              </div>
              <div className="w-full">
                {Array.from(TranscriptionStore.dialogue.values())
                  .filter((dialogueItem) => dialogueItem?.speaker === "patient")
                  .map((dialogueItem, index) => (
                    <p key={`dialogue-patient-${index}`} className="mb-3">
                      {dialogueItem?.text}
                    </p>
                  ))}
              </div>
              <div className="pt-5">
                <button
                  className={`${buttonVariants()}}flex items-center justify-center w-5 h-5 rounded-full focus:outline-none`}
                  onClick={TranscriptionStore.incrementPatientDialogue}
                >
                  <IoMdSkipForward size={12} />
                </button>
              </div>
            </div>
            <div className="w-1/2 min-w-0 border border-gray-300 p-8">
              <h2 className="text-xl font-bold pb-4">Physician</h2>
              <div className="w-full">
                {Array.from(TranscriptionStore.dialogue.values())
                  .filter(
                    (dialogueItem) => dialogueItem?.speaker === "physician"
                  )
                  .map((dialogueItem, index) => (
                    <p key={`dialogue-physician-${index}`} className="mb-3">
                      {dialogueItem?.text}
                    </p>
                  ))}
              </div>
              <div className="pt-5">
                <button
                  className={`${buttonVariants()}}flex items-center justify-center w-5 h-5 rounded-full focus:outline-none`}
                  onClick={TranscriptionStore.incrementPhysicianDialogue}
                >
                  <IoMdSkipForward size={12} />
                </button>
              </div>
            </div>
          </div>
          <div className="w-full border-t-0 border-l border-r border-b border-gray-300 p-8">
            <div className="flex justify-between items-center pb-4">
              <h2 className="text-xl font-bold">Agent</h2>
              <button
                className={`${buttonVariants()}}flex items-center justify-center w-10 h-10 rounded-full focus:outline-none`}
                onClick={AgentStore.deleteAllAgentActivities}
              >
                <IoMdTrash size={24} />
              </button>
            </div>
            <div className="w-full mt-4">
              <AgentActivity />
            </div>
          </div>
        </div>
      </div>
      <p className="max-w-[700px] text-lg text-muted-foreground">Thank you!</p>
    </section>
  )
}

export default observer(IndexPage)
