import React, { useMemo } from 'react';
import { Settings, MapPin, Sun, Zap, ChevronRight } from 'lucide-react';
import { IconMap } from '../constants/data';

const HomeDashboard = ({ scenarios, onSelect, onSettingsClick, weather, theme }) => {
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning,';
    if (hour < 18) return 'Good Afternoon,';
    return 'Good Evening,';
  }, []);

  return (
    <div className="p-6 pb-28 space-y-6 animate-fade-in">
      <header className="mt-4 flex justify-between items-center">
        <div>
          <h1 className={`text-2xl font-bold ${theme.textMain} tracking-tight`}>
            {greeting}<br />
            <span className={`${theme.primaryText} text-3xl`}>Where to today?</span>
          </h1>
        </div>
        <button
          onClick={onSettingsClick}
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
        >
          <Settings size={20} className="text-[#9A9A9A]" />
        </button>
      </header>

      <div className={`relative overflow-hidden ${theme.accentBlue} rounded-3xl p-6 text-[#5C6B5D] shadow-sm`}>
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/30 rounded-full blur-2xl"></div>
        <div className="flex justify-between items-start mb-4 relative z-10">
          <div>
            <div className={`flex items-center space-x-2 ${theme.primaryText} text-xs font-bold uppercase tracking-wider mb-1`}>
              <MapPin size={12} />
              <span>{weather.location} · Comfortable</span>
            </div>
            <div className="flex items-baseline space-x-2">
               <span className={`text-4xl font-bold ${theme.textMain}`}>{weather.temp}°</span>
               <span className="text-sm opacity-80 font-medium">{weather.condition}</span>
            </div>
          </div>
          <div className="w-12 h-12 bg-white/40 rounded-full flex items-center justify-center backdrop-blur-sm">
             <Sun className={theme.primaryText} size={24} />
          </div>
        </div>
        <div className="bg-white/40 backdrop-blur-md rounded-xl p-3 flex items-start space-x-3 relative z-10">
           <Zap size={16} className={`${theme.primaryText} mt-0.5 shrink-0`} />
           <p className={`text-xs font-medium leading-relaxed ${theme.textMain}`}>
             UV rays are strong today. We've added <span className={`font-bold mx-1 ${theme.primaryText}`}>Sunscreen</span> to your list.
           </p>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-end mb-4">
          <h2 className={`text-lg font-bold ${theme.textMain}`}>Quick Scenarios</h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {scenarios.slice(0, 4).map((scenario) => {
            const Icon = IconMap[scenario.icon] || IconMap.Briefcase;
            const cardTheme = scenario.theme || { bg: 'bg-white', text: 'text-gray-500' };
            return (
              <button
                key={scenario.id}
                onClick={() => onSelect(scenario.id)}
                className="group relative bg-white rounded-[24px] p-5 h-40 flex flex-col justify-between items-start shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.05)] transition-all active:scale-98 text-left border border-transparent hover:border-[#F0F0F0]"
              >
                <div className={`w-12 h-12 rounded-2xl ${cardTheme.bg} ${cardTheme.text} flex items-center justify-center transition-colors`}>
                  <Icon size={24} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className={`font-bold ${theme.textMain} text-lg`}>{scenario.name}</h3>
                  <p className={`text-xs ${theme.textSub} mt-1 font-medium`}>{scenario.items.length} items</p>
                </div>

                <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 translate-x-2">
                   <div className="bg-[#F5F5F5] rounded-full p-1.5">
                      <ChevronRight size={14} className="text-[#9A9A9A]"/>
                   </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HomeDashboard;