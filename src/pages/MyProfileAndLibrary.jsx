import React, { useState } from 'react';
import { Plus, Check, UserPlus, ChevronRight, Trash2, Briefcase } from 'lucide-react';
import { MOCK_HISTORY, IconMap } from '../constants/data';

const LibraryItem = ({ scenario, onSelect, onDelete, isCustom, theme }) => {
  const Icon = IconMap[scenario.icon] || Briefcase;
  const cardTheme = scenario.theme || { bg: 'bg-[#F5F5F5]', text: 'text-[#9A9A9A]' };

  return (
    <div onClick={() => onSelect(scenario.id)} className="flex items-center p-4 bg-white rounded-2xl border border-transparent hover:border-[#F0F0F0] shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md transition-all active:scale-98 cursor-pointer group">
      <div className={`p-3 rounded-xl ${cardTheme.bg} ${cardTheme.text} mr-4`}><Icon size={20} /></div>
      <div className="flex-1">
        <h4 className={`font-bold ${theme.textMain}`}>{scenario.name}</h4>
        <p className={`text-xs ${theme.textSub}`}>{scenario.items.length} items</p>
      </div>
      {isCustom ? (
        <button onClick={(e) => { e.stopPropagation(); onDelete(scenario.id); }} className="w-8 h-8 flex items-center justify-center text-[#D9D9D9] hover:text-[#D98282] hover:bg-[#FADCDC] rounded-full transition-colors"><Trash2 size={16} /></button>
      ) : (
        <div className={`w-8 h-8 flex items-center justify-center text-[#E0E0E0] ${theme.primaryHover} transition-colors group-hover:${theme.primaryText}`}><ChevronRight size={20} /></div>
      )}
    </div>
  );
};

const MyProfileAndLibrary = ({ scenarios, friends, onSelect, onDelete, onCreateClick, onAddFriend, theme }) => {
  const [activeSegment, setActiveSegment] = useState('scenarios');
  const customScenarios = scenarios.filter(s => s.type === 'custom');
  const presetScenarios = scenarios.filter(s => s.type !== 'custom');

  return (
    <div className={`flex flex-col h-full ${theme.bg}`}>
      <div className={`pt-10 pb-4 px-6 ${theme.bg} sticky top-0 z-10`}>
        <h1 className={`text-2xl font-bold ${theme.textMain} mb-6`}>Me</h1>
        <div className="bg-[#EAEAEA]/50 p-1 rounded-2xl flex relative">
          <button onClick={() => setActiveSegment('scenarios')} className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${activeSegment === 'scenarios' ? 'bg-white shadow-sm ' + theme.textMain : 'text-[#9A9A9A] hover:text-[#7D7D7D]'}`}>Templates</button>
          <button onClick={() => setActiveSegment('history')} className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${activeSegment === 'history' ? 'bg-white shadow-sm ' + theme.textMain : 'text-[#9A9A9A] hover:text-[#7D7D7D]'}`}>History</button>
          <button onClick={() => setActiveSegment('friends')} className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${activeSegment === 'friends' ? 'bg-white shadow-sm ' + theme.textMain : 'text-[#9A9A9A] hover:text-[#7D7D7D]'}`}>Friends</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-28 pt-2">
        {activeSegment === 'scenarios' ? (
          <div className="space-y-8 animate-fade-in">
            <div>
               <div className="flex justify-between items-center mb-4">
                 <h3 className={`text-xs font-bold ${theme.textSub} uppercase tracking-wider`}>Custom</h3>
                 <button onClick={onCreateClick} className={`${theme.primaryLight} ${theme.primaryText} px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-80`}>+ New</button>
               </div>
               {customScenarios.length > 0 ? (
                 <div className="space-y-3">{customScenarios.map(s => <LibraryItem key={s.id} scenario={s} onSelect={onSelect} onDelete={onDelete} isCustom theme={theme}/>)}</div>
               ) : (
                 <div className="border-2 border-dashed border-[#EAEAEA] rounded-2xl p-8 text-center bg-white/50">
                    <div className="w-12 h-12 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-3"><Plus size={20} className="text-[#C5C5C5]" /></div>
                    <p className={`text-sm ${theme.textSub} font-medium`}>Create your custom scenario</p>
                 </div>
               )}
            </div>
            <div>
               <h3 className={`text-xs font-bold ${theme.textSub} uppercase tracking-wider mb-4`}>Presets</h3>
               <div className="space-y-3">{presetScenarios.map(s => <LibraryItem key={s.id} scenario={s} onSelect={onSelect} theme={theme} />)}</div>
            </div>
          </div>
        ) : activeSegment === 'history' ? (
          <div className="space-y-4 animate-fade-in">
            {MOCK_HISTORY.map(record => (
              <div key={record.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-[#F0F0F0] shadow-sm">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 ${theme.success} rounded-full flex items-center justify-center`}><Check size={18} className="text-white" /></div>
                  <div><h4 className={`font-bold ${theme.textMain}`}>{record.name}</h4><p className={`text-xs ${theme.textSub}`}>{record.date}</p></div>
                </div>
                <span className="text-xs font-medium bg-[#F5F5F5] text-[#9A9A9A] px-3 py-1 rounded-full">Completed</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
             <div className="flex justify-between items-center bg-[#FDFDFD] p-4 rounded-2xl border border-[#F2F2F2] shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${theme.accentGreen} rounded-full flex items-center justify-center text-[#7A9E83]`}><UserPlus size={20} /></div>
                  <span className={`text-sm font-bold ${theme.textMain}`}>Add New Friend</span>
                </div>
                <button onClick={onAddFriend} className={`px-4 py-2 ${theme.primary} text-white text-xs font-bold rounded-xl active:scale-95 transition-transform`}>Add</button>
             </div>
             <div>
                <h3 className={`text-xs font-bold ${theme.textSub} uppercase tracking-wider mb-4`}>My Friends ({friends.length})</h3>
                <div className="grid grid-cols-2 gap-3">
                   {friends.map(friend => (
                     <div key={friend.id} className="bg-white p-4 rounded-2xl border border-[#F9F9F9] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col items-center text-center space-y-2">
                        <img src={friend.avatar} alt="avatar" className="w-14 h-14 rounded-full bg-[#F5F5F5] border-2 border-white shadow-sm" />
                        <div><h4 className={`text-sm font-bold ${theme.textMain}`}>{friend.name}</h4><span className="text-[10px] text-[#C0C0C0] bg-[#F5F5F5] px-2 py-0.5 rounded-full">Added</span></div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProfileAndLibrary;