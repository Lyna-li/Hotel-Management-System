import React from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { name: 'Mon', occupancy: 72 },
  { name: 'Tue', occupancy: 68 },
  { name: 'Wed', occupancy: 85 },
  { name: 'Thu', occupancy: 78 },
  { name: 'Fri', occupancy: 92 },
  { name: 'Sat', occupancy: 95 },
  { name: 'Sun', occupancy: 88 }
]

export const OccupancyChart = () => {
  return (
    <div
      className="bg-card rounded-xl border border-border/50 shadow-sm p-6 animate-slide-up"
      style={{ animationDelay: '200ms' }}
    >
      <div className="mb-6">
        <h3 className="font-display text-lg font-semibold text-foreground">
          Weekly Occupancy
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Room occupancy rate this week
        </p>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorOccupancy" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(38, 90%, 50%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(38, 90%, 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(220, 20%, 88%)"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(220, 15%, 45%)', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(220, 15%, 45%)', fontSize: 12 }}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(0, 0%, 100%)',
                border: '1px solid hsl(220, 20%, 88%)',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value) => [`${value}%`, 'Occupancy']}
            />
            <Area
              type="monotone"
              dataKey="occupancy"
              stroke="hsl(38, 90%, 50%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorOccupancy)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
