# mmm - Modular Markdown Machine
<img width="300" height="300" alt="image" src="https://github.com/user-attachments/assets/143c69ce-b408-4067-96e3-d5f18f4fa778" />

A streaming markdown parser with plugin support, written in TypeScript.

## Features

- 🚀 **Streaming Parser**: Process markdown line by line for efficient memory usage
- 🔌 **Plugin System**: Extensible with custom line processors
- 🎨 **Built-in Styling**: Tailwind CSS classes included out of the box
- 🪝 **Hooks Support**: Transform elements with custom hooks
- 📦 **TypeScript**: Full type safety and IntelliSense support

## Installation

```bash
npm install mmm
```

## Quick Start

```typescript
import { MarkdownParser } from 'mmm';

const parser = new MarkdownParser();
const result = parser.parse('# Hello World\n\nThis is **bold** text.');

console.log(result);
// [
//   { type: 'h1', content: 'Hello World', classes: ['text-4xl', 'font-bold', 'mb-6'] },
//   { type: 'p', content: 'This is <strong>bold</strong> text.', classes: ['mb-4'] }
// ]
```

## Supported Markdown Features

- **Headings**: `# H1` through `###### H6`
- **Paragraphs**: Regular text blocks
- **Code Blocks**: Fenced with ``` or ~~~
- **Blockquotes**: Lines starting with `>`
- **Lists**: Ordered (1.) and unordered (-, *, +)
- **Inline Formatting**: **bold**, *italic*, `code`, [links](url)

## Plugin System

Create custom line processors to extend functionality:

```typescript
import { LineProcessor, MarkdownParser } from 'mmm';

const alertProcessor: LineProcessor = {
  name: 'alert',
  priority: 80,
  canHandle: (lineInfo) => lineInfo.trimmed.startsWith('!!! '),
  process: (lineInfo) => {
    const message = lineInfo.trimmed.slice(4);
    return {
      type: 'complete',
      element: {
        type: 'alert',
        content: message,
        classes: ['alert', 'p-4', 'bg-yellow-100', 'border-l-4']
      }
    };
  }
};

const parser = new MarkdownParser();
parser.addLineProcessor(alertProcessor);
```

## Streaming API

For processing large documents line by line:

```typescript
const parser = new MarkdownParser();

function processLine(line: string) {
  const result = parser.feedLine(line);
  
  if (result.type === 'complete' && result.element) {
    // Handle completed element
    console.log('Completed element:', result.element);
  }
  
  if (result.remainingInput) {
    // Process remaining input
    processLine(result.remainingInput);
  }
}
```

## Hooks

Transform elements after parsing:

```typescript
const hooks = {
  'h1': (element) => ({
    ...element,
    attributes: { ...element.attributes, id: generateId(element.content) }
  }),
  'p': (element) => ({
    ...element,
    classes: [...element.classes, 'prose-paragraph']
  })
};

const parser = new MarkdownParser(hooks);
```

## API Reference

### MarkdownParser

#### Constructor
- `new MarkdownParser(hooks?: Record<string, (element: RenderedElement) => RenderedElement>)`

#### Methods
- `parse(markdown: string): RenderedElement[]` - Parse complete markdown string
- `feedLine(line: string): ParseResult` - Process single line
- `addLineProcessor(processor: LineProcessor): void` - Add custom processor
- `reset(): void` - Reset parser state

### Types

```typescript
interface RenderedElement {
  type: string;
  content: string;
  children?: RenderedElement[];
  attributes?: Record<string, string>;
  classes?: string[];
}

interface LineProcessor {
  name: string;
  priority: number;
  canHandle: (lineInfo: LineInfo, state: ParserState) => boolean;
  process: (lineInfo: LineInfo, state: ParserState, parser: MarkdownParser) => ParseResult;
}
```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Build the project
npm run build

# Lint code
npm run lint

# Type check
npm run typecheck
```

## License

MIT
