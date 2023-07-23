import { firestore } from "@/firebaseConfig"
import axios from "axios"
import {
  collection,
  deleteDoc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore"
import { IObservableArray, makeObservable, observable, runInAction } from "mobx"

import PatientStore from "./PatientStore"

const FUNCTIONS_URL = "https://vishnu.nooks.in"

export type AgentActivityType = {
  id: string
  completed: boolean
  title: string
  items: Array<string>
  createdAt: string
}

class AgentStore {
  @observable agentActivities: IObservableArray<AgentActivityType> =
    observable.array<AgentActivityType>([])

  constructor() {
    makeObservable(this)
    this.firestoreRef = this.firestoreRef.bind(this)
  }

  firestoreRef() {
    return collection(firestore, "agentActivities")
  }

  subscribeToAgentActivities() {
    const unsubscribe1 = onSnapshot(
      query(this.firestoreRef(), orderBy("createdAt", "desc")),
      (querySnapshot) => {
        runInAction(() => {
          this.agentActivities.clear()
          querySnapshot.forEach((doc) => {
            this.agentActivities.push({
              id: doc.id,
              ...doc.data(),
            } as AgentActivityType)
          })
        })
      }
    )
    return () => {
      unsubscribe1()
    }
  }

  async deleteAllAgentActivities() {
    await onSnapshot(
      query(collection(firestore, "agentActivities")),
      (querySnapshot) => {
        querySnapshot.forEach((doc) => {
          console.log("deleting doc", doc.id)
          deleteDoc(doc.ref)
        })
      }
    )
  }

  async sendEmail(to: string, subject: string, body: string) {
    try {
      const apiResponse = await axios.post(`${FUNCTIONS_URL}/sendEmail`, {
        to,
        subject,
        body,
      })
      return true
    } catch (e) {
      console.error("Error sending email", e)
      throw e
    }
  }

  async sendDialogue(dialogue: string, speaker: string) {
    try {
      const apiResponse = await axios.post(`${FUNCTIONS_URL}/sendDialogue`, {
        dialogue,
        patientHistory: `medical history: ${PatientStore.currentPatient?.medicalHistory} current medications: ${PatientStore.currentPatient?.currentMedication}`,
        speaker,
      })
    } catch (e) {
      console.error("Error sending dialogue", e)
    }
  }
}

export default new AgentStore()
