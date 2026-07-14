interface SiteFooterProps {
  appSlug: string;
  repoUrl: string;
}

export function SiteFooter({ appSlug, repoUrl }: SiteFooterProps) {
  return (
    <footer className="tool-footer">
      <div className="tool-footer-links">
        <a
          href={`https://norman.finance/?utm_source=github&utm_medium=free_tools&utm_campaign=${appSlug}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          norman.finance
        </a>
        <a href={repoUrl} target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        <a href="https://norman.finance/impressum" target="_blank" rel="noopener noreferrer">
          Impressum
        </a>
      </div>
      <p className="tool-footer-tagline">Make business effortless</p>
    </footer>
  );
}
