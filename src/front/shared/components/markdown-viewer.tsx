import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import type { Marker } from "../../../models/marker";
import styles from "./markdown-viewer.module.css";

interface SelectionInfo {
  text: string;
  startOffset: number;
  length: number;
  sectionHeading: string | null;
  rect: DOMRect;
}

interface Props {
  content: string;
  markers?: Marker[];
  onAddMarker?: (info: {
    text: string;
    startOffset: number;
    length: number;
    sectionHeading: string | null;
  }) => void;
}

function findSectionHeading(content: string, offset: number): string | null {
  const before = content.slice(0, offset);
  const headingRegex = /^## .+$/gm;
  let lastMatch: string | null = null;
  let match: RegExpExecArray | null = headingRegex.exec(before);
  while (match) {
    lastMatch = match[0].replace(/^## /, "");
    match = headingRegex.exec(before);
  }
  return lastMatch;
}

function applyMarkers(content: string, markers: Marker[]): string {
  if (markers.length === 0) return content;

  const sorted = [...markers].sort((a, b) => a.startOffset - b.startOffset);

  let result = "";
  let cursor = 0;

  for (const marker of sorted) {
    if (marker.startOffset < cursor) continue;
    result += content.slice(cursor, marker.startOffset);
    const markedText = content.slice(
      marker.startOffset,
      marker.startOffset + marker.length,
    );
    result += `<mark>${markedText}</mark>`;
    cursor = marker.startOffset + marker.length;
  }

  result += content.slice(cursor);
  return result;
}

export function MarkdownViewer({ content, markers = [], onAddMarker }: Props) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [selection, setSelection] = useState<SelectionInfo | null>(null);

  const handleMouseUp = useCallback(() => {
    if (!onAddMarker) return;

    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.toString().trim()) {
      setSelection(null);
      return;
    }

    const selectedText = sel.toString().trim();
    const offset = content.indexOf(selectedText);
    if (offset === -1) {
      setSelection(null);
      return;
    }

    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const sectionHeading = findSectionHeading(content, offset);

    setSelection({
      text: selectedText,
      startOffset: offset,
      length: selectedText.length,
      sectionHeading,
      rect,
    });
  }, [content, onAddMarker]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target;
      if (
        target instanceof HTMLElement &&
        target.closest(`.${styles.popover ?? ""}`)
      ) {
        return;
      }
      setSelection(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddMarker = () => {
    if (!selection || !onAddMarker) return;
    onAddMarker({
      text: selection.text,
      startOffset: selection.startOffset,
      length: selection.length,
      sectionHeading: selection.sectionHeading,
    });
    setSelection(null);
    window.getSelection()?.removeAllRanges();
  };

  const markedContent = applyMarkers(content, markers);

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: text selection detection only
    <div className={styles.viewer} ref={viewerRef} onMouseUp={handleMouseUp}>
      <ReactMarkdown
        allowedElements={undefined}
        components={{
          mark: ({ children }) => (
            <mark className={styles.highlight ?? ""}>{children}</mark>
          ),
        }}
      >
        {markedContent}
      </ReactMarkdown>

      {selection && (
        <div
          className={styles.popover ?? ""}
          style={{
            position: "fixed",
            top: selection.rect.bottom + 4,
            left: selection.rect.left,
          }}
        >
          <button
            type="button"
            className={styles.popoverButton ?? ""}
            onClick={handleAddMarker}
          >
            Add Marker
          </button>
        </div>
      )}
    </div>
  );
}
