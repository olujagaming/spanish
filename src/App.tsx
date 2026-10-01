import { useEffect } from 'react';
import { NavLink, Route, Routes, useLocation, Link, Navigate } from 'react-router-dom';
import { useAppState } from './lib/store';
import { currentStreak } from './lib/state';
import { speechDefaults } from './lib/speech';
import { AchievementToasts } from './components/ui';
import { Icon } from './components/Icon';
import { BrandMark } from './components/BrandMark';
import Home from './pages/Home';
import Learn from './pages/Learn';
import LessonPage from './pages/Lesson';
import LevelTest from './pages/LevelTest';
import GrammarList from './pages/GrammarList';
import GrammarTopicPage from './pages/GrammarTopic';
import Conversations from './pages/Conversations';
import ConversationPage from './pages/Conversation';
import Dex from './pages/Dex';
import DexEntryPage from './pages/DexEntry';
import FlashcardSession from './pages/FlashcardSession';
import Games from './pages/Games';
import GamePage from './pages/games';
import More from './pages/More';
import Dictionary from './pages/Dictionary';
import Verbs from './pages/Verbs';
import VerbPage from './pages/Verb';
import Phrasebook from './pages/Phrasebook';
import FalseFriends from './pages/FalseFriends';
import Culture from './pages/Culture';
import Achievements from './pages/Achievements';
import Settings from './pages/Settings';
import Stats from './pages/Stats';
import Shop from './pages/Shop';

const NAV = [
  { to: '/', label: 'Plaza', icon: 'plaza', end: true },
  { to: '/mapa', label: 'Mapa', icon: 'mapa' },
  { to: '/dex', label: 'Dex', icon: 'dex' },
  { to: '/tertulias', label: 'Tertulias', icon: 'tertulia' },
  { to: '/arena', label: 'Arena', icon: 'arena' },
  { to: '/mas', label: 'Más', icon: 'mas' },
];

const FOCUS_ROUTES = [/^\/mision\//, /^\/atajo\//, /^\/repasar/, /^\/arena\/.+/, /^\/tertulia\/.+\/jugar/];

export default function App() {
  const state = useAppState();
  const location = useLocation();
  const focus = FOCUS_ROUTES.some((r) => r.test(location.pathname));
  const { settings } = state;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    meta?.setAttribute('content', settings.theme === 'light' ? '#f4efe6' : '#0b0e1a');
  }, [settings.theme]);

  useEffect(() => {
    speechDefaults.rate = settings.rate;
    speechDefaults.region = settings.region;
    speechDefaults.voiceURI = settings.voiceURI;
  }, [settings.rate, settings.region, settings.voiceURI]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className={`app ${focus ? 'focus-page' : ''}`}>
      {!focus && (
        <header className="topbar">
          <Link to="/" className="brand">
            <BrandMark className="brand-mark" /> Hablemos
          </Link>
          <Link to="/estadistica" className="stat-pill" title="Racha – Tage in Folge">
            <Icon name="racha" size={15} /> {currentStreak(state)}
          </Link>
          <Link to="/tienda" className="stat-pill" title="Reales – deine Währung für die Plaza">
            <Icon name="real" size={15} /> {state.reales}
          </Link>
        </header>
      )}
      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mapa" element={<Learn />} />
          <Route path="/mision/:id" element={<LessonPage />} />
          <Route path="/atajo/:level" element={<LevelTest />} />
          <Route path="/codice" element={<GrammarList />} />
          <Route path="/codice/:id" element={<GrammarTopicPage />} />
          <Route path="/tertulias" element={<Conversations />} />
          <Route path="/tertulia/:id" element={<ConversationPage />} />
          <Route path="/tertulia/:id/jugar" element={<ConversationPage roleplay />} />
          <Route path="/dex" element={<Dex />} />
          <Route path="/dex/:no" element={<DexEntryPage />} />
          <Route path="/repasar" element={<FlashcardSession />} />
          <Route path="/arena" element={<Games />} />
          <Route path="/arena/:game" element={<GamePage />} />
          <Route path="/tienda" element={<Shop />} />
          <Route path="/mas" element={<More />} />
          <Route path="/diccionario" element={<Dictionary />} />
          <Route path="/verbos" element={<Verbs />} />
          <Route path="/verbos/:inf" element={<VerbPage />} />
          <Route path="/frases" element={<Phrasebook />} />
          <Route path="/falsos-amigos" element={<FalseFriends />} />
          <Route path="/cultura" element={<Culture />} />
          <Route path="/logros" element={<Achievements />} />
          <Route path="/ajustes" element={<Settings />} />
          <Route path="/estadistica" element={<Stats />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <nav className="bottomnav" aria-label="Hauptnavigation">
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => (isActive ? 'active' : '')}>
            <Icon name={n.icon} size={22} />
            <span>{n.label}</span>
          </NavLink>
        ))}
      </nav>
      <AchievementToasts />
    </div>
  );
}
