import { useMemo } from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip, Legend } from 'recharts'

export function AdminHome() {
  const data = useMemo(() => (
    [
      { name: 'Jan', vendors: 20, orders: 320, revenue: 4200 },
      { name: 'Feb', vendors: 24, orders: 280, revenue: 3800 },
      { name: 'Mar', vendors: 28, orders: 420, revenue: 5600 },
      { name: 'Apr', vendors: 30, orders: 380, revenue: 5200 },
    ]
  ), [])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Vendors', value: '134' },
          { label: 'Products', value: '1,928' },
          { label: 'Orders', value: '12,431' },
          { label: 'Revenue', value: '$523k' },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-lg border bg-white p-4">
            <div className="text-sm text-neutral-600">{kpi.label}</div>
            <div className="text-2xl font-semibold">{kpi.value}</div>
          </div>
        ))}
      </div>
      <div className="rounded-lg border bg-white p-4">
        <h2 className="mb-3 font-medium">Platform Trends</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="name" />
              <Tooltip />
              <Legend />
              <Line dataKey="vendors" stroke="#fbbf24" strokeWidth={2} />
              <Line dataKey="orders" stroke="#2563eb" strokeWidth={2} />
              <Line dataKey="revenue" stroke="#16a34a" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

