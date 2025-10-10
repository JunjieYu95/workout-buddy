/**
 * Stone Game Logic
 * 
 * Calculates stochastic rewards based on current progress and consistency
 */

export function calculateStoneReward(
  currentPosition: number,
  consecutiveDays: number
): number {
  // Base reward: 5-15 units
  const baseReward = Math.floor(Math.random() * 11) + 5

  // Consistency bonus: +1 per consecutive day (max +10)
  const consistencyBonus = Math.min(consecutiveDays, 10)

  // Momentum multiplier: increases with position
  const momentumMultiplier = 1 + (currentPosition / 1000)

  const totalReward = Math.floor((baseReward + consistencyBonus) * momentumMultiplier)

  return totalReward
}

export function calculatePenalty(daysMissed: number): number {
  // Escalating penalty for missed days
  // 1 day: -10
  // 2 days: -25
  // 3 days: -50
  // 4+ days: -100
  
  if (daysMissed === 0) return 0
  if (daysMissed === 1) return 10
  if (daysMissed === 2) return 25
  if (daysMissed === 3) return 50
  return 100
}

export function getIntensityColor(intensity: number): string {
  if (intensity <= 2) return 'yellow'
  if (intensity <= 3) return 'green'
  return 'blue'
}

export function getIntensityLabel(intensity: number): string {
  if (intensity === 1) return 'Very Light'
  if (intensity === 2) return 'Light'
  if (intensity === 3) return 'Moderate'
  if (intensity === 4) return 'Hard'
  return 'Very Hard'
}