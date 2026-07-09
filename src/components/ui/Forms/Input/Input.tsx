import { useId } from "react";
import { OctagonAlert } from 'lucide-react';
import styles from "./Input.module.scss";


type InputProps = {
  label: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
    type?: "text" | "email" | "password" | "number";
};

export default function Input({
  label,
  placeholder,
  error,
  type = "text",
  required
}: InputProps) {

  const className = `${styles['form-control']}`;
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>{label}{required && " *"}</label>
      <input id={id} placeholder={placeholder} type={type} aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={`${className} ${error ? styles.error : ""}`} />
       {error && (
        <span id={errorId} role="alert" className={styles['error-message']}>
          <OctagonAlert size={16} strokeWidth={2} />{error}
        </span>
      )}
    </div>
  );
}