import { NavLink } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="w-full min-h-full overflow-auto p-4 flex flex-col gap-4">
      <h1 className="text-4xl font-bold">Home</h1>
      <div className="w-full h-px bg-neutral-600"></div>
      <div className="w-full grid grid-cols-3 gap-4">
        <HomeNavButton
          label="Action"
          count={1}
          endpoint="/action-manager"
          color="blue"
        />
        <HomeNavButton
          label="Placeholder1"
          count={0}
          endpoint="/placeholder1"
          color="red"
        />
        <HomeNavButton
          label="Placeholder2"
          count={0}
          endpoint="/placeholder2"
          color="green"
        />
      </div>
    </div>
  );
}

function HomeNavButton(props: {
  label: string;
  count: number;
  endpoint: string;
  color:
    | "slate"
    | "gray"
    | "zinc"
    | "neutral"
    | "stone"
    | "red"
    | "orange"
    | "amber"
    | "yellow"
    | "lime"
    | "green"
    | "emerald"
    | "teal"
    | "cyan"
    | "sky"
    | "blue"
    | "indigo"
    | "violet"
    | "purple"
    | "fuchsia"
    | "pink"
    | "rose";
}) {
  const colorBorders = {
    slate: "border-slate-500",
    gray: "border-gray-500",
    zinc: "border-zinc-500",
    neutral: "border-neutral-500",
    stone: "border-stone-500",
    red: "border-red-500",
    orange: "border-orange-500",
    amber: "border-amber-500",
    yellow: "border-yellow-500",
    lime: "border-lime-500",
    green: "border-green-500",
    emerald: "border-emerald-500",
    teal: "border-teal-500",
    cyan: "border-cyan-500",
    sky: "border-sky-500",
    blue: "border-blue-500",
    indigo: "border-indigo-500",
    violet: "border-violet-500",
    purple: "border-purple-500",
    fuchsia: "border-fuchsia-500",
    pink: "border-pink-500",
    rose: "border-rose-500",
  };

  return (
    <NavLink
      to={props.endpoint}
      className={
        colorBorders[props.color] +
        " rounded-md bg-neutral-700 p-4 border-2 text-center text-2xl flex flex-row justify-center items-center gap-4 hover:brightness-75 transition-all cursor-pointer active:brightness-50"
      }
    >
      {props.label}{" "}
      <div className="px-3 py-1 text-lg bg-neutral-500 rounded-md">
        {props.count}
      </div>
    </NavLink>
  );
}
