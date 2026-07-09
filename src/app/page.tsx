import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Forms/Input";
import Logo from "@/components/ui/Logo";
import StatusBadge from "@/components/ui/StatusBadge";


export default function Home() {
  return (
      <main>
      <h1>Morgans Portfolio</h1>
      <h2>Logo</h2>
      <Logo />
      <h2>Buttons</h2>
      <h3>Primary Button</h3>
      <div className="btn-row">
        <Button>Primary Button</Button>
        <Button href="#0">Primary Button - Link</Button>
        <Button disabled>Primary Button - Disabled</Button>
      </div>
      <h3>Outline Button</h3>
      <div className="btn-row">
        <Button variant="outline">Outline Button</Button>
        <Button variant="outline" href="#0">Outline - Link</Button>
        <Button variant="outline" disabled>Outline - Disabled</Button>
      </div>
      <h2>Card</h2>
      <Card><div><h3>I am a card</h3></div></Card>
      <h2>Status Badges</h2>
      <StatusBadge variant="success">Success</StatusBadge>
      <StatusBadge variant="warning">Warning</StatusBadge>
      <StatusBadge variant="error">Error</StatusBadge>
      <StatusBadge variant="info">Info</StatusBadge>
      <h2>Inputs</h2>
      <Input label="Text input" placeholder="placeholder" type="text" required />
      <Input label="Email input" placeholder="placeholder" type="email" />
      <Input label="Password input" placeholder="placeholder" type="password" />
      <Input label="Number input" placeholder="placeholder" type="number" />
      <Input label="Error input" placeholder="placeholder" type="text" error="Example error message" />
      </main>
  );
}
