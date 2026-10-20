import React, { useState, useEffect, Fragment } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Home, Users, Trophy, MessageSquare, Shield, School, HelpCircle, Settings, LogOut, User as UserIcon, Gamepad2, Swords, Crown, Plus, Send, Heart, Star, Menu, Mail, Check, Trash2, Ban } from 'lucide-react';
import { User, Game, Room, Clan, Federation, School as SchoolType, ChatMessage, Question, AdminTicket, GuestTicket } from './types';
import * as store from './store';
import { generateRandomPlacement, processShot, isAllSunk, getSunkShipCells, getHitCells } from './gameLogic';
import { v4 as uuidv4 } from 'uuid';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [bgColor, setBgColor] = useState('#0f172a');

  useEffect(() => {
    store.initDefaults();
    const user = store.getCurrentUser();
    if (user) { setCurrentUser(user); setBgColor(user.backgroundColor); }
    store.setOnlineCount(Math.floor(Math.random() * 50) + 20);
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
                <span className="text-cyan-400">SKLN</span><span>.МОРСКОЙ БОЙ</span>
              </Link>
              <div className="hidden md:flex items-center gap-4">
                <Link to="/" className="text-sm text-slate-300 hover:text-cyan-400">Главная</Link>
                <Link to="/rooms" className="text-sm text-slate-300 hover:text-cyan-400">Комнаты</Link>
                <Link to="/rating" className="text-sm text-slate-300 hover:text-cyan-400">Рейтинг</Link>
                <Link to="/chat" className="text-sm text-slate-300 hover:text-cyan-400">Чат</Link>
                <Link to="/clans" className="text-sm text-slate-300 hover:text-cyan-400">Кланы</Link>
                <Link to="/support" className="text-sm text-slate-300 hover:text-cyan-400">Поддержка</Link>
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

  return (
    <div className="flex gap-6">
      <div className="hidden lg:block w-64">
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
      </div>

      <div className="flex-1">
        <div className="text-center py-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-3"><span className="text-cyan-400">SKLN</span>.МОРСКОЙ БОЙ</h1>
          <p className="text-slate-400">Классическая игра в морском бое онлайн</p>
        </div>

        <div className="lg:hidden grid grid-cols-3 gap-2 mb-6">
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-green-400">{online}</div>
            <div className="text-xs text-slate-400">Онлайн</div>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-yellow-400">{yesterday}</div>
            <div className="text-xs text-slate-400">Вчера</div>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-purple-400">{total.toLocaleString()}</div>
            <div className="text-xs text-slate-400">Всего</div>
          </div>
        </div>

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
    if (user.banned) { setError(`Заблокирован${user.banExpiresAt ? ` до ${new Date(user.banExpiresAt).toLocaleString()}` : ' навсегда'}`); return; }
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
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const navigate = useNavigate();

  const schools = store.getSchools().filter(s => s.approved);
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

  const playWithAI = () => { if (currentUser) startGame(currentUser.id, 'ai'); };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Комнаты</h2>
        <div className="flex gap-2">
          {currentUser && <button onClick={playWithAI} className="px-4 py-2 bg-purple-600 rounded-lg text-sm">ИИ</button>}
          {currentUser && currentUser.id !== 'guest' && <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-cyan-600 rounded-lg text-sm"><Plus className="w-4 h-4 inline" /> Создать</button>}
        </div>
      </div>

      {showCreate && (
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 space-y-3">
          <select value={selectedSchoolId} onChange={e => setSelectedSchoolId(e.target.value)} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm">
            <option value="">-- Школа --</option>
            {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <input value={roomName} onChange={e => setRoomName(e.target.value)} placeholder="Название" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <button onClick={() => { if (currentUser && roomName && selectedSchoolId) { store.saveRoom({ id: uuidv4(), name: roomName, creatorId: currentUser.id, players: [currentUser.id], maxPlayers: 2, isPrivate: false, createdAt: new Date().toISOString(), schoolId: selectedSchoolId }); setRooms(store.getRooms()); setShowCreate(false); } }} className="px-4 py-2 bg-green-600 rounded-lg text-sm">Создать</button>
        </div>
      )}

      <div className="space-y-3">
        {rooms.map(room => (
          <div key={room.id} className="flex items-center justify-between bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div>
              <div className="font-medium">{room.name}</div>
              <div className="text-sm text-slate-400">{room.players.length}/{room.maxPlayers}</div>
            </div>
            <button onClick={() => currentUser && startGame(currentUser.id, room.players[0])} disabled={!currentUser} className="px-4 py-2 bg-cyan-600 rounded-lg text-sm">Войти</button>
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

  useEffect(() => { setGame(store.getGames().find(x => x.id === gameId) || null); }, [gameId]);

  if (!game) return <div>Загрузка...</div>;

  const handleShot = (row: number, col: number) => {
    if (!currentUser || game.currentTurn !== currentUser.id) return;
    const targetBoard = currentUser.id === game.player1Id ? game.player2Board : game.player1Board;
    if (targetBoard.shots.some(s => s.row === row && s.col === col) || targetBoard.missedShots.some(s => s.row === row && s.col === col)) return;

    const result = processShot(targetBoard, row, col);
    if (isAllSunk(targetBoard)) { game.status = 'finished'; game.winner = currentUser.id; }
    else if (!result.hit) game.currentTurn = game.player1Id === currentUser.id ? game.player2Id : game.player1Id;

    store.saveGame(game);
    setGame({ ...game });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Игра vs {game.player2Id === 'ai' ? 'ИИ' : store.getUserById(game.player2Id)?.nickname}</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <h3 className="text-sm text-slate-400 mb-2">Противник</h3>
          <GameGrid board={currentUser?.id === game.player1Id ? game.player2Board : game.player1Board} onCellClick={game.currentTurn === currentUser?.id ? handleShot : undefined} />
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <h3 className="text-sm text-slate-400 mb-2">Ваше поле</h3>
          <GameGrid board={currentUser?.id === game.player1Id ? game.player1Board : game.player2Board} showShips />
        </div>
      </div>
    </div>
  );
}

function GameGrid({ board, onCellClick, showShips }: { board: any; onCellClick?: (row: number, col: number) => void; showShips?: boolean }) {
  const sunkCells = getSunkShipCells(board);
  const labels = ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж', 'З', 'И', 'К'];

  return (
    <div className="inline-block">
      <div className="grid grid-cols-11 gap-0.5">
        <div className="w-6 h-6" />
        {Array.from({ length: 10 }, (_, i) => <div key={i} className="w-6 h-6 flex items-center justify-center text-xs text-slate-500">{i + 1}</div>)}
        {Array.from({ length: 10 }, (_, row) => (
          <React.Fragment key={row}>
            <div className="w-6 h-6 flex items-center justify-center text-xs text-slate-500">{labels[row]}</div>
            {Array.from({ length: 10 }, (_, col) => {
              const key = `${row},${col}`;
              const isShot = board.shots?.some((s: any) => s.row === row && s.col === col);
              const isMiss = board.missedShots?.some((s: any) => s.row === row && s.col === col);
              const isSunk = sunkCells.has(key);
              const hasShip = showShips && board.ships?.some((s: any) => s.cells.some((c: any) => c.row === row && c.col === col));

              let cls = 'w-6 h-6 rounded-sm flex items-center justify-center text-xs ';
              if (isSunk) cls += 'bg-red-600 ';
              else if (isShot) cls += 'bg-red-500/70 ';
              else if (isMiss) cls += 'bg-slate-600 ';
              else if (hasShip) cls += 'bg-cyan-700 ';
              else cls += 'bg-slate-700 hover:bg-slate-600 ';

              if (onCellClick && !isShot && !isMiss) cls += 'cursor-crosshair hover:bg-cyan-600/50 ';

              return <div key={col} className={cls} onClick={() => onCellClick?.(row, col)}>{(isShot || isSunk) && '✕'}{isMiss && '•'}</div>;
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
  useEffect(() => { setClans(store.getClans()); }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">🛡️ Кланы</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {clans.map(clan => (
          <div key={clan.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{clan.logo}</span>
              <div>
                <div className="font-bold">{clan.name}</div>
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
  const [myTickets, setMyTickets] = useState<GuestTicket[]>([]);

  useEffect(() => {
    if (currentUser) setMyTickets(store.getGuestTickets().filter(t => t.email === currentUser.email));
  }, [currentUser]);

  const submitTicket = () => {
    if (!email || !subject || !message) return;
    const num = store.generateTicketNumber();
    const ticket: GuestTicket = {
      id: uuidv4(), ticketNumber: num, email, subject, message,
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
          <p className="text-sm text-slate-300 mt-1">Номер обращения: <span className="font-mono text-cyan-400">{ticketNumber}</span></p>
          <p className="text-xs text-yellow-400 mt-2">⚠️ Гостевые обращения могут быть не рассмотрены</p>
        </div>
      )}

      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-3">
        <h3 className="font-bold">Новое обращение</h3>
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email (обязательно)" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
        <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Тема" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
        <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Сообщение..." className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm" rows={4} />
        <button onClick={submitTicket} className="px-4 py-2 bg-cyan-600 rounded-lg text-sm">Отправить</button>
        <p className="text-xs text-yellow-400">⚠️ Гостевые обращения могут быть не рассмотрены</p>
      </div>

      {myTickets.length > 0 && (
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-3">
          <h3 className="font-bold">Мои обращения</h3>
          {myTickets.map(t => (
            <div key={t.id} className="bg-slate-700/50 rounded-lg p-3">
              <div className="font-mono text-xs text-cyan-400">{t.ticketNumber}</div>
              <div className="font-medium text-sm">{t.subject}</div>
              <div className="text-xs text-slate-400">{new Date(t.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminPage({ currentUser, refreshUser }: { currentUser: User | null; refreshUser: () => void }) {
  const [tab, setTab] = useState<'users' | 'rooms' | 'tickets' | 'schools'>('users');
  const [users, setUsers] = useState(store.getUsers());
  const [rooms, setRooms] = useState(store.getRooms());
  const [guestTickets, setGuestTickets] = useState(store.getGuestTickets());
  const [banUserId, setBanUserId] = useState('');
  const [banReason, setBanReason] = useState('');
  const [banDuration, setBanDuration] = useState('');

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

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">⚙️ Админка</h2>
      <div className="flex gap-2">
        <button onClick={() => setTab('users')} className={`px-3 py-2 rounded-lg text-sm ${tab === 'users' ? 'bg-cyan-600' : 'bg-slate-700'}`}>👥 Пользователи</button>
        <button onClick={() => setTab('rooms')} className={`px-3 py-2 rounded-lg text-sm ${tab === 'rooms' ? 'bg-cyan-600' : 'bg-slate-700'}`}>🚪 Комнаты</button>
        <button onClick={() => setTab('tickets')} className={`px-3 py-2 rounded-lg text-sm ${tab === 'tickets' ? 'bg-cyan-600' : 'bg-slate-700'}`}>📧 Тикеты</button>
        <button onClick={() => setTab('schools')} className={`px-3 py-2 rounded-lg text-sm ${tab === 'schools' ? 'bg-cyan-600' : 'bg-slate-700'}`}>🏫 Школы</button>
      </div>

      {tab === 'users' && (
        <div className="space-y-4">
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-3">
            <h3 className="font-bold">🚫 Бан пользователя</h3>
            <select value={banUserId} onChange={e => setBanUserId(e.target.value)} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm">
              <option value="">-- Выберите --</option>
              {users.filter(u => u.role === 'player').map(u => <option key={u.id} value={u.id}>{u.nickname}</option>)}
            </select>
            <input value={banReason} onChange={e => setBanReason(e.target.value)} placeholder="Причина" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
            <input value={banDuration} onChange={e => setBanDuration(e.target.value)} placeholder="Длительность (минут, пусто = навсегда)" type="number" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
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
                  {u.banned && <span className="text-xs bg-red-600/30 text-red-400 px-2 py-0.5 rounded">ЗАБАНЕН</span>}
                </div>
              </div>
            ))}
          </div>
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
          <h3 className="font-bold">📧 Гостевые тикеты ({guestTickets.length})</h3>
          {guestTickets.map(t => (
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
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-3">
          <h3 className="font-bold">🏫 Школы</h3>
          {store.getSchools().filter(s => !s.approved).map(s => (
            <div key={s.id} className="bg-slate-700/50 rounded-lg p-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">{s.name}</div>
                <div className="text-xs text-slate-400">{s.city}</div>
              </div>
              <button onClick={() => { s.approved = true; store.saveSchool(s); }} className="px-3 py-1 bg-green-600 rounded text-xs">✓</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


