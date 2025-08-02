# mmm - Token Parser with Plugins & Hooks 🚀

<img width="150" height="150" alt="image" src="https://github.com/user-attachments/assets/143c69ce-b408-4067-96e3-d5f18f4fa778" />

A blazing fast token-based markdown parser with extensible plugins and hooks system, written in TypeScript.

## Features

- 🎯 **Token-Based Parsing**: Clean, structured token output for maximum flexibility
- 🔌 **Plugin System**: Create custom tokens with built-in parsing support
- 🪝 **Hook System**: Post-process tokens with metadata, CSS classes, or any transformation
- 📦 **TypeScript**: Full type safety with string-based token types (no restrictive enums!)
- ⚡ **Single Pass**: Parse entire lines in one go, not streaming
- 🎨 **Extensible**: Simple, content-based tokens + complex, children-based tokens

## Installation

```bash
npm install mmm
```

## Quick Start

```typescript
import { parse, TokenParser } from 'mmm';

// Simple parsing
const tokens = parse('This is **bold** text');
console.log(tokens);
// [
//   { type: 'text', content: 'This is ' },
//   { type: 'bold', children: [{ type: 'text', content: 'bold' }] },
//   { type: 'text', content: ' text' }
// ]

// Advanced parsing with plugins and hooks
const parser = new TokenParser({
  plugins: [mathPlugin],
  hooks: [cssHook]
});
```

## What We Support (Based on Our Tests)

We've got comprehensive test coverage for all this crazy shit:

### Basic Formatting
- **Text**: Plain text tokens
- **Bold**: `**bold**` and `__bold__` → `{ type: 'bold', children: [...] }`
- **Italic**: `*italic*` and `_italic_` → `{ type: 'italic', children: [...] }`
- **Inline Code**: `` `code` `` → `{ type: 'inline_code', content: 'code' }`
- **Strikethrough**: `~~text~~` → `{ type: 'strikethrough', content: 'text' }`
- **Highlight**: `==text==` → `{ type: 'highlight', content: 'text' }`
- **Subscript**: `~text~` → `{ type: 'subscript', content: 'text' }`
- **Superscript**: `^text^` → `{ type: 'superscript', content: 'text' }`

### Advanced Formatting
- **Nested Emphasis**: `**brown *fox***` works perfectly (we handle the tricky `***` case!)
- **Complex Headings**: `# **Bold** and *italic* and ==highlight== text` with full inline parsing
- **Links**: `[text](url "title")` → `{ type: 'link', children: [...], metadata: { href, title } }`
- **Images**: Both `![alt](src)` and `<image-card alt="alt" src="src"></image-card>` formats
- **Autolinks**: `<https://example.com>` → automatic link tokens

### Block Elements
- **Headings**: `# H1` through `###### H6` with optional IDs: `# Heading {#custom-id}`
- **Blockquotes**: `> text` with nesting support `>> nested` and inline formatting
- **Code Fences**: `` ```javascript `` with language detection
- **Lists**: 
  - Unordered: `- item`, `* item`, `+ item`
  - Ordered: `1. item`, `2. item`
  - Task Lists: `- [ ] unchecked`, `- [x] checked`
- **Tables**: 
  - Rows: `col1 | col2 | col3`
  - Separators: `--- | :---: | ---:` with alignment (left, center, right, none)
- **Horizontal Rules**: `---`, `***`, `___`, `- - -`
- **Footnotes**: `[^1]: definition` and `text[^1]` references

### Special Features
- **Empty Lines**: Preserves exact whitespace content: `\t\n` → `{ type: 'empty_line', content: '\t\n' }`
- **Escaping**: `\\*not italic\\*` → separate text tokens for escaped characters
- **Edge Cases**: Bold at start/end of lines, mixed formatting, all the weird shit

## Plugin System - The Good Stuff

Create custom tokens that can use built-in parsing for nested content:

```typescript
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

// Input: $$E = **mc**^2^$$
// Output: {
//   type: 'math',
//   children: [
//     { type: 'text', content: 'E = ' },
//     { type: 'bold', children: [{ type: 'text', content: 'mc' }] },
//     { type: 'superscript', content: '2' }
//   ]
// }
```

### Plugin Features (All Tested!)
- **Priority System**: Higher priority plugins run first
- **Fallback**: Plugins can return `null` to fall back to built-in parsing
- **Dynamic Management**: Add/remove plugins at runtime
- **Built-in Parser Access**: Use `parseInline` to embed standard formatting in custom tokens

## Hook System - Post-Processing Magic

Transform tokens after parsing with hooks. Perfect for adding CSS classes, metadata, or any custom processing:

```typescript
const cssHook = {
  name: 'css-classes',
  tokenType: 'bold',
  process: (token) => ({
    ...token,
    metadata: { ...token.metadata, cssClass: 'font-bold text-lg' }
  })
};

