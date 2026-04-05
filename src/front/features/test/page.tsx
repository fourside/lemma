import { type FormEvent, useState } from "react";
import { Link, useParams } from "react-router";
import type { TestQuestion } from "../../../models/test";
import { apiFetch } from "../../shared/api/client";
import { BottomNav } from "../../shared/components/bottom-nav";
import styles from "./test.module.css";

type Phase =
  | "idle"
  | "loading"
  | "answering"
  | "submitting"
  | "submitted"
  | "error";

export function TestPage() {
  const { weekId } = useParams<{ weekId: string }>();
  const [phase, setPhase] = useState<Phase>("idle");
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [answers, setAnswers] = useState<Map<number, string>>(new Map());
  const [errorMessage, setErrorMessage] = useState("");

  const startTest = async () => {
    setPhase("loading");
    try {
      const res = await apiFetch<{ questions: TestQuestion[] }>(
        `/weeks/${weekId}/generate-test`,
        { method: "POST", body: JSON.stringify({}) },
      );
      setQuestions(res.questions);
      setAnswers(new Map());
      setPhase("answering");
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to load test",
      );
      setPhase("error");
    }
  };

  const updateAnswer = (questionId: number, value: string) => {
    setAnswers((prev) => {
      const next = new Map(prev);
      next.set(questionId, value);
      return next;
    });
  };

  const submitTest = async (e: FormEvent) => {
    e.preventDefault();
    setPhase("submitting");

    const answerList = questions.map((q) => ({
      questionId: q.id,
      answer: answers.get(q.id) ?? "",
    }));

    try {
      await apiFetch(`/weeks/${weekId}/submit-answers`, {
        method: "POST",
        body: JSON.stringify({ answers: answerList }),
      });
      setPhase("submitted");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Submission failed");
      setPhase("error");
    }
  };

  switch (phase) {
    case "idle":
      return (
        <div className={styles.page}>
          <Link to={`/weeks/${weekId}`} className={styles.back}>
            &larr; Back
          </Link>
          <h1 className={styles.title}>Test</h1>
          <button
            type="button"
            className={styles.startButton}
            onClick={startTest}
          >
            Start Test
          </button>
          <BottomNav />
        </div>
      );

    case "loading":
      return (
        <div className={styles.page}>
          <h1 className={styles.title}>Loading...</h1>
          <BottomNav />
        </div>
      );

    case "answering":
      return (
        <div className={styles.page}>
          <h1 className={styles.title}>Test ({questions.length} questions)</h1>
          <form onSubmit={submitTest}>
            {questions.map((q, i) => (
              <div key={q.id} className={styles.questionCard}>
                <p className={styles.questionLabel}>
                  Q{i + 1}. [{q.type}] ({q.max_score}pt)
                </p>
                <p className={styles.questionText}>{q.question}</p>
                <textarea
                  className={styles.answerInput}
                  rows={4}
                  value={answers.get(q.id) ?? ""}
                  onChange={(e) => updateAnswer(q.id, e.target.value)}
                  placeholder="Your answer..."
                />
              </div>
            ))}
            <button type="submit" className={styles.submitButton}>
              Submit
            </button>
          </form>
          <BottomNav />
        </div>
      );

    case "submitting":
      return (
        <div className={styles.page}>
          <h1 className={styles.title}>Submitting...</h1>
          <BottomNav />
        </div>
      );

    case "submitted":
      return (
        <div className={styles.page}>
          <Link to={`/weeks/${weekId}`} className={styles.back}>
            &larr; Back
          </Link>
          <h1 className={styles.title}>Submitted</h1>
          <p>Answers saved. Run the grading script locally to get results.</p>
          <BottomNav />
        </div>
      );

    case "error":
      return (
        <div className={styles.page}>
          <Link to={`/weeks/${weekId}`} className={styles.back}>
            &larr; Back
          </Link>
          <h1 className={styles.title}>Error</h1>
          <p className={styles.errorText}>{errorMessage}</p>
          <button
            type="button"
            className={styles.startButton}
            onClick={startTest}
          >
            Try Again
          </button>
          <BottomNav />
        </div>
      );

    default:
      throw new Error(`Unknown phase: ${phase satisfies never}`);
  }
}
