import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Home, Users, Trophy, MessageSquare, Shield, School, HelpCircle, Settings, LogOut, User as UserIcon, Gamepad2, Swords, Crown, Plus, Send, Heart, Star, Menu, Mail, Check, Trash2, Ban, Edit, UserPlus, Clock, Calendar, Download, Upload } from 'lucide-react';
import { User, Game, Room, Clan, Federation, School as SchoolType, ChatMessage, ClanChatMessage, Question, AdminTicket, GuestTicket, Tournament, Announcement, RolePermission } from './types';
import * as store from './store';
import { generateRandomPlacement, processShot, isAllSunk, getSunkShipCells, getDamagedShipCells } from './gameLogic';
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

// Продолжение в следующем файле из-за ограничения размера...
