import React, { useEffect, useMemo, useState } from 'react';
import {
  Settings,
  MapPin,
  Sun,
  Zap,
  ChevronRight,
  Cloud,
  CloudRain,
  CloudSun,
  CloudFog,
  Snowflake,
  RefreshCw,
} from 'lucide-react';
import { IconMap } from '../constants/data';
import WeatherDetailSheet from '../components/WeatherDetailSheet';

const WeatherGlyph = ({ iconKey, className = '' }) => {
  const p = { size: 28, strokeWidth: 1.5, className: className || undefined };
  switch (iconKey) {
    case 'clear':
      return <Sun {...p} />;
    case 'partly_cloudy':
      return <CloudSun {...p} />;
    case 'overcast':
    case 'cloud':
      return <Cloud {...p} />;
    case 'rain':
      return <CloudRain {...p} />;
    case 'snow':
      return <Snowflake {...p} />;
    case 'fog':
      return <CloudFog {...p} />;
    case 'storm':
      return <Zap {...p} />;
    default:
      return <Cloud {...p} />;
  }
};

const HomeDashboard = ({
  scenarios,
  onSelect,
  onSettingsClick,
  onAddWeatherItems,
  weather,
  weatherLoading,
  weatherError,
  onRefreshWeather,
  weatherFetchParams,
  theme,
  t,
}) => {
  const [detailOpen, setDetailOpen] = useState(false);
  const [tipsExpanded, setTipsExpanded] = useState(false);
  const [weatherTargetTripId, setWeatherTargetTripId] = useState('');
  const [weatherAddBusy, setWeatherAddBusy] = useState(false);
  const [weatherAddMsg, setWeatherAddMsg] = useState('');

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return t?.('greetingMorning') || 'Good Morning,';
    if (hour < 18) return t?.('greetingAfternoon') || 'Good Afternoon,';
    return t?.('greetingEvening') || 'Good Evening,';
  }, [t]);

  const comfort = weather?.comfort || '—';
  const live = weather?.source === 'open-meteo';
  const hint =
    weather?.packingHint || (weatherLoading ? 'Fetching live forecast…' : 'Tap refresh to load weather.');
  const tempUnit = weather?.tempUnit || 'C';
  const myTrips = useMemo(() => scenarios.filter((s) => s.type === 'custom' && s.access !== 'shared'), [scenarios]);
  const quickScenarios = useMemo(() => scenarios.filter((s) => s.type !== 'custom'), [scenarios]);
  const weatherPackingItems = useMemo(() => {
    const out = [];
    const push = (text, critical = false) => {
      if (!text) return;
      if (out.some((x) => x.text.toLowerCase() === text.toLowerCase())) return;
      out.push({ text, critical, assignedTo: 'me' });
    };
    const uv = Number(weather?.uvIndex);
    const humidity = Number(weather?.humidity);
    const wind = Number(weather?.windKmh);
    const temp = Number(weather?.temp);
    const code = Number(weather?.weatherCode);

    if (!Number.isNaN(uv) && uv >= 6) {
      push('Sunscreen (SPF 30+)', true);
      push('UV-protection sunglasses', false);
      push('Cap or sun hat', false);
    }
    if (!Number.isNaN(humidity) && humidity >= 80) {
      push('Quick-dry shirt', false);
      push('Small absorbent towel', false);
    }
    if (!Number.isNaN(wind) && wind >= 30) {
      push('Windproof outer layer', false);
    }
    if (!Number.isNaN(temp) && temp <= 10) {
      push('Warm mid-layer or fleece', true);
      push('Light gloves', false);
    }
    if (!Number.isNaN(temp) && temp >= 30) {
      push('Reusable water bottle', true);
      push('Breathable light clothing', false);
    }
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
      push('Compact umbrella', true);
      push('Water-resistant pouch for phone', false);
    }
    if ([71, 73, 75, 85, 86].includes(code)) {
      push('Thermal base layer', true);
      push('Warm socks', false);
    }
    return out.slice(0, 6);
  }, [weather]);

  useEffect(() => {
    if (!myTrips.length) {
      setWeatherTargetTripId('');
      return;
    }
    if (myTrips.some((s) => s.id === weatherTargetTripId)) return;
    setWeatherTargetTripId(myTrips[0].id);
  }, [myTrips, weatherTargetTripId]);

  return (
    <div className="p-6 pb-28 space-y-6 animate-fade-in">
      <header className="mt-4 flex justify-between items-center">
        <div>
          <h1 className={`text-2xl font-bold ${theme.textMain} tracking-tight`}>
            {greeting}
            <br />
            <span className={`${theme.primaryText} text-3xl`}>{t?.('whereToToday') || 'Where to today?'}</span>
          </h1>
        </div>
        <button
          type="button"
          onClick={onSettingsClick}
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
        >
          <Settings size={20} className="text-[#9A9A9A]" />
        </button>
      </header>

      <div className="relative rounded-[28px] overflow-hidden shadow-[0_12px_40px_rgba(15,23,42,0.08)] border border-white/70 ring-1 ring-slate-200/40">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-indigo-50/90" />
        <div className="absolute -right-8 -top-12 w-40 h-40 rounded-full bg-sky-200/25 blur-3xl" />
        <div className="absolute -left-6 bottom-0 w-32 h-32 rounded-full bg-indigo-200/20 blur-2xl" />

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRefreshWeather();
          }}
          disabled={weatherLoading}
          className="absolute top-3 right-3 z-20 p-2.5 rounded-2xl bg-white/70 hover:bg-white shadow-sm text-slate-600 disabled:opacity-50 transition-all backdrop-blur-sm"
          title={t?.('refreshWeather') || 'Refresh weather'}
          aria-label={t?.('refreshWeather') || 'Refresh weather'}
        >
          <RefreshCw size={18} className={weatherLoading ? 'animate-spin' : ''} />
        </button>

        <button
          type="button"
          onClick={() => live && setDetailOpen(true)}
          disabled={!live}
          className={`relative z-10 w-full text-left p-5 pt-7 transition-transform ${
            live ? 'active:scale-[0.99]' : 'cursor-default'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-1.5 text-sky-700/90">
                <MapPin size={14} className="shrink-0" strokeWidth={2.5} />
                <span className="text-[11px] font-bold uppercase tracking-wider">{t?.('now') || 'Now'}</span>
              </div>
              <h2 className={`text-lg sm:text-xl font-bold ${theme.textMain} leading-snug break-words`}>
                {weather?.location || '—'}
              </h2>
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 pt-1.5">
                <span className={`text-5xl font-bold tracking-tight ${theme.textMain}`}>
                  {!live && weatherLoading ? '—' : `${weather?.temp ?? '—'}°`}
                </span>
                <span className="text-slate-500 text-sm font-semibold">{tempUnit}</span>
                <span className={`text-sm font-medium text-slate-600 w-full sm:w-auto`}>
                  {!live && weatherLoading ? '…' : weather?.condition || ''}
                </span>
              </div>
              <p className={`text-xs font-semibold text-sky-800/70 pt-1`}>
                {live && weather?.windKmh != null ? ` · Wind ${weather.windKmh} km/h` : ''}
                {live && weather?.humidity != null ? ` · ${weather.humidity}% RH` : ''}
                {live && weather?.isDay && weather?.uvIndex != null ? ` · UV ${weather.uvIndex}` : ''}
                {!live && !weatherLoading ? ` · ${comfort}` : ''}
              </p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-white/60 backdrop-blur-md shadow-inner border border-white/80 flex items-center justify-center shrink-0">
              <WeatherGlyph iconKey={weather?.iconKey} className={theme.primaryText} />
            </div>
          </div>

          {live ? (
            <div className="mt-3 flex items-center justify-between text-sky-900/50 px-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider">{t?.('fullForecast') || 'Full forecast'}</span>
              <ChevronRight size={18} className="text-sky-700/40" />
            </div>
          ) : null}
        </button>
      </div>

      <WeatherDetailSheet
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        theme={theme}
        weatherFetchParams={weatherFetchParams}
      />

      <div className={`rounded-xl p-3 border ${theme.isDark ? 'border-slate-700/60 bg-slate-900/40' : 'border-[#EFEFEF] bg-white'} shadow-sm`}>
        <div className="flex items-center justify-between mb-1.5">
          <h3 className={`text-sm font-bold ${theme.textMain}`}>{t?.('weatherSmartTipsTitle') || 'Weather smart tips'}</h3>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${theme.primaryLight} ${theme.primaryText}`}>
              {weatherPackingItems.length} {t?.('weatherItemsLabel') || 'items'}
            </span>
            <button
              type="button"
              onClick={() => setTipsExpanded((v) => !v)}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${
                theme.isDark ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {tipsExpanded ? (t?.('weatherTipsCollapse') || 'Hide') : (t?.('weatherTipsExpand') || 'Show')}
            </button>
          </div>
        </div>
        {tipsExpanded ? (
          <>
            <p className={`text-[11px] ${theme.textSub} mb-2`}>
              {t?.('weatherSmartTipsDesc') || 'Based on UV, humidity, wind, and temperature.'}
            </p>
            {weatherPackingItems.length > 0 ? (
              <div className="space-y-1 mb-2">
                {weatherPackingItems.map((it) => (
                  <div
                    key={it.text}
                    className={`text-[11px] rounded-md px-2 py-1.5 border ${
                      it.critical
                        ? theme.isDark
                          ? 'border-rose-900/60 bg-rose-950/30 text-rose-200'
                          : 'border-rose-200 bg-rose-50 text-rose-700'
                        : theme.isDark
                          ? 'border-slate-700 bg-slate-800/70 text-slate-200'
                          : 'border-slate-200 bg-slate-50 text-slate-700'
                    }`}
                  >
                    {it.critical ? 'Must: ' : 'Tip: '}
                    {it.text}
                  </div>
                ))}
              </div>
            ) : (
              <p className={`text-[11px] ${theme.textSub} mb-2`}>
                {t?.('weatherSmartNoExtra') || 'No extra weather-specific items suggested right now.'}
              </p>
            )}
            <div className="flex gap-2">
              <select
                value={weatherTargetTripId}
                onChange={(e) => setWeatherTargetTripId(e.target.value)}
                disabled={!myTrips.length || weatherAddBusy}
                className="flex-1 px-2.5 py-2 rounded-xl border text-xs bg-white"
              >
                {myTrips.length ? (
                  myTrips.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))
                ) : (
                  <option value="">{t?.('weatherNoTripOption') || 'Create a trip first'}</option>
                )}
              </select>
              <button
                type="button"
                disabled={!weatherTargetTripId || !weatherPackingItems.length || weatherAddBusy}
                onClick={() => {
                  void (async () => {
                    if (!onAddWeatherItems) return;
                    setWeatherAddBusy(true);
                    setWeatherAddMsg('');
                    try {
                      await onAddWeatherItems({
                        scenarioId: weatherTargetTripId,
                        items: weatherPackingItems,
                      });
                      setWeatherAddMsg(t?.('weatherAddOk') || 'Added weather tips to your trip.');
                    } catch (e) {
                      setWeatherAddMsg(e?.message || (t?.('weatherAddFail') || 'Could not add right now.'));
                    } finally {
                      setWeatherAddBusy(false);
                    }
                  })();
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold ${
                  !weatherTargetTripId || !weatherPackingItems.length || weatherAddBusy
                    ? 'bg-slate-200 text-slate-400'
                    : `${theme.primary} text-white`
                }`}
              >
                {t?.('weatherAddBtn') || 'Add to trip'}
              </button>
            </div>
            {weatherAddMsg ? <p className={`text-[11px] mt-2 ${theme.textSub}`}>{weatherAddMsg}</p> : null}
          </>
        ) : null}
      </div>

      <div>
        <div className="flex justify-between items-end mb-4">
          <h2 className={`text-lg font-bold ${theme.textMain}`}>{t?.('myTrips') || 'My Trips'}</h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {(myTrips.length ? myTrips : quickScenarios).slice(0, 4).map((scenario) => {
            const Icon = IconMap[scenario.icon] || IconMap.Briefcase;
            const cardTheme = scenario.theme || { bg: 'bg-white', text: 'text-gray-500' };
            const listKey =
              scenario.access === 'shared'
                ? `shared-${scenario.owner_user_id}-${scenario.id}`
                : scenario.id;
            return (
              <button
                key={listKey}
                type="button"
                onClick={() => onSelect(scenario.id, scenario.owner_user_id ?? null)}
                className="group relative bg-white rounded-[24px] p-5 h-40 flex flex-col justify-between items-start shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.05)] transition-all active:scale-98 text-left border border-transparent hover:border-[#F0F0F0]"
              >
                <div
                  className={`w-12 h-12 rounded-2xl ${cardTheme.bg} ${cardTheme.text} flex items-center justify-center transition-colors`}
                >
                  <Icon size={24} strokeWidth={1.5} />
                </div>
                <div>
                  {scenario.access === 'shared' ? (
                    <p className="text-[10px] font-bold text-sky-600 uppercase tracking-wide mb-0.5">
                      {(t?.('fromUser') || 'From')} @{scenario.owner_username}
                    </p>
                  ) : null}
                  <h3 className={`font-bold ${theme.textMain} text-lg`}>{scenario.name}</h3>
                  <p className={`text-xs ${theme.textSub} mt-1 font-medium`}>{scenario.items.length} items</p>
                </div>

                <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 translate-x-2">
                  <div className="bg-[#F5F5F5] rounded-full p-1.5">
                    <ChevronRight size={14} className="text-[#9A9A9A]" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-end mb-4">
          <h2 className={`text-lg font-bold ${theme.textMain}`}>{t?.('quickScenarios') || 'Quick Scenarios'}</h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {quickScenarios.slice(0, 4).map((scenario) => {
            const Icon = IconMap[scenario.icon] || IconMap.Briefcase;
            const cardTheme = scenario.theme || { bg: 'bg-white', text: 'text-gray-500' };
            const listKey =
              scenario.access === 'shared'
                ? `shared-${scenario.owner_user_id}-${scenario.id}`
                : scenario.id;
            return (
              <button
                key={listKey}
                type="button"
                onClick={() => onSelect(scenario.id, scenario.owner_user_id ?? null)}
                className="group relative bg-white rounded-[24px] p-5 h-40 flex flex-col justify-between items-start shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.05)] transition-all active:scale-98 text-left border border-transparent hover:border-[#F0F0F0]"
              >
                <div
                  className={`w-12 h-12 rounded-2xl ${cardTheme.bg} ${cardTheme.text} flex items-center justify-center transition-colors`}
                >
                  <Icon size={24} strokeWidth={1.5} />
                </div>
                <div>
                  {scenario.access === 'shared' ? (
                    <p className="text-[10px] font-bold text-sky-600 uppercase tracking-wide mb-0.5">
                      {(t?.('fromUser') || 'From')} @{scenario.owner_username}
                    </p>
                  ) : null}
                  <h3 className={`font-bold ${theme.textMain} text-lg`}>{scenario.name}</h3>
                  <p className={`text-xs ${theme.textSub} mt-1 font-medium`}>{scenario.items.length} items</p>
                </div>

                <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 translate-x-2">
                  <div className="bg-[#F5F5F5] rounded-full p-1.5">
                    <ChevronRight size={14} className="text-[#9A9A9A]" />
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
