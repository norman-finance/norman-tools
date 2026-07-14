interface CtaBannerProps {
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  id?: string;
}

export function CtaBanner({ title, subtitle, ctaLabel, ctaHref, id }: CtaBannerProps) {
  return (
    <section id={id} className="germany-cta-section">
      <div className="germany-cta-content">
        <h2 className="germany-cta-title">{title}</h2>
        <p className="germany-cta-subtitle">{subtitle}</p>
        <a href={ctaHref} className="germany-cta-button" target="_blank" rel="noopener noreferrer">
          {ctaLabel}
        </a>
      </div>
    </section>
  );
}
