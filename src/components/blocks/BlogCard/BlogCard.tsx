import { ArrowRight } from "lucide-react";
import styles from "./BlogCard.module.scss";
import Card from "../../ui/Card";
import ThemedImage from "../../ui/ThemedImage";
import type { BlogPostSummary } from "@/lib/blog";

type BlogCardProps = BlogPostSummary;

function formatDate(dateString: string) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogCard({
  title,
  slug,
  date,
  description,
  readingTime,
  thumbnail,
}: BlogCardProps) {
  return (
    <Card className={styles["card--post"]}>
      <div className={styles.meta}>
        <time className={styles.date} dateTime={date}>
          {formatDate(date)}
        </time>
        <span className={styles.readingTime}>{readingTime}</span>
      </div>
      <h2 className={styles.title}>{title}</h2>
      {thumbnail && (
        <div className={styles.thumbnail}>
          <ThemedImage light={thumbnail.light} dark={thumbnail.dark} alt="" />
        </div>
      )}
      <p className={styles.description}>{description}</p>
      <a href={`/blog/${slug}`} title={title} className={styles.link}>
        Read post <span className="sr-only">about {title}</span>
        <ArrowRight className={styles.linkIcon} size={16} aria-hidden="true" />
      </a>
    </Card>
  );
}
