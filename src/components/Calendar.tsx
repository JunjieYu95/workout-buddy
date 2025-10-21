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
import { WorkoutRequest } from '@/lib/db'

type ViewMode = 'week' | 'month' | 'quarter' | 'year'

interface CalendarProps {
  userWorkouts: WorkoutRequest[]
  partnerWorkouts: WorkoutRequest[]
  userName?: string
  partnerName?: string
  demoMode?: boolean
  onRefresh?: () => void
}

interface DayDetailsProps {
  date: Date
  userWorkout?: WorkoutRequest
  partnerWorkout?: WorkoutRequest
  userName?: string
  partnerName?: string
  onClose: () => void
}

function DayDetails({ date, userWorkout, partnerWorkout, userName, partnerName, onClose }: DayDetailsProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-white">{format(date, 'EEEE, MMMM d, yyyy')}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>
        
        <div className="space-y-4">
          {/* User's workout */}
          <div className="bg-slate-700 rounded-lg p-4">
            <h4 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
              <span>👤</span> {userName || 'You'}
            </h4>
            {userWorkout ? (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-white font-bold text-lg">Intensity: {userWorkout.intensity}/5</span>
                  <span className="text-2xl">
                    {userWorkout.intensity === 1 && '😴'}
                    {userWorkout.intensity === 2 && '🚶'}
                    {userWorkout.intensity === 3 && '💪'}
                    {userWorkout.intensity === 4 && '🔥'}
                    {userWorkout.intensity === 5 && '⚡'}
                  </span>
                </div>
                <p className="text-slate-300 text-sm mb-1">Pushes: {userWorkout.push_count}</p>
                {userWorkout.notes && (
                  <div className="mt-2 pt-2 border-t border-slate-600">
                    <p className="text-slate-400 text-sm font-semibold mb-1">Notes:</p>
                    <p className="text-slate-300 text-sm italic">&ldquo;{userWorkout.notes}&rdquo;</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-slate-400 text-sm">No workout logged</p>
            )}
          </div>

          {/* Partner's workout */}
          <div className="bg-slate-700 rounded-lg p-4">
            <h4 className="text-green-400 font-semibold mb-2 flex items-center gap-2">
              <span>👥</span> {partnerName || 'Partner'}
            </h4>
            {partnerWorkout ? (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-white font-bold text-lg">Intensity: {partnerWorkout.intensity}/5</span>
                  <span className="text-2xl">
                    {partnerWorkout.intensity === 1 && '😴'}
                    {partnerWorkout.intensity === 2 && '🚶'}
                    {partnerWorkout.intensity === 3 && '💪'}
                    {partnerWorkout.intensity === 4 && '🔥'}
                    {partnerWorkout.intensity === 5 && '⚡'}
                  </span>
                </div>
                <p className="text-slate-300 text-sm mb-1">Pushes: {partnerWorkout.push_count}</p>
                {partnerWorkout.notes && (
                  <div className="mt-2 pt-2 border-t border-slate-600">
                    <p className="text-slate-400 text-sm font-semibold mb-1">Notes:</p>
                    <p className="text-slate-300 text-sm italic">&ldquo;{partnerWorkout.notes}&rdquo;</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-slate-400 text-sm">No workout logged</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Calendar({ userWorkouts, partnerWorkouts, userName, partnerName, demoMode, onRefresh }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedUserWorkout, setSelectedUserWorkout] = useState<WorkoutRequest | undefined>()
  const [selectedPartnerWorkout, setSelectedPartnerWorkout] = useState<WorkoutRequest | undefined>()

  const getWorkoutForDate = (workouts: WorkoutRequest[], date: Date) => {
    return workouts.find(w => isSameDay(new Date(w.workout_date), date))
  }

  const getIntensityColor = (intensity?: number) => {
    if (!intensity) return 'bg-slate-700 text-slate-500'
    if (intensity <= 2) return 'bg-yellow-500 text-white'
    if (intensity === 3) return 'bg-green-500 text-white'
    return 'bg-blue-500 text-white'
  }

  const handleDayClick = (date: Date) => {
    const userWorkout = getWorkoutForDate(userWorkouts, date)
    const partnerWorkout = getWorkoutForDate(partnerWorkouts, date)
    
    // Only open details if there's at least one workout
    if (userWorkout || partnerWorkout) {
      setSelectedDate(date)
      setSelectedUserWorkout(userWorkout)
      setSelectedPartnerWorkout(partnerWorkout)
    }
  }

  const closeDetails = () => {
    setSelectedDate(null)
    setSelectedUserWorkout(undefined)
    setSelectedPartnerWorkout(undefined)
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
          const hasWorkout = userWorkout || partnerWorkout

          return (
            <div key={day.toISOString()} className="text-center">
              <div className={`text-xs mb-2 font-semibold ${isCurrentDay ? 'text-blue-400' : 'text-slate-400'}`}>
                {format(day, 'EEE')}
              </div>
              <div className={`text-sm mb-2 ${isCurrentDay ? 'text-blue-400 font-bold' : 'text-slate-300'}`}>
                {format(day, 'd')}
              </div>
              <div className="space-y-1">
                {/* Your workout */}
                <div
                  className={`h-12 rounded flex items-center justify-center text-xs font-semibold ${getIntensityColor(userWorkout?.intensity)} ${hasWorkout ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                  onClick={() => hasWorkout && handleDayClick(day)}
                  title={`Your workout: ${userWorkout ? `${userWorkout.intensity}/5${userWorkout.notes ? ` - ${userWorkout.notes}` : ''}` : 'No workout'}`}
                >
                  {userWorkout ? `${userWorkout.intensity}/5` : '-'}
                </div>
                {/* Partner's workout */}
                <div
                  className={`h-12 rounded flex items-center justify-center text-xs font-semibold ${getIntensityColor(partnerWorkout?.intensity)} ${hasWorkout ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                  onClick={() => hasWorkout && handleDayClick(day)}
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
          <div key={day} className="text-center text-xs font-semibold text-slate-400 mb-2">
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
          const hasWorkout = userWorkout || partnerWorkout

          return (
            <div 
              key={day.toISOString()} 
              className={`h-20 rounded p-1 ${isCurrentDay ? 'ring-2 ring-blue-400' : ''} bg-slate-800 ${hasWorkout ? 'cursor-pointer hover:bg-slate-700 transition-colors' : ''}`}
              onClick={() => hasWorkout && handleDayClick(day)}
            >
              <div className={`text-xs mb-1 ${isCurrentDay ? 'text-blue-400 font-bold' : 'text-slate-400'}`}>
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
            <div key={month.toISOString()} className="bg-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4">{format(month, 'MMMM')}</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-blue-400 mb-1">You</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-600 rounded-full h-2">
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
                    <div className="flex-1 bg-slate-600 rounded-full h-2">
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
              className={`bg-slate-700 rounded-lg p-3 ${isCurrentMonth ? 'ring-2 ring-blue-400' : ''}`}
            >
              <h4 className="text-sm font-semibold text-white mb-2">{format(month, 'MMM')}</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-xs text-slate-300">{userWorkoutsThisMonth}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-slate-300">{partnerWorkoutsThisMonth}</span>
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
    <div className="bg-slate-800 rounded-lg p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-semibold text-white">
            📅 {getViewTitle()}
          </h2>
          {/* Refresh Button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 shrink-0"
              title="Refresh calendar data"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="hidden sm:inline">Refresh</span>
            </button>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* View mode selector */}
          <div className="flex bg-slate-700 rounded-lg p-1 w-full sm:w-auto overflow-x-auto">
            {(['week', 'month', 'quarter', 'year'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  viewMode === mode
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
          
          {/* Navigation */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={navigatePrevious}
              className="flex-1 sm:flex-none px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm"
            >
              ←
            </button>
            <button
              onClick={goToToday}
              className="flex-1 sm:flex-none px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs sm:text-sm whitespace-nowrap"
            >
              Today
            </button>
            <button
              onClick={navigateNext}
              className="flex-1 sm:flex-none px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm"
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
      <div className="mt-6 pt-4 border-t border-slate-700">
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-slate-300">You</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-slate-300">Partner</span>
          </div>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400 text-xs">
            Intensity: Yellow (1-2) → Green (3) → Blue (4-5)
          </span>
        </div>
        <p className="text-center text-slate-400 text-xs mt-2">Click on any day with workouts to see details</p>
      </div>

      {/* Day Details Modal */}
      {selectedDate && (
        <DayDetails
          date={selectedDate}
          userWorkout={selectedUserWorkout}
          partnerWorkout={selectedPartnerWorkout}
          userName={userName}
          partnerName={partnerName}
          onClose={closeDetails}
        />
      )}
    </div>
  )
}
