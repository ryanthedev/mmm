import { describe, beforeEach, test, expect } from 'vitest'
import { MarkdownParser, RenderedElement } from '../src/mmm';

describe('Table Support', () => {
  let parser: MarkdownParser;

  beforeEach(() => {
    parser = new MarkdownParser();
  });

  test('should parse simple table', () => {
    const markdown = `| Name | Age | City |
|------|-----|------|
| John | 30  | NYC  |
| Jane | 25  | LA   |`;

    const result = parser.parse(markdown);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('table');
    expect(result[0].children).toHaveLength(2); // thead and tbody
    
    const thead = result[0].children![0];
    expect(thead.type).toBe('thead');
    expect(thead.children![0].children).toHaveLength(3); // 3 headers
    
    const tbody = result[0].children![1];
    expect(tbody.type).toBe('tbody');
    expect(tbody.children).toHaveLength(2); // 2 data rows
  });

  test('should parse table with alignments', () => {
    const markdown = `| Left | Center | Right |
|:-----|:------:|------:|
| L1   |   C1   |    R1 |
| L2   |   C2   |    R2 |`;

    const result = parser.parse(markdown);
    const thead = result[0].children![0];
    const headers = thead.children![0].children!;
    
    // Left alignment (default) should have no style attribute
    expect(headers[0].attributes).toBeUndefined();
    // Center alignment should have style
    expect(headers[1].attributes?.style).toBe('text-align: center');
    // Right alignment should have style
    expect(headers[2].attributes?.style).toBe('text-align: right');
  });

  test('should parse table without leading/trailing pipes', () => {
    const markdown = `Name | Age | City
-----|-----|-----
John | 30  | NYC
Jane | 25  | LA`;

    const result = parser.parse(markdown);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('table');
    
    const tbody = result[0].children![1];
    expect(tbody.children).toHaveLength(2);
  });

  test('should handle inline formatting in table cells', () => {
    const markdown = `| Name | Description |
|------|-------------|
| **Bold** | *Italic* text |
| \`code\` | [Link](url) |`;

    const result = parser.parse(markdown);
    const tbody = result[0].children![1];
    const firstRow = tbody.children![0].children!;
    
    expect(firstRow[0].content).toBe('<strong>Bold</strong>');
    expect(firstRow[1].content).toBe('<em>Italic</em> text');
    
    const secondRow = tbody.children![1].children!;
    expect(secondRow[0].content).toBe('<code>code</code>');
    expect(secondRow[1].content).toBe('<a href="url">Link</a>');
  });

  test('should fall back to paragraph for invalid table', () => {
    const markdown = `| Header |
This is not a separator`;

    const result = parser.parse(markdown);
    expect(result).toHaveLength(2);
    expect(result[0].type).toBe('p');
    expect(result[0].content).toBe('| Header |');
    expect(result[1].type).toBe('p');
    expect(result[1].content).toBe('This is not a separator');
  });

  test('should handle empty cells', () => {
    const markdown = `| Name | Value |
|------|-------|
| Test |       |
|      | Empty |`;

    const result = parser.parse(markdown);
    const tbody = result[0].children![1];
    
    expect(tbody.children![0].children![1].content).toBe('');
    expect(tbody.children![1].children![0].content).toBe('');
  });

  test('should have proper CSS classes applied', () => {
    const markdown = `| A | B |
|---|---|
| 1 | 2 |`;

    const result = parser.parse(markdown);
    const table = result[0];
    
    expect(table.classes).toContain('table-auto');
    expect(table.classes).toContain('border-collapse');
    expect(table.classes).toContain('w-full');
    
    const thead = table.children![0];
    expect(thead.classes).toContain('bg-gray-50');
    
    const th = thead.children![0].children![0];
    expect(th.classes).toContain('px-4');
    expect(th.classes).toContain('py-2');
    expect(th.classes).toContain('font-semibold');
  });

  test('should stop table parsing when encountering non-table line', () => {
    const markdown = `| Header |
|--------|
| Row1   |

This is a paragraph.`;

    const result = parser.parse(markdown);
    expect(result).toHaveLength(3); // Now includes empty_line element
    expect(result[0].type).toBe('table');
    expect(result[1].type).toBe('empty_line');
    expect(result[2].type).toBe('p');
    expect(result[2].content).toBe('This is a paragraph.');
  });
});