import { SocialPosts, ParsedEmail } from './types';

export function parseSocialOutput(raw: string): SocialPosts {
  // Primary: split on delimiter
  const parts = raw.split(/---PLATFORM_BREAK---/i).map(s => s.trim()).filter(Boolean);
  if (parts.length >= 3) {
    return { instagram: parts[0], facebook: parts[1], linkedin: parts[2] };
  }

  // Fallback: split on platform headers
  const sections = raw.split(/\n(?=(?:instagram|facebook|linkedin)\b)/i).map(s => s.trim()).filter(Boolean);
  if (sections.length >= 3) {
    const strip = (s: string) => s.replace(/^(?:instagram|facebook|linkedin)[:\s]*\n?/i, '').trim();
    return { instagram: strip(sections[0]), facebook: strip(sections[1]), linkedin: strip(sections[2]) };
  }

  // Final fallback
  return { instagram: raw.trim(), facebook: '', linkedin: '' };
}

export function parseEmailOutput(raw: string): ParsedEmail {
  const subjectMatch = raw.match(/^SUBJECT:\s*(.+)/im);
  if (subjectMatch) {
    const subject = subjectMatch[1].trim();
    const separatorIdx = raw.indexOf('---', subjectMatch.index! + subjectMatch[0].length);
    const body = separatorIdx !== -1
      ? raw.slice(separatorIdx + 3).trim()
      : raw.slice(subjectMatch.index! + subjectMatch[0].length).trim();
    return { subject, body };
  }
  const lines = raw.trim().split('\n');
  return { subject: lines[0] || 'New Listing', body: lines.slice(1).join('\n').trim() };
}
