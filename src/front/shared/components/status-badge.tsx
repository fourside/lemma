import type { ProgressStatus } from "../../../models/week";
import styles from "./status-badge.module.css";

const statusConfig: Record<
  ProgressStatus,
  { label: string; className: string }
> = {
  not_started: { label: "--", className: styles.notStarted },
  audio_done: { label: "Audio", className: styles.audioDone },
  text_done: { label: "Text", className: styles.textDone },
  test_done: { label: "Done", className: styles.testDone },
};

interface Props {
  status: ProgressStatus;
}

export function StatusBadge({ status }: Props) {
  const config = statusConfig[status];
  return (
    <span className={`${styles.badge} ${config.className}`}>
      {config.label}
    </span>
  );
}
