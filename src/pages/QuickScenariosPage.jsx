import React, { useMemo, useState } from 'react';
import { ChevronRight, Plus } from 'lucide-react';
import { IconMap } from '../constants/data';

const QUICK_TEMPLATES = {
  common: [
    { name: 'Daily commute', icon: 'Briefcase', items: [{ text: 'Wallet', critical: true }, { text: 'Phone', critical: true }, { text: 'Keys', critical: true }, { text: 'Water bottle', critical: false }] },
    { name: 'Weekend short trip', icon: 'MapPin', items: [{ text: 'ID / Passport', critical: true }, { text: 'Tickets', critical: true }, { text: 'Toiletry bag', critical: false }, { text: 'Power bank', critical: false }] },
    { name: 'Cafe work session', icon: 'Coffee', items: [{ text: 'Laptop', critical: true }, { text: 'Charger', critical: true }, { text: 'Earbuds', critical: false }, { text: 'Notebook', critical: false }] },
    { name: 'Rainy day outing', icon: 'Zap', items: [{ text: 'Umbrella', critical: true }, { text: 'Waterproof pouch', critical: false }, { text: 'Spare socks', critical: false }] },
    { name: 'Airport checklist', icon: 'Backpack', items: [{ text: 'Passport', critical: true }, { text: 'Boarding pass', critical: true }, { text: 'Luggage tags', critical: false }, { text: 'Travel adapter', critical: false }] },
    { name: 'Office meeting day', icon: 'Briefcase', items: [{ text: 'Meeting notes', critical: true }, { text: 'Laptop', critical: true }, { text: 'Charger', critical: true }, { text: 'Business cards', critical: false }] },
    { name: 'Doctor appointment', icon: 'Heart', items: [{ text: 'ID card', critical: true }, { text: 'Insurance card', critical: true }, { text: 'Medical records', critical: false }, { text: 'Water bottle', critical: false }] },
    { name: 'Co-working day', icon: 'Coffee', items: [{ text: 'Laptop', critical: true }, { text: 'Mouse', critical: false }, { text: 'Notebook', critical: false }, { text: 'Power bank', critical: false }] },
    { name: 'Quick business trip', icon: 'Briefcase', items: [{ text: 'Work laptop', critical: true }, { text: 'Travel documents', critical: true }, { text: 'Formal shirt', critical: false }, { text: 'Toiletries', critical: false }] },
    { name: 'Concert night', icon: 'Music', items: [{ text: 'Ticket QR code', critical: true }, { text: 'ID card', critical: true }, { text: 'Earplugs', critical: false }, { text: 'Portable charger', critical: false }] },
  ],
  sports: [
    { name: 'Gym training', icon: 'Dumbbell', items: [{ text: 'Gym card', critical: true }, { text: 'Training clothes', critical: true }, { text: 'Towel', critical: false }, { text: 'Water bottle', critical: false }] },
    { name: 'Running', icon: 'Zap', items: [{ text: 'Running shoes', critical: true }, { text: 'Sports watch', critical: false }, { text: 'Sweat towel', critical: false }] },
    { name: 'Swimming', icon: 'Heart', items: [{ text: 'Swimsuit', critical: true }, { text: 'Goggles', critical: true }, { text: 'Flip-flops', critical: false }, { text: 'Hair dryer', critical: false }] },
    { name: 'Hiking', icon: 'Tent', items: [{ text: 'Hiking shoes', critical: true }, { text: 'Trail map', critical: true }, { text: 'Energy bars', critical: false }, { text: 'First-aid kit', critical: false }] },
    { name: 'Cycling', icon: 'MapPin', items: [{ text: 'Helmet', critical: true }, { text: 'Repair kit', critical: false }, { text: 'Bike lock', critical: false }, { text: 'Hydration flask', critical: false }] },
    { name: 'Basketball game', icon: 'Dumbbell', items: [{ text: 'Basketball shoes', critical: true }, { text: 'Jersey', critical: false }, { text: 'Knee support', critical: false }, { text: 'Water bottle', critical: false }] },
    { name: 'Badminton session', icon: 'Dumbbell', items: [{ text: 'Racket', critical: true }, { text: 'Shuttlecocks', critical: true }, { text: 'Sports shoes', critical: true }, { text: 'Towel', critical: false }] },
    { name: 'Yoga class', icon: 'Heart', items: [{ text: 'Yoga mat', critical: true }, { text: 'Stretch band', critical: false }, { text: 'Water bottle', critical: false }, { text: 'Small towel', critical: false }] },
    { name: 'Soccer practice', icon: 'Dumbbell', items: [{ text: 'Soccer boots', critical: true }, { text: 'Shin guards', critical: true }, { text: 'Training shirt', critical: false }, { text: 'Energy snack', critical: false }] },
    { name: 'Tennis day', icon: 'Dumbbell', items: [{ text: 'Tennis racket', critical: true }, { text: 'Tennis balls', critical: true }, { text: 'Cap', critical: false }, { text: 'Grip tape', critical: false }] },
  ],
  outing: [
    { name: 'Beach day', icon: 'Camera', items: [{ text: 'Sunscreen', critical: true }, { text: 'Beach towel', critical: true }, { text: 'Flip-flops', critical: false }, { text: 'Sunglasses', critical: false }] },
    { name: 'City walk', icon: 'MapPin', items: [{ text: 'Transit card', critical: true }, { text: 'Comfort shoes', critical: true }, { text: 'Water bottle', critical: false }] },
    { name: 'Shopping day', icon: 'Briefcase', items: [{ text: 'Wallet', critical: true }, { text: 'Reusable bag', critical: false }, { text: 'Shopping list', critical: false }] },
    { name: 'Photo outing', icon: 'Camera', items: [{ text: 'Camera body', critical: true }, { text: 'Memory card', critical: true }, { text: 'Extra battery', critical: false }, { text: 'Lens cloth', critical: false }] },
    { name: 'Picnic', icon: 'Heart', items: [{ text: 'Picnic mat', critical: true }, { text: 'Snacks', critical: true }, { text: 'Wet wipes', critical: false }, { text: 'Trash bags', critical: false }] },
    { name: 'Museum day', icon: 'Camera', items: [{ text: 'Entry ticket', critical: true }, { text: 'ID card', critical: true }, { text: 'Headphones', critical: false }, { text: 'Light jacket', critical: false }] },
    { name: 'Theme park day', icon: 'Zap', items: [{ text: 'Park ticket', critical: true }, { text: 'Portable charger', critical: true }, { text: 'Rain poncho', critical: false }, { text: 'Snacks', critical: false }] },
    { name: 'Road trip', icon: 'MapPin', items: [{ text: 'Driver license', critical: true }, { text: 'Car documents', critical: true }, { text: 'Phone mount', critical: false }, { text: 'Emergency kit', critical: false }] },
    { name: 'Night market walk', icon: 'Coffee', items: [{ text: 'Cash / e-wallet', critical: true }, { text: 'Wet tissues', critical: false }, { text: 'Portable fan', critical: false }, { text: 'Crossbody bag', critical: false }] },
    { name: 'Date night', icon: 'Heart', items: [{ text: 'Reservation details', critical: true }, { text: 'Wallet', critical: true }, { text: 'Light perfume', critical: false }, { text: 'Power bank', critical: false }] },
  ],
  family: [
    { name: 'Parent-child park', icon: 'Heart', items: [{ text: 'Kids water bottle', critical: true }, { text: 'Change clothes', critical: true }, { text: 'Snacks', critical: false }, { text: 'Wet wipes', critical: false }] },
    { name: 'Family road trip', icon: 'MapPin', items: [{ text: 'ID documents', critical: true }, { text: 'Car seat', critical: true }, { text: 'Medicine kit', critical: false }, { text: 'Toys', critical: false }] },
    { name: 'School event day', icon: 'GraduationCap', items: [{ text: 'Notice paper', critical: true }, { text: 'School badge', critical: true }, { text: 'Backup mask', critical: false }] },
    { name: 'Baby outing', icon: 'Backpack', items: [{ text: 'Diapers', critical: true }, { text: 'Milk bottle', critical: true }, { text: 'Baby wipes', critical: true }, { text: 'Spare clothes', critical: false }] },
    { name: 'Family camping', icon: 'Tent', items: [{ text: 'Tent', critical: true }, { text: 'Sleeping bags', critical: true }, { text: 'Kids flashlights', critical: false }, { text: 'Bug spray', critical: false }] },
    { name: 'Family beach day', icon: 'MapPin', items: [{ text: 'Sunscreen', critical: true }, { text: 'Kids hats', critical: true }, { text: 'Beach toys', critical: false }, { text: 'Spare clothes', critical: false }] },
    { name: 'Kids birthday party', icon: 'Music', items: [{ text: 'Gift', critical: true }, { text: 'Invitation card', critical: true }, { text: 'Camera', critical: false }, { text: 'Wet wipes', critical: false }] },
    { name: 'Family grocery run', icon: 'Briefcase', items: [{ text: 'Shopping list', critical: true }, { text: 'Reusable bags', critical: true }, { text: 'Cooler bag', critical: false }, { text: 'Coupons', critical: false }] },
    { name: 'Weekend grandparents visit', icon: 'Heart', items: [{ text: 'Snacks / fruits', critical: true }, { text: 'Family meds', critical: false }, { text: 'Kids toys', critical: false }, { text: 'Phone charger', critical: false }] },
    { name: 'Parent-teacher meeting', icon: 'GraduationCap', items: [{ text: 'Meeting notice', critical: true }, { text: 'Notebook', critical: false }, { text: 'Questions list', critical: false }, { text: 'Student records', critical: false }] },
  ],
  study: [
    { name: 'School day', icon: 'GraduationCap', items: [{ text: 'Student ID', critical: true }, { text: 'Homework', critical: true }, { text: 'Laptop', critical: false }, { text: 'Charger', critical: false }] },
    { name: 'Library study', icon: 'Book', items: [{ text: 'Laptop/Tablet', critical: true }, { text: 'Earbuds', critical: false }, { text: 'Notebook', critical: false }, { text: 'Pen case', critical: false }] },
    { name: 'Exam day', icon: 'GraduationCap', items: [{ text: 'Admission ticket', critical: true }, { text: 'ID card', critical: true }, { text: 'Pens', critical: true }, { text: 'Water', critical: false }] },
    { name: 'Group presentation', icon: 'Briefcase', items: [{ text: 'Slides backup', critical: true }, { text: 'Pointer', critical: false }, { text: 'HDMI adapter', critical: false }] },
    { name: 'Language class', icon: 'Music', items: [{ text: 'Workbook', critical: true }, { text: 'Vocabulary cards', critical: false }, { text: 'Tablet', critical: false }] },
    { name: 'Coding bootcamp', icon: 'Briefcase', items: [{ text: 'Laptop', critical: true }, { text: 'Charger', critical: true }, { text: 'Git account access', critical: false }, { text: 'Notebook', critical: false }] },
    { name: 'Online class setup', icon: 'Backpack', items: [{ text: 'Laptop', critical: true }, { text: 'Headset', critical: true }, { text: 'Webcam check', critical: false }, { text: 'Quiet room setup', critical: false }] },
    { name: 'Art class', icon: 'Camera', items: [{ text: 'Sketchbook', critical: true }, { text: 'Pencils', critical: true }, { text: 'Eraser', critical: false }, { text: 'Color set', critical: false }] },
    { name: 'Science lab day', icon: 'Zap', items: [{ text: 'Lab coat', critical: true }, { text: 'Safety goggles', critical: true }, { text: 'Lab notebook', critical: true }, { text: 'Calculator', critical: false }] },
    { name: 'Research interview day', icon: 'Briefcase', items: [{ text: 'Questionnaire', critical: true }, { text: 'Voice recorder', critical: true }, { text: 'Consent forms', critical: true }, { text: 'Spare batteries', critical: false }] },
  ],
};

