import axios from "axios"
import {
  IObservableArray,
  ObservableMap,
  computed,
  makeObservable,
  observable,
} from "mobx"

export type DialogueItem = {
  speaker: "patient" | "physician"
  text: string
}

const patientSampleDialogue: DialogueItem[] = [
  {
    speaker: "patient",
    text: "Morning, Dr. Adams. I've been having these migraines. They seem to be getting worse.",
  },
  {
    speaker: "patient",
    text: "Not really, but they've been happening more frequently, and the pain is more intense.",
  },
  {
    speaker: "patient",
    text: "Okay, sounds good. Anything I can do for the pain in the meantime?",
  },
  {
    speaker: "patient",
    text: "Thanks, Dr. Adams. I appreciate your help.",
  },
]

const physicianSampleDialogue: DialogueItem[] = [
  {
    speaker: "physician",
    text: "Good morning, Mark. How are you feeling lately?",
  },
  {
    speaker: "physician",
    text: "I'm sorry to hear that, Mark. Have you noticed any triggers or patterns?",
  },
  {
    speaker: "physician",
    text: "It sounds like we need to involve a specialist to get to the bottom of this. I'll refer you to Dr. Smith, she's a neurologist who specializes in headaches and migraines.",
  },
  {
    speaker: "physician",
    text: "Yes, I'm going to write a prescription for Sumatriptan. It's a medication specifically made to relieve migraine pain. You can pick it up from Greenleaf Pharmacy on your way home.",
  },
]

class TranscriptionStore {
  websockets: Record<string, WebSocket> = {}
  audioContexts: Record<string, AudioContext> = {}

  @observable dialogue: IObservableArray<DialogueItem> =
    observable.array<DialogueItem>([])

  transcripts: IObservableArray<string> = observable.array<string>([
    "Test transcription",
    "Test transcription 2",
    "Test transcription 2",
    "Test transcription 2",
    "Test transcription 2",
    "Test transcription 2",
  ])
  @observable translations: ObservableMap<string, string> = observable.map(
    {} as Record<string, string>
  )

  @observable indexOfPatientSampleDialogueCompleted: number = 0
  @observable indexOfPhysicianSampleDialogueCompleted: number = 0

  constructor() {
    makeObservable(this)
    this.incrementPatientDialogue = this.incrementPatientDialogue.bind(this)
    this.incrementPhysicianDialogue = this.incrementPhysicianDialogue.bind(this)
  }

  incrementPatientDialogue() {
    try {
      this.dialogue.push(
        patientSampleDialogue[this.indexOfPatientSampleDialogueCompleted]
      )
      this.indexOfPatientSampleDialogueCompleted++
    } catch (e) {
      console.error("Error incrementing patient dialogue", e)
    }
  }

  incrementPhysicianDialogue() {
    try {
      this.dialogue.push(
        physicianSampleDialogue[this.indexOfPhysicianSampleDialogueCompleted]
      )
      this.indexOfPhysicianSampleDialogueCompleted++
    } catch (e) {
      console.error("Error incrementing physician dialogue", e)
    }
  }

  async addEnglishTranscript(transcript: string) {
    this.transcripts.push(transcript)

    if (!this.translations.hasOwnProperty(transcript)) {
      await this.requestTranslationAPI(transcript)
    }
  }

  async requestTranslationAPI(transcript: string) {
    const url =
      "https://vishnu-nooks.ngrok.io/mediscribe-ai/us-central1/translate_text"

    try {
      const response = await axios.post(url, {
        language_code: "es",
        text: transcript,
      })

      console.log("Response:", response?.data)

      this.translations.set(transcript, response?.data)
    } catch (error: any) {
      console.error("Error:", error?.response?.data)
    }
  }
}

export default new TranscriptionStore()
