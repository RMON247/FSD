import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useTheme } from '../../context/ThemeContext.jsx'

const COLORS = ['#4B63E8', '#0EA5A0', '#E8A23B', '#E8654B', '#5C8A3A', '#8EA9FF', '#6484F7', '#3B4ED0', '#E8654B', '#0EA5A0']

export default function CategoryValueChart({ data }) {
  const { theme } = useTheme()
  const gridColor = theme === 'dark' ? '#1C2941' : '#E2E8F0'
  const textColor = theme === 'dark' ? '#94A3B8' : '#64748B'
  const sorted = [...data].sort((a, b) => b.value - a.value)

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={sorted} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
        <XAxis type="number" tick={{ fill: textColor, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`} />
        <YAxis dataKey="category" type="category" width={110} tick={{ fill: textColor, fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip
          formatter={(value) => [`$${value.toLocaleString()}`, 'Inventory Value']}
          contentStyle={{
            background: theme === 'dark' ? '#151F35' : '#fff',
            border: `1px solid ${gridColor}`,
            borderRadius: 10,
            fontSize: 12,
            color: theme === 'dark' ? '#E2E8F0' : '#1E293B'
          }}
        />
        <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={14}>
          {sorted.map((entry, i) => (
            <Cell key={entry.category} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
