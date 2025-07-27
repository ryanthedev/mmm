import { MarkdownParser, HtmlFormatter, PrettyJsonFormatter, JsonFormatter } from '../../dist/mmm.js';

const markdown = `# Formatter Demo

This is a **bold** paragraph with *italic* text and \`inline code\`.

## Features

- JSON output (default)
- HTML output with proper escaping
- Pretty JSON with indentation
- Custom formatters

### Code Example

\`\`\`javascript
console.log("Hello, formatters!");
\`\`\`

| Format | Output Type | Description |
|--------|-------------|-------------|
| JSON | Array | Default RenderedElement[] |
| HTML | String | Escaped HTML markup |
| Pretty JSON | String | Formatted JSON |
`;

console.log('🚀 MMM Formatter Demo\n');

// Default JSON formatter
console.log('📄 JSON Formatter (default):');
const jsonParser = new MarkdownParser();
const jsonResult = jsonParser.parseAndFormat(markdown);
console.log(`Type: ${Array.isArray(jsonResult) ? 'Array' : typeof jsonResult}`);
console.log(`Elements: ${jsonResult.length}`);
console.log(`First element: ${jsonResult[0].type} - "${jsonResult[0].content.substring(0, 20)}..."`);
console.log('');

// HTML formatter
console.log('🌐 HTML Formatter:');
const htmlParser = new MarkdownParser({ formatter: new HtmlFormatter() });
const htmlResult = htmlParser.parseAndFormat(markdown);
console.log(`Type: ${typeof htmlResult}`);
console.log(`Length: ${htmlResult.length} characters`);
console.log('Preview:');
console.log(htmlResult.substring(0, 200) + '...');
console.log('');

// Pretty JSON formatter
console.log('✨ Pretty JSON Formatter:');
const prettyParser = new MarkdownParser();
prettyParser.setFormatter(new PrettyJsonFormatter({ indentSize: 2 }));
const prettyResult = prettyParser.parseAndFormat('# Hello\n\nThis is **formatted** JSON.');
console.log(`Type: ${typeof prettyResult}`);
console.log('Output:');
console.log(prettyResult);
console.log('');

// Custom formatter demo
console.log('🔧 Custom Formatter:');
class TextOnlyFormatter {
  name = 'text-only';
  
  format(elements) {
    return elements
      .map(el => el.content ? el.content.replace(/<[^>]*>/g, '') : '') // Strip HTML
      .filter(text => text.trim()) // Remove empty lines
      .join('\n');
  }
}

const customParser = new MarkdownParser({ formatter: new TextOnlyFormatter() });
const textResult = customParser.parseAndFormat(markdown);
console.log(`Type: ${typeof textResult}`);
console.log('Text-only output:');
console.log(textResult);
console.log('');

// Demonstrate formatter switching
console.log('🔄 Switching Formatters:');
const switchParser = new MarkdownParser();
const testMarkdown = '# Test\n\nSwitching between **formatters**.';

console.log('1. JSON (default):');
const result1 = switchParser.parseAndFormat(testMarkdown);
console.log(`   Array with ${result1.length} elements`);

switchParser.setFormatter(new HtmlFormatter());
console.log('2. HTML:');
const result2 = switchParser.parseAndFormat(testMarkdown);
console.log(`   ${result2.substring(0, 50)}...`);

switchParser.setFormatter(new PrettyJsonFormatter());
console.log('3. Pretty JSON:');
const result3 = switchParser.parseAndFormat(testMarkdown);
console.log(`   ${result3.split('\n').length} lines of formatted JSON`);

console.log('\n✅ Formatter demo complete!');