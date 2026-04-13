import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Home as HomeIcon, User, Sparkles } from 'lucide-react';

import { THEMES, WEATHER_FALLBACK, buildDisplayTheme, DEFAULT_APP_PREFS } from './constants/data';
import { api, clearToken, getToken } from './api';

import UserLogin from './pages/UserLogin';
import HomeDashboard from './pages/HomeDashboard';
import MyProfileAndLibrary from './pages/MyProfileAndLibrary';
import SystemSettings from './pages/SystemSettings';
import ChecklistDetail from './pages/ChecklistDetail';
import CreateNewTrip from './pages/CreateNewTrip';
import PackingSuccess from './pages/PackingSuccess';
import AIChatAssistant from './pages/AIChatAssistant';
import { uiT } from './uiCopy';

const NavItem = ({ icon: Icon, label, active, onClick, theme }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center space-y-1 transition-all duration-300 ${
      active ? `${theme.primaryText} scale-110` : theme.navMuted
    }`}
  >
    <Icon size={26} strokeWidth={active ? 2.5 : 2} />
    <span className="text-[10px] font-bold tracking-wide uppercase">{label}</span>
  </button>
);

const ensureUniqueItemIds = (items) => {
  const seen = new Set();
  return (Array.isArray(items) ? items : []).map((it, idx) => {
    const rawId = it?.id;
    const normalized = rawId == null ? '' : String(rawId).trim();
    let nextId = normalized;
    if (!nextId || seen.has(nextId)) {
      nextId = `it_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 8)}`;
    }
    seen.add(nextId);
    return { ...(it || {}), id: nextId };
  });
};

export default function App() {
  const [currentView, setCurrentView] = useState('login');
  const [scenarios, setScenarios] = useState([]);
  const [friends, setFriends] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeScenarioId, setActiveScenarioId] = useState(null);
  /** null = my list; number = shared list owner's user id */
  const [activeScenarioOwnerId, setActiveScenarioOwnerId] = useState(null);
  const [checkedItems, setCheckedItems] = useState({});
  const [activeTab, setActiveTab] = useState('home');
  const [currentThemeKey, setCurrentThemeKey] = useState('cinnamon');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [sessionRestoring, setSessionRestoring] = useState(() => !!getToken());
  const [weather, setWeather] = useState(WEATHER_FALLBACK);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState(null);
  /** Same query params as last /api/weather call — used for /api/weather/detail. */
  const [weatherFetchParams, setWeatherFetchParams] = useState({});
  const [appPrefs, setAppPrefs] = useState(DEFAULT_APP_PREFS);
  const [meInitialSegment, setMeInitialSegment] = useState(null);
  const [lastPacked, setLastPacked] = useState(null);
  const appPrefsRef = useRef(DEFAULT_APP_PREFS);
  const currentThemeKeyRef = useRef(currentThemeKey);

  const t = useMemo(() => uiT(appPrefs?.language || 'en'), [appPrefs?.language]);

  const THEME = useMemo(
    () => buildDisplayTheme(currentThemeKey, appPrefs.dark_mode),
    [currentThemeKey, appPrefs.dark_mode],
  );

  useEffect(() => {
    currentThemeKeyRef.current = currentThemeKey;
  }, [currentThemeKey]);

  useEffect(() => {
    appPrefsRef.current = appPrefs;
  }, [appPrefs]);

  useEffect(() => {
    document.body.style.backgroundColor = appPrefs.dark_mode ? '#0f0e0c' : '#FFFBF5';
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, [appPrefs.dark_mode]);

  const loadWeather = useCallback(async () => {
    setWeatherLoading(true);
    setWeatherError(null);
    const coords = await new Promise((resolve) => {
      if (!appPrefsRef.current.auto_location) {
        resolve(null);
        return;
      }
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            label: 'Near you',
          }),
        () => resolve(null),
        { enableHighAccuracy: false, timeout: 12000, maximumAge: 600000 },
      );
    });
    try {
      const data = coords
        ? await api.getWeather({ lat: coords.lat, lon: coords.lon, label: coords.label })
        : await api.getWeather();
      setWeatherFetchParams(
        coords ? { lat: coords.lat, lon: coords.lon, label: coords.label } : {},
      );
      setWeather({ ...WEATHER_FALLBACK, ...data });
    } catch (e) {
      const msg = e?.message || 'Weather could not be loaded.';
      setWeatherError(msg);
      setWeather((prev) =>
        prev && prev.location && prev.location !== WEATHER_FALLBACK.location ? prev : WEATHER_FALLBACK,
      );
    } finally {
      setWeatherLoading(false);
    }
  }, []);

  const refreshData = useCallback(async () => {
    const [scenariosData, friendsData, historyData, prefs] = await Promise.all([
      api.getScenarios(),
      api.getFriends(),
      api.getHistory(),
      api.getPreferences(),
    ]);
    const normalizedScenarios = (Array.isArray(scenariosData) ? scenariosData : []).map((s) => ({
      ...s,
      items: ensureUniqueItemIds(s?.items),
    }));
    setScenarios(normalizedScenarios);
    setFriends(Array.isArray(friendsData) ? friendsData : []);
    setHistory(Array.isArray(historyData) ? historyData : []);
    if (prefs && prefs.theme_key && THEMES[prefs.theme_key]) {
      setCurrentThemeKey(prefs.theme_key);
    }
    const nextPrefs = {
      notifications: prefs?.notifications !== false,
      sounds: prefs?.sounds !== false,
      auto_location: prefs?.auto_location !== false,
      dark_mode: !!prefs?.dark_mode,
      language: prefs?.language === 'zh' ? 'zh' : 'en',
    };
    setAppPrefs(nextPrefs);
    appPrefsRef.current = nextPrefs;
    return nextPrefs;
  }, []);

  useEffect(() => {
    let cancelled = false;
    const token = getToken();
    if (!token) {
      setSessionRestoring(false);
      return undefined;
    }

    (async () => {
      try {
        const user = await api.getMe();
        if (cancelled) return;
        setCurrentUser(user);
        await refreshData();
        await loadWeather();
        setCurrentView('home');
      } catch {
        if (!cancelled) clearToken();
      } finally {
        if (!cancelled) setSessionRestoring(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [refreshData, loadWeather]);

  const handleAuth = useCallback(
    async ({ username, password, mode }) => {
      if (mode === 'register') {
        const data = await api.register({ username, password });
        setCurrentUser(data.user);
      } else {
        const data = await api.login({ username, password });
        setCurrentUser(data.user);
      }
      await refreshData();
      await loadWeather();
      setCurrentView('home');
    },
    [refreshData, loadWeather],
  );

  const handleSelectScenario = useCallback(
    (id, ownerUserId = null) => {
      setActiveScenarioId(id);
      setActiveScenarioOwnerId(ownerUserId);
      const sc = scenarios.find(
        (s) => s.id === id && (s.owner_user_id ?? null) === (ownerUserId ?? null),
      );
      const next = {};
      (sc?.items || []).forEach((it) => {
        if (it && it.id != null && it.checked) next[it.id] = true;
      });
      setCheckedItems(next);
      setCurrentView('detail');
    },
    [scenarios],
  );

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentView(tab);
  };

  const handleLogout = useCallback(() => {
    api.logout();
    setCurrentUser(null);
    setScenarios([]);
    setFriends([]);
    setHistory([]);
    setWeather(WEATHER_FALLBACK);
    setWeatherFetchParams({});
    setWeatherError(null);
    setWeatherLoading(false);
    setActiveScenarioOwnerId(null);
    setAppPrefs(DEFAULT_APP_PREFS);
    appPrefsRef.current = DEFAULT_APP_PREFS;
    setCurrentThemeKey('cinnamon');
    currentThemeKeyRef.current = 'cinnamon';
    setCurrentView('login');
    setActiveTab('home');
    setSessionRestoring(false);
    setMeInitialSegment(null);
    setLastPacked(null);
  }, []);

  const handleChangeTheme = async (key) => {
    setCurrentThemeKey(key);
    currentThemeKeyRef.current = key;
    try {
      await api.putPreferences({ theme_key: key });
    } catch {
      /* keep local theme if API fails */
    }
  };

  const handleChangeAppPrefs = useCallback(async (partial) => {
    const prev = appPrefsRef.current;
    const next = { ...prev, ...partial };
    setAppPrefs(next);
    appPrefsRef.current = next;
    try {
      await api.putPreferences({ theme_key: currentThemeKeyRef.current, ...partial });
    } catch {
      try {
        const prefs = await api.getPreferences();
        const restored = {
          notifications: prefs?.notifications !== false,
          sounds: prefs?.sounds !== false,
          auto_location: prefs?.auto_location !== false,
          dark_mode: !!prefs?.dark_mode,
          language: prefs?.language === 'zh' ? 'zh' : 'en',
        };
        setAppPrefs(restored);
        appPrefsRef.current = restored;
        if (prefs?.theme_key && THEMES[prefs.theme_key]) {
          setCurrentThemeKey(prefs.theme_key);
          currentThemeKeyRef.current = prefs.theme_key;
        }
      } catch {
        setAppPrefs(prev);
        appPrefsRef.current = prev;
      }
    }
  }, []);

  const handleSaveProfileDisplayName = useCallback(async (name) => {
    if (!currentUser?.username) return;
    const user = await api.putMe({ display_name: name });
    setCurrentUser(user);
  }, [currentUser]);

  const handleChangePassword = useCallback(async ({ currentPassword, newPassword }) => {
    await api.putPassword({
      current_password: currentPassword,
      new_password: newPassword,
    });
  }, []);

  const handleDeleteAccount = useCallback(async () => {
    await api.deleteAccount();
    handleLogout();
  }, [handleLogout]);

  const handleDeleteScenario = async (id) => {
    await api.deleteScenario(id);
    await refreshData();
  };

  const handleDeleteScenariosBatch = useCallback(
    async (ids) => {
      const clean = Array.from(new Set((Array.isArray(ids) ? ids : []).filter(Boolean)));
      if (!clean.length) return;
      await Promise.all(clean.map((id) => api.deleteScenario(id)));
      await refreshData();
    },
    [refreshData],
  );

  const handleDeleteFriend = async (id) => {
    await api.deleteFriend(id);
    await refreshData();
  };

  const handleSaveTrip = async (newScenario) => {
    await api.createScenario({
      id: newScenario.id,
      name: newScenario.name,
      icon: newScenario.icon,
      theme: newScenario.theme,
      items: newScenario.items,
    });
    await refreshData();
    setCurrentView(activeTab);
  };

  const handleCreateTripFromAssistant = useCallback(
    async ({ name, items }) => {
      const cleanName = String(name || '').trim() || `AI Trip ${new Date().toLocaleDateString()}`;
      const cleanItems = ensureUniqueItemIds(Array.isArray(items) ? items : []);
      if (!cleanItems.length) throw new Error('No items to import.');
      await api.createScenario({
        id: Date.now().toString(),
        name: cleanName,
        icon: 'Backpack',
        theme: { bg: THEME.primaryLight, text: THEME.primaryText },
        items: cleanItems,
      });
      await refreshData();
    },
    [THEME.primaryLight, THEME.primaryText, refreshData],
  );

  const handleAppendAssistantItems = useCallback(
    async ({ scenarioId, items }) => {
      const target = scenarios.find((s) => s.id === scenarioId);
      if (!target) throw new Error('Trip not found.');
      if (target.access === 'shared') throw new Error('This trip is view-only.');

      const incoming = Array.isArray(items) ? items : [];
      if (!incoming.length) throw new Error('No items to import.');

      const normalize = (v) => String(v || '').trim().toLowerCase().replace(/\s+/g, ' ');
      const exists = new Set((target.items || []).map((it) => normalize(it?.text)));
      const nextItems = ensureUniqueItemIds(target.items || []);
      incoming.forEach((it) => {
        const text = String(it?.text || '').trim();
        if (!text) return;
        const key = normalize(text);
        if (exists.has(key)) return;
        exists.add(key);
        nextItems.push({
          id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          text,
          critical: !!it?.critical,
          assignedTo: 'me',
        });
      });

      await api.updateScenario(scenarioId, { items: nextItems });
      await refreshData();
    },
    [refreshData, scenarios],
  );

  const handleAppendWeatherItems = useCallback(
    async ({ scenarioId, items }) => {
      const target = scenarios.find((s) => s.id === scenarioId);
      if (!target) throw new Error('Trip not found.');
      if (target.access === 'shared') throw new Error('This trip is view-only.');

      const incoming = Array.isArray(items) ? items : [];
      if (!incoming.length) throw new Error('No items to import.');

      const normalize = (v) => String(v || '').trim().toLowerCase().replace(/\s+/g, ' ');
      const exists = new Set((target.items || []).map((it) => normalize(it?.text)));
      const nextItems = ensureUniqueItemIds(target.items || []);
      incoming.forEach((it) => {
        const text = String(it?.text || '').trim();
        if (!text) return;
        const key = normalize(text);
        if (exists.has(key)) return;
        exists.add(key);
        nextItems.push({
          id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          text,
          critical: !!it?.critical,
          assignedTo: 'me',
        });
      });

      await api.updateScenario(scenarioId, { items: nextItems });
      await refreshData();
    },
    [refreshData, scenarios],
  );

  const handleOpenTripsFromAssistant = useCallback(() => {
    setIsChatOpen(false);
    setActiveTab('me');
    setMeInitialSegment('scenarios');
    setCurrentView('me');
  }, []);

  const handleUpdateScenario = async (updated) => {
    const isSharedEdit = updated?.access === 'shared_edit' || (activeScenarioOwnerId ?? null) !== null;
    const payload = isSharedEdit ? { items: updated.items } : updated;
    const saved = await api.updateScenario(updated.id, payload);
    setScenarios((prev) =>
      prev.map((s) => {
        if (s.id !== updated.id) return s;
        if ((s.owner_user_id ?? null) !== (activeScenarioOwnerId ?? null)) return s;
        return {
          ...saved,
          owner_user_id: s.owner_user_id,
          access: s.access,
          owner_username: s.owner_username,
          share_recipients: s.share_recipients,
        };
      }),
    );
  };

  const handleShareScenario = useCallback(
    async (scenarioId, username) => {
      await api.shareScenario(scenarioId, username);
      await refreshData();
    },
    [refreshData],
  );

  const handleUnshareScenario = useCallback(
    async (scenarioId, username) => {
      await api.unshareScenario(scenarioId, username);
      await refreshData();
    },
    [refreshData],
  );

  const handleDeleteHistoryRecord = useCallback(
    async (recordId) => {
      await api.deleteHistoryRecord(recordId);
      await refreshData();
    },
    [refreshData],
  );

  const handleClearHistory = useCallback(async () => {
    await api.clearHistory();
    await refreshData();
  }, [refreshData]);

  const handleFinishPacking = async () => {
    const sc = scenarios.find(
      (s) => s.id === activeScenarioId && (s.owner_user_id ?? null) === (activeScenarioOwnerId ?? null),
    );
    if (sc?.access === 'shared') return;
    if (sc) {
      if (sc.access === 'owner') {
        await api.addHistory({ name: sc.name });
        await api.updateScenario(sc.id, { archived: true });
        setLastPacked({ name: sc.name, at: new Date().toISOString() });
        await refreshData();
      }
    }
    setCurrentView('success');
  };

  const meProfile = useMemo(() => {
    if (!currentUser) {
      return { id: 'me', name: 'Me', username: '', avatar: '', db_id: null };
    }
    return currentUser;
  }, [currentUser]);

  const renderView = () => {
    switch (currentView) {
      case 'login':
        return <UserLogin onAuth={handleAuth} theme={THEME} t={t} />;

      case 'home':
        return (
          <HomeDashboard
            scenarios={scenarios}
            onSelect={handleSelectScenario}
            onSettingsClick={() => setCurrentView('settings')}
            onAddWeatherItems={handleAppendWeatherItems}
            weather={weather}
            weatherLoading={weatherLoading}
            weatherError={weatherError}
            onRefreshWeather={loadWeather}
            weatherFetchParams={weatherFetchParams}
            theme={THEME}
            t={t}
          />
        );

      case 'me':
        return (
          <MyProfileAndLibrary
            scenarios={scenarios}
            friends={friends}
            history={history}
            onSelect={handleSelectScenario}
            onDelete={handleDeleteScenario}
            onDeleteMany={handleDeleteScenariosBatch}
            onCreateClick={() => setCurrentView('create')}
            onDeleteFriend={handleDeleteFriend}
            onRefresh={refreshData}
            onDeleteHistoryRecord={handleDeleteHistoryRecord}
            onClearHistory={handleClearHistory}
            initialSegment={meInitialSegment}
            theme={THEME}
          />
        );

      case 'settings':
        return (
          <SystemSettings
            onBack={() => setCurrentView(activeTab)}
            onLogout={handleLogout}
            theme={THEME}
            currentThemeKey={currentThemeKey}
            onChangeTheme={handleChangeTheme}
            currentUser={meProfile}
            onSaveProfileDisplayName={handleSaveProfileDisplayName}
            onChangePassword={handleChangePassword}
            onDeleteAccount={handleDeleteAccount}
            appPrefs={appPrefs}
            onAppPrefsChange={handleChangeAppPrefs}
          />
        );

      case 'detail': {
        const scenario = scenarios.find(
          (s) => s.id === activeScenarioId && (s.owner_user_id ?? null) === (activeScenarioOwnerId ?? null),
        );
        if (!scenario) {
          return (
            <div className={`p-8 ${THEME.textMain}`}>
              <p className="text-center text-sm">{"We couldn't find that scenario. Go back and try again."}</p>
              <button
                type="button"
                onClick={() => setCurrentView(activeTab)}
                className={`mt-6 w-full py-3 rounded-xl font-bold ${THEME.primary} text-white`}
              >
                Go back
              </button>
            </div>
          );
        }
        return (
          <ChecklistDetail
            scenario={scenario}
            friends={friends}
            updateScenario={handleUpdateScenario}
            checkedItems={checkedItems}
            setCheckedItems={setCheckedItems}
            onBack={() => setCurrentView(activeTab)}
            onFinish={handleFinishPacking}
            weather={weather}
            theme={THEME}
            meUser={meProfile}
            onShareScenario={handleShareScenario}
            onUnshareScenario={handleUnshareScenario}
            t={t}
          />
        );
      }

      case 'create':
        return (
          <CreateNewTrip
            onBack={() => setCurrentView(activeTab)}
            onSave={async (payload) => {
              await handleSaveTrip({ ...payload, type: 'custom' });
            }}
            theme={THEME}
          />
        );

      case 'success':
        return (
          <PackingSuccess
            onHome={() => {
              setCurrentView('home');
              setActiveTab('home');
            }}
            onViewHistory={() => {
              setMeInitialSegment('history');
              setActiveTab('me');
              setCurrentView('me');
            }}
            lastPacked={lastPacked}
            theme={THEME}
            t={t}
          />
        );

      default:
        return <UserLogin onAuth={handleAuth} theme={THEME} t={t} />;
    }
  };

  return (
    <div className={`w-full h-screen flex flex-col items-center justify-center overflow-hidden font-sans ${THEME.textMain} ${THEME.bg} transition-colors duration-500 relative`}>
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes float-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-float-up { animation: float-up 0.3s ease-out forwards; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      <div className={`w-full h-full max-w-md ${THEME.bg} shadow-2xl relative flex flex-col overflow-hidden transition-colors duration-500 border-x border-gray-100`}>
        {sessionRestoring ? (
          <div
            className={`absolute inset-0 z-[60] flex flex-col items-center justify-center gap-3 ${THEME.sessionMask}`}
          >
            <div className={`h-8 w-8 rounded-full border-2 animate-spin ${THEME.sessionSpinner}`} />
            <p className={`text-sm font-semibold ${THEME.textMain}`}>Loading…</p>
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
          {renderView()}
        </div>

        <AIChatAssistant
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          theme={THEME}
          scenarios={scenarios}
          onCreateTripFromAssistant={handleCreateTripFromAssistant}
          onAppendAssistantItems={handleAppendAssistantItems}
          onOpenTrips={handleOpenTripsFromAssistant}
          t={t}
        />

        {['home', 'me'].includes(currentView) && (
          <div
            className={`h-24 ${THEME.shell} flex justify-around items-center pb-6 px-6 absolute bottom-0 w-full z-10 rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.02)]`}
          >
            <NavItem
              icon={HomeIcon}
              label={t('navHome')}
              active={activeTab === 'home'}
              onClick={() => handleTabChange('home')}
              theme={THEME}
            />

            <div className="relative -top-8 group">
              <button
                type="button"
                onClick={() => setIsChatOpen(true)}
                className={`w-16 h-16 ${THEME.primary} rounded-full flex items-center justify-center shadow-lg shadow-[#E6B89C]/40 active:scale-95 transition-all group-hover:scale-110 border-4 ${THEME.fabRing}`}
              >
                <Sparkles className="text-white w-7 h-7" />
              </button>
            </div>

            <NavItem
              icon={User}
              label={t('navMe')}
              active={activeTab === 'me'}
              onClick={() => handleTabChange('me')}
              theme={THEME}
            />
          </div>
        )}
      </div>
    </div>
  );
}
