import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useTheme } from '../../context/ThemeContext.jsx'

export default function StockTrendChart({ data }) {
  const { theme } = useTheme()
  const gridColor = theme === 'dark' ? '#1C2941' : '#E2E8F0'
  const textColor = theme === 'dark' ? '#94A3B8' : '#64748B'

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0EA5A0" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#0EA5A0" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4B63E8" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#4B63E8" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        <XAxis dataKey="month" tick={{ fill: textColor, fontSize: 12 }} axisLine={{ stroke: gridColor }} tickLine={false} />
        <YAxis tick={{ fill: textColor, fontSize: 12 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{
            background: theme === 'dark' ? '#151F35' : '#fff',
            border: `1px solid ${gridColor}`,
            borderRadius: 10,
            fontSize: 12,
            color: theme === 'dark' ? '#E2E8F0' : '#1E293B'
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: textColor }} />
        <Area type="monotone" dataKey="in" name="Stock In" stroke="#0EA5A0" strokeWidth={2} fill="url(#colorIn)" />
        <Area type="monotone" dataKey="out" name="Stock Out" stroke="#4B63E8" strokeWidth={2} fill="url(#colorOut)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
