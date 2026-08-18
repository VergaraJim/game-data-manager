import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FaMagnifyingGlassMinus,
  FaMagnifyingGlassPlus,
  FaPlus,
  FaTrash,
} from "react-icons/fa6";

export type TimelineElementType =
  | "CharacterAnimation"
  | "MeleeHitData"
  | "ProjectileSpawn";

export interface TimelineElement {
  id: string;
  type: TimelineElementType;
  /** Start time in seconds */
  start: number;
  /** Duration in seconds */
  duration: number;
  /** Row index */
  row: number;
  /** Editable parameters (planned, currently empty) */
  params: Record<string, unknown>;
}

export interface TimelineParams {
  /** Total action duration in seconds */
  actionDuration: number;
  /** Cancellable window at the end (in seconds). Visual only. */
  actionCancellable: number;
  /** Whether movement is allowed during action */
  actionCanMove: boolean;
}

const ELEMENT_COLORS: Record<TimelineElementType, string> = {
  CharacterAnimation: "bg-neutral-500 border-neutral-400",
  MeleeHitData: "bg-red-700 border-red-500",
  ProjectileSpawn: "bg-blue-700 border-blue-500",
};

const ELEMENT_LABELS: Record<TimelineElementType, string> = {
  CharacterAnimation: "Anim",
  MeleeHitData: "Melee",
  ProjectileSpawn: "Projectile",
};

const BASE_PX_PER_SECOND = 480; // 30rem = 480px at default
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4.0;
const ZOOM_STEP = 0.25;
const MIN_ELEMENT_DURATION = 0.05;
const ROW_HEIGHT = 36;
const RULER_HEIGHT = 28;

let nextId = 1;
function generateId(): string {
  return `el_${nextId++}_${Date.now()}`;
}

