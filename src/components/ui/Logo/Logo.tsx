import { CodeXml } from "lucide-react";

type LogoProps = {
  width?: number;
};

const VIEWBOX_WIDTH = 138;
const VIEWBOX_HEIGHT = 92;

export default function Logo({ width = 104 }: LogoProps) {
  const height = width / (VIEWBOX_WIDTH / VIEWBOX_HEIGHT);

  return (
    <div className="logo">
      <CodeXml stroke="var(--color-primary)" />
      <span>Morgan Peck</span>
    </div>
    // <svg
    //   width={width}
    //   height={height}
    //   viewBox="271 94 138 92"
    //   role="img"
    // >
    //   <title>Morgan Peck</title>
    //   <path
    //     d="M298 106 L283 140 L298 174"
    //     fill="none"
    //     stroke="var(--color-primary)"
    //     strokeWidth={2}
    //     strokeLinecap="round"
    //     strokeLinejoin="round"
    //   />
    //   <path
    //     d="M382 106 L397 140 L382 174"
    //     fill="none"
    //     stroke="var(--color-primary)"
    //     strokeWidth={2}
    //     strokeLinecap="round"
    //     strokeLinejoin="round"
    //   />
    //   <text
    //     x={340}
    //     y={140}
    //     textAnchor="middle"
    //     dominantBaseline="central"
    //     fontSize={44}
    //     fontWeight={600}
    //     fontFamily="var(--font-heading)"
    //     fill="var(--color-text-primary)"
    //   >
    //     MP
    //   </text>
    // </svg>

  );
}
