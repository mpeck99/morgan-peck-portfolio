"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import styles from "./ThemeToggle.module.scss";

type Theme = "dark" | "light";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme") as Theme | null;
    setTheme(current === "light" ? "light" : "dark");
    setMounted(true);
  }, []);

  function toggleTheme() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={theme === "light"}
      className={styles["theme-toggle"]}
      onClick={toggleTheme}
      aria-label={mounted ? `Switch to ${theme === "dark" ? "light" : "dark"} mode` : "Toggle theme"}
    >
      <span
        className={styles.thumb}
        style={{ transform: theme === "light" ? "translateX(100%)" : "translateX(0)" }}
      />
      <span className={`${styles.option} ${theme === "dark" ? styles.active : ""}`}>
        <Moon size={14} />
      </span>
      <span className={`${styles.option} ${theme === "light" ? styles.active : ""}`}>
        <Sun size={14} />
      </span>
    </button>
  );
}
