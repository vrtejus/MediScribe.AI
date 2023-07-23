import { FC } from "react"
import AgentStore, { AgentActivityType } from "@/stores/AgentStore"
import { IoMdCheckmarkCircleOutline, IoMdRadioButtonOff } from "react-icons/io"

import AgentEmail from "./AgentEmail"

const AgentActionItem = ({
  id,
  completed,
  title,
  items,
  createdAt,
}: AgentActivityType) => {
  return (
    <div className="mt-4" key={id}>
      <div className="flex items-center space-x-2">
        {completed ? (
          <IoMdCheckmarkCircleOutline className="text-green-500" size={24} />
        ) : (
          <IoMdRadioButtonOff className="text-red-500" size={24} />
        )}
        <h2 className="font-bold">{title}</h2>
      </div>
      <ul className="list-disc pl-5">
        {items.map((item, index) => (
          <li key={`activity-${id}-${index}`}>
            {item === "email" ? (
              <AgentEmail
                to={
                  items
                    ?.find((item) => item.includes("Found email"))
                    ?.replace("Found email ", "") ?? "No email found"
                }
                subject={
                  items
                    ?.find((item) => item.includes("Subject line: "))
                    ?.replace("Subject line: ", "") ?? "No subject found"
                }
                body={
                  items
                    ?.find((item) => item.includes("Body: "))
                    ?.replace("Body: ", "") ?? "No body found"
                }
                onSend={async () => {
                  console.log("send email")
                  await AgentStore.sendEmail(
                    items
                      ?.find((item) => item.includes("Found email"))
                      ?.replace("Found email ", "") ?? "No email found",
                    items
                      ?.find((item) => item.includes("Subject line: "))
                      ?.replace("Subject line: ", "") ?? "No subject found",
                    items
                      ?.find((item) => item.includes("Body: "))
                      ?.replace("Body: ", "") ?? "No body found"
                  )
                }}
              />
            ) : (
              item
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default AgentActionItem
