import { describe, beforeEach, test, expect } from 'vitest'
import { MarkdownParser, blankLineProcessor, RenderedElement, LineProcessor } from '../src/mmm';
import { createMockParser, createParserWithoutTheme } from './test-utils';

describe('MarkdownParser', () => {
  let parser: MarkdownParser;

  beforeEach(() => {
    parser = createMockParser();
  });

  describe('Basic Parsing', () => {
    test('should parse simple paragraph', () => {
      const result = parser.parse('Hello world');
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        type: 'p',
        content: 'Hello world',
        classes: ['test-paragraph']
      });
    });

    test('should parse multiple paragraphs', () => {
      const markdown = 'First paragraph\n\nSecond paragraph';
      const result = parser.parse(markdown);
      expect(result).toHaveLength(3); // Now includes empty_line element
      expect(result[0].content).toBe('First paragraph');
      expect(result[1].type).toBe('empty_line');
      expect(result[2].content).toBe('Second paragraph');
    });

    test('should handle empty input', () => {
      const result = parser.parse('');
      expect(result).toHaveLength(1); // Now creates empty_line element
      expect(result[0].type).toBe('empty_line');
    });

    test('should handle whitespace-only input', () => {
      const result = parser.parse('   \n\t\n   ');
      expect(result).toHaveLength(3); // Now creates empty_line elements for each line
      expect(result[0].type).toBe('empty_line');
      expect(result[1].type).toBe('empty_line');
      expect(result[2].type).toBe('empty_line');
    });
  });

  describe('Headings', () => {
    test('should parse h1 heading', () => {
      const result = parser.parse('# Main Title');
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        type: 'h1',
        content: '<span class="heading-indicator">1</span>Main Title',
        classes: ['test-h1']
      });
    });

    test('should parse h2 heading', () => {
      const result = parser.parse('## Subtitle');
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        type: 'h2',
        content: '<span class="heading-indicator">2</span>Subtitle',
        classes: ['test-h2']
      });
    });

    test('should parse all heading levels', () => {
      const markdown = `# H1
## H2
### H3
#### H4
##### H5
###### H6`;
      const result = parser.parse(markdown);
      expect(result).toHaveLength(6);
      
      for (let i = 0; i < 6; i++) {
        expect(result[i].type).toBe(`h${i + 1}`);
        expect(result[i].content).toBe(`<span class="heading-indicator">${i + 1}</span>H${i + 1}`);
      }
    });

    test('should not parse invalid headings', () => {
      const result = parser.parse('####### Too many hashes');
      expect(result[0].type).toBe('p');
    });
  });

  describe('Code Blocks', () => {
    test('should parse fenced code block with backticks', () => {
      const markdown = '```javascript\nconsole.log("Hello");\n```';
      const result = parser.parse(markdown);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        type: 'code_block',
        content: 'console.log("Hello");',
        attributes: { 'data-language': 'javascript' },
        classes: ['test-code-block']
      });
    });

    test('should parse fenced code block with tildes', () => {
      const markdown = '~~~python\nprint("Hello")\n~~~';
      const result = parser.parse(markdown);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        type: 'code_block',
        content: 'print("Hello")',
        attributes: { 'data-language': 'python' }
      });
    });

    test('should parse code block without language', () => {
      const markdown = '```\nsome code\n```';
      const result = parser.parse(markdown);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        type: 'code_block',
        content: 'some code',
        attributes: {}
      });
    });

    test('should handle multiline code blocks', () => {
      const markdown = '```\nline 1\nline 2\nline 3\n```';
      const result = parser.parse(markdown);
      expect(result).toHaveLength(1);
      expect(result[0].content).toBe('line 1\nline 2\nline 3');
    });
  });

  describe('Blockquotes', () => {
    test('should parse simple blockquote', () => {
      const result = parser.parse('> This is a quote');
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        type: 'blockquote',
        classes: ['test-blockquote']
      });
      expect(result[0].children).toBeDefined();
      expect(result[0].children![0].content).toBe('This is a quote');
    });

    test('should parse multiline blockquote', () => {
      const markdown = '> Line 1\n> Line 2\n> Line 3';
      const result = parser.parse(markdown);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('blockquote');
    });

    test('should parse lazy blockquote continuation', () => {
      const markdown = '> First line\nSecond line continues';
      const result = parser.parse(markdown);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('blockquote');
    });
  });

  describe('Lists', () => {
    test('should parse unordered list', () => {
      const markdown = '- Item 1\n- Item 2\n- Item 3';
      const result = parser.parse(markdown);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        type: 'ul',
        classes: ['test-ul']
      });
      expect(result[0].children).toHaveLength(3);
      expect(result[0].children![0]).toMatchObject({
        type: 'li',
        content: 'Item 1'
      });
    });

    test('should parse ordered list', () => {
      const markdown = '1. First item\n2. Second item\n3. Third item';
      const result = parser.parse(markdown);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        type: 'ol',
        classes: ['test-ol']
      });
      expect(result[0].children).toHaveLength(3);
    });

    test('should parse list with different markers', () => {
      const markdown = '* Item 1\n+ Item 2\n- Item 3';
      const result = parser.parse(markdown);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('ul');
      expect(result[0].children).toHaveLength(3);
    });

    test('should parse ordered list with parentheses', () => {
      const markdown = '1) First item\n2) Second item';
      const result = parser.parse(markdown);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('ol');
    });
  });

  describe('Inline Formatting', () => {
    test('should parse bold text', () => {
      const result = parser.parse('This is **bold** text');
      expect(result[0].content).toBe('This is <strong>bold</strong> text');
    });

    test('should parse italic text', () => {
      const result = parser.parse('This is *italic* text');
      expect(result[0].content).toBe('This is <em>italic</em> text');
    });

    test('should parse italic with underscores', () => {
      const result = parser.parse('This is _italic_ text');
      expect(result[0].content).toBe('This is <em>italic</em> text');
    });

    test('should parse inline code', () => {
      const result = parser.parse('Use `console.log()` for debugging');
      expect(result[0].content).toBe('Use <code>console.log()</code> for debugging');
    });

    test('should parse links', () => {
      const result = parser.parse('Visit [Google](https://google.com) for search');
      expect(result[0].content).toBe('Visit <a href="https://google.com">Google</a> for search');
    });

    test('should handle mixed inline formatting', () => {
      const result = parser.parse('**Bold** and *italic* and `code`');
      expect(result[0].content).toBe('<strong>Bold</strong> and <em>italic</em> and <code>code</code>');
    });
  });

  describe('Line Processing', () => {
    test('should use line feed method', () => {
      const result1 = parser.feedLine('# Test Heading');
      expect(result1.type).toBe('complete');
      expect(result1.element?.type).toBe('h1');

      const result2 = parser.feedLine('This is a paragraph');
      expect(result2.type).toBe('need_more_lines');

      const result3 = parser.feedLine('');
      expect(result3.type).toBe('complete');
      expect(result3.element?.type).toBe('p');
    });

    test('should handle reset functionality', () => {
      parser.feedLine('This is a paragraph');
      parser.reset();
      const result = parser.feedLine('# New heading');
      expect(result.type).toBe('complete');
      expect(result.element?.type).toBe('h1');
    });
  });

  describe('Custom Line Processors', () => {
    test('should register and use custom line processor', () => {
      const customProcessor: LineProcessor = {
        name: 'test_processor',
        priority: 50,
        canHandle: (lineInfo) => lineInfo.trimmed.startsWith('CUSTOM:'),
        process: (lineInfo) => ({
          type: 'complete',
          element: {
            type: 'custom',
            content: lineInfo.trimmed.slice(7).trim(),
            classes: ['custom-class']
          }
        })
      };

      parser.addLineProcessor(customProcessor);
      const result = parser.parse('CUSTOM: This is custom content');
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        type: 'custom',
        content: 'This is custom content',
        classes: ['custom-class']
      });
    });

    test('should use blank line processor', () => {
      // Note: blank line processor is now enabled by default
      const result = parser.parse('Paragraph 1\n\nParagraph 2');
      expect(result).toHaveLength(3);
      expect(result[0].type).toBe('p');
      expect(result[1].type).toBe('empty_line');
      expect(result[2].type).toBe('p');
    });
  });

  describe('Hooks', () => {
    test('should apply hooks to elements', () => {
      const hooks = {
        'p': (element: RenderedElement) => ({
          ...element,
          classes: [...(element.classes || []), 'custom-paragraph']
        })
      };

      const parserWithHooks = createMockParser({ hooks });
      const result = parserWithHooks.parse('Test paragraph');
      expect(result[0].classes).toContain('custom-paragraph');
      expect(result[0].classes).toContain('test-paragraph'); // Should also have theme classes
    });

    test('should apply hooks to headings', () => {
      const hooks = {
        'h1': (element: RenderedElement) => ({
          ...element,
          attributes: { ...element.attributes, id: 'main-title' }
        })
      };

      const parserWithHooks = createMockParser({ hooks });
      const result = parserWithHooks.parse('# Main Title');
      expect(result[0].attributes).toEqual({ id: 'main-title' });
    });
  });

  describe('Edge Cases', () => {
    test('should handle mixed line endings', () => {
      const markdown = 'Line 1\r\nLine 2\nLine 3\r';
      const result = parser.parse(markdown);
      expect(result).toHaveLength(3); // Each line becomes separate paragraph
      expect(result[0].content).toBe('Line 1');
      expect(result[1].content).toBe('Line 2');
      expect(result[2].content).toBe('Line 3\r'); // Last line includes the \r
    });

    test('should handle incomplete code blocks', () => {
      const result = parser.parse('```javascript\nconsole.log("no closing fence")');
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('code_block');
    });

    test('should handle nested elements in blockquotes', () => {
      const markdown = '> # Quoted Heading\n> This is quoted text';
      const result = parser.parse(markdown);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('blockquote');
      expect(result[0].children).toBeDefined();
    });

    test('should handle complex list scenarios', () => {
      const markdown = '1. First item\n   with continuation\n2. Second item';
      const result = parser.parse(markdown);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('ol');
      expect(result[0].children).toHaveLength(2);
    });
  });
});