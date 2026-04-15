import {
  Briefcase, MapPin, Umbrella, Coffee, Camera, Zap, Plus, Check, Home, Grid, Settings,
  ChevronLeft, AlertCircle, Sun, CloudRain, Backpack, Tent, GraduationCap, Heart, Music,
  Dumbbell, Trash2, Clock, Bell, Volume2, ChevronRight, Users, Share2, Smile, X, Lock,
  Mail, ArrowRight, Moon, User, UserPlus, Smartphone, Globe, Palette, Shield, HelpCircle, FileText
} from 'lucide-react';

export const THEMES = {
  cinnamon: {
    name: 'Cinnamon',
    bg: 'bg-[#FFFBF5]',
    cardBg: 'bg-white',
    textMain: 'text-[#5C5C5C]',
    textSub: 'text-[#9A9A9A]',
    primary: 'bg-[#E6B89C]',
    primaryText: 'text-[#C58968]',
    primaryBorder: 'border-[#E6B89C]',
    primaryHover: 'hover:bg-[#E6B89C]/90',
    primaryLight: 'bg-[#FAE8E0]',
    navActive: 'text-[#E6B89C]',
    accentBlue: 'bg-[#D0E6F0] text-[#6B8E9B]',
    accentGreen: 'bg-[#E0F0E3] text-[#7A9E83]',
    accentPink: 'bg-[#F4DCD6] text-[#C08585]',
    accentYellow: 'bg-[#F9EBC8] text-[#B59858]',
    accentPurple: 'bg-[#E8DEF2] text-[#9F8AB5]',
    danger: 'text-[#D98282] bg-[#FADCDC]',
    success: 'bg-[#CCD5AE]',
  },
  hazeBlue: {
    name: 'Haze Blue',
    bg: 'bg-[#F0F4F8]',
    cardBg: 'bg-white',
    textMain: 'text-[#4A5568]',
    textSub: 'text-[#A0AEC0]',
    primary: 'bg-[#90CDF4]',
    primaryText: 'text-[#4299E1]',
    primaryBorder: 'border-[#90CDF4]',
    primaryHover: 'hover:bg-[#90CDF4]/90',
    primaryLight: 'bg-[#EBF8FF]',
    navActive: 'text-[#90CDF4]',
    accentBlue: 'bg-[#D0E6F0] text-[#6B8E9B]',
    accentGreen: 'bg-[#E0F0E3] text-[#7A9E83]',
    accentPink: 'bg-[#F4DCD6] text-[#C08585]',
    accentYellow: 'bg-[#F9EBC8] text-[#B59858]',
    accentPurple: 'bg-[#E8DEF2] text-[#9F8AB5]',
    danger: 'text-[#E53E3E] bg-[#FED7D7]',
    success: 'bg-[#68D391]',
  },
  sageGreen: {
    name: 'Sage Green',
    bg: 'bg-[#F0FFF4]',
    cardBg: 'bg-white',
    textMain: 'text-[#2F855A]',
    textSub: 'text-[#9AE6B4]',
    primary: 'bg-[#9AE6B4]',
    primaryText: 'text-[#48BB78]',
    primaryBorder: 'border-[#9AE6B4]',
    primaryHover: 'hover:bg-[#9AE6B4]/90',
    primaryLight: 'bg-[#F0FFF4]',
    navActive: 'text-[#9AE6B4]',
    accentBlue: 'bg-[#D0E6F0] text-[#6B8E9B]',
    accentGreen: 'bg-[#E0F0E3] text-[#7A9E83]',
    accentPink: 'bg-[#F4DCD6] text-[#C08585]',
    accentYellow: 'bg-[#F9EBC8] text-[#B59858]',
    accentPurple: 'bg-[#E8DEF2] text-[#9F8AB5]',
    danger: 'text-[#E53E3E] bg-[#FED7D7]',
    success: 'bg-[#9AE6B4]',
  },
};

