# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**mmm** is a streaming markdown parser with a plugin-based architecture for TypeScript. It parses markdown line-by-line into a token-based AST (Abstract Syntax Tree) and supports extensible parsing through plugins and post-processing through hooks.

## Key Commands

### Build & Development
```bash
npm run build        # Build with ncc and generate type declarations
npm run dev          # Watch mode for development
npm run typecheck    # Type checking without emitting files
```

### Testing
```bash
npm test                    # Run all tests with vitest
npm run test:watch          # Run tests in watch mode
npm run test:coverage       # Generate coverage report (80% threshold)
npm run test:ui             # Open vitest UI
npm test -- -t "pattern"    # Run specific test matching pattern
```

## Architecture

### Core Design Principles

The parser operates on a **line-by-line basis** - each line is parsed independently into tokens. This is different from many markdown parsers that operate on the entire document at once.

### Token System

Everything is represented as `Token` objects:
```typescript
interface Token {
  type: string;           // Token type (from TokenType enum or custom)
  content?: string;       // Text content (for leaf tokens)
  children?: Token[];     // Child tokens (for container tokens)
  metadata?: Record<string, any>;  // Additional data (links, alignments, etc.)
}
```

**Important distinction**:
- **Leaf tokens** use `content` for text (e.g., `{ type: 'text', content: 'hello' }`)
- **Container tokens** use `children` for nested tokens (e.g., `{ type: 'bold', children: [...] }`)
- Some tokens can have both when they contain cursor tokens (see Cursor Support)

### Three-Stage Processing Pipeline

1. **Plugin Phase**: Custom plugins run first (in priority order). If a plugin's `canHandle()` returns true and `parse()` returns tokens, processing stops here.

2. **Built-in Parse Phase**: If no plugin handles it, built-in parsing runs (headings, lists, blockquotes, inline formatting, etc.)

3. **Hook Phase**: After parsing (plugin or built-in), hooks transform tokens recursively based on token type.

### Plugin System (`ParsePlugin`)

Plugins intercept lines before built-in parsing:
```typescript
interface ParsePlugin {
  name: string;
  priority: number;  // Higher = runs first
  canHandle: (line: string) => boolean;
  parse: (line: string, parseInline: (text: string) => Token[]) => Token[] | null;
}
```

**Key points**:
- Plugins run in priority order (highest to lowest)
- First plugin that returns non-null tokens wins
- Use `parseInline()` callback to parse inline markdown within your custom syntax
- Return `null` to pass to next plugin/built-in parser

### Hook System (`TokenHook`)

Hooks transform tokens after parsing:
```typescript
interface TokenHook {
  name: string;
  tokenType: string;  // Which token type to process
  process: (token: Token) => Token;  // Transform function
}
```

**Key points**:
- Hooks are applied **recursively** - children are processed before parents
- Multiple hooks can target the same token type
- Common use cases: adding CSS classes, tracking metadata, transforming content

### Cursor Support (`@!`)

Special feature for tracking cursor position in text using `@!` notation:
- Parsed into `{ type: 'cursor' }` tokens (no content)
- Can appear anywhere, including inside formatted text: `**bold @! text**`
- When cursor appears in content-only contexts (code, URLs, etc.), the token gains `children` instead of `content`
- Helper function `parseCursorOnlyContent()` handles content that may contain cursors but no other formatting

### Emoji Support

Two modes:
1. **Default**: Small built-in set via `getDefaultEmojiMappings()` (~50 common emojis)
2. **Full**: Use `createEmojiManagerWithNodeEmoji()` to get entire node-emoji library

Emojis use `:shortcode:` syntax and parse to:
```typescript
{ type: 'emoji', content: '😊', metadata: { shortcode: 'smile' } }
```

### Inline vs Block Parsing

- **`parseInline()`**: Handles inline elements (bold, italic, links, code, emoji, cursor, etc.) within a line
- **`parseBuiltIn()`**: Handles block elements (headings, lists, blockquotes, tables) and delegates to `parseInline()` for content

Block parsing checks in order:
1. Empty lines
2. Code fences (```)
3. Horizontal rules (---, ***, ___)
4. Footnote definitions
5. Blockquotes (>)
6. Headings (# with optional {#id})
7. Lists (ordered, unordered, task)
8. Tables (| separated)
9. Falls back to inline parsing for paragraphs

### Formatters

Two built-in formatters convert tokens back to output:
- **`MarkdownFormatter`**: Reconstructs markdown syntax
- **`HTMLFormatter`**: Generates HTML with semantic tags

Both implement the `Formatter` interface with `format()` and `formatToken()` methods.

## File Structure

```
src/index.ts          # Single-file implementation (~1100 lines)
tests/                # Test suite
├── mmmv2.test.ts              # Core parsing tests
├── mmmv2-edge-cases.test.ts   # Edge case coverage
├── formatters.test.ts         # Formatter tests
├── cursor.test.ts             # Cursor parsing tests
├── cursor-integration.test.ts # Cursor with formatting
├── emoji.test.ts              # Emoji parsing tests
└── api.test.ts                # Public API tests
```

## Important Implementation Details

### Parsing Order Matters

Inline parsing checks patterns in a specific order to avoid conflicts:
1. Escaping (`\`)
2. Emoji (`:shortcode:`)
3. Cursor (`@!`)
4. Images (`![](...)`)
5. Footnote refs (`[^id]`)
6. Links (`[](...)` and `<url>`)
7. Strikethrough (`~~`)
8. Highlight (`==`)
9. Bold (`**` and `__`)
10. Inline code (`` ` ``)
11. Italic (`*` and `_`)
12. Subscript (`~`)
13. Superscript (`^`)

### Bold/Italic Nesting

Special handling for `***text***`:
- The parser adjusts `endIndex` when it finds `***` to ensure proper nesting
- Bold `**` is parsed first, and the extra `*` becomes part of the content for italic parsing

### Content vs Children

Some tokens (code, strikethrough, highlight, subscript, superscript) can have either:
- `content` (string) - when no cursor present
- `children` (Token[]) - when cursor `@!` is present

This is handled by `parseCursorOnlyContent()` which only parses cursor tokens, not other formatting.

## Development Workflow

1. **Adding new inline syntax**: Add to `parseInline()` function, typically as a new pattern check in the while loop
2. **Adding new block syntax**: Add to `parseBuiltIn()` function before the inline fallback
3. **Testing**: Add tests to appropriate file in `tests/`, run with `npm test`
4. **Coverage**: Maintain 80%+ coverage (enforced by vitest config)

## Common Patterns

### Creating a Parser with Plugins/Hooks
```typescript
const parser = new TokenParser({
  plugins: [customPlugin],
  hooks: [customHook],
  emojiManager: new EmojiManager()
});
```

### Backward Compatibility
The standalone `parse()` function exists for backward compatibility - it's equivalent to `new TokenParser().parse()` without plugins or hooks.
