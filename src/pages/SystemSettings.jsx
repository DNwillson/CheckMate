import React, { useState } from 'react';
import { ChevronLeft, Bell, Volume2, MapPin, Globe, Moon, Palette, Smartphone, Lock, Shield, HelpCircle, FileText, Zap, ChevronRight } from 'lucide-react';
import { CURRENT_USER, THEMES } from '../constants/data';

const SettingRow = ({ icon: Icon, label, toggle, defaultOn, value, arrow, theme }) => {
  const [isOn, setIsOn] = useState(defaultOn || false);
  return (
    <div onClick={() => toggle && setIsOn(!isOn)} className={`flex items-center justify-between p-5 border-b border-[#F9F9F9] last:border-0 ${toggle ? 'cursor-pointer active:bg-[#FAFAFA]' : ''} transition-colors`}>
       <div className={`flex items-center space-x-3 ${theme.textMain}`}>
         <Icon size={20} className="text-[#9A9A9A]" />
         <span className="font-medium">{label}</span>
       </div>
       <div className="flex items-center">
         {toggle ? (
           <div className={`w-12 h-7 rounded-full relative transition-colors duration-300 ease-in-out ${isOn ? theme.success : 'bg-[#EAEAEA]'}`}>
             <div className={`w-6 h-6 bg-white rounded-full shadow-sm absolute top-0.5 transition-all duration-300 ease-in-out ${isOn ? 'left-[22px]' : 'left-0.5'}`} />
           </div>
         ) : (
           <div className="flex items-center">
             {value && <span className="text-xs text-[#9A9A9A] mr-2">{value}</span>}
             {(arrow || value === undefined) && <ChevronRight size={18} className="text-[#D1D1D1]" />}
           </div>
         )}
       </div>
    </div>
  );
};

const SystemSettings = ({ onBack, onLogout, theme, currentThemeKey, onChangeTheme }) => (
  <div className={`flex flex-col h-full ${theme.bg}`}>
      <div className={`${theme.bg}/90 px-6 pt-10 pb-4 sticky top-0 flex items-center z-10 backdrop-blur-sm`}>
         <button onClick={onBack} className={`mr-4 p-2 -ml-2 rounded-full hover:bg-black/5 transition-colors ${theme.textMain}`}><ChevronLeft size={24}/></button>
         <h1 className={`text-xl font-bold ${theme.textMain}`}>Settings</h1>
      </div>

      <div className="p-6 space-y-6 overflow-y-auto pb-10">
         <div className="bg-white p-5 rounded-3xl shadow-sm flex items-center space-x-4 border border-[#F5F5F5]">
            <img src={CURRENT_USER.avatar} alt="avatar" className="w-16 h-16 rounded-full bg-[#F5F5F5]" />
            <div className="flex-1">
              <h3 className={`font-bold ${theme.textMain} text-lg`}>{CURRENT_USER.name}</h3>
              <p className={`text-xs ${theme.textSub}`}>Logged in · ID: 88291</p>
            </div>
            <button className="text-xs bg-[#F5F5F5] px-3 py-1.5 rounded-lg text-[#9A9A9A] font-medium">Edit</button>
         </div>

         <div>
            <h4 className="text-xs font-bold text-[#C0C0C0] uppercase tracking-wider mb-3 ml-2">General & Preferences</h4>
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-[#F5F5F5]">
                <SettingRow icon={Bell} label="Notifications" toggle defaultOn={true} theme={theme} />
                <SettingRow icon={Volume2} label="Sounds & Haptics" toggle defaultOn={true} theme={theme} />
                <SettingRow icon={MapPin} label="Auto-Location" toggle defaultOn={true} theme={theme} />
                <SettingRow icon={Globe} label="Language" value="English" theme={theme} />
            </div>
         </div>

         <div>
            <h4 className="text-xs font-bold text-[#C0C0C0] uppercase tracking-wider mb-3 ml-2">Personalization</h4>
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-[#F5F5F5]">
                <SettingRow icon={Moon} label="Dark Mode" toggle defaultOn={false} theme={theme} />
                <div className="p-5 flex items-center justify-between border-b border-[#F9F9F9] last:border-0">
                   <div className={`flex items-center space-x-3 ${theme.textMain}`}>
                     <Palette size={20} className="text-[#9A9A9A]" />
                     <span className="font-medium">Theme Color</span>
                   </div>
                   <div className="flex space-x-3">
                      {Object.keys(THEMES).map(themeKey => {
                        const t = THEMES[themeKey];
                        const isActive = currentThemeKey === themeKey;
                        return (
                          <button key={themeKey} onClick={() => onChangeTheme(themeKey)} className={`w-6 h-6 rounded-full ${t.primary} border-2 transition-all ${isActive ? `border-[#EAEAEA] ring-2 ring-offset-2 ${t.primaryBorder}` : 'border-white'}`} title={t.name}/>
                        )
                      })}
                   </div>
                </div>
            </div>
         </div>

         <div className="text-center pt-4 pb-8">
            <button onClick={onLogout} className={`w-full text-[#D98282] font-medium text-sm bg-[#FFF5F5] border border-[#FADCDC] px-6 py-4 rounded-2xl active:scale-98 transition-transform`}>
              Log Out
            </button>
         </div>
      </div>
  </div>
);

export default SystemSettings;