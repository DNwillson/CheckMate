import React, { useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Clock3 } from 'lucide-react';

const WEEK_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getMonthMatrix(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells = [];
  for (let i = 0; i < 42; i += 1) {
    const relative = i - firstDay + 1;
    if (relative <= 0) {
      cells.push({ day: daysInPrevMonth + relative, currentMonth: false });
    } else if (relative > daysInMonth) {
      cells.push({ day: relative - daysInMonth, currentMonth: false });
    } else {
      cells.push({ day: relative, currentMonth: true });
    }
  }
  return cells;
}

const CalendarPage = ({
  scenarios,
  onSelect,
  onUpdateScenarioSchedule,
  onCreateTripAtDate,
  language = 'en',
  theme,
  t,
}) => {
  const [cursor, setCursor] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState(() => new Date().getDate());
  const [quickDate, setQuickDate] = useState(null);
  const [quickBusyId, setQuickBusyId] = useState('');
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [rescheduleValue, setRescheduleValue] = useState('');
  const [rescheduleBusy, setRescheduleBusy] = useState(false);
  const pressTimerRef = useRef(null);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const locale = language === 'zh' ? 'zh-CN' : 'en-US';
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const monthCells = useMemo(() => getMonthMatrix(year, month), [year, month]);
  const monthTitle = useMemo(
    () => cursor.toLocaleDateString(locale, { year: 'numeric', month: 'long' }),
    [cursor, locale],
  );
  const scheduledScenarios = useMemo(
    () =>
      (Array.isArray(scenarios) ? scenarios : []).filter(
        (s) => !s.archived && s.trip_start_at && !Number.isNaN(new Date(s.trip_start_at).getTime()),
      ),
    [scenarios],
  );
  const selectedDateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
  const selectedDayScenarios = useMemo(
    () =>
      scheduledScenarios.filter((s) => {
        const d = new Date(s.trip_start_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        return key === selectedDateKey;
      }),
    [scheduledScenarios, selectedDateKey],
  );
  const assignableTrips = useMemo(
    () => (Array.isArray(scenarios) ? scenarios : []).filter((s) => s.access !== 'shared' && !s.archived),
    [scenarios],
  );

  const longPressMs = 550;
  const now = new Date();

  return (
    <div className="p-6 pb-28 space-y-5 animate-fade-in">
      <div className="mt-4">
        <h1 className={`text-2xl font-bold ${theme.textMain}`}>{t?.('navCalendar') || 'Calendar'}</h1>
        <p className={`text-xs mt-1 ${theme.textSub}`}>
          {t?.('calendarHint') || 'Use calendar view to plan your trips by date.'}
        </p>
      </div>

      <div
        className={`rounded-[28px] p-4 border shadow-sm ${
          theme.isDark ? 'border-slate-700/70 bg-slate-900/50' : 'border-[#ECECEC] bg-white'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => setCursor(new Date(year, month - 1, 1))}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              theme.isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            <ChevronLeft size={18} />
          </button>
          <h2 className={`text-base font-bold ${theme.textMain}`}>{monthTitle}</h2>
          <button
            type="button"
            onClick={() => setCursor(new Date(year, month + 1, 1))}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              theme.isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2">
          {WEEK_LABELS.map((d) => (
            <div key={d} className={`text-[11px] text-center font-bold ${theme.textSub}`}>
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {monthCells.map((cell, idx) => {
            const selected = cell.currentMonth && cell.day === selectedDay;
            const isToday = isCurrentMonth && cell.currentMonth && cell.day === today.getDate();
            const dayHasTrip =
              cell.currentMonth &&
              scheduledScenarios.some((s) => {
                const d = new Date(s.trip_start_at);
                return d.getFullYear() === year && d.getMonth() === month && d.getDate() === cell.day;
              });
            return (
              <button
                type="button"
                key={`${cell.day}-${idx}`}
                disabled={!cell.currentMonth}
                onMouseDown={() => {
                  if (!cell.currentMonth) return;
                  const timeout = setTimeout(() => {
                    setQuickDate({ year, month, day: cell.day });
                  }, longPressMs);
                  pressTimerRef.current = timeout;
                }}
                onMouseUp={() => {
                  if (pressTimerRef.current) {
                    clearTimeout(pressTimerRef.current);
                    pressTimerRef.current = null;
                  }
                }}
                onMouseLeave={() => {
                  if (pressTimerRef.current) {
                    clearTimeout(pressTimerRef.current);
                    pressTimerRef.current = null;
                  }
                }}
                onTouchStart={() => {
                  if (!cell.currentMonth) return;
                  const timeout = setTimeout(() => {
                    setQuickDate({ year, month, day: cell.day });
                  }, longPressMs);
                  pressTimerRef.current = timeout;
                }}
                onTouchEnd={() => {
                  if (pressTimerRef.current) {
                    clearTimeout(pressTimerRef.current);
                    pressTimerRef.current = null;
                  }
                }}
                onClick={() => {
                  if (!cell.currentMonth) return;
                  setSelectedDay(cell.day);
                }}
                className={`h-10 rounded-xl text-sm font-semibold transition-colors ${
                  !cell.currentMonth
                    ? 'text-slate-300 cursor-default'
                    : selected
                      ? `${theme.primary} text-white shadow-sm`
                      : isToday
                        ? `${theme.primaryLight} ${theme.primaryText}`
                        : `${theme.textMain} hover:bg-slate-100`
                }`}
              >
                <span>{cell.day}</span>
                {dayHasTrip ? (
                  <span className={`block w-1.5 h-1.5 rounded-full mx-auto mt-0.5 ${selected ? 'bg-white/90' : theme.primary}`} />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div
        className={`rounded-[24px] p-4 border shadow-sm ${
          theme.isDark ? 'border-slate-700/70 bg-slate-900/45' : 'border-[#ECECEC] bg-white'
        }`}
      >
        <h3 className={`text-sm font-bold ${theme.textMain}`}>
          {(t?.('calendarSelectedDateLabel') || 'Selected date')}: {year}-{String(month + 1).padStart(2, '0')}-
          {String(selectedDay).padStart(2, '0')}
        </h3>
        <p className={`text-xs mt-1 ${theme.textSub}`}>
          {(t?.('calendarTripCount') || 'Scheduled trips')}: {scheduledScenarios.length}
        </p>
        <div className="mt-3 space-y-2">
          {selectedDayScenarios.length ? (
            selectedDayScenarios.map((s) => (
              <div
                key={s.id}
                className={`w-full text-left px-3 py-2.5 rounded-2xl border ${
                  theme.isDark ? 'border-slate-700 bg-slate-900/55' : 'border-slate-200 bg-slate-50/80'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onSelect?.(s.id, s.owner_user_id ?? null)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <p className={`text-sm font-bold truncate ${theme.textMain}`}>{s.name}</p>
                    <p className={`text-[11px] mt-0.5 ${theme.textSub}`}>
                      {new Date(s.trip_start_at).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </button>
                  {s.access !== 'shared' ? (
                    <button
                      type="button"
                      onClick={() => {
                        setRescheduleTarget(s);
                        setRescheduleValue(s.trip_start_at ? String(s.trip_start_at).slice(0, 16) : '');
                      }}
                      className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                        theme.isDark
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                          : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                      aria-label={t?.('calendarRescheduleBtn') || 'Change time'}
                      title={t?.('calendarRescheduleBtn') || 'Change time'}
                    >
                      <Clock3 size={13} />
                    </button>
                  ) : null}
                </div>
              </div>
            ))
          ) : (
            <p className={`text-xs ${theme.textSub}`}>
              {t?.('calendarNoTrips') || 'No scheduled trips on this date.'}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            const createDate = new Date(year, month, selectedDay, 9, 0, 0, 0);
            const isTodaySelected =
              year === now.getFullYear() &&
              month === now.getMonth() &&
              selectedDay === now.getDate();
            if (isTodaySelected) {
              // For today, avoid defaulting to a time that has already passed.
              const safeNow = new Date(now.getTime() + 5 * 60 * 1000);
              createDate.setHours(safeNow.getHours(), safeNow.getMinutes(), 0, 0);
            }
            if (createDate < now) {
              window.alert(t?.('tripPastDateBlocked') || 'You cannot create a trip in the past.');
              return;
            }
            onCreateTripAtDate?.(createDate.toISOString());
          }}
          className={`w-full mt-3 py-3 rounded-2xl text-sm font-bold text-white shadow-sm ${theme.primary}`}
        >
          {t?.('calendarCreateTripOnDate') || 'Create trip on this date'}
        </button>
      </div>

      {quickDate ? (
        <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/45 p-0 sm:p-6 sm:items-center">
          <div
            className={`${theme.cardBg} w-full sm:max-w-md rounded-t-[28px] sm:rounded-3xl p-5 shadow-2xl border-t sm:border ${
              theme.isDark ? 'border-slate-600' : 'border-[#F0F0F0]'
            } max-h-[78vh] overflow-y-auto`}
          >
            <h3 className={`text-base font-bold ${theme.textMain}`}>
              {t?.('calendarQuickAssignTitle') || 'Quick assign date'}
            </h3>
            <p className={`text-xs mt-1 ${theme.textSub}`}>
              {(t?.('calendarQuickAssignHint') || 'Long press date selected')}: {quickDate.year}-
              {String(quickDate.month + 1).padStart(2, '0')}-{String(quickDate.day).padStart(2, '0')}
            </p>

            <div className="mt-3 space-y-2">
              {assignableTrips.length ? (
                assignableTrips.map((trip) => (
                  <button
                    key={`${trip.owner_user_id ?? 'me'}-${trip.id}`}
                    type="button"
                    disabled={quickBusyId === trip.id}
                    onClick={() => {
                      const prev = trip.trip_start_at ? new Date(trip.trip_start_at) : null;
                      const hour = prev ? prev.getHours() : 9;
                      const minute = prev ? prev.getMinutes() : 0;
                      const nextStart = new Date(
                        quickDate.year,
                        quickDate.month,
                        quickDate.day,
                        hour,
                        minute,
                        0,
                        0,
                      );
                      if (nextStart < now) {
                        window.alert(t?.('tripPastDateBlocked') || 'You cannot create a trip in the past.');
                        return;
                      }
                      const prevEnd = trip.trip_end_at ? new Date(trip.trip_end_at) : null;
                      let nextEndIso = trip.trip_end_at || null;
                      if (prevEnd && prev && prevEnd < prev) nextEndIso = null;
                      setQuickBusyId(trip.id);
                      void (async () => {
                        try {
                          await onUpdateScenarioSchedule?.(trip.id, {
                            trip_start_at: nextStart.toISOString(),
                            trip_end_at: nextEndIso,
                          });
                          setQuickDate(null);
                        } finally {
                          setQuickBusyId('');
                        }
                      })();
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl border ${
                      theme.isDark ? 'border-slate-700 bg-slate-900/50' : 'border-slate-200 bg-slate-50'
                    } disabled:opacity-50`}
                  >
                    <p className={`text-sm font-bold ${theme.textMain}`}>{trip.name}</p>
                    <p className={`text-[11px] mt-0.5 ${theme.textSub}`}>
                      {trip.trip_start_at
                        ? `${t?.('tripScheduledTag') || 'Scheduled'} · ${new Date(trip.trip_start_at).toLocaleString(locale)}`
                        : t?.('calendarNoDateYet') || 'No date yet'}
                    </p>
                  </button>
                ))
              ) : (
                <p className={`text-xs ${theme.textSub}`}>
                  {t?.('calendarNoAssignableTrips') || 'No editable trips available.'}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => setQuickDate(null)}
              className={`w-full mt-4 py-2.5 rounded-xl text-sm font-bold ${
                theme.isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {t?.('close') || 'Close'}
            </button>
          </div>
        </div>
      ) : null}

      {rescheduleTarget ? (
        <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/45 p-0 sm:p-6 sm:items-center">
          <div
            className={`${theme.cardBg} w-full sm:max-w-sm rounded-t-[28px] sm:rounded-3xl p-5 shadow-2xl border-t sm:border ${
              theme.isDark ? 'border-slate-600' : 'border-[#F0F0F0]'
            }`}
          >
            <h3 className={`text-base font-bold ${theme.textMain}`}>
              {t?.('calendarRescheduleTitle') || 'Change trip time'}
            </h3>
            <p className={`text-xs mt-1 ${theme.textSub}`}>{rescheduleTarget.name}</p>
            <input
              type="datetime-local"
              lang={locale}
              value={rescheduleValue}
              onChange={(e) => setRescheduleValue(e.target.value)}
              className={`w-full mt-3 px-3 py-2.5 rounded-xl text-sm outline-none border ${
                theme.isDark ? 'bg-slate-900 border-slate-600 text-slate-100' : 'border-gray-200 bg-white'
              }`}
            />
            <div className="flex gap-2 mt-4">
              <button
                type="button"
                disabled={rescheduleBusy}
                onClick={() => setRescheduleTarget(null)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold ${
                  theme.isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {t?.('cancel') || 'Cancel'}
              </button>
              <button
                type="button"
                disabled={rescheduleBusy || !rescheduleValue}
                onClick={() => {
                  if (!rescheduleValue || new Date(rescheduleValue) < now) {
                    window.alert(t?.('tripPastDateBlocked') || 'You cannot create a trip in the past.');
                    return;
                  }
                  setRescheduleBusy(true);
                  void (async () => {
                    try {
                      await onUpdateScenarioSchedule?.(rescheduleTarget.id, {
                        trip_start_at: rescheduleValue,
                      });
                      setRescheduleTarget(null);
                    } finally {
                      setRescheduleBusy(false);
                    }
                  })();
                }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white ${theme.primary} disabled:opacity-50`}
              >
                {rescheduleBusy ? (t?.('saving') || 'Saving…') : (t?.('save') || 'Save')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default CalendarPage;
