import { HTMLInputTypeAttribute } from "react";

export default function Input(props: {
  className?: string;
  label: string;
  type: HTMLInputTypeAttribute;
  value: any;
  onChange: (value: any) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <p>{props.label}</p>
      <input
        className={
          "text-white bg-neutral-700 rounded-md px-2 py-1 outline-0 border-0 " +
          props.className
        }
        type={props.type}
        value={props.value}
        onChange={(e) => {
          props.onChange(e.target.value);
        }}
      ></input>
    </div>
  );
}
