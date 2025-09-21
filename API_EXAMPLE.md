# MMM Library API Examples

## Unified Import (Recommended)

```typescript
// Import everything from the main package
import { parse, MarkdownFormatter, HTMLFormatter, TokenType } from 'mmm';

// Parse markdown
const tokens = parse('**bold** text with *italic*');

// Format back to markdown
const mdFormatter = new MarkdownFormatter();
const markdown = mdFormatter.format(tokens);
console.log(markdown); // "**bold** text with *italic*"

// Format to HTML
const htmlFormatter = new HTMLFormatter();
const html = htmlFormatter.format(tokens);
console.log(html); // "<strong>bold</strong> text with <em>italic</em>"
```

## Namespaced Imports

```typescript
// Import namespaced modules for better organization
import { Parser, Formatters } from 'mmm';

const tokens = Parser.parse('# Heading with `code`');
const markdown = new Formatters.MarkdownFormatter().format(tokens);
const html = new Formatters.HTMLFormatter().format(tokens);
```

## Subpath Imports (Advanced)

```typescript
// Import specific modules (if needed)
import { MarkdownFormatter } from 'mmm/formatters';
import { parse } from 'mmm/parser';
```

## Advanced Usage with Plugins

```typescript
import { TokenParser, MarkdownFormatter, TokenType } from 'mmm';

// Create custom parser with plugins
const parser = new TokenParser({
  plugins: [{
    name: 'custom-math',
    priority: 100,
    canHandle: (line) => line.startsWith('$$'),
    parse: (line, parseInline) => [{ 
      type: 'math', 
      content: line.slice(2, -2) 
    }]
  }]
});

const tokens = parser.parse('$$E = mc^2$$');
const formatter = new MarkdownFormatter();
console.log(formatter.format(tokens));
```

## Type-Safe Usage

```typescript
import type { Token, Formatter } from 'mmm';
import { MarkdownFormatter } from 'mmm';

function processTokens(tokens: Token[], formatter: Formatter): string {
  return formatter.format(tokens);
}

const tokens = parse('Some **markdown**');
const result = processTokens(tokens, new MarkdownFormatter());
```