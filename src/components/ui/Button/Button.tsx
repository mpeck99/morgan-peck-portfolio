import styles from "./Button.module.scss";

type ButtonProps = {
  children: React.ReactNode;
  href?: string;
  disabled?: boolean
  variant?: "primary" | "outline";
  onClick?: () => void;
};

export default function Button({
  children,
  href,
  variant = "primary",
  onClick,
  disabled
}: ButtonProps) {

  const className = `${styles.button} ${styles[variant]}`;

  if (href) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }

  return (
    <button
      disabled={disabled}
      className={className}
      onClick={onClick}
    >
      {children}
    </button>
  );
}