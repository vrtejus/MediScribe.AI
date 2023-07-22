"use client"

import { useEffect } from "react"
import AgentStore from "@/stores/AgentStore"
import TranscriptionStore from "@/stores/TranscriptionStore"
import { observer } from "mobx-react"

import AgentActionItem from "./AgentComponents/AgentActionItem"

const AgentActivity = () => {
  useEffect(() => {
    if (TranscriptionStore.dialogue.length > 0) {
      console.log("triggered!")
      AgentStore.sendDialogue(
        TranscriptionStore.dialogue[TranscriptionStore.dialogue.length - 1]
          ?.text
      )
    }
  }, [TranscriptionStore.dialogue.length])

  return (
    <div>
      <AgentActionItem completed={true} title={"Test"} items={["test"]} />
      {[...AgentStore.agentActivities].reverse().map((activity) => {
        return (
          <AgentActionItem
            completed={activity.completed}
            title={activity.title}
            items={activity.items}
          />
        )
      })}
    </div>
  )
}

export default observer(AgentActivity)
