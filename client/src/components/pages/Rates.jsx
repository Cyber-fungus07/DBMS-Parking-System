import { Bike, CarFront, Truck } from 'lucide-react'

const RATE_DATA = [
  { type: 'Two-Wheeler',  price: 20,  icon: Bike,     color: '#00d4aa', examples: 'Bikes, Scooters, Mopeds' },
  { type: 'Four-Wheeler', price: 50,  icon: CarFront,  color: '#6c63ff', examples: 'Cars, SUVs, Sedans'       },
  { type: 'Heavy Vehicle',price: 100, icon: Truck,     color: '#ff6b6b', examples: 'Trucks, Buses, Tempos'    },
]

export function Rates() {
  return (
    <div className="page-in max-w-5xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h2 className="text-[24px] font-medium mb-1 serif-font">Parking Rates</h2>
        <p className="text-[13px] text-[var(--text-muted)]">Fee structure by vehicle type</p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4 mb-6">
        {RATE_DATA.map(({ type, price, icon: Icon, color, examples }) => (
          <div key={type} className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-sm p-6 shadow-sm">
            <div className="w-8 h-8 flex items-center justify-center bg-[var(--card-muted)] border border-[var(--card-border)]
                            rounded-sm mb-4 text-[var(--text-main)]">
              <Icon className="w-4 h-4" />
            </div>
            <div className="text-[15px] font-medium text-[var(--text-main)] mb-1 serif-font">{type}</div>
            <div className="text-[28px] font-medium mb-4 serif-font" style={{ color }}>
              ₹{price}<span className="text-[13px] text-[var(--text-muted)] font-normal font-sans">/hr</span>
            </div>
            <div className="text-[12px] text-[var(--text-muted)]">{examples}</div>
          </div>
        ))}
      </div>

      <div className="text-[12px] text-[var(--text-muted)] p-4 bg-[var(--card-muted)] border border-[var(--card-border)] rounded-sm">
        <strong className="text-[var(--text-main)]">Note:</strong> Fees are calculated from entry time to exit
        time. Reservations are charged based on booked duration. Minimum charge applies for first 30 minutes.
      </div>
    </div>
  )
}
