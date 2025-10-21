'use client'

import { useState, useEffect } from 'react'
import { DailyScore } from '@/lib/db'

interface GraphViewProps {
  roomId: string
  userId: string
  partnerId: string
  userName?: string
  partnerName?: string
  onRefresh?: () => void
}

export default function GraphView({ roomId, userId, partnerId, userName, partnerName, onRefresh }: GraphViewProps) {
  const [scores, setScores] = useState<DailyScore[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadScores = async () => {
    if (!roomId) return
    try {
      setLoading(true)
      const response = await fetch(`/api/scores?roomId=${roomId}`)
      if (response.ok) {
        const data = await response.json()
        setScores(data.scores || [])
      } else {
        setError('Failed to load scores')
      }
    } catch (error) {
      console.error('Error loading scores:', error)
      setError('Failed to load scores')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadScores()
  }, [roomId])

  // Separate user and partner scores
  const userScores = scores.filter(score => score.user_id === userId)
  const partnerScores = scores.filter(score => score.user_id === partnerId)

  // Combine and sort all scores by date
  const allScores = [...userScores, ...partnerScores].sort((a, b) => 
    new Date(a.score_date).getTime() - new Date(b.score_date).getTime()
  )

  // Get date range for x-axis
  const dates = allScores.length > 0 ? 
    Array.from(new Set(allScores.map(score => score.score_date))).sort() : []

  // Calculate max score for y-axis scaling
  const maxScore = Math.max(
    ...allScores.map(score => score.score),
    10 // Minimum scale
  )

  // Generate SVG path for line graph
  const generatePath = (scores: DailyScore[], color: string) => {
    if (scores.length === 0) return ''
    
    const points = scores.map((score, index) => {
      const x = (index / Math.max(scores.length - 1, 1)) * 400
      const y = 200 - (score.score / maxScore) * 180
      return `${x},${y}`
    }).join(' L')
    
    return `M ${points}`
  }

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-lg p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-white text-lg">Loading graph...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-slate-800 rounded-lg p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-red-400 text-lg">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800 rounded-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          📈 Progress Graph
        </h2>
        {onRefresh && (
          <button
            onClick={() => {
              loadScores()
              onRefresh()
            }}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
            title="Refresh graph data"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="hidden sm:inline">Refresh</span>
          </button>
        )}
      </div>

      {/* Graph */}
      <div className="bg-slate-900 rounded-lg p-4 mb-4">
        <div className="relative">
          <svg width="100%" height="220" viewBox="0 0 420 220" className="overflow-visible">
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#374151" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Y-axis labels */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
              const value = Math.round(maxScore * ratio)
              const y = 200 - (ratio * 180)
              return (
                <g key={index}>
                  <line x1="20" y1={y} x2="400" y2={y} stroke="#4B5563" strokeWidth="0.5" strokeDasharray="2,2"/>
                  <text x="15" y={y + 4} textAnchor="end" className="text-xs fill-slate-400">
                    {value}
                  </text>
                </g>
              )
            })}
            
            {/* X-axis labels */}
            {dates.slice(0, 8).map((date, index) => {
              const x = (index / Math.max(dates.length - 1, 1)) * 400 + 20
              return (
                <text key={date} x={x} y="215" textAnchor="middle" className="text-xs fill-slate-400">
                  {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </text>
              )
            })}
            
            {/* User line */}
            {userScores.length > 0 && (
              <g>
                <path
                  d={generatePath(userScores, '#3B82F6')}
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {userScores.map((score, index) => {
                  const x = (index / Math.max(userScores.length - 1, 1)) * 400 + 20
                  const y = 200 - (score.score / maxScore) * 180
                  return (
                    <circle
                      key={score.id}
                      cx={x}
                      cy={y}
                      r="4"
                      fill="#3B82F6"
                      className="hover:r-6 transition-all cursor-pointer"
                    />
                  )
                })}
              </g>
            )}
            
            {/* Partner line */}
            {partnerScores.length > 0 && (
              <g>
                <path
                  d={generatePath(partnerScores, '#10B981')}
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {partnerScores.map((score, index) => {
                  const x = (index / Math.max(partnerScores.length - 1, 1)) * 400 + 20
                  const y = 200 - (score.score / maxScore) * 180
                  return (
                    <circle
                      key={score.id}
                      cx={x}
                      cy={y}
                      r="4"
                      fill="#10B981"
                      className="hover:r-6 transition-all cursor-pointer"
                    />
                  )
                })}
              </g>
            )}
          </svg>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-blue-500"></div>
          <span className="text-slate-300">{userName || 'You'}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-green-500"></div>
          <span className="text-slate-300">{partnerName || 'Partner'}</span>
        </div>
      </div>

      {/* Data summary */}
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="bg-slate-700 rounded-lg p-3">
          <div className="text-blue-400 font-semibold mb-1">{userName || 'You'}</div>
          <div className="text-slate-300">
            Latest: {userScores.length > 0 ? userScores[userScores.length - 1].score.toFixed(2) : 'N/A'}
          </div>
          <div className="text-slate-400 text-xs">
            {userScores.length} data points
          </div>
        </div>
        <div className="bg-slate-700 rounded-lg p-3">
          <div className="text-green-400 font-semibold mb-1">{partnerName || 'Partner'}</div>
          <div className="text-slate-300">
            Latest: {partnerScores.length > 0 ? partnerScores[partnerScores.length - 1].score.toFixed(2) : 'N/A'}
          </div>
          <div className="text-slate-400 text-xs">
            {partnerScores.length} data points
          </div>
        </div>
      </div>
    </div>
  )
}
