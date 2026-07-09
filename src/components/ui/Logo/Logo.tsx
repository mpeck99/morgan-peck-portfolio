type LogoProps = {
  width?: number;
};

const VIEWBOX_WIDTH = 162;
const VIEWBOX_HEIGHT = 96;

export default function Logo({ width = 120 }: LogoProps) {
  const height = width / (VIEWBOX_WIDTH / VIEWBOX_HEIGHT);

  return (
    <svg
      width={width}
      height={height}
      viewBox="259 92 162 96"
      role="img"
    >
      <title>Morgan Peck</title>
      <path
        d="M285 100 L267 140 L285 180"
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M395 100 L413 140 L395 180"
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x={340}
        y={140}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={48}
        fontWeight={600}
        fontFamily="var(--font-heading)"
        fill="var(--color-text-primary)"
      >
        MP
      </text>
    </svg>
  );
}
