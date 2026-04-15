import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  Plus,
  Check,
  ChevronRight,
  Trash2,
  Briefcase,
  Sparkles,
  History,
  LayoutGrid,
  Users,
} from 'lucide-react';
import { IconMap } from '../constants/data';
import { api } from '../api';

function scenarioStats(scenario) {
  const items = scenario.items || [];
  const critical = items.filter((i) => i.critical).length;
  return { total: items.length, critical };
}

const LibraryItem = ({
  scenario,
  onSelect,
  onDelete,
  isCustom,
  theme,
  selectionMode = false,
  isSelected = false,
  onToggleSelect,
}) => {
  const Icon = IconMap[scenario.icon] || Briefcase;
  const cardTheme = scenario.theme || { bg: 'bg-[#F5F5F5]', text: 'text-[#9A9A9A]' };
  const { total, critical } = scenarioStats(scenario);
  const border = theme.isDark ? 'border-slate-700/70 hover:border-slate-600' : 'border-transparent hover:border-[#F0F0F0]';
  const showDelete = isCustom && scenario.access !== 'shared';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => {
        if (selectionMode && showDelete) {
          onToggleSelect?.(scenario.id);
          return;
        }
        onSelect(scenario.id, scenario.owner_user_id ?? null);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (selectionMode && showDelete) {
            onToggleSelect?.(scenario.id);
            return;
          }
          onSelect(scenario.id, scenario.owner_user_id ?? null);
        }
      }}
      className={`flex items-center p-4 ${theme.cardBg} rounded-2xl border ${border} shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer group`}
    >
      {selectionMode && showDelete ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect?.(scenario.id);
          }}
          className={`w-6 h-6 mr-2 rounded-md border flex items-center justify-center ${
            isSelected
              ? `${theme.primary} border-transparent text-white`
              : theme.isDark
                ? 'border-slate-500 text-transparent'
                : 'border-slate-300 text-transparent'
          }`}
        >
          <Check size={14} />
        </button>
      ) : null}
      <div className={`p-3 rounded-xl shrink-0 ${cardTheme.bg} ${cardTheme.text} mr-3`}>
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        {scenario.access === 'shared' || scenario.access === 'shared_edit' ? (
          <div className="flex items-center gap-1.5 mb-0.5">
            {scenario.owner_avatar ? (
              <img src={scenario.owner_avatar} alt="" className="w-4 h-4 rounded-full bg-white object-cover" />
            ) : null}
            <p className="text-[10px] font-bold text-sky-600 uppercase tracking-wide">
              Shared · @{scenario.owner_username}
            </p>
          </div>
        ) : null}
        <h4 className={`font-bold ${theme.textMain} truncate`}>{scenario.name}</h4>
        <p className={`text-xs ${theme.textSub} mt-0.5`}>
          {total} items
          {critical > 0 ? ` · ${critical} critical` : ''}
        </p>
      </div>
      {showDelete && !selectionMode ? (
        <button
          type="button"
          aria-label="Delete trip"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(scenario.id);
          }}
          className="btn-ghost-soft w-9 h-9 shrink-0 flex items-center justify-center text-[#D9D9D9] hover:text-[#D98282] rounded-full"
        >
          <Trash2 size={16} />
        </button>
      ) : (
        <div className="w-9 h-9 shrink-0 flex items-center justify-center text-[#E0E0E0] group-hover:opacity-60 transition-opacity">
          <ChevronRight size={20} />
        </div>
      )}
    </div>
  );
};

