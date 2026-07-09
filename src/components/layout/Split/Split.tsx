interface SplitProps {
  children: React.ReactNode;
}

export default function Split({
  children
}: SplitProps) {
  return (
    <div className="split">
      {children}
    </div>
  );
}