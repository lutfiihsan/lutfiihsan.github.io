import { slugify } from './format';

export const EMPTY_SKILL_ITEM = { name: '', icon: '', img: '', style: '', learning: false };
export const EMPTY_SKILL_CATEGORY = { category: '', icon: 'fas fa-code', items: [] };

export const EMPTY_PROJECT = {
  title: '',
  id: '',
  image: '',
  images: [],
  status: 'Online',
  statusClass: 'status-online',
  desc: '',
  fullDesc: '',
  tech: [],
  year: new Date().getFullYear().toString(),
  type: '',
  viewLink: '',
  codeLink: null,
};

export const EMPTY_EXPERIENCE = {
  company: '',
  role: '',
  period: '',
  location: '',
  employmentType: '',
  tech: [],
  align: 'left',
  tasks: [],
  isGrouped: false,
  roles: [],
};

export const EMPTY_ROLE = { title: '', period: '', tasks: [] };

export const EMPTY_CERT = { name: '', issuer: '', date: '', id: '' };
export const EMPTY_AWARD = { title: '', issuer: '', date: '', icon: 'fas fa-award', color: '#0066ff', description: '' };
export const EMPTY_REPO = { name: '', description: '', language: '', languageColor: '#f1e05a', stars: 0, forks: 0, url: '' };

export function linesToArray(text) {
  return text.split('\n').map((s) => s.trim()).filter(Boolean);
}

export function arrayToLines(arr) {
  return (arr || []).join('\n');
}

export function csvToArray(text) {
  return text.split(',').map((s) => s.trim()).filter(Boolean);
}

export function arrayToCsv(arr) {
  return (arr || []).join(', ');
}

export function defaultPortfolio() {
  return {
    skills: [],
    projects: [],
    experience: [],
    certifications: [],
    awards: [],
    githubRepos: [],
  };
}

export function normalizePortfolio(raw) {
  const data = { ...defaultPortfolio(), ...raw };
  delete data._meta;
  return data;
}

export function projectIdFromTitle(title) {
  return slugify(title);
}
