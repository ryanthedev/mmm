import { describe, it, expect } from 'vitest';
import { parse, Token, TokenType, TokenParser, TokenHook } from '../src/mmmv2';

describe('token parser', () => {
  describe('parse', () => {
    it('should parse plain text', () => {
      const tokens = parse('a line of text');
      expect(tokens).toEqual([
        { type: 'text', content: 'a line of text' }
      ]);
    });

    it('should parse heading', () => {
      const tokens = parse('# Heading 1');
      expect(tokens).toEqual([
        { type: 'h1', children: [{ type: 'text', content: 'Heading 1' }] }
      ]);
    });

    it('should parse heading with ID', () => {
      const tokens = parse('# Heading 1 {#custom-id}');
      expect(tokens).toEqual([
        { type: 'h1', children: [{ type: 'text', content: 'Heading 1' }], metadata: { id: 'custom-id' } }
      ]);
    });

    it('should parse bold text with surrounding text', () => {
      const tokens = parse('the quick **brown** fox');
      expect(tokens).toEqual([
        { type: 'text', content: 'the quick ' },
        { type: 'bold', children: [{ type: 'text', content: 'brown' }] },
        { type: 'text', content: ' fox' }
      ]);
    });

    it('should parse bold with underscores', () => {
      const tokens = parse('the quick __brown__ fox');
      expect(tokens).toEqual([
        { type: 'text', content: 'the quick ' },
        { type: 'bold', children: [{ type: 'text', content: 'brown' }] },
        { type: 'text', content: ' fox' }
      ]);
    });

    it('should handle multiple heading levels', () => {
      expect(parse('## Heading 2')).toEqual([{ type: 'h2', children: [{ type: 'text', content: 'Heading 2' }] }]);
      expect(parse('### Heading 3')).toEqual([{ type: 'h3', children: [{ type: 'text', content: 'Heading 3' }] }]);
    });

    it('should parse headings with bold formatting', () => {
      const tokens = parse('# This is **bold** heading');
      expect(tokens).toEqual([
        {
          type: 'h1',
          children: [
            { type: 'text', content: 'This is ' },
            { type: 'bold', children: [{ type: 'text', content: 'bold' }] },
            { type: 'text', content: ' heading' }
          ]
        }
      ]);
    });

    it('should parse headings with italic formatting', () => {
      const tokens = parse('## Heading with *italic* text');
      expect(tokens).toEqual([
        {
          type: 'h2',
          children: [
            { type: 'text', content: 'Heading with ' },
            { type: 'italic', children: [{ type: 'text', content: 'italic' }] },
            { type: 'text', content: ' text' }
          ]
        }
      ]);
    });

    it('should parse headings with multiple formatting types', () => {
      const tokens = parse('### **Bold** and *italic* and ==highlight== text');
      expect(tokens).toEqual([
        {
          type: 'h3',
          children: [
            { type: 'bold', children: [{ type: 'text', content: 'Bold' }] },
            { type: 'text', content: ' and ' },
            { type: 'italic', children: [{ type: 'text', content: 'italic' }] },
            { type: 'text', content: ' and ' },
            { type: 'highlight', content: 'highlight' },
            { type: 'text', content: ' text' }
          ]
        }
      ]);
    });

    it('should parse headings with nested formatting', () => {
      const tokens = parse('# **Bold with *nested italic* inside**');
      expect(tokens).toEqual([
        {
          type: 'h1',
          children: [
            {
              type: 'bold',
              children: [
                { type: 'text', content: 'Bold with ' },
                { type: 'italic', children: [{ type: 'text', content: 'nested italic' }] },
                { type: 'text', content: ' inside' }
              ]
            }
          ]
        }
      ]);
    });

    it('should parse headings with inline code', () => {
      const tokens = parse('## How to use `console.log()` function');
      expect(tokens).toEqual([
        {
          type: 'h2',
          children: [
            { type: 'text', content: 'How to use ' },
            { type: 'inline_code', content: 'console.log()' },
            { type: 'text', content: ' function' }
          ]
        }
      ]);
    });

    it('should parse headings with links', () => {
      const tokens = parse('# Visit [GitHub](https://github.com) for code');
      expect(tokens).toEqual([
        {
          type: 'h1',
          children: [
            { type: 'text', content: 'Visit ' },
            { type: 'link', children: [{ type: 'text', content: 'GitHub' }], metadata: { href: 'https://github.com', title: '' } },
            { type: 'text', content: ' for code' }
          ]
        }
      ]);
    });

    it('should parse empty string as empty line', () => {
      const tokens = parse('');
      expect(tokens).toEqual([{ type: 'empty_line', content: '' }]);
    });

    it('should parse whitespace-only lines as empty lines', () => {
      expect(parse('   ')).toEqual([{ type: 'empty_line', content: '   ' }]);
      expect(parse('\t\t')).toEqual([{ type: 'empty_line', content: '\t\t' }]);
      expect(parse(' \t ')).toEqual([{ type: 'empty_line', content: ' \t ' }]);
    });

    it('should parse newline characters as empty lines', () => {
      expect(parse('\n')).toEqual([{ type: 'empty_line', content: '\n' }]);
      expect(parse('\r\n')).toEqual([{ type: 'empty_line', content: '\r\n' }]);
      expect(parse('\r')).toEqual([{ type: 'empty_line', content: '\r' }]);
    });

    it('should parse mixed whitespace and newlines as empty lines', () => {
      expect(parse('  \n')).toEqual([{ type: 'empty_line', content: '  \n' }]);
      expect(parse('\t\r\n')).toEqual([{ type: 'empty_line', content: '\t\r\n' }]);
      expect(parse(' \n \r ')).toEqual([{ type: 'empty_line', content: ' \n \r ' }]);
    });
  });

  describe('TokenParser plugin system', () => {
    it('should create parser without plugins', () => {
      const parser = new TokenParser();
      const result = parser.parse('**bold**');
      expect(result).toEqual([
        { type: 'bold', children: [{ type: 'text', content: 'bold' }] }
      ]);
    });

    it('should register and use plugins', () => {
      const mathPlugin = {
        name: 'math',
        priority: 100,
        canHandle: (line) => line.startsWith('$$') && line.endsWith('$$'),
        parse: (line, parseInline) => {
          const content = line.slice(2, -2).trim();
          return [{ type: 'math', content }];
        }
      };

      const parser = new TokenParser({ plugins: [mathPlugin] });
      const result = parser.parse('$$E = mc^2$$');
      expect(result).toEqual([{ type: 'math', content: 'E = mc^2' }]);
    });

    it('should allow plugins to use built-in parsing for nested tokens', () => {
      const mathPlugin = {
        name: 'math',
        priority: 100,
        canHandle: (line) => line.startsWith('$$') && line.endsWith('$$'),
        parse: (line, parseInline) => {
          const content = line.slice(2, -2).trim();
          return [{ type: 'math', children: parseInline(content) }];
        }
      };

      const parser = new TokenParser({ plugins: [mathPlugin] });
      const result = parser.parse('$$E = **mc**^2^$$');
      expect(result).toEqual([
        {
          type: 'math',
          children: [
            { type: 'text', content: 'E = ' },
            { type: 'bold', children: [{ type: 'text', content: 'mc' }] },
            { type: 'superscript', content: '2' }
          ]
        }
      ]);
    });

    it('should respect plugin priority order', () => {
      const highPriorityPlugin = {
        name: 'high',
        priority: 100,
        canHandle: (line) => line.includes('test'),
        parse: (line, parseInline) => [{ type: 'high_priority', content: line }]
      };

      const lowPriorityPlugin = {
        name: 'low',
        priority: 50,
        canHandle: (line) => line.includes('test'),
        parse: (line, parseInline) => [{ type: 'low_priority', content: line }]
      };

      const parser = new TokenParser({ 
        plugins: [lowPriorityPlugin, highPriorityPlugin] 
      });
      const result = parser.parse('test line');
      expect(result).toEqual([{ type: 'high_priority', content: 'test line' }]);
    });

    it('should fall back to built-in parsing when plugins return null', () => {
      const nullPlugin = {
        name: 'null',
        priority: 100,
        canHandle: (line) => line.includes('fallback'),
        parse: (line, parseInline) => null
      };

      const parser = new TokenParser({ plugins: [nullPlugin] });
      const result = parser.parse('**fallback bold**');
      expect(result).toEqual([
        { type: 'bold', children: [{ type: 'text', content: 'fallback bold' }] }
      ]);
    });

    it('should fall back to built-in parsing when no plugins can handle', () => {
      const specificPlugin = {
        name: 'specific',
        priority: 100,
        canHandle: (line) => line.startsWith('SPECIAL:'),
        parse: (line, parseInline) => [{ type: 'special', content: line.slice(8) }]
      };

      const parser = new TokenParser({ plugins: [specificPlugin] });
      const result = parser.parse('**regular bold**');
      expect(result).toEqual([
        { type: 'bold', children: [{ type: 'text', content: 'regular bold' }] }
      ]);
    });

    it('should add plugins dynamically', () => {
      const parser = new TokenParser();
      
      const alertPlugin = {
        name: 'alert',
        priority: 90,
        canHandle: (line) => line.startsWith('!!! '),
        parse: (line, parseInline) => {
          const content = line.slice(4).trim();
          const [type, ...messageParts] = content.split(' ');
          return [{
            type: 'alert',
            content: messageParts.join(' '),
            metadata: { alertType: type }
          }];
        }
      };

      parser.addPlugin(alertPlugin);
      const result = parser.parse('!!! warning This is a warning');
      expect(result).toEqual([{
        type: 'alert',
        content: 'This is a warning',
        metadata: { alertType: 'warning' }
      }]);
    });

    it('should remove plugins by name', () => {
      const testPlugin = {
        name: 'test',
        priority: 100,
        canHandle: (line) => line.startsWith('TEST:'),
        parse: (line, parseInline) => [{ type: 'test', content: line.slice(5) }]
      };

      const parser = new TokenParser({ plugins: [testPlugin] });
      
      // Should use plugin
      let result = parser.parse('TEST:hello');
      expect(result).toEqual([{ type: 'test', content: 'hello' }]);
      
      // Remove plugin
      parser.removePlugin('test');
      
      // Should fall back to built-in parsing
      result = parser.parse('TEST:hello');
      expect(result).toEqual([{ type: 'text', content: 'TEST:hello' }]);
    });

    it('should handle multiple plugins with different priorities', () => {
      const emojiPlugin = {
        name: 'emoji',
        priority: 80,
        canHandle: (line) => line.startsWith(':') && line.endsWith(':') && !line.includes(' '),
        parse: (line, parseInline) => [{ type: 'emoji', content: line.slice(1, -1) }]
      };

      const mathPlugin = {
        name: 'math',
        priority: 90,
        canHandle: (line) => line.startsWith('$$') && line.endsWith('$$'),
        parse: (line, parseInline) => [{ type: 'math', content: line.slice(2, -2).trim() }]
      };

      const parser = new TokenParser({ plugins: [emojiPlugin, mathPlugin] });
      
      expect(parser.parse(':smile:')).toEqual([{ type: 'emoji', content: 'smile' }]);
      expect(parser.parse('$$x^2$$')).toEqual([{ type: 'math', content: 'x^2' }]);
      expect(parser.parse('**bold**')).toEqual([
        { type: 'bold', children: [{ type: 'text', content: 'bold' }] }
      ]);
    });

    it('should handle bold at start of line', () => {
      const tokens = parse('**bold** text');
      expect(tokens).toEqual([
        { type: 'bold', children: [{ type: 'text', content: 'bold' }] },
        { type: 'text', content: ' text' }
      ]);
    });

    it('should handle bold at end of line', () => {
      const tokens = parse('text **bold**');
      expect(tokens).toEqual([
        { type: 'text', content: 'text ' },
        { type: 'bold', children: [{ type: 'text', content: 'bold' }] }
      ]);
    });

    it('should parse italic text', () => {
      const tokens = parse('this is *italic* text');
      expect(tokens).toEqual([
        { type: 'text', content: 'this is ' },
        { type: 'italic', children: [{ type: 'text', content: 'italic' }] },
        { type: 'text', content: ' text' }
      ]);
    });

    it('should parse italic with underscores', () => {
      const tokens = parse('this is _italic_ text');
      expect(tokens).toEqual([
        { type: 'text', content: 'this is ' },
        { type: 'italic', children: [{ type: 'text', content: 'italic' }] },
        { type: 'text', content: ' text' }
      ]);
    });

    it('should parse blockquote with mixed formatting', () => {
      const tokens = parse('> *Everything* is going according to **plan**.');
      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toMatchObject({
        type: 'blockquote',
        metadata: { level: 1 }
      });
      expect(tokens[0].children).toEqual([
        { type: 'italic', children: [{ type: 'text', content: 'Everything' }] },
        { type: 'text', content: ' is going according to ' },
        { type: 'bold', children: [{ type: 'text', content: 'plan' }] },
        { type: 'text', content: '.' }
      ]);
    });

    it('should parse nested blockquote', () => {
      const tokens = parse('>> Nested quote');
      expect(tokens[0]).toMatchObject({
        type: 'blockquote',
        metadata: { level: 2 },
        children: [{ type: 'text', content: 'Nested quote' }]
      });
    });

    it('should parse simple blockquote', () => {
      const tokens = parse('> This is a quote');
      expect(tokens).toEqual([{
        type: 'blockquote',
        metadata: { level: 1 },
        children: [
          { type: 'text', content: 'This is a quote' }
        ]
      }]);
    });

    it('should handle blockquote with only bold', () => {
      const tokens = parse('> **Important** message');
      expect(tokens[0].children).toEqual([
        { type: 'bold', children: [{ type: 'text', content: 'Important' }] },
        { type: 'text', content: ' message' }
      ]);
    });

    it('should handle mixed bold and italic', () => {
      const tokens = parse('**bold** and *italic* together');
      expect(tokens).toEqual([
        { type: 'bold', children: [{ type: 'text', content: 'bold' }] },
        { type: 'text', content: ' and ' },
        { type: 'italic', children: [{ type: 'text', content: 'italic' }] },
        { type: 'text', content: ' together' }
      ]);
    });

    it('should handle nested emphasis', () => {
      const tokens = parse('the quick **brown *fox*** jumps');
      expect(tokens).toEqual([
        { type: 'text', content: 'the quick ' },
        { type: 'bold', children: [
          { type: 'text', content: 'brown ' },
          { type: 'italic', children: [{ type: 'text', content: 'fox' }] }
        ] },
        { type: 'text', content: ' jumps' }
      ]);
    });

    it('should parse code fence without language', () => {
      const tokens = parse('```');
      expect(tokens).toEqual([{
        type: 'code_fence',
        content: ''
      }]);
    });

    it('should parse code fence with language', () => {
      const tokens = parse('```javascript');
      expect(tokens).toEqual([{
        type: 'code_fence',
        content: '',
        metadata: { lang: 'javascript' }
      }]);
    });

    it('should parse code fence with different languages', () => {
      const pythonTokens = parse('```python');
      expect(pythonTokens[0]).toMatchObject({
        type: 'code_fence',
        metadata: { lang: 'python' }
      });

      const tsTokens = parse('```typescript');
      expect(tsTokens[0]).toMatchObject({
        type: 'code_fence',
        metadata: { lang: 'typescript' }
      });
    });

    it('should handle code fence with no space after backticks', () => {
      const tokens = parse('```rust');
      expect(tokens).toEqual([{
        type: 'code_fence',
        content: '',
        metadata: { lang: 'rust' }
      }]);
    });

    it('should parse inline code', () => {
      const tokens = parse('this is `code` inline');
      expect(tokens).toEqual([
        { type: 'text', content: 'this is ' },
        { type: 'inline_code', content: 'code' },
        { type: 'text', content: ' inline' }
      ]);
    });

    it('should parse strikethrough', () => {
      const tokens = parse('this is ~~strikethrough~~ text');
      expect(tokens).toEqual([
        { type: 'text', content: 'this is ' },
        { type: 'strikethrough', content: 'strikethrough' },
        { type: 'text', content: ' text' }
      ]);
    });

    it('should parse highlight', () => {
      const tokens = parse('this is ==highlight== text');
      expect(tokens).toEqual([
        { type: 'text', content: 'this is ' },
        { type: 'highlight', content: 'highlight' },
        { type: 'text', content: ' text' }
      ]);
    });

    it('should parse subscript', () => {
      const tokens = parse('H~2~O');
      expect(tokens).toEqual([
        { type: 'text', content: 'H' },
        { type: 'subscript', content: '2' },
        { type: 'text', content: 'O' }
      ]);
    });

    it('should parse superscript', () => {
      const tokens = parse('X^2^');
      expect(tokens).toEqual([
        { type: 'text', content: 'X' },
        { type: 'superscript', content: '2' }
      ]);
    });

    it('should parse link', () => {
      const tokens = parse('this is a [link](https://example.com)');
      expect(tokens).toEqual([
        { type: 'text', content: 'this is a ' },
        { type: 'link', children: [{ type: 'text', content: 'link' }], metadata: { href: 'https://example.com', title: '' } }
      ]);
    });

    it('should parse link with title', () => {
      const tokens = parse('[link](https://example.com "title")');
      expect(tokens).toEqual([
        { type: 'link', children: [{ type: 'text', content: 'link' }], metadata: { href: 'https://example.com', title: 'title' } }
      ]);
    });

    it('should parse image', () => {
      const tokens = parse('this is an <image-card alt="alt" src="https://example.com/img.png" ></image-card>');
      expect(tokens).toEqual([
        { type: 'text', content: 'this is an ' },
        { type: 'image', children: [{ type: 'text', content: 'alt' }], metadata: { src: 'https://example.com/img.png', title: '' } }
      ]);
    });

    it('should parse autolink', () => {
      const tokens = parse('visit <https://example.com>');
      expect(tokens).toEqual([
        { type: 'text', content: 'visit ' },
        { type: 'link', children: [{ type: 'text', content: 'https://example.com' }], metadata: { href: 'https://example.com' } }
      ]);
    });

    it('should parse footnote reference', () => {
      const tokens = parse('this is a footnote[^1]');
      expect(tokens).toEqual([
        { type: 'text', content: 'this is a footnote' },
        { type: 'footnote_ref', content: '1' }
      ]);
    });

    it('should parse footnote definition', () => {
      const tokens = parse('[^1]: This is the footnote');
      expect(tokens).toEqual([{
        type: 'footnote_def',
        metadata: { id: '1' },
        children: [{ type: 'text', content: 'This is the footnote' }]
      }]);
    });

    it('should parse unordered list item', () => {
      const tokens = parse('- item');
      expect(tokens).toEqual([{
        type: 'unordered_list_item',
        metadata: { indent: 0 },
        children: [{ type: 'text', content: 'item' }]
      }]);
    });

    it('should parse ordered list item', () => {
      const tokens = parse('1. item');
      expect(tokens).toEqual([{
        type: 'ordered_list_item',
        metadata: { indent: 0, start: 1 },
        children: [{ type: 'text', content: 'item' }]
      }]);
    });

    it('should parse task list item unchecked', () => {
      const tokens = parse('- [ ] task');
      expect(tokens).toEqual([{
        type: 'task_list_item',
        metadata: { indent: 0, checked: false },
        children: [{ type: 'text', content: 'task' }]
      }]);
    });

    it('should parse task list item checked', () => {
      const tokens = parse('- [x] task');
      expect(tokens).toEqual([{
        type: 'task_list_item',
        metadata: { indent: 0, checked: true },
        children: [{ type: 'text', content: 'task' }]
      }]);
    });

    it('should parse horizontal rule', () => {
      expect(parse('---')).toEqual([{ type: 'hr' }]);
      expect(parse('***')).toEqual([{ type: 'hr' }]);
      expect(parse('___')).toEqual([{ type: 'hr' }]);
      expect(parse('- - -')).toEqual([{ type: 'hr' }]);
    });

    it('should parse table row', () => {
      const tokens = parse('col1 | col2 | col3');
      expect(tokens).toEqual([{
        type: 'table_row',
        children: [
          { type: 'table_cell', children: [{ type: 'text', content: 'col1' }] },
          { type: 'table_cell', children: [{ type: 'text', content: 'col2' }] },
          { type: 'table_cell', children: [{ type: 'text', content: 'col3' }] }
        ]
      }]);
    });

    it('should parse table separator', () => {
      const tokens = parse('--- | :---: | ---:');
      expect(tokens).toEqual([{
        type: 'table_separator',
        metadata: { alignments: ['none', 'center', 'right'] }
      }]);
    });

    it('should handle escaping', () => {
      const tokens = parse('this is \\*not\\* italic');
      expect(tokens).toEqual([
        { type: 'text', content: 'this is ' },
        { type: 'text', content: '*' },
        { type: 'text', content: 'not' },
        { type: 'text', content: '*' },
        { type: 'text', content: ' italic' }
      ]);
    });

    it('should use string types allowing custom types', () => {
      // This test verifies that type is a string, not a restricted union
      const token: Token = {
        type: 'custom_type',
        content: 'test'
      };
      expect(token.type).toBe('custom_type');
    });
  });

  describe('TokenParser hook system', () => {
    it('should apply hooks to tokens after parsing', () => {
      const cssHook: TokenHook = {
        name: 'css-classes',
        tokenType: 'bold',
        process: (token) => ({
          ...token,
          metadata: { ...token.metadata, cssClass: 'font-bold text-lg' }
        })
      };

      const parser = new TokenParser({ hooks: [cssHook] });
      const result = parser.parse('This is **bold** text');
      
      expect(result).toEqual([
        { type: 'text', content: 'This is ' },
        { 
          type: 'bold', 
          children: [{ type: 'text', content: 'bold' }],
          metadata: { cssClass: 'font-bold text-lg' }
        },
        { type: 'text', content: ' text' }
      ]);
    });

    it('should apply hooks recursively to nested tokens', () => {
      const boldHook: TokenHook = {
        name: 'bold-theme',
        tokenType: 'bold',
        process: (token) => ({
          ...token,
          metadata: { ...token.metadata, theme: 'primary' }
        })
      };

      const italicHook: TokenHook = {
        name: 'italic-theme',
        tokenType: 'italic',
        process: (token) => ({
          ...token,
          metadata: { ...token.metadata, theme: 'secondary' }
        })
      };

      const parser = new TokenParser({ hooks: [boldHook, italicHook] });
      const result = parser.parse('**Bold with *nested italic* inside**');
      
      expect(result).toEqual([
        {
          type: 'bold',
          metadata: { theme: 'primary' },
          children: [
            { type: 'text', content: 'Bold with ' },
            { 
              type: 'italic', 
              children: [{ type: 'text', content: 'nested italic' }],
              metadata: { theme: 'secondary' }
            },
            { type: 'text', content: ' inside' }
          ]
        }
      ]);
    });

    it('should add hooks dynamically', () => {
      const parser = new TokenParser();
      
      const highlightHook: TokenHook = {
        name: 'highlight-style',
        tokenType: 'highlight',
        process: (token) => ({
          ...token,
          metadata: { ...token.metadata, backgroundColor: 'yellow' }
        })
      };

      parser.addHook(highlightHook);
      const result = parser.parse('This is ==highlighted== text');
      
      expect(result).toEqual([
        { type: 'text', content: 'This is ' },
        { 
          type: 'highlight', 
          content: 'highlighted',
          metadata: { backgroundColor: 'yellow' }
        },
        { type: 'text', content: ' text' }
      ]);
    });

    it('should remove hooks by name and token type', () => {
      const hook: TokenHook = {
        name: 'test-hook',
        tokenType: 'bold',
        process: (token) => ({
          ...token,
          metadata: { ...token.metadata, processed: true }
        })
      };

      const parser = new TokenParser({ hooks: [hook] });
      
      // Should apply hook
      let result = parser.parse('**bold**');
      expect(result[0].metadata).toEqual({ processed: true });
      
      // Remove hook
      parser.removeHook('bold', 'test-hook');
      
      // Should not apply hook
      result = parser.parse('**bold**');
      expect(result[0].metadata).toBeUndefined();
    });

    it('should apply multiple hooks to the same token type in order', () => {
      const hook1: TokenHook = {
        name: 'first',
        tokenType: 'text',
        process: (token) => ({
          ...token,
          metadata: { ...token.metadata, step: 1 }
        })
      };

      const hook2: TokenHook = {
        name: 'second',
        tokenType: 'text',
        process: (token) => ({
          ...token,
          metadata: { ...token.metadata, step: 2, previous: token.metadata?.step }
        })
      };

      const parser = new TokenParser({ hooks: [hook1, hook2] });
      const result = parser.parse('plain text');
      
      expect(result).toEqual([
        { 
          type: 'text', 
          content: 'plain text',
          metadata: { step: 2, previous: 1 }
        }
      ]);
    });

    it('should work with plugins and hooks together', () => {
      const mathPlugin = {
        name: 'math',
        priority: 100,
        canHandle: (line) => line.startsWith('$$') && line.endsWith('$$'),
        parse: (line, parseInline) => {
          const content = line.slice(2, -2).trim();
          return [{ type: 'math', children: parseInline(content) }];
        }
      };

      const mathHook: TokenHook = {
        name: 'math-styling',
        tokenType: 'math',
        process: (token) => ({
          ...token,
          metadata: { ...token.metadata, className: 'math-expression', katex: true }
        })
      };

      const boldHook: TokenHook = {
        name: 'bold-styling',
        tokenType: 'bold',
        process: (token) => ({
          ...token,
          metadata: { ...token.metadata, fontWeight: 'bold' }
        })
      };

      const parser = new TokenParser({ 
        plugins: [mathPlugin], 
        hooks: [mathHook, boldHook] 
      });
      
      const result = parser.parse('$$E = **mc**^2^$$');
      
      expect(result).toEqual([
        {
          type: 'math',
          metadata: { className: 'math-expression', katex: true },
          children: [
            { type: 'text', content: 'E = ' },
            { 
              type: 'bold', 
              children: [{ type: 'text', content: 'mc' }],
              metadata: { fontWeight: 'bold' }
            },
            { type: 'superscript', content: '2' }
          ]
        }
      ]);
    });
  });
});