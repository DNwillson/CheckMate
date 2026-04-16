import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  ChevronLeft,
  Users,
  Share2,
  Link2,
  AlertCircle,
  Smile,
  X,
  Check,
  Briefcase,
  UserCircle2,
  UserMinus,
} from 'lucide-react';
import { CURRENT_USER, IconMap } from '../constants/data';
import { api } from '../api';

const AssigneeBtn = ({ user, active, onClick, theme }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex flex-col items-center space-y-2 group min-w-0"
  >
    <div
      className={`w-14 h-14 rounded-full p-1 transition-all shrink-0 ${active ? theme.primary : 'bg-transparent'}`}
    >
      <img src={user?.avatar} alt="" className="w-full h-full rounded-full bg-white object-cover" />
    </div>
    <span className={`text-xs font-bold truncate max-w-[4.5rem] ${active ? theme.primaryText : theme.textSub}`}>
      {user?.name || '—'}
    </span>
  </button>
);

const CheckItem = ({
  item,
  checked,
  onToggle,
  type,
  collaborators,
  friends,
  onAssignClick,
  theme,
  meUser,
  t,
  canAssign,
  readOnly,
}) => {
  const isCritical = type === 'critical';
  const hasCollaborators = collaborators && collaborators.length > 0;
  let assigneeAvatar = meUser.avatar;
  let assigneeName = meUser.name || t?.('navMe');

  if (item.assignedTo && item.assignedTo !== 'me') {
    const friend = friends?.find((f) => f.id === item.assignedTo);
    if (friend) {
      assigneeAvatar = friend.avatar;
      assigneeName = friend.name;
    }
  }

  const checkColor = isCritical ? 'bg-[#D98282] border-[#D98282]' : `${theme.success} border-[#CCD5AE]`;
  const rowBg = checked
    ? theme.isDark
      ? 'bg-slate-800/40'
      : 'bg-[#FAF9F6]'
    : theme.isDark
      ? 'bg-slate-900/30 hover:bg-slate-800/40'
      : 'bg-white hover:bg-[#FFFCF8]';
  const borderRow = theme.isDark ? 'border-slate-700/50' : 'border-[#F9F9F9]';
  const borderUnchecked = isCritical
    ? theme.isDark
      ? 'border-rose-900/50 bg-rose-950/20'
      : 'border-[#FADCDC] bg-[#FFF5F5]'
    : theme.isDark
      ? 'border-slate-600 bg-slate-900/50'
      : 'border-[#EAEAEA] bg-white';

  return (
    <div
      className={`relative flex items-center gap-3 p-4 border-b last:border-b-0 ${borderRow} ${rowBg} transition-colors duration-200`}
    >
      <button
        type="button"
        disabled={readOnly}
        onClick={() => !readOnly && onToggle()}
        className={`flex flex-1 items-center min-w-0 text-left gap-3 rounded-xl -m-1 p-1 pr-2 transition-transform ${
          readOnly ? 'cursor-default opacity-90' : 'active:scale-[0.99]'
        }`}
      >
        <div
          className={`w-7 h-7 shrink-0 rounded-full border-2 flex items-center justify-center transition-all shadow-sm ${
            checked ? checkColor : borderUnchecked
          }`}
        >
          <Check size={14} className={`text-white transition-transform ${checked ? 'scale-100' : 'scale-0'}`} />
        </div>
        <div className="flex-1 min-w-0 pr-2">
          <span
            className={`font-medium text-[15px] leading-snug block transition-all ${
              checked ? `${theme.textSub} line-through decoration-2` : theme.textMain
            }`}
          >
            {item.text}
          </span>
          <div className="flex items-center mt-1.5 flex-wrap gap-1.5">
            {isCritical && !checked && (
              <span className={`text-[10px] font-bold ${theme.danger} px-2 py-0.5 rounded-md`}>
                {t?.('tripMustBring')}
              </span>
            )}
            {item.assignedTo && hasCollaborators && (
              <span
                className={`text-[10px] font-medium flex items-center px-2 py-0.5 rounded-md ${
                  theme.isDark ? 'bg-slate-800 text-slate-400' : 'bg-[#F5F5F5] text-[#888888]'
                }`}
              >
                {assigneeName}
              </span>
            )}
          </div>
        </div>
      </button>
      {canAssign && !readOnly ? (
        <button
          type="button"
          aria-label={t?.('assignItem')}
          onClick={(e) => {
            e.stopPropagation();
            onAssignClick();
          }}
          className={`shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center transition-all active:scale-95 ${
            theme.isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-[#F7F7F7] hover:bg-[#EFEFEF]'
          }`}
        >
          <img
            src={assigneeAvatar}
            alt=""
            className={`w-9 h-9 rounded-full object-cover border-2 ${
              theme.isDark ? 'border-slate-600' : 'border-white shadow-sm'
            }`}
          />
        </button>
      ) : null}
    </div>
  );
};

