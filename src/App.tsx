import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Home, Users, Trophy, MessageSquare, Shield, School, HelpCircle, Settings, LogOut, User as UserIcon, Gamepad2, Swords, Crown, Plus, Send, Heart, Star, Menu, Mail, Check, Trash2, Ban, Edit, UserPlus } from 'lucide-react';
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

  const playWithAI = () => { if (currentUser) startGame(currentUser.id, 'ai'); };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Комнаты</h2>
        <div className="flex gap-2">
          <button onClick={playWithAI} className="px-4 py-2 bg-purple-600 rounded-lg text-sm">ИИ</button>
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
  const [placementMode, setPlacementMode] = useState(false);
  const [myBoard, setMyBoard] = useState(generateRandomPlacement());
  const [placementError, setPlacementError] = useState('');

  useEffect(() => { 
    const g = store.getGames().find(x => x.id === gameId);
    if (g) {
      setGame(g);
      // Установить доску игрока
      const playerBoard = currentUser?.id === g.player1Id ? g.player1Board : g.player2Board;
      setMyBoard(playerBoard);
    }
  }, [gameId]);

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

  const validatePlacement = (board: any): boolean => {
    // Проверка что все корабли расставлены
    if (board.ships.length !== 10) {
      setPlacementError('Не все корабли расставлены');
      return false;
    }
    // Проверка что между кораблями есть минимум 1 клетка
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
    if (currentUser?.id === game.player1Id) {
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
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Игра vs {game.player2Id === 'ai' ? 'ИИ' : store.getUserById(game.player2Id)?.nickname}</h2>
      
      {placementMode ? (
        <div className="space-y-4">
          <div className="bg-yellow-900/20 border border-yellow-700 rounded-xl p-4">
            <h3 className="font-bold text-yellow-400 mb-2">📍 Расставьте корабли</h3>
            <p className="text-sm text-slate-300">Автоматическая расстановка или настройте вручную</p>
            {placementError && <p className="text-sm text-red-400 mt-2">⚠️ {placementError}</p>}
          </div>
          <div className="flex gap-2">
            <button onClick={randomPlacement} className="px-4 py-2 bg-cyan-600 rounded-lg text-sm">🎲 Случайная расстановка</button>
            <button onClick={confirmPlacement} className="px-4 py-2 bg-green-600 rounded-lg text-sm">✓ Подтвердить</button>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <GameGrid board={myBoard} showShips />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <h3 className="text-sm text-slate-400 mb-2">Противник</h3>
            <GameGrid board={currentUser?.id === game.player1Id ? game.player2Board : game.player1Board} onCellClick={game.currentTurn === currentUser?.id ? handleShot : undefined} />
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <h3 className="text-sm text-slate-400 mb-2">Ваше поле</h3>
            <GameGrid board={myBoard} showShips />
            <button onClick={() => setPlacementMode(true)} className="mt-2 px-3 py-1 bg-slate-600 hover:bg-slate-500 rounded text-xs">Изменить расстановку</button>
          </div>
        </div>
      )}
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
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [tag, setTag] = useState('');
  const [color, setColor] = useState('#00ffff');
  const [logo, setLogo] = useState('⚔️');
  const [selectedClan, setSelectedClan] = useState<Clan | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteUserId, setInviteUserId] = useState('');

  useEffect(() => { setClans(store.getClans()); }, []);

  const createClan = () => {
    if (!currentUser || !name || !tag) return;
    if (tag.length !== 5) { alert('Тег должен быть 5 символов'); return; }
    const clan: Clan = {
      id: uuidv4(), name, tag, logo, color,
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

  const transferLeadership = (newLeaderId: string) => {
    if (!selectedClan || !currentUser) return;
    if (selectedClan.creatorId !== currentUser.id) { alert('Только лидер может передать права'); return; }
    selectedClan.creatorId = newLeaderId;
    store.saveClan(selectedClan);
    setClans(store.getClans());
    setSelectedClan({ ...selectedClan });
    alert('Права лидера переданы');
  };

  const inviteToClan = () => {
    if (!selectedClan || !inviteUserId || !currentUser) return;
    if (selectedClan.creatorId !== currentUser.id) { alert('Только лидер может приглашать'); return; }
    const user = store.getUserById(inviteUserId);
    if (!user) return;
    if (user.clanId) { alert('Пользователь уже в клане'); return; }
    user.clanId = selectedClan.id;
    store.saveUser(user);
    selectedClan.members.push(inviteUserId);
    store.saveClan(selectedClan);
    setClans(store.getClans());
    setSelectedClan({ ...selectedClan });
    setInviteUserId('');
    setShowInvite(false);
    alert('Пользователь добавлен в клан');
  };

  const joinClan = (clanId: string) => {
    if (!currentUser) return;
    const clan = store.getClans().find(c => c.id === clanId);
    if (!clan) return;
    if (!clan.members.includes(currentUser.id)) {
      clan.members.push(currentUser.id);
      store.saveClan(clan);
      const user = { ...currentUser, clanId: clan.id };
      store.saveUser(user);
      setClans(store.getClans());
      refreshUser();
    }
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

      {selectedClan && (
        <div className="bg-slate-800/50 rounded-xl p-6 border border-cyan-700 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">{selectedClan.name} [{selectedClan.tag}]</h3>
              <p className="text-sm text-slate-400">{selectedClan.members.length} участников</p>
            </div>
            <button onClick={() => setSelectedClan(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-sm">Участники:</h4>
            {selectedClan.members.map(mId => {
              const member = store.getUserById(mId);
              if (!member) return null;
              const isLeader = selectedClan.creatorId === mId;
              return (
                <div key={mId} className="bg-slate-700/50 rounded-lg p-2 flex items-center justify-between">
                  <span className="text-sm">{member.nickname} {isLeader && <span className="text-xs text-yellow-400">👑 Лидер</span>}</span>
                  {selectedClan.creatorId === currentUser?.id && !isLeader && (
                    <button onClick={() => transferLeadership(mId)} className="text-xs text-cyan-400 hover:underline">Передать лидера</button>
                  )}
                </div>
              );
            })}
          </div>

          {selectedClan.creatorId === currentUser?.id && (
            <div className="space-y-2">
              {showInvite ? (
                <div className="space-y-2">
                  <select value={inviteUserId} onChange={e => setInviteUserId(e.target.value)} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm">
                    <option value="">-- Выберите друга --</option>
                    {currentUser.friends.map(fId => {
                      const friend = store.getUserById(fId);
                      if (!friend || friend.clanId) return null;
                      return <option key={fId} value={fId}>{friend.nickname}</option>;
                    })}
                  </select>
                  <div className="flex gap-2">
                    <button onClick={inviteToClan} className="px-4 py-2 bg-green-600 rounded-lg text-sm">Пригласить</button>
                    <button onClick={() => setShowInvite(false)} className="px-4 py-2 bg-slate-600 rounded-lg text-sm">Отмена</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowInvite(true)} className="px-4 py-2 bg-cyan-600 rounded-lg text-sm"><UserPlus className="w-4 h-4 inline" /> Пригласить в клан</button>
              )}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {clans.map(clan => (
          <div key={clan.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 hover:border-cyan-600 transition cursor-pointer" onClick={() => setSelectedClan(clan)}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{clan.logo}</span>
              <div>
                <div className="font-bold">{clan.name} <span className="text-xs text-slate-400">[{clan.tag}]</span></div>
                <div className="text-xs text-slate-400">{clan.members.length} участников</div>
              </div>
            </div>
            {currentUser && !currentUser.clanId && currentUser.id !== 'guest' && (
              <button onClick={(e) => { e.stopPropagation(); joinClan(clan.id); }} className="mt-2 px-3 py-1 bg-cyan-600/80 hover:bg-cyan-500 rounded text-xs">Вступить</button>
            )}
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
          <p className="text-sm text-slate-300 mt-1">Номер: <span className="font-mono text-cyan-400">{ticketNumber}</span></p>
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

function FederationsPage({ currentUser, refreshUser }: { currentUser: User | null; refreshUser: () => void }) {
  const [federations, setFederations] = useState<Federation[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => { setFederations(store.getFederations()); }, []);

  const createFederation = () => {
    if (!currentUser || !name) return;
    const fed: Federation = {
      id: uuidv4(), name, creatorId: currentUser.id,
      clans: [], members: [currentUser.id],
      wins: 0, losses: 0, createdAt: new Date().toISOString(),
    };
    store.saveFederation(fed);
    setFederations(store.getFederations());
    setShowCreate(false);
    setName('');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">🏛️ Федерации</h2>
        {currentUser && currentUser.id !== 'guest' && (
          <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-cyan-600 rounded-lg text-sm"><Plus className="w-4 h-4 inline" /> Создать</button>
        )}
      </div>

      {showCreate && (
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 space-y-3">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Название федерации" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <button onClick={createFederation} className="px-4 py-2 bg-green-600 rounded-lg text-sm">Создать</button>
        </div>
      )}

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

function AdminPage({ currentUser, refreshUser }: { currentUser: User | null; refreshUser: () => void }) {
  const [tab, setTab] = useState<'users' | 'rooms' | 'tickets' | 'schools' | 'clans' | 'federations' | 'faq' | 'chat' | 'settings'>('users');
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
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setTab('users')} className={`px-3 py-2 rounded-lg text-sm ${tab === 'users' ? 'bg-cyan-600' : 'bg-slate-700'}`}>👥 Пользователи</button>
        <button onClick={() => setTab('rooms')} className={`px-3 py-2 rounded-lg text-sm ${tab === 'rooms' ? 'bg-cyan-600' : 'bg-slate-700'}`}>🚪 Комнаты</button>
        <button onClick={() => setTab('tickets')} className={`px-3 py-2 rounded-lg text-sm ${tab === 'tickets' ? 'bg-cyan-600' : 'bg-slate-700'}`}>📧 Тикеты</button>
        <button onClick={() => setTab('schools')} className={`px-3 py-2 rounded-lg text-sm ${tab === 'schools' ? 'bg-cyan-600' : 'bg-slate-700'}`}>🏫 Школы</button>
        <button onClick={() => setTab('clans')} className={`px-3 py-2 rounded-lg text-sm ${tab === 'clans' ? 'bg-cyan-600' : 'bg-slate-700'}`}>🛡️ Кланы</button>
        <button onClick={() => setTab('federations')} className={`px-3 py-2 rounded-lg text-sm ${tab === 'federations' ? 'bg-cyan-600' : 'bg-slate-700'}`}>🏛️ Федерации</button>
        <button onClick={() => setTab('faq')} className={`px-3 py-2 rounded-lg text-sm ${tab === 'faq' ? 'bg-cyan-600' : 'bg-slate-700'}`}>❓ FAQ</button>
        <button onClick={() => setTab('chat')} className={`px-3 py-2 rounded-lg text-sm ${tab === 'chat' ? 'bg-cyan-600' : 'bg-slate-700'}`}>💬 Чат</button>
        <button onClick={() => setTab('settings')} className={`px-3 py-2 rounded-lg text-sm ${tab === 'settings' ? 'bg-cyan-600' : 'bg-slate-700'}`}>⚙️ Настройки</button>
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
            <input value={banDuration} onChange={e => setBanDuration(e.target.value)} placeholder="Длительность (минут)" type="number" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
            <div className="flex gap-2">
              <button onClick={() => banUser(false)} className="px-4 py-2 bg-yellow-600 rounded-lg text-sm">Бан по таймеру</button>
              <button onClick={() => banUser(true)} className="px-4 py-2 bg-red-600 rounded-lg text-sm">Навсегда</button>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-3">
            <h3 className="font-bold">👥 Все пользователи ({users.length})</h3>
            {users.map(u => (
              <div key={u.id} className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-sm font-medium">{u.nickname} <span className="text-xs text-slate-500">({u.role})</span></div>
                {u.banned && <span className="text-xs bg-red-600/30 text-red-400 px-2 py-0.5 rounded">ЗАБАНЕН</span>}
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

      {tab === 'clans' && (
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-3">
          <h3 className="font-bold">🛡️ Кланы ({store.getClans().length})</h3>
          {store.getClans().map(c => (
            <div key={c.id} className="bg-slate-700/50 rounded-lg p-3">
              <div className="text-sm font-medium">{c.name} [{c.tag}]</div>
              <div className="text-xs text-slate-400">{c.members.length} участников</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'federations' && (
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-3">
          <h3 className="font-bold">🏛️ Федерации ({store.getFederations().length})</h3>
          {store.getFederations().map(f => (
            <div key={f.id} className="bg-slate-700/50 rounded-lg p-3">
              <div className="text-sm font-medium">{f.name}</div>
              <div className="text-xs text-slate-400">{f.clans.length} кланов</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'faq' && (
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-3">
          <h3 className="font-bold">❓ FAQ ({store.getQuestions().length})</h3>
          {store.getQuestions().map(q => (
            <div key={q.id} className="bg-slate-700/50 rounded-lg p-3">
              <div className="text-sm font-medium">{q.title}</div>
              <div className="text-xs text-slate-400">{q.text}</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'chat' && (
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-3">
          <h3 className="font-bold">💬 Чат ({store.getChatMessages().length} сообщений)</h3>
          <button onClick={() => { localStorage.setItem('skln_chat', JSON.stringify([])); alert('Чат очищен'); }} className="px-4 py-2 bg-red-600 rounded-lg text-sm">Очистить весь чат</button>
        </div>
      )}

      {tab === 'settings' && (
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-3">
          <h3 className="font-bold">⚙️ Настройки игры</h3>
          <p className="text-sm text-slate-400">Время на ход: {store.getSettings().turnTime} сек</p>
          <p className="text-sm text-slate-400">XP за победу: {store.getSettings().xpPerWin}</p>
        </div>
      )}
    </div>
  );
}
