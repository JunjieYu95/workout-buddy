/**
 * Stone Game Logic
 * 
 * Calculates stochastic rewards based on configurable Gaussian distribution
 * and supports multiple pushes based on workout intensity
 */

// Box-Muller transform to generate Gaussian random numbers
function gaussianRandom(mean: number, std: number): number {
  const u1 = Math.random()
  const u2 = Math.random()
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2)
  return z0 * std + mean
}

/**
 * Calculate stone progress for a single push
 * Uses Gaussian distribution with configurable parameters
 */
export function calculateSinglePush(
  gaussianMean: number,
  gaussianStd: number,
  consecutiveDays: number
): number {
  // Sample from Gaussian distribution
  let pushDistance = gaussianRandom(gaussianMean, gaussianStd)
  
  // Ensure minimum push of 0.5
  pushDistance = Math.max(0.5, pushDistance)
  
  // Consistency bonus: +10% per consecutive day (max +50%)
  const consistencyMultiplier = 1 + Math.min(consecutiveDays * 0.1, 0.5)
  
  const totalPush = Math.round((pushDistance * consistencyMultiplier) * 100) / 100
  return totalPush
}

/**
 * Calculate total stone reward based on workout intensity
 * Intensity determines number of pushes (1-5 pushes for intensity 1-5)
 */
export function calculateStoneReward(
  intensity: number,
  gaussianMean: number,
  gaussianStd: number,
  consecutiveDays: number
): { totalDistance: number, pushes: number[] } {
  const pushes: number[] = []
  let totalDistance = 0
  
  // Intensity determines number of pushes (1-5)
  const numberOfPushes = intensity
  
  for (let i = 0; i < numberOfPushes; i++) {
    const pushDistance = calculateSinglePush(gaussianMean, gaussianStd, consecutiveDays)
    pushes.push(pushDistance)
    totalDistance += pushDistance
  }
  
  return { totalDistance, pushes }
}

/**
 * Calculate pull distance for partner sabotage
 * Uses base percentage of push mean with acceleration for consecutive missed days
 */
export function calculatePull(
  pushMean: number,
  pushStd: number,
  pullBasePercentage: number = 0.5,
  pullAccelerationMultiplier: number = 2,
  consecutiveMissedDays: number = 0
): number {
  // Calculate the pull mean based on base percentage and acceleration
  const accelerationFactor = consecutiveMissedDays > 0 
    ? Math.pow(pullAccelerationMultiplier, consecutiveMissedDays - 1)
    : 1
  
  const pullMean = pushMean * pullBasePercentage * accelerationFactor
  
  // Use same std as push
  let pullDistance = gaussianRandom(pullMean, pushStd)
  
  // Ensure minimum pull of 0.5
  pullDistance = Math.max(0.5, pullDistance)
  
  return Math.round(pullDistance * 100) / 100
}

/**
 * Calculate penalty for missed days
 * Uses recession multiplier for escalating penalties
 */
export function calculatePenalty(
  daysMissed: number,
  recessionMultiplier: number = 1.5
): number {
  if (daysMissed === 0) return 0
  
  // Base penalty of 10, multiplied exponentially by recession multiplier
  const penalty = Math.floor(10 * Math.pow(recessionMultiplier, daysMissed - 1))
  
  return penalty
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