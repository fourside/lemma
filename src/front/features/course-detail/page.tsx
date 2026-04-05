import { Link, useParams } from "react-router";
import useSWR from "swr";
import type { WeekWithProgress } from "../../../models/week";
import { swrFetcher } from "../../shared/api/client";
import { BottomNav } from "../../shared/components/bottom-nav";
import { StatusBadge } from "../../shared/components/status-badge";
import styles from "./course-detail.module.css";

export function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { data: weeks } = useSWR<WeekWithProgress[]>(
    `/courses/${courseId}/weeks`,
    swrFetcher,
  );

  if (!weeks) return null;

  return (
    <div className={styles.page}>
      <Link to="/courses" className={styles.back}>
        &larr; Courses
      </Link>

      <div className={styles.list}>
        {weeks.map((week) => (
          <Link key={week.id} to={`/weeks/${week.id}`} className={styles.row}>
            <div className={styles.rowLeft}>
              <span className={styles.weekNumber}>{week.weekNumber}</span>
              <span className={styles.weekTitle}>{week.title}</span>
            </div>
            <div className={styles.rowRight}>
              {week.testScore != null && (
                <span className={styles.score}>{week.testScore}pt</span>
              )}
              <StatusBadge status={week.status} />
            </div>
          </Link>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
