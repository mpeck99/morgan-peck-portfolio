import type { LucideIcon } from "lucide-react";
import styles from "./Badge.module.scss";

export type BadgeProps = {
  children: React.ReactNode;
  icon?: LucideIcon;
  className?: string;
  solid?: boolean;
};

export default function Badge({ children, icon: Icon, className, solid }: BadgeProps) {
  const badgeClassName = [styles.badge, solid && styles["badge--solid"], className]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={badgeClassName}>
      {Icon && <Icon className={styles.icon} size={14} strokeWidth={2} />}
      {children}
    </span>
  );
}
