# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is the **mmm** (Markdown Mini-Machine) - a streaming markdown parser with plugin-based architecture. The repository contains two versions:
- **v1/** - Legacy streaming parser with LineProcessor plugin system
- **v2 (src/mmmv2.ts)** - New token-based parser with simplified architecture

## Development Commands

```bash
# Build and development
npm run build          # Compile TypeScript to dist/
npm run dev            # Watch mode compilation

# Testing
npm run test           # Run all tests with Vitest
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Run tests with coverage (80% threshold)
npm run test:ui        # Launch Vitest UI
npm test -- -t "test name"              # Run specific test by name
npm test -- tests/specific-file.test.ts # Run specific test file

# Code quality
npm run typecheck      # Type check without emitting
npm run preview        # Preview production build
```

## Architecture Overview

### V2 Architecture (mmmv2.ts)

The v2 parser is a complete rewrite focusing on token-based parsing:

- **Token System**: All parsing produces `Token` objects with type, content, children, and metadata
- **Single-Pass Parser**: The `parse()` function processes markdown in one pass
- **Inline Parsing**: Separate `parseInline()` function handles nested formatting
- **No State Management**: Each line is parsed independently without cross-line state
- **Extended Syntax**: Supports subscript (~text~), superscript (^text^), highlight (==text==), strikethrough (~~text~~)
- **Footnotes**: Full support for footnote references ([^id]) and definitions

### V1 Architecture (v1/src/mmm.ts)

The legacy v1 parser uses a streaming, plugin-based approach:

- **Streaming Processing**: Line-by-line via `feedLine()` method
- **Plugin System**: Priority-based `LineProcessor` interface
- **State Management**: Tracks parser state across lines for multi-line constructs
- **Formatter System**: Pluggable output formatters (JSON, HTML, PrettyJSON)
- **Built-in Processors**: Headers, paragraphs, code blocks, lists, blockquotes, tables, images

## Key Implementation Patterns

### V2 Token Types
```typescript
enum TokenType {
  TEXT, BOLD, ITALIC, CODE_FENCE, INLINE_CODE,
  STRIKETHROUGH, HIGHLIGHT, SUBSCRIPT, SUPERSCRIPT,
  LINK, IMAGE, H1-H6, BLOCKQUOTE, HORIZONTAL_RULE,
  UNORDERED_LIST_ITEM, ORDERED_LIST_ITEM, TASK_LIST_ITEM,
  TABLE_ROW, TABLE_CELL, TABLE_SEPARATOR,
  FOOTNOTE_REF, FOOTNOTE_DEF
}
```

### V2 Parsing Order
1. Block-level elements (headings, lists, code blocks, etc.)
2. Inline parsing for content within blocks
3. Escape sequences handled first in inline parsing
4. Images before links (to handle ![alt](url) syntax)
5. Bold before italic (to avoid conflicts)

### Testing Strategy
- Comprehensive Vitest suite with 80% coverage requirement
- Tests for both v1 and v2 implementations
- Focus on edge cases and markdown spec compliance

## Package Configuration

- **Type**: ES Module (`"type": "module"`)
- **Entry Points**: 
  - Main: `dist/mmmv2.cjs.js` (CommonJS)
  - Module: `dist/mmmv2.es.js` (ES Module)
  - Types: `dist/mmmv2.d.ts`
- **Build**: Vite with TypeScript declaration generation

## Common Issues & Solutions

### Inline Formatting Conflicts
- Bold (`**text**` or `__text__`) must be parsed before italic (`*text*` or `_text_`)
- Triple delimiters (e.g., `***`) require special handling for bold+italic combinations

### Escaping
- Backslash escapes the next character in inline content
- All special markdown characters can be escaped

### V2 Migration Notes
- V2 has no streaming interface - use `parse()` for single lines
- No plugin system - extend by modifying the parser directly
- No formatter system - tokens are the output format
- State-dependent features (like continuing lists) need external management