export default function ActionTimeline(props: { className?: string }) {
  const [elements, setElements] = useState<TimelineElement[]>([]);
  const [rows, setRows] = useState<number[]>([0, 1]); // row indices
  const [zoom, setZoom] = useState(1.0);
  const [params, setParams] = useState<TimelineParams>({
    actionDuration: 2.0,
    actionCancellable: 0.4,
    actionCanMove: false,
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [snap, setSnap] = useState(0.1); // snap interval in seconds, 0 = no snap

  const pxPerSecond = BASE_PX_PER_SECOND * zoom;
  const totalWidth = params.actionDuration * pxPerSecond;

  function zoomIn() {
    setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP));
  }

  function zoomOut() {
    setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP));
  }

  function addRow() {
    const nextIndex = rows.length > 0 ? Math.max(...rows) + 1 : 0;
    setRows((r) => [...r, nextIndex]);
  }

  function removeRow(rowIndex: number) {
    setRows((r) => r.filter((ri) => ri !== rowIndex));
    setElements((els) => els.filter((el) => el.row !== rowIndex));
    setSelectedId((s) => {
      const el = elements.find((e) => e.id === s);
      if (el && el.row === rowIndex) return null;
      return s;
    });
  }

  function addElement(type: TimelineElementType) {
    if (rows.length === 0) return;
    const targetRow = rows[0];
    const newEl: TimelineElement = {
      id: generateId(),
      type,
      start: 0,
      duration: 0.3,
      row: targetRow,
      params: {},
    };
    // Auto-resolve overlap
    const placed = resolveOverlap(newEl, elements, rows);
    setElements((els) => [...els, placed]);
  }

  function deleteElement(id: string) {
    setElements((els) => els.filter((el) => el.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function deleteSelected() {
    if (selectedId) deleteElement(selectedId);
  }

  function resolveOverlap(
    el: TimelineElement,
    allElements: TimelineElement[],
    availableRows: number[],
  ): TimelineElement {
    const others = allElements.filter((e) => e.id !== el.id);
    for (const row of availableRows) {
      const candidate = { ...el, row };
      const overlaps = others.some(
        (o) =>
          o.row === row &&
          candidate.start < o.start + o.duration &&
          candidate.start + candidate.duration > o.start,
      );
      if (!overlaps) return candidate;
    }
    const newRowIndex =
      availableRows.length > 0 ? Math.max(...availableRows) + 1 : 0;
    setRows((r) => [...r, newRowIndex]);
    return { ...el, row: newRowIndex };
  }

  const dragRef = useRef<{
    elementId: string;
    startX: number;
    originalStart: number;
  } | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, el: TimelineElement) => {
      e.preventDefault();
      e.stopPropagation();
      setSelectedId(el.id);
      dragRef.current = {
        elementId: el.id,
        startX: e.clientX,
        originalStart: el.start,
      };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current) return;
      const { elementId, startX, originalStart } = dragRef.current;
      const dx = e.clientX - startX;
      const dt = dx / pxPerSecond;
      let newStart = originalStart + dt;
      if (snap > 0) {
        newStart = Math.round(newStart / snap) * snap;
        const decimals = snap.toString().split(".")[1]?.length ?? 0;
        newStart = parseFloat(newStart.toFixed(decimals + 1));
      }
      const el = elements.find((el) => el.id === elementId);
      if (!el) return;
      newStart = Math.max(
        0,
        Math.min(params.actionDuration - el.duration, newStart),
      );

      setElements((els) =>
        els.map((e) => (e.id === elementId ? { ...e, start: newStart } : e)),
      );
    },
    [pxPerSecond, elements, params.actionDuration, snap],
  );

  const handlePointerUp = useCallback(
    (_e: React.PointerEvent) => {
      if (!dragRef.current) return;
      const elId = dragRef.current.elementId;
      dragRef.current = null;
      setElements((els) => {
        const el = els.find((e) => e.id === elId);
        if (!el) return els;
        const others = els.filter((e) => e.id !== elId);
        const resolved = resolveOverlap(el, others, rows);
        return others.concat(resolved);
      });
    },
    [rows],
  );

  const rulerMarks = useMemo(() => {
    const marks: { time: number; label: string }[] = [];
    let step = 0.1;
    if (zoom < 0.5) step = 0.5;
    else if (zoom < 1) step = 0.25;
    else if (zoom >= 2) step = 0.05;

    for (let t = 0; t <= params.actionDuration + 0.001; t += step) {
      marks.push({ time: t, label: t.toFixed(2) + "s" });
    }
    return marks;
  }, [zoom, params.actionDuration]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Delete" && selectedId) {
        deleteSelected();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedId]);

  return (
    <div className={"flex flex-col gap-2 " + (props.className ?? "")}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        {/* Add element buttons */}
        <span className="text-neutral-400 font-semibold mr-1">Add:</span>
        <button
          onClick={() => addElement("CharacterAnimation")}
          className="px-2 py-1 rounded bg-neutral-600 hover:bg-neutral-500 text-neutral-200 text-xs"
        >
          + Anim
        </button>
        <button
          onClick={() => addElement("MeleeHitData")}
          className="px-2 py-1 rounded bg-red-800 hover:bg-red-700 text-neutral-200 text-xs"
        >
          + Melee
        </button>
        <button
          onClick={() => addElement("ProjectileSpawn")}
          className="px-2 py-1 rounded bg-blue-800 hover:bg-blue-700 text-neutral-200 text-xs"
        >
          + Projectile
        </button>

        <div className="w-px h-5 bg-neutral-600 mx-1" />

        {/* Zoom */}
        <button
          onClick={zoomOut}
          disabled={zoom <= MIN_ZOOM}
          className="p-1 rounded hover:bg-neutral-700 disabled:opacity-30"
          title="Zoom Out"
        >
          <FaMagnifyingGlassMinus />
        </button>
        <span className="text-neutral-400 text-xs w-12 text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={zoomIn}
          disabled={zoom >= MAX_ZOOM}
          className="p-1 rounded hover:bg-neutral-700 disabled:opacity-30"
          title="Zoom In"
        >
          <FaMagnifyingGlassPlus />
        </button>

        <div className="w-px h-5 bg-neutral-600 mx-1" />

        {/* Snap */}
        <label className="flex items-center gap-1 text-xs text-neutral-400">
          Snap:
          <input
            type="number"
            min={0}
            max={5}
            step={0.01}
            value={snap}
            onChange={(e) =>
              setSnap(Math.max(0, parseFloat(e.target.value) || 0))
            }
            className="w-14 bg-neutral-700 border border-neutral-600 rounded px-1 py-0.5 text-center text-neutral-200"
          />
          <span className="text-neutral-500">s</span>
        </label>

        <div className="w-px h-5 bg-neutral-600 mx-1" />

        {/* Rows */}
        <button
          onClick={addRow}
          className="px-2 py-1 rounded bg-neutral-700 hover:bg-neutral-600 text-xs flex items-center gap-1"
          title="Add Row"
        >
          <FaPlus className="text-[10px]" /> Row
        </button>

        <div className="w-px h-5 bg-neutral-600 mx-1" />

        {/* Delete selected */}
        <button
          onClick={deleteSelected}
          disabled={!selectedId}
          className="px-2 py-1 rounded bg-neutral-700 hover:bg-red-700 disabled:opacity-30 text-xs flex items-center gap-1"
          title="Delete Selected (Del)"
        >
          <FaTrash className="text-[10px]" /> Delete
        </button>
      </div>

      {/* Timeline Parameters */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-300 bg-neutral-800/50 rounded px-3 py-2">
        <label className="flex items-center gap-1">
          Duration:
          <input
            type="number"
            min={0.1}
            max={30}
            step={0.1}
            value={params.actionDuration}
            onChange={(e) =>
              setParams((p) => ({
                ...p,
                actionDuration: Math.max(
                  0.1,
                  parseFloat(e.target.value) || 0.1,
                ),
              }))
            }
            className="w-16 bg-neutral-700 border border-neutral-600 rounded px-1 py-0.5 text-center"
          />
          <span className="text-neutral-500">s</span>
        </label>
        <label className="flex items-center gap-1">
          Cancellable:
          <input
            type="number"
            min={0}
            max={params.actionDuration}
            step={0.05}
            value={params.actionCancellable}
            onChange={(e) =>
              setParams((p) => ({
                ...p,
                actionCancellable: Math.max(
                  0,
                  Math.min(p.actionDuration, parseFloat(e.target.value) || 0),
                ),
              }))
            }
            className="w-16 bg-neutral-700 border border-neutral-600 rounded px-1 py-0.5 text-center"
          />
          <span className="text-neutral-500">s</span>
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={params.actionCanMove}
            onChange={(e) =>
              setParams((p) => ({ ...p, actionCanMove: e.target.checked }))
            }
            className="accent-blue-500"
          />
          Can Move
        </label>
      </div>

      {/* Timeline Area */}
      <div className="grow overflow-auto bg-neutral-900 rounded border border-neutral-700">
        <div
          ref={timelineRef}
          className="relative select-none"
          style={{ minWidth: totalWidth + 48 + 32, minHeight: "100%" }}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onClick={() => setSelectedId(null)}
        >
          {/* Ruler */}
          <div
            className="sticky top-0 z-20 bg-neutral-800 border-b border-neutral-700 flex"
            style={{ height: RULER_HEIGHT }}
          >
            <div className="w-12 flex-shrink-0" />
            <div
              className="relative h-full overflow-visible"
              style={{ width: totalWidth }}
            >
              {rulerMarks.map((mark) => (
                <div
                  key={mark.time}
                  className="absolute top-0 h-full"
                  style={{ left: mark.time * pxPerSecond }}
                >
                  <div className="w-px h-2 bg-neutral-500 mx-auto" />
                  <span
                    className="text-[9px] text-neutral-500 mt-0.5 whitespace-nowrap absolute"
                    style={{ transform: "translateX(-50%)", left: 0 }}
                  >
                    {mark.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Rows */}
          {rows.map((rowIndex, i) => (
            <div
              key={rowIndex}
              className="relative flex border-b border-neutral-800"
              style={{ height: ROW_HEIGHT, width: totalWidth + 48 }}
            >
              {/* Row label */}
              <div className="w-12 flex-shrink-0 flex items-center justify-between px-1 h-full text-[10px] text-neutral-500 border-r border-neutral-700 bg-neutral-900">
                <span>{i + 1}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeRow(rowIndex);
                  }}
                  className="text-neutral-600 hover:text-red-400 text-[10px]"
                  title="Remove row"
                >
                  ✕
                </button>
              </div>

              {/* Row track */}
              <div className="relative h-full" style={{ width: totalWidth }}>
                {/* Row background alternate */}
                <div
                  className={`absolute inset-0 ${i % 2 === 0 ? "bg-neutral-800/30" : "bg-neutral-800/10"}`}
                />

                {/* Cancellable zone per row */}
                {params.actionCancellable > 0 && (
                  <div
                    className="absolute top-0 bottom-0 bg-yellow-500/10 border-l border-yellow-500/30 pointer-events-none"
                    style={{
                      left:
                        (params.actionDuration - params.actionCancellable) *
                        pxPerSecond,
                      width: params.actionCancellable * pxPerSecond,
                    }}
                  />
                )}

                {/* Elements in this row */}
                {elements
                  .filter((el) => el.row === rowIndex)
                  .map((el) => (
                    <div
                      key={el.id}
                      className={`absolute top-1 bottom-1 rounded border cursor-grab active:cursor-grabbing flex items-center px-1 text-[10px] font-medium text-white truncate transition-shadow ${ELEMENT_COLORS[el.type]} ${selectedId === el.id ? "ring-2 ring-white/60 shadow-lg" : "hover:brightness-110"}`}
                      style={{
                        left: el.start * pxPerSecond,
                        width: Math.max(
                          el.duration * pxPerSecond,
                          MIN_ELEMENT_DURATION * pxPerSecond,
                        ),
                      }}
                      onPointerDown={(e) => handlePointerDown(e, el)}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {ELEMENT_LABELS[el.type]}
                    </div>
                  ))}
              </div>
            </div>
          ))}

          {/* Cancellable label (once, in first row area) */}
          {params.actionCancellable > 0 && rows.length > 0 && (
            <div
              className="absolute pointer-events-none text-[9px] text-yellow-500/70"
              style={{
                left:
                  48 +
                  (params.actionDuration - params.actionCancellable) *
                    pxPerSecond +
                  4,
                top: RULER_HEIGHT + 2,
              }}
            >
              Cancellable
            </div>
          )}

          {/* Empty state */}
          {rows.length === 0 && (
            <div className="flex items-center justify-center h-32 text-neutral-600 text-sm">
              No rows. Add a row to start placing elements.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
