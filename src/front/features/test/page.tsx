import { type FormEvent, useState } from "react";
import { Link, useParams } from "react-router";
import type { GradeTestResponse, TestQuestion } from "../../../models/test";
import { apiFetch } from "../../shared/api/client";
import { BottomNav } from "../../shared/components/bottom-nav";
import styles from "./test.module.css";

type Phase = "idle" | "loading" | "answering" | "grading" | "result" | "error";

export function TestPage() {
  const { weekId } = useParams<{ weekId: string }>();
  const [phase, setPhase] = useState<Phase>("idle");
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [answers, setAnswers] = useState<Map<number, string>>(new Map());
  const [result, setResult] = useState<GradeTestResponse | null>(null);
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
    setPhase("grading");

    const answerList = questions.map((q) => ({
      questionId: q.id,
      answer: answers.get(q.id) ?? "",
    }));

    try {
      const res = await apiFetch<GradeTestResponse>(
        `/weeks/${weekId}/grade-test`,
        {
          method: "POST",
          body: JSON.stringify({ answers: answerList }),
        },
      );
      setResult(res);
      setPhase("result");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Grading failed");
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

    case "grading":
      return (
        <div className={styles.page}>
          <h1 className={styles.title}>Grading...</h1>
          <BottomNav />
        </div>
      );

    case "result":
      if (!result) return null;
      return (
        <div className={styles.page}>
          <Link to={`/weeks/${weekId}`} className={styles.back}>
            &larr; Back
          </Link>
          <h1 className={styles.title}>
            Result: {result.score}/{result.maxScore}
          </h1>

          {result.weakTopics.length > 0 && (
            <div className={styles.weakTopics}>
              <span className={styles.weakLabel}>Weak topics:</span>
              {result.weakTopics.map((t) => (
                <span key={t} className={styles.weakTag}>
                  {t}
                </span>
              ))}
            </div>
          )}

          {result.grades.map((g, i) => (
            <div key={g.questionId} className={styles.gradeCard}>
              <p className={styles.gradeHeader}>
                Q{i + 1}: {g.score}/{g.max_score}
              </p>
              <p className={styles.gradeFeedback}>{g.feedback}</p>
            </div>
          ))}

          <button
            type="button"
            className={styles.startButton}
            onClick={startTest}
          >
            Retry
          </button>
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
