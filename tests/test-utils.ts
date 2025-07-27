import { Theme, MarkdownParser } from '../src/mmm';

// Mock theme for consistent testing - independent of default theme changes
export const mockTheme: Theme = {
  paragraph: {
    classes: ['test-paragraph']
  },
  heading: {
    h1: { classes: ['test-h1'] },
    h2: { classes: ['test-h2'] },
    h3: { classes: ['test-h3'] },
    h4: { classes: ['test-h4'] },
    h5: { classes: ['test-h5'] },
    h6: { classes: ['test-h6'] }
  },
  codeBlock: {
    classes: ['test-code-block']
  },
  blockquote: {
    classes: ['test-blockquote']
  },
  list: {
    ordered: { classes: ['test-ol'] },
    unordered: { classes: ['test-ul'] },
    item: { classes: ['test-li'] }
  },
  emptyLine: {
    classes: ['test-empty-line']
  },
  image: {
    classes: ['test-image']
  },
  table: {
    table: { classes: ['test-table'] },
    thead: { classes: ['test-thead'] },
    tbody: { classes: ['test-tbody'] },
    tr: { classes: ['test-tr'] },
    th: { classes: ['test-th'] },
    td: { classes: ['test-td'] }
  }
};

// Helper to create parser with mock theme
export function createMockParser(options?: Parameters<typeof MarkdownParser>[0]) {
  // If custom theme is provided, merge it with mock theme
  const finalTheme = options?.theme ? { ...mockTheme, ...options.theme } : mockTheme;
  
  return new MarkdownParser({
    ...options,
    theme: finalTheme
  });
}

// Helper to create parser without any theme
export function createParserWithoutTheme() {
  return new MarkdownParser({ enableThemeHook: false });
}