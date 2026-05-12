export function Toast({ toast }) {
  const borderColor = toast.type === 'success' ? 'border-l-green-500' : 'border-l-red-400'
  const textColor   = toast.type === 'success' ? 'text-green-300'    : 'text-red-300'

  return (
    <div
      className={`
        fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg text-[13px]
        bg-[#1C1C1F] border border-[#2A2A2D] border-l-4 ${borderColor} ${textColor}
        transition-all duration-200 pointer-events-none
        ${toast.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
    >
      {toast.msg}
    </div>
  )
}
