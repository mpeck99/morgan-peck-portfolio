import type { LucideIcon } from "lucide-react";
import styles from "./Badge.module.scss";

export type BadgeProps = {
  children: React.ReactNode;
  icon?: LucideIcon;
  className?: string;
};

export default function Badge({ children, icon: Icon, className }: BadgeProps) {
  return (
    <span className={className ? `${styles.badge} ${className}` : styles.badge}>
      {Icon && <Icon className={styles.icon} size={14} strokeWidth={2} />}
      {children}
    </span>
  );
}
