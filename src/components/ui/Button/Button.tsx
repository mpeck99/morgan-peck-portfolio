import styles from "./Button.module.scss";

type ButtonProps = {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "outline";
  onClick?: () => void;
};

export default function Button({
  children,
  href,
  variant = "primary",
  onClick,
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
      className={className}
      onClick={onClick}
    >
      {children}
    </button>
  );
}