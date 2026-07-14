import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function SectionHeading({ title, subtitle, className }: SectionHeadingProps) {
  return (
    <div className={cn("germany-section-header", className)}>
      <h2 className="germany-section-title">{title}</h2>
      {subtitle ? <p className="germany-section-subtitle">{subtitle}</p> : null}
    </div>
  );
}
