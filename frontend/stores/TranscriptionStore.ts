import axios from "axios"
import {
  IObservableArray,
  ObservableMap,
  computed,
  makeObservable,
  observable,
} from "mobx"

class TranscriptionStore {
  websockets: Record<string, WebSocket> = {}
  audioContexts: Record<string, AudioContext> = {}

  transcripts: IObservableArray<string> = observable.array<string>([])
  @observable translations: ObservableMap<string, string> = observable.map(
    {} as Record<string, string>
  )

  constructor() {
    makeObservable(this)
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
        language_code: "fr",
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
