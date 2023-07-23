import React, { useState } from "react"
import { Patient } from "@/stores/PatientStore"
import { IoMdCloseCircle, IoMdDocument } from "react-icons/io"
import { usePopper } from "react-popper"

import { buttonVariants } from "@/components/ui/button"

interface Props {
  patient: Patient
}

const PatientInfoPopover = ({ patient }: Props) => {
  const [visible, setVisible] = useState(false)
  const [referenceElement, setReferenceElement] =
    useState<HTMLButtonElement | null>(null)
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null
  )
  const { styles, attributes } = usePopper(referenceElement, popperElement)

  return (
    <div className="relative">
      <button
        className={`${buttonVariants()}flex items-center justify-center w-10 h-10 rounded-full focus:outline-none`}
        onClick={() => setVisible(!visible)}
        ref={setReferenceElement}
      >
        <IoMdDocument size={24} />
      </button>
      {visible && (
        <div
          className="bg-white border border-gray-200 p-4 rounded shadow-lg mt-2 z-10 min-w-[500px]"
          ref={setPopperElement}
          style={styles.popper}
          {...attributes.popper}
        >
          <button
            className="absolute top-2 right-2"
            onClick={() => setVisible(false)}
          >
            <IoMdCloseCircle size={24} />
          </button>
          <div className="flex items-center space-x-2">
            <img
              className="h-16 w-16 rounded-full"
              src={patient.avatar}
              alt={`${patient.name}'s Avatar}`}
            />
            <div>
              <h2 className="font-bold text-lg">{patient.name}</h2>
              <p className="text-gray-600">{`${patient.age}, ${patient.occupation}`}</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <h3 className="font-semibold text-sm text-gray-600">
              Medical History:
            </h3>
            <p>{patient.medicalHistory}</p>
            <h3 className="font-semibold text-sm text-gray-600">
              Current Medication:
            </h3>
            <p>{patient.currentMedication}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default PatientInfoPopover
