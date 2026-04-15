import React, { useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft,
  Bell,
  Volume2,
  MapPin,
  Globe,
  Moon,
  Palette,
  ChevronRight,
  X,
  Lock,
  Trash2,
  Activity,
} from 'lucide-react';
import { THEMES } from '../constants/data';
import { settingsT } from '../settingsCopy';
import { api } from '../api';

const AVATAR_STYLE_OPTIONS = [
  { id: 'notionists', label: 'Notionists' },
  { id: 'avataaars', label: 'Avataaars' },
  { id: 'bottts', label: 'Bottts' },
  { id: 'micah', label: 'Micah' },
  { id: 'fun-emoji', label: 'Fun Emoji' },
  { id: 'adventurer', label: 'Adventurer' },
  { id: 'adventurer-neutral', label: 'Adventurer Neutral' },
  { id: 'big-ears', label: 'Big Ears' },
  { id: 'big-smile', label: 'Big Smile' },
  { id: 'croodles', label: 'Croodles' },
  { id: 'identicon', label: 'Identicon' },
  { id: 'lorelei', label: 'Lorelei' },
  { id: 'open-peeps', label: 'Open Peeps' },
  { id: 'thumbs', label: 'Thumbs' },
];

function ToggleRow({ icon: Icon, label, on, disabled, onToggle, theme }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onToggle(!on)}
      className={`flex w-full items-center justify-between p-5 border-b border-[#F9F9F9] last:border-0 text-left transition-colors ${
        theme.isDark ? 'border-slate-700/80' : ''
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:bg-black/5'}`}
    >
      <div className={`flex items-center space-x-3 ${theme.textMain}`}>
        <Icon size={20} className={theme.isDark ? 'text-slate-400' : 'text-[#9A9A9A]'} />
        <span className="font-medium">{label}</span>
      </div>
      <div
        className={`w-12 h-7 rounded-full relative transition-colors duration-300 ease-in-out shrink-0 ${
          on ? theme.success : theme.isDark ? 'bg-slate-600' : 'bg-[#EAEAEA]'
        }`}
        aria-hidden
      >
        <div
          className={`w-6 h-6 bg-white rounded-full shadow-sm absolute top-0.5 transition-all duration-300 ease-in-out ${
            on ? 'left-[22px]' : 'left-0.5'
          }`}
        />
      </div>
    </button>
  );
}

