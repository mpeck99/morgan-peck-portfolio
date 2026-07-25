import styles from "./Card.module.scss";
import clsx from "clsx";

export type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Card({ children, className }: CardProps) {
  return <article className={clsx(styles.card, className)}>{children}</article>;
}
