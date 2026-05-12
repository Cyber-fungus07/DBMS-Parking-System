export function EmptyState({ icon: Icon, message }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 px-6 text-center
                    bg-[#111113] border border-dashed border-[#2A2A2D] rounded-xl text-[#52525B]">
      {Icon && <Icon className="w-8 h-8 opacity-40" />}
      <p className="text-[13px]">{message}</p>
    </div>
  )
}

export function LoadingState() {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-[#52525B] text-[13px]">
      <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      Loading...
    </div>
  )
}
