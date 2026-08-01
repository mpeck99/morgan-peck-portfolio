import type { LucideIcon } from "lucide-react";
import styles from "./Breadcrumbs.module.scss";

export type BreadcrumbsProps = {
  breadcrumbs: {
    path: string;
    title: string;
  }[];
  className?: string;
};

export default function Breadcrumbs({ breadcrumbs, className }: BreadcrumbsProps) {
  const breadcrumbClassname = [styles.breadcrumbs, className].filter(Boolean).join(" ");

  return (
    <nav className={breadcrumbClassname} aria-label="Breadcrumbs">
      <ol>
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          return (
            <li key={`${crumb.title}-${index}`}>
              {isLast ? (
                <span aria-current="page">{crumb.title}</span>
              ) : (
                <a href={crumb.path}>{crumb.title}</a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
