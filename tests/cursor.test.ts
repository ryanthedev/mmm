import { describe, it, expect } from 'vitest';
import { parse, TokenType } from '../src/index';

describe('Cursor Token Parsing - Phase 1', () => {
  describe('basic cursor parsing', () => {
    it('should parse standalone cursor', () => {
      const tokens = parse('@!');
      expect(tokens).toEqual([
        { type: TokenType.CURSOR }
      ]);
    });

    it('should parse cursor at beginning of text', () => {
      const tokens = parse('@!hello world');
      expect(tokens).toEqual([
        { type: TokenType.CURSOR },
        { type: TokenType.TEXT, content: 'hello world' }
      ]);
    });

    it('should parse cursor at end of text', () => {
      const tokens = parse('hello world@!');
      expect(tokens).toEqual([
        { type: TokenType.TEXT, content: 'hello world' },
        { type: TokenType.CURSOR }
      ]);
    });

    it('should parse cursor in middle of text', () => {
      const tokens = parse('hello @!world');
      expect(tokens).toEqual([
        { type: TokenType.TEXT, content: 'hello ' },
        { type: TokenType.CURSOR },
        { type: TokenType.TEXT, content: 'world' }
      ]);
    });

    it('should parse multiple cursors', () => {
      const tokens = parse('start @! middle @! end');
      expect(tokens).toEqual([
        { type: TokenType.TEXT, content: 'start ' },
        { type: TokenType.CURSOR },
        { type: TokenType.TEXT, content: ' middle ' },
        { type: TokenType.CURSOR },
        { type: TokenType.TEXT, content: ' end' }
      ]);
    });
  });

  describe('cursor with superscript', () => {
    it('should handle cursor followed by superscript', () => {
      const tokens = parse('@!normal^super^');
      expect(tokens).toEqual([
        { type: TokenType.CURSOR },
        { type: TokenType.TEXT, content: 'normal' },
        { type: TokenType.SUPERSCRIPT, content: 'super' }
      ]);
    });

    it('should handle superscript followed by cursor', () => {
      const tokens = parse('^super^normal@!');
      expect(tokens).toEqual([
        { type: TokenType.SUPERSCRIPT, content: 'super' },
        { type: TokenType.TEXT, content: 'normal' },
        { type: TokenType.CURSOR }
      ]);
    });

    it('should handle cursor between superscripts', () => {
      const tokens = parse('^first^text@!more^second^');
      expect(tokens).toEqual([
        { type: TokenType.SUPERSCRIPT, content: 'first' },
        { type: TokenType.TEXT, content: 'text' },
        { type: TokenType.CURSOR },
        { type: TokenType.TEXT, content: 'more' },
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
        { type: TokenType.CURSOR }
      ]);
    });

    it('should parse cursor with italic text', () => {
      const tokens = parse('*italic* @! text');
      expect(tokens).toEqual([
        { type: TokenType.ITALIC, children: [{ type: TokenType.TEXT, content: 'italic' }] },
        { type: TokenType.TEXT, content: ' ' },
        { type: TokenType.CURSOR },
        { type: TokenType.TEXT, content: ' text' }
      ]);
    });

    it('should parse cursor with inline code', () => {
      const tokens = parse('`code` @! more');
      expect(tokens).toEqual([
        { type: TokenType.INLINE_CODE, content: 'code' },
        { type: TokenType.TEXT, content: ' ' },
        { type: TokenType.CURSOR },
        { type: TokenType.TEXT, content: ' more' }
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
        { type: TokenType.CURSOR },
        { type: TokenType.TEXT, content: ' after' }
      ]);
    });

    it('should parse cursor with strikethrough', () => {
      const tokens = parse('~~deleted~~ @! text');
      expect(tokens).toEqual([
        { type: TokenType.STRIKETHROUGH, content: 'deleted' },
        { type: TokenType.TEXT, content: ' ' },
        { type: TokenType.CURSOR },
        { type: TokenType.TEXT, content: ' text' }
      ]);
    });

    it('should parse cursor with highlight', () => {
      const tokens = parse('==highlighted== @! text');
      expect(tokens).toEqual([
        { type: TokenType.HIGHLIGHT, content: 'highlighted' },
        { type: TokenType.TEXT, content: ' ' },
        { type: TokenType.CURSOR },
        { type: TokenType.TEXT, content: ' text' }
      ]);
    });
  });

  describe('edge cases', () => {
    it('should handle cursor with no surrounding text', () => {
      const tokens = parse('@!');
      expect(tokens).toEqual([
        { type: TokenType.CURSOR }
      ]);
    });

    it('should handle consecutive cursors', () => {
      const tokens = parse('@!@!');
      expect(tokens).toEqual([
        { type: TokenType.CURSOR },
        { type: TokenType.TEXT, content: '@!' }
      ]);
    });

    it('should handle cursor with whitespace', () => {
      const tokens = parse('   @!   ');
      expect(tokens).toEqual([
        { type: TokenType.TEXT, content: '   ' },
        { type: TokenType.CURSOR },
        { type: TokenType.TEXT, content: '   ' }
      ]);
    });

    it('should handle cursor at word boundaries', () => {
      const tokens = parse('word1@!word2');
      expect(tokens).toEqual([
        { type: TokenType.TEXT, content: 'word1' },
        { type: TokenType.CURSOR },
        { type: TokenType.TEXT, content: 'word2' }
      ]);
    });
  });

  describe('cursor inside complex tokens', () => {
    it('should handle cursor inside inline code', () => {
      const tokens = parse('`co@!de`');
      expect(tokens).toEqual([
        {
          type: TokenType.INLINE_CODE,
          children: [
            { type: TokenType.TEXT, content: 'co' },
            { type: TokenType.CURSOR },
            { type: TokenType.TEXT, content: 'de' }
          ]
        }
      ]);
    });

    it('should handle cursor inside strikethrough', () => {
      const tokens = parse('~~str@!ike~~');
      expect(tokens).toEqual([
        {
          type: TokenType.STRIKETHROUGH,
          children: [
            { type: TokenType.TEXT, content: 'str' },
            { type: TokenType.CURSOR },
            { type: TokenType.TEXT, content: 'ike' }
          ]
        }
      ]);
    });

    it('should handle cursor inside highlight', () => {
      const tokens = parse('==hi@!gh==');
      expect(tokens).toEqual([
        {
          type: TokenType.HIGHLIGHT,
          children: [
            { type: TokenType.TEXT, content: 'hi' },
            { type: TokenType.CURSOR },
            { type: TokenType.TEXT, content: 'gh' }
          ]
        }
      ]);
    });

    it('should handle cursor inside subscript', () => {
      const tokens = parse('~sub@!script~');
      expect(tokens).toEqual([
        {
          type: TokenType.SUBSCRIPT,
          children: [
            { type: TokenType.TEXT, content: 'sub' },
            { type: TokenType.CURSOR },
            { type: TokenType.TEXT, content: 'script' }
          ]
        }
      ]);
    });

    it('should handle cursor inside superscript', () => {
      const tokens = parse('^sup@!er^');
      expect(tokens).toEqual([
        {
          type: TokenType.SUPERSCRIPT,
          children: [
            { type: TokenType.TEXT, content: 'sup' },
            { type: TokenType.CURSOR },
            { type: TokenType.TEXT, content: 'er' }
          ]
        }
      ]);
    });

    it('should handle cursor inside link text', () => {
      const tokens = parse('[li@!nk](url)');
      expect(tokens).toEqual([
        {
          type: TokenType.LINK,
          children: [
            { type: TokenType.TEXT, content: 'li' },
            { type: TokenType.CURSOR },
            { type: TokenType.TEXT, content: 'nk' }
          ],
          metadata: { title: '', href: 'url' }
        }
      ]);
    });

    it('should handle cursor inside link URL', () => {
      const tokens = parse('[link](ur@!l)');
      expect(tokens).toEqual([
        {
          type: TokenType.LINK,
          children: [{ type: TokenType.TEXT, content: 'link' }],
          metadata: {
            title: '',
            hrefTokens: [
              { type: TokenType.TEXT, content: 'ur' },
              { type: TokenType.CURSOR },
              { type: TokenType.TEXT, content: 'l' }
            ]
          }
        }
      ]);
    });

    it('should handle cursor inside autolink', () => {
      const tokens = parse('<http://ex@!ample.com>');
      expect(tokens).toEqual([
        {
          type: TokenType.LINK,
          children: [
            { type: TokenType.TEXT, content: 'http://ex' },
            { type: TokenType.CURSOR },
            { type: TokenType.TEXT, content: 'ample.com' }
          ],
          metadata: {
            hrefTokens: [
              { type: TokenType.TEXT, content: 'http://ex' },
              { type: TokenType.CURSOR },
              { type: TokenType.TEXT, content: 'ample.com' }
            ]
          }
        }
      ]);
    });

    it('should handle cursor inside image alt text', () => {
      const tokens = parse('![al@!t](img.jpg)');
      expect(tokens).toEqual([
        {
          type: TokenType.IMAGE,
          children: [
            { type: TokenType.TEXT, content: 'al' },
            { type: TokenType.CURSOR },
            { type: TokenType.TEXT, content: 't' }
          ],
          metadata: { src: 'img.jpg', title: '' }
        }
      ]);
    });

    it('should handle cursor with emoji shortcodes', () => {
      const tokens = parse(':sm@!ile:');
      expect(tokens).toEqual([
        { type: TokenType.TEXT, content: ':sm' },
        { type: TokenType.CURSOR },
        { type: TokenType.TEXT, content: 'ile:' }
      ]);
    });

    it('should handle cursor with footnotes', () => {
      const tokens = parse('[^foo@!tnote]');
      expect(tokens).toEqual([
        { type: TokenType.TEXT, content: '[^foo' },
        { type: TokenType.CURSOR },
        { type: TokenType.TEXT, content: 'tnote]' }
      ]);
    });
  });
});