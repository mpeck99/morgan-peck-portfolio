import styles from "./ThemedImage.module.scss";
import type { ThemedImage as ThemedImageType } from "@/lib/blog";

type ThemedImageProps = ThemedImageType & {
  alt: string;
  className?: string;
};

export default function ThemedImage({ light, dark, alt, className }: ThemedImageProps) {
  const combinedClassName = className ? `${styles.image} ${className}` : styles.image;

  return (
    <>
      <img
        src={dark}
        alt={alt}
        className={`${combinedClassName} theme-dark-only`}
      />
      <img
        src={light}
        alt={alt}
        className={`${combinedClassName} theme-light-only`}
      />
    </>
  );
}
