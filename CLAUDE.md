# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run build` - Compile TypeScript to dist/
- `npm run test` - Run all tests with Vitest
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage reporting (80% threshold)
- `npm run test:ui` - Launch Vitest UI
- `npm test -- -t "test name"` - Run specific test by name
- `npm test -- tests/specific-file.test.ts` - Run specific test file
- `npm run lint` - Lint TypeScript files with ESLint
- `npm run lint:fix` - Auto-fix ESLint issues
- `npm run typecheck` - Type check without emitting
- `npm run dev` - Watch mode TypeScript compilation
- `npm run demo` - Start HTTP server for interactive demo at http://localhost:3000
- `npm run build-browser` - Build browser-compatible version for demo

**Important**: Always run `npm run lint` and `npm run typecheck` after making code changes to ensure quality.

## Architecture Overview

This is a streaming markdown parser built as a single-file TypeScript module with a plugin-based architecture:

### Core Components

- **MarkdownParser** (`src/mmm.ts:266`) - Main parser class that processes markdown line by line
- **LineProcessor** interface (`src/mmm.ts:259`) - Plugin system for extending parsing capability
- **ParserState** (`src/mmm.ts:238`) - Tracks parser state across lines (block type, buffer, code blocks, lists)
- **RenderedElement** (`src/mmm.ts:8`) - Output format with type, content, classes, and attributes

### Key Design Patterns

- **Streaming Processing**: Parser processes markdown line by line via `feedLine()` method, enabling memory-efficient handling of large documents
- **Priority-Based Plugins**: LineProcessors have priority numbers - higher priority processors are checked first
- **State Management**: Parser maintains state between lines to handle multi-line constructs (code blocks, lists, blockquotes)
- **Hook System**: Post-processing hooks transform elements after parsing

### Plugin Architecture

Built-in processors handle standard markdown (headings, paragraphs, code blocks, lists, blockquotes, tables, images). The system supports custom LineProcessors that can:
- Check if they can handle a line via `canHandle()`
- Process the line and return `ParseResult`
- Maintain state across multiple lines

**Custom Block Types**: For multi-line custom processors, set `state.blockType` to a custom value. The parser's `continueCurrentBlock()` method defaults to continuing custom blocks by adding lines to the buffer, allowing custom processors to control termination via their `canHandle()` logic.

**Key Methods for Processors**:
- `parser.completeCurrentBlock()` - Complete and return current block
- `parser.completeElement(element)` - Complete element with hooks applied
- Use `remainingInput` in ParseResult to reprocess a line after completing a block

### Output Format

All elements include Tailwind CSS classes by default for styling. The parser outputs `RenderedElement[]` with consistent structure for easy rendering.

## Test Configuration

- Uses Vitest with coverage thresholds at 80%
- Test files: `tests/**/*.{test,spec}.ts` and `src/**/__tests__/**/*.ts`
- Coverage excludes config files and type definitions

## Common Issues & Solutions

### Inline Formatting
- Bold (`**text**`) must be processed before italic (`*text*`) to avoid conflicts
- Current order: bold → italic → underscores → code → links

### Custom Line Processors
- For multi-line blocks, use `remainingInput` to reprocess lines after completing current blocks
- Blank line processors should complete existing blocks first, then create empty line elements
- Custom block types automatically continue by adding lines to buffer - termination logic goes in `canHandle()`

### Code Block Handling
- Incomplete code blocks (missing closing fence) are handled by `completeIncompleteCodeBlock()`
- Code block state is tracked via both `state.inCodeBlock` and `state.blockType === 'code_block'`

### Built-in Processors
- `blankLineProcessor` is **enabled by default**
  - Creates `empty_line` elements for blank lines
  - Disable via `new MarkdownParser({ enableBlankLines: false })`
- `imageProcessor` is **enabled by default**
  - Handles standalone image lines (`![alt](src)`) as `img` elements
  - Disable via `new MarkdownParser({ enableImages: false })`
  - Inline images are handled automatically by the `parseInline` method

## Formatter System

The parser supports pluggable output formatters to convert parsed elements into different formats.

### Built-in Formatters

- **JsonFormatter** (default) - Returns the `RenderedElement[]` array unchanged
- **HtmlFormatter** - Converts elements to HTML string with proper escaping
  - Empty lines render as `<br class="my-2" />` tags
- **PrettyJsonFormatter** - Returns formatted JSON string with indentation

### Using Formatters

```typescript
import { MarkdownParser, HtmlFormatter, PrettyJsonFormatter } from 'mmm';

// Use formatter in constructor
const parser = new MarkdownParser({
  formatter: new HtmlFormatter()
});

// Or set formatter later
parser.setFormatter(new PrettyJsonFormatter({ indentSize: 4 }));

// Parse and format in one step
const html = parser.parseAndFormat('# Hello\n\nWorld!');

// Or format existing elements
const elements = parser.parse('# Hello');
const html = parser.format(elements);
```

### Custom Formatters

Create custom formatters by implementing the `OutputFormatter` interface:

```typescript
import { OutputFormatter, RenderedElement } from 'mmm';

class CustomFormatter implements OutputFormatter<string> {
  name = 'custom';
  
  format(elements: RenderedElement[]): string {
    return elements.map(el => `[${el.type}] ${el.content}`).join('\n');
  }
}

parser.setFormatter(new CustomFormatter());
```

### Formatter Options

Formatters can accept options for customization:

```typescript
interface FormatterOptions {
  pretty?: boolean;
  indentSize?: number;
  attributeOrder?: string[];
  customAttributes?: Record<string, string>;
}
```