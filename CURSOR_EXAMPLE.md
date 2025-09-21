# Cursor Token Feature (@!) 

The MMM parser now supports cursor tokens using the `@!` syntax. This allows you to mark positions within text for editor-like applications.

## Basic Usage

```typescript
import { parse, MarkdownFormatter, HTMLFormatter } from 'mmm';

// Parse text with cursor
const tokens = parse('Hello @! world');
console.log(tokens);
// Output: [
//   { type: 'text', content: 'Hello ' },
//   { type: 'cursor' },
//   { type: 'text', content: ' world' }
// ]

// Format back to markdown
const mdFormatter = new MarkdownFormatter();
console.log(mdFormatter.format(tokens)); // "Hello @! world"

// Format to HTML
const htmlFormatter = new HTMLFormatter();
console.log(htmlFormatter.format(tokens)); // "Hello <span class="cursor"></span> world"
```

## Advanced Examples

### Cursor in Formatting

```typescript
// Cursor inside bold text
const tokens = parse('**bold @! text**');
// Markdown: **bold @! text**
// HTML: <strong>bold <span class="cursor"></span> text</strong>

// Multiple cursors
const tokens = parse('Start @! middle @! end');
// HTML: Start <span class="cursor"></span> middle <span class="cursor"></span> end
```

### Cursor in Complex Structures

```typescript
// Cursor in headings
parse('# Heading @! here');
// HTML: <h1>Heading <span class="cursor"></span> here</h1>

// Cursor in links
parse('[Link @! text](https://example.com)');
// HTML: <a href="https://example.com">Link <span class="cursor"></span> text</a>

// Cursor in nested formatting
parse('**Bold with *italic @! nested* text**');
// HTML: <strong>Bold with <em>italic <span class="cursor"></span> nested</em> text</strong>
```

## CSS Styling

For HTML output, you can style the cursor using CSS:

```css
.cursor {
  /* Blinking cursor */
  display: inline-block;
  width: 2px;
  height: 1.2em;
  background: #000;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

/* Or a simple vertical bar */
.cursor::before {
  content: '|';
  color: #007acc;
  font-weight: bold;
}
```

## Use Cases

1. **Text Editors**: Mark cursor position when rendering markdown
2. **Live Collaboration**: Show where other users are editing
3. **Tutorials**: Highlight specific positions in documentation
4. **Code Examples**: Mark insertion points in code snippets

## Token Properties

```typescript
interface CursorToken {
  type: 'cursor';
  // No content or children - just marks a position
}
```

The cursor token is unique in that it has no content or children - it purely represents a position marker within the text flow.