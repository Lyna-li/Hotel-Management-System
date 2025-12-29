import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API_BASE_URL = 'http://localhost:5000';

function getWeekDays() {
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
}

function getDayName(date) {
  return getWeekDays()[date.getDay() === 0 ? 6 : date.getDay() - 1];
}

export const OccupancyChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/reservations`)
      .then(res => res.json())
      .then(reservations => {
        // 1. Get this week's dates
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7)); // Monday

        const weekDates = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(weekStart);
          d.setDate(weekStart.getDate() + i);
          return d;
        });

        // 2. Count occupied rooms per day
        const occupancyByDay = weekDates.map(date => {
          const dayName = getDayName(date);
          // Count reservations that overlap this date
          const count = reservations.filter(r => {
            const start = new Date(r.date_debut);
            const end = new Date(r.date_fin);
            return start <= date && end >= date;
          }).length;
          return { name: dayName, occupancy: count };
        });

        setData(occupancyByDay);
      });
  }, []);

  return (
    <div className="bg-card rounded-xl border border-border/50 shadow-sm p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
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
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 88%)" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(220, 15%, 45%)', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(220, 15%, 45%)', fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(0, 0%, 100%)',
                border: '1px solid hsl(220, 20%, 88%)',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value) => [`${value}`, 'Occupancy']}
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
  );
};