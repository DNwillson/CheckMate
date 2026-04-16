import React from 'react';
import { Sun, Smile, ArrowRight } from 'lucide-react';

function formatWhen(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return String(iso);
  }
}

const PackingSuccess = ({ onHome, onViewHistory, lastPacked, theme, t }) => {
  return (
    <div className={`h-full flex flex-col items-center justify-center p-8 ${theme.bg} relative overflow-hidden`}>
      <div
        className={`absolute inset-0 ${
          theme.isDark
            ? 'bg-gradient-to-b from-slate-900/30 via-transparent to-transparent'
            : 'bg-gradient-to-b from-slate-50/80 via-transparent to-transparent'
        }`}
      />
      <div
        className={`absolute top-16 right-8 w-32 h-32 rounded-full blur-3xl opacity-60 animate-pulse ${
          theme.isDark ? 'bg-slate-700/20' : 'bg-slate-200/60'
        }`}
      />

      <div className="z-10 flex flex-col items-center text-center animate-fade-in">
        <div className="relative mb-12 animate-float">
          <div
            className={`w-40 h-40 rounded-full flex items-center justify-center shadow-2xl ${
              theme.isDark
                ? 'bg-slate-900/40 border border-slate-700/50 shadow-black/40'
                : `${theme.primaryLight} border border-white/70 shadow-slate-200/60`
            }`}
          >
            <Sun size={80} className={theme.primaryText} strokeWidth={1.5} />
          </div>
          <div
            className={`absolute -bottom-4 -right-2 p-3 rounded-full shadow-lg rotate-12 border ${
              theme.isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-white/70'
            }`}
          >
            <Smile size={32} className={theme.primaryText} />
          </div>
        </div>

        <h2 className={`text-3xl font-bold mb-3 ${theme.textMain} tracking-tight`}>{t?.('allSet') || 'All Set!'}</h2>
        <p className={`${theme.textSub} text-lg mb-6 font-medium`}>
          {t?.('packedMsg') || 'Everything is packed.'}
          <br />
          {t?.('enjoyMsg') || 'Enjoy the sunshine and breeze today!'}
        </p>

        {lastPacked?.name ? (
          <div className={`mb-8 px-4 py-3 rounded-2xl ${theme.cardBg} border ${theme.isDark ? 'border-slate-700/60' : 'border-white/70'} shadow-sm w-full max-w-sm`}>
            <p className={`text-[11px] font-bold uppercase tracking-wider ${theme.textSub}`}>{t?.('lastPacked') || 'Last packed'}</p>
            <p className={`text-sm font-bold ${theme.textMain} mt-1 truncate`}>{lastPacked.name}</p>
            {lastPacked.at ? (
              <p className={`text-xs ${theme.textSub} mt-1`}>{formatWhen(lastPacked.at)}</p>
            ) : null}
          </div>
        ) : null}

        <div className="flex gap-3 w-full max-w-sm">
          <button
            type="button"
            onClick={onViewHistory}
            className={`flex-1 ${theme.cardBg} ${theme.textMain} px-6 py-4 rounded-[20px] font-bold text-sm shadow-md hover:opacity-95 transition-all active:scale-95 border ${theme.isDark ? 'border-slate-700/60' : 'border-white/70'}`}
          >
            {t?.('viewHistory') || 'View history'}
          </button>
          <button
            type="button"
            onClick={onHome}
            className={`flex-1 ${theme.primary} text-white px-6 py-4 rounded-[20px] font-bold text-sm shadow-xl ${theme.primaryHover} transition-all active:scale-95 flex items-center justify-center gap-2`}
          >
            <span>{t?.('backHome') || "Let's Go"}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PackingSuccess;