const parser = new TokenParser({ hooks: [cssHook] });
const result = parser.parse('This is **bold** text');

// Result:
// [
//   { type: 'text', content: 'This is ' },
//   { 
//     type: 'bold', 
//     children: [{ type: 'text', content: 'bold' }],
//     metadata: { cssClass: 'font-bold text-lg' }
//   },
//   { type: 'text', content: ' text' }
// ]
```

### Hook Features (All Tested!)
- **Recursive Processing**: Hooks apply to nested tokens (children processed first, then parent)
- **Multiple Hooks**: Chain multiple hooks on the same token type
- **Dynamic Management**: Add/remove hooks at runtime
- **Plugin Integration**: Works seamlessly with custom plugin tokens

## Real-World Examples from Our Tests

### Theme System Hook
```typescript
const boldHook = {
  name: 'bold-theme',
  tokenType: 'bold',
  process: (token) => ({
    ...token,
    metadata: { ...token.metadata, theme: 'primary' }
  })
};

// Perfect for building design systems!
```

### Math Expression Plugin + Styling Hook
```typescript
// Plugin creates the math token
const mathPlugin = {
  name: 'math',
  priority: 100,
  canHandle: (line) => line.startsWith('$$') && line.endsWith('$$'),
  parse: (line, parseInline) => {
    const content = line.slice(2, -2).trim();
    return [{ type: 'math', children: parseInline(content) }];
  }
};

// Hook adds styling metadata
const mathHook = {
  name: 'math-styling',
  tokenType: 'math',
  process: (token) => ({
    ...token,
    metadata: { ...token.metadata, className: 'math-expression', katex: true }
  })
};

// Result: Custom math tokens with both content parsing AND styling metadata
```

### Alert Plugin
```typescript
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

// Usage: !!! warning This is a warning message
```

## API Reference

### Core Functions
```typescript
// Simple parsing
function parse(line: string): Token[]

// Advanced parsing with plugins and hooks
class TokenParser {
  constructor(config?: { plugins?: ParsePlugin[], hooks?: TokenHook[] })
  parse(line: string): Token[]
  addPlugin(plugin: ParsePlugin): void
  removePlugin(name: string): void
  addHook(hook: TokenHook): void
  removeHook(tokenType: string, hookName: string): void
}
```

### Types
```typescript
interface Token {
  type: string;           // Any string - no restrictive enums!
  content?: string;       // For simple tokens
  children?: Token[];     // For complex tokens
  metadata?: Record<string, any>; // Flexible metadata
}

interface ParsePlugin {
  name: string;
  priority: number;       // Higher = runs first
  canHandle: (line: string) => boolean;
  parse: (line: string, parseInline: (text: string) => Token[]) => Token[] | null;
}

interface TokenHook {
  name: string;
  tokenType: string;      // Which token type to transform
  process: (token: Token) => Token;
}
```

## Token Types We Support

**Simple Tokens (content-based):**
- `text`, `inline_code`, `strikethrough`, `highlight`, `subscript`, `superscript`, `footnote_ref`, `empty_line`

**Complex Tokens (children-based):**
- `bold`, `italic`, `link`, `image`, `h1`-`h6`, `blockquote`, `footnote_def`, `unordered_list_item`, `ordered_list_item`, `task_list_item`, `table_row`, `table_cell`

**Special Tokens:**
- `code_fence`, `hr`, `table_separator`

**Custom Tokens:**
- Anything you want! String-based types mean infinite extensibility.

## Development

```bash
# Install dependencies
npm install

# Run tests (we have 65 of them!)
npm test

# Run specific test
npm test -- -t "should parse headings with complex formatting"

# Type check
npm run typecheck

# Build
npm run build
```

## Why This Parser Rocks

1. **No Restrictive Enums**: Token types are strings, so you can create any custom type
2. **Built-in Parser Access**: Plugins get access to `parseInline` for nested formatting
3. **Hook System**: Transform tokens after parsing for themes, CSS, metadata, etc.
4. **Recursive Processing**: Hooks work on deeply nested structures
5. **65 Tests**: We test all the edge cases and weird markdown combinations
6. **TypeScript**: Full type safety with flexible token structures

## License

MIT - Go wild! 🎉