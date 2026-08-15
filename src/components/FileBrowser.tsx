import { useEffect, useState } from "react";
import { readDir } from "@tauri-apps/api/fs";
import { invoke } from "@tauri-apps/api/tauri";
import { FaCaretDown, FaCaretRight, FaFile, FaFolder } from "react-icons/fa6";

interface FileEntry {
  name: string;
  path: string;
  isDir: boolean;
  children?: FileEntry[];
}

interface FileBrowserProps {
  onSelect?: (path: string | null) => void;
}

export default function FileBrowser({ onSelect }: FileBrowserProps) {
  const [tree, setTree] = useState<FileEntry[]>([]);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(),
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFiles();
    const interval = setInterval(loadFiles, 2000);
    return () => clearInterval(interval);
  }, []);

  async function loadFiles() {
    try {
      const actionsPath = await invoke<string>("get_actions_dir");
      const entries = await readDir(actionsPath, {
        recursive: true,
      });
      const parsed = parseEntries(entries);
      setTree(parsed);
    } catch (err) {
      setError(
        `Failed to load actions: ${err instanceof Error ? err.message : err}`,
      );
    }
  }

  function parseEntries(
    entries: { name?: string; path: string; children?: typeof entries }[],
  ): FileEntry[] {
    const result: FileEntry[] = [];

    for (const entry of entries) {
      const name = entry.name ?? entry.path.split(/[\\/]/).pop() ?? "";
      if (entry.children) {
        result.push({
          name,
          path: entry.path,
          isDir: true,
          children: parseEntries(entry.children),
        });
      } else if (name.endsWith(".json")) {
        result.push({
          name,
          path: entry.path,
          isDir: false,
        });
      }
    }

    result.sort((a, b) => {
      if (a.isDir && !b.isDir) return -1;
      if (!a.isDir && b.isDir) return 1;
      return a.name.localeCompare(b.name);
    });

    return result;
  }

  function toggleFolder(path: string) {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }

  function selectFile(path: string) {
    setSelectedPath(path);
    onSelect?.(path);
  }

  function deselectFile() {
    setSelectedPath(null);
    onSelect?.(null);
  }

  function renderEntry(entry: FileEntry, depth: number = 0) {
    const paddingLeft = depth * 16;

    if (entry.isDir) {
      const isExpanded = expandedFolders.has(entry.path);
      return (
        <div key={entry.path}>
          <button
            onClick={() => toggleFolder(entry.path)}
            className="w-full flex items-center gap-1.5 px-2 py-1 rounded hover:bg-neutral-700 text-left text-sm"
            style={{ paddingLeft }}
          >
            <span className="text-xs">
              {isExpanded ? <FaCaretDown /> : <FaCaretRight />}
            </span>
            <span className="text-yellow-400">
              <FaFolder />
            </span>
            <span className="text-neutral-200">{entry.name}</span>
          </button>
          {isExpanded && entry.children && (
            <div>
              {entry.children.map((child) => renderEntry(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    const isSelected = selectedPath === entry.path;
    return (
      <button
        key={entry.path}
        onClick={() => selectFile(entry.path)}
        className={`w-full flex items-center gap-1.5 px-2 py-1 rounded text-left text-sm transition-colors ${
          isSelected
            ? "bg-blue-600 text-white"
            : "hover:bg-neutral-700 text-neutral-300"
        }`}
        style={{ paddingLeft }}
      >
        <span className="text-blue-300">
          <FaFile />
        </span>
        <span>{entry.name}</span>
      </button>
    );
  }

  if (error) {
    return <p className="text-red-400 text-sm">{error}</p>;
  }

  if (tree.length === 0) {
    return <p className="text-neutral-500 text-sm">Loading...</p>;
  }

  return (
    <div className="flex flex-col gap-0.5">
      <button
        onClick={deselectFile}
        className={`w-full flex items-center gap-1.5 px-2 py-1 rounded text-left text-sm transition-colors ${
          selectedPath === null
            ? "bg-blue-600 text-white"
            : "hover:bg-neutral-700 text-neutral-300"
        }`}
      >
        <span className="text-green-400">✚</span>
        <span>New file</span>
      </button>
      {tree.map((e) => renderEntry(e))}
    </div>
  );
}
