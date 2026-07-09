import styles from "./StatusBadge.module.scss";

type StatusBadgeProps = {
  children: React.ReactNode;
  href?: string;
  variant?: "success" | "warning" | "error" | "info";
  onClick?: () => void;
};

export default function StatusBadge({
  children,
  variant = "success",
  onClick,
}: StatusBadgeProps) {

  const className = `${styles['status-badge']} ${styles[variant]}`;


  return (
      <span className={className}>{children}</span>
  );
}