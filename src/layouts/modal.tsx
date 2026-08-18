import { PropsWithChildren, useEffect, useRef } from "react";
import { FaTimes } from "react-icons/fa";

export default function ModalLayout(
  props: PropsWithChildren & { title: string; onClose: VoidFunction },
) {
  useEffect(() => {
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        props.onClose();
      }
    };
    document.addEventListener("keyup", handleKeyUp);
    return () => {
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return (
    <div
      className="fixed left-0 top-0 h-dvh w-dvw bg-black/75 flex justify-center items-center z-50"
      onMouseUp={(e) => {
        if (e.target === e.currentTarget) {
          props.onClose();
          e.preventDefault();
        }
      }}
    >
      <div className="bg-neutral-800 rounded-md min-w-[840px] min-h-[720px] max-h-full max-w-full p-2">
        <div className="w-full flex items-center text-xl font-semibold">
          <p>{props.title}</p>
          <div className="grow"></div>
          <button
            className="p-2 bg-red-500 rounded-md"
            onMouseUp={() => props.onClose()}
          >
            <FaTimes />
          </button>
        </div>
        <div className="h-px my-2 bg-neutral-500"></div>
        {props.children}
      </div>
    </div>
  );
}
