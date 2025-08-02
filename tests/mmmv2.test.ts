import { describe, it, expect } from 'vitest';
import { parse } from '../src/mmmv2';

describe('mmmv2', () => {
  describe('parse', () => {

    it('should accept a string parameter', () => {
      expect(() => parse('# Hello World')).not.toThrow();
    });

    it('should handle empty string', () => {
      expect(() => parse('')).not.toThrow();
    });

    it('should handle multiline markdown', () => {
      const markdown = `# Title
      
This is a paragraph.

- List item 1
- List item 2`;
      
      expect(() => parse(markdown)).not.toThrow();
    });
  });
});