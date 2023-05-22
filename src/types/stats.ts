import { Friend } from "./types";

export interface UserStats {
  numPlayed: number;
  numSolved: number;
  currentStreak: number;
  maxStreak: number;
  averageSolveTime?: number;
}

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

export interface PrivateLeaderboardEntry {
  friend: Friend;
  time: number | null; // null means they haven't solved it yet
}

export interface PrivateLeaderboardStats {
  today: PrivateLeaderboardEntry[];
}
