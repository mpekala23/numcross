export interface UserStats {
  numPlayed: number;
  numSolved: number;
  currentStreak: number;
  maxStreak: number;
  averageSolveTime?: number;
}

// TODO: right now there is no way for users to add a username.
// This is getting filled just with email but this should be collected
// on signup.
export interface LeaderboardEntry {
  username: string;
  time: number; // in seconds
  streak: number;
  numSolved: number;
}

export interface LeaderboardStats {
  today: LeaderboardEntry[];
  allTime: LeaderboardEntry[];
}
