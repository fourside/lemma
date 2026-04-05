import styles from "./progress-bar.module.css";

interface Props {
  value: number;
  max: number;
  label?: string;
}

export function ProgressBar({ value, max, label }: Props) {
  const percent = max > 0 ? Math.round((value / max) * 100) : 0;

  return (
    <div className={styles.wrapper}>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${percent}%` }} />
      </div>
      <span className={styles.label}>{label ?? `${percent}%`}</span>
    </div>
  );
}
