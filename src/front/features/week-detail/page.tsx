import { type FormEvent, useState } from "react";
import { Link, useParams } from "react-router";
import useSWR from "swr";
import type { LectureType } from "../../../models/lecture";
import type { ProgressStatus, WeekDetail } from "../../../models/week";
import { apiFetch, swrFetcher } from "../../shared/api/client";
import { AudioPlayer } from "../../shared/components/audio-player";
import { BottomNav } from "../../shared/components/bottom-nav";
import { MarkdownViewer } from "../../shared/components/markdown-viewer";
import { StatusBadge } from "../../shared/components/status-badge";
import styles from "./week-detail.module.css";

const statusSteps: { status: ProgressStatus; label: string }[] = [
  { status: "audio_done", label: "Audio" },
  { status: "text_done", label: "Text" },
  { status: "test_done", label: "Test" },
];

const statusOrder: Record<ProgressStatus, number> = {
  not_started: 0,
  audio_done: 1,
  text_done: 2,
  test_done: 3,
};

export function WeekDetailPage() {
  const { weekId } = useParams<{ weekId: string }>();
  const { data: week, mutate } = useSWR<WeekDetail>(
    `/weeks/${weekId}`,
    swrFetcher,
  );
  const [testScore, setTestScore] = useState("");
  const [testNotes, setTestNotes] = useState("");
  const [generatingType, setGeneratingType] = useState<LectureType | null>(
    null,
  );

  if (!week) return null;

  const updateProgress = async (
    status: ProgressStatus,
    score?: number,
    notes?: string,
  ) => {
    await apiFetch(`/weeks/${weekId}/progress`, {
      method: "PUT",
      body: JSON.stringify({
        status,
        ...(score != null ? { testScore: score } : {}),
        ...(notes ? { testNotes: notes } : {}),
      }),
    });
    mutate();
  };

  const handleTestSubmit = (e: FormEvent) => {
    e.preventDefault();
    const score = Number(testScore);
    if (score >= 0 && score <= 100) {
      updateProgress("test_done", score, testNotes || undefined);
    }
  };

  const handleGenerateLecture = async (type: LectureType) => {
    setGeneratingType(type);
    try {
      await apiFetch(`/weeks/${weekId}/generate-lecture`, {
        method: "POST",
        body: JSON.stringify({ type }),
      });
      mutate();
    } finally {
      setGeneratingType(null);
    }
  };

  const keywords = week.keywords?.split(",").map((k) => k.trim()) ?? [];

  return (
    <div className={styles.page}>
      <Link to={`/courses/${week.courseId}`} className={styles.back}>
        &larr; {week.courseTitle}
      </Link>

      <h1 className={styles.title}>
        Week {week.weekNumber}: {week.title}
      </h1>

      {keywords.length > 0 && (
        <div className={styles.keywords}>
          {keywords.map((kw) => (
            <span key={kw} className={styles.keyword}>
              {kw}
            </span>
          ))}
        </div>
      )}

      {week.audioUrl && (
        <section className={styles.section}>
          <h2 className={styles.stepsTitle}>Audio Lecture</h2>
          <AudioPlayer src={week.audioUrl} />
        </section>
      )}

      {week.lectureText && (
        <section className={styles.section}>
          <h2 className={styles.stepsTitle}>Text Lecture</h2>
          <MarkdownViewer content={week.lectureText} />
        </section>
      )}

      {(!week.lectureText || !week.audioLectureText) && (
        <section className={styles.section}>
          <h2 className={styles.stepsTitle}>Generate</h2>
          <div className={styles.generateButtons}>
            {!week.audioLectureText && (
              <button
                type="button"
                className={styles.stepButton}
                disabled={generatingType !== null}
                onClick={() => handleGenerateLecture("audio")}
              >
                {generatingType === "audio" ? "Generating..." : "Audio Text"}
              </button>
            )}
            {!week.lectureText && (
              <button
                type="button"
                className={styles.stepButton}
                disabled={generatingType !== null}
                onClick={() => handleGenerateLecture("text")}
              >
                {generatingType === "text" ? "Generating..." : "Text Lecture"}
              </button>
            )}
          </div>
        </section>
      )}

      <section className={styles.steps}>
        <h2 className={styles.stepsTitle}>Progress</h2>
        {statusSteps.map((step) => {
          const done = statusOrder[week.status] >= statusOrder[step.status];
          const isNext =
            !done && statusOrder[week.status] === statusOrder[step.status] - 1;

          return (
            <div key={step.status} className={styles.step}>
              <span
                className={`${styles.stepLabel} ${done ? styles.stepDone : ""}`}
              >
                {done ? "v" : "-"} {step.label}
              </span>
              {isNext && step.status !== "test_done" && (
                <button
                  type="button"
                  className={styles.stepButton}
                  onClick={() => updateProgress(step.status)}
                >
                  Mark done
                </button>
              )}
            </div>
          );
        })}
      </section>

      {statusOrder[week.status] >= statusOrder.text_done &&
        week.status !== "test_done" && (
          <section className={styles.section}>
            <Link to={`/weeks/${weekId}/test`} className={styles.stepButton}>
              Take Test
            </Link>
          </section>
        )}

      {statusOrder[week.status] >= statusOrder.text_done &&
        week.status !== "test_done" && (
          <form className={styles.testForm} onSubmit={handleTestSubmit}>
            <h2 className={styles.stepsTitle}>Record Test Score</h2>
            <input
              type="number"
              className={styles.input}
              placeholder="Score (0-100)"
              min={0}
              max={100}
              value={testScore}
              onChange={(e) => setTestScore(e.target.value)}
            />
            <textarea
              className={styles.textarea}
              placeholder="Notes (weaknesses, etc.)"
              value={testNotes}
              onChange={(e) => setTestNotes(e.target.value)}
              rows={3}
            />
            <button type="submit" className={styles.submitButton}>
              Save Score
            </button>
          </form>
        )}

      {week.testScore != null && (
        <div className={styles.result}>
          <span className={styles.resultLabel}>Score</span>
          <span className={styles.resultScore}>{week.testScore}/100</span>
          <StatusBadge status={week.status} />
        </div>
      )}

      {week.testNotes && (
        <div className={styles.notes}>
          <span className={styles.notesLabel}>Notes</span>
          <p className={styles.notesText}>{week.testNotes}</p>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
