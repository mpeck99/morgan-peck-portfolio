import type { ButtonProps } from "@/components/ui/Button";

// A CTA is the minimal config a component accepts to describe one
// call-to-action slot (mainly navigation via href, with onClick as a
// fallback) before it gets mapped onto an actual Button. Derived from
// ButtonProps so it stays in sync automatically — variant is dropped
// because the parent component (e.g. HeroBanner) decides that itself,
// and children becomes a plain label instead of JSX.
export type CTA = Omit<ButtonProps, "children" | "variant"> & {
  label: string;
};
