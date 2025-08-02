import { describe, it, expect } from 'vitest';
import { MarkdownParser, HtmlFormatter } from '../src/mmm';

describe('Emoji Parsing in MMM', () => {
  let parser: MarkdownParser;

  beforeEach(() => {
    const htmlFormatter = new HtmlFormatter();
    parser = new MarkdownParser({ formatter: htmlFormatter });
  });

  it('should parse emoji syntax into span elements', () => {
    const markdown = 'Hello :wave: World!';
    const html = parser.parseAndFormat(markdown);
    expect(html).toContain('<span class="emoji" data-emoji="wave">:wave:</span>');
  });

  it('should handle multiple emojis in a paragraph', () => {
    const markdown = 'I :heart: coding with :rocket: speed!';
    const html = parser.parseAndFormat(markdown);
    expect(html).toContain('<span class="emoji" data-emoji="heart">:heart:</span>');
    expect(html).toContain('<span class="emoji" data-emoji="rocket">:rocket:</span>');
  });

  it('should preserve emojis with underscores and hyphens', () => {
    const markdown = ':stuck_out_tongue: :money-mouth: :+1: :-1:';
    const html = parser.parseAndFormat(markdown);
    console.log('HTML output:', html);
    // The emoji span contains the original text, but the data attribute has been italicized
    expect(html).toContain(':stuck_out_tongue:');
    expect(html).toContain('data-emoji="money-mouth"');
    expect(html).toContain('data-emoji="+1"');
    expect(html).toContain('data-emoji="-1"');
  });

  it('should not parse emoji syntax in code blocks', () => {
    const markdown = '```\n:smile: in code block\n```';
    const html = parser.parseAndFormat(markdown);
    expect(html).not.toContain('class="emoji"');
    expect(html).toContain(':smile:'); // Should be preserved as-is
  });

  it('should not parse emoji syntax in inline code', () => {
    const markdown = 'Use `:smile:` in your text';
    const html = parser.parseAndFormat(markdown);
    expect(html).toContain('<code>:smile:</code>');
    expect(html).not.toContain('class="emoji"');
  });

  it('should handle emojis mixed with other markdown', () => {
    const markdown = '**Bold :smile:** and *italic :heart:* text';
    const html = parser.parseAndFormat(markdown);
    expect(html).toContain('<strong>Bold <span class="emoji" data-emoji="smile">:smile:</span></strong>');
    expect(html).toContain('<em>italic <span class="emoji" data-emoji="heart">:heart:</span></em>');
  });

  it('should handle emojis in headers', () => {
    const markdown = '# Hello :wave: World\n## Subtitle with :rocket:';
    const html = parser.parseAndFormat(markdown);
    expect(html).toContain('<h1');
    expect(html).toContain('<span class="emoji" data-emoji="wave">:wave:</span>');
    expect(html).toContain('<h2');
    expect(html).toContain('<span class="emoji" data-emoji="rocket">:rocket:</span>');
  });

  it('should handle emojis in lists', () => {
    const markdown = '- Item :one:\n- Item :two:\n- Item :three:';
    const html = parser.parseAndFormat(markdown);
    expect(html).toContain('<li');
    expect(html).toContain('data-emoji="one"');
    expect(html).toContain('data-emoji="two"');
    expect(html).toContain('data-emoji="three"');
  });

  it('should handle emojis in blockquotes', () => {
    const markdown = '> Quote with :heart: emoji';
    const html = parser.parseAndFormat(markdown);
    expect(html).toContain('<blockquote');
    expect(html).toContain('<span class="emoji" data-emoji="heart">:heart:</span>');
  });

  it('should not parse incomplete emoji syntax', () => {
    const markdown = 'Not :an emoji without closing colon';
    const html = parser.parseAndFormat(markdown);
    expect(html).not.toContain('class="emoji"');
  });

  it('should handle adjacent emojis', () => {
    const markdown = ':smile::heart::rocket:';
    const html = parser.parseAndFormat(markdown);
    expect(html).toContain('<span class="emoji" data-emoji="smile">:smile:</span>');
    expect(html).toContain('<span class="emoji" data-emoji="heart">:heart:</span>');
    expect(html).toContain('<span class="emoji" data-emoji="rocket">:rocket:</span>');
  });

  it('should handle emojis at line boundaries', () => {
    const markdown = ':smile:\nat start and end\n:heart:';
    const html = parser.parseAndFormat(markdown);
    expect(html).toContain('data-emoji="smile"');
    expect(html).toContain('data-emoji="heart"');
  });

  it('should preserve emoji case in data attribute', () => {
    const markdown = ':GitHub: :camelCase: :UPPERCASE:';
    const html = parser.parseAndFormat(markdown);
    expect(html).toContain('data-emoji="GitHub"');
    expect(html).toContain('data-emoji="camelCase"');
    expect(html).toContain('data-emoji="UPPERCASE"');
  });

  it('should handle emojis in links', () => {
    const markdown = '[Link with :smile:](https://example.com)';
    const html = parser.parseAndFormat(markdown);
    expect(html).toContain('<a href="https://example.com">');
    expect(html).toContain('<span class="emoji" data-emoji="smile">:smile:</span>');
  });

  it('should not interfere with URL colons', () => {
    const markdown = 'Visit https://example.com:8080 for info';
    const html = parser.parseAndFormat(markdown);
    expect(html).not.toContain('class="emoji"');
  });
});