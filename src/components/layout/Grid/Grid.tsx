interface GridProps {
  children: React.ReactNode;
}

export default function Grid({ children }: GridProps) {
  return <div className="grid">{children}</div>;
}
