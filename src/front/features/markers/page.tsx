import { useState } from "react";
import { Link } from "react-router";
import useSWR from "swr";
import type { MarkerWithWeek } from "../../../models/marker";
import { apiFetch, swrFetcher } from "../../shared/api/client";
import { BottomNav } from "../../shared/components/bottom-nav";
import styles from "./markers.module.css";

export function MarkersPage() {
  const { data: markers, mutate } = useSWR<MarkerWithWeek[]>(
    "/markers",
    swrFetcher,
  );
  const [copied, setCopied] = useState(false);

  if (!markers) return null;

  const grouped = new Map<
    number,
    { weekTitle: string; courseTitle: string; items: MarkerWithWeek[] }
  >();
  for (const m of markers) {
    const existing = grouped.get(m.weekId);
    if (existing) {
      existing.items.push(m);
    } else {
      grouped.set(m.weekId, {
        weekTitle: m.weekTitle,
        courseTitle: m.courseTitle,
        items: [m],
      });
    }
  }

  const handleDelete = async (id: number) => {
    await apiFetch(`/markers/${id}`, { method: "DELETE" });
    mutate();
  };

  const handleCopyQuestion = () => {
    const lines: string[] = ["以下のCS学習メモについて質問があります:", ""];

    for (const [, group] of grouped) {
      lines.push(`[${group.courseTitle} - ${group.weekTitle}]`);
      for (const m of group.items) {
        const section = m.sectionHeading ? ` (${m.sectionHeading})` : "";
        lines.push(`- "${m.text}"${section}`);
      }
      lines.push("");
    }

    lines.push("これらについて詳しく教えてください。");

    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Markers</h1>

      {markers.length === 0 && (
        <p className={styles.empty}>
          No markers yet. Select text in a lecture to add one.
        </p>
      )}

      {markers.length > 0 && (
        <button
          type="button"
          className={styles.copyButton}
          onClick={handleCopyQuestion}
        >
          {copied ? "Copied!" : "Copy as question"}
        </button>
      )}

      {[...grouped.entries()].map(([weekId, group]) => (
        <section key={weekId} className={styles.group}>
          <Link to={`/weeks/${weekId}`} className={styles.groupTitle}>
            {group.courseTitle} - {group.weekTitle}
          </Link>
          {group.items.map((m) => (
            <div key={m.id} className={styles.item}>
              <div className={styles.itemContent}>
                <p className={styles.itemText}>{m.text}</p>
                {m.sectionHeading && (
                  <p className={styles.itemSection}>{m.sectionHeading}</p>
                )}
              </div>
              <button
                type="button"
                className={styles.deleteButton}
                onClick={() => handleDelete(m.id)}
              >
                x
              </button>
            </div>
          ))}
        </section>
      ))}

      <BottomNav />
    </div>
  );
}
