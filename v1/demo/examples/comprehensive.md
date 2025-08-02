# MMM Parser Demo - Comprehensive Feature Showcase

This document demonstrates all the features supported by the MMM (Modular Markdown Machine) parser.

## Headings

# Level 1 Heading
## Level 2 Heading  
### Level 3 Heading
#### Level 4 Heading
##### Level 5 Heading
###### Level 6 Heading

## Paragraphs

This is a simple paragraph with regular text. Paragraphs are separated by blank lines and can contain multiple sentences.

This is another paragraph that demonstrates how the parser handles line breaks and paragraph separation. The parser maintains proper spacing between elements.

## Text Formatting

### Bold and Italic

This text contains **bold formatting** and *italic formatting*.

You can also use __alternative bold syntax__ and _alternative italic syntax_.

### Code

Inline `code spans` are supported with backticks.

You can also use code in the middle of sentences like `console.log('hello')` for JavaScript examples.

### Links

Here are some example links:
- [Simple link](https://example.com)
- [Link with title](https://example.com "Example Website")
- [Relative link](./other-page.html)

### Combined Formatting

You can combine formatting: **bold with *italic inside*** and `code with **bold**` formatting.

## Lists

### Unordered Lists

- First item
- Second item
  - Nested item
  - Another nested item
- Third item

Alternative bullet styles:
* Item with asterisk
+ Item with plus sign
- Item with dash

### Ordered Lists

1. First numbered item
2. Second numbered item
   1. Nested numbered item
   2. Another nested item
3. Third numbered item

Alternative numbering:
1) Item with parenthesis
2) Another item

### Mixed Lists

1. Ordered item
   - Unordered nested item
   - Another unordered item
2. Another ordered item
   1. Nested ordered item
   2. More nesting

## Code Blocks

### Basic Code Block

```
function hello() {
    console.log("Hello, World!");
}
```

### Code Block with Language

```javascript
function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10));
```

```python
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)
```

### Alternative Fencing

~~~bash
#!/bin/bash
echo "This uses tildes instead of backticks"
npm install
npm run build
~~~

## Blockquotes

> This is a simple blockquote.
> It can span multiple lines.

> ### Blockquotes can contain other elements
> 
> Including **bold text** and *italic text*.
> 
> 1. And even lists
> 2. Like this one
> 
> ```
> And code blocks too!
> ```

> Blockquotes can be nested
> 
> > This is a nested blockquote
> > With multiple lines
> 
> Back to the first level

## Tables

### Basic Table

| Name | Age | City |
|------|-----|------|
| John | 30  | New York |
| Jane | 25  | Los Angeles |
| Bob  | 35  | Chicago |

### Table with Alignment

| Left Aligned | Center Aligned | Right Aligned |
|:-------------|:--------------:|--------------:|
| Left         | Center         | Right |
| Text         | More text      | Numbers |
| Data         | Information    | 123.45 |

### Table with Formatting

| Feature | Status | Description |
|---------|:------:|-------------|
| **Bold** | ✅ | Supports `inline` formatting |
| *Italic* | ✅ | Including [links](https://example.com) |
| `Code` | ✅ | And various **combinations** |

### Table without Outer Pipes

Name | Language | Year
-----|----------|-----
JavaScript | Dynamic | 1995
Python | Dynamic | 1991
Rust | Systems | 2010

### Table with Empty Cells

| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data     |          | More data |
|          | Empty    |          |
| Final    | Row      | Here     |

## Complex Examples

### Mixed Content Document

# Project Documentation

## Overview

This project demonstrates the **MMM parser** capabilities with a real-world example.

### Features

1. **Fast parsing** - Streaming line-by-line processing
2. **Plugin system** - Extensible architecture
3. **Rich formatting** - Full markdown support

### Installation

```bash
npm install mmm
```

### Usage Example

```javascript
import { MarkdownParser } from 'mmm';

const parser = new MarkdownParser();
const result = parser.parse(markdown);
```

### API Reference

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `parse()` | `string` | `RenderedElement[]` | Parse complete markdown |
| `feedLine()` | `string` | `ParseResult` | Process single line |
| `reset()` | none | `void` | Reset parser state |

> **Note**: The parser maintains state between calls to `feedLine()` for multi-line constructs like code blocks and lists.

### Performance

The parser can handle large documents efficiently:

- ✅ Memory efficient streaming
- ✅ Plugin-based extensibility  
- ✅ TypeScript support
- ✅ Comprehensive test coverage

For more information, visit the [documentation](https://github.com/example/mmm).

## Edge Cases and Special Handling

### Empty Elements

Sometimes you need empty elements:



(The above shows handling of multiple blank lines)

### Escaped Characters

You can escape special characters: \*not italic\* and \`not code\`.

### Mixed Formatting Edge Cases

- **Bold at start** and end**
- *Italic in* middle
- `Code with **bold** inside`
- [Link with `code`](https://example.com)

### Code Block Edge Cases

Incomplete code blocks are handled gracefully:

```javascript
function incomplete() {
    console.log("This code block has no closing fence");