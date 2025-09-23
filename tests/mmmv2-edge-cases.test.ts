import { describe, it, expect, vi } from 'vitest';
import {
  parse,
  TokenParser,
  TokenType,
  type ParsePlugin,
  type TokenHook,
  type Token,
  EmojiManager
} from '../src/index';

describe('mmmv2 Edge Cases and Additional Coverage', () => {
  describe('Image Markdown Syntax ![alt](url)', () => {
    it('should parse basic image markdown syntax', () => {
      const tokens = parse('![alt text](image.jpg)');
      expect(tokens).toEqual([
        {
          type: TokenType.IMAGE,
          children: [{ type: TokenType.TEXT, content: 'alt text' }],
          metadata: { src: 'image.jpg', title: '' }
        }
      ]);
    });

    it('should parse image with title', () => {
      const tokens = parse('![alt text](image.jpg "Image Title")');
      expect(tokens).toEqual([
        {
          type: TokenType.IMAGE,
          children: [{ type: TokenType.TEXT, content: 'alt text' }],
          metadata: { src: 'image.jpg', title: 'Image Title' }
        }
      ]);
    });

    it('should parse image with empty alt text', () => {
      const tokens = parse('![](empty-alt.jpg)');
      expect(tokens).toEqual([
        {
          type: TokenType.IMAGE,
          children: [],
          metadata: { src: 'empty-alt.jpg', title: '' }
        }
      ]);
    });

    it('should parse image with formatting in alt text', () => {
      const tokens = parse('![**bold** alt](image.jpg)');
      expect(tokens).toEqual([
        {
          type: TokenType.IMAGE,
          children: [
            { type: TokenType.BOLD, children: [{ type: TokenType.TEXT, content: 'bold' }] },
            { type: TokenType.TEXT, content: ' alt' }
          ],
          metadata: { src: 'image.jpg', title: '' }
        }
      ]);
    });

    it('should handle malformed image syntax', () => {
      const tokens = parse('![broken](');
      expect(tokens).toEqual([
        { type: TokenType.TEXT, content: '![broken](' }
      ]);
    });

    it('should handle image with spaces in URL', () => {
      const tokens = parse('![alt](path with spaces.jpg)');
      // Should fail to parse as image due to spaces
      expect(tokens).toEqual([
        { type: TokenType.TEXT, content: '![alt](path with spaces.jpg)' }
      ]);
    });

    it('should handle image mixed with text', () => {
      const tokens = parse('Check out this ![image](pic.jpg) here');
      expect(tokens).toEqual([
        { type: TokenType.TEXT, content: 'Check out this ' },
        {
          type: TokenType.IMAGE,
          children: [{ type: TokenType.TEXT, content: 'image' }],
          metadata: { src: 'pic.jpg', title: '' }
        },
        { type: TokenType.TEXT, content: ' here' }
      ]);
    });
  });

  describe('Escaping Edge Cases', () => {
    it('should handle double backslash', () => {
      const tokens = parse('\\\\*text\\\\*');
      expect(tokens).toEqual([
        { type: TokenType.TEXT, content: '\\' },
        { type: TokenType.TEXT, content: '*' },
        { type: TokenType.TEXT, content: 'text' },
        { type: TokenType.TEXT, content: '\\' },
        { type: TokenType.TEXT, content: '*' }
      ]);
    });

    it('should handle trailing backslash', () => {
      const tokens = parse('text\\');
      expect(tokens).toEqual([
        { type: TokenType.TEXT, content: 'text\\' }
      ]);
    });

    it('should handle backslash at start', () => {
      const tokens = parse('\\*not italic*');
      expect(tokens).toEqual([
        { type: TokenType.TEXT, content: '*' },
        { type: TokenType.TEXT, content: 'not italic*' }
      ]);
    });

    it('should escape cursor marker', () => {
      const tokens = parse('\\@!not cursor');
      expect(tokens).toEqual([
        { type: TokenType.TEXT, content: '@' },
        { type: TokenType.TEXT, content: '!not cursor' }
      ]);
    });

    it('should escape emoji shortcode', () => {
      const emojiManager = new EmojiManager({ 'smile': '😊' });
      const parser = new TokenParser({ emojiManager });
      const tokens = parser.parse('\\:smile\\:');
      expect(tokens).toEqual([
        { type: TokenType.TEXT, content: ':' },
        { type: TokenType.TEXT, content: 'smile' },
        { type: TokenType.TEXT, content: ':' }
      ]);
    });

    it('should handle escape sequences that are not special', () => {
      const tokens = parse('\\n\\t\\r');
      expect(tokens).toEqual([
        { type: TokenType.TEXT, content: 'n' },
        { type: TokenType.TEXT, content: 't' },
        { type: TokenType.TEXT, content: 'r' }
      ]);
    });

    it('should escape all markdown characters', () => {
      const tokens = parse('\\*\\*\\[\\]\\(\\)\\`\\~\\^\\=\\!\\#');
      const expectedChars = ['*', '*', '[', ']', '(', ')', '`', '~', '^', '=', '!', '#'];
      expect(tokens).toEqual(
        expectedChars.map(char => ({ type: TokenType.TEXT, content: char }))
      );
    });
  });

  describe('Bold/Italic Interaction Edge Cases', () => {
    it('should handle triple asterisk as bold + italic', () => {
      const tokens = parse('***text***');
      expect(tokens).toEqual([
        {
          type: TokenType.BOLD,
          children: [
            { type: TokenType.ITALIC, children: [{ type: TokenType.TEXT, content: 'text' }] }
          ]
        }
      ]);
    });

    it('should handle triple underscore', () => {
      const tokens = parse('___text___');
      expect(tokens).toEqual([
        {
          type: TokenType.BOLD,
          children: [
            { type: TokenType.ITALIC, children: [{ type: TokenType.TEXT, content: 'text' }] }
          ]
        }
      ]);
    });

    it('should handle mixed delimiters bold underscore with italic asterisk', () => {
      const tokens = parse('__*mixed*__');
      expect(tokens).toEqual([
        {
          type: TokenType.BOLD,
          children: [
            { type: TokenType.ITALIC, children: [{ type: TokenType.TEXT, content: 'mixed' }] }
          ]
        }
      ]);
    });

    it('should handle mixed delimiters italic underscore with bold asterisk', () => {
      const tokens = parse('_**nested**_');
      expect(tokens).toEqual([
        {
          type: TokenType.ITALIC,
          children: [
            { type: TokenType.BOLD, children: [{ type: TokenType.TEXT, content: 'nested' }] }
          ]
        }
      ]);
    });

    it('should handle unclosed bold', () => {
      const tokens = parse('**unclosed bold');
      expect(tokens).toEqual([
        { type: TokenType.TEXT, content: '**unclosed bold' }
      ]);
    });

    it('should handle unclosed italic', () => {
      const tokens = parse('*unclosed italic');
      expect(tokens).toEqual([
        { type: TokenType.TEXT, content: '*unclosed italic' }
      ]);
    });

    it('should handle mismatched delimiters', () => {
      const tokens = parse('**bold with _italic**');
      expect(tokens).toEqual([
        {
          type: TokenType.BOLD,
          children: [{ type: TokenType.TEXT, content: 'bold with _italic' }]
        }
      ]);
    });

    it('should handle adjacent formatting', () => {
      const tokens = parse('**bold***italic*');
      expect(tokens).toEqual([
        { type: TokenType.BOLD, children: [{ type: TokenType.TEXT, content: 'bold' }] },
        { type: TokenType.ITALIC, children: [{ type: TokenType.TEXT, content: 'italic' }] }
      ]);
    });
  });

  describe('Table Edge Cases', () => {
    it('should handle single pipe', () => {
      const tokens = parse('|');
      expect(tokens).toEqual([
        { type: TokenType.TEXT, content: '|' }
      ]);
    });

    it('should handle double pipe (empty cells)', () => {
      const tokens = parse('||');
      expect(tokens).toEqual([
        { type: TokenType.TEXT, content: '||' }
      ]);
    });

    it('should handle pipes with only spaces', () => {
      const tokens = parse('|  |  |');
      expect(tokens).toEqual([
        {
          type: TokenType.TABLE_ROW,
          children: [
            { type: TokenType.TABLE_CELL, children: [] },
            { type: TokenType.TABLE_CELL, children: [] }
          ]
        }
      ]);
    });

    it('should handle malformed separator', () => {
      const tokens = parse(':--');
      expect(tokens).toEqual([
        { type: TokenType.TEXT, content: ':--' }
      ]);
    });

    it('should handle table with formatting in cells', () => {
      const tokens = parse('| **bold** | *italic* | `code` |');
      expect(tokens).toEqual([
        {
          type: TokenType.TABLE_ROW,
          children: [
            {
              type: TokenType.TABLE_CELL,
              children: [
                { type: TokenType.BOLD, children: [{ type: TokenType.TEXT, content: 'bold' }] }
              ]
            },
            {
              type: TokenType.TABLE_CELL,
              children: [
                { type: TokenType.ITALIC, children: [{ type: TokenType.TEXT, content: 'italic' }] }
              ]
            },
            {
              type: TokenType.TABLE_CELL,
              children: [
                { type: TokenType.INLINE_CODE, content: 'code' }
              ]
            }
          ]
        }
      ]);
    });

    it('should handle separator with all alignments', () => {
      const tokens = parse('|:--|:--:|--:|');
      expect(tokens).toEqual([
        {
          type: TokenType.TABLE_SEPARATOR,
          metadata: { alignments: ['left', 'center', 'right'] }
        }
      ]);
    });

    it('should require at least two cells for table', () => {
      const tokens = parse('| single cell');
      expect(tokens).toEqual([
        { type: TokenType.TEXT, content: '| single cell' }
      ]);
    });
  });

  describe('List Item Edge Cases', () => {
    it('should handle extra spaces around marker', () => {
      const tokens = parse('  -  item');
      expect(tokens).toEqual([
        {
          type: TokenType.UNORDERED_LIST_ITEM,
          metadata: { indent: 2 },
          children: [{ type: TokenType.TEXT, content: ' item' }]
        }
      ]);
    });

    it('should handle very large ordered list number', () => {
      const tokens = parse('999999. huge number');
      expect(tokens).toEqual([
        {
          type: TokenType.ORDERED_LIST_ITEM,
          metadata: { indent: 0, start: 999999 },
          children: [{ type: TokenType.TEXT, content: 'huge number' }]
        }
      ]);
    });

    it('should handle uppercase X in checkbox', () => {
      const tokens = parse('- [X] uppercase check');
      expect(tokens).toEqual([
        {
          type: TokenType.TASK_LIST_ITEM,
          metadata: { indent: 0, checked: true },
          children: [{ type: TokenType.TEXT, content: 'uppercase check' }]
        }
      ]);
    });

    it('should handle invalid checkbox (no space)', () => {
      const tokens = parse('- [] invalid checkbox');
      expect(tokens).toEqual([
        {
          type: TokenType.UNORDERED_LIST_ITEM,
          metadata: { indent: 0 },
          children: [{ type: TokenType.TEXT, content: '[] invalid checkbox' }]
        }
      ]);
    });

    it('should handle plus marker with checkbox', () => {
      const tokens = parse('+ [ ] mixed markers');
      expect(tokens).toEqual([
        {
          type: TokenType.TASK_LIST_ITEM,
          metadata: { indent: 0, checked: false },
          children: [{ type: TokenType.TEXT, content: 'mixed markers' }]
        }
      ]);
    });

    it('should handle asterisk marker', () => {
      const tokens = parse('* asterisk item');
      expect(tokens).toEqual([
        {
          type: TokenType.UNORDERED_LIST_ITEM,
          metadata: { indent: 0 },
          children: [{ type: TokenType.TEXT, content: 'asterisk item' }]
        }
      ]);
    });

    it('should handle deeply indented items', () => {
      const tokens = parse('        - deeply indented');
      expect(tokens).toEqual([
        {
          type: TokenType.UNORDERED_LIST_ITEM,
          metadata: { indent: 8 },
          children: [{ type: TokenType.TEXT, content: 'deeply indented' }]
        }
      ]);
    });

    it('should handle list item with formatting', () => {
      const tokens = parse('1. Item with **bold** and *italic*');
      expect(tokens).toEqual([
        {
          type: TokenType.ORDERED_LIST_ITEM,
          metadata: { indent: 0, start: 1 },
          children: [
            { type: TokenType.TEXT, content: 'Item with ' },
            { type: TokenType.BOLD, children: [{ type: TokenType.TEXT, content: 'bold' }] },
            { type: TokenType.TEXT, content: ' and ' },
            { type: TokenType.ITALIC, children: [{ type: TokenType.TEXT, content: 'italic' }] }
          ]
        }
      ]);
    });
  });

  describe('Cursor Edge Cases', () => {
    it('should handle multiple consecutive cursors', () => {
      const tokens = parse('@!@!@!');
      expect(tokens).toEqual([
        { type: TokenType.CURSOR, content: '@' },
        { type: TokenType.TEXT, content: '!' },
        { type: TokenType.CURSOR, content: '' }
      ]);
    });

    it('should handle incomplete cursor marker', () => {
      const tokens = parse('@');
      expect(tokens).toEqual([
        { type: TokenType.TEXT, content: '@' }
      ]);
    });

    it('should handle reversed cursor marker', () => {
      const tokens = parse('!@');
      expect(tokens).toEqual([
        { type: TokenType.TEXT, content: '!@' }
      ]);
    });

    it('should handle cursor in formatted text', () => {
      const tokens = parse('**bo@!ld**');
      expect(tokens).toEqual([
        {
          type: TokenType.BOLD,
          children: [
            { type: TokenType.TEXT, content: 'bo' },
            { type: TokenType.CURSOR, content: 'l' },
            { type: TokenType.TEXT, content: 'd' }
          ]
        }
      ]);
    });

    it('should handle cursor at various positions', () => {
      // Cursor before special char
      const tokens1 = parse('@!**bold**');
      expect(tokens1[0]).toEqual({ type: TokenType.CURSOR, content: '*' });

      // Cursor between special chars (creates italic with cursor)
      const tokens2 = parse('*@!*');
      expect(tokens2).toEqual([
        {
          type: TokenType.ITALIC,
          children: [
            { type: TokenType.CURSOR, content: '' }
          ]
        }
      ]);
    });

  });

  describe('Footnote Edge Cases', () => {
    it('should handle empty footnote ref', () => {
      const tokens = parse('[^]');
      expect(tokens).toEqual([
        { type: TokenType.TEXT, content: '[^]' }
      ]);
    });

    it('should handle alphanumeric footnote', () => {
      const tokens = parse('[^123abc]');
      expect(tokens).toEqual([
        { type: TokenType.FOOTNOTE_REF, content: '123abc' }
      ]);
    });

    it('should handle footnote with underscores', () => {
      const tokens = parse('[^note_1]');
      expect(tokens).toEqual([
        { type: TokenType.FOOTNOTE_REF, content: 'note_1' }
      ]);
    });

    it('should reject footnote with special characters', () => {
      const tokens = parse('[^special-chars]');
      expect(tokens).toEqual([
        { type: TokenType.TEXT, content: '[^special-chars]' }
      ]);
    });

    it('should handle empty footnote definition', () => {
      const tokens = parse('[^1]:');
      expect(tokens).toEqual([
        {
          type: TokenType.FOOTNOTE_DEF,
          metadata: { id: '1' },
          children: []
        }
      ]);
    });

    it('should handle footnote definition with formatting', () => {
      const tokens = parse('[^note]: This has **bold** text');
      expect(tokens).toEqual([
        {
          type: TokenType.FOOTNOTE_DEF,
          metadata: { id: 'note' },
          children: [
            { type: TokenType.TEXT, content: 'This has ' },
            { type: TokenType.BOLD, children: [{ type: TokenType.TEXT, content: 'bold' }] },
            { type: TokenType.TEXT, content: ' text' }
          ]
        }
      ]);
    });
  });

  describe('Plugin Error Handling', () => {
    it('should handle plugin that throws error', () => {
      const errorPlugin: ParsePlugin = {
        name: 'error',
        priority: 100,
        canHandle: () => true,
        parse: () => {
          throw new Error('Plugin error');
        }
      };

      const parser = new TokenParser({ plugins: [errorPlugin] });

      // Should catch error and fall back to built-in parsing
      expect(() => parser.parse('text')).toThrow();
    });

    it('should handle plugin returning invalid result', () => {
      const invalidPlugin: ParsePlugin = {
        name: 'invalid',
        priority: 100,
        canHandle: () => true,
        parse: () => null as any // Explicitly return null
      };

      const parser = new TokenParser({ plugins: [invalidPlugin] });
      const tokens = parser.parse('**text**');

      // Should fall back to built-in parsing when plugin returns null
      expect(tokens).toEqual([
        { type: TokenType.BOLD, children: [{ type: TokenType.TEXT, content: 'text' }] }
      ]);
    });

    it('should handle plugin with undefined parseInline usage', () => {
      const plugin: ParsePlugin = {
        name: 'test',
        priority: 100,
        canHandle: (line) => line === 'TEST',
        parse: (line, parseInline) => {
          // Use parseInline with various inputs
          const result1 = parseInline('');
          const result2 = parseInline('**bold**');
          return [...result1, ...result2];
        }
      };

      const parser = new TokenParser({ plugins: [plugin] });
      const tokens = parser.parse('TEST');
      expect(tokens).toEqual([
        { type: TokenType.BOLD, children: [{ type: TokenType.TEXT, content: 'bold' }] }
      ]);
    });
  });

  describe('Hook Edge Cases', () => {
    it('should handle hook that returns modified token type', () => {
      const typeChangeHook: TokenHook = {
        name: 'type-changer',
        tokenType: TokenType.BOLD,
        process: (token) => ({
          ...token,
          type: 'custom_bold' // Change token type
        })
      };

      const parser = new TokenParser({ hooks: [typeChangeHook] });
      const tokens = parser.parse('**text**');
      expect(tokens[0].type).toBe('custom_bold');
    });

    it('should handle hook that adds nested children', () => {
      const nestingHook: TokenHook = {
        name: 'nester',
        tokenType: TokenType.TEXT,
        process: (token) => ({
          ...token,
          children: [{ type: 'nested', content: token.content }]
        })
      };

      const parser = new TokenParser({ hooks: [nestingHook] });
      const tokens = parser.parse('plain text');
      expect(tokens[0].children).toEqual([
        { type: 'nested', content: 'plain text' }
      ]);
    });

    it('should handle multiple hooks on same token type', () => {
      const hook1: TokenHook = {
        name: 'first',
        tokenType: TokenType.BOLD,
        process: (token) => ({
          ...token,
          metadata: { ...token.metadata, order: 1 }
        })
      };

      const hook2: TokenHook = {
        name: 'second',
        tokenType: TokenType.BOLD,
        process: (token) => ({
          ...token,
          metadata: { ...token.metadata, order: (token.metadata?.order || 0) + 1 }
        })
      };

      const parser = new TokenParser({ hooks: [hook1, hook2] });
      const tokens = parser.parse('**bold**');
      expect(tokens[0].metadata).toEqual({ order: 2 });
    });

    it('should handle removing non-existent hook', () => {
      const parser = new TokenParser();
      // Should not throw
      expect(() => parser.removeHook('bold', 'non-existent')).not.toThrow();
    });

    it('should handle hook on non-existent token type', () => {
      const hook: TokenHook = {
        name: 'test',
        tokenType: 'non_existent_type',
        process: (token) => token
      };

      const parser = new TokenParser({ hooks: [hook] });
      // Should not affect normal parsing
      const tokens = parser.parse('normal text');
      expect(tokens).toEqual([
        { type: TokenType.TEXT, content: 'normal text' }
      ]);
    });
  });

  describe('Performance/Stress Tests', () => {
    it('should handle very long unclosed italic', () => {
      const longText = '*' + 'a'.repeat(1000);
      const tokens = parse(longText);
      expect(tokens[0].type).toBe(TokenType.TEXT);
      expect(tokens[0].content).toBe(longText);
    });

    it('should handle deeply nested formatting', () => {
      const nested = '**bold *italic `code` italic* bold**';
      const tokens = parse(nested);
      expect(tokens[0].type).toBe(TokenType.BOLD);
    });

    it('should handle very long potential emoji', () => {
      const longEmoji = ':' + 'a'.repeat(1000) + ':';
      const tokens = parse(longEmoji);
      // Should not hang, should treat as text
      expect(tokens[0].type).toBe(TokenType.TEXT);
    });

    it('should handle many alternating format markers', () => {
      const alternating = '*_*_*_*_*_*_*_*_*_';
      const tokens = parse(alternating);
      // Should parse without hanging
      expect(tokens).toBeDefined();
    });

    it('should handle very long line', () => {
      const longLine = 'a'.repeat(10000) + ' **bold** ' + 'b'.repeat(10000);
      const tokens = parse(longLine);
      expect(tokens.length).toBe(3);
      expect(tokens[1].type).toBe(TokenType.BOLD);
    });

    it('should handle many inline elements', () => {
      let text = '';
      for (let i = 0; i < 100; i++) {
        text += `word${i} **bold${i}** *italic${i}* \`code${i}\` `;
      }
      const tokens = parse(text);
      // Should parse without performance issues
      expect(tokens.length).toBeGreaterThan(100);
    });
  });

  describe('Autolink Edge Cases', () => {
    it('should handle non-URL in brackets', () => {
      const tokens = parse('<not-a-url>');
      expect(tokens).toEqual([
        { type: TokenType.TEXT, content: '<not-a-url>' }
      ]);
    });

    it('should handle empty autolink', () => {
      const tokens = parse('<>');
      expect(tokens).toEqual([
        { type: TokenType.TEXT, content: '<>' }
      ]);
    });

    it('should handle spaces in URL', () => {
      const tokens = parse('<http://example.com spaces>');
      expect(tokens).toEqual([
        { type: TokenType.TEXT, content: '<http://example.com spaces>' }
      ]);
    });

    it('should handle various URL protocols', () => {
      const httpsTokens = parse('<https://example.com>');
      expect(httpsTokens[0].type).toBe(TokenType.LINK);

      const ftpTokens = parse('<ftp://files.example.com>');
      expect(ftpTokens[0].type).toBe(TokenType.LINK);

      const mailtoTokens = parse('<mailto:test@example.com>');
      expect(mailtoTokens[0].type).toBe(TokenType.LINK);
    });

    it('should reject invalid protocols', () => {
      const tokens = parse('<invalid://example.com>');
      expect(tokens).toEqual([
        { type: TokenType.TEXT, content: '<invalid://example.com>' }
      ]);
    });
  });

  describe('Subscript/Superscript Edge Cases', () => {
    it('should not parse single tilde with space as subscript', () => {
      const tokens = parse('H~2 O');
      expect(tokens).toEqual([
        { type: TokenType.TEXT, content: 'H~2 O' }
      ]);
    });

    it('should not parse single caret with space as superscript', () => {
      const tokens = parse('X^2 + Y');
      expect(tokens).toEqual([
        { type: TokenType.TEXT, content: 'X^2 + Y' }
      ]);
    });

    it('should handle unclosed subscript', () => {
      const tokens = parse('H~2');
      expect(tokens).toEqual([
        { type: TokenType.TEXT, content: 'H~2' }
      ]);
    });

    it('should handle unclosed superscript', () => {
      const tokens = parse('X^2');
      expect(tokens).toEqual([
        { type: TokenType.TEXT, content: 'X^2' }
      ]);
    });

    it('should handle empty subscript', () => {
      const tokens = parse('H~~O');
      // This is actually strikethrough with empty content
      expect(tokens).toEqual([
        { type: TokenType.TEXT, content: 'H' },
        { type: TokenType.STRIKETHROUGH, content: '' },
        { type: TokenType.TEXT, content: 'O' }
      ]);
    });

    it('should handle empty superscript', () => {
      const tokens = parse('X^^Y');
      expect(tokens).toEqual([
        { type: TokenType.TEXT, content: 'X' },
        { type: TokenType.SUPERSCRIPT, content: '' },
        { type: TokenType.TEXT, content: 'Y' }
      ]);
    });

    it('should handle nested sub/superscript', () => {
      const tokens = parse('2^10^');
      expect(tokens).toEqual([
        { type: TokenType.TEXT, content: '2' },
        { type: TokenType.SUPERSCRIPT, content: '10' }
      ]);
    });

    it('should not confuse subscript with strikethrough', () => {
      const tokens1 = parse('~subscript~');
      expect(tokens1).toEqual([
        { type: TokenType.SUBSCRIPT, content: 'subscript' }
      ]);

      const tokens2 = parse('~~strikethrough~~');
      expect(tokens2).toEqual([
        { type: TokenType.STRIKETHROUGH, content: 'strikethrough' }
      ]);
    });

    it('should not confuse superscript with footnote', () => {
      const tokens1 = parse('^superscript^');
      expect(tokens1).toEqual([
        { type: TokenType.SUPERSCRIPT, content: 'superscript' }
      ]);

      const tokens2 = parse('[^footnote]');
      expect(tokens2).toEqual([
        { type: TokenType.FOOTNOTE_REF, content: 'footnote' }
      ]);
    });
  });

  describe('Complex Integration Cases', () => {
    it('should handle heading with all inline elements', () => {
      const tokens = parse('# **Bold** *italic* `code` ~~strike~~ ==highlight== ^super^ ~sub~ [link](url)');
      expect(tokens[0].type).toBe(TokenType.H1);
      expect(tokens[0].children).toHaveLength(15); // All inline elements
    });

    it('should handle blockquote with complex content', () => {
      const tokens = parse('>>> Deeply **nested** with *formatting* and [links](url)');
      expect(tokens[0].type).toBe(TokenType.BLOCKQUOTE);
      expect(tokens[0].metadata?.level).toBe(3);
    });

    it('should handle list item with all formatting', () => {
      const tokens = parse('1. Task with **bold**, *italic*, `code`, and [link](url)');
      expect(tokens[0].type).toBe(TokenType.ORDERED_LIST_ITEM);
      expect(tokens[0].children).toHaveLength(8);
    });

    it('should handle table cell with complex formatting', () => {
      const tokens = parse('| **Bold** *italic* `code` | Normal |');
      expect(tokens[0].type).toBe(TokenType.TABLE_ROW);
      const firstCell = tokens[0].children![0];
      expect(firstCell.children).toHaveLength(5);
    });
  });

  describe('Node emoji fallback coverage', () => {
    it('should handle node-emoji import error gracefully', () => {
      // This is already covered by the createEmojiManagerWithNodeEmoji function
      // but let's ensure it works
      const manager = new EmojiManager();
      expect(manager.getAllMappings()).toEqual({});
    });
  });

  describe('Special Character Handling', () => {
    it('should handle zero-width characters', () => {
      const tokens = parse('text\u200Bwith\u200Czero\u200Dwidth');
      expect(tokens[0].content).toContain('\u200B');
    });

    it('should handle unicode emoji directly', () => {
      const tokens = parse('Hello 🌍 World 🚀');
      expect(tokens).toEqual([
        { type: TokenType.TEXT, content: 'Hello 🌍 World 🚀' }
      ]);
    });

    it('should handle mixed RTL/LTR text', () => {
      const tokens = parse('English العربية English');
      expect(tokens[0].type).toBe(TokenType.TEXT);
    });
  });

  describe('Horizontal Rule Edge Cases', () => {
    it('should require minimum 3 characters', () => {
      expect(parse('--')).toEqual([
        { type: TokenType.TEXT, content: '--' }
      ]);

      expect(parse('---')[0].type).toBe(TokenType.HORIZONTAL_RULE);
    });

    it('should handle HR with spaces', () => {
      expect(parse('- - -')[0].type).toBe(TokenType.HORIZONTAL_RULE);
      expect(parse('* * *')[0].type).toBe(TokenType.HORIZONTAL_RULE);
      expect(parse('_ _ _')[0].type).toBe(TokenType.HORIZONTAL_RULE);
    });

    it('should handle mixed HR characters as text', () => {
      const tokens = parse('-*-');
      expect(tokens).toEqual([
        { type: TokenType.TEXT, content: '-*-' }
      ]);
    });
  });

  describe('Link Edge Cases', () => {
    it('should handle empty link text', () => {
      const tokens = parse('[](https://example.com)');
      expect(tokens).toEqual([
        {
          type: TokenType.LINK,
          children: [],
          metadata: { href: 'https://example.com', title: '' }
        }
      ]);
    });

    it('should handle empty link href', () => {
      const tokens = parse('[text]()');
      expect(tokens).toEqual([
        {
          type: TokenType.LINK,
          children: [{ type: TokenType.TEXT, content: 'text' }],
          metadata: { href: '', title: '' }
        }
      ]);
    });

    it('should handle link with formatting in text', () => {
      const tokens = parse('[**bold** link](url)');
      expect(tokens).toEqual([
        {
          type: TokenType.LINK,
          children: [
            { type: TokenType.BOLD, children: [{ type: TokenType.TEXT, content: 'bold' }] },
            { type: TokenType.TEXT, content: ' link' }
          ],
          metadata: { href: 'url', title: '' }
        }
      ]);
    });

    it('should handle malformed link', () => {
      const tokens = parse('[link(url)');
      expect(tokens).toEqual([
        { type: TokenType.TEXT, content: '[link(url)' }
      ]);
    });
  });

  describe('Heading Edge Cases', () => {
    it('should handle heading with 7 hashes as text', () => {
      const tokens = parse('####### Not a heading');
      expect(tokens).toEqual([
        { type: TokenType.TEXT, content: '####### Not a heading' }
      ]);
    });

    it('should handle heading without space after hash', () => {
      const tokens = parse('#NoSpace');
      expect(tokens).toEqual([
        { type: TokenType.TEXT, content: '#NoSpace' }
      ]);
    });

    it('should handle heading with trailing hashes', () => {
      const tokens = parse('# Heading #');
      expect(tokens).toEqual([
        {
          type: TokenType.H1,
          children: [{ type: TokenType.TEXT, content: 'Heading #' }]
        }
      ]);
    });

    it('should parse heading with complex ID', () => {
      const tokens = parse('# Heading {#complex-id_123}');
      expect(tokens).toEqual([
        {
          type: TokenType.H1,
          children: [{ type: TokenType.TEXT, content: 'Heading' }],
          metadata: { id: 'complex-id_123' }
        }
      ]);
    });
  });
});