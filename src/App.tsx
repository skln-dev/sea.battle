import { useState, useEffect, Fragment } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Home, Users, Trophy, MessageSquare, Shield, School, HelpCircle, Settings, LogIn, LogOut, User as UserIcon, Gamepad2, Swords, Crown, ChevronRight, Plus, Send, Heart, Star, Menu, Eye, EyeOff, Clock } from 'lucide-react';
import { User, Game, Room, Clan, Federation, School as SchoolType, ChatMessage, Question, AdminSettings } from './types';
import * as store from './store';
import { generateRandomPlacement, processShot, isAllSunk, getSunkShipCells, getHitCells } from './gameLogic';
import { v4 as uuidv4 } from 'uuid';

// Simple animated wrapper using CSS
function FadeIn({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`animate-[fadeIn_0.3s_ease-out] ${className}`}>{children}</div>;
}

// ============ MAIN APP ============
export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [bgColor, setBgColor] = useState('#0f172a');

  useEffect(() => {
    store.initDefaults();
    const user = store.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setBgColor(user.backgroundColor);
    }
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
        <Navbar currentUser={currentUser} refreshUser={refreshUser} />
        <main className="container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage onLogin={refreshUser} />} />
            <Route path="/register" element={<RegisterPage onRegister={refreshUser} />} />
            <Route path="/game" element={<GameRedirect />} />
            <Route path="/game/:gameId" element={<GamePlayPage currentUser={currentUser} refreshUser={refreshUser} />} />
            <Route path="/profile" element={<ProfilePage currentUser={currentUser} refreshUser={refreshUser} setBgColor={setBgColor} />} />
            <Route path="/rating" element={<RatingPage />} />
            <Route path="/chat" element={<ChatPage currentUser={currentUser} />} />
            <Route path="/clans" element={<ClansPage currentUser={currentUser} refreshUser={refreshUser} />} />
            <Route path="/federation" element={<FederationsPage currentUser={currentUser} refreshUser={refreshUser} />} />
            <Route path="/schools" element={<SchoolsPage currentUser={currentUser} refreshUser={refreshUser} />} />
            <Route path="/rooms" element={<RoomsPage currentUser={currentUser} />} />
            <Route path="/faq" element={<FAQPage currentUser={currentUser} />} />
            <Route path="/admin" element={<AdminPage currentUser={currentUser} refreshUser={refreshUser} />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

// ============ NAVBAR ============
function Navbar({ currentUser, refreshUser }: { currentUser: User | null; refreshUser: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    store.setCurrentUser(null);
    refreshUser();
    navigate('/');
  };

  return (
    <nav className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <Swords className="w-6 h-6 text-cyan-400" />
            <span className="text-cyan-400">SKLN</span><span className="text-white">.МОРСКОЙ БОЙ</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-4">
            <NavLink to="/" icon={<Home className="w-4 h-4" />} text="Главная" />
            <NavLink to="/rooms" icon={<Gamepad2 className="w-4 h-4" />} text="Комнаты" />
            <NavLink to="/rating" icon={<Trophy className="w-4 h-4" />} text="Рейтинг" />
            <NavLink to="/chat" icon={<MessageSquare className="w-4 h-4" />} text="Чат" />
            <NavLink to="/clans" icon={<Shield className="w-4 h-4" />} text="Кланы" />
            <NavLink to="/faq" icon={<HelpCircle className="w-4 h-4" />} text="Вопросы" />
            {currentUser?.role === 'admin' && <NavLink to="/admin" icon={<Settings className="w-4 h-4" />} text="Админ" />}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <>
                <span className="text-sm text-slate-300">Привет, <span className="text-cyan-400">{currentUser.nickname}</span></span>
                <Link to="/profile" className="p-2 hover:bg-slate-700 rounded-lg transition"><UserIcon className="w-5 h-5" /></Link>
                <button onClick={handleLogout} className="p-2 hover:bg-slate-700 rounded-lg transition"><LogOut className="w-5 h-5" /></button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-sm font-medium transition">Войти</Link>
                <Link to="/register" className="px-3 py-1.5 border border-cyan-600 text-cyan-400 hover:bg-cyan-600/20 rounded-lg text-sm font-medium transition">Регистрация</Link>
              </>
            )}
          </div>

          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <MobileNavLink to="/" text="Главная" onClick={() => setMenuOpen(false)} />
            <MobileNavLink to="/rooms" text="Комнаты" onClick={() => setMenuOpen(false)} />
            <MobileNavLink to="/rating" text="Рейтинг" onClick={() => setMenuOpen(false)} />
            <MobileNavLink to="/chat" text="Чат" onClick={() => setMenuOpen(false)} />
            <MobileNavLink to="/clans" text="Кланы" onClick={() => setMenuOpen(false)} />
            <MobileNavLink to="/federation" text="Федерации" onClick={() => setMenuOpen(false)} />
            <MobileNavLink to="/schools" text="Школы" onClick={() => setMenuOpen(false)} />
            <MobileNavLink to="/faq" text="Вопросы" onClick={() => setMenuOpen(false)} />
            {currentUser && <MobileNavLink to="/profile" text="Профиль" onClick={() => setMenuOpen(false)} />}
            {currentUser?.role === 'admin' && <MobileNavLink to="/admin" text="Админка" onClick={() => setMenuOpen(false)} />}
            {currentUser ? (
              <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-red-400 hover:bg-slate-700 rounded-lg">Выйти</button>
            ) : (
              <MobileNavLink to="/login" text="Войти" onClick={() => setMenuOpen(false)} />
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

function NavLink({ to, icon, text }: { to: string; icon: React.ReactNode; text: string }) {
  return (
    <Link to={to} className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-cyan-400 transition">
      {icon}{text}
    </Link>
  );
}

function MobileNavLink({ to, text, onClick }: { to: string; text: string; onClick: () => void }) {
  return (
    <Link to={to} onClick={onClick} className="block px-3 py-2 text-slate-300 hover:text-cyan-400 hover:bg-slate-700 rounded-lg transition">
      {text}
    </Link>
  );
}

// ============ HOME PAGE ============
function HomePage() {
  const online = store.getOnlineCount();
  const yesterday = store.getYesterdayCount();
  const total = store.getTotalCount();

  return (
    <FadeIn className="space-y-8">
      <div className="text-center py-8">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          <span className="text-cyan-400">SKLN</span>.МОРСКОЙ БОЙ
        </h1>
        <p className="text-slate-400 text-lg">Классическая игра в морском бое онлайн</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
        <StatCard icon={<Users className="w-8 h-8 text-green-400" />} label="Сейчас онлайн" value={online} color="green" />
        <StatCard icon={<Clock className="w-8 h-8 text-yellow-400" />} label="Было вчера" value={yesterday} color="yellow" />
        <StatCard icon={<Crown className="w-8 h-8 text-purple-400" />} label="За всё время" value={total.toLocaleString()} color="purple" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
        <QuickLink to="/rooms" icon={<Gamepad2 className="w-6 h-6" />} title="Играть" desc="Создать или найти комнату" />
        <QuickLink to="/rating" icon={<Trophy className="w-6 h-6" />} title="Рейтинг" desc="Таблица лидеров" />
        <QuickLink to="/clans" icon={<Shield className="w-6 h-6" />} title="Кланы" desc="Объединяйся с друзьями" />
        <QuickLink to="/schools" icon={<School className="w-6 h-6" />} title="Школы" desc="Битвы между школами" />
      </div>

      <div className="max-w-3xl mx-auto bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h2 className="text-xl font-bold mb-4 text-cyan-400">📜 Правила игры</h2>
        <div className="space-y-3 text-slate-300 text-sm">
          <p>Морской бой — игра для 2 участников. Игроки по очереди атакуют корабли на поле соперника.</p>
          <p>Если по указанным координатам имеется корабль — он «топится», а попавший игрок получает ещё один ход.</p>
          <p><strong className="text-white">Цель:</strong> первым поразить все корабли противника.</p>
          <p><strong className="text-white">Время на ход:</strong> 30 секунд. После истечения — пропуск хода. После 2 пропусков — поражение.</p>
          <p><strong className="text-white">Флот:</strong> 4-палубный (1), 3-палубные (2), 2-палубные (3), 1-палубные (4).</p>
          <p>Если первый игрок уничтожил все корабли первым, у второго есть шанс свести партию к ничьей.</p>
        </div>
      </div>
    </FadeIn>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number | string; color: string }) {
  const colors: Record<string, string> = {
    green: 'border-green-500/30 bg-green-500/10',
    yellow: 'border-yellow-500/30 bg-yellow-500/10',
    purple: 'border-purple-500/30 bg-purple-500/10',
  };
  return (
    <div className={`rounded-xl p-5 border ${colors[color]} text-center`}>
      <div className="flex justify-center mb-2">{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-slate-400">{label}</div>
    </div>
  );
}

function QuickLink({ to, icon, title, desc }: { to: string; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Link to={to} className="flex items-center gap-3 p-4 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-xl transition group">
      <div className="text-cyan-400 group-hover:scale-110 transition">{icon}</div>
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-xs text-slate-400">{desc}</div>
      </div>
      <ChevronRight className="w-4 h-4 ml-auto text-slate-500 group-hover:text-cyan-400 transition" />
    </Link>
  );
}

// ============ AUTH PAGES ============
function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [showReset, setShowReset] = useState(false);
  const [resetPhone, setResetPhone] = useState('');
  const [resetNick, setResetNick] = useState('');
  const [resetDate, setResetDate] = useState('');
  const [resetStatus, setResetStatus] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    setError('');
    const user = store.getUserByPhone(phone);
    if (!user) { setError('Пользователь не найден'); return; }
    if (user.password !== password) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      if (newAttempts >= 3) setShowReset(true);
      setError(`Неверный пароль (попытка ${newAttempts})`);
      return;
    }
    user.lastLogin = new Date().toISOString();
    user.loginHistory.push(new Date().toISOString());
    store.saveUser(user);
    store.setCurrentUser(user.id);
    onLogin();
    navigate('/');
  };

  const handleResetRequest = () => {
    const user = store.getUserByPhone(resetPhone);
    if (!user) { setResetStatus('Пользователь не найден'); return; }
    if (user.nickname.toLowerCase() !== resetNick.toLowerCase()) { setResetStatus('Ник не совпадает'); return; }
    const req = { id: uuidv4(), phone: resetPhone, nickname: resetNick, lastLoginApprox: resetDate, status: 'pending' as const, createdAt: new Date().toISOString() };
    store.saveResetRequest(req);
    setResetStatus('Заявка отправлена! Ожидает рассмотрения администратором.');
  };

  return (
    <FadeIn className="max-w-md mx-auto">
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h2 className="text-2xl font-bold mb-6 text-center">Вход в игру</h2>
        
        {!showReset ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Номер телефона</label>
              <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:border-cyan-500 focus:outline-none" placeholder="+7 (999) 123-45-67" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Пароль</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:border-cyan-500 focus:outline-none pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-2 text-slate-400">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button onClick={handleLogin} className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-medium transition">Войти</button>
            <p className="text-center text-sm text-slate-400">
              Нет аккаунта? <Link to="/register" className="text-cyan-400 hover:underline">Регистрация</Link>
            </p>
            <p className="text-center text-xs text-slate-500">
              <button onClick={() => setShowReset(true)} className="text-yellow-400 hover:underline">Забыли пароль?</button>
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-yellow-400">Запрос сброса пароля</h3>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Номер телефона</label>
              <input type="text" value={resetPhone} onChange={e => setResetPhone(e.target.value)} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:border-cyan-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Ваш ник</label>
              <input type="text" value={resetNick} onChange={e => setResetNick(e.target.value)} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:border-cyan-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Приблизительная дата последнего входа</label>
              <input type="date" value={resetDate} onChange={e => setResetDate(e.target.value)} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:border-cyan-500 focus:outline-none" />
            </div>
            {resetStatus && <p className="text-sm text-yellow-400">{resetStatus}</p>}
            <button onClick={handleResetRequest} className="w-full py-2 bg-yellow-600 hover:bg-yellow-500 rounded-lg font-medium transition">Отправить заявку</button>
            <button onClick={() => setShowReset(false)} className="w-full py-2 border border-slate-600 rounded-lg text-sm transition hover:bg-slate-700">Назад</button>
          </div>
        )}
      </div>
    </FadeIn>
  );
}

function RegisterPage({ onRegister }: { onRegister: () => void }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = () => {
    setError('');
    if (!phone || !password || !nickname) { setError('Заполните все поля'); return; }
    if (password.length < 5) { setError('Пароль не менее 5 символов'); return; }
    if (store.getUserByPhone(phone)) { setError('Этот номер телефона уже используется'); return; }
    if (store.getUserByNickname(nickname)) { setError('Этот ник уже занят. Выберите другой'); return; }

    const user: User = {
      id: uuidv4(), phone, nickname, password, role: 'player',
      level: 1, xp: 0, gamesPlayed: 0, gamesWon: 0, gamesLost: 0, gamesDraw: 0,
      totalShots: 0, accurateShots: 0, totalTimePlayed: 0, friends: [],
      backgroundColor: '#0f172a', registeredAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(), loginHistory: [new Date().toISOString()],
    };
    store.saveUser(user);
    store.setCurrentUser(user.id);
    store.incrementTotalCount();
    onRegister();
    navigate('/');
  };

  return (
    <FadeIn className="max-w-md mx-auto">
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h2 className="text-2xl font-bold mb-6 text-center">Регистрация</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Номер телефона</label>
            <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:border-cyan-500 focus:outline-none" placeholder="+7 (999) 123-45-67" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Никнейм</label>
            <input type="text" value={nickname} onChange={e => setNickname(e.target.value)} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:border-cyan-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Пароль (мин. 5 символов)</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:border-cyan-500 focus:outline-none" />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button onClick={handleRegister} className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-medium transition">Зарегистрироваться</button>
          <p className="text-center text-sm text-slate-400">
            Уже есть аккаунт? <Link to="/login" className="text-cyan-400 hover:underline">Войти</Link>
          </p>
          <p className="text-center text-xs text-slate-500">
            Или <button onClick={() => { localStorage.setItem('skln_current_user', 'guest'); onRegister(); navigate('/'); }} className="text-yellow-400 hover:underline">войти как гость</button> (без учёта результатов)
          </p>
        </div>
      </div>
    </FadeIn>
  );
}

// ============ PROFILE PAGE ============
function ProfilePage({ currentUser, refreshUser, setBgColor }: { currentUser: User | null; refreshUser: () => void; setBgColor: (c: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [city, setCity] = useState(currentUser?.city || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [about, setAbout] = useState(currentUser?.about || '');
  const [selectedBg, setSelectedBg] = useState(currentUser?.backgroundColor || '#0f172a');

  if (!currentUser || currentUser.id === 'guest') {
    return <div className="text-center py-12 text-slate-400">Войдите в аккаунт для просмотра профиля</div>;
  }

  const handleSave = () => {
    const user = { ...currentUser, city, email, about, backgroundColor: selectedBg };
    store.saveUser(user);
    setBgColor(selectedBg);
    refreshUser();
    setEditing(false);
  };

  const bgColors = ['#0f172a', '#1a1a2e', '#16213e', '#0a192f', '#1b1b2f', '#2d1b69', '#1a3c40', '#2c3e50', '#1c1c1c', '#0d1117'];

  return (
    <FadeIn className="max-w-2xl mx-auto space-y-6">
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-cyan-600 flex items-center justify-center text-2xl font-bold">
            {currentUser.nickname[0].toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold">{currentUser.nickname}</h2>
            <p className="text-slate-400 text-sm">Уровень {currentUser.level} • {currentUser.xp} XP</p>
            <div className="w-48 h-2 bg-slate-700 rounded-full mt-1">
              <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${Math.min(100, (currentUser.xp % 500) / 5)}%` }} />
            </div>
          </div>
        </div>

        {!editing ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <MiniStat label="Игр" value={currentUser.gamesPlayed} />
              <MiniStat label="Побед" value={currentUser.gamesWon} />
              <MiniStat label="Поражений" value={currentUser.gamesLost} />
              <MiniStat label="Ничьих" value={currentUser.gamesDraw} />
              <MiniStat label="Выстрелов" value={currentUser.totalShots} />
              <MiniStat label="Точность" value={currentUser.totalShots ? `${Math.round(currentUser.accurateShots / currentUser.totalShots * 100)}%` : '0%'} />
              <MiniStat label="Друзей" value={currentUser.friends.length} />
              <MiniStat label="Время" value={`${Math.round(currentUser.totalTimePlayed / 60)}мин`} />
            </div>
            {currentUser.city && <p className="text-sm text-slate-400">📍 {currentUser.city}</p>}
            {currentUser.email && <p className="text-sm text-slate-400">📧 {currentUser.email}</p>}
            {currentUser.about && <p className="text-sm text-slate-400">{currentUser.about}</p>}
            <button onClick={() => setEditing(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-sm transition">Редактировать</button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Город</label>
              <input value={city} onChange={e => setCity(e.target.value)} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:border-cyan-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Email</label>
              <input value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:border-cyan-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">О себе</label>
              <textarea value={about} onChange={e => setAbout(e.target.value)} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:border-cyan-500 focus:outline-none" rows={3} />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Цвет фона</label>
              <div className="flex flex-wrap gap-2">
                {bgColors.map(c => (
                  <button key={c} onClick={() => setSelectedBg(c)} className={`w-8 h-8 rounded-full border-2 ${selectedBg === c ? 'border-cyan-400' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleSave} className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm transition">Сохранить</button>
              <button onClick={() => setEditing(false)} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg text-sm transition">Отмена</button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="font-bold mb-3">Друзья</h3>
        <FriendsList currentUser={currentUser} refreshUser={refreshUser} />
      </div>

      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="font-bold mb-3">История игр</h3>
        <GameHistory userId={currentUser.id} />
      </div>
    </FadeIn>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-slate-700/50 rounded-lg p-2 text-center">
      <div className="text-lg font-bold text-cyan-400">{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );
}

function FriendsList({ currentUser, refreshUser }: { currentUser: User; refreshUser: () => void }) {
  const [search, setSearch] = useState('');
  const users = store.getUsers().filter(u => u.id !== currentUser.id && u.role !== 'admin');
  const filtered = users.filter(u => u.nickname.toLowerCase().includes(search.toLowerCase()));

  const addFriend = (friendId: string) => {
    const user = { ...currentUser, friends: [...currentUser.friends, friendId] };
    store.saveUser(user);
    refreshUser();
  };

  const removeFriend = (friendId: string) => {
    const user = { ...currentUser, friends: currentUser.friends.filter(f => f !== friendId) };
    store.saveUser(user);
    refreshUser();
  };

  return (
    <div className="space-y-3">
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск игроков..." className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:border-cyan-500 focus:outline-none text-sm" />
      {currentUser.friends.length > 0 && (
        <div className="space-y-2">
          {currentUser.friends.map(fId => {
            const friend = store.getUserById(fId);
            if (!friend) return null;
            return (
              <div key={fId} className="flex items-center justify-between bg-slate-700/50 rounded-lg p-2">
                <span className="text-sm">{friend.nickname} <span className="text-slate-500 text-xs">(ур.{friend.level})</span></span>
                <button onClick={() => removeFriend(fId)} className="text-red-400 text-xs hover:underline">Удалить</button>
              </div>
            );
          })}
        </div>
      )}
      <div className="space-y-1 max-h-40 overflow-y-auto">
        {filtered.filter(u => !currentUser.friends.includes(u.id)).slice(0, 5).map(u => (
          <div key={u.id} className="flex items-center justify-between bg-slate-700/30 rounded-lg p-2">
            <span className="text-sm">{u.nickname}</span>
            <button onClick={() => addFriend(u.id)} className="text-green-400 text-xs hover:underline">+ Добавить</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function GameHistory({ userId }: { userId: string }) {
  const games = store.getGames().filter(g => g.player1Id === userId || g.player2Id === userId).slice(-10).reverse();
  
  if (games.length === 0) return <p className="text-slate-500 text-sm">Игр пока нет</p>;

  return (
    <div className="space-y-2">
      {games.map(g => {
        const isWin = g.winner === userId;
        const isDraw = g.isDraw;
        const opponentId = g.player1Id === userId ? g.player2Id : g.player1Id;
        const opponent = store.getUserById(opponentId);
        return (
          <div key={g.id} className="flex items-center justify-between bg-slate-700/30 rounded-lg p-2 text-sm">
            <span>vs {opponent?.nickname || 'ИИ'}</span>
            <span className={isWin ? 'text-green-400' : isDraw ? 'text-yellow-400' : 'text-red-400'}>
              {isWin ? 'Победа' : isDraw ? 'Ничья' : 'Поражение'}
            </span>
            <span className="text-slate-500 text-xs">{new Date(g.startTime).toLocaleDateString()}</span>
          </div>
        );
      })}
    </div>
  );
}

// ============ ROOMS PAGE ============
function RoomsPage({ currentUser }: { currentUser: User | null }) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [roomPassword, setRoomPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => { setRooms(store.getRooms()); }, []);

  const createRoom = () => {
    if (!currentUser || !roomName) return;
    const room: Room = {
      id: uuidv4(), name: roomName, creatorId: currentUser.id,
      players: [currentUser.id], maxPlayers: 2, isPrivate,
      password: isPrivate ? roomPassword : undefined,
      createdAt: new Date().toISOString(),
    };
    store.saveRoom(room);
    setRooms(store.getRooms());
    setShowCreate(false);
    setRoomName('');
  };

  const joinRoom = (room: Room) => {
    if (!currentUser) return;
    if (room.isPrivate && room.password) {
      const input = prompt('Введите пароль комнаты:');
      if (input !== room.password) { alert('Неверный пароль'); return; }
    }
    if (room.players.length >= room.maxPlayers) { alert('Комната заполнена'); return; }
    const otherPlayer = room.players.find(p => p !== currentUser.id) || room.players[0];
    startGame(currentUser.id, otherPlayer);
  };

  const startGame = (p1Id: string, p2Id: string) => {
    const game: Game = {
      id: uuidv4(), player1Id: p1Id, player2Id: p2Id,
      player1Board: generateRandomPlacement(), player2Board: generateRandomPlacement(),
      currentTurn: p1Id, status: 'playing',
      startTime: new Date().toISOString(),
      player1MissedTurns: 0, player2MissedTurns: 0,
      shotsHistory: [],
    };
    store.saveGame(game);
    navigate(`/game/${game.id}`);
  };

  const playWithAI = () => {
    if (!currentUser) return;
    const game: Game = {
      id: uuidv4(), player1Id: currentUser.id, player2Id: 'ai',
      player1Board: generateRandomPlacement(), player2Board: generateRandomPlacement(),
      currentTurn: currentUser.id, status: 'playing',
      startTime: new Date().toISOString(),
      player1MissedTurns: 0, player2MissedTurns: 0,
      shotsHistory: [],
    };
    store.saveGame(game);
    navigate(`/game/${game.id}`);
  };

  return (
    <FadeIn className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Комнаты для игры</h2>
        <div className="flex gap-2">
          {currentUser && currentUser.id !== 'guest' && (
            <>
              <button onClick={playWithAI} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm transition">Играть с ИИ</button>
              <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-sm transition"><Plus className="w-4 h-4 inline" /> Создать</button>
            </>
          )}
        </div>
      </div>

      {showCreate && (
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 space-y-3">
          <h3 className="font-medium">Создать комнату</h3>
          <input value={roomName} onChange={e => setRoomName(e.target.value)} placeholder="Название комнаты" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:border-cyan-500 focus:outline-none text-sm" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} className="rounded" /> Приватная комната
          </label>
          {isPrivate && <input value={roomPassword} onChange={e => setRoomPassword(e.target.value)} placeholder="Пароль" type="password" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:border-cyan-500 focus:outline-none text-sm" />}
          <div className="flex gap-2">
            <button onClick={createRoom} className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm transition">Создать</button>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 bg-slate-600 rounded-lg text-sm transition">Отмена</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {rooms.length === 0 && <p className="text-slate-500 text-center py-8">Нет активных комнат. Создайте первую!</p>}
        {rooms.map(room => {
          const creator = store.getUserById(room.creatorId);
          return (
            <div key={room.id} className="flex items-center justify-between bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div>
                <div className="font-medium flex items-center gap-2">
                  {room.name}
                  {room.isPrivate && <span className="text-xs bg-yellow-600/30 text-yellow-400 px-2 py-0.5 rounded">🔒</span>}
                </div>
                <div className="text-sm text-slate-400">Создал: {creator?.nickname || '???'} • {room.players.length}/{room.maxPlayers} игроков</div>
              </div>
              <button onClick={() => joinRoom(room)} disabled={!currentUser || currentUser.id === 'guest'} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg text-sm transition">Войти</button>
            </div>
          );
        })}
      </div>
    </FadeIn>
  );
}

// ============ GAME PLAY PAGE ============
function GamePlayPage({ currentUser, refreshUser }: { currentUser: User | null; refreshUser: () => void }) {
  const navigate = useNavigate();
  const gameId = window.location.pathname.split('/').pop()!;
  const [game, setGame] = useState<Game | null>(null);
  const [turnTimer, setTurnTimer] = useState(0);
  const [offerDraw, setOfferDraw] = useState(false);

  useEffect(() => {
    const g = store.getGames().find(x => x.id === gameId);
    if (g) setGame(g);
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
  }, [game?.currentTurn, game?.status]);

  const isMyTurn = game?.currentTurn === currentUser?.id;
  const isAI = game?.player2Id === 'ai';
  const opponentId = game ? (game.player1Id === currentUser?.id ? game.player2Id : game.player1Id) : undefined;
  const opponent = opponentId === 'ai' ? { nickname: 'ИИ', level: 5 } : store.getUserById(opponentId || '');

  const handleShot = (row: number, col: number) => {
    if (!game || !isMyTurn || game.status !== 'playing') return;
    
    const targetBoard = currentUser?.id === game.player1Id ? game.player2Board : game.player1Board;
    
    // Check if already shot
    if (targetBoard.shots.some(s => s.row === row && s.col === col) || targetBoard.missedShots.some(s => s.row === row && s.col === col)) {
      return;
    }

    const result = processShot(targetBoard, row, col);
    game.shotsHistory.push({ playerId: currentUser!.id, row, col, hit: result.hit, time: new Date().toISOString() });

    if (currentUser && currentUser.id !== 'guest') {
      const user = store.getUserById(currentUser.id)!;
      user.totalShots++;
      if (result.hit) user.accurateShots++;
      store.saveUser(user);
    }

    if (isAllSunk(targetBoard)) {
      game.status = 'finished';
      game.winner = currentUser!.id;
      game.endTime = new Date().toISOString();
      if (currentUser && currentUser.id !== 'guest') {
        const user = store.getUserById(currentUser.id)!;
        user.gamesPlayed++;
        user.gamesWon++;
        const settings = store.getSettings();
        user.xp += settings.xpPerWin;
        const thresholds = settings.levelThresholds;
        while (user.level < thresholds.length && user.xp >= thresholds[user.level]) {
          user.level++;
        }
        store.saveUser(user);
        refreshUser();
      }
      if (opponentId && opponentId !== 'ai') {
        const loser = store.getUserById(opponentId);
        if (loser) {
          loser.gamesPlayed++;
          loser.gamesLost++;
          store.saveUser(loser);
        }
      }
      store.saveGame(game);
      setGame({ ...game });
      return;
    }

    if (!result.hit) {
      game.currentTurn = opponentId!;
    } else {
      if (currentUser?.id === game.player1Id) game.player1MissedTurns = 0;
      else game.player2MissedTurns = 0;
    }

    store.saveGame(game);
    setGame({ ...game });

    if (isAI && game.currentTurn === 'ai' && game.status === 'playing') {
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
    game.shotsHistory.push({ playerId: 'ai', row, col, hit: result.hit, time: new Date().toISOString() });

    if (isAllSunk(targetBoard)) {
      game.status = 'finished';
      game.winner = 'ai';
      game.endTime = new Date().toISOString();
      if (currentUser && currentUser.id !== 'guest') {
        const user = store.getUserById(currentUser.id)!;
        user.gamesPlayed++;
        user.gamesLost++;
        store.saveUser(user);
        refreshUser();
      }
      store.saveGame(game);
      setGame({ ...game });
      return;
    }

    if (!result.hit) {
      game.currentTurn = currentUser!.id;
    }

    store.saveGame(game);
    setGame({ ...game });
  };

  const handleMissTurn = () => {
    if (!game) return;
    if (game.currentTurn === game.player1Id) {
      game.player1MissedTurns++;
      if (game.player1MissedTurns >= 2) {
        game.status = 'finished';
        game.winner = game.player2Id;
        game.endTime = new Date().toISOString();
      }
    } else {
      game.player2MissedTurns++;
      if (game.player2MissedTurns >= 2) {
        game.status = 'finished';
        game.winner = game.player1Id;
        game.endTime = new Date().toISOString();
      }
    }
    game.currentTurn = game.currentTurn === game.player1Id ? game.player2Id : game.player1Id;
    store.saveGame(game);
    setGame({ ...game });
  };

  const handleSurrender = () => {
    if (!game || !currentUser) return;
    game.status = 'finished';
    game.winner = opponentId!;
    game.endTime = new Date().toISOString();
    if (currentUser.id !== 'guest') {
      const user = store.getUserById(currentUser.id)!;
      user.gamesPlayed++;
      user.gamesLost++;
      store.saveUser(user);
      refreshUser();
    }
    store.saveGame(game);
    setGame({ ...game });
  };

  const handleDrawOffer = () => {
    setOfferDraw(true);
    setTimeout(() => {
      if (game) {
        game.status = 'finished';
        game.isDraw = true;
        game.endTime = new Date().toISOString();
        if (currentUser && currentUser.id !== 'guest') {
          const user = store.getUserById(currentUser.id)!;
          user.gamesPlayed++;
          user.gamesDraw++;
          store.saveUser(user);
          refreshUser();
        }
        store.saveGame(game);
        setGame({ ...game });
      }
      setOfferDraw(false);
    }, 2000);
  };

  if (!game) return <div className="text-center py-12">Загрузка...</div>;

  if (game.status === 'finished') {
    const won = game.winner === currentUser?.id;
    return (
      <FadeIn className="max-w-lg mx-auto text-center space-y-6 py-12">
        <div className={`text-6xl ${won ? 'animate-bounce' : ''}`}>{won ? '🏆' : game.isDraw ? '🤝' : '💀'}</div>
        <h2 className="text-3xl font-bold">{won ? 'Победа!' : game.isDraw ? 'Ничья!' : 'Поражение'}</h2>
        <p className="text-slate-400">Противник: {opponent?.nickname || 'ИИ'}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate('/rooms')} className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg transition">Новая игра</button>
          <button onClick={() => navigate('/')} className="px-6 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg transition">На главную</button>
        </div>
      </FadeIn>
    );
  }

  const myBoardData = currentUser?.id === game.player1Id ? game.player1Board : game.player2Board;
  const enemyBoardData = currentUser?.id === game.player1Id ? game.player2Board : game.player1Board;

  return (
    <FadeIn className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">vs {opponent?.nickname || 'ИИ'}</h2>
          <p className={`text-sm ${isMyTurn ? 'text-green-400' : 'text-red-400'}`}>
            {isMyTurn ? '⚡ Ваш ход' : '⏳ Ход противника'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`text-2xl font-mono font-bold ${turnTimer <= 5 ? 'text-red-400 animate-pulse' : 'text-cyan-400'}`}>
            {turnTimer}с
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={handleSurrender} className="px-3 py-1.5 bg-red-600/80 hover:bg-red-500 rounded-lg text-sm transition">🏳️ Сдаться</button>
        <button onClick={handleDrawOffer} disabled={offerDraw} className="px-3 py-1.5 bg-yellow-600/80 hover:bg-yellow-500 disabled:opacity-50 rounded-lg text-sm transition">🤝 Предложить ничью</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <h3 className="text-sm font-medium text-slate-400 mb-2">Поле противника</h3>
          <GameGrid board={enemyBoardData} onCellClick={isMyTurn ? handleShot : undefined} />
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <h3 className="text-sm font-medium text-slate-400 mb-2">Ваше поле</h3>
          <GameGrid board={myBoardData} showShips />
        </div>
      </div>
    </FadeIn>
  );
}

function GameGrid({ board, onCellClick, showShips }: { board: any; onCellClick?: (row: number, col: number) => void; showShips?: boolean }) {
  const sunkCells = getSunkShipCells(board);
  const hitCells = getHitCells(board);
  const labels = ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж', 'З', 'И', 'К'];

  return (
    <div className="inline-block">
      <div className="grid grid-cols-11 gap-0.5">
        <div className="w-6 h-6" />
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className="w-6 h-6 flex items-center justify-center text-xs text-slate-500">{i + 1}</div>
        ))}
        {Array.from({ length: 10 }, (_, row) => (
          <Fragment key={row}>
            <div className="w-6 h-6 flex items-center justify-center text-xs text-slate-500">{labels[row]}</div>
            {Array.from({ length: 10 }, (_, col) => {
              const key = `${row},${col}`;
              const isShot = board.shots?.some((s: any) => s.row === row && s.col === col);
              const isMiss = board.missedShots?.some((s: any) => s.row === row && s.col === col);
              const isSunk = sunkCells.has(key);
              const isHit = hitCells.has(key);
              const hasShip = showShips && board.ships?.some((s: any) => s.cells.some((c: any) => c.row === row && c.col === col));

              let cellClass = 'w-6 h-6 rounded-sm flex items-center justify-center text-xs transition ';
              if (isSunk) cellClass += 'bg-red-600 ';
              else if (isHit && showShips) cellClass += 'bg-orange-500 ';
              else if (isShot) cellClass += 'bg-red-500/70 ';
              else if (isMiss) cellClass += 'bg-slate-600 ';
              else if (hasShip) cellClass += 'bg-cyan-700 ';
              else cellClass += 'bg-slate-700 hover:bg-slate-600 ';

              if (onCellClick && !isShot && !isMiss) {
                cellClass += 'cursor-crosshair hover:bg-cyan-600/50 ';
              }

              return (
                <div key={col} className={cellClass} onClick={() => onCellClick?.(row, col)}>
                  {(isShot || isSunk) && '✕'}
                  {isMiss && '•'}
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

// ============ RATING PAGE ============
function RatingPage() {
  const [tab, setTab] = useState<'players' | 'clans' | 'federations'>('players');
  const users = store.getUsers().filter(u => u.role === 'player').sort((a, b) => b.xp - a.xp);
  const clans = store.getClans().sort((a, b) => b.wins - a.wins);
  const feds = store.getFederations().sort((a, b) => b.wins - a.wins);

  return (
    <FadeIn className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2"><Trophy className="w-6 h-6 text-yellow-400" /> Рейтинг</h2>
      
      <div className="flex gap-2">
        {(['players', 'clans', 'federations'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm transition ${tab === t ? 'bg-cyan-600' : 'bg-slate-700 hover:bg-slate-600'}`}>
            {t === 'players' ? 'Игроки' : t === 'clans' ? 'Кланы' : 'Федерации'}
          </button>
        ))}
      </div>

      <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
        {tab === 'players' && (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-700"><th className="p-3 text-left">#</th><th className="p-3 text-left">Игрок</th><th className="p-3 text-center">Ур.</th><th className="p-3 text-center">XP</th><th className="p-3 text-center">Побед</th><th className="p-3 text-center">Игр</th></tr></thead>
            <tbody>
              {users.slice(0, 50).map((u, i) => (
                <tr key={u.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                  <td className="p-3">{i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}</td>
                  <td className="p-3 font-medium">{u.nickname}</td>
                  <td className="p-3 text-center">{u.level}</td>
                  <td className="p-3 text-center text-cyan-400">{u.xp}</td>
                  <td className="p-3 text-center text-green-400">{u.gamesWon}</td>
                  <td className="p-3 text-center">{u.gamesPlayed}</td>
                </tr>
              ))}
              {users.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-slate-500">Нет данных</td></tr>}
            </tbody>
          </table>
        )}
        {tab === 'clans' && (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-700"><th className="p-3 text-left">#</th><th className="p-3 text-left">Клан</th><th className="p-3 text-center">Участников</th><th className="p-3 text-center">Побед</th><th className="p-3 text-center">Поражений</th></tr></thead>
            <tbody>
              {clans.map((c, i) => (
                <tr key={c.id} className="border-b border-slate-700/50">
                  <td className="p-3">{i + 1}</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded text-xs mr-2" style={{ backgroundColor: c.color + '33', color: c.color }}>[{c.tag}]</span>{c.name}</td>
                  <td className="p-3 text-center">{c.members.length}</td>
                  <td className="p-3 text-center text-green-400">{c.wins}</td>
                  <td className="p-3 text-center text-red-400">{c.losses}</td>
                </tr>
              ))}
              {clans.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-slate-500">Нет кланов</td></tr>}
            </tbody>
          </table>
        )}
        {tab === 'federations' && (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-700"><th className="p-3 text-left">#</th><th className="p-3 text-left">Федерация</th><th className="p-3 text-center">Кланов</th><th className="p-3 text-center">Побед</th></tr></thead>
            <tbody>
              {feds.map((f, i) => (
                <tr key={f.id} className="border-b border-slate-700/50">
                  <td className="p-3">{i + 1}</td>
                  <td className="p-3 font-medium">{f.name}</td>
                  <td className="p-3 text-center">{f.clans.length}</td>
                  <td className="p-3 text-center text-green-400">{f.wins}</td>
                </tr>
              ))}
              {feds.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-slate-500">Нет федераций</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </FadeIn>
  );
}

// ============ CHAT PAGE ============
function ChatPage({ currentUser }: { currentUser: User | null }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');

  useEffect(() => {
    setMessages(store.getChatMessages());
    const interval = setInterval(() => setMessages(store.getChatMessages()), 2000);
    return () => clearInterval(interval);
  }, []);

  const sendMessage = () => {
    if (!text.trim() || !currentUser) return;
    const msg: ChatMessage = {
      id: uuidv4(), userId: currentUser.id, nickname: currentUser.nickname,
      text: text.trim(), timestamp: new Date().toISOString(),
    };
    store.addChatMessage(msg);
    setMessages(store.getChatMessages());
    setText('');
  };

  return (
    <FadeIn className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><MessageSquare className="w-6 h-6 text-cyan-400" /> Общий чат</h2>
      
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 flex flex-col h-[500px]">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && <p className="text-slate-500 text-center text-sm">Сообщений пока нет. Будьте первым!</p>}
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-2 ${msg.userId === currentUser?.id ? 'justify-end' : ''}`}>
              {msg.userId !== currentUser?.id && <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-xs font-bold shrink-0">{msg.nickname[0]}</div>}
              <div className={`max-w-[70%] rounded-lg p-2 ${msg.userId === currentUser?.id ? 'bg-cyan-600/30 border border-cyan-600/50' : 'bg-slate-700/50'}`}>
                <div className="text-xs text-slate-400 mb-0.5">{msg.nickname}</div>
                <div className="text-sm">{msg.text}</div>
                <div className="text-xs text-slate-500 mt-0.5">{new Date(msg.timestamp).toLocaleTimeString()}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-slate-700 flex gap-2">
          <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder={currentUser ? 'Сообщение...' : 'Войдите для отправки сообщений'} disabled={!currentUser} className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:border-cyan-500 focus:outline-none text-sm disabled:opacity-50" />
          <button onClick={sendMessage} disabled={!currentUser || !text.trim()} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 rounded-lg transition"><Send className="w-4 h-4" /></button>
        </div>
      </div>
    </FadeIn>
  );
}

// ============ CLANS PAGE ============
function ClansPage({ currentUser, refreshUser }: { currentUser: User | null; refreshUser: () => void }) {
  const [clans, setClans] = useState<Clan[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [tag, setTag] = useState('');
  const [color, setColor] = useState('#00ffff');
  const [logo, setLogo] = useState('⚔️');

  useEffect(() => { setClans(store.getClans()); }, []);

  const createClan = () => {
    if (!currentUser || !name || !tag) return;
    if (tag.length !== 5) { alert('Тег должен быть ровно 5 символов'); return; }
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

  const joinClan = (clanId: string) => {
    if (!currentUser) return;
    const clan = store.getClans().find(c => c.id === clanId)!;
    if (!clan.members.includes(currentUser.id)) {
      clan.members.push(currentUser.id);
      store.saveClan(clan);
      const user = { ...currentUser, clanId: clanId };
      store.saveUser(user);
      setClans(store.getClans());
      refreshUser();
    }
  };

  const logos = ['⚔️', '🛡️', '⚓', '🏴‍☠️', '🦅', '🐉', '🔱', '💀', '🌊', '⭐'];
  const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#8800ff', '#ffffff', '#ff4444'];

  return (
    <FadeIn className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2"><Shield className="w-6 h-6 text-cyan-400" /> Кланы</h2>
        {currentUser && !currentUser.clanId && (
          <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-sm transition"><Plus className="w-4 h-4 inline" /> Создать клан</button>
        )}
      </div>

      {showCreate && (
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 space-y-3">
          <h3 className="font-medium">Создание клана</h3>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Название клана" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm focus:border-cyan-500 focus:outline-none" />
          <input value={tag} onChange={e => setTag(e.target.value.slice(0, 5))} placeholder="Тег (5 символов)" maxLength={5} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm focus:border-cyan-500 focus:outline-none" />
          <div>
            <label className="text-sm text-slate-400">Логотип:</label>
            <div className="flex gap-2 mt-1 flex-wrap">
              {logos.map(l => (
                <button key={l} onClick={() => setLogo(l)} className={`text-xl p-1 rounded ${logo === l ? 'bg-cyan-600' : 'bg-slate-700'}`}>{l}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm text-slate-400">Цвет:</label>
            <div className="flex gap-2 mt-1 flex-wrap">
              {colors.map(c => (
                <button key={c} onClick={() => setColor(c)} className={`w-6 h-6 rounded-full border-2 ${color === c ? 'border-white' : 'border-transparent'}`} style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={createClan} className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm transition">Создать</button>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 bg-slate-600 rounded-lg text-sm transition">Отмена</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {clans.map(clan => (
          <div key={clan.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{clan.logo}</span>
              <div>
                <div className="font-bold flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: clan.color + '33', color: clan.color }}>[{clan.tag}]</span>
                  {clan.name}
                </div>
                <div className="text-xs text-slate-400">{clan.members.length} участников</div>
              </div>
            </div>
            <div className="flex gap-3 text-xs text-slate-400">
              <span className="text-green-400">W: {clan.wins}</span>
              <span className="text-red-400">L: {clan.losses}</span>
              <span className="text-yellow-400">D: {clan.draws}</span>
            </div>
            {currentUser && !currentUser.clanId && (
              <button onClick={() => joinClan(clan.id)} className="mt-2 px-3 py-1 bg-cyan-600/80 hover:bg-cyan-500 rounded text-xs transition">Вступить</button>
            )}
          </div>
        ))}
      </div>
      {clans.length === 0 && <p className="text-center text-slate-500 py-8">Кланов пока нет</p>}
    </FadeIn>
  );
}

// ============ FEDERATIONS PAGE ============
function FederationsPage({ currentUser, refreshUser }: { currentUser: User | null; refreshUser: () => void }) {
  const [feds, setFeds] = useState<Federation[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => { setFeds(store.getFederations()); }, []);

  const createFed = () => {
    if (!currentUser || !name) return;
    const fed: Federation = {
      id: uuidv4(), name, creatorId: currentUser.id,
      clans: [], members: [currentUser.id],
      wins: 0, losses: 0, createdAt: new Date().toISOString(),
    };
    store.saveFederation(fed);
    setFeds(store.getFederations());
    setShowCreate(false);
    setName('');
  };

  return (
    <FadeIn className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Федерации</h2>
        {currentUser && (
          <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-sm transition"><Plus className="w-4 h-4 inline" /> Создать</button>
        )}
      </div>

      {showCreate && (
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 space-y-3">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Название федерации" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm focus:border-cyan-500 focus:outline-none" />
          <div className="flex gap-2">
            <button onClick={createFed} className="px-4 py-2 bg-green-600 rounded-lg text-sm">Создать</button>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 bg-slate-600 rounded-lg text-sm">Отмена</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {feds.map(fed => (
          <div key={fed.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="font-bold text-lg">{fed.name}</div>
            <div className="text-sm text-slate-400">{fed.clans.length} кланов • {fed.members.length} участников</div>
            <div className="flex gap-3 text-xs mt-1">
              <span className="text-green-400">Побед: {fed.wins}</span>
              <span className="text-red-400">Поражений: {fed.losses}</span>
            </div>
          </div>
        ))}
        {feds.length === 0 && <p className="text-center text-slate-500 py-8">Федераций пока нет</p>}
      </div>
    </FadeIn>
  );
}

// ============ SCHOOLS PAGE ============
function SchoolsPage({ currentUser, refreshUser }: { currentUser: User | null; refreshUser: () => void }) {
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', region: '', area: '', city: '', address: '', buildingNumber: '' });

  useEffect(() => { setSchools(store.getSchools().filter(s => s.approved)); }, []);

  const createSchoolRequest = () => {
    if (!currentUser) return;
    const school: SchoolType = {
      id: uuidv4(), ...form, approved: false,
      createdAt: new Date().toISOString(), students: [],
    };
    store.saveSchool(school);
    setShowCreate(false);
    setForm({ name: '', region: '', area: '', city: '', address: '', buildingNumber: '' });
    alert('Заявка на создание школы отправлена! Ожидает одобрения администратора.');
  };

  const joinSchool = (schoolId: string) => {
    if (!currentUser) return;
    const school = store.getSchools().find(s => s.id === schoolId)!;
    if (!school.students.includes(currentUser.id)) {
      school.students.push(currentUser.id);
      store.saveSchool(school);
      const user = { ...currentUser, schoolId };
      store.saveUser(user);
      refreshUser();
    }
  };

  return (
    <FadeIn className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2"><School className="w-6 h-6 text-cyan-400" /> Школы</h2>
        {currentUser && !currentUser.schoolId && (
          <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-sm transition"><Plus className="w-4 h-4 inline" /> Заявка на школу</button>
        )}
      </div>

      {showCreate && (
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 space-y-3">
          <h3 className="font-medium">Заявка на создание школы</h3>
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Название школы" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm focus:border-cyan-500 focus:outline-none" />
          <input value={form.region} onChange={e => setForm({ ...form, region: e.target.value })} placeholder="Регион / Область" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm focus:border-cyan-500 focus:outline-none" />
          <input value={form.area} onChange={e => setForm({ ...form, area: e.target.value })} placeholder="Район" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm focus:border-cyan-500 focus:outline-none" />
          <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="Город / Село / ПГТ" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm focus:border-cyan-500 focus:outline-none" />
          <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Улица" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm focus:border-cyan-500 focus:outline-none" />
          <input value={form.buildingNumber} onChange={e => setForm({ ...form, buildingNumber: e.target.value })} placeholder="№ здания" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm focus:border-cyan-500 focus:outline-none" />
          <div className="flex gap-2">
            <button onClick={createSchoolRequest} className="px-4 py-2 bg-green-600 rounded-lg text-sm">Отправить заявку</button>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 bg-slate-600 rounded-lg text-sm">Отмена</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {schools.map(school => (
          <div key={school.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="font-bold">{school.name}</div>
            <div className="text-sm text-slate-400">{school.region}, {school.area}, {school.city}</div>
            <div className="text-xs text-slate-500">{school.address}, д. {school.buildingNumber}</div>
            <div className="text-xs text-slate-500 mt-1">{school.students.length} учеников</div>
            {currentUser && !currentUser.schoolId && (
              <button onClick={() => joinSchool(school.id)} className="mt-2 px-3 py-1 bg-cyan-600/80 hover:bg-cyan-500 rounded text-xs transition">Выбрать мою школу</button>
            )}
          </div>
        ))}
      </div>
    </FadeIn>
  );
}

// ============ FAQ PAGE ============
function FAQPage({ currentUser }: { currentUser: User | null }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'faq' | 'mine'>('all');

  useEffect(() => { setQuestions(store.getQuestions()); }, []);

  const createQuestion = () => {
    if (!currentUser || !title || !text) return;
    const q: Question = {
      id: uuidv4(), userId: currentUser.id, nickname: currentUser.nickname,
      title, text, likes: [], isFAQ: false,
      createdAt: new Date().toISOString(), replies: [],
    };
    store.saveQuestion(q);
    setQuestions(store.getQuestions());
    setShowCreate(false);
    setTitle(''); setText('');
  };

  const toggleLike = (qId: string) => {
    if (!currentUser) return;
    const qs = store.getQuestions();
    const q = qs.find(x => x.id === qId)!;
    if (q.likes.includes(currentUser.id)) {
      q.likes = q.likes.filter(id => id !== currentUser.id);
    } else {
      q.likes.push(currentUser.id);
    }
    store.saveQuestion(q);
    setQuestions([...qs]);
  };

  const filtered = questions
    .filter(q => filter === 'faq' ? q.isFAQ : filter === 'mine' ? q.userId === currentUser?.id : true)
    .filter(q => !search || q.title.toLowerCase().includes(search.toLowerCase()) || q.text.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.likes.length - a.likes.length);

  return (
    <FadeIn className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2"><HelpCircle className="w-6 h-6 text-cyan-400" /> Вопросы и отзывы</h2>
        {currentUser && <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-sm transition"><Plus className="w-4 h-4 inline" /> Задать вопрос</button>}
      </div>

      <div className="flex flex-wrap gap-2">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск..." className="flex-1 min-w-[200px] px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm focus:border-cyan-500 focus:outline-none" />
        {(['all', 'faq', 'mine'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-2 rounded-lg text-sm transition ${filter === f ? 'bg-cyan-600' : 'bg-slate-700 hover:bg-slate-600'}`}>
            {f === 'all' ? 'Все' : f === 'faq' ? '⭐ Частые' : '👤 Мои'}
          </button>
        ))}
      </div>

      {showCreate && (
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 space-y-3">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Заголовок вопроса" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm focus:border-cyan-500 focus:outline-none" />
          <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Описание..." className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm focus:border-cyan-500 focus:outline-none" rows={3} />
          <div className="flex gap-2">
            <button onClick={createQuestion} className="px-4 py-2 bg-green-600 rounded-lg text-sm">Отправить</button>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 bg-slate-600 rounded-lg text-sm">Отмена</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map(q => (
          <div key={q.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-medium flex items-center gap-2">
                  {q.isFAQ && <Star className="w-4 h-4 text-yellow-400" />}
                  {q.title}
                </div>
                <div className="text-sm text-slate-400 mt-1">{q.text}</div>
                <div className="text-xs text-slate-500 mt-2">{q.nickname} • {new Date(q.createdAt).toLocaleDateString()}</div>
              </div>
              <button onClick={() => toggleLike(q.id)} className={`flex items-center gap-1 px-2 py-1 rounded text-sm transition ${q.likes.includes(currentUser?.id || '') ? 'bg-red-600/30 text-red-400' : 'bg-slate-700 text-slate-400 hover:text-red-400'}`}>
                <Heart className="w-4 h-4" /> {q.likes.length}
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-slate-500 py-8">Вопросов пока нет</p>}
      </div>
    </FadeIn>
  );
}

// ============ ADMIN PAGE ============
function AdminPage({ currentUser, refreshUser }: { currentUser: User | null; refreshUser: () => void }) {
  const [settings, setSettings] = useState<AdminSettings>(store.getSettings());
  const [resetRequests, setResetRequests] = useState(store.getResetRequests());
  const [pendingSchools, setPendingSchools] = useState(store.getSchools().filter(s => !s.approved));

  if (!currentUser || currentUser.role !== 'admin') {
    return <div className="text-center py-12 text-red-400">Доступ запрещён</div>;
  }

  const saveSettings = () => {
    store.saveSettings(settings);
    alert('Настройки сохранены!');
  };

  const approveReset = (reqId: string) => {
    const reqs = store.getResetRequests();
    const req = reqs.find(r => r.id === reqId)!;
    req.status = 'approved';
    store.saveResetRequest(req);
    const user = store.getUserByPhone(req.phone);
    if (user) {
      user.password = '';
      store.saveUser(user);
    }
    setResetRequests(store.getResetRequests());
  };

  const rejectReset = (reqId: string) => {
    const reqs = store.getResetRequests();
    const req = reqs.find(r => r.id === reqId)!;
    req.status = 'rejected';
    store.saveResetRequest(req);
    setResetRequests(store.getResetRequests());
  };

  const approveSchool = (schoolId: string) => {
    const schools = store.getSchools();
    const school = schools.find(s => s.id === schoolId)!;
    school.approved = true;
    school.approvedBy = currentUser.id;
    store.saveSchool(school);
    setPendingSchools(store.getSchools().filter(s => !s.approved));
  };

  const markFAQ = (qId: string) => {
    const qs = store.getQuestions();
    const q = qs.find(x => x.id === qId)!;
    q.isFAQ = !q.isFAQ;
    store.saveQuestion(q);
  };

  return (
    <FadeIn className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2"><Settings className="w-6 h-6 text-cyan-400" /> Панель администратора</h2>

      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-4">
        <h3 className="font-bold text-lg">⚙️ Настройки игры</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Время на ход (сек)</label>
            <input type="number" value={settings.turnTime} onChange={e => setSettings({ ...settings, turnTime: +e.target.value })} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm focus:border-cyan-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">XP за победу</label>
            <input type="number" value={settings.xpPerWin} onChange={e => setSettings({ ...settings, xpPerWin: +e.target.value })} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm focus:border-cyan-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">XP за выстрел</label>
            <input type="number" value={settings.xpPerShot} onChange={e => setSettings({ ...settings, xpPerShot: +e.target.value })} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm focus:border-cyan-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">XP за точность</label>
            <input type="number" value={settings.xpPerAccuracy} onChange={e => setSettings({ ...settings, xpPerAccuracy: +e.target.value })} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm focus:border-cyan-500 focus:outline-none" />
          </div>
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Пороги уровней (через запятую)</label>
          <input value={settings.levelThresholds.join(', ')} onChange={e => setSettings({ ...settings, levelThresholds: e.target.value.split(',').map(Number) })} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm focus:border-cyan-500 focus:outline-none" />
        </div>
        <button onClick={saveSettings} className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm transition">Сохранить настройки</button>
      </div>

      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-4">
        <h3 className="font-bold text-lg">🔑 Заявки на сброс пароля</h3>
        {resetRequests.filter(r => r.status === 'pending').length === 0 && <p className="text-slate-500 text-sm">Нет заявок</p>}
        {resetRequests.filter(r => r.status === 'pending').map(req => (
          <div key={req.id} className="bg-slate-700/50 rounded-lg p-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">{req.nickname}</div>
              <div className="text-xs text-slate-400">Тел: {req.phone} • Последний вход: ~{req.lastLoginApprox}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => approveReset(req.id)} className="px-3 py-1 bg-green-600 rounded text-xs">✓ Одобрить</button>
              <button onClick={() => rejectReset(req.id)} className="px-3 py-1 bg-red-600 rounded text-xs">✕ Отклонить</button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-4">
        <h3 className="font-bold text-lg">🏫 Заявки на создание школ</h3>
        {pendingSchools.length === 0 && <p className="text-slate-500 text-sm">Нет заявок</p>}
        {pendingSchools.map(school => (
          <div key={school.id} className="bg-slate-700/50 rounded-lg p-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">{school.name}</div>
              <div className="text-xs text-slate-400">{school.region}, {school.city}, {school.address} д.{school.buildingNumber}</div>
            </div>
            <button onClick={() => approveSchool(school.id)} className="px-3 py-1 bg-green-600 rounded text-xs">✓ Одобрить</button>
          </div>
        ))}
      </div>

      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-4">
        <h3 className="font-bold text-lg">⭐ Управление FAQ</h3>
        {store.getQuestions().map(q => (
          <div key={q.id} className="bg-slate-700/50 rounded-lg p-3 flex items-center justify-between">
            <div className="text-sm">{q.title} <span className="text-slate-500">({q.likes.length} ❤️)</span></div>
            <button onClick={() => markFAQ(q.id)} className={`px-3 py-1 rounded text-xs ${q.isFAQ ? 'bg-yellow-600' : 'bg-slate-600'}`}>
              {q.isFAQ ? '⭐ FAQ' : 'Отметить FAQ'}
            </button>
          </div>
        ))}
      </div>
    </FadeIn>
  );
}

// ============ GAME REDIRECT ============
function GameRedirect() {
  const navigate = useNavigate();
  useEffect(() => { navigate('/rooms'); }, []);
  return <div>Перенаправление...</div>;
}
