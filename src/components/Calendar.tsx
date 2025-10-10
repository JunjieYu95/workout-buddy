'use client'

import { useState } from 'react'
import { 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  format,
  isSameDay,
  addWeeks,
  addMonths,
  addQuarters,
  addYears,
  subWeeks,
  subMonths,
  subQuarters,
  subYears,
  isToday,
  isSameMonth,
} from 'date-fns'
import { WorkoutRequest } from '@/lib/supabase'

type ViewMode = 'week' | 'month' | 'quarter' | 'year'

interface CalendarProps {
  userWorkouts: WorkoutRequest[]
  partnerWorkouts: WorkoutRequest[]
  demoMode?: boolean
}

export default function Calendar({ userWorkouts, partnerWorkouts, demoMode }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('week')

  const getWorkoutForDate = (workouts: WorkoutRequest[], date: Date) => {
    return workouts.find(w => isSameDay(new Date(w.workout_date), date))
  }

  const getIntensityColor = (intensity?: number) => {
    if (!intensity) return 'bg-gray-700 text-gray-500'
    if (intensity <= 2) return 'bg-yellow-600 text-white'
    if (intensity === 3) return 'bg-green-600 text-white'
    return 'bg-blue-600 text-white'
  }

  const navigatePrevious = () => {
    switch (viewMode) {
      case 'week':
        setCurrentDate(subWeeks(currentDate, 1))
        break
      case 'month':
        setCurrentDate(subMonths(currentDate, 1))
        break
      case 'quarter':
        setCurrentDate(subQuarters(currentDate, 1))
        break
      case 'year':
        setCurrentDate(subYears(currentDate, 1))
        break
    }
  }

  const navigateNext = () => {
    switch (viewMode) {
      case 'week':
        setCurrentDate(addWeeks(currentDate, 1))
        break
      case 'month':
        setCurrentDate(addMonths(currentDate, 1))
        break
      case 'quarter':
        setCurrentDate(addQuarters(currentDate, 1))
        break
      case 'year':
        setCurrentDate(addYears(currentDate, 1))
        break
    }
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const renderWeekView = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 })
    const end = endOfWeek(currentDate, { weekStartsOn: 1 })
    const days = eachDayOfInterval({ start, end })

    return (
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const userWorkout = getWorkoutForDate(userWorkouts, day)
          const partnerWorkout = getWorkoutForDate(partnerWorkouts, day)
          const isCurrentDay = isToday(day)

          return (
            <div key={day.toISOString()} className="text-center">
              <div className={`text-xs mb-2 font-semibold ${isCurrentDay ? 'text-blue-400' : 'text-gray-400'}`}>
                {format(day, 'EEE')}
              </div>
              <div className={`text-sm mb-2 ${isCurrentDay ? 'text-blue-400 font-bold' : 'text-gray-300'}`}>
                {format(day, 'd')}
              </div>
              <div className="space-y-1">
                {/* Your workout */}
                <div
                  className={`h-12 rounded flex items-center justify-center text-xs font-semibold ${getIntensityColor(userWorkout?.intensity)}`}
                  title={`Your workout: ${userWorkout ? `${userWorkout.intensity}/5${userWorkout.notes ? ` - ${userWorkout.notes}` : ''}` : 'No workout'}`}
                >
                  {userWorkout ? `${userWorkout.intensity}/5` : '-'}
                </div>
                {/* Partner's workout */}
                <div
                  className={`h-12 rounded flex items-center justify-center text-xs font-semibold ${getIntensityColor(partnerWorkout?.intensity)}`}
                  title={`Partner's workout: ${partnerWorkout ? `${partnerWorkout.intensity}/5${partnerWorkout.notes ? ` - ${partnerWorkout.notes}` : ''}` : 'No workout'}`}
                >
                  {partnerWorkout ? `${partnerWorkout.intensity}/5` : '-'}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const renderMonthView = () => {
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)
    const days = eachDayOfInterval({ start, end })

    // Add padding for days before month starts
    const firstDayOfWeek = start.getDay()
    const paddingDays = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1

    return (
      <div className="grid grid-cols-7 gap-2">
        {/* Day headers */}
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
          <div key={day} className="text-center text-xs font-semibold text-gray-400 mb-2">
            {day}
          </div>
        ))}
        
        {/* Padding days */}
        {Array.from({ length: paddingDays }).map((_, i) => (
          <div key={`padding-${i}`} className="h-20"></div>
        ))}
        
        {/* Month days */}
        {days.map((day) => {
          const userWorkout = getWorkoutForDate(userWorkouts, day)
          const partnerWorkout = getWorkoutForDate(partnerWorkouts, day)
          const isCurrentDay = isToday(day)

          return (
            <div 
              key={day.toISOString()} 
              className={`h-20 rounded p-1 ${isCurrentDay ? 'ring-2 ring-blue-400' : ''} bg-gray-800`}
            >
              <div className={`text-xs mb-1 ${isCurrentDay ? 'text-blue-400 font-bold' : 'text-gray-400'}`}>
                {format(day, 'd')}
              </div>
              <div className="flex gap-1">
                <div 
                  className={`flex-1 h-6 rounded text-xs flex items-center justify-center ${getIntensityColor(userWorkout?.intensity)}`}
                  title={userWorkout ? `You: ${userWorkout.intensity}/5` : 'You: No workout'}
                >
                  {userWorkout ? userWorkout.intensity : ''}
                </div>
                <div 
                  className={`flex-1 h-6 rounded text-xs flex items-center justify-center ${getIntensityColor(partnerWorkout?.intensity)}`}
                  title={partnerWorkout ? `Partner: ${partnerWorkout.intensity}/5` : 'Partner: No workout'}
                >
                  {partnerWorkout ? partnerWorkout.intensity : ''}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const renderQuarterView = () => {
    const start = startOfQuarter(currentDate)
    const end = endOfQuarter(currentDate)
    const months = eachMonthOfInterval({ start, end })

    return (
      <div className="grid grid-cols-3 gap-4">
        {months.map((month) => {
          const monthStart = startOfMonth(month)
          const monthEnd = endOfMonth(month)
          const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
          
          const userWorkoutsThisMonth = days.filter(day => getWorkoutForDate(userWorkouts, day)).length
          const partnerWorkoutsThisMonth = days.filter(day => getWorkoutForDate(partnerWorkouts, day)).length

          return (
            <div key={month.toISOString()} className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4">{format(month, 'MMMM')}</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-blue-400 mb-1">You</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(userWorkoutsThisMonth / days.length) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-white text-sm">{userWorkoutsThisMonth}/{days.length}</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-green-400 mb-1">Partner</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${(partnerWorkoutsThisMonth / days.length) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-white text-sm">{partnerWorkoutsThisMonth}/{days.length}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const renderYearView = () => {
    const start = startOfYear(currentDate)
    const end = endOfYear(currentDate)
    const months = eachMonthOfInterval({ start, end })

    return (
      <div className="grid grid-cols-4 gap-3">
        {months.map((month) => {
          const monthStart = startOfMonth(month)
          const monthEnd = endOfMonth(month)
          const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
          
          const userWorkoutsThisMonth = days.filter(day => getWorkoutForDate(userWorkouts, day)).length
          const partnerWorkoutsThisMonth = days.filter(day => getWorkoutForDate(partnerWorkouts, day)).length
          const isCurrentMonth = isSameMonth(month, new Date())

          return (
            <div 
              key={month.toISOString()} 
              className={`bg-gray-800 rounded-lg p-3 ${isCurrentMonth ? 'ring-2 ring-blue-400' : ''}`}
            >
              <h4 className="text-sm font-semibold text-white mb-2">{format(month, 'MMM')}</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-xs text-gray-300">{userWorkoutsThisMonth}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-300">{partnerWorkoutsThisMonth}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const getViewTitle = () => {
    switch (viewMode) {
      case 'week':
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`
      case 'month':
        return format(currentDate, 'MMMM yyyy')
      case 'quarter':
        return `Q${Math.floor(currentDate.getMonth() / 3) + 1} ${format(currentDate, 'yyyy')}`
      case 'year':
        return format(currentDate, 'yyyy')
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">
          📅 {getViewTitle()}
        </h2>
        <div className="flex items-center gap-3">
          {/* View mode selector */}
          <div className="flex bg-gray-700 rounded-lg p-1">
            {(['week', 'month', 'quarter', 'year'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === mode
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
          
          {/* Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={navigatePrevious}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded"
            >
              ←
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
            >
              Today
            </button>
            <button
              onClick={navigateNext}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded"
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* Calendar content */}
      {viewMode === 'week' && renderWeekView()}
      {viewMode === 'month' && renderMonthView()}
      {viewMode === 'quarter' && renderQuarterView()}
      {viewMode === 'year' && renderYearView()}

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-600 rounded"></div>
            <span className="text-gray-300">You</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-600 rounded"></div>
            <span className="text-gray-300">Partner</span>
          </div>
          <span className="text-gray-500">|</span>
          <span className="text-gray-400 text-xs">
            Color: Yellow (1-2) → Green (3) → Blue (4-5)
          </span>
        </div>
      </div>
    </div>
  )
}
