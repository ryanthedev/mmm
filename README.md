# mmm

A streaming markdown parser with plugin-based architecture for TypeScript.

## Features

- **Line-by-line streaming parser** - Process markdown incrementally
- **Extensible plugin system** - Add custom parsing rules with priority ordering
- **Token hooks** - Transform tokens after parsing
- **Cursor support** - Track cursor position in text (`@!` notation)
- **Emoji support** - Built-in emoji shortcode parsing (`:smile:` → 😊)
- **TypeScript first** - Full type safety with flexible token types
- **Formatters included** - Markdown and HTML output formatters

## Installation

```bash
npm install mmm
```

## Quick Start

```typescript
import { parse, TokenParser, MarkdownFormatter, HTMLFormatter } from 'mmm';

// Simple parsing
const tokens = parse('This is **bold** text');
console.log(tokens);
// [
//   { type: 'text', content: 'This is ' },
//   { type: 'bold', children: [{ type: 'text', content: 'bold' }] },
//   { type: 'text', content: ' text' }
// ]

// Format back to markdown
const formatter = new MarkdownFormatter();
const markdown = formatter.format(tokens);
// "This is **bold** text"

// Or to HTML
const htmlFormatter = new HTMLFormatter();
const html = htmlFormatter.format(tokens);
// "This is <strong>bold</strong> text"
```

## Cursor Support

The parser includes special support for tracking cursor position using the `@!` notation:

```typescript
import { parse, TokenType } from 'mmm';

// Parse text with cursor
const tokens = parse('Hello @! world');
// [
//   { type: 'text', content: 'Hello ' },
//   { type: 'cursor', content: ' ' },  // Captures character after @!
//   { type: 'text', content: 'world' }
// ]

// Cursor in formatted text
const boldWithCursor = parse('**bold @! text**');
// [
//   {
//     type: 'bold',
//     children: [
//       { type: 'text', content: 'bold ' },
//       { type: 'cursor', content: ' ' },
//       { type: 'text', content: 'text' }
//     ]
//   }
// ]

// Multiple cursors
const multiCursor = parse('Start @! middle @! end');
// Tracks multiple cursor positions throughout the text
```

## Emoji Support

Built-in emoji shortcode parsing with customizable mappings:

```typescript
import { parse, EmojiManager, createEmojiManagerWithNodeEmoji } from 'mmm';

// Use default emoji set
const manager = new EmojiManager();
manager.addEmoji('custom', '🎯');

const tokens = parse(':smile: :custom:', manager);
// [
//   { type: 'emoji', content: '😊', metadata: { shortcode: 'smile' } },
//   { type: 'text', content: ' ' },
//   { type: 'emoji', content: '🎯', metadata: { shortcode: 'custom' } }
// ]

// Or use node-emoji library (if installed)
const fullManager = createEmojiManagerWithNodeEmoji();
```

## Plugin System

Create custom parsing rules with the plugin system:

```typescript
import { TokenParser, ParsePlugin } from 'mmm';

// Create a custom plugin for @mentions
const mentionPlugin: ParsePlugin = {
  name: 'mention',
  priority: 100, // Higher priority runs first
  canHandle: (line: string) => line.includes('@'),
  parse: (line: string, parseInline) => {
    const regex = /@(\w+)/g;
    const tokens = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(line)) !== null) {
      // Add text before mention
      if (match.index > lastIndex) {
        tokens.push(...parseInline(line.slice(lastIndex, match.index)));
      }

      // Add mention token
      tokens.push({
        type: 'mention',
        content: match[1],
        metadata: { username: match[1] }
      });

      lastIndex = regex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < line.length) {
      tokens.push(...parseInline(line.slice(lastIndex)));
    }

    return tokens;
  }
};

const parser = new TokenParser({ plugins: [mentionPlugin] });
const result = parser.parse('Hello @alice and @bob!');
```

## Hook System

Transform tokens after parsing with hooks:

```typescript
import { TokenParser, TokenHook } from 'mmm';

// Add CSS classes to bold tokens
const cssHook: TokenHook = {
  name: 'css-bold',
  tokenType: 'bold',
  process: (token) => ({
    ...token,
    metadata: {
      ...token.metadata,
      className: 'font-bold text-emphasis'
    }
  })
};

// Add data attributes to links
const linkHook: TokenHook = {
  name: 'link-tracker',
  tokenType: 'link',
  process: (token) => ({
    ...token,
    metadata: {
      ...token.metadata,
      dataTrack: true,
      target: '_blank'
    }
  })
};

const parser = new TokenParser({
  hooks: [cssHook, linkHook]
});
```

## Supported Markdown Elements

