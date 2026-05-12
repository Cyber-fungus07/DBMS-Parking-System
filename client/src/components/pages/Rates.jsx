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
        <h2 className="text-[18px] font-medium mb-1">Parking Rates</h2>
        <p className="text-[13px] text-[#52525B]">Fee structure by vehicle type</p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4 mb-6">
        {RATE_DATA.map(({ type, price, icon: Icon, color, examples }) => (
          <div key={type} className="bg-[#111113] border border-[#1E1E21] rounded-xl p-6">
            <div className="w-8 h-8 flex items-center justify-center bg-[#1C1C1F] border border-[#2A2A2D]
                            rounded-md mb-4 text-[#A1A1AA]">
              <Icon className="w-4 h-4" />
            </div>
            <div className="text-[13px] font-medium text-white mb-1">{type}</div>
            <div className="text-[24px] font-medium mb-4" style={{ color }}>
              ₹{price}<span className="text-[13px] text-[#52525B] font-normal">/hr</span>
            </div>
            <div className="text-[12px] text-[#A1A1AA]">{examples}</div>
          </div>
        ))}
      </div>

      <div className="text-[12px] text-[#52525B] p-4 bg-[#1C1C1F] border border-[#1E1E21] rounded-lg">
        <strong className="text-[#A1A1AA]">Note:</strong> Fees are calculated from entry time to exit
        time. Reservations are charged based on booked duration. Minimum charge applies for first 30 minutes.
      </div>
    </div>
  )
}
