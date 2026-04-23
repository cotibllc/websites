export interface Character {
  id: string;
  name: string;
  title: string;
  department: string;
  yearsOfService: string;
  clearanceLevel: string;
  knownFor: string;
  badgeNumber: string;
}

export interface TickerMessage {
  text: string;
  dept: string;
}

export interface PlatformLink {
  id: string;
  label: string;
  url: string;
  handle: string;
}

export type EpisodeStatus = 'FILED' | 'UNDER REVIEW' | 'PENDING ACKNOWLEDGMENT';

export function getEpisodeStatus(index: number): EpisodeStatus {
  if (index === 0) return 'PENDING ACKNOWLEDGMENT';
  if (index <= 3) return 'UNDER REVIEW';
  return 'FILED';
}

// ---------------------------------------------------------------------------
// Characters
// ---------------------------------------------------------------------------

export const characters: Character[] = [
  {
    id: 'chuck-morrison',
    name: 'Chuck Morrison',
    title: 'IT Manager',
    department: 'Information Technology',
    yearsOfService: '18',
    clearanceLevel: 'STANDARD',
    knownFor: 'Has not moved desks in 14 years.',
    badgeNumber: '00847',
  },
  {
    id: 'hr-jill',
    name: 'Jill Farber',
    title: 'People Partner',
    department: 'People & Culture',
    yearsOfService: 'Undisclosed',
    clearanceLevel: 'STANDARD',
    knownFor: 'Replies to complaints with a survey.',
    badgeNumber: '00203',
  },
  {
    id: 'ceo-joe',
    name: 'Joe Harrison',
    title: 'Chief Executive Officer',
    department: 'Leadership',
    yearsOfService: '3',
    clearanceLevel: 'EXECUTIVE',
    knownFor: 'Revenue up 23%. Headcount down 15%.',
    badgeNumber: '00001',
  },
  {
    id: 'dana-chen',
    name: 'Dana Chen',
    title: 'Senior Developer',
    department: 'Information Technology',
    yearsOfService: '6',
    clearanceLevel: 'STANDARD',
    knownFor: 'Answers every question with "it depends."',
    badgeNumber: '00612',
  },
  {
    id: 'carl-dietrich',
    name: 'Carl Dietrich',
    title: 'VP of Operations',
    department: 'Operations',
    yearsOfService: '11',
    clearanceLevel: 'STANDARD',
    knownFor: 'Has been in a 9am–5pm meeting since 2019.',
    badgeNumber: '00318',
  },
];

// ---------------------------------------------------------------------------
// Ticker messages
// ---------------------------------------------------------------------------

export const tickerMessages: TickerMessage[] = [
  {
    text: 'REMINDER: All Vision Alignment Initiative feedback due Friday. No extensions.',
    dept: 'IT DEPT',
  },
  {
    text: 'NOTICE: The printer on Floor 3 is not broken. It has been optimized.',
    dept: 'FACILITIES',
  },
  {
    text: 'UPDATE: Q4 targets have been revised. New targets to follow.',
    dept: 'LEADERSHIP',
  },
  {
    text: 'MEMO: Mandatory fun participation is voluntary. Attendance is required.',
    dept: 'HR',
  },
  {
    text: 'ALERT: Employee of the Month voting is open. Winner announced when decided.',
    dept: 'HR',
  },
  {
    text: 'NOTICE: The budget has been right-sized. Headcount reflects strategic priorities.',
    dept: 'FINANCE',
  },
  {
    text: 'REMINDER: Circle back on all open items. Return date TBD.',
    dept: 'MANAGEMENT',
  },
];

// ---------------------------------------------------------------------------
// Platform links
// ---------------------------------------------------------------------------

export const platformLinks: PlatformLink[] = [
  {
    id: 'youtube',
    label: 'YouTube',
    url: 'https://www.youtube.com/@corphardcore',
    handle: '@corphardcore',
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    url: 'https://www.tiktok.com/@corphardcore',
    handle: '@corphardcore',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    url: 'https://www.instagram.com/corphardcore/',
    handle: '@corphardcore',
  },
  {
    id: 'x',
    label: 'X',
    url: 'https://x.com/corphardcore',
    handle: '@corphardcore',
  },
];

// ---------------------------------------------------------------------------
// Homepage stats
// ---------------------------------------------------------------------------

export const synergyStats = [
  { value: '18 YRS', label: 'Time in service' },
  { value: '4', label: 'Floors Chuck has worked on' },
  { value: '847', label: 'Vision emails received' },
  { value: '0', label: 'Things that changed' },
] as const;
