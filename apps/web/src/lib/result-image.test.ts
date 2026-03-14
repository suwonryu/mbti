import { describe, expect, it } from 'vitest';
import { getCharacterResultImagePath, getShareCardImagePath, normalizeResultImageUrl } from './result-image';

describe('result image helpers', () => {
  it('keeps absolute and root-relative image urls', () => {
    expect(normalizeResultImageUrl('https://cdn.example.com/intj.png')).toBe('https://cdn.example.com/intj.png');
    expect(normalizeResultImageUrl('/images/intj.png')).toBe('/images/intj.png');
  });

  it('normalizes relative asset paths and rejects invalid bare codes', () => {
    expect(normalizeResultImageUrl('images/intj.png')).toBe('/images/intj.png');
    expect(normalizeResultImageUrl('./images/intj.png')).toBe('/images/intj.png');
    expect(normalizeResultImageUrl('INTJ')).toBeNull();
  });

  it('builds generated image paths', () => {
    expect(getCharacterResultImagePath('INTJ')).toBe('/mbti-character/INTJ');
    expect(getShareCardImagePath('abc123')).toBe('/result/abc123/card-image');
  });
});
