"use client"

import { useState } from "react"
import Link from "next/link"
import TranscriptionStore from "@/stores/TranscriptionStore"
import { MicrophoneIcon } from "@heroicons/react/24/solid"
import { AlignCenter } from "lucide-react"
import { observer } from "mobx-react"

import { siteConfig } from "@/config/site"
import { buttonVariants } from "@/components/ui/button"

const IndexPage = () => {
  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl font-serif ">
          MediScribe.AI <br className="hidden sm:inline" />
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground">
          We translate conversations patients have with their doctors in a
          secure and private manner so language isn't a barrier to quality
          healthcare.
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
        </div>
      </div>
    </section>
  )
}

export default observer(IndexPage)
