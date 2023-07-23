import React, { useState } from "react"
import { observer } from "mobx-react"
import TextareaAutosize from "react-textarea-autosize"

interface Props {
  to: string
  subject: string
  body: string
  onSend: () => void
}

const AgentEmail: React.FC<Props> = ({ to, subject, body, onSend }) => {
  const [editableBody, setEditableBody] = useState(body ?? "")
  const [editableSubject, setEditableSubject] = useState(subject ?? "")
  const [editableTo, setEditableTo] = useState(to ?? "")

  return (
    <div className="border-2 border-gray-300 p-4 rounded-md bg-white shadow-lg max-w-md mx-auto">
      <div className="flex space-x-2 mb-4">
        <span className="font-bold">To:</span>
        <TextareaAutosize
          value={editableTo}
          onChange={(event) => setEditableTo(event?.target?.value)}
          className="border-none w-full"
        />
      </div>
      <div className="flex space-x-2 mb-4">
        <span className="font-bold">Subject:</span>
        <TextareaAutosize
          value={editableSubject}
          onChange={(event) => setEditableSubject(event?.target?.value)}
          className="border-none w-full"
        />
      </div>
      <div className="border-t border-gray-200 pt-4 mb-4">
        <TextareaAutosize
          value={editableBody}
          onChange={(event) => setEditableBody(event?.target?.value)}
          className="border-none w-full"
        />
      </div>
      <button
        onClick={onSend}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Send
      </button>
    </div>
  )
}

export default observer(AgentEmail)
