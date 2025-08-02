# MMM Parser Demo

This demo folder showcases all the features of the MMM (Modular Markdown Machine) parser with interactive examples and comprehensive documentation.

## 📁 Demo Structure

```
demo/
├── README.md           # This file
├── examples/           # Markdown example files
│   ├── simple.md       # Basic markdown features
│   ├── tables.md       # Table examples with alignment
│   └── comprehensive.md # All features showcase
├── web/                # Browser-based demo
│   ├── index.html      # Interactive web demo
│   └── mmm-browser.js  # Browser-compatible library
└── node/               # Node.js demo
    └── demo.js         # Command-line demo script
```

## 🚀 Quick Start

### Web Demo (Recommended)

1. Open `web/index.html` in your browser
2. Try the different example tabs (Simple, Comprehensive, Tables, Custom)
3. Edit the markdown in the left panel to see real-time parsing
4. View the JSON output to understand the parser structure

### Node.js Demo

```bash
# From the project root
cd demo/node
node demo.js
```

This will run a comprehensive command-line demo showing:
- Basic parsing examples
- Performance benchmarks
- Streaming parser demonstration
- Custom processor usage
- File processing examples

## 🎯 Featured Examples

### Basic Features

- **Headings**: `# H1` through `###### H6`
- **Text formatting**: **bold**, *italic*, `code`
- **Links**: [example](https://example.com)
- **Lists**: Both ordered and unordered with nesting
- **Code blocks**: Fenced with syntax highlighting support
- **Blockquotes**: With nested content support

### Table Features

```markdown
| Feature | Status | Notes |
|---------|:------:|-------|
| **Bold** | ✅ | Works in cells |
| *Italic* | ✅ | Also supported |
| `Code` | ✅ | Inline formatting |
| [Links](/) | ✅ | External links |
```

#### Alignment Support
- `:---` - Left align (default)
- `:---:` - Center align
- `---:` - Right align

### Advanced Features

- **Streaming processing**: Parse line by line for memory efficiency
- **Plugin system**: Extensible with custom line processors
- **Rich output**: Structured data with CSS classes and attributes
- **TypeScript support**: Full type safety
- **Error handling**: Graceful fallbacks for invalid syntax

## 🔧 Interactive Features

### Web Demo Controls

- **Example buttons**: Load predefined examples
- **Real-time parsing**: See changes as you type
- **JSON viewer**: Inspect the parsed data structure
- **Responsive design**: Works on mobile and desktop

### Example Categories

1. **Simple**: Basic markdown features for quick testing
2. **Comprehensive**: Full feature demonstration
3. **Tables**: Various table formats and styling
4. **Custom**: Blank template for your own experiments

## 📊 Performance

The parser is optimized for:
- **Memory efficiency**: Streaming line-by-line processing
- **Speed**: Minimal overhead per line
- **Scalability**: Handles large documents gracefully

Example benchmark (from Node.js demo):
- **Large document**: 50,000+ characters
- **Processing time**: ~10-20ms
- **Elements generated**: 100+ structured elements

## 🔌 Plugin System Demo

The Node.js demo includes a custom processor example:

```javascript
import { MarkdownParser, blankLineProcessor } from 'mmm';

const parser = new MarkdownParser();
parser.addLineProcessor(blankLineProcessor);

// Now blank lines create special elements
const result = parser.parse('Para 1\n\n\nPara 2');
```

## 🎨 Styling & Theming

All elements include Tailwind CSS classes by default:

```javascript
{
  type: 'h1',
  content: 'Title',
  classes: ['text-4xl', 'font-bold', 'mb-6']
}
```

Custom themes can be provided:

```javascript
const parser = new MarkdownParser({
  theme: {
    heading: {
      h1: { classes: ['custom-h1-class'] }
    }
  }
});
```

## 📝 Example Files

### `examples/simple.md`
Basic markdown features including headings, text formatting, lists, code blocks, and tables.

### `examples/tables.md`
Comprehensive table examples showing:
- Basic table syntax
- Column alignment
- Formatting within cells
- Tables without outer pipes
- Empty cells handling

### `examples/comprehensive.md`
Complete feature showcase including:
- All heading levels
- Complex nested lists
- Multiple code block styles
- Advanced blockquotes
- Table variations
- Mixed content documents
- Edge cases and special handling

## 🚦 Getting Started

1. **Start with the web demo** for interactive exploration
2. **Run the Node.js demo** to see programmatic usage
3. **Examine the example files** to understand syntax
4. **Check the JSON output** to understand the data structure
5. **Experiment with custom markdown** in the web demo

## 💡 Tips for Testing

- Try invalid syntax to see graceful fallbacks
- Test edge cases like empty tables or incomplete code blocks
- Experiment with nested structures (lists in blockquotes)
- Test performance with large documents
- Try the streaming API for real-time applications

## 🔗 Next Steps

After exploring the demos:

1. **Install the library**: `npm install mmm`
2. **Read the API docs**: Check the main README.md
3. **Write custom processors**: Extend functionality
4. **Integrate into your project**: Use the parsed output
5. **Contribute**: Submit issues or improvements

## 🐛 Troubleshooting

If you encounter issues:

1. **Web demo not loading**: Check browser console for errors
2. **Node.js demo failing**: Ensure the library is built (`npm run build`)
3. **Unexpected parsing**: Compare with examples to verify syntax
4. **Performance issues**: Check document size and complexity

## 📄 License

This demo is part of the MMM project and follows the same MIT license.