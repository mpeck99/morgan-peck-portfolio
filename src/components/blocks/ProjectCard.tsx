import styles from "./ProjectCard.module.scss";
import Card from "../ui/Card";
import { MoveRight } from "lucide-react";

type ProjectCardProps = {
  title: string;
  icon?: React.ReactNode;
  description?: string;
  image?: {
    url: string;
    alt: string;
  };
  link?: {
    title: string;
    url: string;
  };
  index?: number;
};

export default function ProjectCard({
  title,
  icon,
  description,
  image,
  link,
  index,
}: ProjectCardProps) {
  return (
    <Card className={styles["card--project"]}>
      {icon && <div className={styles.icon}>{icon}</div>}
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {image && <img src={image.url} alt={image.alt} className={styles["image"]} />}
      {link && (
        <a href={link.url} title={link.title} className={styles.link}>
          {link.title} <MoveRight />
        </a>
      )}
      {index !== undefined && (
        <span className={styles.index}>{String(index + 1).padStart(2, "0")}</span>
      )}
    </Card>
  );
}
