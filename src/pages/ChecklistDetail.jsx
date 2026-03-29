import React, { useState, useMemo } from 'react';
import { ChevronLeft, Users, Share2, AlertCircle, Smile, X, Check, Briefcase } from 'lucide-react';
import { CURRENT_USER, IconMap } from '../constants/data';

const AssigneeBtn = ({ user, active, onClick, theme }) => (
  <button onClick={onClick} className="flex flex-col items-center space-y-2 group">
    <div className={`w-14 h-14 rounded-full p-1 transition-all ${active ? theme.primary : 'bg-transparent'}`}>
       <img src={user?.avatar} alt="avatar" className="w-full h-full rounded-full bg-white" />
    </div>
    <span className={`text-xs font-bold ${active ? theme.primaryText : 'text-[#9A9A9A]'}`}>{user?.name}</span>
  </button>
);

const CheckItem = ({ item, checked, onToggle, type, collaborators, friends, onAssignClick, theme }) => {
  const isCritical = type === 'critical';
  const hasCollaborators = collaborators && collaborators.length > 0;
  let assigneeAvatar = CURRENT_USER.avatar;
  let assigneeName = 'Me';

  if (item.assignedTo && item.assignedTo !== 'me') {
    const friend = friends ? friends.find(f => f.id === item.assignedTo) : null;
    if (friend) { assigneeAvatar = friend.avatar; assigneeName = friend.name; }
  }

  const checkColor = isCritical ? 'bg-[#D98282] border-[#D98282]' : `${theme.success} border-[#CCD5AE]`;
  const borderColor = isCritical ? 'border-[#FADCDC] bg-[#FFF5F5]' : 'border-[#EAEAEA] bg-white';

  return (
    <div onClick={onToggle} className={`relative flex items-center p-5 border-b last:border-0 border-[#F9F9F9] cursor-pointer transition-colors duration-200 ${checked ? 'bg-[#FAF9F6]' : 'bg-white hover:bg-[#FFFCF8]'}`}>
      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 transition-all duration-300 shadow-sm ${checked ? checkColor : borderColor}`}>
        <Check size={14} className={`text-white transition-transform duration-300 ${checked ? 'scale-100' : 'scale-0'}`} />
      </div>
      <div className="flex-1 pr-10">
        <span className={`font-medium text-base transition-all duration-300 block ${checked ? 'text-[#D1D1D1] line-through decoration-[#EAEAEA]' : theme.textMain}`}>{item.text}</span>
        <div className="flex items-center mt-1.5 space-x-2">
          {isCritical && !checked && <span className={`text-[10px] font-bold ${theme.danger} px-2 py-0.5 rounded-md`}>Must</span>}
          {item.assignedTo && hasCollaborators && <span className="text-[10px] text-[#B0B0B0] flex items-center bg-[#F5F5F5] px-2 py-0.5 rounded-md">by {assigneeName}</span>}
        </div>
      </div>
      {hasCollaborators && (
        <div onClick={(e) => { e.stopPropagation(); onAssignClick(); }} className="absolute right-4 top-1/2 transform -translate-y-1/2 active:scale-90 transition-transform cursor-pointer">
           <img src={assigneeAvatar} alt="avatar" className={`w-9 h-9 rounded-full border-2 border-white shadow-sm`} />
        </div>
      )}
    </div>
  );
};

const ChecklistDetail = ({ scenario, friends, updateScenario, checkedItems, setCheckedItems, onBack, onFinish, weather, theme }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [assigningItem, setAssigningItem] = useState(null);

  const finalItems = useMemo(() => [...scenario.items], [scenario, weather]);
  const totalCount = finalItems.length;
  const checkedCount = Object.keys(checkedItems).filter(k => checkedItems[k]).length;
  const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

  const criticalItems = finalItems.filter(i => i.critical);
  const criticalUnchecked = criticalItems.some(i => !checkedItems[i.id]);
  const isReady = !criticalUnchecked && checkedCount > 0;

  const toggleItem = (id) => setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));

  const handleFinish = () => {
    if (!isReady) return;
    setIsClosing(true);
    setTimeout(() => onFinish(), 800);
  };

  const handleAddFriend = (friendId) => {
    if (scenario.collaborators?.includes(friendId)) return;
    updateScenario({ ...scenario, collaborators: [...(scenario.collaborators || []), friendId] });
    setShowInviteModal(false);
  };

  const handleAssignItem = (userId) => {
    if (!assigningItem) return;
    const newItems = scenario.items.map(item => item.id === assigningItem.id ? { ...item, assignedTo: userId } : item);
    updateScenario({ ...scenario, items: newItems });
    setAssigningItem(null);
  };

  const Icon = IconMap[scenario.icon] || Briefcase;
  const cardTheme = scenario.theme || { bg: theme.primary, text: 'text-white' };

  return (
    <div className={`min-h-screen ${theme.bg} flex flex-col relative transition-opacity duration-500 ${isClosing ? 'opacity-0' : 'opacity-100'}`}>
      <div className={`sticky top-0 z-20 ${theme.bg}/90 backdrop-blur-md px-4 h-16 flex items-center justify-between border-b border-[#F0F0F0]`}>
        <button onClick={onBack} className={`w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm ${theme.textMain}`}><ChevronLeft size={24} /></button>
        <div className="flex flex-col items-center">
          <span className={`font-bold ${theme.textMain}`}>{scenario.name}</span>
          {(scenario.collaborators?.length > 0) && <span className={`text-[10px] ${theme.primaryText} bg-[#FAE8E0] px-2 py-0.5 rounded-full flex items-center mt-0.5`}><Users size={10} className="mr-1"/> Collab Mode</span>}
        </div>
        <button onClick={() => setShowInviteModal(true)} className="relative w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm">
          {scenario.collaborators?.length > 0 ? (
            <div className="flex -space-x-2"><img src={CURRENT_USER.avatar} alt="me" className="w-8 h-8 rounded-full border-2 border-white" /><div className={`w-8 h-8 rounded-full border-2 border-white ${theme.accentBlue} flex items-center justify-center text-xs font-bold`}>+{scenario.collaborators.length}</div></div>
          ) : <Share2 size={20} className="text-[#9A9A9A]" />}
        </button>
      </div>

      <div className="pt-8 pb-10 px-6 flex flex-col items-center justify-center overflow-hidden relative">
         <div className="relative w-32 h-32 mb-6">
             <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="58" stroke="#EAEAEA" strokeWidth="8" fill="none" strokeLinecap="round" />
                <circle cx="64" cy="64" r="58" className={`stroke-current ${theme.primaryText.replace('text-', '')}`} strokeWidth="8" fill="none" strokeDasharray="364" strokeDashoffset={364 - (364 * progress) / 100} style={{ transition: 'stroke-dashoffset 1s ease-out' }} strokeLinecap="round"/>
             </svg>
             <div className={`absolute inset-0 m-2 rounded-full ${theme.cardBg} shadow-inner flex items-center justify-center`}><div className={`p-4 rounded-2xl ${cardTheme.bg} ${cardTheme.text} bg-opacity-30`}><Icon size={40} strokeWidth={1.5} /></div></div>
         </div>
         <p className={`text-[#9A9A9A] font-medium text-sm bg-white px-4 py-1 rounded-full shadow-sm`}>Packed {checkedCount} / {totalCount}</p>
      </div>

      <div className="flex-1 px-4 py-2 space-y-6 pb-36">
        {criticalItems.length > 0 && (
          <div className="space-y-3">
             <h3 className={`text-xs font-bold ${theme.danger} bg-opacity-0 uppercase tracking-wider flex items-center ml-2`}><AlertCircle size={14} className="mr-1" /> Critical Items</h3>
             <div className="bg-white rounded-3xl overflow-hidden shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
                {criticalItems.map(item => <CheckItem key={item.id} item={item} checked={!!checkedItems[item.id]} onToggle={() => toggleItem(item.id)} type="critical" friends={friends} collaborators={scenario.collaborators} onAssignClick={() => setAssigningItem(item)} theme={theme}/>)}
             </div>
          </div>
        )}
        <div className="space-y-3">
           <h3 className={`text-xs font-bold text-[#A0A0A0] uppercase tracking-wider ml-2`}>Normal Items</h3>
           <div className="bg-white rounded-3xl overflow-hidden shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
              {finalItems.filter(i => !i.critical).map(item => <CheckItem key={item.id} item={item} checked={!!checkedItems[item.id]} onToggle={() => toggleItem(item.id)} type="normal" friends={friends} collaborators={scenario.collaborators} onAssignClick={() => setAssigningItem(item)} theme={theme}/>)}
           </div>
        </div>
      </div>

      <div className={`fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[${theme.bg.replace('bg-[','').replace(']','')}] via-[${theme.bg.replace('bg-[','').replace(']','')}] to-transparent z-10 max-w-md mx-auto`}>
         <button onClick={handleFinish} disabled={!isReady} className={`w-full h-16 rounded-[24px] font-bold text-lg shadow-xl flex items-center justify-center space-x-2 transition-all duration-500 transform active:scale-95 ${isReady ? `${theme.primary} text-white shadow-[#E6B89C]/40 translate-y-0` : 'bg-[#EAEAEA] text-[#C0C0C0] cursor-not-allowed shadow-none translate-y-0'}`}>
           <span>{isReady ? "All packed, let's go!" : 'Still missing items'}</span>
           {isReady && <Smile size={24} />}
         </button>
      </div>

      {showInviteModal && (
        <div className={`absolute inset-0 z-50 ${theme.textMain}/20 backdrop-blur-sm flex items-center justify-center p-6`}>
          <div className="bg-white w-full rounded-3xl p-6 animate-fade-in shadow-2xl">
            <h3 className={`text-xl font-bold ${theme.textMain} mb-2`}>Invite Friends</h3>
            <p className={`text-sm ${theme.textSub} mb-6`}>Pack together, travel happier.</p>
            <div className="space-y-3">
              {friends.map(friend => {
                const isAdded = scenario.collaborators?.includes(friend.id);
                return (
                  <div key={friend.id} className="flex items-center justify-between p-3 bg-[#FAFAFA] rounded-2xl">
                    <div className="flex items-center space-x-3"><img src={friend.avatar} alt="friend" className="w-10 h-10 rounded-full bg-white shadow-sm" /><span className={`font-bold ${theme.textMain}`}>{friend.name}</span></div>
                    <button onClick={() => handleAddFriend(friend.id)} disabled={isAdded} className={`px-4 py-2 rounded-xl font-bold text-xs ${isAdded ? 'text-[#C0C0C0]' : `${theme.accentGreen} text-[#7A9E83]`}`}>{isAdded ? 'Invited' : 'Invite'}</button>
                  </div>
                )
              })}
            </div>
            <button onClick={() => setShowInviteModal(false)} className="w-full mt-6 py-3 text-[#9A9A9A] font-bold bg-[#F5F5F5] rounded-xl">Close</button>
          </div>
        </div>
      )}

      {assigningItem && (
        <div className={`absolute inset-0 z-50 ${theme.textMain}/20 backdrop-blur-sm flex items-end justify-center`}>
           <div className="bg-white w-full rounded-t-[32px] p-8 animate-float-up shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                 <div><h3 className={`text-lg font-bold ${theme.textMain}`}>Who is packing this?</h3><p className={`text-sm ${theme.textSub} mt-1`}>{assigningItem.text}</p></div>
                 <button onClick={() => setAssigningItem(null)} className="p-2 bg-[#F5F5F5] rounded-full text-[#9A9A9A]"><X size={20}/></button>
              </div>
              <div className="grid grid-cols-4 gap-4 mb-4">
                 <AssigneeBtn user={CURRENT_USER} active={assigningItem.assignedTo === 'me'} onClick={() => handleAssignItem('me')} theme={theme} />
                 {scenario.collaborators?.map(fid => <AssigneeBtn key={fid} user={friends.find(f => f.id === fid)} active={assigningItem.assignedTo === fid} onClick={() => handleAssignItem(fid)} theme={theme} />)}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ChecklistDetail;