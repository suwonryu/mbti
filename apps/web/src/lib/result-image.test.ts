import { describe, expect, it } from 'vitest';
import { getFallbackResultImagePath, normalizeResultImageUrl } from './result-image';

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

  it('builds fallback card image paths from share tokens', () => {
    expect(getFallbackResultImagePath('abc123')).toBe('/result/abc123/card-image');
  });
});
