import { useEffect } from 'react';
import { NavLink, Route, Routes, useLocation, Link } from 'react-router-dom';
import { useAppState } from './lib/store';
import { currentStreak, todayXp } from './lib/state';
import { speechDefaults } from './lib/speech';
import { AchievementToasts } from './components/ui';
import Home from './pages/Home';
import Learn from './pages/Learn';
import LessonPage from './pages/Lesson';
import LevelTest from './pages/LevelTest';
import GrammarList from './pages/GrammarList';
import GrammarTopicPage from './pages/GrammarTopic';
import Conversations from './pages/Conversations';
import ConversationPage from './pages/Conversation';
import Flashcards from './pages/Flashcards';
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

const NAV = [
  { to: '/', label: 'Start', ico: '🏠', end: true },
  { to: '/lernen', label: 'Lernen', ico: '📚' },
  { to: '/gespraeche', label: 'Gespräche', ico: '💬' },
  { to: '/karten', label: 'Karten', ico: '🗂️' },
  { to: '/spiele', label: 'Spiele', ico: '🎮' },
  { to: '/mehr', label: 'Mehr', ico: '☰' },
];

const FOCUS_ROUTES = [/^\/lektion\//, /^\/test\//, /^\/karten\/lernen/, /^\/spiele\/.+/, /^\/gespraech\/.+\/spielen/];

export default function App() {
  const state = useAppState();
  const location = useLocation();
  const focus = FOCUS_ROUTES.some((r) => r.test(location.pathname));
  const { settings } = state;

  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'auto') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  useEffect(() => {
    speechDefaults.rate = settings.rate;
    speechDefaults.region = settings.region;
    speechDefaults.voiceURI = settings.voiceURI;
  }, [settings.rate, settings.region, settings.voiceURI]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const goal = Math.min(1, todayXp(state) / settings.dailyGoal);

  return (
    <div className={`app ${focus ? 'focus-page' : ''}`}>
      {!focus && (
        <header className="topbar">
          <Link to="/" className="brand">
            <span>🇪🇸</span> ¡Hablemos!
          </Link>
          <Link to="/statistik" className="stat-pill" title="Tagesserie">
            🔥 {currentStreak(state)}
          </Link>
          <Link to="/statistik" className="stat-pill" title="Tagesziel">
            {goal >= 1 ? '✅' : '🎯'} {todayXp(state)}/{settings.dailyGoal}
          </Link>
        </header>
      )}
      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lernen" element={<Learn />} />
          <Route path="/lektion/:id" element={<LessonPage />} />
          <Route path="/test/:level" element={<LevelTest />} />
          <Route path="/grammatik" element={<GrammarList />} />
          <Route path="/grammatik/:id" element={<GrammarTopicPage />} />
          <Route path="/gespraeche" element={<Conversations />} />
          <Route path="/gespraech/:id" element={<ConversationPage />} />
          <Route path="/gespraech/:id/spielen" element={<ConversationPage roleplay />} />
          <Route path="/karten" element={<Flashcards />} />
          <Route path="/karten/lernen" element={<FlashcardSession />} />
          <Route path="/spiele" element={<Games />} />
          <Route path="/spiele/:game" element={<GamePage />} />
          <Route path="/mehr" element={<More />} />
          <Route path="/woerterbuch" element={<Dictionary />} />
          <Route path="/verben" element={<Verbs />} />
          <Route path="/verben/:inf" element={<VerbPage />} />
          <Route path="/phrasen" element={<Phrasebook />} />
          <Route path="/falsche-freunde" element={<FalseFriends />} />
          <Route path="/kultur" element={<Culture />} />
          <Route path="/erfolge" element={<Achievements />} />
          <Route path="/einstellungen" element={<Settings />} />
          <Route path="/statistik" element={<Stats />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <nav className="bottomnav" aria-label="Hauptnavigation">
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => (isActive ? 'active' : '')}>
            <span className="ico">{n.ico}</span>
            <span>{n.label}</span>
          </NavLink>
        ))}
      </nav>
      <AchievementToasts />
    </div>
  );
}
