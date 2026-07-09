import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";


export default function Home() {
  return (
      <main>
      <h1>Morgans Portfolio</h1>
      <h2>Buttons</h2>
      <Button>Primary Button</Button>
      <Button href="#0">Primary Button - Link</Button>
       <Button variant="secondary">Secondary Button</Button>
      <Button variant="secondary" href="#0">Secondary Button - Link</Button>
       <Button variant="outline">Outline Button</Button>
      <Button variant="outline" href="#0">Outline - Link</Button>
      <h2>Status Badges</h2>
      <StatusBadge variant="success">Success</StatusBadge>
      <StatusBadge variant="warning">Warning</StatusBadge>
      <StatusBadge variant="error">Error</StatusBadge>
      <StatusBadge variant="info">Info</StatusBadge>
      </main>
  );
}
