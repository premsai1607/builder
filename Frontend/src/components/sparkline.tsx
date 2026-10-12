import { useReducedMotion } from 'framer-motion'
import { memo } from 'react'
import { Line, LineChart, ResponsiveContainer } from 'recharts'

export const Sparkline = memo(function Sparkline({ data }: { data?: number[] }) {
  const reduce = useReducedMotion()
  const rows = (data ?? []).map((value, index) => ({ index, value }))
  if (rows.length < 2) return <span className="block h-9 w-16 shrink-0" aria-hidden />
  return (
    <div className="h-9 w-16 shrink-0" aria-hidden>
      <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 64, height: 36 }}>
        <LineChart data={rows}>
          <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={1.5} dot={false} isAnimationActive={!reduce} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
})
