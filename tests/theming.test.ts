import { describe, test, expect } from 'vitest'
import { MarkdownParser, DefaultThemeProvider, Theme, ElementTheme } from '../src/mmm';

describe('Theming System', () => {
  test('should apply default Tailwind theme', () => {
    const parser = new MarkdownParser();
    const result = parser.parse('# Hello World');
    
    expect(result[0]).toMatchObject({
      type: 'h1',
      content: 'Hello World',
      classes: ['text-4xl', 'font-bold', 'mb-6']
    });
  });

  test('should apply custom theme via partial theme override', () => {
    const customTheme: Partial<Theme> = {
      heading: {
        h1: {
          classes: ['text-6xl', 'font-extrabold', 'mb-8', 'text-blue-600']
        },
        h2: { classes: ['text-3xl', 'font-bold', 'mb-5'] },
        h3: { classes: ['text-2xl', 'font-bold', 'mb-4'] },
        h4: { classes: ['text-xl', 'font-bold', 'mb-3'] },
        h5: { classes: ['text-lg', 'font-bold', 'mb-2'] },
        h6: { classes: ['text-base', 'font-bold', 'mb-2'] }
      }
    };

    const parser = new MarkdownParser({ theme: customTheme });
    const result = parser.parse('# Hello World');
    
    expect(result[0].classes).toEqual(['text-6xl', 'font-extrabold', 'mb-8', 'text-blue-600']);
  });

  test('should apply custom ThemeProvider', () => {
    class CustomThemeProvider {
      getTheme(elementType: string): ElementTheme {
        if (elementType === 'p') {
          return { classes: ['prose', 'text-gray-800'] };
        }
        return { classes: [] };
      }
    }

    const parser = new MarkdownParser({ themeProvider: new CustomThemeProvider() });
    const result = parser.parse('Hello world');
    
    expect(result[0].classes).toEqual(['prose', 'text-gray-800']);
  });

  test('should handle code blocks with custom theme', () => {
    const customTheme: Partial<Theme> = {
      codeBlock: {
        classes: ['bg-slate-900', 'text-green-400', 'p-6', 'rounded-xl', 'font-fira-code'],
        attributes: { 'data-theme': 'dark' }
      }
    };

    const parser = new MarkdownParser({ theme: customTheme });
    const result = parser.parse('```javascript\nconsole.log("hello");\n```');
    
    expect(result[0]).toMatchObject({
      type: 'code_block',
      classes: ['bg-slate-900', 'text-green-400', 'p-6', 'rounded-xl', 'font-fira-code'],
      attributes: { 'data-language': 'javascript', 'data-theme': 'dark' }
    });
  });

  test('should handle lists with custom theme', () => {
    const customTheme: Partial<Theme> = {
      list: {
        unordered: {
          classes: ['space-y-2', 'ml-4']
        },
        ordered: {
          classes: ['space-y-2', 'ml-4', 'list-decimal']
        },
        item: {
          classes: ['text-gray-700']
        }
      }
    };

    const parser = new MarkdownParser({ theme: customTheme });
    const result = parser.parse('- Item 1\n- Item 2');
    
    expect(result[0]).toMatchObject({
      type: 'ul',
      classes: ['space-y-2', 'ml-4']
    });
    expect(result[0].children![0].classes).toEqual(['text-gray-700']);
  });

  test('should allow disabling theme hook', () => {
    const parser = new MarkdownParser({ enableThemeHook: false });
    const result = parser.parse('# Hello World');
    
    // Should have no classes when theme hook is disabled
    expect(result[0].classes).toBeUndefined();
  });

  test('should combine theme with element-specific hooks', () => {
    const hooks = {
      'h1': (element: any) => ({
        ...element,
        attributes: { ...element.attributes, id: 'main-title' },
        classes: [...(element.classes || []), 'custom-heading']
      })
    };

    const parser = new MarkdownParser({ hooks });
    const result = parser.parse('# Hello World');
    
    expect(result[0]).toMatchObject({
      type: 'h1',
      content: 'Hello World',
      classes: ['text-4xl', 'font-bold', 'mb-6', 'custom-heading'],
      attributes: { id: 'main-title' }
    });
  });

  test('should handle blockquotes with custom theme', () => {
    const customTheme: Partial<Theme> = {
      blockquote: {
        classes: ['border-l-8', 'border-blue-500', 'bg-blue-50', 'p-4', 'italic'],
        attributes: { 'data-type': 'quote' }
      }
    };

    const parser = new MarkdownParser({ theme: customTheme });
    const result = parser.parse('> This is a quote');
    
    expect(result[0]).toMatchObject({
      type: 'blockquote',
      classes: ['border-l-8', 'border-blue-500', 'bg-blue-50', 'p-4', 'italic'],
      attributes: { 'data-type': 'quote' }
    });
  });
});