import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Home, Users, Trophy, MessageSquare, Shield, School, HelpCircle, Settings, LogOut, User as UserIcon, Gamepad2, Swords, Crown, Plus, Send, Heart, Star, Menu, Mail, Check, Trash2, Ban, Edit, UserPlus, Clock, Calendar, Download, Upload } from 'lucide-react';
import { User, Game, Room, Clan, Federation, School as SchoolType, ChatMessage, ClanChatMessage, Question, AdminTicket, GuestTicket, Tournament, Announcement, RolePermission } from './types';
import * as store from './store';
import { generateRandomPlacement, processShot, isAllSunk, getSunkShipCells, getHitCells } from './gameLogic';
import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [bgColor, setBgColor] = useState('#0f172a');

  useEffect(() => {
    store.initDefaults();
    const user = store.getCurrentUser();
    if (user) { setCurrentUser(user); setBgColor(user.backgroundColor); }
    store.setOnlineCount(Math.floor(Math.random() * 50) + 20);
    
    const rooms = store.getRooms();
    const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
    rooms.forEach(room => {
      if (new Date(room.createdAt).getTime() < threeDaysAgo) {
        store.deleteRoom(room.id);
      }
    });
  }, []);

  const refreshUser = () => {
    const user = store.getCurrentUser();
    setCurrentUser(user);
    if (user) setBgColor(user.backgroundColor);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen text-white" style={{ backgroundColor: bgColor }}>
        <nav className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-14">
              <Link to="/" className="flex items-center gap-2 font-bold text-lg">
                <Swords className="w-6 h-6 text-cyan-400" />
                <span className="text-cyan-400">SKLN</span><span className="hidden sm:inline">.МОРСКОЙ БОЙ</span>
              </Link>
              <div className="hidden md:flex items-center gap-4">
                <Link to="/" className="text-sm text-slate-300 hover:text-cyan-400">Главная</Link>
                <Link to="/rooms" className="text-sm text-slate-300 hover:text-cyan-400">Комнаты</Link>
                <Link to="/rating" className="text-sm text-slate-300 hover:text-cyan-400">Рейтинг</Link>
                <Link to="/chat" className="text-sm text-slate-300 hover:text-cyan-400">Чат</Link>
                <Link to="/clans" className="text-sm text-slate-300 hover:text-cyan-400">Кланы</Link>
                <Link to="/federation" className="text-sm text-slate-300 hover:text-cyan-400">Федерации</Link>
                <Link to="/support" className="text-sm text-slate-300 hover:text-cyan-400">Поддержка</Link>
                {currentUser && <Link to="/profile" className="text-sm text-slate-300 hover:text-cyan-400">Профиль</Link>}
                {currentUser?.role === 'admin' && <Link to="/admin" className="text-sm text-slate-300 hover:text-cyan-400">Админ</Link>}
              </div>
              <div className="hidden md:flex items-center gap-3">
                {currentUser ? (
                  <>
                    <span className="text-sm text-slate-300">Привет, <span className="text-cyan-400">{currentUser.nickname}</span></span>
                    <button onClick={() => { store.setCurrentUser(null); refreshUser(); }} className="p-2 hover:bg-slate-700 rounded-lg"><LogOut className="w-5 h-5" /></button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-sm">Войти</Link>
                    <Link to="/register" className="px-3 py-1.5 border border-cyan-600 text-cyan-400 rounded-lg text-sm">Регистрация</Link>
                  </>
                )}
              </div>
              <button className="md:hidden p-2" onClick={() => document.getElementById('mobile-menu')?.classList.toggle('hidden')}>
                <Menu className="w-6 h-6" />
              </button>
            </div>
            <div id="mobile-menu" className="hidden md:hidden pb-4 space-y-2">
              <Link to="/" className="block px-3 py-2 text-slate-300 hover:bg-slate-700 rounded-lg">Главная</Link>
              <Link to="/rooms" className="block px-3 py-2 text-slate-300 hover:bg-slate-700 rounded-lg">Комнаты</Link>
              <Link to="/rating" className="block px-3 py-2 text-slate-300 hover:bg-slate-700 rounded-lg">Рейтинг</Link>
              <Link to="/chat" className="block px-3 py-2 text-slate-300 hover:bg-slate-700 rounded-lg">Чат</Link>
              <Link to="/clans" className="block px-3 py-2 text-slate-300 hover:bg-slate-700 rounded-lg">Кланы</Link>
              <Link to="/federation" className="block px-3 py-2 text-slate-300 hover:bg-slate-700 rounded-lg">Федерации</Link>
              <Link to="/support" className="block px-3 py-2 text-slate-300 hover:bg-slate-700 rounded-lg">Поддержка</Link>
              {currentUser && <Link to="/profile" className="block px-3 py-2 text-slate-300 hover:bg-slate-700 rounded-lg">Профиль</Link>}
              {currentUser?.role === 'admin' && <Link to="/admin" className="block px-3 py-2 text-slate-300 hover:bg-slate-700 rounded-lg">Админ</Link>}
            </div>
          </div>
        </nav>

        <main className="container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage onLogin={refreshUser} />} />
            <Route path="/register" element={<RegisterPage onRegister={refreshUser} />} />
            <Route path="/rooms" element={<RoomsPage currentUser={currentUser} />} />
            <Route path="/game/:gameId" element={<GamePlayPage currentUser={currentUser} refreshUser={refreshUser} />} />
            <Route path="/chat" element={<ChatPage currentUser={currentUser} refreshUser={refreshUser} />} />
            <Route path="/clans" element={<ClansPage currentUser={currentUser} refreshUser={refreshUser} />} />
            <Route path="/profile" element={<ProfilePage currentUser={currentUser} refreshUser={refreshUser} />} />
            <Route path="/federation" element={<FederationsPage currentUser={currentUser} refreshUser={refreshUser} />} />
            <Route path="/rating" element={<RatingPage />} />
            <Route path="/support" element={<SupportPage currentUser={currentUser} />} />
            <Route path="/admin" element={<AdminPage currentUser={currentUser} refreshUser={refreshUser} />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

function HomePage() {
  const online = store.getOnlineCount();
  const yesterday = store.getYesterdayCount();
  const total = store.getTotalCount();
  const games = store.getGames();
  const users = store.getUsers().filter(u => u.role === 'player');
  const schools = store.getSchools().filter(s => s.approved);
  const clans = store.getClans();
  const totalShots = games.reduce((sum, g) => sum + g.shotsHistory.length, 0);
  const settings = store.getSettings();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  useEffect(() => {
    setAnnouncements(store.getAnnouncements());
    setTournaments(store.getTournaments());
    
    const interval = setInterval(() => {
      const now = Date.now();
      store.getTournaments().forEach(t => {
        if (t.status === 'upcoming' && new Date(t.startTime).getTime() <= now) {
          t.status = 'active';
          store.saveTournament(t);
          setTournaments([...store.getTournaments()]);
        }
        if (t.status === 'active' && new Date(t.endTime).getTime() <= now) {
          t.status = 'finished';
          store.saveTournament(t);
          setTournaments([...store.getTournaments()]);
        }
      });
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const schoolStats = schools.map(school => ({
    name: school.name,
    city: school.city,
    count: users.filter(u => u.schoolId === school.id).length
  }));

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="lg:w-64 space-y-3">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <h3 className="text-sm font-bold text-cyan-400 mb-3">📊 Статистика</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-400">Онлайн:</span><span className="text-green-400 font-bold">{online}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Вчера:</span><span className="text-yellow-400">{yesterday}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Всего:</span><span className="text-purple-400">{total.toLocaleString()}</span></div>
            <div className="border-t border-slate-700 my-2"></div>
            <div className="flex justify-between"><span className="text-slate-400">Игроков:</span><span>{users.length}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Игр:</span><span>{games.length}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Выстрелов:</span><span>{totalShots}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Школ:</span><span>{schools.length}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Кланов:</span><span>{clans.length}</span></div>
          </div>
        </div>

        {schoolStats.length > 0 && (
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <h3 className="text-sm font-bold text-cyan-400 mb-3">🏫 По школам</h3>
            <div className="space-y-1 text-xs">
              {schoolStats.map((s, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-slate-400 truncate">{s.city}:</span>
                  <span className="text-white font-bold">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 space-y-6">
        <div className="text-center py-6">
          <h1 className="text-3xl md:text-5xl font-bold mb-3"><span className="text-cyan-400">SKLN</span>.МОРСКОЙ БОЙ</h1>
          <p className="text-slate-400 text-sm md:text-base">Классическая игра в морском бое онлайн</p>
        </div>

        {settings.showAnnouncements && announcements.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-cyan-400">📢 Объявления</h2>
            {announcements.slice(0, 3).map(a => (
              <div key={a.id} className={`rounded-lg p-3 border ${a.type === 'important' ? 'bg-red-900/20 border-red-700' : a.type === 'tournament' ? 'bg-purple-900/20 border-purple-700' : 'bg-slate-800/50 border-slate-700'}`}>
                <h3 className="font-bold text-sm">{a.title}</h3>
                <p className="text-xs text-slate-300 mt-1">{a.content}</p>
                <div className="text-xs text-slate-500 mt-1">{new Date(a.createdAt).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        )}

        {tournaments.filter(t => t.status === 'active' || t.status === 'upcoming').length > 0 && (
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-cyan-400">🏆 Активные турниры</h2>
            {tournaments.filter(t => t.status === 'active' || t.status === 'upcoming').map(t => {
              const diff = new Date(t.endTime).getTime() - Date.now();
              const days = Math.floor(diff / (1000 * 60 * 60 * 24));
              const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
              const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
              return (
                <div key={t.id} className="bg-purple-900/20 border border-purple-700 rounded-lg p-3">
                  <h3 className="font-bold text-sm">{t.name}</h3>
                  <p className="text-xs text-slate-300 mt-1">{t.description}</p>
                  {diff > 0 && <div className="text-xs text-cyan-400 mt-1">⏰ {days > 0 ? `${days}д ` : ''}{hours}ч {minutes}мин</div>}
                </div>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link to="/rooms" className="flex flex-col items-center gap-2 p-3 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-lg"><Gamepad2 className="w-5 h-5 text-cyan-400" /><div className="text-sm font-medium">Играть</div></Link>
          <Link to="/rating" className="flex flex-col items-center gap-2 p-3 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-lg"><Trophy className="w-5 h-5 text-cyan-400" /><div className="text-sm font-medium">Рейтинг</div></Link>
          <Link to="/clans" className="flex flex-col items-center gap-2 p-3 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-lg"><Shield className="w-5 h-5 text-cyan-400" /><div className="text-sm font-medium">Кланы</div></Link>
          <Link to="/support" className="flex flex-col items-center gap-2 p-3 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-lg"><Mail className="w-5 h-5 text-cyan-400" /><div className="text-sm font-medium">Поддержка</div></Link>
        </div>
      </div>
    </div>
  );
}

function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    const user = store.getUserByPhone(phone);
    if (!user) { setError('Пользователь не найден'); return; }
    
    // Проверка бана с автоматической разблокировкой
    if (user.banned) {
      // Если бан временный и срок истёк - разблокировать
      if (user.banExpiresAt && new Date(user.banExpiresAt) < new Date()) {
        user.banned = false;
        user.banExpiresAt = undefined;
        user.banReason = undefined;
        store.saveUser(user);
      } else {
        // Бан активен - показать причину
        const reason = user.banReason || 'Не указана';
        const expires = user.banExpiresAt ? ` до ${new Date(user.banExpiresAt).toLocaleString()}` : ' навсегда';
        setError(`⛔ Аккаунт заблокирован${expires}\n\nПричина: ${reason}`);
        return;
      }
    }
    
    if (user.password !== password) { setError('Неверный пароль'); return; }
    store.setCurrentUser(user.id);
    onLogin();
    navigate('/');
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h2 className="text-2xl font-bold mb-6 text-center">Вход</h2>
        <div className="space-y-4">
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Телефон" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Пароль" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg" />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button onClick={handleLogin} className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg">Войти</button>
          <p className="text-center text-sm text-slate-400">Нет аккаунта? <Link to="/register" className="text-cyan-400">Регистрация</Link></p>
        </div>
      </div>
    </div>
  );
}

function RegisterPage({ onRegister }: { onRegister: () => void }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [schoolMode, setSchoolMode] = useState<'select' | 'create'>('select');
  const [schoolId, setSchoolId] = useState('');
  const [newSchool, setNewSchool] = useState({ name: '', number: '', city: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const schools = store.getSchools().filter(s => s.approved);

  const handleRegister = () => {
    if (!phone || !password || !nickname) { setError('Заполните все поля'); return; }
    if (password.length < 5) { setError('Пароль не менее 5 символов'); return; }
    if (store.getUserByPhone(phone)) { setError('Номер уже используется'); return; }
    if (store.getUserByNickname(nickname)) { setError('Ник занят'); return; }

    let finalSchoolId: string | undefined;
    if (schoolMode === 'create') {
      if (!newSchool.name || !newSchool.number || !newSchool.city) { setError('Заполните все поля школы'); return; }
      const school = { id: uuidv4(), name: `${newSchool.name} №${newSchool.number}`, region: '', area: '', city: newSchool.city, address: '', buildingNumber: '', approved: false, createdAt: new Date().toISOString(), students: [] };
      store.saveSchool(school as any);
      finalSchoolId = school.id;
    } else {
      if (!schoolId) { setError('Выберите школу'); return; }
      finalSchoolId = schoolId;
    }

    const user: User = {
      id: uuidv4(), phone, nickname, password, role: 'player', level: 1, xp: 0,
      gamesPlayed: 0, gamesWon: 0, gamesLost: 0, gamesDraw: 0,
      totalShots: 0, accurateShots: 0, totalTimePlayed: 0, friends: [],
      backgroundColor: '#0f172a', registeredAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(), loginHistory: [], warnings: [], tags: [],
      chatMessagesCount: 0, questionsCount: 0, schoolId: finalSchoolId,
    };
    store.saveUser(user);
    store.setCurrentUser(user.id);
    onRegister();
    navigate('/');
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h2 className="text-2xl font-bold mb-6 text-center">Регистрация</h2>
        <div className="space-y-4">
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Телефон" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg" />
          <input value={nickname} onChange={e => setNickname(e.target.value)} placeholder="Никнейм" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Пароль (мин. 5)" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg" />
          
          <div>
            <label className="block text-sm text-slate-400 mb-2">Школа</label>
            <div className="flex gap-2 mb-2">
              <button onClick={() => setSchoolMode('select')} className={`flex-1 px-3 py-2 rounded-lg text-sm ${schoolMode === 'select' ? 'bg-cyan-600' : 'bg-slate-700'}`}>Выбрать</button>
              <button onClick={() => setSchoolMode('create')} className={`flex-1 px-3 py-2 rounded-lg text-sm ${schoolMode === 'create' ? 'bg-cyan-600' : 'bg-slate-700'}`}>Моей нет</button>
            </div>
            {schoolMode === 'select' ? (
              <select value={schoolId} onChange={e => setSchoolId(e.target.value)} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm">
                <option value="">-- Выберите --</option>
                {schools.map(s => <option key={s.id} value={s.id}>{s.name} ({s.city})</option>)}
              </select>
            ) : (
              <div className="space-y-2">
                <input value={newSchool.name} onChange={e => setNewSchool({ ...newSchool, name: e.target.value })} placeholder="Наименование" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
                <input value={newSchool.number} onChange={e => setNewSchool({ ...newSchool, number: e.target.value })} placeholder="Номер" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
                <input value={newSchool.city} onChange={e => setNewSchool({ ...newSchool, city: e.target.value })} placeholder="Населённый пункт" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
              </div>
            )}
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button onClick={handleRegister} className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg">Зарегистрироваться</button>
        </div>
      </div>
    </div>
  );
}

function RoomsPage({ currentUser }: { currentUser: User | null }) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [roomName, setRoomName] = useState('');
  const navigate = useNavigate();

  useEffect(() => { setRooms(store.getRooms()); }, []);

  const startGame = (p1Id: string, p2Id: string) => {
    const game: Game = {
      id: uuidv4(), player1Id: p1Id, player2Id: p2Id,
      player1Board: generateRandomPlacement(), player2Board: generateRandomPlacement(),
      currentTurn: p1Id, status: 'playing', startTime: new Date().toISOString(),
      player1MissedTurns: 0, player2MissedTurns: 0, shotsHistory: [],
    };
    store.saveGame(game);
    navigate(`/game/${game.id}`);
  };

  const playWithAI = () => {
    const playerId = currentUser?.id || 'guest';
    startGame(playerId, 'ai');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Комнаты</h2>
        <div className="flex gap-2">
          <button onClick={playWithAI} className="px-4 py-2 bg-purple-600 rounded-lg text-sm">🤖 ИИ</button>
          {currentUser && currentUser.id !== 'guest' && <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-cyan-600 rounded-lg text-sm"><Plus className="w-4 h-4 inline" /> Создать</button>}
        </div>
      </div>

      {showCreate && currentUser && (
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 space-y-3">
          <input value={roomName} onChange={e => setRoomName(e.target.value)} placeholder="Название" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <button onClick={() => { if (roomName) { store.saveRoom({ id: uuidv4(), name: roomName, creatorId: currentUser.id, players: [currentUser.id], maxPlayers: 2, isPrivate: false, createdAt: new Date().toISOString(), schoolId: currentUser.schoolId }); setRooms(store.getRooms()); setShowCreate(false); } }} className="px-4 py-2 bg-green-600 rounded-lg text-sm">Создать</button>
        </div>
      )}

      <div className="space-y-3">
        {rooms.map(room => (
          <div key={room.id} className="flex items-center justify-between bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div>
              <div className="font-medium">{room.name}</div>
              <div className="text-sm text-slate-400">{room.players.length}/{room.maxPlayers}</div>
            </div>
            <button onClick={() => { const playerId = currentUser?.id || 'guest'; startGame(playerId, room.players[0]); }} className="px-4 py-2 bg-cyan-600 rounded-lg text-sm">Войти</button>
          </div>
        ))}
        {rooms.length === 0 && <p className="text-slate-500 text-center py-8">Нет комнат</p>}
      </div>
    </div>
  );
}

function GamePlayPage({ currentUser, refreshUser }: { currentUser: User | null; refreshUser: () => void }) {
  const gameId = window.location.pathname.split('/').pop()!;
  const [game, setGame] = useState<Game | null>(null);
  const [turnTimer, setTurnTimer] = useState(30);
  const [placementMode, setPlacementMode] = useState(false);
  const [myBoard, setMyBoard] = useState(generateRandomPlacement());
  const [placementError, setPlacementError] = useState('');
  const [selectedShipSize, setSelectedShipSize] = useState<number | null>(null);
  const [isVertical, setIsVertical] = useState(false);
  const playerId = currentUser?.id || 'guest';

  useEffect(() => { 
    const g = store.getGames().find(x => x.id === gameId);
    if (g) {
      setGame(g);
      const playerBoard = playerId === g.player1Id ? g.player1Board : g.player2Board;
      setMyBoard(playerBoard);
    }
  }, [gameId]);

  useEffect(() => {
    if (!game || game.status !== 'playing') return;
    const settings = store.getSettings();
    setTurnTimer(settings.turnTime);
    
    const interval = setInterval(() => {
      setTurnTimer(prev => {
        if (prev <= 1) {
          handleMissTurn();
          return settings.turnTime;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [game?.currentTurn, game?.status, game?.id]);

  // Запуск хода ИИ
  useEffect(() => {
    if (!game || game.status !== 'playing') return;
    if (game.player2Id === 'ai' && game.currentTurn === 'ai') {
      const timeout = setTimeout(() => {
        aiTurn();
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [game?.currentTurn, game?.status, game?.id]);

  if (!game) return <div>Загрузка...</div>;

  const handleMissTurn = () => {
    setGame(prevGame => {
      if (!prevGame) return prevGame;
      const updatedGame = { ...prevGame };
      
      if (updatedGame.currentTurn === updatedGame.player1Id) {
        updatedGame.player1MissedTurns++;
        if (updatedGame.player1MissedTurns >= 2) {
          updatedGame.status = 'finished';
          updatedGame.winner = updatedGame.player2Id;
          updatedGame.endTime = new Date().toISOString();
        }
      } else {
        updatedGame.player2MissedTurns++;
        if (updatedGame.player2MissedTurns >= 2) {
          updatedGame.status = 'finished';
          updatedGame.winner = updatedGame.player1Id;
          updatedGame.endTime = new Date().toISOString();
        }
      }
      
      if (updatedGame.status === 'playing') {
        updatedGame.currentTurn = updatedGame.currentTurn === updatedGame.player1Id ? updatedGame.player2Id : updatedGame.player1Id;
      }
      
      store.saveGame(updatedGame);
      return updatedGame;
    });
  };

  const handleShot = (row: number, col: number) => {
    if (game.currentTurn !== playerId) return;
    const targetBoard = playerId === game.player1Id ? game.player2Board : game.player1Board;
    if (targetBoard.shots.some(s => s.row === row && s.col === col) || targetBoard.missedShots.some(s => s.row === row && s.col === col)) return;

    const result = processShot(targetBoard, row, col);
    
    if (isAllSunk(targetBoard)) {
      game.status = 'finished';
      game.winner = playerId;
      game.endTime = new Date().toISOString();
    } else if (!result.hit) {
      game.currentTurn = game.player1Id === playerId ? game.player2Id : game.player1Id;
    }

    store.saveGame(game);
    setGame({ ...game });

    if (game.player2Id === 'ai' && game.currentTurn === 'ai' && game.status === 'playing') {
      setTimeout(() => aiTurn(), 1000);
    }
  };

  const aiTurn = () => {
    if (!game || game.status !== 'playing') return;
    const targetBoard = game.player1Board;
    let row = Math.floor(Math.random() * 10);
    let col = Math.floor(Math.random() * 10);
    let attempts = 0;
    
    while ((targetBoard.shots.some(s => s.row === row && s.col === col) || targetBoard.missedShots.some(s => s.row === row && s.col === col)) && attempts < 100) {
      row = Math.floor(Math.random() * 10);
      col = Math.floor(Math.random() * 10);
      attempts++;
    }

    const result = processShot(targetBoard, row, col);
    
    if (isAllSunk(targetBoard)) {
      game.status = 'finished';
      game.winner = 'ai';
      game.endTime = new Date().toISOString();
    } else if (!result.hit) {
      game.currentTurn = playerId;
    }

    store.saveGame(game);
    setGame({ ...game });
  };

  const validatePlacement = (board: any): boolean => {
    if (board.ships.length !== 10) {
      setPlacementError('Не все корабли расставлены');
      return false;
    }
    for (let i = 0; i < board.ships.length; i++) {
      for (let j = i + 1; j < board.ships.length; j++) {
        const ship1 = board.ships[i];
        const ship2 = board.ships[j];
        for (const c1 of ship1.cells) {
          for (const c2 of ship2.cells) {
            const dist = Math.abs(c1.row - c2.row) + Math.abs(c1.col - c2.col);
            if (dist === 1) {
              setPlacementError('Корабли должны быть на расстоянии минимум 1 клетки');
              return false;
            }
          }
        }
      }
    }
    setPlacementError('');
    return true;
  };

  const confirmPlacement = () => {
    if (!validatePlacement(myBoard)) return;
    if (playerId === game.player1Id) {
      game.player1Board = myBoard;
    } else {
      game.player2Board = myBoard;
    }
    store.saveGame(game);
    setGame({ ...game });
    setPlacementMode(false);
  };

  const randomPlacement = () => {
    setMyBoard(generateRandomPlacement());
    setPlacementError('');
    setSelectedShipSize(null);
  };

  const canPlaceShip = (board: any, row: number, col: number, size: number, vertical: boolean): boolean => {
    // Проверка границ
    if (vertical) {
      if (row + size > 10) return false;
    } else {
      if (col + size > 10) return false;
    }

    // Проверка клеток и окружения
    for (let i = 0; i < size; i++) {
      const r = vertical ? row + i : row;
      const c = vertical ? col : col + i;

      // Проверка самой клетки
      if (board.ships.some((ship: any) => ship.cells.some((cell: any) => cell.row === r && cell.col === c))) {
        return false;
      }

      // Проверка окружения (8 соседних клеток)
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < 10 && nc >= 0 && nc < 10) {
            if (board.ships.some((ship: any) => ship.cells.some((cell: any) => cell.row === nr && cell.col === nc))) {
              // Разрешаем если это часть того же корабля (для многоклеточных)
              const isSameShip = board.ships.some((ship: any) => 
                ship.cells.some((cell: any) => cell.row === r && cell.col === c) &&
                ship.cells.some((cell: any) => cell.row === nr && cell.col === nc)
              );
              if (!isSameShip) return false;
            }
          }
        }
      }
    }

    return true;
  };

  const placeShip = (row: number, col: number) => {
    if (selectedShipSize === null) return;

    const newBoard = { ...myBoard, ships: [...myBoard.ships] };
    
    if (!canPlaceShip(newBoard, row, col, selectedShipSize, isVertical)) {
      setPlacementError('Нельзя разместить корабль здесь (слишком близко к другим или выходит за границы)');
      return;
    }

    const cells = [];
    for (let i = 0; i < selectedShipSize; i++) {
      cells.push({
        row: isVertical ? row + i : row,
        col: isVertical ? col : col + i
      });
    }

    newBoard.ships.push({
      id: uuidv4(),
      size: selectedShipSize,
      cells: cells,
      hits: 0,
      sunk: false
    });

    setMyBoard(newBoard);
    setPlacementError('');
    
    // Автоматически выбираем следующий размер корабля
    const placedSizes = newBoard.ships.map((s: any) => s.size);
    const requiredShips = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];
    const nextShip = requiredShips.find(size => {
      const placed = placedSizes.filter((s: number) => s === size).length;
      const required = requiredShips.filter(s => s === size).length;
      return placed < required;
    });
    
    setSelectedShipSize(nextShip || null);
  };

  const isMyTurn = game.currentTurn === playerId;
  const opponentName = game.player2Id === 'ai' ? 'ИИ' : store.getUserById(game.player2Id)?.nickname || 'Противник';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Игра vs {opponentName}</h2>
        <div className={`text-2xl font-mono font-bold ${turnTimer <= 5 ? 'text-red-400 animate-pulse' : 'text-cyan-400'}`}>
          {turnTimer}с
        </div>
      </div>

      <div className={`text-sm ${isMyTurn ? 'text-green-400' : 'text-red-400'}`}>
        {isMyTurn ? '⚡ Ваш ход' : '⏳ Ход противника'}
      </div>
      
      {placementMode ? (
        <div className="space-y-4">
          <div className="bg-blue-900/20 border border-blue-700 rounded-xl p-4">
            <h3 className="font-bold text-blue-400 mb-2">📍 Как расставлять корабли</h3>
            <div className="text-sm text-slate-300 space-y-1">
              <p>• Выберите размер корабля ниже</p>
              <p>• Выберите ориентацию (горизонтально/вертикально)</p>
              <p>• Кликните на клетку поля для размещения</p>
              <p>• Корабли не могут касаться друг друга (минимум 1 клетка между ними)</p>
              <p>• Флот: 1×4-палубный, 2×3-палубных, 3×2-палубных, 4×1-палубных</p>
            </div>
            {placementError && <p className="text-sm text-red-400 mt-2">⚠️ {placementError}</p>}
          </div>

          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <h4 className="font-bold text-sm mb-3">Выберите корабль для размещения:</h4>
            <div className="flex flex-wrap gap-2 mb-3">
              {[4, 3, 2, 1].map(size => {
                const placed = myBoard.ships.filter((s: any) => s.size === size).length;
                const required = size === 4 ? 1 : size === 3 ? 2 : size === 2 ? 3 : 4;
                const remaining = required - placed;
                return (
                  <button
                    key={size}
                    onClick={() => remaining > 0 && setSelectedShipSize(size)}
                    disabled={remaining === 0}
                    className={`px-3 py-2 rounded-lg text-sm ${
                      selectedShipSize === size ? 'bg-cyan-600' :
                      remaining === 0 ? 'bg-slate-700 opacity-50 cursor-not-allowed' :
                      'bg-slate-600 hover:bg-slate-500'
                    }`}
                  >
                    {size}-палубный ({remaining} осталось)
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsVertical(false)}
                className={`px-3 py-2 rounded-lg text-sm ${!isVertical ? 'bg-cyan-600' : 'bg-slate-600'}`}
              >
                ↔️ Горизонтально
              </button>
              <button
                onClick={() => setIsVertical(true)}
                className={`px-3 py-2 rounded-lg text-sm ${isVertical ? 'bg-cyan-600' : 'bg-slate-600'}`}
              >
                ↕️ Вертикально
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={randomPlacement} className="px-4 py-2 bg-purple-600 rounded-lg text-sm">🎲 Случайная расстановка</button>
            <button onClick={confirmPlacement} className="px-4 py-2 bg-green-600 rounded-lg text-sm">✓ Подтвердить</button>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 overflow-x-auto">
            <GameGrid 
              board={myBoard} 
              showShips 
              onPlacementClick={selectedShipSize !== null ? placeShip : undefined}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <h3 className="text-sm text-slate-400 mb-2">Противник</h3>
            <div className="overflow-x-auto">
              <GameGrid board={playerId === game.player1Id ? game.player2Board : game.player1Board} onCellClick={isMyTurn ? handleShot : undefined} />
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <h3 className="text-sm text-slate-400 mb-2">Ваше поле</h3>
            <div className="overflow-x-auto">
              <GameGrid board={myBoard} showShips />
            </div>
            <button onClick={() => setPlacementMode(true)} className="mt-2 px-3 py-1 bg-slate-600 hover:bg-slate-500 rounded text-xs w-full">Изменить расстановку</button>
          </div>
        </div>
      )}
    </div>
  );
}

function GameGrid({ board, onCellClick, onPlacementClick, showShips }: { board: any; onCellClick?: (row: number, col: number) => void; onPlacementClick?: (row: number, col: number) => void; showShips?: boolean }) {
  const sunkCells = getSunkShipCells(board);
  const labels = ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж', 'З', 'И', 'К'];

  return (
    <div className="inline-block">
      <div className="grid grid-cols-11 gap-0.5">
        <div className="w-5 h-5 md:w-6 md:h-6" />
        {Array.from({ length: 10 }, (_, i) => <div key={i} className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-xs text-slate-500">{i + 1}</div>)}
        {Array.from({ length: 10 }, (_, row) => (
          <React.Fragment key={row}>
            <div className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-xs text-slate-500">{labels[row]}</div>
            {Array.from({ length: 10 }, (_, col) => {
              const key = `${row},${col}`;
              const isShot = board.shots?.some((s: any) => s.row === row && s.col === col);
              const isMiss = board.missedShots?.some((s: any) => s.row === row && s.col === col);
              const isSunk = sunkCells.has(key);
              const hasShip = showShips && board.ships?.some((s: any) => s.cells.some((c: any) => c.row === row && c.col === col));

              let cls = 'w-5 h-5 md:w-6 md:h-6 rounded-sm flex items-center justify-center text-xs transition-all ';
              if (isSunk) cls += 'bg-red-600 ';
              else if (isShot) cls += 'bg-red-500/70 ';
              else if (isMiss) cls += 'bg-slate-600 ';
              else if (hasShip) cls += 'bg-cyan-700 ';
              else cls += 'bg-slate-700 hover:bg-slate-600 ';

              if (onPlacementClick && !hasShip) cls += 'cursor-pointer hover:bg-green-600/50 hover:scale-110 ';
              else if (onCellClick && !isShot && !isMiss) cls += 'cursor-crosshair hover:bg-cyan-600/50 ';

              const handleClick = () => {
                if (onPlacementClick && !hasShip) {
                  onPlacementClick(row, col);
                } else if (onCellClick) {
                  onCellClick(row, col);
                }
              };

              return <div key={col} className={cls} onClick={handleClick}>{(isShot || isSunk) && '✕'}{isMiss && '•'}</div>;
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function ChatPage({ currentUser, refreshUser }: { currentUser: User | null; refreshUser: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');

  useEffect(() => { setMessages(store.getChatMessages()); }, []);

  if (!currentUser || currentUser.id === 'guest') {
    return <div className="text-center py-12 text-slate-400">Гости не могут читать чат. <Link to="/register" className="text-cyan-400">Зарегистрируйтесь</Link></div>;
  }

  const sendMessage = () => {
    if (!text.trim()) return;
    store.addChatMessage({ id: uuidv4(), userId: currentUser.id, nickname: currentUser.nickname, text: text.trim(), timestamp: new Date().toISOString() });
    const user = store.getUserById(currentUser.id)!;
    user.chatMessagesCount++;
    user.xp += 2;
    store.saveUser(user);
    refreshUser();
    setMessages(store.getChatMessages());
    setText('');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">💬 Чат</h2>
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 flex flex-col h-[500px]">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-2 ${msg.userId === currentUser.id ? 'justify-end' : ''}`}>
              <div className={`max-w-[70%] rounded-lg p-2 ${msg.userId === currentUser.id ? 'bg-cyan-600/30' : 'bg-slate-700/50'}`}>
                <div className="text-xs text-slate-400">{msg.nickname}</div>
                <div className="text-sm">{msg.text}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-slate-700 flex gap-2">
          <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Сообщение..." className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <button onClick={sendMessage} className="px-4 py-2 bg-cyan-600 rounded-lg"><Send className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
}

function ClansPage({ currentUser, refreshUser }: { currentUser: User | null; refreshUser: () => void }) {
  const [clans, setClans] = useState<Clan[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [tag, setTag] = useState('');

  useEffect(() => { setClans(store.getClans()); }, []);

  const createClan = () => {
    if (!currentUser || !name || !tag) return;
    if (tag.length !== 5) { alert('Тег должен быть 5 символов'); return; }
    const clan: Clan = {
      id: uuidv4(), name, tag, logo: '⚔️', color: '#00ffff',
      creatorId: currentUser.id, members: [currentUser.id],
      wins: 0, losses: 0, draws: 0, createdAt: new Date().toISOString(),
    };
    store.saveClan(clan);
    const user = { ...currentUser, clanId: clan.id };
    store.saveUser(user);
    setClans(store.getClans());
    setShowCreate(false);
    refreshUser();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">🛡️ Кланы</h2>
        {currentUser && !currentUser.clanId && currentUser.id !== 'guest' && (
          <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-cyan-600 rounded-lg text-sm"><Plus className="w-4 h-4 inline" /> Создать</button>
        )}
      </div>

      {showCreate && (
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 space-y-3">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Название" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <input value={tag} onChange={e => setTag(e.target.value.slice(0, 5))} placeholder="Тег (5 символов)" maxLength={5} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <button onClick={createClan} className="px-4 py-2 bg-green-600 rounded-lg text-sm">Создать</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {clans.map(clan => (
          <div key={clan.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{clan.logo}</span>
              <div>
                <div className="font-bold">{clan.name} <span className="text-xs text-slate-400">[{clan.tag}]</span></div>
                <div className="text-xs text-slate-400">{clan.members.length} участников</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {clans.length === 0 && <p className="text-center text-slate-500 py-8">Нет кланов</p>}
    </div>
  );
}

function ProfilePage({ currentUser, refreshUser }: { currentUser: User | null; refreshUser: () => void }) {
  const [addFriendSearch, setAddFriendSearch] = useState('');
  const [friends, setFriends] = useState<User[]>([]);

  useEffect(() => {
    if (currentUser) {
      const friendList = currentUser.friends.map(fId => store.getUserById(fId)).filter(Boolean) as User[];
      setFriends(friendList);
    }
  }, [currentUser]);

  if (!currentUser || currentUser.id === 'guest') {
    return <div className="text-center py-12 text-slate-400">Войдите для просмотра профиля</div>;
  }

  const addFriend = (friendId: string) => {
    if (!currentUser) return;
    if (currentUser.friends.includes(friendId)) return;
    const user = { ...currentUser, friends: [...currentUser.friends, friendId] };
    store.saveUser(user);
    refreshUser();
    setAddFriendSearch('');
  };

  const removeFriend = (friendId: string) => {
    if (!currentUser) return;
    const user = { ...currentUser, friends: currentUser.friends.filter(f => f !== friendId) };
    store.saveUser(user);
    refreshUser();
  };

  const allUsers = store.getUsers().filter(u => u.role === 'player' && u.id !== currentUser.id);
  const filteredUsers = allUsers.filter(u => u.nickname.toLowerCase().includes(addFriendSearch.toLowerCase()));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-cyan-600 flex items-center justify-center text-2xl font-bold">
            {currentUser.nickname[0].toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{currentUser.nickname}</h2>
            <p className="text-slate-400">Уровень {currentUser.level} • {currentUser.xp} XP</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-slate-700/50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-cyan-400">{currentUser.gamesPlayed}</div>
            <div className="text-xs text-slate-400">Игр</div>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-green-400">{currentUser.gamesWon}</div>
            <div className="text-xs text-slate-400">Побед</div>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-red-400">{currentUser.gamesLost}</div>
            <div className="text-xs text-slate-400">Поражений</div>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-yellow-400">{currentUser.friends.length}</div>
            <div className="text-xs text-slate-400">Друзей</div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-4">
        <h3 className="font-bold text-lg">👥 Друзья ({friends.length})</h3>
        
        <div className="space-y-2">
          {friends.map(friend => (
            <div key={friend.id} className="bg-slate-700/50 rounded-lg p-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{friend.nickname}</div>
                <div className="text-xs text-slate-400">Уровень {friend.level}</div>
              </div>
              <button onClick={() => removeFriend(friend.id)} className="text-red-400 text-xs hover:underline">Удалить</button>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <h4 className="font-bold text-sm">Добавить друга:</h4>
          <input value={addFriendSearch} onChange={e => setAddFriendSearch(e.target.value)} placeholder="Поиск по нику..." className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {filteredUsers.filter(u => !currentUser.friends.includes(u.id)).slice(0, 5).map(u => (
              <div key={u.id} className="bg-slate-700/30 rounded-lg p-2 flex items-center justify-between">
                <span className="text-sm">{u.nickname}</span>
                <button onClick={() => addFriend(u.id)} className="text-green-400 text-xs hover:underline">+ Добавить</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FederationsPage({ currentUser }: { currentUser: User | null; refreshUser: () => void }) {
  const [federations, setFederations] = useState<Federation[]>([]);

  useEffect(() => { setFederations(store.getFederations()); }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">🏛️ Федерации</h2>
      <div className="space-y-3">
        {federations.map(fed => (
          <div key={fed.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="font-bold text-lg">{fed.name}</div>
            <div className="text-sm text-slate-400">{fed.clans.length} кланов • {fed.members.length} участников</div>
          </div>
        ))}
        {federations.length === 0 && <p className="text-center text-slate-500 py-8">Нет федераций</p>}
      </div>
    </div>
  );
}

function RatingPage() {
  const users = store.getUsers().filter(u => u.role === 'player').sort((a, b) => b.xp - a.xp);
  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🏆 Рейтинг</h2>
      <div className="bg-slate-800/50 rounded-xl border border-slate-700">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-slate-700"><th className="p-3 text-left">#</th><th className="p-3 text-left">Игрок</th><th className="p-3 text-center">XP</th></tr></thead>
          <tbody>
            {users.slice(0, 20).map((u, i) => (
              <tr key={u.id} className="border-b border-slate-700/50">
                <td className="p-3">{i + 1}</td>
                <td className="p-3 font-medium">{u.nickname}</td>
                <td className="p-3 text-center text-cyan-400">{u.xp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SupportPage({ currentUser }: { currentUser: User | null }) {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [ticketNumber, setTicketNumber] = useState('');

  const submitTicket = () => {
    if (!subject || !message) return;
    if (!currentUser && !email) { alert('Укажите email'); return; }
    
    const num = store.generateTicketNumber();
    const ticket: GuestTicket = {
      id: uuidv4(), ticketNumber: num, email: currentUser?.email || email, subject, message,
      status: 'open', replies: [], createdAt: new Date().toISOString(),
    };
    store.saveGuestTicket(ticket);
    setTicketNumber(num);
    setEmail(''); setSubject(''); setMessage('');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">📧 Поддержка</h2>
      
      {ticketNumber && (
        <div className="bg-green-900/20 border border-green-700 rounded-xl p-4">
          <p className="text-green-400 font-bold">✓ Обращение отправлено!</p>
          <p className="text-sm text-slate-300 mt-1">Номер: <span className="font-mono text-cyan-400">{ticketNumber}</span></p>
        </div>
      )}

      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-3">
        <h3 className="font-bold">Новое обращение</h3>
        {!currentUser && <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email (обязательно для гостей)" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm" />}
        <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Тема" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
        <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Сообщение..." className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm" rows={4} />
        <button onClick={submitTicket} className="px-4 py-2 bg-cyan-600 rounded-lg text-sm">Отправить</button>
      </div>
    </div>
  );
}

function AdminPage({ currentUser, refreshUser }: { currentUser: User | null; refreshUser: () => void }) {
  const [tab, setTab] = useState<'users' | 'rooms' | 'tickets' | 'schools' | 'clans' | 'federations' | 'chat' | 'settings' | 'permissions'>('users');
  const [users, setUsers] = useState(store.getUsers());
  const [rooms, setRooms] = useState(store.getRooms());
  const [banUserId, setBanUserId] = useState('');
  const [banReason, setBanReason] = useState('');
  const [banDuration, setBanDuration] = useState('');
  const [editUserId, setEditUserId] = useState('');
  const [editNickname, setEditNickname] = useState('');
  const [editXP, setEditXP] = useState('');
  const [permissions, setPermissions] = useState<RolePermission[]>(store.getRolePermissions());

  if (!currentUser || currentUser.role !== 'admin') return <div className="text-center py-12 text-red-400">Доступ запрещён</div>;

  const banUser = (permanent: boolean) => {
    if (!banUserId || !banReason) return;
    const user = store.getUserById(banUserId);
    if (!user) return;
    user.banned = true;
    user.banReason = banReason;
    if (!permanent && banDuration) user.banExpiresAt = new Date(Date.now() + parseInt(banDuration) * 60000).toISOString();
    store.saveUser(user);
    setUsers(store.getUsers());
    setBanUserId(''); setBanReason(''); setBanDuration('');
  };

  const editUser = () => {
    if (!editUserId) return;
    const user = store.getUserById(editUserId);
    if (!user) return;
    if (editNickname) user.nickname = editNickname;
    if (editXP) user.xp = parseInt(editXP);
    store.saveUser(user);
    setUsers(store.getUsers());
    setEditUserId(''); setEditNickname(''); setEditXP('');
  };

  const deleteUser = (userId: string) => {
    if (!confirm('Удалить пользователя?')) return;
    const allUsers = store.getUsers().filter(u => u.id !== userId);
    localStorage.setItem('skln_users', JSON.stringify(allUsers));
    setUsers(allUsers);
  };

  const updatePermission = (permId: string, field: keyof RolePermission, value: boolean) => {
    const perm = permissions.find(p => p.id === permId);
    if (!perm) return;
    (perm as any)[field] = value;
    store.saveRolePermission(perm);
    setPermissions([...permissions]);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">⚙️ Админка</h2>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setTab('users')} className={`px-3 py-2 rounded-lg text-sm ${tab === 'users' ? 'bg-cyan-600' : 'bg-slate-700'}`}>👥 Пользователи</button>
        <button onClick={() => setTab('rooms')} className={`px-3 py-2 rounded-lg text-sm ${tab === 'rooms' ? 'bg-cyan-600' : 'bg-slate-700'}`}>🚪 Комнаты</button>
        <button onClick={() => setTab('tickets')} className={`px-3 py-2 rounded-lg text-sm ${tab === 'tickets' ? 'bg-cyan-600' : 'bg-slate-700'}`}>📧 Тикеты</button>
        <button onClick={() => setTab('schools')} className={`px-3 py-2 rounded-lg text-sm ${tab === 'schools' ? 'bg-cyan-600' : 'bg-slate-700'}`}>🏫 Школы</button>
        <button onClick={() => setTab('clans')} className={`px-3 py-2 rounded-lg text-sm ${tab === 'clans' ? 'bg-cyan-600' : 'bg-slate-700'}`}>🛡️ Кланы</button>
        <button onClick={() => setTab('federations')} className={`px-3 py-2 rounded-lg text-sm ${tab === 'federations' ? 'bg-cyan-600' : 'bg-slate-700'}`}>🏛️ Федерации</button>
        <button onClick={() => setTab('chat')} className={`px-3 py-2 rounded-lg text-sm ${tab === 'chat' ? 'bg-cyan-600' : 'bg-slate-700'}`}>💬 Чат</button>
        <button onClick={() => setTab('settings')} className={`px-3 py-2 rounded-lg text-sm ${tab === 'settings' ? 'bg-cyan-600' : 'bg-slate-700'}`}>⚙️ Настройки</button>
        <button onClick={() => setTab('permissions')} className={`px-3 py-2 rounded-lg text-sm ${tab === 'permissions' ? 'bg-cyan-600' : 'bg-slate-700'}`}>🔐 Права</button>
      </div>

      {tab === 'users' && (
        <div className="space-y-4">
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-3">
            <h3 className="font-bold">✏️ Редактировать пользователя</h3>
            <select value={editUserId} onChange={e => setEditUserId(e.target.value)} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm">
              <option value="">-- Выберите --</option>
              {users.filter(u => u.role === 'player').map(u => <option key={u.id} value={u.id}>{u.nickname}</option>)}
            </select>
            <input value={editNickname} onChange={e => setEditNickname(e.target.value)} placeholder="Новый ник" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
            <input value={editXP} onChange={e => setEditXP(e.target.value)} placeholder="Новый XP" type="number" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
            <div className="flex gap-2">
              <button onClick={editUser} className="px-4 py-2 bg-green-600 rounded-lg text-sm">Сохранить</button>
              {editUserId && <button onClick={() => deleteUser(editUserId)} className="px-4 py-2 bg-red-600 rounded-lg text-sm">Удалить</button>}
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-3">
            <h3 className="font-bold">🚫 Бан пользователя</h3>
            <select value={banUserId} onChange={e => setBanUserId(e.target.value)} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm">
              <option value="">-- Выберите --</option>
              {users.filter(u => u.role === 'player').map(u => <option key={u.id} value={u.id}>{u.nickname}</option>)}
            </select>
            <input value={banReason} onChange={e => setBanReason(e.target.value)} placeholder="Причина" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
            <input value={banDuration} onChange={e => setBanDuration(e.target.value)} placeholder="Длительность (минут)" type="number" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
            <div className="flex gap-2">
              <button onClick={() => banUser(false)} className="px-4 py-2 bg-yellow-600 rounded-lg text-sm">Бан по таймеру</button>
              <button onClick={() => banUser(true)} className="px-4 py-2 bg-red-600 rounded-lg text-sm">Навсегда</button>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-3">
            <h3 className="font-bold">👥 Все пользователи ({users.length})</h3>
            {users.map(u => (
              <div key={u.id} className="bg-slate-700/50 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{u.nickname} <span className="text-xs text-slate-500">({u.role})</span></div>
                  {u.banned && (
                    <div className="text-xs text-red-400 mt-1">
                      ⛔ ЗАБАНЕН {u.banExpiresAt ? `до ${new Date(u.banExpiresAt).toLocaleString()}` : 'навсегда'}
                      {u.banReason && <div className="text-slate-400">Причина: {u.banReason}</div>}
                    </div>
                  )}
                </div>
                {u.banned && (
                  <button 
                    onClick={() => {
                      u.banned = false;
                      u.banExpiresAt = undefined;
                      u.banReason = undefined;
                      store.saveUser(u);
                      setUsers(store.getUsers());
                    }}
                    className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-xs"
                  >
                    ✓ Разблокировать
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'permissions' && (
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-4">
          <h3 className="font-bold text-lg">🔐 Настройка прав ролей</h3>
          {permissions.map(perm => (
            <div key={perm.id} className="bg-slate-700/50 rounded-lg p-4 space-y-3">
              <h4 className="font-bold text-cyan-400 capitalize">{perm.role === 'guest' ? 'Гость' : perm.role === 'player' ? 'Игрок' : 'Админ'}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={perm.canChat} onChange={e => updatePermission(perm.id, 'canChat', e.target.checked)} className="rounded" />
                  Может писать в чат
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={perm.canCreateClan} onChange={e => updatePermission(perm.id, 'canCreateClan', e.target.checked)} className="rounded" />
                  Может создавать кланы
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={perm.canCreateRoom} onChange={e => updatePermission(perm.id, 'canCreateRoom', e.target.checked)} className="rounded" />
                  Может создавать комнаты
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={perm.canPlayWithAI} onChange={e => updatePermission(perm.id, 'canPlayWithAI', e.target.checked)} className="rounded" />
                  Может играть с ИИ
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={perm.canSeeRating} onChange={e => updatePermission(perm.id, 'canSeeRating', e.target.checked)} className="rounded" />
                  Может видеть рейтинг
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={perm.canCreateFederation} onChange={e => updatePermission(perm.id, 'canCreateFederation', e.target.checked)} className="rounded" />
                  Может создавать федерации
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={perm.canSendSupport} onChange={e => updatePermission(perm.id, 'canSendSupport', e.target.checked)} className="rounded" />
                  Может отправлять в поддержку
                </label>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'rooms' && (
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-3">
          <h3 className="font-bold">🚪 Комнаты ({rooms.length})</h3>
          {rooms.map(r => (
            <div key={r.id} className="bg-slate-700/50 rounded-lg p-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">{r.name}</div>
                <div className="text-xs text-slate-400">{store.getUserById(r.creatorId)?.nickname}</div>
              </div>
              <button onClick={() => { store.deleteRoom(r.id); setRooms(store.getRooms()); }} className="p-1.5 bg-red-600 rounded"><Trash2 className="w-3 h-3" /></button>
            </div>
          ))}
        </div>
      )}

      {tab === 'tickets' && (
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-3">
          <h3 className="font-bold">📧 Тикеты ({store.getGuestTickets().length})</h3>
          {store.getGuestTickets().map(t => (
            <div key={t.id} className="bg-slate-700/50 rounded-lg p-3">
              <div className="font-mono text-xs text-cyan-400">{t.ticketNumber}</div>
              <div className="text-sm font-medium">{t.subject}</div>
              <div className="text-xs text-slate-400">{t.email} • {new Date(t.createdAt).toLocaleString()}</div>
              <div className="text-sm text-slate-300 mt-1">{t.message}</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'schools' && (
        <div className="space-y-4">
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-3">
            <h3 className="font-bold">📥 Импорт школ из Excel</h3>
            <p className="text-sm text-slate-400">Формат: name, region, area, city, address, buildingNumber</p>
            <input 
              type="file" 
              accept=".xlsx,.xls,.csv"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (event) => {
                  const data = new Uint8Array(event.target?.result as ArrayBuffer);
                  const workbook = XLSX.read(data, { type: 'array' });
                  const sheetName = workbook.SheetNames[0];
                  const worksheet = workbook.Sheets[sheetName];
                  const json = XLSX.utils.sheet_to_json(worksheet) as any[];
                  
                  let imported = 0;
                  json.forEach(row => {
                    if (row.name && row.city) {
                      const school: SchoolType = {
                        id: uuidv4(),
                        name: row.name,
                        region: row.region || '',
                        area: row.area || '',
                        city: row.city,
                        address: row.address || '',
                        buildingNumber: row.buildingNumber || '',
                        approved: true,
                        createdAt: new Date().toISOString(),
                        students: []
                      };
                      store.saveSchool(school);
                      imported++;
                    }
                  });
                  alert(`Импортировано школ: ${imported}`);
                  refreshUser();
                };
                reader.readAsArrayBuffer(file);
              }}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm"
            />
            <button 
              onClick={() => {
                const csv = 'name,region,area,city,address,buildingNumber\nШкола №1,Московская область,Одинцовский,Одинцово,ул. Ленина,15\nГимназия №5,Московская область,Красногорский,Красногорск,ул. Школьная,3';
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'schools_template.csv';
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="inline-block px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-sm"
            >
              📄 Скачать шаблон CSV
            </button>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-3">
            <h3 className="font-bold">🏫 Заявки на одобрение</h3>
            {store.getSchools().filter(s => !s.approved).map(s => (
              <div key={s.id} className="bg-slate-700/50 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{s.name}</div>
                  <div className="text-xs text-slate-400">{s.city}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { s.approved = true; store.saveSchool(s); refreshUser(); }} className="px-3 py-1 bg-green-600 rounded text-xs">✓ Одобрить</button>
                  <button onClick={() => { if (confirm('Отклонить заявку?')) { const schools = store.getSchools().filter(x => x.id !== s.id); localStorage.setItem('skln_schools', JSON.stringify(schools)); refreshUser(); } }} className="px-3 py-1 bg-red-600 rounded text-xs">✕ Отклонить</button>
                </div>
              </div>
            ))}
            {store.getSchools().filter(s => !s.approved).length === 0 && <p className="text-slate-500 text-sm">Нет заявок</p>}
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-3">
            <h3 className="font-bold">🏫 Все школы ({store.getSchools().filter(s => s.approved).length})</h3>
            {store.getSchools().filter(s => s.approved).map(s => (
              <div key={s.id} className="bg-slate-700/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-sm font-medium">{s.name}</div>
                    <div className="text-xs text-slate-400">{s.city} • {s.students.length} учеников</div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        const newName = prompt('Новое название школы:', s.name);
                        if (newName && newName !== s.name) {
                          s.name = newName;
                          const newCity = prompt('Новый город:', s.city);
                          if (newCity) s.city = newCity;
                          store.saveSchool(s);
                          refreshUser();
                        }
                      }}
                      className="p-1.5 bg-blue-600 rounded"
                      title="Редактировать"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={() => { if (confirm('Удалить школу?')) { const schools = store.getSchools().filter(x => x.id !== s.id); localStorage.setItem('skln_schools', JSON.stringify(schools)); refreshUser(); } }} 
                      className="p-1.5 bg-red-600 rounded"
                      title="Удалить"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'clans' && (
        <div className="space-y-4">
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-3">
            <h3 className="font-bold">➕ Создать новый клан</h3>
            <input 
              id="newClanName"
              placeholder="Название клана" 
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm" 
            />
            <input 
              id="newClanTag"
              placeholder="Тег (5 символов)" 
              maxLength={5}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm" 
            />
            <button 
              onClick={() => {
                const name = (document.getElementById('newClanName') as HTMLInputElement).value;
                const tag = (document.getElementById('newClanTag') as HTMLInputElement).value;
                if (!name || !tag || tag.length !== 5) {
                  alert('Заполните все поля. Тег должен быть ровно 5 символов.');
                  return;
                }
                const clan: Clan = {
                  id: uuidv4(),
                  name,
                  tag,
                  logo: '⚔️',
                  color: '#00ffff',
                  creatorId: currentUser.id,
                  members: [],
                  wins: 0,
                  losses: 0,
                  draws: 0,
                  createdAt: new Date().toISOString()
                };
                store.saveClan(clan);
                refreshUser();
              }}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm"
            >
              Создать клан
            </button>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-3">
            <h3 className="font-bold">🛡️ Все кланы ({store.getClans().length})</h3>
            {store.getClans().map(c => (
              <div key={c.id} className="bg-slate-700/50 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{c.name} [{c.tag}]</div>
                  <div className="text-xs text-slate-400">{c.members.length} участников • Побед: {c.wins} • Поражений: {c.losses}</div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      const newName = prompt('Новое название клана:', c.name);
                      if (newName && newName !== c.name) {
                        c.name = newName;
                        const newTag = prompt('Новый тег (5 символов):', c.tag);
                        if (newTag && newTag.length === 5) {
                          c.tag = newTag;
                        }
                        store.saveClan(c);
                        refreshUser();
                      }
                    }}
                    className="p-1.5 bg-blue-600 rounded"
                    title="Редактировать"
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                  <button 
                    onClick={() => {
                      const userId = prompt('ID пользователя для добавления:');
                      if (userId) {
                        const user = store.getUserById(userId);
                        if (user) {
                          if (!c.members.includes(userId)) {
                            c.members.push(userId);
                            user.clanId = c.id;
                            store.saveClan(c);
                            store.saveUser(user);
                            refreshUser();
                            alert('Пользователь добавлен в клан');
                          } else {
                            alert('Пользователь уже в клане');
                          }
                        } else {
                          alert('Пользователь не найден');
                        }
                      }
                    }}
                    className="p-1.5 bg-green-600 rounded"
                    title="Добавить участника"
                  >
                    <UserPlus className="w-3 h-3" />
                  </button>
                  <button 
                    onClick={() => {
                      const userId = prompt('ID пользователя для удаления из клана:');
                      if (userId && c.members.includes(userId)) {
                        c.members = c.members.filter(m => m !== userId);
                        const user = store.getUserById(userId);
                        if (user) {
                          user.clanId = undefined;
                          store.saveUser(user);
                        }
                        store.saveClan(c);
                        refreshUser();
                        alert('Пользователь удалён из клана');
                      } else {
                        alert('Пользователь не найден в клане');
                      }
                    }}
                    className="p-1.5 bg-yellow-600 rounded"
                    title="Удалить участника"
                  >
                    <Ban className="w-3 h-3" />
                  </button>
                  <button 
                    onClick={() => {
                      const saveHistory = confirm('Сохранить историю и статистику клана?');
                      if (saveHistory) {
                        // Сохраняем в историю
                        const history = JSON.parse(localStorage.getItem('clan_history') || '[]');
                        history.push({
                          ...c,
                          deletedAt: new Date().toISOString(),
                          reason: 'Удалено администратором'
                        });
                        localStorage.setItem('clan_history', JSON.stringify(history));
                      }
                      
                      // Удаляем клан
                      const clans = store.getClans().filter(x => x.id !== c.id);
                      localStorage.setItem('skln_clans', JSON.stringify(clans));
                      
                      // Убираем clanId у участников
                      c.members.forEach(memberId => {
                        const user = store.getUserById(memberId);
                        if (user) {
                          user.clanId = undefined;
                          store.saveUser(user);
                        }
                      });
                      
                      refreshUser();
                    }}
                    className="p-1.5 bg-red-600 rounded"
                    title="Удалить"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {JSON.parse(localStorage.getItem('clan_history') || '[]').length > 0 && (
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-3">
              <h3 className="font-bold">📜 История удалённых кланов</h3>
              {JSON.parse(localStorage.getItem('clan_history') || '[]').map((c: any, i: number) => (
                <div key={i} className="bg-slate-700/50 rounded-lg p-3">
                  <div className="text-sm font-medium">{c.name} [{c.tag}]</div>
                  <div className="text-xs text-slate-400">Удалён: {new Date(c.deletedAt).toLocaleString()}</div>
                  <div className="text-xs text-slate-500">Статистика: Побед: {c.wins} • Поражений: {c.losses}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'federations' && (
        <div className="space-y-4">
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-3">
            <h3 className="font-bold">➕ Создать федерацию</h3>
            <input 
              id="newFedName"
              placeholder="Название федерации" 
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm" 
            />
            <button 
              onClick={() => {
                const name = (document.getElementById('newFedName') as HTMLInputElement).value;
                if (!name) {
                  alert('Введите название федерации');
                  return;
                }
                const fed: Federation = {
                  id: uuidv4(),
                  name,
                  creatorId: currentUser.id,
                  clans: [],
                  members: [],
                  wins: 0,
                  losses: 0,
                  createdAt: new Date().toISOString()
                };
                store.saveFederation(fed);
                refreshUser();
              }}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm"
            >
              Создать федерацию
            </button>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-3">
            <h3 className="font-bold">🏛️ Все федерации ({store.getFederations().length})</h3>
            {store.getFederations().map(f => (
              <div key={f.id} className="bg-slate-700/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-sm font-medium">{f.name}</div>
                    <div className="text-xs text-slate-400">{f.clans.length} кланов • {f.members.length} участников</div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        const newName = prompt('Новое название федерации:', f.name);
                        if (newName && newName !== f.name) {
                          f.name = newName;
                          store.saveFederation(f);
                          refreshUser();
                        }
                      }}
                      className="p-1.5 bg-blue-600 rounded"
                      title="Редактировать"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={() => {
                        const clanId = prompt('ID клана для добавления:');
                        if (clanId) {
                          const clan = store.getClans().find(c => c.id === clanId);
                          if (clan) {
                            if (!f.clans.includes(clanId)) {
                              f.clans.push(clanId);
                              store.saveFederation(f);
                              refreshUser();
                              alert('Клан добавлен в федерацию');
                            } else {
                              alert('Клан уже в федерации');
                            }
                          } else {
                            alert('Клан не найден');
                          }
                        }
                      }}
                      className="p-1.5 bg-green-600 rounded"
                      title="Добавить клан"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm('Удалить федерацию?')) {
                          const feds = store.getFederations().filter(x => x.id !== f.id);
                          localStorage.setItem('skln_federations', JSON.stringify(feds));
                          refreshUser();
                        }
                      }}
                      className="p-1.5 bg-red-600 rounded"
                      title="Удалить"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                {f.clans.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="text-xs text-slate-500">Кланы в федерации:</div>
                    {f.clans.map(clanId => {
                      const clan = store.getClans().find(c => c.id === clanId);
                      if (!clan) return null;
                      return (
                        <div key={clanId} className="flex items-center justify-between bg-slate-600/50 rounded p-2">
                          <span className="text-xs">{clan.name} [{clan.tag}]</span>
                          <button 
                            onClick={() => {
                              f.clans = f.clans.filter(c => c !== clanId);
                              store.saveFederation(f);
                              refreshUser();
                            }}
                            className="text-xs text-red-400 hover:underline"
                          >
                            Удалить
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'chat' && (
        <div className="space-y-4">
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-3">
            <h3 className="font-bold">📢 Отправить админское сообщение</h3>
            <select 
              id="adminMsgTarget"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm"
            >
              <option value="all">Все чаты</option>
              <option value="main">Только общий чат</option>
              {store.getClans().map(c => (
                <option key={c.id} value={`clan_${c.id}`}>Клан: {c.name}</option>
              ))}
            </select>
            <textarea 
              id="adminMsgText"
              placeholder="Текст сообщения..." 
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm"
              rows={3}
            />
            <input 
              id="adminMsgDuration"
              type="number"
              placeholder="Время отображения (минут, 0 = навсегда)" 
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm"
            />
            <button 
              onClick={() => {
                const target = (document.getElementById('adminMsgTarget') as HTMLSelectElement).value;
                const text = (document.getElementById('adminMsgText') as HTMLTextAreaElement).value;
                const duration = parseInt((document.getElementById('adminMsgDuration') as HTMLInputElement).value) || 0;
                
                if (!text) {
                  alert('Введите текст сообщения');
                  return;
                }

                const expiresAt = duration > 0 ? new Date(Date.now() + duration * 60000).toISOString() : undefined;

                if (target === 'all' || target === 'main') {
                  const msg: ChatMessage = {
                    id: uuidv4(),
                    userId: 'admin',
                    nickname: '🔔 АДМИН',
                    text,
                    timestamp: new Date().toISOString(),
                    expiresAt
                  };
                  store.addChatMessage(msg);
                }

                if (target === 'all' || target.startsWith('clan_')) {
                  const clanIds = target === 'all' ? store.getClans().map(c => c.id) : [target.replace('clan_', '')];
                  clanIds.forEach(clanId => {
                    const msg: ClanChatMessage = {
                      id: uuidv4(),
                      clanId,
                      userId: 'admin',
                      nickname: '🔔 АДМИН',
                      text,
                      timestamp: new Date().toISOString(),
                      expiresAt
                    };
                    store.addClanChatMessage(msg);
                  });
                }

                alert('Сообщение отправлено');
                (document.getElementById('adminMsgText') as HTMLTextAreaElement).value = '';
                (document.getElementById('adminMsgDuration') as HTMLInputElement).value = '';
              }}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-sm"
            >
              Отправить сообщение
            </button>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-3">
            <h3 className="font-bold">💬 Общий чат ({store.getChatMessages().length} сообщений)</h3>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {store.getChatMessages().slice(-20).reverse().map(msg => (
                <div key={msg.id} className="bg-slate-700/50 rounded-lg p-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-cyan-400 font-bold">{msg.nickname}</span>
                    <span className="text-xs text-slate-500">{new Date(msg.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="text-sm text-slate-300 mt-1">{msg.text}</div>
                </div>
              ))}
            </div>
            <button onClick={() => { localStorage.setItem('skln_chat', JSON.stringify([])); alert('Чат очищен'); refreshUser(); }} className="px-4 py-2 bg-red-600 rounded-lg text-sm">Очистить весь чат</button>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-3">
            <h3 className="font-bold">💬 Чаты кланов</h3>
            {store.getClans().map(clan => {
              const messages = store.getClanChat(clan.id);
              return (
                <div key={clan.id} className="bg-slate-700/50 rounded-lg p-3">
                  <div className="font-medium text-sm mb-2">{clan.name} [{clan.tag}] ({messages.length} сообщений)</div>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {messages.slice(-5).map(msg => (
                      <div key={msg.id} className="text-xs bg-slate-600/50 rounded p-2">
                        <span className="text-cyan-400">{msg.nickname}:</span> {msg.text}
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => {
                      store.clearClanChat(clan.id);
                      refreshUser();
                    }}
                    className="mt-2 px-3 py-1 bg-red-600 rounded text-xs"
                  >
                    Очистить чат клана
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === 'settings' && (
        <div className="space-y-4">
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-3">
            <h3 className="font-bold">⚙️ Основные настройки игры</h3>
            
            <div>
              <label className="block text-sm text-slate-400 mb-1">Время на ход (секунды)</label>
              <input 
                type="number"
                value={store.getSettings().turnTime}
                onChange={(e) => {
                  const settings = store.getSettings();
                  settings.turnTime = parseInt(e.target.value) || 30;
                  store.saveSettings(settings);
                  refreshUser();
                }}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">XP за победу</label>
              <input 
                type="number"
                value={store.getSettings().xpPerWin}
                onChange={(e) => {
                  const settings = store.getSettings();
                  settings.xpPerWin = parseInt(e.target.value) || 50;
                  store.saveSettings(settings);
                  refreshUser();
                }}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">XP за выстрел</label>
              <input 
                type="number"
                value={store.getSettings().xpPerShot}
                onChange={(e) => {
                  const settings = store.getSettings();
                  settings.xpPerShot = parseInt(e.target.value) || 1;
                  store.saveSettings(settings);
                  refreshUser();
                }}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">XP за точный выстрел</label>
              <input 
                type="number"
                value={store.getSettings().xpPerAccuracy}
                onChange={(e) => {
                  const settings = store.getSettings();
                  settings.xpPerAccuracy = parseInt(e.target.value) || 5;
                  store.saveSettings(settings);
                  refreshUser();
                }}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Пороги уровней (через запятую)</label>
              <input 
                type="text"
                value={store.getSettings().levelThresholds.join(', ')}
                onChange={(e) => {
                  const settings = store.getSettings();
                  settings.levelThresholds = e.target.value.split(',').map(n => parseInt(n.trim()) || 0);
                  store.saveSettings(settings);
                  refreshUser();
                }}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-3">
            <h3 className="font-bold">📢 Отображение на главной странице</h3>
            
            <label className="flex items-center gap-2 text-sm">
              <input 
                type="checkbox" 
                checked={store.getSettings().showAnnouncements}
                onChange={(e) => {
                  const settings = store.getSettings();
                  settings.showAnnouncements = e.target.checked;
                  store.saveSettings(settings);
                  refreshUser();
                }}
                className="rounded"
              />
              Показывать объявления
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input 
                type="checkbox" 
                checked={store.getSettings().showTournamentHistory}
                onChange={(e) => {
                  const settings = store.getSettings();
                  settings.showTournamentHistory = e.target.checked;
                  store.saveSettings(settings);
                  refreshUser();
                }}
                className="rounded"
              />
              Показывать историю турниров
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input 
                type="checkbox" 
                checked={store.getSettings().pinAdminMessages}
                onChange={(e) => {
                  const settings = store.getSettings();
                  settings.pinAdminMessages = e.target.checked;
                  store.saveSettings(settings);
                  refreshUser();
                }}
                className="rounded"
              />
              Закреплять админские сообщения в чате
            </label>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-3">
            <h3 className="font-bold">🎮 Игровые параметры</h3>
            <p className="text-sm text-slate-400">Количество пропусков ходов до поражения: 2</p>
            <p className="text-sm text-slate-400">Размер поля: 10x10</p>
            <p className="text-sm text-slate-400">Флот: 1×4-палубный, 2×3-палубных, 3×2-палубных, 4×1-палубных</p>
            <p className="text-sm text-slate-400">Минимальное расстояние между кораблями: 1 клетка</p>
          </div>
        </div>
      )}
    </div>
  );
}
