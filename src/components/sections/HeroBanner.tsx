import { Sparkles } from "lucide-react";
import styles from "./HeroBanner.module.scss";
import Button from "../ui/Button";
import type { CTA } from "@/types/action";
import Stack from "../layout/Stack/Stack";
import Badge from "../ui/Badge/Badge";

type HeroBannerProps = {
  eyebrow?: string;
  title: React.ReactNode;
  tagline?: string;
  description?: string;
  image?: string;
  primaryAction?: CTA;
  secondaryAction?: CTA;
};

export default function HeroBanner({
  eyebrow,
  title,
  tagline,
  description,
  image,
  primaryAction,
  secondaryAction,
}: HeroBannerProps) {
  return (
    <section className={styles["hero-banner"]}>
      <div className={styles["content"]}>
        {eyebrow && <Badge icon={Sparkles}>{eyebrow}</Badge>}
        <h1>{title}</h1>
        {tagline && <p className={styles["tagline"]}>{tagline}</p>}
        <Stack>
          {description && <p className={styles["description"]}>{description}</p>}

          {(primaryAction || secondaryAction) && (
            <div className="btn-row">
              {primaryAction && (
                <Button
                  variant="primary"
                  href={primaryAction.href}
                  onClick={primaryAction.onClick}
                  icon={primaryAction.icon}
                  iconPosition={primaryAction.iconPosition}
                >
                  {primaryAction.label}
                </Button>
              )}
              {secondaryAction && (
                <Button
                  variant="outline"
                  href={secondaryAction.href}
                  onClick={secondaryAction.onClick}
                  icon={secondaryAction.icon}
                  iconPosition={secondaryAction.iconPosition}
                >
                  {secondaryAction.label}
                </Button>
              )}
            </div>
          )}
        </Stack>
      </div>
      {image && (
        <div className={styles["image"]}>
          <img src={image} aria-hidden="true" />
        </div>
      )}
    </section>
  );
}
