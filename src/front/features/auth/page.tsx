import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router";
import type { User } from "../../../models/user";
import { apiFetch } from "../../shared/api/client";
import { useAuth } from "../../shared/auth/auth-context";
import styles from "./auth.module.css";

export function LoginPage() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await apiFetch<{ token: string; user: User }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ name, password }),
      });
      login(res.token, res.user);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <div className={styles.page}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h1 className={styles.title}>Lemma</h1>
        {error && <p className={styles.error}>{error}</p>}
        <input
          className={styles.input}
          type="text"
          placeholder="Username"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="username"
        />
        <input
          className={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        <button className={styles.button} type="submit">
          Login
        </button>
      </form>
    </div>
  );
}
