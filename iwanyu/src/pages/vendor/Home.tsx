import { useMemo } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts'

export function VendorHome() {
  const data = useMemo(() => (
    [
      { name: 'Mon', sales: 320 },
      { name: 'Tue', sales: 280 },
      { name: 'Wed', sales: 420 },
      { name: 'Thu', sales: 380 },
      { name: 'Fri', sales: 520 },
      { name: 'Sat', sales: 610 },
      { name: 'Sun', sales: 480 },
    ]
  ), [])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Sales', value: '$12,340' },
          { label: 'Orders', value: '213' },
          { label: 'Inventory Alerts', value: '5' },
          { label: 'Payout Balance', value: '$3,420' },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-lg border bg-white p-4">
            <div className="text-sm text-neutral-600">{kpi.label}</div>
            <div className="text-2xl font-semibold">{kpi.value}</div>
          </div>
        ))}
      </div>
      <div className="rounded-lg border bg-white p-4">
        <h2 className="mb-3 font-medium">Weekly Sales</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="name" />
              <Tooltip />
              <Bar dataKey="sales" fill="#facc15" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

