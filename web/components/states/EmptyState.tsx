export function EmptyState({ title, body, action }: {
  title: string; body: string; action?: { label: string; onClick?: () => void; href?: string };
}) {
  return (
    <div className="rounded-panel border border-dashed border-line-2 bg-card px-5 py-16 text-center">
      <h3 className="font-display text-h3">{title}</h3>
      <p className="mx-auto mb-5 mt-2 max-w-[44ch] text-ink-3">{body}</p>
      {action && (action.href
        ? <a href={action.href} className="rounded-control bg-gold px-6 py-3 font-semibold text-[#2A1E07]">{action.label}</a>
        : <button onClick={action.onClick} className="rounded-control bg-gold px-6 py-3 font-semibold text-[#2A1E07]">{action.label}</button>)}
    </div>
  );
}
