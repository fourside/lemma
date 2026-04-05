import { Link } from "react-router";
import useSWR from "swr";
import type { CourseWithProgress } from "../../../models/course";
import { swrFetcher } from "../../shared/api/client";
import { BottomNav } from "../../shared/components/bottom-nav";
import { ProgressBar } from "../../shared/components/progress-bar";
import styles from "./courses.module.css";

const phaseLabels: Record<number, string> = {
  0: "Phase 0: Preparation",
  1: "Phase 1: Foundation",
  2: "Phase 2: Core",
  3: "Phase 3: Applied",
  4: "Phase 4: Advanced",
};

export function CoursesPage() {
  const { data: courses } = useSWR<CourseWithProgress[]>(
    "/courses",
    swrFetcher,
  );

  if (!courses) return null;

  const phases = new Map<number, CourseWithProgress[]>();
  for (const course of courses) {
    const list = phases.get(course.phase) ?? [];
    list.push(course);
    phases.set(course.phase, list);
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Courses</h1>

      {[...phases.entries()].map(([phase, phaseCourses]) => (
        <section key={phase} className={styles.phase}>
          <h2 className={styles.phaseTitle}>
            {phaseLabels[phase] ?? `Phase ${phase}`}
          </h2>
          {phaseCourses.map((course) => (
            <Link
              key={course.id}
              to={`/courses/${course.id}`}
              className={styles.card}
            >
              <span className={styles.courseTitle}>{course.title}</span>
              {course.subtitle && (
                <span className={styles.subtitle}>{course.subtitle}</span>
              )}
              <ProgressBar
                value={course.completedWeeks}
                max={course.totalWeeks}
              />
            </Link>
          ))}
        </section>
      ))}

      <BottomNav />
    </div>
  );
}
