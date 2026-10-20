import { User, Game, Room, Clan, Federation, School, ChatMessage, Question, AdminSettings, PasswordResetRequest } from './types';
import { v4 as uuidv4 } from 'uuid';

const KEYS = {
  USERS: 'skln_users',
  GAMES: 'skln_games',
  ROOMS: 'skln_rooms',
  CLANS: 'skln_clans',
  FEDERATIONS: 'skln_federations',
  SCHOOLS: 'skln_schools',
  CHAT: 'skln_chat',
  QUESTIONS: 'skln_questions',
  SETTINGS: 'skln_settings',
  RESET_REQUESTS: 'skln_reset_requests',
  CURRENT_USER: 'skln_current_user',
  ONLINE_COUNT: 'skln_online_count',
  YESTERDAY_COUNT: 'skln_yesterday_count',
  TOTAL_COUNT: 'skln_total_count',
};

function get<T>(key: string, defaultValue: T): T {
  const data = localStorage.getItem(key);
  if (!data) return defaultValue;
  try { return JSON.parse(data); } catch { return defaultValue; }
}

function set(key: string, value: any) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Initialize defaults
export function initDefaults() {
  if (!localStorage.getItem(KEYS.SETTINGS)) {
    const defaults: AdminSettings = {
      turnTime: 30,
      levelThresholds: [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500],
      xpPerWin: 50,
      xpPerShot: 1,
      xpPerAccuracy: 5,
    };
    set(KEYS.SETTINGS, defaults);
  }
  if (!localStorage.getItem(KEYS.TOTAL_COUNT)) {
    set(KEYS.TOTAL_COUNT, Math.floor(Math.random() * 5000) + 10000);
  }
  if (!localStorage.getItem(KEYS.YESTERDAY_COUNT)) {
    set(KEYS.YESTERDAY_COUNT, Math.floor(Math.random() * 500) + 200);
  }
  if (!localStorage.getItem(KEYS.USERS)) {
    // Create admin user
    const admin: User = {
      id: uuidv4(),
      phone: 'admin',
      nickname: 'Admin',
      password: 'admin123',
      role: 'admin',
      level: 10,
      xp: 9999,
      gamesPlayed: 0, gamesWon: 0, gamesLost: 0, gamesDraw: 0,
      totalShots: 0, accurateShots: 0, totalTimePlayed: 0,
      friends: [], backgroundColor: '#0f172a',
      registeredAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      loginHistory: [new Date().toISOString()],
    };
    // Create guest user
    const guest: User = {
      id: 'guest',
      phone: 'guest',
      nickname: 'Гость',
      password: '',
      role: 'guest',
      level: 0,
      xp: 0,
      gamesPlayed: 0, gamesWon: 0, gamesLost: 0, gamesDraw: 0,
      totalShots: 0, accurateShots: 0, totalTimePlayed: 0,
      friends: [], backgroundColor: '#0f172a',
      registeredAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      loginHistory: [],
    };
    set(KEYS.USERS, [admin, guest]);
  }
  if (!localStorage.getItem(KEYS.SCHOOLS)) {
    const schools: School[] = [
      { id: uuidv4(), name: 'Школа №1', region: 'Московская область', area: 'Одинцовский', city: 'Одинцово', address: 'ул. Ленина', buildingNumber: '15', approved: true, createdAt: new Date().toISOString(), students: [] },
      { id: uuidv4(), name: 'Гимназия №5', region: 'Московская область', area: 'Красногорский', city: 'Красногорск', address: 'ул. Школьная', buildingNumber: '3', approved: true, createdAt: new Date().toISOString(), students: [] },
      { id: uuidv4(), name: 'СОШ №12', region: 'Ленинградская область', area: 'Всеволожский', city: 'Всеволожск', address: 'пр. Ленина', buildingNumber: '28', approved: true, createdAt: new Date().toISOString(), students: [] },
    ];
    set(KEYS.SCHOOLS, schools);
  }
}

// Users
export function getUsers(): User[] { return get<User[]>(KEYS.USERS, []); }
export function getUserById(id: string): User | undefined { return getUsers().find(u => u.id === id); }
export function getUserByPhone(phone: string): User | undefined { return getUsers().find(u => u.phone === phone); }
export function getUserByNickname(nickname: string): User | undefined { return getUsers().find(u => u.nickname.toLowerCase() === nickname.toLowerCase()); }
export function saveUser(user: User) {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === user.id);
  if (idx >= 0) users[idx] = user; else users.push(user);
  set(KEYS.USERS, users);
}
export function getCurrentUser(): User | null {
  const id = localStorage.getItem(KEYS.CURRENT_USER);
  if (!id) return null;
  // Special handling for guest
  if (id === 'guest') {
    return getUserById('guest') || null;
  }
  return getUserById(id) || null;
}
export function setCurrentUser(id: string | null) {
  if (id) localStorage.setItem(KEYS.CURRENT_USER, id);
  else localStorage.removeItem(KEYS.CURRENT_USER);
}

