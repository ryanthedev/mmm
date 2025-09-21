import { describe, it, expect } from 'vitest';

// Test unified exports from main entry point
import { 
  parse, 
  TokenType, 
  TokenParser, 
  MarkdownFormatter, 
  HTMLFormatter,
  Parser,
  Formatters
} from '../src/index';

describe('Unified API', () => {
  it('should export all parser functionality from main entry', () => {
    expect(parse).toBeDefined();
    expect(TokenType).toBeDefined();
    expect(TokenParser).toBeDefined();
  });

  it('should export all formatter functionality from main entry', () => {
    expect(MarkdownFormatter).toBeDefined();
    expect(HTMLFormatter).toBeDefined();
  });

  it('should provide namespaced exports', () => {
    expect(Parser.parse).toBeDefined();
    expect(Parser.TokenType).toBeDefined();
    expect(Parser.TokenParser).toBeDefined();
    
    expect(Formatters.MarkdownFormatter).toBeDefined();
    expect(Formatters.HTMLFormatter).toBeDefined();
  });

  it('should work end-to-end with unified imports', () => {
    // Parse some markdown
    const tokens = parse('**bold** text');
    
    // Format to markdown
    const mdFormatter = new MarkdownFormatter();
    const markdown = mdFormatter.format(tokens);
    expect(markdown).toBe('**bold** text');
    
    // Format to HTML
    const htmlFormatter = new HTMLFormatter();
    const html = htmlFormatter.format(tokens);
    expect(html).toBe('<strong>bold</strong> text');
  });

  it('should work with namespaced exports', () => {
    const tokens = Parser.parse('*italic* text');
    
    const mdFormatter = new Formatters.MarkdownFormatter();
    const markdown = mdFormatter.format(tokens);
    expect(markdown).toBe('*italic* text');
    
    const htmlFormatter = new Formatters.HTMLFormatter();
    const html = htmlFormatter.format(tokens);
    expect(html).toBe('<em>italic</em> text');
  });

  it('should handle complex parsing and formatting workflow', () => {
    const input = '# Heading\n\nThis is **bold** and *italic* text with `code`.';
    
    // Parse line by line
    const lines = input.split('\n');
    const allTokens = lines.map(line => parse(line));
    
    // Format back to markdown
    const mdFormatter = new MarkdownFormatter();
    const recreatedMarkdown = allTokens
      .map(tokens => mdFormatter.format(tokens))
      .join('\n');
    
    expect(recreatedMarkdown).toBe('# Heading\n\nThis is **bold** and *italic* text with `code`.');
    
    // Format to HTML
    const htmlFormatter = new HTMLFormatter();
    const html = allTokens
      .map(tokens => htmlFormatter.format(tokens))
      .join('\n');
    
    expect(html).toBe('<h1>Heading</h1>\n<br>\nThis is <strong>bold</strong> and <em>italic</em> text with <code>code</code>.');
  });
});