'use client'

import { useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import type { ScoreTimelinePoint } from '@/lib/db'

interface ScoreGraphProps {
  scores: ScoreTimelinePoint[]
  userId: string
  partnerId?: string
  userName?: string
  partnerName?: string
}

export default function ScoreGraph({ scores, userId, partnerId, userName, partnerName }: ScoreGraphProps) {
  // Prepare timeline maps for each user
  const { userScores, partnerScores, allDates, maxScore, hasData } = useMemo(() => {
    const datesSet = new Set<string>()
    const perUserTimeline = new Map<string, Map<string, number>>()
    let max = 0
    let hasData = false

    scores.forEach(point => {
      const dateStr = typeof point.score_date === 'string'
        ? point.score_date
        : point.score_date.toISOString().split('T')[0]

      datesSet.add(dateStr)

      const userMap = perUserTimeline.get(point.user_id) ?? new Map<string, number>()
      const cumulativeScore = point.cumulative_score ?? 0
      userMap.set(dateStr, cumulativeScore)
      perUserTimeline.set(point.user_id, userMap)

      if ((point.daily_score ?? 0) !== 0) {
        hasData = true
      }
      max = Math.max(max, cumulativeScore)
    })

    const sortedDates = Array.from(datesSet).sort()

    const getTimeline = (id?: string) => {
      if (!id) return new Map<string, number>()
      return perUserTimeline.get(id) ?? new Map<string, number>()
    }

    return {
      userScores: getTimeline(userId),
      partnerScores: getTimeline(partnerId),
      allDates: sortedDates,
      maxScore: max,
      hasData
    }
  }, [scores, userId, partnerId])

  if (!hasData || allDates.length === 0) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 text-center">
        <p className="text-slate-400">No score data available yet. Start pushing to see your progress!</p>
      </div>
    )
  }

  // Calculate graph dimensions
  const width = Math.max(800, allDates.length * 60)
  const height = 400
  const padding = { top: 40, right: 40, bottom: 80, left: 60 }
  const graphWidth = width - padding.left - padding.right
  const graphHeight = height - padding.top - padding.bottom

  // Scale functions
  const xScale = (index: number) => padding.left + (index / Math.max(allDates.length - 1, 1)) * graphWidth
  const yScale = (value: number) => height - padding.bottom - (value / (maxScore || 1)) * graphHeight

  // Generate path for line chart
  const generatePath = (scoresMap: Map<string, number>) => {
    if (allDates.length === 0) return ''

    return allDates
      .map((date, index) => {
        const score = scoresMap.get(date) || 0
        const x = xScale(index)
        const y = yScale(score)
        return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
      })
      .join(' ')
  }

  const userPath = generatePath(userScores)
  const partnerPath = generatePath(partnerScores)

  // Generate Y-axis labels
  const yAxisLabels = []
  const numLabels = 5
  for (let i = 0; i <= numLabels; i++) {
    const value = (maxScore / numLabels) * i
    yAxisLabels.push({
      value: value.toFixed(1),
      y: yScale(value)
    })
  }

  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <h3 className="text-xl font-bold text-white mb-4">📈 Progress Over Time</h3>
      
      <div className="overflow-x-auto">
        <svg width={width} height={height} className="bg-slate-700 rounded">
          {/* Grid lines */}
          {yAxisLabels.map((label, i) => (
            <g key={i}>
              <line
                x1={padding.left}
                y1={label.y}
                x2={width - padding.right}
                y2={label.y}
                stroke="#475569"
                strokeWidth="1"
                strokeDasharray="4"
              />
              <text
                x={padding.left - 10}
                y={label.y}
                textAnchor="end"
                alignmentBaseline="middle"
                fill="#94a3b8"
                fontSize="12"
              >
                {label.value}
              </text>
            </g>
          ))}

          {/* X-axis */}
          <line
            x1={padding.left}
            y1={height - padding.bottom}
            x2={width - padding.right}
            y2={height - padding.bottom}
            stroke="#94a3b8"
            strokeWidth="2"
          />

          {/* Y-axis */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={height - padding.bottom}
            stroke="#94a3b8"
            strokeWidth="2"
          />

          {/* Partner line (drawn first so user line is on top) */}
          {partnerId && partnerPath && (
            <>
              <path
                d={partnerPath}
                fill="none"
                stroke="#22c55e"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Partner data points */}
              {allDates.map((date, index) => {
                const score = partnerScores.get(date)
                if (score === undefined) return null
                return (
                  <circle
                    key={`partner-${index}`}
                    cx={xScale(index)}
                    cy={yScale(score)}
                    r="5"
                    fill="#22c55e"
                    stroke="#15803d"
                    strokeWidth="2"
                  >
                    <title>{`${partnerName || 'Partner'}: ${score.toFixed(2)} on ${format(parseISO(date), 'MMM d')}`}</title>
                  </circle>
                )
              })}
            </>
          )}

          {/* User line */}
          {userPath && (
            <>
              <path
                d={userPath}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* User data points */}
              {allDates.map((date, index) => {
                const score = userScores.get(date)
                if (score === undefined) return null
                return (
                  <circle
                    key={`user-${index}`}
                    cx={xScale(index)}
                    cy={yScale(score)}
                    r="5"
                    fill="#3b82f6"
                    stroke="#1e40af"
                    strokeWidth="2"
                  >
                    <title>{`${userName || 'You'}: ${score.toFixed(2)} on ${format(parseISO(date), 'MMM d')}`}</title>
                  </circle>
                )
              })}
            </>
          )}

          {/* X-axis labels */}
          {allDates.map((date, index) => {
            // Show every nth label to avoid crowding
            const showEvery = Math.max(1, Math.floor(allDates.length / 10))
            if (index % showEvery !== 0 && index !== allDates.length - 1) return null
            
            return (
              <text
                key={`label-${index}`}
                x={xScale(index)}
                y={height - padding.bottom + 20}
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="12"
                transform={`rotate(-45, ${xScale(index)}, ${height - padding.bottom + 20})`}
              >
                {format(parseISO(date), 'MMM d')}
              </text>
            )
          })}

          {/* Y-axis label */}
          <text
            x={padding.left - 40}
            y={height / 2}
            textAnchor="middle"
            fill="#94a3b8"
            fontSize="14"
            fontWeight="bold"
            transform={`rotate(-90, ${padding.left - 40}, ${height / 2})`}
          >
            Cumulative Score
          </text>

          {/* X-axis label */}
          <text
            x={width / 2}
            y={height - 10}
            textAnchor="middle"
            fill="#94a3b8"
            fontSize="14"
            fontWeight="bold"
          >
            Date
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-1 bg-blue-500 rounded"></div>
          <span className="text-slate-300">{userName || 'You'}</span>
        </div>
        {partnerId && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-green-500 rounded"></div>
            <span className="text-slate-300">{partnerName || 'Partner'}</span>
          </div>
        )}
      </div>
    </div>
  )
}
