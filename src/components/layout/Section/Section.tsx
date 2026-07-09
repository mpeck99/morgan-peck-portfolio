interface SectionProps {
    children: React.ReactNode;
    ariaLabel?: string;
    ariaLabelledby?: string;
}

export default function Section({ children, ariaLabel, ariaLabelledby }: SectionProps) {
    return (
        <section className="section" aria-label={ariaLabel} aria-labelledby={ariaLabelledby}>
            {children}
       </section>
    )
}