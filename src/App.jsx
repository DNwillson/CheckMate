import React, { useState } from 'react';
import { Home as HomeIcon, User, Plus, Sparkles } from 'lucide-react';

// 1. 引入基礎資料與設定
import { THEMES, INITIAL_SCENARIOS, INITIAL_FRIENDS, WEATHER_DATA } from './constants/data';

// 2. 引入所有功能頁面
import UserLogin from './pages/UserLogin';
import HomeDashboard from './pages/HomeDashboard';
import MyProfileAndLibrary from './pages/MyProfileAndLibrary';
import SystemSettings from './pages/SystemSettings';
import ChecklistDetail from './pages/ChecklistDetail';
import CreateNewTrip from './pages/CreateNewTrip';
import PackingSuccess from './pages/PackingSuccess';
import AIChatAssistant from './pages/AIChatAssistant'; // 新增 AI 助手元件

// 底部導航按鈕小元件
const NavItem = ({ icon: Icon, label, active, onClick, theme }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center space-y-1 transition-all duration-300 ${active ? theme.primaryText + ' scale-110' : 'text-[#C0C0C0] hover:text-[#9A9A9A]'}`}
  >
    <Icon size={26} strokeWidth={active ? 2.5 : 2} />
    <span className="text-[10px] font-bold tracking-wide uppercase">{label}</span>
  </button>
);

export default function App() {
  // === 全域狀態管理 (Global States) ===
  const [currentView, setCurrentView] = useState('login');
  const [scenarios, setScenarios] = useState(INITIAL_SCENARIOS);
  const [friends, setFriends] = useState(INITIAL_FRIENDS);
  const [activeScenarioId, setActiveScenarioId] = useState(null);
  const [checkedItems, setCheckedItems] = useState({});
  const [activeTab, setActiveTab] = useState('home');
  const [currentThemeKey, setCurrentThemeKey] = useState('cinnamon');
  const [isChatOpen, setIsChatOpen] = useState(false); // 控制 AI 助手彈窗

  const THEME = THEMES[currentThemeKey];

  // === 邏輯處理函數 (Handlers) ===

  // 選擇特定場景進入詳細頁
  const handleSelectScenario = (id) => {
    setActiveScenarioId(id);
    setCheckedItems({}); // 換場景時重置打勾
    setCurrentView('detail');
  };

  // 導航列切換頁面
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentView(tab);
  };

  // 退出登錄
  const handleLogout = () => {
    setCurrentView('login');
    setActiveTab('home');
    setCurrentThemeKey('cinnamon');
  };

  // === 路由分配器 (Page Router) ===
  const renderView = () => {
    switch (currentView) {
      case 'login':
        return <UserLogin onLogin={() => setCurrentView('home')} theme={THEME} />;

      case 'home':
        return (
          <HomeDashboard
            scenarios={scenarios}
            onSelect={handleSelectScenario}
            onSettingsClick={() => setCurrentView('settings')}
            weather={WEATHER_DATA}
            theme={THEME}
          />
        );

      case 'me':
        return (
          <MyProfileAndLibrary
            scenarios={scenarios}
            friends={friends}
            onSelect={handleSelectScenario}
            onDelete={(id) => setScenarios(scenarios.filter(s => s.id !== id))}
            onCreateClick={() => setCurrentView('create')}
            onAddFriend={() => setFriends([...friends, { id: `f${Date.now()}`, name: 'New Friend', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=New' }])}
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
            onChangeTheme={setCurrentThemeKey}
          />
        );

      case 'detail':
        return (
          <ChecklistDetail
            scenario={scenarios.find(s => s.id === activeScenarioId)}
            friends={friends}
            updateScenario={(updated) => setScenarios(scenarios.map(s => s.id === updated.id ? updated : s))}
            checkedItems={checkedItems}
            setCheckedItems={setCheckedItems}
            onBack={() => setCurrentView(activeTab)}
            onFinish={() => setCurrentView('success')}
            weather={WEATHER_DATA}
            theme={THEME}
          />
        );

      case 'create':
        return (
          <CreateNewTrip
            onBack={() => setCurrentView(activeTab)}
            onSave={(newScenario) => {
              setScenarios([...scenarios, { ...newScenario, type: 'custom' }]);
              setCurrentView(activeTab);
            }}
            theme={THEME}
          />
        );

      case 'success':
        return <PackingSuccess onHome={() => { setCurrentView('home'); setActiveTab('home'); }} theme={THEME} />;

      default:
        return <UserLogin onLogin={() => setCurrentView('home')} theme={THEME} />;
    }
  };

  return (
    <div className={`w-full h-screen flex flex-col items-center justify-center overflow-hidden font-sans ${THEME.textMain} ${THEME.bg} transition-colors duration-500 relative`}>
      {/* 動態動畫全局設定 */}
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes float-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-float-up { animation: float-up 0.3s ease-out forwards; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      {/* 手機殼模擬容器 */}
      <div className={`w-full h-full max-w-md ${THEME.bg} shadow-2xl relative flex flex-col overflow-hidden transition-colors duration-500 border-x border-gray-100`}>

        {/* 1. 主內容區域 */}
        <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
          {renderView()}
        </div>

        {/* 2. AI 助手懸浮按鈕 (登入後顯示) */}
        {currentView !== 'login' && !isChatOpen && (
          <button
            onClick={() => setIsChatOpen(true)}
            className={`absolute bottom-28 right-6 w-14 h-14 ${THEME.primary} rounded-full flex items-center justify-center shadow-2xl z-40 active:scale-90 transition-all animate-float border-4 border-white`}
          >
            <Sparkles className="text-white" size={24} />
          </button>
        )}

        {/* 3. AI 助手彈窗層 */}
        <AIChatAssistant
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          theme={THEME}
        />

        {/* 4. 底部導航欄 (僅在 Home/Me 頁面顯示) */}
        {['home', 'me'].includes(currentView) && (
          <div className="h-24 bg-white/90 backdrop-blur-xl border-t border-[#EAEAEA] flex justify-around items-center pb-6 px-6 absolute bottom-0 w-full z-10 rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.02)]">
            <NavItem
              icon={HomeIcon}
              label="Home"
              active={activeTab === 'home'}
              onClick={() => handleTabChange('home')}
              theme={THEME}
            />

            {/* 中間的快速新建按鈕 */}
            <div className="relative -top-8 group">
              <button
                onClick={() => setCurrentView('create')}
                className={`w-16 h-16 ${THEME.primary} rounded-full flex items-center justify-center shadow-lg shadow-[#E6B89C]/40 active:scale-95 transition-all group-hover:scale-110 border-4 border-white`}
              >
                <Plus className="text-white w-8 h-8" />
              </button>
            </div>

            <NavItem
              icon={User}
              label="Me"
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