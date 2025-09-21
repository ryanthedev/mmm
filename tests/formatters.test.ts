import { describe, it, expect } from 'vitest';
import { MarkdownFormatter, HTMLFormatter } from '../src/formatters';
import { Token, TokenType } from '../src/mmmv2';

describe('MarkdownFormatter', () => {
  const formatter = new MarkdownFormatter();

  describe('basic text formatting', () => {
    it('should format plain text', () => {
      const tokens: Token[] = [
        { type: TokenType.TEXT, content: 'Hello world' }
      ];
      expect(formatter.format(tokens)).toBe('Hello world');
    });

    it('should escape markdown special characters', () => {
      const tokens: Token[] = [
        { type: TokenType.TEXT, content: '*bold* _italic_ `code` [link]' }
      ];
      expect(formatter.format(tokens)).toBe('\\*bold\\* \\_italic\\_ \\`code\\` \\[link\\]');
    });

    it('should escape all markdown special characters', () => {
      const specialChars = '\\`*_{}[]()#+!~^=|-';
      const tokens: Token[] = [
        { type: TokenType.TEXT, content: specialChars }
      ];
      const escaped = specialChars.split('').map(char => `\\${char}`).join('');
      expect(formatter.format(tokens)).toBe(escaped);
    });

    it('should handle empty content', () => {
      const tokens: Token[] = [
        { type: TokenType.TEXT, content: '' }
      ];
      expect(formatter.format(tokens)).toBe('');
    });

    it('should handle missing content', () => {
      const tokens: Token[] = [
        { type: TokenType.TEXT }
      ];
      expect(formatter.format(tokens)).toBe('');
    });
  });

  describe('inline formatting', () => {
    it('should format bold text', () => {
      const tokens: Token[] = [
        {
          type: TokenType.BOLD,
          children: [{ type: TokenType.TEXT, content: 'bold text' }]
        }
      ];
      expect(formatter.format(tokens)).toBe('**bold text**');
    });

    it('should format italic text', () => {
      const tokens: Token[] = [
        {
          type: TokenType.ITALIC,
          children: [{ type: TokenType.TEXT, content: 'italic text' }]
        }
      ];
      expect(formatter.format(tokens)).toBe('*italic text*');
    });

    it('should format strikethrough text', () => {
      const tokens: Token[] = [
        { type: TokenType.STRIKETHROUGH, content: 'deleted text' }
      ];
      expect(formatter.format(tokens)).toBe('~~deleted text~~');
    });

    it('should format highlight text', () => {
      const tokens: Token[] = [
        { type: TokenType.HIGHLIGHT, content: 'highlighted text' }
      ];
      expect(formatter.format(tokens)).toBe('==highlighted text==');
    });

    it('should format subscript text', () => {
      const tokens: Token[] = [
        { type: TokenType.SUBSCRIPT, content: '2' }
      ];
      expect(formatter.format(tokens)).toBe('~2~');
    });

    it('should format superscript text', () => {
      const tokens: Token[] = [
        { type: TokenType.SUPERSCRIPT, content: '2' }
      ];
      expect(formatter.format(tokens)).toBe('^2^');
    });

    it('should format cursor', () => {
      const tokens: Token[] = [
        { type: TokenType.CURSOR }
      ];
      expect(formatter.format(tokens)).toBe('@!');
    });

    it('should format inline code', () => {
      const tokens: Token[] = [
        { type: TokenType.INLINE_CODE, content: 'console.log()' }
      ];
      expect(formatter.format(tokens)).toBe('`console.log()`');
    });

    it('should handle nested formatting', () => {
      const tokens: Token[] = [
        {
          type: TokenType.BOLD,
          children: [
            { type: TokenType.TEXT, content: 'bold with ' },
            {
              type: TokenType.ITALIC,
              children: [{ type: TokenType.TEXT, content: 'nested italic' }]
            }
          ]
        }
      ];
      expect(formatter.format(tokens)).toBe('**bold with *nested italic***');
    });

    it('should handle complex inline combinations', () => {
      const tokens: Token[] = [
        { type: TokenType.TEXT, content: 'Here is ' },
        {
          type: TokenType.BOLD,
          children: [{ type: TokenType.TEXT, content: 'bold' }]
        },
        { type: TokenType.TEXT, content: ' and ' },
        {
          type: TokenType.ITALIC,
          children: [{ type: TokenType.TEXT, content: 'italic' }]
        },
        { type: TokenType.TEXT, content: ' and ' },
        { type: TokenType.INLINE_CODE, content: 'code' },
        { type: TokenType.TEXT, content: '.' }
      ];
      expect(formatter.format(tokens)).toBe('Here is **bold** and *italic* and `code`.');
    });
  });

  describe('headings', () => {
    it('should format H1 heading', () => {
      const tokens: Token[] = [
        {
          type: TokenType.H1,
          children: [{ type: TokenType.TEXT, content: 'Heading 1' }]
        }
      ];
      expect(formatter.format(tokens)).toBe('# Heading 1');
    });

    it('should format all heading levels', () => {
      const headingTypes = [TokenType.H1, TokenType.H2, TokenType.H3, TokenType.H4, TokenType.H5, TokenType.H6];
      const expected = ['# ', '## ', '### ', '#### ', '##### ', '###### '];

      headingTypes.forEach((type, index) => {
        const tokens: Token[] = [
          {
            type,
            children: [{ type: TokenType.TEXT, content: 'Heading' }]
          }
        ];
        expect(formatter.format(tokens)).toBe(`${expected[index]}Heading`);
      });
    });

    it('should format heading with ID', () => {
      const tokens: Token[] = [
        {
          type: TokenType.H1,
          children: [{ type: TokenType.TEXT, content: 'Heading with ID' }],
          metadata: { id: 'custom-id' }
        }
      ];
      expect(formatter.format(tokens)).toBe('# Heading with ID {#custom-id}');
    });

    it('should format heading with inline formatting', () => {
      const tokens: Token[] = [
        {
          type: TokenType.H2,
          children: [
            { type: TokenType.TEXT, content: 'Heading with ' },
            {
              type: TokenType.BOLD,
              children: [{ type: TokenType.TEXT, content: 'bold' }]
            },
            { type: TokenType.TEXT, content: ' text' }
          ]
        }
      ];
      expect(formatter.format(tokens)).toBe('## Heading with **bold** text');
    });
  });

  describe('links and images', () => {
    it('should format basic link', () => {
      const tokens: Token[] = [
        {
          type: TokenType.LINK,
          children: [{ type: TokenType.TEXT, content: 'Example' }],
          metadata: { href: 'https://example.com', title: '' }
        }
      ];
      expect(formatter.format(tokens)).toBe('[Example](https://example.com)');
    });

    it('should format link with title', () => {
      const tokens: Token[] = [
        {
          type: TokenType.LINK,
          children: [{ type: TokenType.TEXT, content: 'Example' }],
          metadata: { href: 'https://example.com', title: 'Example Site' }
        }
      ];
      expect(formatter.format(tokens)).toBe('[Example](https://example.com "Example Site")');
    });

    it('should format basic image', () => {
      const tokens: Token[] = [
        {
          type: TokenType.IMAGE,
          children: [{ type: TokenType.TEXT, content: 'Alt text' }],
          metadata: { src: 'image.jpg', title: '' }
        }
      ];
      expect(formatter.format(tokens)).toBe('![Alt text](image.jpg)');
    });

    it('should format image with title', () => {
      const tokens: Token[] = [
        {
          type: TokenType.IMAGE,
          children: [{ type: TokenType.TEXT, content: 'Alt text' }],
          metadata: { src: 'image.jpg', title: 'Image Title' }
        }
      ];
      expect(formatter.format(tokens)).toBe('![Alt text](image.jpg "Image Title")');
    });

    it('should handle missing metadata', () => {
      const tokens: Token[] = [
        {
          type: TokenType.LINK,
          children: [{ type: TokenType.TEXT, content: 'Link' }]
        }
      ];
      expect(formatter.format(tokens)).toBe('[Link]()');
    });
  });

  describe('blockquotes', () => {
    it('should format simple blockquote', () => {
      const tokens: Token[] = [
        {
          type: TokenType.BLOCKQUOTE,
          children: [{ type: TokenType.TEXT, content: 'This is a quote' }],
          metadata: { level: 1 }
        }
      ];
      expect(formatter.format(tokens)).toBe('> This is a quote');
    });

    it('should format nested blockquote', () => {
      const tokens: Token[] = [
        {
          type: TokenType.BLOCKQUOTE,
          children: [{ type: TokenType.TEXT, content: 'Nested quote' }],
          metadata: { level: 3 }
        }
      ];
      expect(formatter.format(tokens)).toBe('>>> Nested quote');
    });

    it('should handle missing level metadata', () => {
      const tokens: Token[] = [
        {
          type: TokenType.BLOCKQUOTE,
          children: [{ type: TokenType.TEXT, content: 'Quote' }]
        }
      ];
      expect(formatter.format(tokens)).toBe('> Quote');
    });
  });

  describe('lists', () => {
    it('should format unordered list item', () => {
      const tokens: Token[] = [
        {
          type: TokenType.UNORDERED_LIST_ITEM,
          children: [{ type: TokenType.TEXT, content: 'List item' }],
          metadata: { indent: 0 }
        }
      ];
      expect(formatter.format(tokens)).toBe('- List item');
    });

    it('should format indented unordered list item', () => {
      const tokens: Token[] = [
        {
          type: TokenType.UNORDERED_LIST_ITEM,
          children: [{ type: TokenType.TEXT, content: 'Nested item' }],
          metadata: { indent: 2 }
        }
      ];
      expect(formatter.format(tokens)).toBe('  - Nested item');
    });

    it('should format ordered list item', () => {
      const tokens: Token[] = [
        {
          type: TokenType.ORDERED_LIST_ITEM,
          children: [{ type: TokenType.TEXT, content: 'First item' }],
          metadata: { indent: 0, start: 1 }
        }
      ];
      expect(formatter.format(tokens)).toBe('1. First item');
    });

    it('should format ordered list item with custom start', () => {
      const tokens: Token[] = [
        {
          type: TokenType.ORDERED_LIST_ITEM,
          children: [{ type: TokenType.TEXT, content: 'Item' }],
          metadata: { indent: 0, start: 5 }
        }
      ];
      expect(formatter.format(tokens)).toBe('5. Item');
    });

    it('should format unchecked task list item', () => {
      const tokens: Token[] = [
        {
          type: TokenType.TASK_LIST_ITEM,
          children: [{ type: TokenType.TEXT, content: 'Todo item' }],
          metadata: { indent: 0, checked: false }
        }
      ];
      expect(formatter.format(tokens)).toBe('- [ ] Todo item');
    });

    it('should format checked task list item', () => {
      const tokens: Token[] = [
        {
          type: TokenType.TASK_LIST_ITEM,
          children: [{ type: TokenType.TEXT, content: 'Done item' }],
          metadata: { indent: 0, checked: true }
        }
      ];
      expect(formatter.format(tokens)).toBe('- [x] Done item');
    });
  });

  describe('tables', () => {
    it('should format table row', () => {
      const tokens: Token[] = [
        {
          type: TokenType.TABLE_ROW,
          children: [
            {
              type: TokenType.TABLE_CELL,
              children: [{ type: TokenType.TEXT, content: 'Header 1' }]
            },
            {
              type: TokenType.TABLE_CELL,
              children: [{ type: TokenType.TEXT, content: 'Header 2' }]
            }
          ]
        }
      ];
      expect(formatter.format(tokens)).toBe('| Header 1 | Header 2 |');
    });

    it('should format table separator with alignments', () => {
      const tokens: Token[] = [
        {
          type: TokenType.TABLE_SEPARATOR,
          metadata: { alignments: ['left', 'center', 'right', 'none'] }
        }
      ];
      expect(formatter.format(tokens)).toBe('| :--- | :---: | ---: | --- |');
    });

    it('should handle empty table row', () => {
      const tokens: Token[] = [
        {
          type: TokenType.TABLE_ROW,
          children: []
        }
      ];
      expect(formatter.format(tokens)).toBe('|  |');
    });
  });

  describe('code and miscellaneous', () => {
    it('should format code fence without language', () => {
      const tokens: Token[] = [
        { type: TokenType.CODE_FENCE, content: '' }
      ];
      expect(formatter.format(tokens)).toBe('```');
    });

    it('should format code fence with language', () => {
      const tokens: Token[] = [
        {
          type: TokenType.CODE_FENCE,
          content: '',
          metadata: { lang: 'javascript' }
        }
      ];
      expect(formatter.format(tokens)).toBe('```javascript');
    });

    it('should format horizontal rule', () => {
      const tokens: Token[] = [
        { type: TokenType.HORIZONTAL_RULE }
      ];
      expect(formatter.format(tokens)).toBe('---');
    });

    it('should format footnote reference', () => {
      const tokens: Token[] = [
        { type: TokenType.FOOTNOTE_REF, content: 'note1' }
      ];
      expect(formatter.format(tokens)).toBe('[^note1]');
    });

    it('should format footnote definition', () => {
      const tokens: Token[] = [
        {
          type: TokenType.FOOTNOTE_DEF,
          metadata: { id: 'note1' },
          children: [{ type: TokenType.TEXT, content: 'Footnote content' }]
        }
      ];
      expect(formatter.format(tokens)).toBe('[^note1]: Footnote content');
    });

    it('should format empty line', () => {
      const tokens: Token[] = [
        { type: TokenType.EMPTY_LINE, content: '\n' }
      ];
      expect(formatter.format(tokens)).toBe('\n');
    });
  });

  describe('edge cases', () => {
    it('should handle unknown token types', () => {
      const tokens: Token[] = [
        { type: 'custom_type' as TokenType, content: 'custom content' }
      ];
      expect(formatter.format(tokens)).toBe('custom content');
    });

    it('should handle tokens without content or children', () => {
      const tokens: Token[] = [
        { type: 'unknown' as TokenType }
      ];
      expect(formatter.format(tokens)).toBe('');
    });

    it('should handle complex nested structures', () => {
      const tokens: Token[] = [
        {
          type: TokenType.BLOCKQUOTE,
          metadata: { level: 1 },
          children: [
            {
              type: TokenType.BOLD,
              children: [
                { type: TokenType.TEXT, content: 'Bold in ' },
                {
                  type: TokenType.ITALIC,
                  children: [{ type: TokenType.TEXT, content: 'nested' }]
                },
                { type: TokenType.TEXT, content: ' quote' }
              ]
            }
          ]
        }
      ];
      expect(formatter.format(tokens)).toBe('> **Bold in *nested* quote**');
    });

    it('should handle multiple tokens in sequence', () => {
      const tokens: Token[] = [
        { type: TokenType.TEXT, content: 'Start ' },
        {
          type: TokenType.BOLD,
          children: [{ type: TokenType.TEXT, content: 'bold' }]
        },
        { type: TokenType.TEXT, content: ' middle ' },
        {
          type: TokenType.ITALIC,
          children: [{ type: TokenType.TEXT, content: 'italic' }]
        },
        { type: TokenType.TEXT, content: ' end' }
      ];
      expect(formatter.format(tokens)).toBe('Start **bold** middle *italic* end');
    });

    it('should handle cursor in complex formatting', () => {
      const tokens: Token[] = [
        { type: TokenType.TEXT, content: 'Before ' },
        { type: TokenType.CURSOR },
        { type: TokenType.TEXT, content: ' and ' },
        {
          type: TokenType.BOLD,
          children: [{ type: TokenType.TEXT, content: 'bold' }]
        },
        { type: TokenType.TEXT, content: ' and ' },
        { type: TokenType.CURSOR },
        { type: TokenType.TEXT, content: ' after' }
      ];
      expect(formatter.format(tokens)).toBe('Before @! and **bold** and @! after');
    });
  });
});

