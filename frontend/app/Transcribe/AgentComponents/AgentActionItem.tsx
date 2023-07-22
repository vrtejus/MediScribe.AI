import { FC } from "react"
import { IoMdCheckmarkCircleOutline, IoMdRadioButtonOff } from "react-icons/io"

type Props = {
  completed: boolean
  title: string
  items: string[]
}

const AgentActionItem: FC<Props> = ({ completed, title, items }) => {
  return (
    <div className="mt-4">
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
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

export default AgentActionItem