### Inline Formatting
- **Bold**: `**text**` or `__text__`
- **Italic**: `*text*` or `_text_`
- **Strikethrough**: `~~text~~`
- **Highlight**: `==text==`
- **Code**: `` `code` ``
- **Subscript**: `~text~`
- **Superscript**: `^text^`
- **Links**: `[text](url "title")`
- **Images**: `![alt](url "title")`
- **Autolinks**: `<https://example.com>`

### Block Elements
- **Headings**: `# H1` to `###### H6` with optional IDs `{#custom-id}`
- **Blockquotes**: `> quote` with nesting support
- **Code blocks**: ` ```language `
- **Lists**: Unordered (`-`, `*`, `+`), ordered (`1.`), task (`- [ ]`)
- **Tables**: With alignment support
- **Horizontal rules**: `---`, `***`, `___`
- **Footnotes**: `[^1]: definition` and `text[^1]`

## API Reference

### Core Types

```typescript
interface Token {
  type: string;
  content?: string;
  children?: Token[];
  metadata?: Record<string, any>;
}

interface ParsePlugin {
  name: string;
  priority: number;
  canHandle: (line: string) => boolean;
  parse: (line: string, parseInline: (text: string) => Token[]) => Token[] | null;
}

interface TokenHook {
  name: string;
  tokenType: string;
  process: (token: Token) => Token;
}
```

### Parser Classes

```typescript
class TokenParser {
  constructor(config?: ParserConfig)
  parse(line: string): Token[]
  addPlugin(plugin: ParsePlugin): void
  removePlugin(name: string): void
  addHook(hook: TokenHook): void
  removeHook(tokenType: string, hookName: string): void
}

class MarkdownFormatter {
  format(tokens: Token[]): string
  formatToken(token: Token): string
}

class HTMLFormatter {
  format(tokens: Token[]): string
  formatToken(token: Token): string
}
```

### Token Types Enum

```typescript
enum TokenType {
  TEXT = 'text',
  BOLD = 'bold',
  ITALIC = 'italic',
  CODE_FENCE = 'code_fence',
  INLINE_CODE = 'inline_code',
  STRIKETHROUGH = 'strikethrough',
  HIGHLIGHT = 'highlight',
  SUBSCRIPT = 'subscript',
  SUPERSCRIPT = 'superscript',
  CURSOR = 'cursor',
  LINK = 'link',
  IMAGE = 'image',
  H1 = 'h1', H2 = 'h2', H3 = 'h3',
  H4 = 'h4', H5 = 'h5', H6 = 'h6',
  BLOCKQUOTE = 'blockquote',
  HORIZONTAL_RULE = 'hr',
  UNORDERED_LIST_ITEM = 'unordered_list_item',
  ORDERED_LIST_ITEM = 'ordered_list_item',
  TASK_LIST_ITEM = 'task_list_item',
  TABLE_ROW = 'table_row',
  TABLE_CELL = 'table_cell',
  TABLE_SEPARATOR = 'table_separator',
  FOOTNOTE_REF = 'footnote_ref',
  FOOTNOTE_DEF = 'footnote_def',
  EMPTY_LINE = 'empty_line',
  EMOJI = 'emoji'
}
```

## Advanced Example: Custom Math Parser

```typescript
import { TokenParser, ParsePlugin, TokenHook } from 'mmm';

// Plugin to parse math expressions
const mathPlugin: ParsePlugin = {
  name: 'math',
  priority: 100,
  canHandle: (line) => line.startsWith('$$') && line.endsWith('$$'),
  parse: (line, parseInline) => {
    const content = line.slice(2, -2).trim();
    return [{
      type: 'math',
      children: parseInline(content),
      metadata: { display: 'block' }
    }];
  }
};

// Hook to add KaTeX rendering flag
const mathHook: TokenHook = {
  name: 'katex',
  tokenType: 'math',
  process: (token) => ({
    ...token,
    metadata: {
      ...token.metadata,
      render: 'katex',
      className: 'math-expression'
    }
  })
};

const parser = new TokenParser({
  plugins: [mathPlugin],
  hooks: [mathHook]
});

const result = parser.parse('$$E = mc^2^$$');
// {
//   type: 'math',
//   children: [
//     { type: 'text', content: 'E = mc' },
//     { type: 'superscript', content: '2' }
//   ],
//   metadata: {
//     display: 'block',
//     render: 'katex',
//     className: 'math-expression'
//   }
// }
```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run specific test
npm test -- -t "parse headings"

# Type checking
npm run typecheck

# Build library
npm run build

# Development mode (watch)
npm run dev
```

## License

MIT