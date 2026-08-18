import { FaDotCircle } from "react-icons/fa";
import { GiBouncingSword, GiBroadsword } from "react-icons/gi";
import { HiMiniSquaresPlus } from "react-icons/hi2";
import ModalLayout from "../layouts/modal";
import { useState } from "react";

type modal = "MEELEE" | "PROJECTILE" | "AREA_OF_EFFECT" | "EVENT";
const titles: { [key: string]: string } = {
  MEELEE: "Melee manager",
  PROJECTILE: "Projectile manager",
  AREA_OF_EFFECT: "AOE manager",
  EVENT: "Event manager",
};

export default function ManagersBar(props: {}) {
  const [activeModal, setActiveModal] = useState<modal | undefined>(undefined);

  return (
    <>
      <div className="flex flex-row gap-2">
        <button
          className="p-2 bg-red-500 rounded-md flex justify-center items-center gap-2 flex-row transition-all hover:brightness-75 active:brightness-50 cursor-pointer"
          onMouseUp={() => setActiveModal("MEELEE")}
        >
          <GiBroadsword className="text-2xl" />
          <p className="text-xs">MEELEE</p>
        </button>
        <button
          className="p-2 bg-blue-500 rounded-md flex justify-center items-center gap-2 flex-row transition-all hover:brightness-75 active:brightness-50 cursor-pointer"
          onMouseUp={() => setActiveModal("PROJECTILE")}
        >
          <GiBouncingSword className="text-2xl" />
          <p className="text-xs">PROJECTILE</p>
        </button>
        <button
          className="p-2 bg-orange-500 rounded-md flex justify-center items-center gap-2 flex-row transition-all hover:brightness-75 active:brightness-50 cursor-pointer"
          onMouseUp={() => setActiveModal("AREA_OF_EFFECT")}
        >
          <FaDotCircle className="text-2xl" />
          <p className="text-xs">AREA OF EFFECT</p>
        </button>
        <button
          className="p-2 bg-purple-500 rounded-md flex justify-center items-center gap-2 flex-row transition-all hover:brightness-75 active:brightness-50 cursor-pointer"
          onMouseUp={() => setActiveModal("EVENT")}
        >
          <HiMiniSquaresPlus className="text-2xl" />
          <p className="text-xs">EVENTS</p>
        </button>
      </div>
      {activeModal ? (
        <ModalLayout
          title={titles[activeModal]}
          onClose={() => setActiveModal(undefined)}
        >
          <div>TEST</div>
        </ModalLayout>
      ) : null}
    </>
  );
}