const Segment = ({ active, onSelect, theme, items }) => (
  <div
    className={`p-1 rounded-2xl flex gap-0.5 ${
      theme.isDark ? 'bg-slate-800/80' : 'bg-[#EAEAEA]/50'
    }`}
  >
    {items.map(({ id, label, Icon }) => (
      <button
        key={id}
        type="button"
        onClick={() => onSelect(id)}
        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-1 rounded-xl text-[11px] sm:text-xs font-bold transition-all ${
          active === id
            ? `${theme.cardBg} shadow-sm ${theme.textMain}`
            : `${theme.textSub} hover:opacity-90`
        }`}
      >
        <Icon size={14} className="opacity-80 shrink-0" />
        <span className="truncate">{label}</span>
      </button>
    ))}
  </div>
);

const MyProfileAndLibrary = ({
  scenarios,
  friends,
  history,
  onSelect,
  onDelete,
  onDeleteMany,
  onCreateClick,
  onDeleteFriend,
  onRefresh,
  onDeleteHistoryRecord,
  onClearHistory,
  onReuseHistoryTrip,
  initialSegment,
  theme,
}) => {
  const [activeSegment, setActiveSegment] = useState('scenarios');
  const [deleteId, setDeleteId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [reqUsername, setReqUsername] = useState('');
  const [reqBusy, setReqBusy] = useState(false);
  const [reqMsg, setReqMsg] = useState('');
  const [reqLookup, setReqLookup] = useState(null);
  const [reqLookupBusy, setReqLookupBusy] = useState(false);
  const [reverseIncomingId, setReverseIncomingId] = useState(null);
  const [historyBusy, setHistoryBusy] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedTripIds, setSelectedTripIds] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [confirmBusy, setConfirmBusy] = useState(false);

  useEffect(() => {
    if (activeSegment !== 'friends') return undefined;
    let cancelled = false;
    (async () => {
      try {
        const [inc, out] = await Promise.all([
          api.listFriendRequests('incoming'),
          api.listFriendRequests('outgoing'),
        ]);
        if (!cancelled) {
          setIncoming(Array.isArray(inc) ? inc : []);
          setOutgoing(Array.isArray(out) ? out : []);
        }
      } catch {
        if (!cancelled) {
          setIncoming([]);
          setOutgoing([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeSegment]);

  useEffect(() => {
    if (!initialSegment) return;
    setActiveSegment(initialSegment);
  }, [initialSegment]);

  useEffect(() => {
    if (activeSegment !== 'friends') {
      setReqLookup(null);
      setReverseIncomingId(null);
      return undefined;
    }
    const u = reqUsername.trim().toLowerCase();
    if (u.length < 3) {
      setReqLookup(null);
      return undefined;
    }
    const t = setTimeout(() => {
      void (async () => {
        setReqLookupBusy(true);
        try {
          const res = await api.lookupUser(u);
          if (res?.found && res.user) setReqLookup({ ok: true, user: res.user });
          else if (res && res.found === false && !res.error) setReqLookup({ ok: false });
          else setReqLookup(null);
        } catch {
          setReqLookup(null);
        } finally {
          setReqLookupBusy(false);
        }
      })();
    }, 400);
    return () => clearTimeout(t);
  }, [reqUsername, activeSegment]);

  const reloadFriendRequests = useCallback(async () => {
    try {
      const [inc, out] = await Promise.all([
        api.listFriendRequests('incoming'),
        api.listFriendRequests('outgoing'),
      ]);
      setIncoming(Array.isArray(inc) ? inc : []);
      setOutgoing(Array.isArray(out) ? out : []);
    } catch {
      /* ignore */
    }
  }, []);

  const customScenarios = useMemo(
    () => scenarios.filter((s) => s.type === 'custom' && !s.archived),
    [scenarios],
  );
  const deletableCustomScenarios = useMemo(
    () => customScenarios.filter((s) => s.access !== 'shared'),
    [customScenarios],
  );
  const historyNameCount = useMemo(() => {
    const map = new Map();
    (history || []).forEach((h) => {
      const key = String(h?.name || '').trim().toLowerCase();
      if (!key) return;
      map.set(key, (map.get(key) || 0) + 1);
    });
    return map;
  }, [history]);
  const frequentScenarios = useMemo(() => {
    return (scenarios || [])
      .filter((s) => s.access !== 'shared' && !s.archived)
      .map((s) => {
        const key = String(s?.name || '').trim().toLowerCase();
        const doneCount = historyNameCount.get(key) || 0;
        // Prioritize repeatedly completed trips, then archived ones.
        const score = doneCount * 100 + (s.archived ? 1 : 0);
        return { scenario: s, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.scenario)
      .slice(0, 6);
  }, [historyNameCount, scenarios]);

  const segmentItems = useMemo(
    () => [
      { id: 'scenarios', label: 'Trips', Icon: LayoutGrid },
      { id: 'history', label: 'History', Icon: History },
      { id: 'friends', label: 'Friends', Icon: Users },
    ],
    [],
  );

  const confirmDelete = async () => {
    if (!deleteId) return;
    setBusy(true);
    setDeleteError('');
    try {
      await onDeleteFriend(deleteId);
      setDeleteId(null);
    } catch (e) {
      setDeleteError(e?.message || 'Could not delete.');
    } finally {
      setBusy(false);
    }
  };

  const panelClass = theme.isDark ? 'border-slate-700/60 bg-slate-900/40' : 'border-[#F2F2F2] bg-[#FDFDFD]';

  const toggleTripSelected = useCallback((id) => {
    setSelectedTripIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const runConfirmAction = useCallback(async () => {
    if (!confirmDialog) return;
    setConfirmBusy(true);
    try {
      if (confirmDialog.type === 'deleteTrip') {
        await onDelete?.(confirmDialog.tripId);
      } else if (confirmDialog.type === 'deleteSelectedTrips') {
        await onDeleteMany?.(confirmDialog.tripIds || []);
        setSelectedTripIds([]);
        setSelectMode(false);
      } else if (confirmDialog.type === 'clearHistory') {
        setHistoryBusy(true);
        try {
          await onClearHistory?.();
        } finally {
          setHistoryBusy(false);
        }
      }
      setConfirmDialog(null);
    } catch {
      /* keep existing cards/list */
    } finally {
      setConfirmBusy(false);
    }
  }, [confirmDialog, onDelete, onDeleteMany, onClearHistory]);

  return (
    <div className={`flex flex-col h-full ${theme.bg}`}>
      <div className={`pt-10 pb-4 px-6 ${theme.bg} sticky top-0 z-10 ${theme.isDark ? 'border-b border-slate-800/50' : ''}`}>
        <div className="flex items-end justify-between gap-3 mb-5">
          <div>
            <p className={`text-xs font-semibold uppercase tracking-widest ${theme.textSub} mb-1`}>Library</p>
            <h1 className={`text-2xl font-bold ${theme.textMain}`}>Me</h1>
          </div>
        </div>
        <Segment active={activeSegment} onSelect={setActiveSegment} theme={theme} items={segmentItems} />
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-28 pt-3">
        {activeSegment === 'scenarios' ? (
          <div className="space-y-8 animate-fade-in">
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className={`text-xs font-bold ${theme.textSub} uppercase tracking-wider`}>Your trips</h3>
                <div className="flex items-center gap-2">
                  {deletableCustomScenarios.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (selectMode) {
                          setSelectMode(false);
                          setSelectedTripIds([]);
                        } else {
                          setSelectMode(true);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                        selectMode
                          ? theme.isDark
                            ? 'bg-slate-700 text-slate-100'
                            : 'bg-slate-200 text-slate-700'
                          : theme.isDark
                            ? 'bg-slate-800 text-slate-200'
                            : 'bg-[#EFEFEF] text-[#666]'
                      }`}
                    >
                      {selectMode ? 'Cancel' : 'Select'}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={onCreateClick}
                    className={`btn-secondary-soft ${theme.primaryLight} ${theme.primaryText} px-3 py-1.5 rounded-lg text-xs font-bold`}
                  >
                    + New trip
                  </button>
                </div>
              </div>
              {selectMode ? (
                <div
                  className={`mb-2.5 p-2.5 rounded-xl border flex items-center justify-between ${
                    theme.isDark ? 'border-slate-700 bg-slate-900/50' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <p className={`text-xs font-medium ${theme.textSub}`}>
                    Selected {selectedTripIds.length} / {deletableCustomScenarios.length}
                  </p>
                  <button
                    type="button"
                    disabled={selectedTripIds.length === 0}
                    onClick={() => {
                      if (selectedTripIds.length === 0) return;
                      setConfirmDialog({
                        type: 'deleteSelectedTrips',
                        title: 'Delete selected trips?',
                        message: `Delete ${selectedTripIds.length} selected trips? This action cannot be undone.`,
                        confirmLabel: 'Delete',
                        tripIds: selectedTripIds,
                      });
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                      selectedTripIds.length === 0
                        ? 'bg-slate-200 text-slate-400'
                        : 'btn-danger-soft'
                    }`}
                  >
                    Delete selected
                  </button>
                </div>
              ) : null}
              {customScenarios.length > 0 ? (
                <div className="space-y-2.5">
                  {customScenarios.map((s) => (
                    <LibraryItem
                      key={s.access === 'shared' ? `sh-${s.owner_user_id}-${s.id}` : s.id}
                      scenario={s}
                      onSelect={onSelect}
                      onDelete={(scenarioId) => {
                        setConfirmDialog({
                          type: 'deleteTrip',
                          title: 'Delete this trip?',
                          message: 'This action cannot be undone.',
                          confirmLabel: 'Delete',
                          tripId: scenarioId,
                        });
                      }}
                      isCustom
                      theme={theme}
                      selectionMode={selectMode}
                      isSelected={selectedTripIds.includes(s.id)}
                      onToggleSelect={toggleTripSelected}
                    />
                  ))}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onCreateClick}
                  className={`w-full border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
                    theme.isDark ? 'border-slate-600 hover:border-slate-500' : 'border-[#EAEAEA] hover:border-[#D8D8D8]'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
                      theme.isDark ? 'bg-slate-800' : 'bg-[#F5F5F5]'
                    }`}
                  >
                    <Plus size={20} className={theme.textSub} />
                  </div>
                  <p className={`text-sm font-semibold ${theme.textMain}`}>Create a custom trip</p>
                  <p className={`text-xs ${theme.textSub} mt-1`}>Build your own packing list from scratch.</p>
                </button>
              )}
            </div>
            <div>
              <h3 className={`text-xs font-bold ${theme.textSub} uppercase tracking-wider mb-3`}>Frequently used</h3>
              {frequentScenarios.length > 0 ? (
                <div className="space-y-2.5">
                  {frequentScenarios.map((s) => (
                    <LibraryItem
                      key={s.access === 'shared' ? `sh-${s.owner_user_id}-${s.id}` : s.id}
                      scenario={s}
                      onSelect={onSelect}
                      theme={theme}
                    />
                  ))}
                </div>
              ) : (
                <div className={`text-center py-8 px-4 rounded-2xl ${theme.cardBg} border ${panelClass}`}>
                  <p className={`text-sm font-medium ${theme.textMain}`}>No frequent trips yet</p>
                  <p className={`text-xs ${theme.textSub} mt-1`}>
                    Finish packing a few trips and your frequently used scenarios will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : activeSegment === 'history' ? (
          <div className="space-y-3 animate-fade-in">
            {(history || []).length > 0 ? (
              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={historyBusy}
                  onClick={() => {
                    setConfirmDialog({
                      type: 'clearHistory',
                      title: 'Clear all history?',
                      message: 'Delete all packing history on this account? This action cannot be undone.',
                      confirmLabel: 'Clear all',
                    });
                  }}
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-xl ${
                    theme.isDark ? 'bg-rose-950/50 text-rose-200' : 'bg-[#FADCDC] text-[#B85C5C]'
                  } disabled:opacity-50`}
                >
                  Clear all
                </button>
              </div>
            ) : null}
            {(history || []).length === 0 ? (
              <div className={`text-center py-14 px-4 rounded-2xl ${theme.cardBg} border ${panelClass}`}>
                <History className={`mx-auto mb-3 ${theme.textSub}`} size={32} />
                <p className={`text-sm font-medium ${theme.textMain}`}>No history yet</p>
                <p className={`text-xs ${theme.textSub} mt-1`}>Finish packing a list to see it here.</p>
              </div>
            ) : (
              (history || []).map((record) => (
                <div
                  key={record.id}
                  className={`flex items-center justify-between gap-2 p-4 ${theme.cardBg} rounded-2xl border ${
                    theme.isDark ? 'border-slate-700/60' : 'border-[#F0F0F0]'
                  } shadow-sm`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div
                      className={`w-10 h-10 shrink-0 ${theme.success} rounded-full flex items-center justify-center`}
                    >
                      <Check size={18} className="text-white" />
                    </div>
                    <div className="min-w-0">
                      <h4 className={`font-bold ${theme.textMain} truncate`}>{record.name}</h4>
                      <p className={`text-xs ${theme.textSub}`}>{record.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                        theme.isDark ? 'bg-slate-800 text-slate-400' : 'bg-[#F5F5F5] text-[#9A9A9A]'
                      }`}
                    >
                      Done
                    </span>
                    {record.scenario_id ? (
                      <button
                        type="button"
                        disabled={historyBusy}
                        onClick={() => {
                          void (async () => {
                            setHistoryBusy(true);
                            try {
                              await onReuseHistoryTrip?.(record.scenario_id);
                            } finally {
                              setHistoryBusy(false);
                            }
                          })();
                        }}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${
                          theme.isDark ? 'bg-sky-900/40 text-sky-200' : 'bg-sky-100 text-sky-700'
                        } disabled:opacity-50`}
                      >
                        Reuse
                      </button>
                    ) : null}
                    <button
                      type="button"
                      aria-label="Delete history entry"
                      disabled={historyBusy}
                      onClick={() => {
                        void (async () => {
                          setHistoryBusy(true);
                          try {
                            await onDeleteHistoryRecord?.(record.id);
                          } finally {
                            setHistoryBusy(false);
                          }
                        })();
                      }}
                      className={`btn-ghost-soft w-9 h-9 rounded-xl flex items-center justify-center ${
                        theme.isDark ? 'hover:bg-red-950/40 text-red-300' : 'hover:bg-[#FADCDC] text-[#D98282]'
                      } disabled:opacity-50`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-5 animate-fade-in">
            <div
              className={`p-4 rounded-2xl border ${theme.isDark ? 'border-sky-900/40 bg-sky-950/20' : 'border-sky-100 bg-sky-50/80'} shadow-sm`}
            >
              <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 ${theme.textSub}`}>
                Real friends (Checkmate accounts)
              </h3>
              <p className={`text-xs ${theme.textSub} mb-3`}>
                Enter their login username (same as on sign-in). They must accept before you can share packing lists.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={reqUsername}
                  onChange={(e) => {
                    setReqUsername(e.target.value.toLowerCase());
                    setReverseIncomingId(null);
                  }}
                  placeholder="username"
                  className={`flex-1 min-w-0 px-3 py-2 rounded-xl border text-sm outline-none ${
                    theme.isDark ? 'bg-slate-900 border-slate-600 text-slate-100' : 'border-gray-200 bg-white'
                  }`}
                />
                <button
                  type="button"
                  disabled={reqBusy}
                  onClick={() => {
                    void (async () => {
                      const u = reqUsername.trim().toLowerCase();
                      if (!u) {
                        setReqMsg('Enter a username.');
                        return;
                      }
                      setReqBusy(true);
                      setReqMsg('');
                      setReverseIncomingId(null);
                      try {
                        await api.createFriendRequest({ username: u });
                        setReqUsername('');
                        setReqMsg('Request sent.');
                        await onRefresh?.();
                        await reloadFriendRequests();
                      } catch (err) {
                        const incomingId = err?.body?.incoming_request_id;
                        if (err?.status === 409 && incomingId) {
                          setReverseIncomingId(incomingId);
                          setReqMsg('They already sent you a request — accept below.');
                        } else {
                          setReqMsg(err?.message || 'Failed.');
                        }
                      } finally {
                        setReqBusy(false);
                      }
                    })();
                  }}
                  className={`btn-primary-soft shrink-0 px-4 py-2 rounded-xl text-xs font-bold text-white ${theme.primary} disabled:opacity-50`}
                >
                  Send
                </button>
              </div>
              {reqLookupBusy ? (
                <p className={`text-[11px] mt-2 ${theme.textSub}`}>Looking up…</p>
              ) : null}
              {!reqLookupBusy && reqLookup?.ok && reqLookup.user ? (
                <div
                  className={`mt-2 flex items-center gap-2 p-2 rounded-xl ${
                    theme.isDark ? 'bg-slate-800/80' : 'bg-white border border-gray-100'
                  }`}
                >
                  <img src={reqLookup.user.avatar} alt="" className="w-8 h-8 rounded-full bg-white" />
                  <span className={`text-xs font-bold ${theme.textMain}`}>@{reqLookup.user.username}</span>
                </div>
              ) : null}
              {!reqLookupBusy && reqLookup && reqLookup.ok === false ? (
                <p className="text-[11px] mt-2 text-amber-700 dark:text-amber-300">No user with that username.</p>
              ) : null}
              {reverseIncomingId ? (
                <div className="mt-3 flex items-center justify-between gap-2">
                  <p className={`text-[11px] font-medium ${theme.textMain}`}>Accept their pending request?</p>
                  <button
                    type="button"
                    className={`btn-primary-soft px-3 py-1.5 rounded-lg text-xs font-bold text-white ${theme.primary}`}
                    onClick={() => {
                      void (async () => {
                        try {
                          await api.acceptFriendRequest(reverseIncomingId);
                          setReverseIncomingId(null);
                          setReqMsg('You are now friends.');
                          setReqUsername('');
                          await onRefresh?.();
                          await reloadFriendRequests();
                        } catch {
                          /* */
                        }
                      })();
                    }}
                  >
                    Accept
                  </button>
                </div>
              ) : null}
              {reqMsg ? <p className="text-[11px] mt-2 font-medium text-sky-800/90">{reqMsg}</p> : null}
            </div>

            {incoming.length > 0 ? (
              <div>
                <h3 className={`text-xs font-bold ${theme.textSub} uppercase tracking-wider mb-2`}>
                  Incoming requests
                </h3>
                <ul className="space-y-2">
                  {incoming.map((r) => (
                    <li
                      key={r.id}
                      className={`flex items-center justify-between gap-2 p-3 rounded-2xl ${theme.cardBg} border ${
                        theme.isDark ? 'border-slate-700/60' : 'border-[#F0F0F0]'
                      }`}
                    >
                      <span className={`text-sm font-bold ${theme.textMain} truncate`}>@{r.from_username}</span>
                      <div className="flex gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            void (async () => {
                              try {
                                await api.declineFriendRequest(r.id);
                                await reloadFriendRequests();
                                await onRefresh?.();
                              } catch {
                                /* */
                              }
                            })();
                          }}
                          className={`btn-secondary-soft px-3 py-1.5 rounded-lg text-xs font-bold ${
                            theme.isDark ? 'bg-slate-800 text-slate-300' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          Decline
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            void (async () => {
                              try {
                                await api.acceptFriendRequest(r.id);
                                await reloadFriendRequests();
                                await onRefresh?.();
                              } catch {
                                /* */
                              }
                            })();
                          }}
                          className={`btn-primary-soft px-3 py-1.5 rounded-lg text-xs font-bold text-white ${theme.primary}`}
                        >
                          Accept
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {outgoing.length > 0 ? (
              <div>
                <h3 className={`text-xs font-bold ${theme.textSub} uppercase tracking-wider mb-2`}>Waiting on</h3>
                <ul className="flex flex-wrap gap-2">
                  {outgoing.map((r) => (
                    <li
                      key={r.id}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                        theme.isDark ? 'bg-slate-800 text-slate-300' : 'bg-[#F0F0F0] text-[#666]'
                      }`}
                    >
                      @{r.to_username}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div>
              <h3 className={`text-xs font-bold ${theme.textSub} uppercase tracking-wider mb-3`}>
                Friends ({friends.length})
              </h3>
              {friends.length === 0 ? (
                <div className={`text-center py-12 px-4 rounded-2xl ${theme.cardBg} border ${panelClass}`}>
                  <Users className={`mx-auto mb-3 ${theme.textSub}`} size={32} />
                  <p className={`text-sm font-medium ${theme.textMain}`}>No friends yet</p>
                  <p className={`text-xs ${theme.textSub} mt-1`}>
                    Send a request with their Checkmate username above. After they accept, they will appear here.
                  </p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {friends.map((friend) => (
                    <li
                      key={friend.id}
                      className={`flex items-center gap-3 p-3.5 ${theme.cardBg} rounded-2xl border ${
                        theme.isDark ? 'border-slate-700/60' : 'border-[#F9F9F9]'
                      } shadow-sm`}
                    >
                      <img
                        src={friend.avatar}
                        alt=""
                        className="w-12 h-12 rounded-full bg-black/5 border-2 border-white/80 shadow-sm shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`font-bold text-sm ${theme.textMain} truncate`}>{friend.name}</p>
                        <p className={`text-[10px] ${theme.textSub} truncate`}>
                          @{friend.username || friend.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span
                          className={`text-[10px] font-bold px-2 py-1 rounded-lg ${theme.primaryLight} ${theme.primaryText}`}
                        >
                          Live
                        </span>
                        <button
                          type="button"
                          aria-label="Remove friend"
                          onClick={() => {
                            setDeleteError('');
                            setDeleteId(friend.id);
                          }}
                          className={`btn-ghost-soft w-9 h-9 rounded-xl flex items-center justify-center ${
                            theme.isDark ? 'hover:bg-red-950/40 text-red-300' : 'hover:bg-[#FADCDC] text-[#D98282]'
                          }`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>

      {deleteId ? (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
          <div
            className={`${theme.cardBg} w-full max-w-sm rounded-3xl p-6 shadow-2xl border ${
              theme.isDark ? 'border-slate-600' : 'border-gray-100'
            }`}
          >
            <h3 className={`text-lg font-bold ${theme.textMain} mb-2`}>Remove friend?</h3>
            <p className={`text-sm ${theme.textSub} mb-6`}>
              They will be removed from shared lists and any items assigned to them will go back to you.
            </p>
            {deleteError ? <p className="text-xs text-red-500 mb-4">{deleteError}</p> : null}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setDeleteId(null);
                  setDeleteError('');
                }}
                className={`btn-secondary-soft flex-1 py-3 rounded-xl font-bold text-sm ${
                  theme.isDark ? 'bg-slate-800 text-slate-200' : 'bg-gray-100 text-gray-600'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void confirmDelete()}
                className="btn-danger-soft flex-1 py-3 rounded-xl font-bold text-sm disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {confirmDialog ? (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
          <div
            className={`${theme.cardBg} w-full max-w-sm rounded-3xl p-6 shadow-2xl border ${
              theme.isDark ? 'border-slate-600' : 'border-gray-100'
            }`}
          >
            <h3 className={`text-lg font-bold ${theme.textMain} mb-2`}>{confirmDialog.title}</h3>
            <p className={`text-sm ${theme.textSub} mb-6`}>{confirmDialog.message}</p>
            <div className="flex gap-3">
              <button
                type="button"
                disabled={confirmBusy}
                onClick={() => setConfirmDialog(null)}
                className={`btn-secondary-soft flex-1 py-3 rounded-xl font-bold text-sm ${
                  theme.isDark ? 'bg-slate-800 text-slate-200' : 'bg-gray-100 text-gray-600'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={confirmBusy}
                onClick={() => void runConfirmAction()}
                className="btn-danger-soft flex-1 py-3 rounded-xl font-bold text-sm disabled:opacity-50"
              >
                {confirmBusy ? 'Please wait…' : confirmDialog.confirmLabel || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default MyProfileAndLibrary;
