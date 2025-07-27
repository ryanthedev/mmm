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

**Important**: Always run `npm run lint` and `npm run typecheck` after making code changes to ensure quality.

## Architecture Overview

This is a streaming markdown parser built as a single-file TypeScript module with a plugin-based architecture:

### Core Components

- **MarkdownParser** (`src/mmm.ts:41`) - Main parser class that processes markdown line by line
- **LineProcessor** interface (`src/mmm.ts:34`) - Plugin system for extending parsing capability
- **ParserState** (`src/mmm.ts:15`) - Tracks parser state across lines (block type, buffer, code blocks, lists)
- **RenderedElement** (`src/mmm.ts:7`) - Output format with type, content, classes, and attributes

### Key Design Patterns

- **Streaming Processing**: Parser processes markdown line by line via `feedLine()` method, enabling memory-efficient handling of large documents
- **Priority-Based Plugins**: LineProcessors have priority numbers - higher priority processors are checked first
- **State Management**: Parser maintains state between lines to handle multi-line constructs (code blocks, lists, blockquotes)
- **Hook System**: Post-processing hooks transform elements after parsing

### Plugin Architecture

Built-in processors handle standard markdown (headings, paragraphs, code blocks, lists, blockquotes, tables). The system supports custom LineProcessors that can:
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
- `blankLineProcessor` is available for import but not included by default
- Add via `parser.addLineProcessor(blankLineProcessor)` to create `empty_line` elements