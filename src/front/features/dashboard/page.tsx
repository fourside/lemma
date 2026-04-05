import { Link } from "react-router";
import useSWR from "swr";
import type { DashboardData } from "../../../models/dashboard";
import { swrFetcher } from "../../shared/api/client";
import { BottomNav } from "../../shared/components/bottom-nav";
import { ProgressBar } from "../../shared/components/progress-bar";
import styles from "./dashboard.module.css";

export function DashboardPage() {
  const { data } = useSWR<DashboardData>("/dashboard", swrFetcher);

  if (!data) return null;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Lemma</h1>

      <section className={styles.section}>
        <ProgressBar
          value={data.completedWeeks}
          max={data.totalWeeks}
          label={`${data.completedWeeks}/${data.totalWeeks} (${data.completionPercent}%)`}
        />
      </section>

      {data.nextWeek && (
        <Link to={`/weeks/${data.nextWeek.weekId}`} className={styles.card}>
          <span className={styles.cardLabel}>Next</span>
          <span className={styles.cardTitle}>
            {data.nextWeek.courseTitle} - {data.nextWeek.weekTitle}
          </span>
        </Link>
      )}

      {data.recentTest && (
        <div className={styles.card}>
          <span className={styles.cardLabel}>Recent Test</span>
          <span className={styles.cardTitle}>
            {data.recentTest.weekTitle} — {data.recentTest.score}pt
          </span>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
