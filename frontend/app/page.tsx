"use client"

import { useState } from "react"
import Link from "next/link"
import TranscriptionStore from "@/stores/TranscriptionStore"
import { MicrophoneIcon } from "@heroicons/react/24/solid"

import { siteConfig } from "@/config/site"
import { buttonVariants } from "@/components/ui/button"
import { AlignCenter } from "lucide-react"

export default function IndexPage() {
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

  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl font-serif ">
          MediScribe.AI <br className="hidden sm:inline" />
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground">
        the future of patient medical care
        </p>
      </div>
      <div className="flex flex-col items-center">
      <div className="flex flex-row items-center gap-4">
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
          onClick={handleTranscriptionClick} // Add the onClick event handler
          disabled={isTranscribing} // Disable the button while transcription is in progress
        >
          <MicrophoneIcon className="h-5 w-5" /> {/* Add the microphone icon */}
        </button>
      </div>
      </div>
    </section>
  )
}
