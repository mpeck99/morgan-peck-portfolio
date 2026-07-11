import { CodeXml } from "lucide-react";

type LogoProps = {
  width?: number;
};

const VIEWBOX_WIDTH = 138;
const VIEWBOX_HEIGHT = 92;

export default function Logo({ width = 104 }: LogoProps) {
  const height = width / (VIEWBOX_WIDTH / VIEWBOX_HEIGHT);

  return (
     <div className="logo logo--circle">
      <div className="inner">
        <span>MP</span>
      </div>
    </div>
  );
}
