import DefaultLayout from "../layouts/base";

export default function ActionManager() {
  return (
    <DefaultLayout title="Actions Manager">
      <div className="w-full min-h-full h-full flex flex-row gap-4">
        <div className="grow max-w-sm flex flex-col gap-2">
          <p className="font-semibold text-lg">ACTIONS</p>
          <div className="w-full bg-neutral-800 grow rounded-md p-2 overflow-auto">
            <p>TEST</p>
          </div>
        </div>
        <div className="grow bg-neutral-400">TEST</div>
      </div>
    </DefaultLayout>
  );
}