function NavigationRow({ icon: Icon, label, description, onClick, theme, rightLabel }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between p-5 border-b border-[#F9F9F9] last:border-0 text-left transition-colors active:bg-black/5 ${
        theme.isDark ? 'border-slate-700/80' : ''
      }`}
    >
      <div className="flex items-center space-x-3 min-w-0">
        <Icon size={20} className={theme.isDark ? 'text-slate-400' : 'text-[#9A9A9A]'} />
        <div className="min-w-0">
          <p className={`font-medium ${theme.textMain} truncate`}>{label}</p>
          {description ? <p className={`text-xs ${theme.textSub} truncate mt-0.5`}>{description}</p> : null}
        </div>
      </div>
      <div className="flex items-center shrink-0">
        {rightLabel ? <span className={`text-xs mr-2 ${theme.textSub}`}>{rightLabel}</span> : null}
        <ChevronRight size={18} className={theme.isDark ? 'text-slate-500' : 'text-[#D1D1D1]'} />
      </div>
    </button>
  );
}

const SystemSettings = ({
  onBack,
  onLogout,
  theme,
  currentThemeKey,
  onChangeTheme,
  currentUser,
  onSaveProfileDisplayName,
  onChangePassword,
  onDeleteAccount,
  appPrefs,
  onAppPrefsChange,
}) => {
  const t = settingsT(appPrefs?.language || 'en');
  const [showEdit, setShowEdit] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftAvatarStyle, setDraftAvatarStyle] = useState('notionists');
  const [langOpen, setLangOpen] = useState(false);
  const [prefsBusy, setPrefsBusy] = useState(false);
  const [profileSaveBusy, setProfileSaveBusy] = useState(false);
  const [profileSaveErr, setProfileSaveErr] = useState('');
  const [pwdCurrent, setPwdCurrent] = useState('');
  const [pwdNew, setPwdNew] = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');
  const [pwdBusy, setPwdBusy] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [healthOk, setHealthOk] = useState(null);
  const [activeSection, setActiveSection] = useState('main');

  const cardClass = `rounded-3xl shadow-sm ${
    theme.isDark ? 'border border-slate-700/80' : 'border border-[#F5F5F5]'
  }`;

  const runPref = useCallback(
    async (fn) => {
      setPrefsBusy(true);
      try {
        await fn();
      } finally {
        setPrefsBusy(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (showEdit) {
      setDraftName(currentUser?.name || currentUser?.username || '');
      setDraftAvatarStyle(currentUser?.avatar_style || 'notionists');
      setProfileSaveErr('');
    }
  }, [showEdit, currentUser]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await api.health();
        if (!cancelled) setHealthOk(true);
      } catch {
        if (!cancelled) setHealthOk(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSaveProfile = () => {
    void (async () => {
      if (!onSaveProfileDisplayName) return;
      setProfileSaveBusy(true);
      setProfileSaveErr('');
      try {
        await onSaveProfileDisplayName({
          displayName: draftName.trim(),
          avatarStyle: draftAvatarStyle,
        });
        setShowEdit(false);
      } catch {
        setProfileSaveErr(t('displayNameSaveError'));
      } finally {
        setProfileSaveBusy(false);
      }
    })();
  };

  const handleNotifications = (next) => {
    void runPref(async () => {
      if (!next) {
        await onAppPrefsChange({ notifications: false });
        return;
      }
      if (typeof window === 'undefined' || !('Notification' in window)) {
        await onAppPrefsChange({ notifications: true });
        return;
      }
      if (Notification.permission === 'default') {
        const p = await Notification.requestPermission();
        if (p !== 'granted') {
          await onAppPrefsChange({ notifications: false });
          window.alert(t('notifDenied'));
          return;
        }
      } else if (Notification.permission === 'denied') {
        await onAppPrefsChange({ notifications: false });
        window.alert(t('notifDenied'));
        return;
      }
      await onAppPrefsChange({ notifications: true });
    });
  };

  const sectionTitle = (text) => (
    <h4
      className={`text-xs font-bold uppercase tracking-wider mb-3 ml-2 ${
        theme.isDark ? 'text-slate-500' : 'text-[#C0C0C0]'
      }`}
    >
      {text}
    </h4>
  );

  const sectionTitleText = (() => {
    if (activeSection === 'general') return t('general');
    if (activeSection === 'personalization') return t('personalization');
    if (activeSection === 'security') return t('accountSecurity');
    return t('title');
  })();

  const handleHeaderBack = () => {
    if (activeSection !== 'main') {
      setActiveSection('main');
      return;
    }
    onBack();
  };

  return (
    <div className={`flex flex-col h-full relative ${theme.bg}`}>
      <div
        className={`${theme.bg}/90 px-6 pt-10 pb-4 sticky top-0 flex items-center z-10 backdrop-blur-sm ${
          theme.isDark ? 'border-b border-slate-800/60' : ''
        }`}
      >
        <button
          type="button"
          onClick={handleHeaderBack}
          className={`mr-4 p-2 -ml-2 rounded-full hover:bg-black/5 transition-colors ${theme.textMain}`}
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex items-center gap-2 min-w-0">
          <h1 className={`text-xl font-bold ${theme.textMain} truncate`}>{sectionTitleText}</h1>
          {prefsBusy ? (
            <span className={`text-[10px] font-medium shrink-0 ${theme.textSub}`}>{t('loadingPrefs')}</span>
          ) : null}
        </div>
      </div>

      <div className="p-6 space-y-6 overflow-y-auto pb-10">
        <div className={`${theme.cardBg} p-5 ${cardClass} flex items-center space-x-4`}>
          <img src={currentUser?.avatar} alt="avatar" className="w-16 h-16 rounded-full bg-black/5" />
          <div className="flex-1 min-w-0">
            <h3 className={`font-bold ${theme.textMain} text-lg truncate`}>{currentUser?.name || 'User'}</h3>
            <p className={`text-xs ${theme.textSub} truncate`}>
              {t('signedIn')} · @{currentUser?.username || '—'}
              {currentUser?.db_id != null ? ` · #${currentUser.db_id}` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowEdit(true)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium shrink-0 ${
              theme.isDark ? 'bg-slate-700 text-slate-200' : 'bg-[#F5F5F5] text-[#9A9A9A]'
            }`}
          >
            {t('edit')}
          </button>
        </div>

        {activeSection === 'main' ? (
          <div>
            {sectionTitle(t('accountCenter'))}
            <div className={`${theme.cardBg} overflow-hidden ${cardClass}`}>
              <NavigationRow
                icon={Bell}
                label={t('general')}
                description={t('generalHint')}
                onClick={() => setActiveSection('general')}
                theme={theme}
                rightLabel={t('openSection')}
              />
              <NavigationRow
                icon={Palette}
                label={t('personalization')}
                description={t('personalizationHint')}
                onClick={() => setActiveSection('personalization')}
                theme={theme}
                rightLabel={t('openSection')}
              />
              <NavigationRow
                icon={Lock}
                label={t('accountSecurity')}
                description={t('accountSecurityHint')}
                onClick={() => setActiveSection('security')}
                theme={theme}
                rightLabel={t('openSection')}
              />
            </div>
          </div>
        ) : null}

        {activeSection === 'general' ? (
          <div>
            {sectionTitle(t('general'))}
            <div className={`${theme.cardBg} overflow-hidden ${cardClass}`}>
              <ToggleRow
                icon={Bell}
                label={t('notifications')}
                on={!!appPrefs?.notifications}
                disabled={prefsBusy}
                onToggle={handleNotifications}
                theme={theme}
              />
              <ToggleRow
                icon={Volume2}
                label={t('sounds')}
                on={!!appPrefs?.sounds}
                disabled={prefsBusy}
                onToggle={(next) => void runPref(() => onAppPrefsChange({ sounds: next }))}
                theme={theme}
              />
              <ToggleRow
                icon={MapPin}
                label={t('autoLocation')}
                on={!!appPrefs?.auto_location}
                disabled={prefsBusy}
                onToggle={(next) => void runPref(() => onAppPrefsChange({ auto_location: next }))}
                theme={theme}
              />
              <button
                type="button"
                onClick={() => setLangOpen(true)}
                className={`flex w-full items-center justify-between p-5 text-left transition-colors active:bg-black/5 ${
                  theme.textMain
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Globe size={20} className={theme.isDark ? 'text-slate-400' : 'text-[#9A9A9A]'} />
                  <span className="font-medium">{t('language')}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-xs text-[#9A9A9A] mr-2">
                    {appPrefs?.language === 'zh' ? t('langChinese') : t('langEnglish')}
                  </span>
                  <ChevronRight size={18} className="text-[#D1D1D1]" />
                </div>
              </button>
            </div>
          </div>
        ) : null}

        {activeSection === 'personalization' ? (
          <div>
            {sectionTitle(t('personalization'))}
            <div className={`${theme.cardBg} overflow-hidden ${cardClass}`}>
              <ToggleRow
                icon={Moon}
                label={t('darkMode')}
                on={!!appPrefs?.dark_mode}
                disabled={prefsBusy}
                onToggle={(next) => void runPref(() => onAppPrefsChange({ dark_mode: next }))}
                theme={theme}
              />
              <div
                className={`p-5 flex items-center justify-between border-b border-[#F9F9F9] last:border-0 ${
                  theme.isDark ? 'border-slate-700/80' : ''
                }`}
              >
                <div className={`flex items-center space-x-3 ${theme.textMain}`}>
                  <Palette size={20} className={theme.isDark ? 'text-slate-400' : 'text-[#9A9A9A]'} />
                  <span className="font-medium">{t('themeColor')}</span>
                </div>
                <div className="flex space-x-3">
                  {Object.keys(THEMES).map((themeKey) => {
                    const th = THEMES[themeKey];
                    const isActive = currentThemeKey === themeKey;
                    return (
                      <button
                        key={themeKey}
                        type="button"
                        onClick={() => onChangeTheme(themeKey)}
                        className={`w-6 h-6 rounded-full ${th.primary} border-2 transition-all ${
                          isActive
                            ? `${theme.isDark ? 'border-slate-300' : 'border-[#EAEAEA]'} ring-2 ring-offset-2 ${th.primaryBorder}`
                            : theme.isDark
                              ? 'border-slate-700'
                              : 'border-white'
                        }`}
                        title={th.name}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {activeSection === 'security' ? (
          <div>
            {sectionTitle(t('accountSecurity'))}
            <div className={`${theme.cardBg} overflow-hidden ${cardClass}`}>
              <div
                className={`p-5 space-y-3 border-b border-[#F9F9F9] ${
                  theme.isDark ? 'border-slate-700/80' : ''
                }`}
              >
                <div className={`flex items-center gap-2 ${theme.textMain}`}>
                  <Lock size={18} className={theme.isDark ? 'text-slate-400' : 'text-[#9A9A9A]'} />
                  <span className="font-medium">{t('changePassword')}</span>
                </div>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={pwdCurrent}
                  onChange={(e) => {
                    setPwdCurrent(e.target.value);
                    setPwdMsg('');
                  }}
                  placeholder={t('currentPassword')}
                  className={`input-soft w-full px-3 py-2.5 text-sm outline-none ${
                    theme.isDark
                      ? 'bg-slate-900 border-slate-600 text-slate-100'
                      : 'border-gray-200 bg-white'
                  }`}
                />
                <input
                  type="password"
                  autoComplete="new-password"
                  value={pwdNew}
                  onChange={(e) => {
                    setPwdNew(e.target.value);
                    setPwdMsg('');
                  }}
                  placeholder={t('newPassword')}
                  className={`input-soft w-full px-3 py-2.5 text-sm outline-none ${
                    theme.isDark
                      ? 'bg-slate-900 border-slate-600 text-slate-100'
                      : 'border-gray-200 bg-white'
                  }`}
                />
                <input
                  type="password"
                  autoComplete="new-password"
                  value={pwdConfirm}
                  onChange={(e) => {
                    setPwdConfirm(e.target.value);
                    setPwdMsg('');
                  }}
                  placeholder={t('confirmPassword')}
                  className={`input-soft w-full px-3 py-2.5 text-sm outline-none ${
                    theme.isDark
                      ? 'bg-slate-900 border-slate-600 text-slate-100'
                      : 'border-gray-200 bg-white'
                  }`}
                />
                {pwdMsg ? (
                  <p className={`text-xs font-medium ${theme.isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                    {pwdMsg}
                  </p>
                ) : null}
                <button
                  type="button"
                  disabled={pwdBusy || !onChangePassword}
                  onClick={() => {
                    void (async () => {
                      if (!onChangePassword) return;
                      if (pwdNew !== pwdConfirm) {
                        window.alert(t('passwordMismatch'));
                        return;
                      }
                      setPwdBusy(true);
                      setPwdMsg('');
                      try {
                        await onChangePassword({
                          currentPassword: pwdCurrent,
                          newPassword: pwdNew,
                        });
                        setPwdCurrent('');
                        setPwdNew('');
                        setPwdConfirm('');
                        setPwdMsg(t('passwordUpdated'));
                      } catch {
                        window.alert(t('passwordSaveError'));
                      } finally {
                        setPwdBusy(false);
                      }
                    })();
                  }}
                  className={`btn-primary-soft w-full py-3 rounded-xl text-sm font-bold text-white ${theme.primary} disabled:opacity-50`}
                >
                  {t('updatePassword')}
                </button>
              </div>
              <div className={`p-5 space-y-3 ${theme.isDark ? 'bg-rose-950/15' : 'bg-[#FFF8F8]'}`}>
                <div className={`flex items-center gap-2 ${theme.textMain}`}>
                  <Trash2 size={18} className="text-rose-500" />
                  <span className="font-medium">{t('dangerous')}</span>
                </div>
                <p className={`text-xs ${theme.textSub}`}>{t('deleteAccountHint')}</p>
                <label className={`text-[11px] font-bold uppercase ${theme.textSub}`}>
                  {t('deleteConfirmLabel')}
                </label>
                <input
                  type="text"
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value.toLowerCase())}
                  placeholder={t('deleteConfirmPlaceholder')}
                  autoComplete="username"
                  className={`input-soft w-full px-3 py-2.5 text-sm outline-none ${
                    theme.isDark
                      ? 'bg-slate-900 border-slate-600 text-slate-100'
                      : 'border-gray-200 bg-white'
                  }`}
                />
                <button
                  type="button"
                  disabled={deleteBusy || !onDeleteAccount}
                  onClick={() => {
                    void (async () => {
                      if (!onDeleteAccount) return;
                      const u = (currentUser?.username || '').toLowerCase();
                      if (deleteConfirm.trim().toLowerCase() !== u) {
                        window.alert(t('deleteMismatch'));
                        return;
                      }
                      if (
                        !window.confirm(
                          appPrefs?.language === 'zh'
                            ? '确定永久删除账号？此操作无法撤销。'
                            : 'Permanently delete your account? This cannot be undone.',
                        )
                      )
                        return;
                      setDeleteBusy(true);
                      try {
                        await onDeleteAccount();
                      } catch {
                        window.alert('Could not delete account.');
                        setDeleteBusy(false);
                      }
                    })();
                  }}
                  className="btn-danger-soft w-full py-3 rounded-xl text-sm font-bold disabled:opacity-50"
                >
                  {t('deleteAccountButton')}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <div className={`${theme.cardBg} p-4 ${cardClass} flex items-center justify-between`}>
          <div className={`flex items-center gap-2 ${theme.textMain}`}>
            <Activity size={18} className={theme.isDark ? 'text-slate-400' : 'text-[#9A9A9A]'} />
            <span className="text-sm font-medium">{t('serverStatus')}</span>
          </div>
          <span
            className={`text-xs font-bold ${
              healthOk === null
                ? theme.textSub
                : healthOk
                  ? theme.isDark
                    ? 'text-emerald-400'
                    : 'text-emerald-700'
                  : 'text-rose-600'
            }`}
          >
            {healthOk === null ? '…' : healthOk ? t('serverOk') : t('serverFail')}
          </span>
        </div>

        <div className="text-center pt-4 pb-8">
          <button
            type="button"
            onClick={onLogout}
            className={`w-full font-medium text-sm px-6 py-4 rounded-2xl active:scale-98 transition-transform ${
              theme.isDark
                ? 'text-[#F0A0A0] bg-[#2A1F1F] border border-[#4A3030]'
                : 'text-[#D98282] bg-[#FFF5F5] border border-[#FADCDC]'
            }`}
          >
            {t('logOut')}
          </button>
        </div>
      </div>

      {showEdit ? (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
          <div
            className={`${theme.cardBg} w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-fade-in border ${
              theme.isDark ? 'border-slate-600' : 'border-gray-100'
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-bold ${theme.textMain}`}>{t('displayName')}</h3>
              <button
                type="button"
                onClick={() => setShowEdit(false)}
                className={`p-2 rounded-full ${theme.isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-gray-100 text-gray-500'}`}
              >
                <X size={20} />
              </button>
            </div>
            <p className={`text-xs ${theme.textSub} mb-4`}>{t('displayNameHint')}</p>
            {profileSaveErr ? <p className="text-xs text-red-500 mb-2">{profileSaveErr}</p> : null}
            <div className="mb-3">
              <p className={`text-xs font-semibold ${theme.textSub} mb-2`}>{t('avatarStyle')}</p>
              <div className="flex flex-wrap gap-2">
                {AVATAR_STYLE_OPTIONS.map((style) => {
                  const selected = draftAvatarStyle === style.id;
                  const preview = `https://api.dicebear.com/7.x/${style.id}/svg?seed=${encodeURIComponent(
                    currentUser?.username || 'user',
                  )}`;
                  return (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setDraftAvatarStyle(style.id)}
                      className={`px-2 py-1.5 rounded-lg border text-[11px] font-medium flex items-center gap-2 ${
                        selected
                          ? `${theme.primary} text-white border-transparent`
                          : theme.isDark
                            ? 'border-slate-600 text-slate-200 bg-slate-800'
                            : 'border-slate-200 text-slate-700 bg-slate-50'
                      }`}
                    >
                      <img src={preview} alt={style.label} className="w-5 h-5 rounded-full bg-black/5" />
                      <span>{style.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <input
              type="text"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              className={`input-soft w-full px-4 py-3 mb-4 outline-none ${
                theme.isDark
                  ? 'bg-slate-900 border-slate-600 text-slate-100 placeholder-slate-500'
                  : 'border-gray-200 text-gray-800'
              }`}
              placeholder={t('placeholder')}
              maxLength={48}
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowEdit(false)}
                className={`btn-secondary-soft flex-1 py-3 rounded-xl font-bold ${
                  theme.isDark ? 'text-slate-300 bg-slate-700' : 'text-gray-500 bg-gray-100'
                }`}
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                disabled={profileSaveBusy}
                onClick={handleSaveProfile}
                className={`btn-primary-soft flex-1 py-3 rounded-xl font-bold text-white ${theme.primary} disabled:opacity-50`}
              >
                {profileSaveBusy ? t('savingProfile') : t('save')}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {langOpen ? (
        <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:p-6 sm:items-center">
          <div
            className={`${theme.cardBg} w-full sm:max-w-sm rounded-t-[28px] sm:rounded-3xl p-6 shadow-2xl border-t sm:border ${
              theme.isDark ? 'border-slate-600' : 'border-[#F0F0F0]'
            }`}
          >
            <h3 className={`text-lg font-bold ${theme.textMain} mb-4`}>{t('pickLanguage')}</h3>
            <div className="space-y-2">
              {[
                { code: 'en', label: t('langEnglish') },
                { code: 'zh', label: t('langChinese') },
              ].map(({ code, label }) => (
                <button
                  key={code}
                  type="button"
                  disabled={prefsBusy}
                  onClick={() => {
                    void runPref(async () => {
                      await onAppPrefsChange({ language: code });
                      setLangOpen(false);
                    });
                  }}
                  className={`w-full py-3.5 rounded-2xl text-left px-4 font-bold text-sm transition-colors ${
                    appPrefs?.language === code
                      ? `${theme.primaryLight} ${theme.primaryText}`
                      : theme.isDark
                        ? 'btn-secondary-soft bg-slate-800/80 text-slate-200'
                        : 'btn-secondary-soft bg-[#F5F5F5] text-[#5C5C5C]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setLangOpen(false)}
              className={`w-full mt-4 py-3 rounded-xl font-bold text-sm ${
                theme.isDark ? 'text-slate-400 bg-slate-800' : 'text-[#9A9A9A] bg-[#F5F5F5]'
              }`}
            >
              {t('close')}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default SystemSettings;