/** Dark UI variants (same keys as THEMES). */
export const THEMES_DARK = {
  cinnamon: {
    name: 'Cinnamon',
    bg: 'bg-[#161311]',
    cardBg: 'bg-[#221F1C]',
    textMain: 'text-[#EDE8E2]',
    textSub: 'text-[#9A928A]',
    primary: 'bg-[#B8896E]',
    primaryText: 'text-[#E8C9B0]',
    primaryBorder: 'border-[#B8896E]',
    primaryHover: 'hover:bg-[#B8896E]/90',
    primaryLight: 'bg-[#2A2420]',
    navActive: 'text-[#E8C9B0]',
    accentBlue: 'bg-[#2C3A42] text-[#9BB8C4]',
    accentGreen: 'bg-[#243028] text-[#8FB89A]',
    accentPink: 'bg-[#3A2826] text-[#D4A09A]',
    accentYellow: 'bg-[#353022] text-[#C9B87A]',
    accentPurple: 'bg-[#302A38] text-[#B5A8C8]',
    danger: 'text-[#F0A0A0] bg-[#3A2424]',
    success: 'bg-[#6B8F5E]',
  },
  hazeBlue: {
    name: 'Haze Blue',
    bg: 'bg-[#121820]',
    cardBg: 'bg-[#1A222E]',
    textMain: 'text-[#E2E8F0]',
    textSub: 'text-[#718096]',
    primary: 'bg-[#4299E1]',
    primaryText: 'text-[#BEE3F8]',
    primaryBorder: 'border-[#4299E1]',
    primaryHover: 'hover:bg-[#4299E1]/90',
    primaryLight: 'bg-[#1E2A3A]',
    navActive: 'text-[#90CDF4]',
    accentBlue: 'bg-[#2C3A42] text-[#9BB8C4]',
    accentGreen: 'bg-[#243028] text-[#8FB89A]',
    accentPink: 'bg-[#3A2826] text-[#D4A09A]',
    accentYellow: 'bg-[#353022] text-[#C9B87A]',
    accentPurple: 'bg-[#302A38] text-[#B5A8C8]',
    danger: 'text-[#FC8181] bg-[#3A2020]',
    success: 'bg-[#48BB78]',
  },
  sageGreen: {
    name: 'Sage Green',
    bg: 'bg-[#0F1812]',
    cardBg: 'bg-[#16241C]',
    textMain: 'text-[#C6F6D5]',
    textSub: 'text-[#68D391]',
    primary: 'bg-[#48BB78]',
    primaryText: 'text-[#9AE6B4]',
    primaryBorder: 'border-[#48BB78]',
    primaryHover: 'hover:bg-[#48BB78]/90',
    primaryLight: 'bg-[#1A2E22]',
    navActive: 'text-[#9AE6B4]',
    accentBlue: 'bg-[#2C3A42] text-[#9BB8C4]',
    accentGreen: 'bg-[#1E3228] text-[#7BC99A]',
    accentPink: 'bg-[#3A2826] text-[#D4A09A]',
    accentYellow: 'bg-[#353022] text-[#C9B87A]',
    accentPurple: 'bg-[#302A38] text-[#B5A8C8]',
    danger: 'text-[#FC8181] bg-[#3A2020]',
    success: 'bg-[#38A169]',
  },
};

export const DEFAULT_APP_PREFS = {
  notifications: true,
  sounds: true,
  auto_location: true,
  dark_mode: false,
  language: 'en',
};

/**
 * @param {string} themeKey
 * @param {boolean} darkMode
 */
export function buildDisplayTheme(themeKey, darkMode) {
  const k = THEMES[themeKey] ? themeKey : 'cinnamon';
  const base = darkMode ? THEMES_DARK[k] || THEMES_DARK.cinnamon : THEMES[k];
  const isDark = !!darkMode;
  return {
    ...base,
    isDark,
    navMuted: isDark
      ? 'text-slate-500 hover:text-slate-300'
      : 'text-[#C0C0C0] hover:text-[#9A9A9A]',
    shell: isDark
      ? 'bg-slate-900/90 backdrop-blur-xl border-t border-slate-600'
      : 'bg-white/90 backdrop-blur-xl border-t border-[#EAEAEA]',
    fabRing: isDark ? 'border-slate-800' : 'border-white',
    sessionMask: isDark ? 'bg-slate-950/90 backdrop-blur-sm' : 'bg-white/85 backdrop-blur-sm',
    sessionSpinner: isDark ? 'border-slate-600 border-t-slate-200' : 'border-gray-200 border-t-gray-800',
  };
}

