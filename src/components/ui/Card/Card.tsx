import styles from "./Card.module.scss";

type CardProps = {
  children: React.ReactNode;
};

export default function Card({ children }: CardProps) {
  return <article className={styles.card}>{children}</article>;
}