import React, { useEffect, useState } from 'react';
import { Plus, Trash2, AlertCircle, Circle } from 'lucide-react';

const CreateNewTrip = ({ onBack, onSave, theme, initialTrip = null, language = 'en' }) => {
  const [name, setName] = useState('');
  const [tripStartAt, setTripStartAt] = useState('');
  const [tripEndAt, setTripEndAt] = useState('');
  const [items, setItems] = useState([]);
  const [criticalInput, setCriticalInput] = useState('');
  const [optionalInput, setOptionalInput] = useState('');
  const inputLocale = language === 'zh' ? 'zh-CN' : 'en-US';

  useEffect(() => {
    if (!initialTrip) {
      setName('');
      setTripStartAt('');
      setTripEndAt('');
      setItems([]);
      return;
    }
    setName(String(initialTrip.name || '').trim());
    setTripStartAt(initialTrip.trip_start_at ? String(initialTrip.trip_start_at).slice(0, 16) : '');
    setTripEndAt(initialTrip.trip_end_at ? String(initialTrip.trip_end_at).slice(0, 16) : '');
    const seededItems = (Array.isArray(initialTrip.items) ? initialTrip.items : []).map((it, idx) => ({
      id: it?.id || `draft_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 7)}`,
      text: String(it?.text || '').trim(),
      critical: !!it?.critical,
      assignedTo: 'me',
    })).filter((it) => it.text);
    setItems(seededItems);
  }, [initialTrip]);

  const addItem = (text, critical) => {
    const v = String(text || '').trim();
    if (!v) return;
    setItems((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        text: v,
        critical,
        assignedTo: 'me',
      },
    ]);
    if (critical) setCriticalInput('');
    else setOptionalInput('');
  };

  const handleSave = async () => {
    if (!name || items.length === 0) return;
    if (tripStartAt && tripEndAt && new Date(tripEndAt) < new Date(tripStartAt)) {
      window.alert('Trip end time must be after start time.');
      return;
    }
    const payload = {
      id: Date.now().toString(),
      name,
      icon: initialTrip?.icon || 'Backpack',
      theme: initialTrip?.theme || { bg: theme.primaryLight, text: theme.primaryText },
      items,
      trip_start_at: tripStartAt || null,
      trip_end_at: tripEndAt || null,
    };
    await onSave(payload);
  };

  const criticalItems = items.filter((i) => i.critical);
  const optionalItems = items.filter((i) => !i.critical);

  return (
    <div className={`min-h-screen ${theme.bg} flex flex-col`}>
      <div className={`sticky top-0 z-20 ${theme.bg}/90 backdrop-blur-md px-4 h-16 flex items-center justify-between border-b border-[#F0F0F0]`}>
        <button type="button" onClick={onBack} className="text-[#9A9A9A] font-medium">
          Cancel
        </button>
        <span className={`font-bold ${theme.textMain}`}>New Trip</span>
        <button
          type="button"
          onClick={handleSave}
          disabled={!name || items.length === 0}
          className={`font-bold ${!name || items.length === 0 ? 'text-[#D1D1D1]' : theme.primaryText}`}
        >
          Save
        </button>
      </div>
      <div className="p-6 space-y-8 pb-32 overflow-y-auto">
        <div>
          <label className={`block text-xs font-bold ${theme.textSub} mb-3 ml-1`}>Name</label>
          <input
            type="text"
            placeholder="e.g., Beach trip…"
            className={`w-full text-xl py-3 px-4 ${theme.cardBg} rounded-2xl shadow-sm border-2 border-transparent outline-none ${theme.textMain} placeholder-[#D1D1D1]`}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className={`block text-xs font-bold ${theme.textSub} mb-3 ml-1`}>Trip date & time</label>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <p className={`text-[11px] ${theme.textSub} mb-1.5`}>Start</p>
              <input
                type="datetime-local"
                lang={inputLocale}
                className={`w-full py-3 px-4 ${theme.cardBg} rounded-2xl shadow-sm border-2 border-transparent outline-none ${theme.textMain}`}
                value={tripStartAt}
                onChange={(e) => setTripStartAt(e.target.value)}
              />
            </div>
            <div>
              <p className={`text-[11px] ${theme.textSub} mb-1.5`}>End (optional)</p>
              <input
                type="datetime-local"
                lang={inputLocale}
                className={`w-full py-3 px-4 ${theme.cardBg} rounded-2xl shadow-sm border-2 border-transparent outline-none ${theme.textMain}`}
                value={tripEndAt}
                onChange={(e) => setTripEndAt(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div>
          <label className={`block text-xs font-bold ${theme.textSub} mb-3 ml-1`}>Checklist</label>

          <div className={`${theme.cardBg} rounded-2xl p-4 shadow-sm border ${theme.isDark ? 'border-slate-700/60' : 'border-[#F3F3F3]'} space-y-3`}>
            <div className="flex items-center justify-between">
              <p className={`text-sm font-bold ${theme.textMain} flex items-center gap-1.5`}>
                <AlertCircle size={14} className={theme.isDark ? 'text-rose-300' : 'text-[#D98282]'} />
                Must bring
              </p>
              <span className={`text-[11px] ${theme.textSub}`}>{criticalItems.length} items</span>
            </div>
            <div className={`rounded-xl border px-2 py-1.5 flex items-center ${theme.isDark ? 'border-slate-600 bg-slate-900/60' : 'border-[#EAEAEA] bg-white'}`}>
              <input
                type="text"
                placeholder="Add must-bring item…"
                className={`flex-1 bg-transparent px-2 outline-none text-sm ${theme.textMain}`}
                value={criticalInput}
                onChange={(e) => setCriticalInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addItem(criticalInput, true)}
              />
              <button
                type="button"
                onClick={() => addItem(criticalInput, true)}
                disabled={!criticalInput.trim()}
                className={`p-2 rounded-lg ${criticalInput.trim() ? `${theme.primary} text-white` : 'bg-[#F5F5F5] text-[#D1D1D1]'}`}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className={`${theme.cardBg} rounded-2xl p-4 shadow-sm border ${theme.isDark ? 'border-slate-700/60' : 'border-[#F3F3F3]'} space-y-3 mt-4`}>
            <div className="flex items-center justify-between">
              <p className={`text-sm font-bold ${theme.textMain} flex items-center gap-1.5`}>
                <Circle size={13} className={theme.isDark ? 'text-slate-300' : 'text-[#9A9A9A]'} />
                Optional
              </p>
              <span className={`text-[11px] ${theme.textSub}`}>{optionalItems.length} items</span>
            </div>
            <div className={`rounded-xl border px-2 py-1.5 flex items-center ${theme.isDark ? 'border-slate-600 bg-slate-900/60' : 'border-[#EAEAEA] bg-white'}`}>
              <input
                type="text"
                placeholder="Add optional item…"
                className={`flex-1 bg-transparent px-2 outline-none text-sm ${theme.textMain}`}
                value={optionalInput}
                onChange={(e) => setOptionalInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addItem(optionalInput, false)}
              />
              <button
                type="button"
                onClick={() => addItem(optionalInput, false)}
                disabled={!optionalInput.trim()}
                className={`p-2 rounded-lg ${optionalInput.trim() ? `${theme.primary} text-white` : 'bg-[#F5F5F5] text-[#D1D1D1]'}`}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="space-y-2.5 mt-4">
            {items.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-2 justify-between ${theme.cardBg} p-3 rounded-2xl border ${theme.isDark ? 'border-slate-700/60' : 'border-[#F4F4F4]'} shadow-sm`}
              >
                <div className="min-w-0">
                  <p className={`${theme.textMain} text-sm font-semibold truncate`}>{item.text}</p>
                  <p className={`text-[11px] ${item.critical ? (theme.isDark ? 'text-rose-300' : 'text-[#D98282]') : theme.textSub}`}>
                    {item.critical ? 'Must bring' : 'Optional'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setItems(items.filter((i) => i.id !== item.id))}
                  className="text-[#D1D1D1] hover:text-[#D98282] p-1"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateNewTrip;
