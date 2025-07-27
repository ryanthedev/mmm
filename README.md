# mmm - Modular Markdown Machine
<img width="150" height="150" alt="image" src="https://github.com/user-attachments/assets/143c69ce-b408-4067-96e3-d5f18f4fa778" />

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
- **Tables**: GitHub Flavored Markdown tables with alignment support
- **Images**: `![alt text](image.jpg)` both standalone and inline
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

### Built-in Processors

The library includes several built-in processors that you can add:

```typescript
import { MarkdownParser, blankLineProcessor, imageProcessor } from 'mmm';

const parser = new MarkdownParser();

// Add blank line processor to create empty_line elements
parser.addLineProcessor(blankLineProcessor);

// Add image processor for standalone images
parser.addLineProcessor(imageProcessor);
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

const parser = new MarkdownParser({ hooks });
```

## Formatters

Convert parsed elements to different output formats:

```typescript
import { MarkdownParser, HtmlFormatter, PrettyJsonFormatter } from 'mmm';

// HTML output
const parser = new MarkdownParser({ formatter: new HtmlFormatter() });
const html = parser.parseAndFormat('# Hello\n\nWorld!');
// '<h1 class="text-4xl font-bold mb-6">Hello</h1><p class="mb-4">World!</p>'

// Pretty JSON output
parser.setFormatter(new PrettyJsonFormatter({ indentSize: 2 }));
const json = parser.parseAndFormat('# Hello');
// Formatted JSON string with indentation

// Custom formatter
class PlainTextFormatter implements OutputFormatter<string> {
  name = 'plain';
  format(elements: RenderedElement[]): string {
    return elements.map(el => el.content).join('\n');
  }
}
```

**Built-in Formatters:**
- `JsonFormatter` (default) - Returns `RenderedElement[]` unchanged
- `HtmlFormatter` - Converts to HTML with proper escaping
- `PrettyJsonFormatter` - Returns formatted JSON string

## API Reference

### MarkdownParser

#### Constructor
- `new MarkdownParser(options?: { hooks?: Record<string, Function>, themeProvider?: ThemeProvider, theme?: Partial<Theme>, enableThemeHook?: boolean, formatter?: OutputFormatter })`

#### Methods
- `parse(markdown: string): RenderedElement[]` - Parse complete markdown string
- `parseAndFormat(markdown: string): any` - Parse and format in one step
- `format(elements?: RenderedElement[]): any` - Format elements using current formatter
- `setFormatter(formatter: OutputFormatter): void` - Change the output formatter
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
