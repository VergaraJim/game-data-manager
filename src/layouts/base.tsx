import { PropsWithChildren } from "react";
import { FaChevronLeft } from "react-icons/fa6";
import { NavLink } from "react-router-dom";

export default function DefaultLayout(
  props: PropsWithChildren & { title: string },
) {
  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex gap-4 items-center">
        <NavLink
          to="/"
          className="flex flex-row gap-2 justify-center items-center py-2 px-4 bg-neutral-700 rounded-md"
        >
          <FaChevronLeft />
        </NavLink>
        <h1 className="text-2xl font-bold">{props.title}</h1>
      </div>
      <div className="w-full h-px bg-neutral-600"></div>
      {props.children}
    </div>
  );
}
