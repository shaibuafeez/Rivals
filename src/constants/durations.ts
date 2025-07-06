export const TOURNAMENT_DURATIONS = {
  FIVE_MINUTES: {
    label: '5 Minutes',
    value: '5min',
    minutes: 5,
    description: 'Quick tournament for testing'
  },
  TEN_MINUTES: {
    label: '10 Minutes', 
    value: '10min',
    minutes: 10,
    description: 'Short tournament'
  },
  TWENTY_MINUTES: {
    label: '20 Minutes',
    value: '20min',
    minutes: 20,
    description: 'Medium tournament'
  },
  ONE_HOUR: {
    label: '1 Hour',
    value: '1hour',
    minutes: 60,
    description: 'Standard tournament'
  },
  TWENTY_FOUR_HOURS: {
    label: '24 Hours',
    value: '24hours',
    minutes: 1440,
    description: 'Daily tournament'
  }
} as const;

export type TournamentDurationKey = keyof typeof TOURNAMENT_DURATIONS;
export type TournamentDurationValue = typeof TOURNAMENT_DURATIONS[TournamentDurationKey];

// Helper function to format remaining time for short durations
export function formatRemainingTime(endTime: number): string {
  const now = Date.now();
  const remaining = endTime - now;
  
  if (remaining <= 0) return 'Ended';
  
  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  
  if (minutes < 60) {
    if (minutes === 0) {
      return `${seconds}s`;
    }
    return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours < 24) {
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }
  
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
}

// Helper function to determine if we should show seconds
export function shouldShowSeconds(endTime: number): boolean {
  const now = Date.now();
  const remaining = endTime - now;
  const minutes = Math.floor(remaining / 60000);
  
  // Show seconds if less than 20 minutes remaining
  return minutes < 20;
}

// Get duration object from minutes
export function getDurationFromMinutes(minutes: number): TournamentDurationValue | null {
  return Object.values(TOURNAMENT_DURATIONS).find(d => d.minutes === minutes) || null;
}