export const CURRENT_USER = { id: 'me', name: 'Me', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Felix' };

export const INITIAL_SCENARIOS = [
  {
    id: 'school',
    name: 'Go to School',
    icon: 'GraduationCap',
    theme: { bg: 'bg-[#D0E6F0]', text: 'text-[#6B8E9B]' },
    type: 'preset',
    collaborators: [],
    items: [
      { id: 's1', text: 'Student ID', critical: true, assignedTo: 'me' },
      { id: 's2', text: 'Homework/Essay', critical: true, assignedTo: 'me' },
      { id: 's3', text: 'Laptop', critical: false, assignedTo: 'me' },
      { id: 's4', text: 'Charger', critical: false, assignedTo: 'me' },
      { id: 's5', text: 'Water Bottle', critical: false, assignedTo: 'me' },
    ]
  },
  {
    id: 'work',
    name: 'Go to Work',
    icon: 'Briefcase',
    theme: { bg: 'bg-[#E5E5E5]', text: 'text-[#7D7D7D]' },
    type: 'preset',
    collaborators: [],
    items: [
      { id: 'w1', text: 'ID Badge', critical: true, assignedTo: 'me' },
      { id: 'w2', text: 'Smartphone', critical: true, assignedTo: 'me' },
      { id: 'w3', text: 'Laptop & Charger', critical: true, assignedTo: 'me' },
      { id: 'w4', text: 'Earbuds', critical: false, assignedTo: 'me' },
    ]
  },
  {
    id: 'gym',
    name: 'Go to Gym',
    icon: 'Dumbbell',
    theme: { bg: 'bg-[#F4DCD6]', text: 'text-[#C08585]' },
    type: 'preset',
    collaborators: [],
    items: [
      { id: 'g1', text: 'Gym Card', critical: true, assignedTo: 'me' },
      { id: 'g2', text: 'Change of Clothes', critical: false, assignedTo: 'me' },
      { id: 'g3', text: 'Towel', critical: false, assignedTo: 'me' },
      { id: 'g4', text: 'Water Bottle', critical: false, assignedTo: 'me' },
    ]
  },
  {
    id: 'camping',
    name: 'Weekend Camping',
    icon: 'Tent',
    theme: { bg: 'bg-[#F9EBC8]', text: 'text-[#B59858]' },
    type: 'preset',
    collaborators: [],
    items: [
      { id: 'c1', text: 'Tent', critical: true, assignedTo: 'me' },
      { id: 'c2', text: 'Sleeping Bag', critical: true, assignedTo: 'me' },
      { id: 'c3', text: 'Food & Ingredients', critical: true, assignedTo: 'me' },
    ]
  },
  {
    id: 'travel',
    name: 'Short Trip',
    icon: 'MapPin',
    theme: { bg: 'bg-[#E0F0E3]', text: 'text-[#7A9E83]' },
    type: 'preset',
    collaborators: [],
    items: [
      { id: 't1', text: 'ID Card / Passport', critical: true, assignedTo: 'me' },
      { id: 't2', text: 'Tickets', critical: true, assignedTo: 'me' },
      { id: 't3', text: 'Toiletry Bag', critical: false, assignedTo: 'me' },
    ]
  }
];

export const MOCK_HISTORY = [
  { id: 1, name: 'Go to Work', date: 'Today 08:30', status: 'completed' },
  { id: 2, name: 'Go to Gym', date: 'Yesterday 18:45', status: 'completed' },
];

export const IconMap = {
  GraduationCap, Briefcase, Dumbbell, MapPin, Heart,
  Camera, Tent, Music, Backpack, Coffee, Zap
};

/** Used when the weather API is offline or still loading. */
export const WEATHER_FALLBACK = {
  temp: 22,
  condition: 'Unavailable',
  location: '—',
  comfort: '—',
  packingHint: 'Connect to the internet and refresh to load live weather.',
  iconKey: 'cloud',
  isDay: true,
  source: 'system-fallback',
};

/** @deprecated use WEATHER_FALLBACK */
export const WEATHER_DATA = WEATHER_FALLBACK;