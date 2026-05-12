export function EmptyState({ icon: Icon, message }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 px-6 text-center
                    bg-[var(--card-bg)] border border-dashed border-[var(--card-border)] rounded-sm text-[var(--text-muted)]">
      {Icon && <Icon className="w-8 h-8 opacity-40 text-[var(--text-main)]" />}
      <p className="text-[13px]">{message}</p>
    </div>
  )
}

export function LoadingState() {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-[var(--text-muted)] text-[13px]">
      <div className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      Loading...
    </div>
  )
}
