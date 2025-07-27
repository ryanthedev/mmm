import { describe, beforeEach, test, expect } from 'vitest'
import { 
  MarkdownParser, 
  RenderedElement, 
  JsonFormatter, 
  HtmlFormatter, 
  PrettyJsonFormatter,
  OutputFormatter,
  FormatterOptions,
  imageProcessor
} from '../src/mmm';

describe('Formatters', () => {
  let parser: MarkdownParser;
  let sampleElements: RenderedElement[];

  beforeEach(() => {
    parser = new MarkdownParser();
    
    // Create sample elements for testing
    sampleElements = [
      {
        type: 'h1',
        content: 'Main Heading',
        classes: ['text-4xl', 'font-bold', 'mb-6']
      },
      {
        type: 'p',
        content: 'This is a paragraph with <strong>bold</strong> and <em>italic</em> text.',
        classes: ['mb-4']
      },
      {
        type: 'ul',
        content: '',
        classes: ['mb-4', 'list-disc', 'list-inside'],
        children: [
          {
            type: 'li',
            content: 'First item',
            classes: ['mb-1']
          },
          {
            type: 'li',
            content: 'Second item',
            classes: ['mb-1']
          }
        ]
      },
      {
        type: 'img',
        content: '',
        attributes: {
          src: 'https://example.com/image.jpg',
          alt: 'Test image'
        },
        classes: ['max-w-full', 'h-auto', 'my-4']
      },
      {
        type: 'code_block',
        content: 'console.log("Hello, World!");',
        attributes: {
          'data-language': 'javascript'
        },
        classes: ['bg-gray-100', 'p-4', 'rounded-lg', 'font-mono', 'text-sm', 'overflow-x-auto']
      }
    ];
  });

  describe('JsonFormatter', () => {
    let formatter: JsonFormatter;

    beforeEach(() => {
      formatter = new JsonFormatter();
    });

    test('should have correct name', () => {
      expect(formatter.name).toBe('json');
    });

    test('should return elements unchanged', () => {
      const result = formatter.format(sampleElements);
      expect(result).toBe(sampleElements);
      expect(result).toEqual(sampleElements);
    });

    test('should format single element unchanged', () => {
      const element = sampleElements[0];
      const result = formatter.formatElement(element);
      expect(result).toBe(element);
    });

    test('should work as default formatter in parser', () => {
      const markdown = '# Test\n\nParagraph text.';
      const result = parser.parseAndFormat(markdown);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(3); // Now includes empty_line element
      expect(result[0].type).toBe('h1');
      expect(result[1].type).toBe('empty_line');
      expect(result[2].type).toBe('p');
    });
  });

  describe('HtmlFormatter', () => {
    let formatter: HtmlFormatter;

    beforeEach(() => {
      formatter = new HtmlFormatter();
    });

    test('should have correct name', () => {
      expect(formatter.name).toBe('html');
    });

    test('should format heading correctly', () => {
      const heading = sampleElements[0];
      const result = formatter.formatElement(heading);
      expect(result).toBe('<h1 class="text-4xl font-bold mb-6">Main Heading</h1>');
    });

    test('should format paragraph correctly', () => {
      const paragraph = sampleElements[1];
      const result = formatter.formatElement(paragraph);
      expect(result).toBe('<p class="mb-4">This is a paragraph with <strong>bold</strong> and <em>italic</em> text.</p>');
    });

    test('should format list with children correctly', () => {
      const list = sampleElements[2];
      const result = formatter.formatElement(list);
      expect(result).toContain('<ul class="mb-4 list-disc list-inside">');
      expect(result).toContain('<li class="mb-1">First item</li>');
      expect(result).toContain('<li class="mb-1">Second item</li>');
      expect(result).toContain('</ul>');
    });

    test('should format self-closing image tag correctly', () => {
      const image = sampleElements[3];
      const result = formatter.formatElement(image);
      expect(result).toBe('<img class="max-w-full h-auto my-4" src="https://example.com/image.jpg" alt="Test image" />');
    });

    test('should format code block correctly', () => {
      const codeBlock = sampleElements[4];
      const result = formatter.formatElement(codeBlock);
      expect(result).toContain('<pre class="bg-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto" data-language="javascript">');
      expect(result).toContain('<code>console.log(&quot;Hello, World!&quot;);</code>');
      expect(result).toContain('</pre>');
    });

    test('should escape HTML in content', () => {
      const element: RenderedElement = {
        type: 'span',
        content: 'Text with <script>alert("xss")</script> & special chars',
        classes: []
      };
      const result = formatter.formatElement(element);
      expect(result).toContain('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
      expect(result).toContain('&amp; special chars');
    });

    test('should escape attributes correctly', () => {
      const element: RenderedElement = {
        type: 'img',
        content: '',
        attributes: {
          src: 'https://example.com/image.jpg?param="value"&other=test',
          alt: 'Alt text with "quotes" & ampersand'
        },
        classes: []
      };
      const result = formatter.formatElement(element);
      expect(result).toContain('src="https://example.com/image.jpg?param=&quot;value&quot;&amp;other=test"');
      expect(result).toContain('alt="Alt text with &quot;quotes&quot; &amp; ampersand"');
    });

    test('should format complete document', () => {
      const result = formatter.format(sampleElements);
      expect(typeof result).toBe('string');
      expect(result).toContain('<h1');
      expect(result).toContain('<p');
      expect(result).toContain('<ul');
      expect(result).toContain('<img');
      expect(result).toContain('<pre');
    });

    test('should handle elements without classes or attributes', () => {
      const element: RenderedElement = {
        type: 'p',
        content: 'Simple paragraph'
      };
      const result = formatter.formatElement(element);
      expect(result).toBe('<p>Simple paragraph</p>');
    });

    test('should work with parser integration', () => {
      parser.setFormatter(new HtmlFormatter());
      const markdown = '# Test\n\nParagraph with **bold** text.';
      const result = parser.parseAndFormat(markdown);
      expect(typeof result).toBe('string');
      expect(result).toContain('<h1');
      expect(result).toContain('<strong>bold</strong>');
    });
  });

  describe('PrettyJsonFormatter', () => {
    let formatter: PrettyJsonFormatter;

    beforeEach(() => {
      formatter = new PrettyJsonFormatter();
    });

    test('should have correct name', () => {
      expect(formatter.name).toBe('pretty-json');
    });

    test('should format elements as pretty JSON', () => {
      const result = formatter.format(sampleElements);
      expect(typeof result).toBe('string');
      
      // Should be valid JSON
      const parsed = JSON.parse(result);
      expect(parsed).toEqual(sampleElements);
      
      // Should be pretty formatted (contains newlines and indentation)
      expect(result).toContain('\n');
      expect(result).toContain('  '); // Default 2-space indentation
    });

    test('should format single element as pretty JSON', () => {
      const element = sampleElements[0];
      const result = formatter.formatElement(element);
      expect(typeof result).toBe('string');
      
      const parsed = JSON.parse(result);
      expect(parsed).toEqual(element);
    });

    test('should respect custom indentation', () => {
      const customFormatter = new PrettyJsonFormatter({ indentSize: 4 });
      const result = customFormatter.format([sampleElements[0]]);
      
      // Should contain 4-space indentation
      expect(result).toContain('    '); // 4 spaces
      expect(result).toContain('\n');
    });

    test('should work with parser integration', () => {
      parser.setFormatter(new PrettyJsonFormatter());
      const markdown = '# Test';
      const result = parser.parseAndFormat(markdown);
      
      expect(typeof result).toBe('string');
      const parsed = JSON.parse(result);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed[0].type).toBe('h1');
    });
  });

  describe('Custom Formatters', () => {
    test('should support custom formatter implementation', () => {
      class CustomFormatter implements OutputFormatter<string> {
        name = 'custom';
        
        format(elements: RenderedElement[]): string {
          return elements.map(el => `[${el.type.toUpperCase()}] ${el.content}`).join(' | ');
        }
      }
      
      const customFormatter = new CustomFormatter();
      parser.setFormatter(customFormatter);
      
      const markdown = '# Hello\n\nWorld';
      const result = parser.parseAndFormat(markdown);
      
      expect(result).toBe('[H1] <span class="heading-indicator">1</span>Hello | [EMPTY_LINE]  | [P] World');
    });

    test('should support formatter with options', () => {
      class ConfigurableFormatter implements OutputFormatter<string> {
        name = 'configurable';
        
        constructor(private separator: string = ' ') {}
        
        format(elements: RenderedElement[]): string {
          return elements.map(el => el.type).join(this.separator);
        }
      }
      
      const formatter1 = new ConfigurableFormatter(' -> ');
      const formatter2 = new ConfigurableFormatter(' | ');
      
      const testElements = [
        { type: 'h1', content: 'Title' },
        { type: 'p', content: 'Text' }
      ];
      
      expect(formatter1.format(testElements)).toBe('h1 -> p');
      expect(formatter2.format(testElements)).toBe('h1 | p');
    });
  });

  describe('Parser Integration', () => {
    test('should default to JsonFormatter', () => {
      const markdown = '# Test';
      const result = parser.parseAndFormat(markdown);
      
      // Default JsonFormatter returns the elements array unchanged
      expect(Array.isArray(result)).toBe(true);
      expect(result[0].type).toBe('h1');
    });

    test('should accept formatter in constructor', () => {
      const htmlParser = new MarkdownParser({
        formatter: new HtmlFormatter()
      });
      
      const markdown = '# Test';
      const result = htmlParser.parseAndFormat(markdown);
      
      expect(typeof result).toBe('string');
      expect(result).toContain('<h1');
    });

    test('should allow changing formatter after construction', () => {
      const markdown = '# Test';
      
      // First format as JSON (default)
      const jsonResult = parser.parseAndFormat(markdown);
      expect(Array.isArray(jsonResult)).toBe(true);
      
      // Change to HTML formatter
      parser.setFormatter(new HtmlFormatter());
      const htmlResult = parser.parseAndFormat(markdown);
      expect(typeof htmlResult).toBe('string');
      expect(htmlResult).toContain('<h1');
      
      // Change to pretty JSON formatter
      parser.setFormatter(new PrettyJsonFormatter());
      const prettyResult = parser.parseAndFormat(markdown);
      expect(typeof prettyResult).toBe('string');
      expect(prettyResult).toContain('\n');
    });

    test('should work with complex markdown containing images', () => {
      // Add image processor to parser
      parser.addLineProcessor(imageProcessor);
      parser.setFormatter(new HtmlFormatter());
      
      const markdown = `# Gallery
      
This is a paragraph.

![Test image](https://example.com/test.jpg)

- Item 1
- Item 2`;
      
      const result = parser.parseAndFormat(markdown);
      expect(result).toContain('<h1');
      expect(result).toContain('<p');
      expect(result).toContain('<img');
      expect(result).toContain('src="https://example.com/test.jpg"');
      expect(result).toContain('<ul');
      expect(result).toContain('<li');
    });

    test('should preserve formatting context across multiple parses', () => {
      parser.setFormatter(new HtmlFormatter());
      
      const markdown1 = '# First';
      const markdown2 = '## Second';
      
      const result1 = parser.parseAndFormat(markdown1);
      const result2 = parser.parseAndFormat(markdown2);
      
      expect(result1).toContain('<h1');
      expect(result2).toContain('<h2');
    });
  });

  describe('Error Handling', () => {
    test('should handle empty elements array', () => {
      const formatter = new HtmlFormatter();
      const result = formatter.format([]);
      expect(result).toBe('');
    });

    test('should handle malformed elements gracefully', () => {
      const formatter = new HtmlFormatter();
      const malformed: RenderedElement = {
        type: 'unknown',
        content: 'test'
      };
      
      const result = formatter.formatElement(malformed);
      expect(result).toBe('<unknown>test</unknown>');
    });

    test('should handle undefined/null content', () => {
      const formatter = new HtmlFormatter();
      const element: RenderedElement = {
        type: 'p',
        content: undefined as any
      };
      
      const result = formatter.formatElement(element);
      expect(result).toBe('<p></p>');
    });
  });
});