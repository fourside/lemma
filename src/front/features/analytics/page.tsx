import { Link } from "react-router";
import useSWR from "swr";
import type { Weakpoint } from "../../../models/test";
import { swrFetcher } from "../../shared/api/client";
import { BottomNav } from "../../shared/components/bottom-nav";
import styles from "./analytics.module.css";

export function AnalyticsPage() {
  const { data: weakpoints } = useSWR<Weakpoint[]>(
    "/analytics/weakpoints",
    swrFetcher,
  );

  if (!weakpoints) return null;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Weakpoints</h1>

      {weakpoints.length === 0 && (
        <p className={styles.empty}>No test data yet.</p>
      )}

      {weakpoints.map((wp) => (
        <div key={wp.topic} className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.topic}>{wp.topic}</span>
            <span className={styles.count}>{wp.count}x</span>
          </div>
          <div className={styles.cardBody}>
            <span className={styles.score}>Avg: {wp.avgScore}%</span>
            <span className={styles.weeks}>
              {wp.weekIds.map((id) => (
                <Link key={id} to={`/weeks/${id}`} className={styles.weekLink}>
                  W{id}
                </Link>
              ))}
            </span>
          </div>
        </div>
      ))}

      <BottomNav />
    </div>
  );
}
