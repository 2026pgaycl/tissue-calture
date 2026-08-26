const tones: Record<string, string> = {
  neutral: "bg-[var(--color-bg)] text-[var(--color-text-muted)]",
  success: "bg-[#e6f4ec] text-[var(--color-accent)]",
  warn: "bg-[var(--color-warn-bg)] text-[var(--color-warn-text)]",
  danger: "bg-[var(--color-danger-bg)] text-[var(--color-danger)]",
};

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: keyof typeof tones;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
