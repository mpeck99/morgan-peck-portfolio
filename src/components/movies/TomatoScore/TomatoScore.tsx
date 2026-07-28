import styles from "./TomatoScore.module.scss";

// Rotten Tomatoes' own threshold: 60%+ is "Fresh", under that is "Rotten".
// Only used for text color now — /public/tomato.png and /public/splat.png
// are both pre-colored PNGs (same 32x32 source size), so the icon itself
// no longer needs a color prop like the old inline SVG did.
const FRESH_THRESHOLD = 60;
const FRESH_COLOR = "#fa320a";
const ROTTEN_COLOR = "#6baa46";

type TomatoScoreProps = {
  score: string | null;
};

export default function TomatoScore({ score }: TomatoScoreProps) {
  if (!score) return null;

  const value = parseInt(score, 10);
  const isFresh = !Number.isNaN(value) && value >= FRESH_THRESHOLD;
  const color = isFresh ? FRESH_COLOR : ROTTEN_COLOR;

  return (
    <span className={styles["tomato-score"]} style={{ color }}>
      <img
        src={isFresh ? "/tomato.png" : "/splat.png"}
        alt=""
        width={32}
        height={32}
        className={styles["icon"]}
      />
      {score}
    </span>
  );
}