const ChecklistDetail = ({
  scenario,
  friends,
  updateScenario,
  isSaving = false,
  saveError = null,
  checkedItems,
  setCheckedItems,
  onBack,
  onFinish,
  weather,
  theme,
  meUser,
  onShareScenario,
  onUnshareScenario,
  t,
}) => {
  const ensureUniqueItemIds = useCallback((items) => {
    const seen = new Set();
    let changed = false;
    const next = (Array.isArray(items) ? items : []).map((it, idx) => {
      const raw = it?.id == null ? '' : String(it.id).trim();
      let id = raw;
      if (!id || seen.has(id)) {
        id = `it_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 8)}`;
        changed = true;
      }
      seen.add(id);
      if (id !== raw) return { ...(it || {}), id };
      return it;
    });
    return { items: next, changed };
  }, []);

  const me = meUser || CURRENT_USER;
  const readOnly = scenario.access === 'shared';
  const isOwner = scenario.access === 'owner';
  const [isClosing, setIsClosing] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [assigningItem, setAssigningItem] = useState(null);
  const [shareUsername, setShareUsername] = useState('');
  const [shareCanEdit, setShareCanEdit] = useState(false);
  const [shareBusy, setShareBusy] = useState(false);
  const [shareError, setShareError] = useState('');
  const [lookupPreview, setLookupPreview] = useState(null);
  const [lookupBusy, setLookupBusy] = useState(false);

  const itemChecksKey = useMemo(
    () =>
      (scenario.items || [])
        .map((i) => `${i.id}:${i.checked ? 1 : 0}`)
        .join('|'),
    [scenario.items],
  );

  useEffect(() => {
    const normalized = ensureUniqueItemIds(scenario.items || []);
    if (normalized.changed) {
      void updateScenario({ ...scenario, items: normalized.items });
    }
  }, [ensureUniqueItemIds, scenario, updateScenario]);

  useEffect(
    () => {
      const next = {};
      (scenario.items || []).forEach((it) => {
        if (it && it.id != null && it.checked) next[it.id] = true;
      });
      setCheckedItems(next);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- itemChecksKey encodes items[].checked
    [scenario.id, itemChecksKey, setCheckedItems],
  );

  useEffect(() => {
    if (!showShareModal) {
      setLookupPreview(null);
      return undefined;
    }
    const u = shareUsername.trim().toLowerCase();
    if (u.length < 3) {
      setLookupPreview(null);
      return undefined;
    }
    const t = setTimeout(() => {
      void (async () => {
        setLookupBusy(true);
        try {
          const res = await api.lookupUser(u);
          if (res?.found && res.user) setLookupPreview({ ok: true, user: res.user });
          else if (res && res.found === false && !res.error) setLookupPreview({ ok: false });
          else setLookupPreview(null);
        } catch {
          setLookupPreview(null);
        } finally {
          setLookupBusy(false);
        }
      })();
    }, 400);
    return () => clearTimeout(t);
  }, [shareUsername, showShareModal]);

  const finalItems = useMemo(() => ensureUniqueItemIds(scenario.items || []).items, [ensureUniqueItemIds, scenario.items]);
  const totalCount = finalItems.length;
  const checkedCount = Object.keys(checkedItems).filter((k) => checkedItems[k]).length;
  const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

  const criticalItems = finalItems.filter((i) => i.critical);
  const criticalUnchecked = criticalItems.some((i) => !checkedItems[i.id]);
  const isReady = !criticalUnchecked && checkedCount > 0;

  const canAssign =
    !readOnly && ((friends?.length || 0) > 0 || (scenario.collaborators?.length || 0) > 0);

  const toggleItem = (id) => {
    if (readOnly) return;
    const nextChecked = !checkedItems[id];
    const newCheckedMap = { ...checkedItems, [id]: nextChecked };
    setCheckedItems(newCheckedMap);
    const newItems = (scenario.items || []).map((it) => ({
      ...it,
      checked: !!newCheckedMap[it.id],
    }));
    void updateScenario({ ...scenario, items: newItems });
  };

  const handleFinish = () => {
    if (readOnly || !isReady) return;
    setIsClosing(true);
    setTimeout(() => onFinish(), 800);
  };

  const handleAddFriend = (friendId) => {
    if (readOnly) return;
    if (scenario.collaborators?.includes(friendId)) return;
    updateScenario({
      ...scenario,
      collaborators: [...(scenario.collaborators || []), friendId],
    });
  };

  const handleRemoveCollaborator = useCallback(
    (friendId) => {
      if (readOnly) return;
      const collab = (scenario.collaborators || []).filter((id) => id !== friendId);
      const newItems = (scenario.items || []).map((item) =>
        item.assignedTo === friendId ? { ...item, assignedTo: 'me' } : item,
      );
      updateScenario({ ...scenario, collaborators: collab, items: newItems });
    },
    [scenario, updateScenario, readOnly],
  );

  const handleAssignItem = (userId) => {
    if (readOnly || !assigningItem) return;
    const newItems = scenario.items.map((item) =>
      item.id === assigningItem.id ? { ...item, assignedTo: userId } : item,
    );
    updateScenario({ ...scenario, items: newItems });
    setAssigningItem(null);
  };

  const Icon = IconMap[scenario.icon] || Briefcase;
  const cardTheme = scenario.theme || { bg: theme.primary, text: 'text-white' };

  const listShell = `${theme.cardBg} rounded-[22px] overflow-hidden border shadow-sm ${
    theme.isDark ? 'border-slate-700/50 shadow-black/20' : 'border-black/[0.04] shadow-[0_2px_15px_rgba(0,0,0,0.02)]'
  }`;

  const ringTrack = theme.isDark ? '#334155' : '#EAEAEA';

  const footerFade = theme.isDark
    ? 'from-[#161311] via-[#161311]/92 to-transparent'
    : 'from-[#FFFBF5] via-[#FFFBF5]/92 to-transparent';

  return (
    <div
      className={`min-h-screen ${theme.bg} flex flex-col relative transition-opacity duration-500 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div
        className={`sticky top-0 z-20 ${theme.bg}/95 backdrop-blur-md px-4 h-[52px] flex items-center justify-between border-b ${
          theme.isDark ? 'border-slate-800/80' : 'border-[#F0F0F0]'
        }`}
      >
        <button
          type="button"
          onClick={onBack}
          className={`w-10 h-10 flex items-center justify-center rounded-full shadow-sm ${
            theme.isDark ? 'bg-slate-800 text-slate-100' : `bg-white ${theme.textMain}`
          }`}
        >
          <ChevronLeft size={22} />
        </button>
        <div className="flex flex-col items-center max-w-[58%]">
          <span className={`font-bold ${theme.textMain} text-center text-[15px] leading-tight truncate w-full`}>
            {scenario.name}
          </span>
          {isSaving ? (
            <span
              className={`mt-0.5 text-[10px] font-bold flex items-center gap-1 px-2 py-0.5 rounded-full ${
                theme.isDark ? 'bg-slate-800 text-slate-300' : 'bg-white text-[#9A9A9A] shadow-sm'
              }`}
            >
              <span
                className={`inline-block h-2.5 w-2.5 rounded-full border-2 animate-spin ${
                  theme.isDark ? 'border-slate-500 border-t-transparent' : 'border-gray-400 border-t-transparent'
                }`}
              />
              Saving…
            </span>
          ) : null}
          {weather && weather.source === 'open-meteo' && weather.temp != null && weather.location ? (
            <span className={`text-[10px] ${theme.textSub} font-medium mt-0.5 text-center leading-tight px-1 line-clamp-2`}>
              {weather.locationDetail ? `${weather.locationDetail} · ` : ''}
              {weather.location} · {weather.temp}°{weather.tempUnit || 'C'} · {weather.condition || ''}
            </span>
          ) : null}
          {(((scenario.collaborators?.length || 0) > 0 ||
            (scenario.share_recipients?.length || 0) > 0) &&
            !readOnly) ? (
            <span
              className={`text-[10px] mt-0.5 px-2 py-0.5 rounded-full flex items-center gap-0.5 font-bold ${
                theme.isDark ? 'bg-amber-950/50 text-amber-200' : `${theme.primaryLight} ${theme.primaryText}`
              }`}
            >
              <Users size={10} /> {scenario.access === 'shared_edit' ? 'Collaborating' : 'Shared'}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {isOwner ? (
            <>
              {onShareScenario ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowShareModal(true);
                    setShareError('');
                    setShareUsername('');
                    setShareCanEdit(false);
                  }}
                  className={`w-10 h-10 flex items-center justify-center rounded-full shadow-sm ${
                    theme.isDark ? 'bg-slate-800 text-sky-300' : 'bg-white text-sky-600'
                  }`}
                  aria-label={t?.('share')}
                  title={t?.('share')}
                >
                  <Link2 size={18} />
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setShowInviteModal(true)}
                className={`relative w-10 h-10 flex items-center justify-center rounded-full shadow-sm ${
                  theme.isDark ? 'bg-slate-800' : 'bg-white'
                }`}
                aria-label={t?.('peopleOnThisList')}
                title={t?.('peopleOnThisList')}
              >
                {(scenario.collaborators?.length || 0) > 0 ? (
                  <div className="flex -space-x-2">
                    <img src={me.avatar} alt="" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                    <div
                      className={`w-8 h-8 rounded-full border-2 border-white ${theme.accentBlue} flex items-center justify-center text-[10px] font-bold`}
                    >
                      +{scenario.collaborators.length}
                    </div>
                  </div>
                ) : (
                  <Share2 size={20} className={theme.textSub} />
                )}
              </button>
            </>
          ) : (
            <div className="w-10 h-10 shrink-0" aria-hidden />
          )}
        </div>
      </div>

      {saveError ? (
        <div className="px-4 pt-3">
          <div
            className={`rounded-2xl px-3 py-2.5 text-xs font-semibold ${
              theme.isDark
                ? 'bg-rose-950/40 text-rose-200 border border-rose-900/40'
                : 'bg-rose-50 text-rose-800 border border-rose-100'
            }`}
          >
            {typeof t === 'function' ? t('saveFailed') || `保存失败：${saveError}` : `保存失败：${saveError}`}
          </div>
        </div>
      ) : null}

      {readOnly ? (
        <div
          className={`mx-4 mt-3 px-3 py-2.5 rounded-2xl text-xs font-semibold ${
            theme.isDark ? 'bg-sky-950/40 text-sky-200 border border-sky-800/50' : 'bg-sky-50 text-sky-900 border border-sky-100'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            {scenario.owner_avatar ? (
              <img src={scenario.owner_avatar} alt="" className="w-5 h-5 rounded-full bg-white object-cover" />
            ) : null}
            <span>{t?.('viewOnlyHint')} · @{scenario.owner_username || t?.('friendLabel')}</span>
          </div>
        </div>
      ) : null}

      {isOwner && !readOnly && (scenario.share_recipients?.length || 0) > 0 && onUnshareScenario ? (
        <div
          className={`mx-4 mt-3 px-3 py-3 rounded-2xl text-xs ${
            theme.isDark ? 'bg-violet-950/35 text-violet-100 border border-violet-800/50' : 'bg-violet-50 text-violet-950 border border-violet-100'
          }`}
        >
          <p className="font-bold mb-2">{t?.('sharedWithTitle') || 'Shared with'}</p>
          <ul className="space-y-2">
            {scenario.share_recipients.map((r) => (
              <li key={r.username} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {r.avatar ? <img src={r.avatar} alt="" className="w-6 h-6 rounded-full bg-white object-cover" /> : null}
                  <span className="font-semibold truncate">@{r.username}</span>
                  <span
                    className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      r.can_edit
                        ? theme.isDark
                          ? 'bg-emerald-950/60 text-emerald-200 border border-emerald-900/40'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                        : theme.isDark
                          ? 'bg-slate-900/60 text-slate-300 border border-slate-700/40'
                          : 'bg-white text-[#777] border border-gray-100'
                    }`}
                    title={r.can_edit ? (t?.('sharePermissionEdit') || 'Can edit') : (t?.('sharePermissionView') || 'View only')}
                  >
                    {r.can_edit ? (t?.('sharePermissionEdit') || 'Can edit') : (t?.('sharePermissionView') || 'View only')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    void (async () => {
                      try {
                        await onUnshareScenario(scenario.id, r.username);
                      } catch (err) {
                        window.alert(err?.message || t?.('couldNotRevokeShare'));
                      }
                    })();
                  }}
                  className={`btn-ghost-soft shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-lg ${
                    theme.isDark ? 'bg-rose-950/60 text-rose-200' : 'bg-white text-rose-700 border border-rose-100'
                  }`}
                >
                  {t?.('revoke')}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="pt-6 pb-8 px-5 flex flex-col items-center">
        <div className="relative w-[7.5rem] h-[7.5rem] mb-4">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke={ringTrack}
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              className={theme.isDark ? 'text-slate-300' : theme.primaryText}
              strokeWidth="10"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 56}`}
              strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
              style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
              strokeLinecap="round"
            />
          </svg>
          <div
            className={`absolute inset-0 m-2.5 rounded-full ${theme.cardBg} shadow-inner flex items-center justify-center`}
          >
            <div className={`p-3.5 rounded-2xl ${cardTheme.bg} ${cardTheme.text} bg-opacity-30`}>
              <Icon size={36} strokeWidth={1.5} />
            </div>
          </div>
        </div>
        <p
          className={`text-sm font-semibold px-4 py-1.5 rounded-full ${
            theme.isDark ? 'bg-slate-800 text-slate-300' : 'text-[#9A9A9A] bg-white shadow-sm'
          }`}
        >
          {t?.('packedProgress').replace('{checked}', String(checkedCount)).replace('{total}', String(totalCount))}
        </p>
        {canAssign ? (
          <p className={`text-[11px] ${theme.textSub} mt-2 text-center max-w-[240px]`}>
            {t?.('assignHint')}
          </p>
        ) : null}
      </div>

      <div className="flex-1 px-4 space-y-5 pb-40">
        {criticalItems.length > 0 ? (
          <div className="space-y-2">
            <h3
              className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 ml-1 ${theme.danger}`}
            >
              <AlertCircle size={13} className="shrink-0" /> {t?.('criticalLabel')}
            </h3>
            <div className={listShell}>
              {criticalItems.map((item) => (
                <CheckItem
                  key={item.id}
                  item={item}
                  checked={!!checkedItems[item.id]}
                  onToggle={() => toggleItem(item.id)}
                  type="critical"
                  friends={friends}
                  collaborators={scenario.collaborators}
                  onAssignClick={() => setAssigningItem(item)}
                  theme={theme}
                  meUser={me}
                  t={t}
                  canAssign={canAssign}
                  readOnly={readOnly}
                />
              ))}
            </div>
          </div>
        ) : null}
        <div className="space-y-2">
          <h3 className={`text-[11px] font-bold uppercase tracking-wider ml-1 ${theme.textSub}`}>{t?.('normalLabel')}</h3>
          <div className={listShell}>
            {finalItems
              .filter((i) => !i.critical)
              .map((item) => (
                <CheckItem
                  key={item.id}
                  item={item}
                  checked={!!checkedItems[item.id]}
                  onToggle={() => toggleItem(item.id)}
                  type="normal"
                  friends={friends}
                  collaborators={scenario.collaborators}
                  onAssignClick={() => setAssigningItem(item)}
                  theme={theme}
                  meUser={me}
                  t={t}
                  canAssign={canAssign}
                  readOnly={readOnly}
                />
              ))}
          </div>
        </div>
      </div>

      {!readOnly ? (
        <>
          <div
            className={`pointer-events-none fixed bottom-0 left-0 right-0 h-36 max-w-md mx-auto bg-gradient-to-t ${footerFade} z-[5]`}
          />
          <div className="fixed bottom-0 left-0 right-0 p-6 pb-8 z-10 max-w-md mx-auto">
            <button
              type="button"
              onClick={handleFinish}
              disabled={!isReady}
              className={`w-full h-[3.25rem] rounded-[22px] font-bold text-base shadow-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                isReady
                  ? `${theme.primary} text-white shadow-black/10`
                  : theme.isDark
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                    : 'bg-[#EAEAEA] text-[#C0C0C0] cursor-not-allowed shadow-none'
              }`}
            >
              <span>{isReady ? t?.('finishReady') : t?.('finishNeedCritical')}</span>
              {isReady ? <Smile size={22} /> : null}
            </button>
          </div>
        </>
      ) : (
        <div className={`px-6 pb-10 pt-2 text-center text-sm ${theme.textSub}`}>
          {t?.('viewOnlyHint')}
        </div>
      )}

      {showShareModal && onShareScenario ? (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/45 p-6">
          <div
            className={`${theme.cardBg} w-full max-w-sm rounded-3xl p-6 shadow-2xl border ${
              theme.isDark ? 'border-slate-600' : 'border-gray-100'
            }`}
          >
            <h3 className={`text-lg font-bold ${theme.textMain} mb-1`}>{t?.('shareOnServer')}</h3>
            <p className={`text-xs ${theme.textSub} mb-4`}>
              {t?.('shareOnServerHint')}
            </p>
            <label className={`text-xs font-bold ${theme.textSub}`}>{t?.('username')}</label>
            <input
              value={shareUsername}
              onChange={(e) => setShareUsername(e.target.value.toLowerCase())}
              placeholder={t?.('shareUsernamePlaceholder')}
              className={`input-soft mt-1 w-full px-3 py-2.5 text-sm mb-2 outline-none ${
                theme.isDark ? 'bg-slate-900 border-slate-600 text-slate-100' : 'border-gray-200'
              }`}
            />
            {lookupBusy ? (
              <p className={`text-[11px] mb-2 ${theme.textSub}`}>{t?.('checkingUsername')}</p>
            ) : null}
            {!lookupBusy && lookupPreview?.ok && lookupPreview.user ? (
              <div
                className={`flex items-center gap-2 mb-3 p-2 rounded-xl ${
                  theme.isDark ? 'bg-slate-800/80' : 'bg-emerald-50/90 border border-emerald-100'
                }`}
              >
                <img src={lookupPreview.user.avatar} alt="" className="w-8 h-8 rounded-full bg-white" />
                <div className="min-w-0">
                  <p className={`text-xs font-bold truncate ${theme.textMain}`}>
                    @{lookupPreview.user.username}
                  </p>
                  {lookupPreview.user.display_name ? (
                    <p className={`text-[10px] truncate ${theme.textSub}`}>{lookupPreview.user.display_name}</p>
                  ) : null}
                </div>
              </div>
            ) : null}
            {!lookupBusy && lookupPreview && lookupPreview.ok === false ? (
              <p className="text-[11px] text-amber-700 dark:text-amber-300 mb-2">{t?.('noAccountWithUsername')}</p>
            ) : null}
            <div
              className={`mb-3 mt-2 rounded-2xl px-3 py-2 border flex items-center justify-between ${
                theme.isDark ? 'border-slate-700 bg-slate-900/40' : 'border-gray-100 bg-gray-50/70'
              }`}
            >
              <div className="min-w-0 pr-3">
                <p className={`text-xs font-bold ${theme.textMain}`}>{t?.('shareAllowEditTitle') || 'Allow editing'}</p>
                <p className={`text-[11px] ${theme.textSub}`}>
                  {t?.('shareAllowEditHint') || 'If enabled, they can edit items in this trip.'}
                </p>
              </div>
              <button
                type="button"
                disabled={shareBusy}
                onClick={() => setShareCanEdit((v) => !v)}
                className={`shrink-0 w-12 h-7 rounded-full transition-colors relative ${
                  shareCanEdit ? theme.primary : theme.isDark ? 'bg-slate-700' : 'bg-slate-200'
                } ${shareBusy ? 'opacity-60' : ''}`}
                aria-label={t?.('shareAllowEditTitle') || 'Allow editing'}
              >
                <span
                  className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${
                    shareCanEdit ? 'left-[1.6rem]' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
            {friends.some((f) => f.is_registered) ? (
              <div className="mb-3">
                <p className={`text-[10px] font-bold ${theme.textSub} uppercase mb-1`}>{t?.('yourFriends')}</p>
                <div className="flex flex-wrap gap-1.5">
                  {friends
                    .filter((f) => f.is_registered)
                    .map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setShareUsername((f.username || f.name || '').toLowerCase())}
                      className={`btn-secondary-soft text-xs font-semibold px-2.5 py-1 rounded-lg ${
                          theme.isDark ? 'bg-slate-800 text-slate-200' : 'bg-[#F0F0F0] text-[#555]'
                        }`}
                      >
                        @{f.username || f.name}
                      </button>
                    ))}
                </div>
              </div>
            ) : null}
            {shareError ? <p className="text-xs text-red-500 mb-2">{shareError}</p> : null}
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className={`btn-secondary-soft flex-1 py-2.5 rounded-xl text-sm font-bold ${
                  theme.isDark ? 'bg-slate-800 text-slate-200' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {t?.('commonCancel')}
              </button>
              <button
                type="button"
                disabled={shareBusy}
                onClick={() => {
                  void (async () => {
                    const u = shareUsername.trim().toLowerCase();
                    if (!u) {
                      setShareError(t?.('enterUsername'));
                      return;
                    }
                    setShareBusy(true);
                    setShareError('');
                    try {
                      await onShareScenario(scenario.id, u, shareCanEdit);
                      setShowShareModal(false);
                    } catch (err) {
                      setShareError(err?.message || t?.('couldNotShare'));
                    } finally {
                      setShareBusy(false);
                    }
                  })();
                }}
                className={`btn-primary-soft flex-1 py-2.5 rounded-xl text-sm font-bold text-white ${theme.primary} disabled:opacity-50`}
              >
                {t?.('share')}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showInviteModal ? (
        <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center bg-black/45 p-0 sm:p-6">
          <div
            className={`${theme.cardBg} w-full sm:max-w-md rounded-t-[28px] sm:rounded-3xl p-6 shadow-2xl border-t sm:border max-h-[85vh] overflow-y-auto ${
              theme.isDark ? 'border-slate-600' : 'border-gray-100'
            }`}
          >
            <h3 className={`text-xl font-bold ${theme.textMain} mb-1`}>{t?.('peopleOnThisList')}</h3>
            <p className={`text-sm ${theme.textSub} mb-5`}>
              {t?.('peopleOnThisListHint')}
            </p>
            <div className="space-y-2">
              {friends.length === 0 ? (
                <p className={`text-sm ${theme.textSub} py-4 text-center`}>
                  {t?.('addFriendsFirst')}
                </p>
              ) : (
                friends.map((friend) => {
                  const isAdded = scenario.collaborators?.includes(friend.id);
                  return (
                    <div
                      key={friend.id}
                      className={`flex items-center justify-between gap-3 p-3 rounded-2xl ${
                        theme.isDark ? 'bg-slate-800/80' : 'bg-[#FAFAFA]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img src={friend.avatar} alt="" className="w-10 h-10 rounded-full bg-white shrink-0" />
                        <span className={`font-bold ${theme.textMain} truncate`}>{friend.name}</span>
                      </div>
                      {isAdded ? (
                        <button
                          type="button"
                          onClick={() => handleRemoveCollaborator(friend.id)}
                          className={`btn-ghost-soft shrink-0 flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold ${
                            theme.isDark
                              ? 'bg-rose-950/50 text-rose-200'
                              : 'bg-[#FADCDC] text-[#B85C5C]'
                          }`}
                        >
                          <UserMinus size={14} /> {t?.('remove')}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAddFriend(friend.id)}
                          className={`btn-secondary-soft shrink-0 px-4 py-2 rounded-xl text-xs font-bold ${theme.accentGreen} text-[#7A9E83]`}
                        >
                          {t?.('add')}
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowInviteModal(false)}
              className={`btn-secondary-soft w-full mt-5 py-3.5 font-bold text-sm rounded-2xl ${
                theme.isDark ? 'bg-slate-800 text-slate-300' : 'bg-[#F5F5F5] text-[#9A9A9A]'
              }`}
            >
              {t?.('done')}
            </button>
          </div>
        </div>
      ) : null}

      {assigningItem ? (
        <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/45">
          <div
            className={`${theme.cardBg} w-full rounded-t-[32px] p-6 pb-10 shadow-2xl border-t ${
              theme.isDark ? 'border-slate-600' : 'border-gray-100'
            } max-h-[80vh] overflow-y-auto`}
          >
            <div className="flex justify-between items-start gap-3 mb-6">
              <div className="min-w-0">
                <h3 className={`text-lg font-bold ${theme.textMain}`}>{t?.('whoPacksThis')}</h3>
                <p className={`text-sm ${theme.textSub} mt-1 line-clamp-3`}>{assigningItem.text}</p>
              </div>
              <button
                type="button"
                onClick={() => setAssigningItem(null)}
                className={`p-2 rounded-full shrink-0 ${theme.isDark ? 'bg-slate-800 text-slate-300' : 'bg-[#F5F5F5] text-[#9A9A9A]'}`}
              >
                <X size={20} />
              </button>
            </div>
            {(scenario.collaborators?.length || 0) === 0 && (friends?.length || 0) > 0 ? (
              <p className={`text-xs ${theme.textSub} mb-4 flex items-start gap-2`}>
                <UserCircle2 size={16} className="shrink-0 mt-0.5" />
                {t?.('addPeopleBeforeAssign')}
              </p>
            ) : null}
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
              <AssigneeBtn
                user={me}
                active={assigningItem.assignedTo === 'me' || !assigningItem.assignedTo}
                onClick={() => handleAssignItem('me')}
                theme={theme}
              />
              {(scenario.collaborators || [])
                .map((fid) => {
                  const u = friends.find((f) => f.id === fid);
                  if (!u) return null;
                  return (
                    <AssigneeBtn
                      key={fid}
                      user={u}
                      active={assigningItem.assignedTo === fid}
                      onClick={() => handleAssignItem(fid)}
                      theme={theme}
                    />
                  );
                })
                .filter(Boolean)}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ChecklistDetail;
