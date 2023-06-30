"use client"

import { useState } from "react"
import Link from "next/link"
import TranscriptionStore from "@/stores/TranscriptionStore"

export default function IndexPage() {
  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl font-serif ">
          Summary <br className="hidden sm:inline" />
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground">
          your post medical examination summary
        </p>
        <p className="max-w-[700px] text-sm text-muted-foreground">
          Next Steps: Get a blood test and write down any experienced symptoms
          until next visit
        </p>
        <p className="max-w-[700px] text-sm text-muted-foreground">
          Follow up visit scheduled for August 23, 2023
        </p>
      </div>
    </section>
  )
}
