import {
  IObservableArray,
  ObservableMap,
  computed,
  makeObservable,
  observable,
} from "mobx"

export type Patient = {
  id: string
  name: string
  age: number
  avatar?: string
  occupation?: string
  medicalHistory?: string
  currentMedication?: string
  notes?: string
}

class PatientStore {
  @observable currentPatient: Patient | null = {
    id: "1",
    name: "Mark Thompson",
    age: 32,
    avatar:
      "https://d2zhlgis9acwvp.cloudfront.net/images/uploaded/electricians.jpg",
    occupation: "Electrician",
    medicalHistory:
      "Mark is generally in good health with no chronic illnesses. Mark works as an electrician. He is a non-smoker and drinks alcohol moderately. He has no known drug allergies.",
    currentMedication:
      "Mark is currently taking the following medications: 1. Metformin 500mg, 1 tablet twice daily with food 2. Atorvastatin 20mg, 1 tablet daily at night 3. Aspirin 100mg, 1 tablet daily",
  }

  constructor() {
    makeObservable(this)
  }
}

export default new PatientStore()
