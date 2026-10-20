import { User, Game, Room, Clan, Federation, School, ChatMessage, Question, AdminSettings, PasswordResetRequest, RolePermission } from './types';
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
      showAnnouncements: true,
      showTournamentHistory: true,
      pinAdminMessages: false,
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
      warnings: [],
      tags: [],
      chatMessagesCount: 0,
      questionsCount: 0,
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
      warnings: [],
      tags: [],
      chatMessagesCount: 0,
      questionsCount: 0,
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
export function getSettings(): AdminSettings { 
  return get<AdminSettings>(KEYS.SETTINGS, { 
    turnTime: 30, 
    levelThresholds: [0,100,300,600,1000,1500,2200,3000,4000,5500], 
    xpPerWin: 50, 
    xpPerShot: 1, 
    xpPerAccuracy: 5,
    showAnnouncements: true,
    showTournamentHistory: true,
    pinAdminMessages: false
  }); 
}
export function saveSettings(s: AdminSettings) { set(KEYS.SETTINGS, s); }

// Role Permissions
const KEYS_ROLE_PERMISSIONS = 'skln_role_permissions';
export function getRolePermissions(): RolePermission[] {
  const perms = get<RolePermission[]>(KEYS_ROLE_PERMISSIONS, []);
  if (perms.length === 0) {
    const defaults: RolePermission[] = [
      { id: '1', role: 'guest', canChat: false, canCreateClan: false, canCreateRoom: false, canPlayWithAI: true, canSeeRating: true, canCreateFederation: false, canSendSupport: true },
      { id: '2', role: 'player', canChat: true, canCreateClan: true, canCreateRoom: true, canPlayWithAI: true, canSeeRating: true, canCreateFederation: true, canSendSupport: true },
      { id: '3', role: 'admin', canChat: true, canCreateClan: true, canCreateRoom: true, canPlayWithAI: true, canSeeRating: true, canCreateFederation: true, canSendSupport: true }
    ];
    set(KEYS_ROLE_PERMISSIONS, defaults);
    return defaults;
  }
  return perms;
}
export function saveRolePermission(p: RolePermission) {
  const perms = getRolePermissions();
  const idx = perms.findIndex(x => x.id === p.id);
  if (idx >= 0) perms[idx] = p; else perms.push(p);
  set(KEYS_ROLE_PERMISSIONS, perms);
}

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

// Tickets (feedback to admin)
const KEYS_TICKETS = 'skln_tickets';
const KEYS_CLAN_CHAT = 'skln_clan_chat';
const KEYS_CHAT_BANNED = 'skln_chat_banned';

export function getTickets(): import('./types').AdminTicket[] { return get<import('./types').AdminTicket[]>(KEYS_TICKETS, []); }
export function saveTicket(t: import('./types').AdminTicket) {
  const tickets = getTickets();
  const idx = tickets.findIndex(x => x.id === t.id);
  if (idx >= 0) tickets[idx] = t; else tickets.push(t);
  set(KEYS_TICKETS, tickets);
}

// Clan chat
export function getClanChat(clanId: string): import('./types').ClanChatMessage[] {
  const all = get<Record<string, import('./types').ClanChatMessage[]>>(KEYS_CLAN_CHAT, {});
  return all[clanId] || [];
}
export function addClanChatMessage(msg: import('./types').ClanChatMessage) {
  const all = get<Record<string, import('./types').ClanChatMessage[]>>(KEYS_CLAN_CHAT, {});
  if (!all[msg.clanId]) all[msg.clanId] = [];
  all[msg.clanId].push(msg);
  if (all[msg.clanId].length > 200) all[msg.clanId] = all[msg.clanId].slice(-200);
  set(KEYS_CLAN_CHAT, all);
}
export function clearClanChat(clanId: string) {
  const all = get<Record<string, import('./types').ClanChatMessage[]>>(KEYS_CLAN_CHAT, {});
  all[clanId] = [];
  set(KEYS_CLAN_CHAT, all);
}

// Chat moderation
export function getBannedChatUsers(): string[] { return get<string[]>(KEYS_CHAT_BANNED, []); }
export function banChatUser(userId: string) {
  const banned = getBannedChatUsers();
  if (!banned.includes(userId)) {
    banned.push(userId);
    set(KEYS_CHAT_BANNED, banned);
  }
}
export function unbanChatUser(userId: string) {
  const banned = getBannedChatUsers().filter(id => id !== userId);
  set(KEYS_CHAT_BANNED, banned);
}
export function deleteChatMessage(msgId: string) {
  const msgs = getChatMessages().filter(m => m.id !== msgId);
  set(KEYS.CHAT, msgs);
}

