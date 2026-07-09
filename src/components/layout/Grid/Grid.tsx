interface GridProps {
  children: React.ReactNode;
  columns?: number;
}

export default function Grid({
  children,
  columns = 3,
}: GridProps) {
  return (
    <div 
      className="grid"
      style={{
        "--columns": columns
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}