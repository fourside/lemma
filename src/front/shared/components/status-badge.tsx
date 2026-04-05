import type { ProgressStatus } from "../../../models/week";
import styles from "./status-badge.module.css";

function getStatusConfig(status: ProgressStatus): {
  label: string;
  className: string;
} {
  switch (status) {
    case "not_started":
      return { label: "--", className: styles.notStarted ?? "" };
    case "audio_done":
      return { label: "Audio", className: styles.audioDone ?? "" };
    case "text_done":
      return { label: "Text", className: styles.textDone ?? "" };
    case "test_done":
      return { label: "Done", className: styles.testDone ?? "" };
    default:
      throw new Error(`Unknown status: ${status satisfies never}`);
  }
}

interface Props {
  status: ProgressStatus;
}

export function StatusBadge({ status }: Props) {
  const config = getStatusConfig(status);
  return (
    <span className={`${styles.badge ?? ""} ${config.className}`}>
      {config.label}
    </span>
  );
}
