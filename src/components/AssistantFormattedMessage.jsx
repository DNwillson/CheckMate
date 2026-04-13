import React, { useMemo } from 'react';

function sectionKind(raw) {
  const s = raw.replace(/^\*+/, '').replace(/\*+$/, '').trim().toLowerCase();
  if (s === 'critical items') return 'critical';
  if (s === 'normal items') return 'normal';
  if (s === 'tips') return 'tips';
  if (s === 'follow-up') return 'followup';
  return null;
}

/**
 * Renders assistant text with Checklist-style sections:
 * Trip note, Critical Items, Normal Items, optional Tips / Follow-up, and "- " bullets.
 */
export default function AssistantFormattedMessage({ text, theme }) {
  const splitOffline = text.split(/\n\n— Offline fallback/i);
  const main = splitOffline[0] || text;
  const offlineNote = splitOffline.length > 1 ? `— Offline fallback${splitOffline[1]}` : null;

  const rendered = useMemo(() => {
    const lines = main.split('\n');
    const out = [];
    let section = null;

    for (let idx = 0; idx < lines.length; idx++) {
      const line = lines[idx];
      const trimmed = line.trim();
      if (trimmed === '') {
        out.push(<div key={idx} className="h-2" aria-hidden />);
        continue;
      }
      if (/^trip note:/i.test(trimmed)) {
        section = 'tripnote';
        out.push(
          <p
            key={idx}
            className={`text-xs font-medium ${theme.textSub} border-b border-gray-200/90 pb-2 mb-1`}
          >
            {trimmed}
          </p>,
        );
        continue;
      }
      const sk = sectionKind(line);
      if (sk) {
        section = sk;
        const label = trimmed.replace(/^\*+/, '').replace(/\*+$/, '').trim();
        const titleClass =
          sk === 'critical'
            ? 'text-[#D98282]'
            : sk === 'followup'
              ? 'text-indigo-600'
              : 'text-[#A0A0A0]';
        out.push(
          <p
            key={idx}
            className={`text-[11px] font-bold uppercase tracking-wider mt-3 first:mt-0 mb-1.5 ${titleClass}`}
          >
            {label}
          </p>,
        );
        continue;
      }
      if (/^[-•]\s/.test(trimmed)) {
        const isFollowupBullet = section === 'followup';
        out.push(
          <p
            key={idx}
            className={`text-[13px] leading-snug pl-2.5 ml-0.5 border-l-2 py-0.5 ${
              isFollowupBullet
                ? 'text-indigo-950/90 border-indigo-200 bg-indigo-50/50 rounded-r-lg'
                : 'text-gray-800 border-gray-200'
            }`}
          >
            {trimmed}
          </p>,
        );
        continue;
      }
      out.push(
        <p key={idx} className="text-[13px] leading-snug text-gray-800 py-0.5">
          {line}
        </p>,
      );
    }
    return out;
  }, [main, theme.textSub]);

  return (
    <div className="text-left">
      <div className="space-y-0.5">{rendered}</div>
      {offlineNote ? (
        <p className="text-[11px] text-amber-900/80 mt-3 pt-2 border-t border-amber-200/60 leading-snug">
          {offlineNote.trim()}
        </p>
      ) : null}
    </div>
  );
}
