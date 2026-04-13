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
    <div className={`h-full flex flex-col items-center justify-center p-8 ${theme.success} relative overflow-hidden`}>
      <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-[#E9EDC9]/50 to-transparent"></div>
      <div className="absolute top-20 right-10 w-32 h-32 bg-[#FEFAE0] rounded-full blur-3xl opacity-60 animate-pulse"></div>

      <div className="z-10 flex flex-col items-center text-center animate-fade-in">
        <div className="relative mb-12 animate-float">
           <div className="w-40 h-40 bg-[#FEFAE0] rounded-full flex items-center justify-center shadow-2xl shadow-[#CCD5AE]/50">
              <Sun size={80} className={theme.primaryText} strokeWidth={1.5} />
           </div>
           <div className="absolute -bottom-4 -right-2 bg-white p-3 rounded-full shadow-lg rotate-12">
              <Smile size={32} className={theme.success} />
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
            className={`flex-1 bg-[#FEFAE0] ${theme.primaryText} px-6 py-4 rounded-[20px] font-bold text-sm shadow-xl hover:bg-white transition-all active:scale-95 flex items-center justify-center gap-2`}
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