// Games
export function getGames(): Game[] { return get<Game[]>(KEYS.GAMES, []); }
export function saveGame(game: Game) {
  const games = getGames();
  const idx = games.findIndex(g => g.id === game.id);
  if (idx >= 0) games[idx] = game; else games.push(game);
  set(KEYS.GAMES, games);
}

// Rooms
export function getRooms(): Room[] { return get<Room[]>(KEYS.ROOMS, []); }
export function saveRoom(room: Room) {
  const rooms = getRooms();
  const idx = rooms.findIndex(r => r.id === room.id);
  if (idx >= 0) rooms[idx] = room; else rooms.push(room);
  set(KEYS.ROOMS, rooms);
}
export function deleteRoom(id: string) {
  set(KEYS.ROOMS, getRooms().filter(r => r.id !== id));
}

// Clans
export function getClans(): Clan[] { return get<Clan[]>(KEYS.CLANS, []); }
export function saveClan(clan: Clan) {
  const clans = getClans();
  const idx = clans.findIndex(c => c.id === clan.id);
  if (idx >= 0) clans[idx] = clan; else clans.push(clan);
  set(KEYS.CLANS, clans);
}

// Federations
export function getFederations(): Federation[] { return get<Federation[]>(KEYS.FEDERATIONS, []); }
export function saveFederation(fed: Federation) {
  const feds = getFederations();
  const idx = feds.findIndex(f => f.id === fed.id);
  if (idx >= 0) feds[idx] = fed; else feds.push(fed);
  set(KEYS.FEDERATIONS, feds);
}

// Schools
export function getSchools(): School[] { return get<School[]>(KEYS.SCHOOLS, []); }
export function saveSchool(school: School) {
  const schools = getSchools();
  const idx = schools.findIndex(s => s.id === school.id);
  if (idx >= 0) schools[idx] = school; else schools.push(school);
  set(KEYS.SCHOOLS, schools);
}

// Chat
export function getChatMessages(): ChatMessage[] { return get<ChatMessage[]>(KEYS.CHAT, []); }
export function addChatMessage(msg: ChatMessage) {
  const msgs = getChatMessages();
  msgs.push(msg);
  if (msgs.length > 200) msgs.splice(0, msgs.length - 200);
  set(KEYS.CHAT, msgs);
}

// Questions
export function getQuestions(): Question[] { return get<Question[]>(KEYS.QUESTIONS, []); }
export function saveQuestion(q: Question) {
  const qs = getQuestions();
  const idx = qs.findIndex(x => x.id === q.id);
  if (idx >= 0) qs[idx] = q; else qs.push(q);
  set(KEYS.QUESTIONS, qs);
}

// Settings
export function getSettings(): AdminSettings { return get<AdminSettings>(KEYS.SETTINGS, { turnTime: 30, levelThresholds: [0,100,300,600,1000,1500,2200,3000,4000,5500], xpPerWin: 50, xpPerShot: 1, xpPerAccuracy: 5 }); }
export function saveSettings(s: AdminSettings) { set(KEYS.SETTINGS, s); }

// Password reset
export function getResetRequests(): PasswordResetRequest[] { return get<PasswordResetRequest[]>(KEYS.RESET_REQUESTS, []); }
export function saveResetRequest(r: PasswordResetRequest) {
  const reqs = getResetRequests();
  const idx = reqs.findIndex(x => x.id === r.id);
  if (idx >= 0) reqs[idx] = r; else reqs.push(r);
  set(KEYS.RESET_REQUESTS, reqs);
}

// Online stats
export function getOnlineCount(): number { return get<number>(KEYS.ONLINE_COUNT, 0); }
export function setOnlineCount(n: number) { set(KEYS.ONLINE_COUNT, n); }
export function getYesterdayCount(): number { return get<number>(KEYS.YESTERDAY_COUNT, 0); }
export function getTotalCount(): number { return get<number>(KEYS.TOTAL_COUNT, 0); }
export function incrementTotalCount() { set(KEYS.TOTAL_COUNT, getTotalCount() + 1); }
