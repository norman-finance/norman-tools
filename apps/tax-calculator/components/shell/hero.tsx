interface HeroProps {
  title: string;
  subtitle: string;
  cta?: {
    label: string;
    href: string;
  };
}

export function Hero({ title, subtitle, cta }: HeroProps) {
  return (
    <section className="tool-hero">
      <h1 className="tool-hero-title">{title}</h1>
      <p className="tool-hero-subtitle">{subtitle}</p>
      {cta ? (
        <a className="tool-hero-cta" href={cta.href} target="_blank" rel="noopener noreferrer">
          {cta.label}
        </a>
      ) : null}
    </section>
  );
}
