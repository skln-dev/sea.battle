export interface User {
  id: string;
  phone: string;
  nickname: string;
  password: string;
  email?: string;
  city?: string;
  about?: string;
  avatar?: string;
  role: 'guest' | 'player' | 'admin';
  level: number;
  xp: number;
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  gamesDraw: number;
  totalShots: number;
  accurateShots: number;
  totalTimePlayed: number;
  friends: string[];
  clanId?: string;
  federationId?: string;
  schoolId?: string;
  backgroundColor: string;
  registeredAt: string;
  lastLogin: string;
  loginHistory: string[];
}

export interface Ship {
  id: string;
  size: number;
  cells: { row: number; col: number }[];
  hits: number;
  sunk: boolean;
}

export interface GameBoard {
  ships: Ship[];
  shots: { row: number; col: number; hit: boolean }[];
  missedShots: { row: number; col: number }[];
}

export interface Game {
  id: string;
  player1Id: string;
  player2Id: string;
  player1Board: GameBoard;
  player2Board: GameBoard;
  currentTurn: string;
  status: 'waiting' | 'playing' | 'finished';
  winner?: string;
  isDraw?: boolean;
  startTime: string;
  endTime?: string;
  player1MissedTurns: number;
  player2MissedTurns: number;
  roomId?: string;
  tournamentId?: string;
  shotsHistory: { playerId: string; row: number; col: number; hit: boolean; time: string }[];
}

export interface Room {
  id: string;
  name: string;
  creatorId: string;
  players: string[];
  maxPlayers: number;
  isPrivate: boolean;
  password?: string;
  clanId?: string;
  createdAt: string;
}

export interface Clan {
  id: string;
  name: string;
  tag: string;
  logo: string;
  color: string;
  creatorId: string;
  members: string[];
  wins: number;
  losses: number;
  draws: number;
  createdAt: string;
}

export interface Federation {
  id: string;
  name: string;
  creatorId: string;
  clans: string[];
  members: string[];
  wins: number;
  losses: number;
  createdAt: string;
}

export interface School {
  id: string;
  name: string;
  region: string;
  area: string;
  city: string;
  address: string;
  buildingNumber: string;
  approved: boolean;
  approvedBy?: string;
  createdAt: string;
  students: string[];
}

export interface ChatMessage {
  id: string;
  userId: string;
  nickname: string;
  text: string;
  timestamp: string;
}

export interface Question {
  id: string;
  userId: string;
  nickname: string;
  title: string;
  text: string;
  likes: string[];
  isFAQ: boolean;
  createdAt: string;
  replies: QuestionReply[];
}

export interface QuestionReply {
  id: string;
  userId: string;
  nickname: string;
  text: string;
  createdAt: string;
}

export interface PasswordResetRequest {
  id: string;
  phone: string;
  nickname: string;
  lastLoginApprox: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface AdminSettings {
  turnTime: number;
  levelThresholds: number[];
  xpPerWin: number;
  xpPerShot: number;
  xpPerAccuracy: number;
}
