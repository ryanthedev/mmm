import { describe, it, expect } from 'vitest';
import { parse, MarkdownFormatter, HTMLFormatter, TokenType } from '../src/index';

describe('Cursor Integration Tests', () => {
  const mdFormatter = new MarkdownFormatter();
  const htmlFormatter = new HTMLFormatter();

  describe('end-to-end cursor handling', () => {
    it('should parse and format cursor in markdown round-trip', () => {
      const input = 'Hello @! world';
      const tokens = parse(input);
      const output = mdFormatter.format(tokens);
      
      expect(tokens).toEqual([
        { type: TokenType.TEXT, content: 'Hello ' },
        { type: TokenType.CURSOR, content: ' ' },
        { type: TokenType.TEXT, content: 'world' }
      ]);
      expect(output).toBe('Hello @! world');
    });

    it('should parse and format cursor to HTML', () => {
      const input = 'Hello @! world';
      const tokens = parse(input);
      const output = htmlFormatter.format(tokens);
      
      expect(output).toBe('Hello <span class="cursor"> </span>world');
    });

    it('should handle cursor with nested formatting', () => {
      const input = '**bold @! text**';
      const tokens = parse(input);
      
      expect(tokens).toEqual([
        {
          type: TokenType.BOLD,
          children: [
            { type: TokenType.TEXT, content: 'bold ' },
            { type: TokenType.CURSOR, content: ' ' },
            { type: TokenType.TEXT, content: 'text' }
          ]
        }
      ]);
      
      const markdown = mdFormatter.format(tokens);
      const html = htmlFormatter.format(tokens);
      
      expect(markdown).toBe('**bold @! text**');
      expect(html).toBe('<strong>bold <span class="cursor"> </span>text</strong>');
    });

    it('should handle multiple cursors in complex text', () => {
      const input = 'Start @! *italic @! text* @! end';
      const tokens = parse(input);
      
      const markdown = mdFormatter.format(tokens);
      const html = htmlFormatter.format(tokens);
      
      expect(markdown).toBe('Start @! *italic @! text* @! end');
      expect(html).toBe('Start <span class="cursor"> </span><em>italic <span class="cursor"> </span>text</em> <span class="cursor"> </span>end');
    });

    it('should handle cursor in headings', () => {
      const input = '# Heading with @! cursor';
      const tokens = parse(input);
      
      const markdown = mdFormatter.format(tokens);
      const html = htmlFormatter.format(tokens);
      
      expect(markdown).toBe('# Heading with @! cursor');
      expect(html).toBe('<h1>Heading with <span class="cursor"> </span>cursor</h1>');
    });

    it('should handle cursor in links', () => {
      const input = '[Link @! text](https://example.com)';
      const tokens = parse(input);
      
      const markdown = mdFormatter.format(tokens);
      const html = htmlFormatter.format(tokens);
      
      expect(markdown).toBe('[Link @! text](https://example.com)');
      expect(html).toBe('<a href="https://example.com">Link <span class="cursor"> </span>text</a>');
    });

    it('should handle cursor in blockquotes', () => {
      const input = '> Quote with @! cursor';
      const tokens = parse(input);
      
      const markdown = mdFormatter.format(tokens);
      const html = htmlFormatter.format(tokens);
      
      expect(markdown).toBe('> Quote with @! cursor');
      expect(html).toBe('<blockquote>Quote with <span class="cursor"> </span>cursor</blockquote>');
    });

    it('should handle cursor in list items', () => {
      const input = '- List item @! here';
      const tokens = parse(input);
      
      const markdown = mdFormatter.format(tokens);
      const html = htmlFormatter.format(tokens);
      
      expect(markdown).toBe('- List item @! here');
      expect(html).toBe('<li>List item <span class="cursor"> </span>here</li>');
    });

    it('should handle cursor in table cells', () => {
      const input = 'Cell @! content | Other cell';
      const tokens = parse(input);
      
      const markdown = mdFormatter.format(tokens);
      const html = htmlFormatter.format(tokens);
      
      expect(markdown).toBe('| Cell @! content | Other cell |');
      expect(html).toBe('<tr><td>Cell <span class="cursor"> </span>content</td><td>Other cell</td></tr>');
    });

    it('should preserve cursor position in complex nested structures', () => {
      const input = '**Bold with *italic @! nested* text**';
      const tokens = parse(input);
      
      const markdown = mdFormatter.format(tokens);
      const html = htmlFormatter.format(tokens);
      
      expect(markdown).toBe('**Bold with *italic @! nested* text**');
      expect(html).toBe('<strong>Bold with <em>italic <span class="cursor"> </span>nested</em> text</strong>');
    });
  });

  describe('edge cases with cursor', () => {
    it('should handle cursor at start and end of content', () => {
      const input = '@! content @!';
      const tokens = parse(input);
      
      const markdown = mdFormatter.format(tokens);
      const html = htmlFormatter.format(tokens);
      
      expect(markdown).toBe('@! content @!');
      expect(html).toBe('<span class="cursor"> </span>content <span class="cursor"></span>');
    });

    it('should handle consecutive cursors', () => {
      const input = 'text @!@! more';
      const tokens = parse(input);
      
      const markdown = mdFormatter.format(tokens);
      const html = htmlFormatter.format(tokens);
      
      expect(markdown).toBe('text @!@\\! more');
      expect(html).toBe('text <span class="cursor">@</span>! more');
    });

    it('should handle cursor with special characters', () => {
      const input = 'Special chars & < > " \' @! here';
      const tokens = parse(input);
      
      const markdown = mdFormatter.format(tokens);
      const html = htmlFormatter.format(tokens);
      
      // Most special characters aren't escaped in plain text context
      expect(markdown).toBe('Special chars & < > " \' @! here');
      expect(html).toBe('Special chars &amp; &lt; &gt; &quot; &#39; <span class="cursor"> </span>here');
    });
  });
});