// Tournaments
const KEYS_TOURNAMENTS = 'skln_tournaments';
const KEYS_ANNOUNCEMENTS = 'skln_announcements';

export function getTournaments(): import('./types').Tournament[] { return get<import('./types').Tournament[]>(KEYS_TOURNAMENTS, []); }
export function saveTournament(t: import('./types').Tournament) {
  const tournaments = getTournaments();
  const idx = tournaments.findIndex(x => x.id === t.id);
  if (idx >= 0) tournaments[idx] = t; else tournaments.push(t);
  set(KEYS_TOURNAMENTS, tournaments);
}
export function deleteTournament(id: string) {
  set(KEYS_TOURNAMENTS, getTournaments().filter(t => t.id !== id));
}

// Announcements
export function getAnnouncements(): import('./types').Announcement[] { return get<import('./types').Announcement[]>(KEYS_ANNOUNCEMENTS, []); }
export function saveAnnouncement(a: import('./types').Announcement) {
  const announcements = getAnnouncements();
  const idx = announcements.findIndex(x => x.id === a.id);
  if (idx >= 0) announcements[idx] = a; else announcements.push(a);
  set(KEYS_ANNOUNCEMENTS, announcements);
}
export function deleteAnnouncement(id: string) {
  set(KEYS_ANNOUNCEMENTS, getAnnouncements().filter(a => a.id !== id));
}

// Guest Tickets (support without registration)
const KEYS_GUEST_TICKETS = 'skln_guest_tickets';
const KEYS_ROOM_WARNINGS = 'skln_room_warnings';
const KEYS_RATING_RULES = 'skln_rating_rules';

export function getGuestTickets(): import('./types').GuestTicket[] { return get<import('./types').GuestTicket[]>(KEYS_GUEST_TICKETS, []); }
export function saveGuestTicket(t: import('./types').GuestTicket) {
  const tickets = getGuestTickets();
  const idx = tickets.findIndex(x => x.id === t.id);
  if (idx >= 0) tickets[idx] = t; else tickets.push(t);
  set(KEYS_GUEST_TICKETS, tickets);
}
export function generateTicketNumber(): string {
  const num = Math.floor(Math.random() * 900000) + 100000;
  return `SKLN-${num}`;
}

// Room warnings
export function getRoomWarnings(): import('./types').RoomWarning[] { return get<import('./types').RoomWarning[]>(KEYS_ROOM_WARNINGS, []); }
export function saveRoomWarning(w: import('./types').RoomWarning) {
  const warnings = getRoomWarnings();
  warnings.push(w);
  set(KEYS_ROOM_WARNINGS, warnings);
}
export function deleteRoomWarning(id: string) {
  set(KEYS_ROOM_WARNINGS, getRoomWarnings().filter(w => w.id !== id));
}

// Rating rules
export function getRatingRules(): import('./types').RatingRule[] {
  const rules = get<import('./types').RatingRule[]>(KEYS_RATING_RULES, []);
  if (rules.length === 0) {
    // Default rules
    const defaults: import('./types').RatingRule[] = [
      { id: '1', name: 'Сообщение в чате', description: 'За каждое сообщение в общем чате', xpPerAction: 2, actionType: 'chat_message' },
      { id: '2', name: 'Вопрос в FAQ', description: 'За каждый заданный вопрос', xpPerAction: 5, actionType: 'question' },
      { id: '3', name: 'Победа в игре', description: 'За победу в морском бое', xpPerAction: 50, actionType: 'game_win' },
      { id: '4', name: 'Участие в игре', description: 'За каждую сыгранную игру', xpPerAction: 10, actionType: 'game_play' },
      { id: '5', name: 'Точный выстрел', description: 'За попадание по кораблю', xpPerAction: 3, actionType: 'accurate_shot' },
      { id: '6', name: 'Ежедневный вход', description: 'За ежедневный вход в игру', xpPerAction: 15, actionType: 'daily_login' },
    ];
    set(KEYS_RATING_RULES, defaults);
    return defaults;
  }
  return rules;
}
export function saveRatingRule(r: import('./types').RatingRule) {
  const rules = getRatingRules();
  const idx = rules.findIndex(x => x.id === r.id);
  if (idx >= 0) rules[idx] = r; else rules.push(r);
  set(KEYS_RATING_RULES, rules);
}
export function deleteRatingRule(id: string) {
  set(KEYS_RATING_RULES, getRatingRules().filter(r => r.id !== id));
}
