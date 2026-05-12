import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

export function CustomSelect({ value, onChange, options, className = '' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find(o => o.value === value) || options[0]

  return (
    <div className={`relative ${className}`} ref={ref}>
      <div 
        className="input-base flex items-center justify-between cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <span className={!value && options[0]?.value === '' ? 'text-[var(--text-muted)]' : ''}>
          {selectedOption ? selectedOption.label : (options.length === 0 ? 'No options' : '')}
        </span>
        <ChevronDown className={`w-4 h-4 text-[var(--text-muted)] transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </div>

      {open && (
        <div className="absolute z-10 w-full mt-1 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-sm shadow-md py-1 max-h-60 overflow-auto page-in">
          {options.map((opt) => (
            <div
              key={opt.value}
              className={`px-3 py-2 text-[13px] cursor-pointer transition-colors
                ${value === opt.value ? 'bg-[var(--card-muted)] font-medium text-[var(--text-main)]' : 'text-[var(--text-main)] hover:bg-[var(--card-muted)]'}`}
              onClick={() => {
                onChange(opt.value)
                setOpen(false)
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
