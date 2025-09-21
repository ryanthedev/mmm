import { describe, it, expect } from 'vitest';
import { parse, TokenType } from '../src/mmmv2';

describe('Cursor Token Parsing - Phase 1', () => {
  describe('basic cursor parsing', () => {
    it('should parse standalone cursor', () => {
      const tokens = parse('@!');
      expect(tokens).toEqual([
        { type: TokenType.CURSOR, content: '' }
      ]);
    });

    it('should parse cursor at beginning of text', () => {
      const tokens = parse('@!hello world');
      expect(tokens).toEqual([
        { type: TokenType.CURSOR, content: 'h' },
        { type: TokenType.TEXT, content: 'ello world' }
      ]);
    });

    it('should parse cursor at end of text', () => {
      const tokens = parse('hello world@!');
      expect(tokens).toEqual([
        { type: TokenType.TEXT, content: 'hello world' },
        { type: TokenType.CURSOR, content: '' }
      ]);
    });

    it('should parse cursor in middle of text', () => {
      const tokens = parse('hello @!world');
      expect(tokens).toEqual([
        { type: TokenType.TEXT, content: 'hello ' },
        { type: TokenType.CURSOR, content: 'w' },
        { type: TokenType.TEXT, content: 'orld' }
      ]);
    });

    it('should parse multiple cursors', () => {
      const tokens = parse('start @! middle @! end');
      expect(tokens).toEqual([
        { type: TokenType.TEXT, content: 'start ' },
        { type: TokenType.CURSOR, content: ' ' },
        { type: TokenType.TEXT, content: 'middle ' },
        { type: TokenType.CURSOR, content: ' ' },
        { type: TokenType.TEXT, content: 'end' }
      ]);
    });
  });

  describe('cursor with superscript', () => {
    it('should handle cursor followed by superscript', () => {
      const tokens = parse('@!normal^super^');
      expect(tokens).toEqual([
        { type: TokenType.CURSOR, content: 'n' },
        { type: TokenType.TEXT, content: 'ormal' },
        { type: TokenType.SUPERSCRIPT, content: 'super' }
      ]);
    });

    it('should handle superscript followed by cursor', () => {
      const tokens = parse('^super^normal@!');
      expect(tokens).toEqual([
        { type: TokenType.SUPERSCRIPT, content: 'super' },
        { type: TokenType.TEXT, content: 'normal' },
        { type: TokenType.CURSOR, content: '' }
      ]);
    });

    it('should handle cursor between superscripts', () => {
      const tokens = parse('^first^text@!more^second^');
      expect(tokens).toEqual([
        { type: TokenType.SUPERSCRIPT, content: 'first' },
        { type: TokenType.TEXT, content: 'text' },
        { type: TokenType.CURSOR, content: 'm' },
        { type: TokenType.TEXT, content: 'ore' },
        { type: TokenType.SUPERSCRIPT, content: 'second' }
      ]);
    });
  });

  describe('cursor with other inline elements', () => {
    it('should parse cursor with bold text', () => {
      const tokens = parse('**bold** text @!');
      expect(tokens).toEqual([
        { type: TokenType.BOLD, children: [{ type: TokenType.TEXT, content: 'bold' }] },
        { type: TokenType.TEXT, content: ' text ' },
        { type: TokenType.CURSOR, content: '' }
      ]);
    });

    it('should parse cursor with italic text', () => {
      const tokens = parse('*italic* @! text');
      expect(tokens).toEqual([
        { type: TokenType.ITALIC, children: [{ type: TokenType.TEXT, content: 'italic' }] },
        { type: TokenType.TEXT, content: ' ' },
        { type: TokenType.CURSOR, content: ' ' },
        { type: TokenType.TEXT, content: 'text' }
      ]);
    });

    it('should parse cursor with inline code', () => {
      const tokens = parse('`code` @! more');
      expect(tokens).toEqual([
        { type: TokenType.INLINE_CODE, content: 'code' },
        { type: TokenType.TEXT, content: ' ' },
        { type: TokenType.CURSOR, content: ' ' },
        { type: TokenType.TEXT, content: 'more' }
      ]);
    });

    it('should parse cursor with links', () => {
      const tokens = parse('[link](url) @! after');
      expect(tokens).toEqual([
        { 
          type: TokenType.LINK, 
          children: [{ type: TokenType.TEXT, content: 'link' }],
          metadata: { href: 'url', title: '' }
        },
        { type: TokenType.TEXT, content: ' ' },
        { type: TokenType.CURSOR, content: ' ' },
        { type: TokenType.TEXT, content: 'after' }
      ]);
    });

    it('should parse cursor with strikethrough', () => {
      const tokens = parse('~~deleted~~ @! text');
      expect(tokens).toEqual([
        { type: TokenType.STRIKETHROUGH, content: 'deleted' },
        { type: TokenType.TEXT, content: ' ' },
        { type: TokenType.CURSOR, content: ' ' },
        { type: TokenType.TEXT, content: 'text' }
      ]);
    });

    it('should parse cursor with highlight', () => {
      const tokens = parse('==highlighted== @! text');
      expect(tokens).toEqual([
        { type: TokenType.HIGHLIGHT, content: 'highlighted' },
        { type: TokenType.TEXT, content: ' ' },
        { type: TokenType.CURSOR, content: ' ' },
        { type: TokenType.TEXT, content: 'text' }
      ]);
    });
  });

  describe('edge cases', () => {
    it('should handle cursor with no surrounding text', () => {
      const tokens = parse('@!');
      expect(tokens).toEqual([
        { type: TokenType.CURSOR, content: '' }
      ]);
    });

    it('should handle consecutive cursors', () => {
      const tokens = parse('@!@!');
      expect(tokens).toEqual([
        { type: TokenType.CURSOR, content: '@' },
        { type: TokenType.TEXT, content: '!' }
      ]);
    });

    it('should handle cursor with whitespace', () => {
      const tokens = parse('   @!   ');
      expect(tokens).toEqual([
        { type: TokenType.TEXT, content: '   ' },
        { type: TokenType.CURSOR, content: ' ' },
        { type: TokenType.TEXT, content: '  ' }
      ]);
    });

    it('should handle cursor at word boundaries', () => {
      const tokens = parse('word1@!word2');
      expect(tokens).toEqual([
        { type: TokenType.TEXT, content: 'word1' },
        { type: TokenType.CURSOR, content: 'w' },
        { type: TokenType.TEXT, content: 'ord2' }
      ]);
    });
  });
});