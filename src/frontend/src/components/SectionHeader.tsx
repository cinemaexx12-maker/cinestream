interface SectionHeaderProps {
  title: string;
  label?: string;
  className?: string;
}

export default function SectionHeader({
  title,
  label,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={`flex items-center justify-between px-4 sm:px-8 mb-5 ${
        className ?? ""
      }`}
    >
      <div className="flex items-center gap-3">
        {label && <span className="ott-section-label">{label}</span>}
        <h2 className="ott-section-title">{title}</h2>
      </div>
      <span className="ott-see-all hidden sm:block">See All →</span>
    </div>
  );
}
