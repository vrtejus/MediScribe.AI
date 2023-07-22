import axios from "axios"
import {
  IObservableArray,
  ObservableMap,
  computed,
  makeObservable,
  observable,
} from "mobx"

const FUNCTIONS_URL = "https://vishnu.nooks.in"

export type AgentActivityType = {
  completed: boolean
  title: string
  items: Array<string>
}

class AgentStore {
  @observable agentActivities: IObservableArray<AgentActivityType> =
    observable.array<AgentActivityType>([])

  constructor() {
    makeObservable(this)
  }

  async sendDialogue(dialogue: string) {
    try {
      const apiResponse = await axios.post(`${FUNCTIONS_URL}/sendDialogue`, {
        dialogue,
      })

      if (apiResponse.status === 200) {
        let result = apiResponse.data
        if (result.startsWith("Category: ")) result = result.slice(10)
        this.agentActivities.push({
          completed: false,
          title: result,
          items: [],
        })
      }
    } catch (e) {
      console.error("Error sending dialogue", e)
    }
  }
}

export default new AgentStore()
