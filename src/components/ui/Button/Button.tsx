import styles from "./Button.module.scss";

export type ButtonProps = {
  children: React.ReactNode;
  href?: string;
  disabled?: boolean;
  variant?: "primary" | "outline";
  onClick?: () => void;
  iconPosition?: "left" | "right";
  icon?: React.ReactNode;
};

export default function Button({
  children,
  href,
  variant = "primary",
  onClick,
  disabled,
  icon,
  iconPosition,
}: ButtonProps) {
  const className = `${styles.button} ${styles[variant]}`;

  const content = (
    <>
      {icon && iconPosition === "left" && (
        <span aria-hidden="true" className={styles.icon}>
          {icon}
        </span>
      )}
      {children}
      {icon && iconPosition === "right" && (
        <span aria-hidden="true" className={styles.icon}>
          {icon}
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <a href={href} className={className}>
        {content}
      </a>
    );
  }

  return (
    <button disabled={disabled} className={className} onClick={onClick}>
      {content}
    </button>
  );
}