const CATEGORY_META = [
  { id: 'common', label: 'Common' },
  { id: 'sports', label: 'Sports' },
  { id: 'outing', label: 'Outing' },
  { id: 'family', label: 'Family' },
  { id: 'study', label: 'Study' },
];

const QuickScenariosPage = ({ scenarios, onCreateFromTemplate, theme, t }) => {
  const quickScenarios = useMemo(
    () => scenarios.filter((s) => s.type !== 'custom' && !s.archived),
    [scenarios],
  );
  const [activeCategory, setActiveCategory] = useState('common');
  const selectedTemplates = QUICK_TEMPLATES[activeCategory] || [];

  const categoryLabel = (id, fallback) =>
    t?.(`quickCategory${id[0].toUpperCase()}${id.slice(1)}`) || fallback;

  return (
    <div className="p-6 pb-28 space-y-5 animate-fade-in">
      <div className="mt-4">
        <h1 className={`text-2xl font-bold ${theme.textMain}`}>
          {t?.('quickScenarios') || 'Quick Scenarios'}
        </h1>
        <p className={`text-xs mt-1 ${theme.textSub}`}>
          {t?.('quickScenariosHint') || 'Open a preset packing list and start quickly.'}
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {CATEGORY_META.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap ${
              activeCategory === cat.id
                ? `${theme.primaryLight} ${theme.primaryText}`
                : theme.isDark
                  ? 'bg-slate-800 text-slate-300'
                  : 'bg-slate-100 text-slate-600'
            }`}
          >
            {categoryLabel(cat.id, cat.label)}
          </button>
        ))}
      </div>

      {selectedTemplates.length ? (
        <div className="grid grid-cols-2 gap-4">
          {selectedTemplates.map((tpl, idx) => {
            const scenario = {
              ...tpl,
              id: `tpl-${activeCategory}-${idx}`,
              theme: tpl.theme || { bg: 'bg-[#F5F5F5]', text: 'text-[#9A9A9A]' },
              items: tpl.items || [],
            };
            const Icon = IconMap[scenario.icon] || IconMap.Briefcase;
            const cardTheme = scenario.theme || { bg: 'bg-white', text: 'text-gray-500' };
            const listKey = scenario.id;
            return (
              <button
                key={listKey}
                type="button"
                onClick={() => {
                  void onCreateFromTemplate?.(scenario);
                }}
                className="group relative bg-white rounded-[24px] p-5 h-40 flex flex-col justify-between items-start shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.05)] transition-all active:scale-98 text-left border border-transparent hover:border-[#F0F0F0]"
              >
                <div
                  className={`w-12 h-12 rounded-2xl ${cardTheme.bg} ${cardTheme.text} flex items-center justify-center transition-colors`}
                >
                  <Icon size={24} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className={`font-bold ${theme.textMain} text-lg`}>{scenario.name}</h3>
                  <p className={`text-xs ${theme.textSub} mt-1 font-medium`}>
                    {scenario.items.length} items · {t?.('quickUseTemplate') || 'Use template'}
                  </p>
                </div>

                <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 translate-x-2">
                  <div className="bg-[#F5F5F5] rounded-full p-1.5">
                    <Plus size={14} className="text-[#9A9A9A]" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div
          className={`rounded-2xl border px-4 py-6 text-center ${
            theme.isDark ? 'border-slate-700/70 bg-slate-900/40' : 'border-[#EFEFEF] bg-white'
          }`}
        >
          <p className={`text-sm font-semibold ${theme.textMain}`}>
            {t?.('quickScenariosEmpty') || 'No quick scenarios right now'}
          </p>
        </div>
      )}

    </div>
  );
};

export default QuickScenariosPage;