describe('HTMLFormatter', () => {
  const formatter = new HTMLFormatter();

  describe('basic text formatting', () => {
    it('should format plain text', () => {
      const tokens: Token[] = [
        { type: TokenType.TEXT, content: 'Hello world' }
      ];
      expect(formatter.format(tokens)).toBe('Hello world');
    });

    it('should escape HTML special characters', () => {
      const tokens: Token[] = [
        { type: TokenType.TEXT, content: '<script>alert("xss")</script>' }
      ];
      expect(formatter.format(tokens)).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    });

    it('should escape all HTML entities', () => {
      const tokens: Token[] = [
        { type: TokenType.TEXT, content: '&<>"\'' }
      ];
      expect(formatter.format(tokens)).toBe('&amp;&lt;&gt;&quot;&#39;');
    });

    it('should handle empty content', () => {
      const tokens: Token[] = [
        { type: TokenType.TEXT, content: '' }
      ];
      expect(formatter.format(tokens)).toBe('');
    });

    it('should handle missing content', () => {
      const tokens: Token[] = [
        { type: TokenType.TEXT }
      ];
      expect(formatter.format(tokens)).toBe('');
    });
  });

  describe('inline formatting', () => {
    it('should format bold text', () => {
      const tokens: Token[] = [
        {
          type: TokenType.BOLD,
          children: [{ type: TokenType.TEXT, content: 'bold text' }]
        }
      ];
      expect(formatter.format(tokens)).toBe('<strong>bold text</strong>');
    });

    it('should format italic text', () => {
      const tokens: Token[] = [
        {
          type: TokenType.ITALIC,
          children: [{ type: TokenType.TEXT, content: 'italic text' }]
        }
      ];
      expect(formatter.format(tokens)).toBe('<em>italic text</em>');
    });

    it('should format strikethrough text', () => {
      const tokens: Token[] = [
        { type: TokenType.STRIKETHROUGH, content: 'deleted text' }
      ];
      expect(formatter.format(tokens)).toBe('<del>deleted text</del>');
    });

    it('should format highlight text', () => {
      const tokens: Token[] = [
        { type: TokenType.HIGHLIGHT, content: 'highlighted text' }
      ];
      expect(formatter.format(tokens)).toBe('<mark>highlighted text</mark>');
    });

    it('should format subscript text', () => {
      const tokens: Token[] = [
        { type: TokenType.SUBSCRIPT, content: '2' }
      ];
      expect(formatter.format(tokens)).toBe('<sub>2</sub>');
    });

    it('should format superscript text', () => {
      const tokens: Token[] = [
        { type: TokenType.SUPERSCRIPT, content: '2' }
      ];
      expect(formatter.format(tokens)).toBe('<sup>2</sup>');
    });

    it('should format cursor', () => {
      const tokens: Token[] = [
        { type: TokenType.CURSOR }
      ];
      expect(formatter.format(tokens)).toBe('<span class="cursor"></span>');
    });

    it('should format inline code', () => {
      const tokens: Token[] = [
        { type: TokenType.INLINE_CODE, content: 'console.log()' }
      ];
      expect(formatter.format(tokens)).toBe('<code>console.log()</code>');
    });

    it('should handle nested formatting', () => {
      const tokens: Token[] = [
        {
          type: TokenType.BOLD,
          children: [
            { type: TokenType.TEXT, content: 'bold with ' },
            {
              type: TokenType.ITALIC,
              children: [{ type: TokenType.TEXT, content: 'nested italic' }]
            }
          ]
        }
      ];
      expect(formatter.format(tokens)).toBe('<strong>bold with <em>nested italic</em></strong>');
    });

    it('should handle HTML characters in inline formatting', () => {
      const tokens: Token[] = [
        {
          type: TokenType.BOLD,
          children: [{ type: TokenType.TEXT, content: '<bold>' }]
        }
      ];
      expect(formatter.format(tokens)).toBe('<strong>&lt;bold&gt;</strong>');
    });
  });

  describe('headings', () => {
    it('should format H1 heading', () => {
      const tokens: Token[] = [
        {
          type: TokenType.H1,
          children: [{ type: TokenType.TEXT, content: 'Heading 1' }]
        }
      ];
      expect(formatter.format(tokens)).toBe('<h1>Heading 1</h1>');
    });

    it('should format all heading levels', () => {
      const headingTypes = [TokenType.H1, TokenType.H2, TokenType.H3, TokenType.H4, TokenType.H5, TokenType.H6];
      const expected = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

      headingTypes.forEach((type, index) => {
        const tokens: Token[] = [
          {
            type,
            children: [{ type: TokenType.TEXT, content: 'Heading' }]
          }
        ];
        expect(formatter.format(tokens)).toBe(`<${expected[index]}>Heading</${expected[index]}>`);
      });
    });

    it('should format heading with ID', () => {
      const tokens: Token[] = [
        {
          type: TokenType.H1,
          children: [{ type: TokenType.TEXT, content: 'Heading with ID' }],
          metadata: { id: 'custom-id' }
        }
      ];
      expect(formatter.format(tokens)).toBe('<h1 id="custom-id">Heading with ID</h1>');
    });

    it('should escape ID attribute', () => {
      const tokens: Token[] = [
        {
          type: TokenType.H1,
          children: [{ type: TokenType.TEXT, content: 'Heading' }],
          metadata: { id: '<script>' }
        }
      ];
      expect(formatter.format(tokens)).toBe('<h1 id="&lt;script&gt;">Heading</h1>');
    });

    it('should format heading with inline formatting', () => {
      const tokens: Token[] = [
        {
          type: TokenType.H2,
          children: [
            { type: TokenType.TEXT, content: 'Heading with ' },
            {
              type: TokenType.BOLD,
              children: [{ type: TokenType.TEXT, content: 'bold' }]
            },
            { type: TokenType.TEXT, content: ' text' }
          ]
        }
      ];
      expect(formatter.format(tokens)).toBe('<h2>Heading with <strong>bold</strong> text</h2>');
    });
  });

  describe('links and images', () => {
    it('should format basic link', () => {
      const tokens: Token[] = [
        {
          type: TokenType.LINK,
          children: [{ type: TokenType.TEXT, content: 'Example' }],
          metadata: { href: 'https://example.com', title: '' }
        }
      ];
      expect(formatter.format(tokens)).toBe('<a href="https://example.com">Example</a>');
    });

    it('should format link with title', () => {
      const tokens: Token[] = [
        {
          type: TokenType.LINK,
          children: [{ type: TokenType.TEXT, content: 'Example' }],
          metadata: { href: 'https://example.com', title: 'Example Site' }
        }
      ];
      expect(formatter.format(tokens)).toBe('<a href="https://example.com" title="Example Site">Example</a>');
    });

    it('should escape link attributes', () => {
      const tokens: Token[] = [
        {
          type: TokenType.LINK,
          children: [{ type: TokenType.TEXT, content: 'Link' }],
          metadata: { href: 'javascript:alert("xss")', title: '<script>' }
        }
      ];
      expect(formatter.format(tokens)).toBe('<a href="javascript:alert(&quot;xss&quot;)" title="&lt;script&gt;">Link</a>');
    });

    it('should format basic image', () => {
      const tokens: Token[] = [
        {
          type: TokenType.IMAGE,
          children: [{ type: TokenType.TEXT, content: 'Alt text' }],
          metadata: { src: 'image.jpg', title: '' }
        }
      ];
      expect(formatter.format(tokens)).toBe('<img src="image.jpg" alt="Alt text">');
    });

    it('should format image with title', () => {
      const tokens: Token[] = [
        {
          type: TokenType.IMAGE,
          children: [{ type: TokenType.TEXT, content: 'Alt text' }],
          metadata: { src: 'image.jpg', title: 'Image Title' }
        }
      ];
      expect(formatter.format(tokens)).toBe('<img src="image.jpg" alt="Alt text" title="Image Title">');
    });

    it('should escape image attributes', () => {
      const tokens: Token[] = [
        {
          type: TokenType.IMAGE,
          children: [{ type: TokenType.TEXT, content: '<script>' }],
          metadata: { src: 'javascript:alert("xss")', title: '<title>' }
        }
      ];
      expect(formatter.format(tokens)).toBe('<img src="javascript:alert(&quot;xss&quot;)" alt="&lt;script&gt;" title="&lt;title&gt;">');
    });

    it('should handle missing metadata', () => {
      const tokens: Token[] = [
        {
          type: TokenType.LINK,
          children: [{ type: TokenType.TEXT, content: 'Link' }]
        }
      ];
      expect(formatter.format(tokens)).toBe('<a href="">Link</a>');
    });
  });

  describe('blockquotes', () => {
    it('should format simple blockquote', () => {
      const tokens: Token[] = [
        {
          type: TokenType.BLOCKQUOTE,
          children: [{ type: TokenType.TEXT, content: 'This is a quote' }],
          metadata: { level: 1 }
        }
      ];
      expect(formatter.format(tokens)).toBe('<blockquote>This is a quote</blockquote>');
    });

    it('should format nested blockquote (same output as simple)', () => {
      const tokens: Token[] = [
        {
          type: TokenType.BLOCKQUOTE,
          children: [{ type: TokenType.TEXT, content: 'Nested quote' }],
          metadata: { level: 3 }
        }
      ];
      expect(formatter.format(tokens)).toBe('<blockquote>Nested quote</blockquote>');
    });

    it('should handle missing level metadata', () => {
      const tokens: Token[] = [
        {
          type: TokenType.BLOCKQUOTE,
          children: [{ type: TokenType.TEXT, content: 'Quote' }]
        }
      ];
      expect(formatter.format(tokens)).toBe('<blockquote>Quote</blockquote>');
    });
  });

  describe('lists', () => {
    it('should format unordered list item', () => {
      const tokens: Token[] = [
        {
          type: TokenType.UNORDERED_LIST_ITEM,
          children: [{ type: TokenType.TEXT, content: 'List item' }],
          metadata: { indent: 0 }
        }
      ];
      expect(formatter.format(tokens)).toBe('<li>List item</li>');
    });

    it('should format ordered list item', () => {
      const tokens: Token[] = [
        {
          type: TokenType.ORDERED_LIST_ITEM,
          children: [{ type: TokenType.TEXT, content: 'First item' }],
          metadata: { indent: 0, start: 1 }
        }
      ];
      expect(formatter.format(tokens)).toBe('<li>First item</li>');
    });

    it('should format unchecked task list item', () => {
      const tokens: Token[] = [
        {
          type: TokenType.TASK_LIST_ITEM,
          children: [{ type: TokenType.TEXT, content: 'Todo item' }],
          metadata: { indent: 0, checked: false }
        }
      ];
      const result = formatter.format(tokens);
      expect(result).toMatch(/^<li><input type="checkbox" id="[a-z0-9]+" disabled> <label for="[a-z0-9]+">Todo item<\/label><\/li>$/);
    });

    it('should format checked task list item', () => {
      const tokens: Token[] = [
        {
          type: TokenType.TASK_LIST_ITEM,
          children: [{ type: TokenType.TEXT, content: 'Done item' }],
          metadata: { indent: 0, checked: true }
        }
      ];
      const result = formatter.format(tokens);
      expect(result).toMatch(/^<li><input type="checkbox" id="[a-z0-9]+" checked disabled> <label for="[a-z0-9]+">Done item<\/label><\/li>$/);
    });
  });

  describe('tables', () => {
    it('should format table row', () => {
      const tokens: Token[] = [
        {
          type: TokenType.TABLE_ROW,
          children: [
            {
              type: TokenType.TABLE_CELL,
              children: [{ type: TokenType.TEXT, content: 'Header 1' }]
            },
            {
              type: TokenType.TABLE_CELL,
              children: [{ type: TokenType.TEXT, content: 'Header 2' }]
            }
          ]
        }
      ];
      expect(formatter.format(tokens)).toBe('<tr><td>Header 1</td><td>Header 2</td></tr>');
    });

    it('should ignore table separator', () => {
      const tokens: Token[] = [
        {
          type: TokenType.TABLE_SEPARATOR,
          metadata: { alignments: ['left', 'center', 'right'] }
        }
      ];
      expect(formatter.format(tokens)).toBe('');
    });

    it('should handle empty table row', () => {
      const tokens: Token[] = [
        {
          type: TokenType.TABLE_ROW,
          children: []
        }
      ];
      expect(formatter.format(tokens)).toBe('<tr></tr>');
    });

    it('should handle table cells with formatting', () => {
      const tokens: Token[] = [
        {
          type: TokenType.TABLE_ROW,
          children: [
            {
              type: TokenType.TABLE_CELL,
              children: [
                {
                  type: TokenType.BOLD,
                  children: [{ type: TokenType.TEXT, content: 'Bold header' }]
                }
              ]
            }
          ]
        }
      ];
      expect(formatter.format(tokens)).toBe('<tr><td><strong>Bold header</strong></td></tr>');
    });
  });

  describe('code and miscellaneous', () => {
    it('should format code fence without language', () => {
      const tokens: Token[] = [
        { type: TokenType.CODE_FENCE, content: 'console.log("hello");' }
      ];
      expect(formatter.format(tokens)).toBe('<pre><code>console.log(&quot;hello&quot;);</code></pre>');
    });

    it('should format code fence with language', () => {
      const tokens: Token[] = [
        {
          type: TokenType.CODE_FENCE,
          content: 'console.log("hello");',
          metadata: { lang: 'javascript' }
        }
      ];
      expect(formatter.format(tokens)).toBe('<pre><code class="language-javascript">console.log(&quot;hello&quot;);</code></pre>');
    });

    it('should escape code content', () => {
      const tokens: Token[] = [
        {
          type: TokenType.CODE_FENCE,
          content: '<script>alert("xss")</script>',
          metadata: { lang: 'html' }
        }
      ];
      expect(formatter.format(tokens)).toBe('<pre><code class="language-html">&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;</code></pre>');
    });

    it('should escape language attribute', () => {
      const tokens: Token[] = [
        {
          type: TokenType.CODE_FENCE,
          content: 'code',
          metadata: { lang: '<script>' }
        }
      ];
      expect(formatter.format(tokens)).toBe('<pre><code class="language-&lt;script&gt;">code</code></pre>');
    });

    it('should format horizontal rule', () => {
      const tokens: Token[] = [
        { type: TokenType.HORIZONTAL_RULE }
      ];
      expect(formatter.format(tokens)).toBe('<hr>');
    });

    it('should format footnote reference', () => {
      const tokens: Token[] = [
        { type: TokenType.FOOTNOTE_REF, content: 'note1' }
      ];
      expect(formatter.format(tokens)).toBe('<sup><a href="#fn-note1" id="fnref-note1">note1</a></sup>');
    });

    it('should format footnote definition', () => {
      const tokens: Token[] = [
        {
          type: TokenType.FOOTNOTE_DEF,
          metadata: { id: 'note1' },
          children: [{ type: TokenType.TEXT, content: 'Footnote content' }]
        }
      ];
      expect(formatter.format(tokens)).toBe('<div id="fn-note1" class="footnote"><a href="#fnref-note1">note1</a>: Footnote content</div>');
    });

    it('should escape footnote IDs', () => {
      const tokens: Token[] = [
        { type: TokenType.FOOTNOTE_REF, content: '<script>' }
      ];
      expect(formatter.format(tokens)).toBe('<sup><a href="#fn-&lt;script&gt;" id="fnref-&lt;script&gt;">&lt;script&gt;</a></sup>');
    });

    it('should format empty line', () => {
      const tokens: Token[] = [
        { type: TokenType.EMPTY_LINE, content: '\n' }
      ];
      expect(formatter.format(tokens)).toBe('<br>');
    });
  });

  describe('edge cases', () => {
    it('should handle unknown token types', () => {
      const tokens: Token[] = [
        { type: 'custom_type' as TokenType, content: 'custom content' }
      ];
      expect(formatter.format(tokens)).toBe('custom content');
    });

    it('should escape content in unknown token types', () => {
      const tokens: Token[] = [
        { type: 'custom_type' as TokenType, content: '<script>' }
      ];
      expect(formatter.format(tokens)).toBe('&lt;script&gt;');
    });

    it('should handle tokens without content or children', () => {
      const tokens: Token[] = [
        { type: 'unknown' as TokenType }
      ];
      expect(formatter.format(tokens)).toBe('');
    });

    it('should handle complex nested structures', () => {
      const tokens: Token[] = [
        {
          type: TokenType.BLOCKQUOTE,
          metadata: { level: 1 },
          children: [
            {
              type: TokenType.BOLD,
              children: [
                { type: TokenType.TEXT, content: 'Bold in ' },
                {
                  type: TokenType.ITALIC,
                  children: [{ type: TokenType.TEXT, content: 'nested' }]
                },
                { type: TokenType.TEXT, content: ' quote' }
              ]
            }
          ]
        }
      ];
      expect(formatter.format(tokens)).toBe('<blockquote><strong>Bold in <em>nested</em> quote</strong></blockquote>');
    });

    it('should handle multiple tokens in sequence', () => {
      const tokens: Token[] = [
        { type: TokenType.TEXT, content: 'Start ' },
        {
          type: TokenType.BOLD,
          children: [{ type: TokenType.TEXT, content: 'bold' }]
        },
        { type: TokenType.TEXT, content: ' middle ' },
        {
          type: TokenType.ITALIC,
          children: [{ type: TokenType.TEXT, content: 'italic' }]
        },
        { type: TokenType.TEXT, content: ' end' }
      ];
      expect(formatter.format(tokens)).toBe('Start <strong>bold</strong> middle <em>italic</em> end');
    });

    it('should handle extremely nested structures', () => {
      const tokens: Token[] = [
        {
          type: TokenType.BOLD,
          children: [
            {
              type: TokenType.ITALIC,
              children: [
                {
                  type: TokenType.LINK,
                  metadata: { href: 'http://example.com', title: 'Link Title' },
                  children: [
                    {
                      type: TokenType.STRIKETHROUGH,
                      content: 'complex'
                    }
                  ]
                }
              ]
            }
          ]
        }
      ];
      expect(formatter.format(tokens)).toBe('<strong><em><a href="http://example.com" title="Link Title"><del>complex</del></a></em></strong>');
    });

    it('should handle cursor in complex formatting', () => {
      const tokens: Token[] = [
        { type: TokenType.TEXT, content: 'Before ' },
        { type: TokenType.CURSOR },
        { type: TokenType.TEXT, content: ' and ' },
        {
          type: TokenType.BOLD,
          children: [{ type: TokenType.TEXT, content: 'bold' }]
        },
        { type: TokenType.TEXT, content: ' and ' },
        { type: TokenType.CURSOR },
        { type: TokenType.TEXT, content: ' after' }
      ];
      expect(formatter.format(tokens)).toBe('Before <span class="cursor"></span> and <strong>bold</strong> and <span class="cursor"></span> after');
    });
  });
});