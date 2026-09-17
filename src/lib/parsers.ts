import { SocialPosts, ParsedEmail, DistributionAssets, DistributionOutput } from './types';

function exactObject(value: unknown, keys: string[]): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    && Object.keys(value).length === keys.length
    && keys.every(key => Object.prototype.hasOwnProperty.call(value, key));
}

function textFields(value: unknown, keys: string[]): boolean {
  return exactObject(value, keys) && keys.every(key => typeof value[key] === 'string' && value[key].trim().length > 0);
}

export function isDistributionAssets(value: unknown): value is DistributionAssets {
  return exactObject(value, ['property_page', 'agent_email', 'youtube_description', 'google_business_post'])
    && textFields(value.property_page, ['headline', 'summary', 'seo_title', 'meta_description'])
    && textFields(value.agent_email, ['subject', 'body'])
    && typeof value.youtube_description === 'string' && value.youtube_description.trim().length > 0
    && typeof value.google_business_post === 'string' && value.google_business_post.trim().length > 0;
}

// Fail closed: no partial JSON, markdown fences, unknown keys, or raw-text fallback.
export function parseDistributionOutput(raw: string): DistributionOutput {
  try {
    const assets: unknown = JSON.parse(raw);
    if (isDistributionAssets(assets)) return { status: 'success', assets };
  } catch { /* Return a fixed message; never echo an untrusted model response. */ }
  return { status: 'error', message: 'Distribution output was invalid. Regenerate distribution to try again.' };
}

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
