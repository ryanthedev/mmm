export interface ParseResult {
  type: 'need_more_lines' | 'need_next_token' | 'complete';
  element?: RenderedElement;
  remainingInput?: string;
  error?: any;
}

export interface RenderedElement {
  type: string;
  content: string;
  children?: RenderedElement[];
  attributes?: Record<string, string>;
  classes?: string[];
}

export interface ElementTheme {
  classes: string[];
  attributes?: Record<string, string>;
}

export interface Theme {
  paragraph: ElementTheme;
  heading: {
    h1: ElementTheme;
    h2: ElementTheme;
    h3: ElementTheme;
    h4: ElementTheme;
    h5: ElementTheme;
    h6: ElementTheme;
  };
  codeBlock: ElementTheme;
  blockquote: ElementTheme;
  list: {
    ordered: ElementTheme;
    unordered: ElementTheme;
    item: ElementTheme;
  };
  emptyLine: ElementTheme;
  image: ElementTheme;
  table: {
    table: ElementTheme;
    thead: ElementTheme;
    tbody: ElementTheme;
    tr: ElementTheme;
    th: ElementTheme;
    td: ElementTheme;
  };
}

export interface ThemeProvider {
  getTheme(elementType: string, context?: Record<string, unknown>): ElementTheme;
}

export interface OutputFormatter<T = any> {
  name: string;
  format(elements: RenderedElement[]): T;
  formatElement?(element: RenderedElement): any;
}

export interface FormatterOptions {
  pretty?: boolean;
  indentSize?: number;
  attributeOrder?: string[];
  customAttributes?: Record<string, string>;
}

export class DefaultThemeProvider implements ThemeProvider {
  private theme: Theme;

  constructor(theme?: Partial<Theme>) {
    this.theme = this.createDefaultTheme();
    if (theme) {
      this.theme = this.mergeThemes(this.theme, theme);
    }
  }

  getTheme(elementType: string): ElementTheme {
    switch (elementType) {
      case 'p':
        return this.theme.paragraph;
      case 'h1':
        return this.theme.heading.h1;
      case 'h2':
        return this.theme.heading.h2;
      case 'h3':
        return this.theme.heading.h3;
      case 'h4':
        return this.theme.heading.h4;
      case 'h5':
        return this.theme.heading.h5;
      case 'h6':
        return this.theme.heading.h6;
      case 'code_block':
        return this.theme.codeBlock;
      case 'blockquote':
        return this.theme.blockquote;
      case 'ol':
        return this.theme.list.ordered;
      case 'ul':
        return this.theme.list.unordered;
      case 'li':
        return this.theme.list.item;
      case 'empty_line':
        return this.theme.emptyLine;
      case 'img':
        return this.theme.image;
      case 'table':
        return this.theme.table.table;
      case 'thead':
        return this.theme.table.thead;
      case 'tbody':
        return this.theme.table.tbody;
      case 'tr':
        return this.theme.table.tr;
      case 'th':
        return this.theme.table.th;
      case 'td':
        return this.theme.table.td;
      default:
        return { classes: [] };
    }
  }

  private createDefaultTheme(): Theme {
    return {
      paragraph: {
        classes: ['']
      },
      heading: {
        h1: {
          classes: ['font-bold']
        },
        h2: {
          classes: ['font-bold']
        },
        h3: {
          classes: ['font-bold']
        },
        h4: {
          classes: ['font-bold']
        },
        h5: {
          classes: ['font-bold']
        },
        h6: {
          classes: ['font-bold']
        }
      },
      codeBlock: {
        classes: []
      },
      blockquote: {
        classes: []
      },
      list: {
        ordered: {
          classes: ['list-decimal', 'list-inside']
        },
        unordered: {
          classes: ['list-disc', 'list-inside']
        },
        item: {
          classes: []
        }
      },
      emptyLine: {
        classes: []
      },
      image: {
        classes: ['max-w-full', 'h-auto']
      },
      table: {
        table: {
          classes: ['table-auto', 'border-collapse', 'border', 'border-gray-300', 'w-full']
        },
        thead: {
          classes: []
        },
        tbody: {
          classes: []
        },
        tr: {
          classes: []
        },
        th: {
          classes: []
        },
        td: {
          classes: []
        }
      }
    };
  }

  private mergeThemes(defaultTheme: Theme, customTheme: Partial<Theme>): Theme {
    const merged = { ...defaultTheme };
    
    if (customTheme.paragraph) {
      merged.paragraph = { ...defaultTheme.paragraph, ...customTheme.paragraph };
    }
    
    if (customTheme.heading) {
      merged.heading = {
        ...defaultTheme.heading,
        ...Object.keys(customTheme.heading).reduce((acc, key) => {
          acc[key as keyof Theme['heading']] = {
            ...defaultTheme.heading[key as keyof Theme['heading']],
            ...customTheme.heading![key as keyof Theme['heading']]
          };
          return acc;
        }, {} as Theme['heading'])
      };
    }
    
    if (customTheme.codeBlock) {
      merged.codeBlock = { ...defaultTheme.codeBlock, ...customTheme.codeBlock };
    }
    
    if (customTheme.blockquote) {
      merged.blockquote = { ...defaultTheme.blockquote, ...customTheme.blockquote };
    }
    
    if (customTheme.list) {
      merged.list = {
        ...defaultTheme.list,
        ...Object.keys(customTheme.list).reduce((acc, key) => {
          acc[key as keyof Theme['list']] = {
            ...defaultTheme.list[key as keyof Theme['list']],
            ...customTheme.list![key as keyof Theme['list']]
          };
          return acc;
        }, {} as Theme['list'])
      };
    }
    
    if (customTheme.emptyLine) {
      merged.emptyLine = { ...defaultTheme.emptyLine, ...customTheme.emptyLine };
    }
    
    if (customTheme.image) {
      merged.image = { 
        classes: [...(defaultTheme.image.classes || []), ...(customTheme.image.classes || [])],
        attributes: { ...(defaultTheme.image.attributes || {}), ...(customTheme.image.attributes || {}) }
      };
    }
    
    if (customTheme.table) {
      merged.table = {
        ...defaultTheme.table,
        ...Object.keys(customTheme.table).reduce((acc, key) => {
          acc[key as keyof Theme['table']] = {
            ...defaultTheme.table[key as keyof Theme['table']],
            ...customTheme.table![key as keyof Theme['table']]
          };
          return acc;
        }, {} as Theme['table'])
      };
    }
    
    return merged;
  }
}

export interface ParserState {
  blockType: 'paragraph' | 'heading' | 'code_block' | 'blockquote' | 'list' | 'table' | null;
  buffer: string[];
  inCodeBlock: boolean;
  codeBlockFence?: string;
  codeBlockFenceLength?: number; // Length of fence for proper matching
  listType?: 'ordered' | 'unordered';
  listLevels?: number[]; // Indentation levels for nested lists
  tableHeaders?: string[];
  tableAlignments?: ('left' | 'center' | 'right')[];
}

export interface LineInfo {
  raw: string;
  trimmed: string;
  leadingWhitespace: string;
  isWhitespaceOnly: boolean;
  indentLevel: number;
  type: 'empty' | 'whitespace_only' | 'content' | 'special_whitespace';
}

export interface LineProcessor {
  name: string;
  canHandle: (lineInfo: LineInfo, state: ParserState) => boolean;
  process: (lineInfo: LineInfo, state: ParserState, parser: MarkdownParser) => ParseResult;
  priority: number; // Higher priority processors checked first
}

export class MarkdownParser {
  private state: ParserState = {
    blockType: null,
    buffer: [],
    inCodeBlock: false,
    listLevels: []
  };

  private hooks: Record<string, (element: RenderedElement) => RenderedElement> = {};

  private lineProcessors: LineProcessor[] = [];

  private themeProvider: ThemeProvider;

  private formatter: OutputFormatter;

  constructor(options?: {
    hooks?: Record<string, (element: RenderedElement) => RenderedElement>;
    themeProvider?: ThemeProvider;
    theme?: Partial<Theme>;
    enableThemeHook?: boolean;
    formatter?: OutputFormatter;
    enableBlankLines?: boolean;
    enableImages?: boolean;
  }) {
    if (options?.hooks) {
      this.hooks = options.hooks;
    }
    
    this.themeProvider = options?.themeProvider || new DefaultThemeProvider(options?.theme);
    
    // Add theme hook by default unless explicitly disabled
    if (options?.enableThemeHook !== false) {
      this.hooks['__theme__'] = (element: RenderedElement): RenderedElement => this.applyTheme(element);
    }
    
    // Set formatter (default to JSON formatter)
    this.formatter = options?.formatter || new JsonFormatter();
    
    // Add blank line processor by default unless explicitly disabled
    if (options?.enableBlankLines !== false) {
      this.addLineProcessor(blankLineProcessor);
    }
    
    // Add image processor by default unless explicitly disabled
    if (options?.enableImages !== false) {
      this.addLineProcessor(imageProcessor);
    }
    
    // Sort processors by priority descending
    this.lineProcessors.sort((a, b) => b.priority - a.priority);
  }

  addLineProcessor(processor: LineProcessor): void {
    this.lineProcessors.push(processor);
    this.lineProcessors.sort((a, b) => b.priority - a.priority);
  }

  applyTheme(element: RenderedElement, context?: Record<string, unknown>): RenderedElement {
    const theme = this.themeProvider.getTheme(element.type, context);
    const mergedAttributes = { ...(theme.attributes || {}), ...(element.attributes || {}) };
    return {
      ...element,
      classes: [...(theme.classes || []), ...(element.classes || [])],
      attributes: Object.keys(mergedAttributes).length > 0 ? mergedAttributes : undefined
    };
  }

  private applyThemeToElement(element: RenderedElement): RenderedElement {
    let themedElement = this.applyTheme(element);
    
    if (themedElement.children) {
      themedElement = {
        ...themedElement,
        children: themedElement.children.map(child => this.applyThemeToElement(child))
      };
    }
    
    return themedElement;
  }

  feedLine(line: string): ParseResult {
    if (this.state.inCodeBlock) {
      return this.handleCodeBlockLine(line);
    }

    const lineInfo = this.classifyLine(line);

    // Check custom processors first
    for (const processor of this.lineProcessors) {
      if (processor.canHandle(lineInfo, this.state)) {
        return processor.process(lineInfo, this.state, this);
      }
    }

    // Fallback to default handling
    if (lineInfo.trimmed === '') {
      return this.handleEmptyLine();
    }

    if (this.state.blockType !== null) {
      if (this.continueCurrentBlock(line, lineInfo.trimmed)) {
        return { type: 'need_more_lines' };
      } else {
        const result = this.completeCurrentBlock();
        if (result.type === 'complete') {
          result.remainingInput = line;
        }
        return result;
      }
    }

    // Start new block
    if (this.isCodeBlockStart(line)) {
      return this.startCodeBlock(line);
    }

    if (this.isHeading(lineInfo.trimmed)) {
      return this.handleHeading(line);
    }

    if (this.isBlockquote(line)) {
      return this.handleBlockquote(line);
    }

    const listInfo = this.getListInfo(line);
    if (listInfo) {
      return this.handleList(line, listInfo);
    }

    if (this.isTableLine(line)) {
      return this.handleTable(line);
    }

    return this.handleParagraph(line);
  }

  private classifyLine(line: string): LineInfo {
    const trimmed = line.trim();
    const leadingWhitespace = line.match(/^\s*/)?.[0] || '';
    
    let type: LineInfo['type'];
    if (line.length === 0) {
      type = 'empty';
    } else if (trimmed.length === 0) {
      type = 'whitespace_only';
    } else if (/^[\s\t]+$/.test(line)) {
      type = 'special_whitespace';
    } else {
      type = 'content';
    }

    return {
      raw: line,
      trimmed,
      leadingWhitespace,
      isWhitespaceOnly: trimmed.length === 0,
      indentLevel: leadingWhitespace.length,
      type
    };
  }

  private continueCurrentBlock(line: string, trimmed: string): boolean {
    switch (this.state.blockType) {
      case 'paragraph':
        if (
          this.isCodeBlockStart(line) ||
          this.isHeading(trimmed) ||
          this.isBlockquote(line) ||
          this.getListInfo(line) ||
          this.isTableLine(line)
        ) {
          return false;
        }
        // Don't continue paragraphs - complete current paragraph and start new one
        return false;

      case 'blockquote':
        if (this.isBlockquote(line)) {
          this.state.buffer.push(this.stripBlockquotePrefix(line));
          return true;
        }
        // Lazy continuation for non-empty lines that aren't starting new blocks
        if (trimmed !== '' && !this.isCodeBlockStart(line) && !this.isHeading(trimmed) && !this.getListInfo(line)) {
          this.state.buffer.push(line);
          return true;
        }
        return false;

      case 'list': {
        const listInfo = this.getListInfo(line);
        if (listInfo) {
          this.state.buffer.push(line);
          return true;
        }
        // Continuation for multi-line list items with indentation
        if (line.startsWith(' ') && trimmed !== '') {
          this.state.buffer.push(line);
          return true;
        }
        return false;
      }

      case 'table': {
        if (this.isTableLine(line)) {
          this.state.buffer.push(line);
          return true;
        }
        return false;
      }

      default:
        // For custom block types, default to continuing the block by adding to buffer
        // Custom processors should handle termination via their canHandle logic
        this.state.buffer.push(line);
        return true;
    }
  }

  completeCurrentBlock(): ParseResult {
    let result: ParseResult = { type: 'need_more_lines' };

    try {
      if (this.state.blockType === 'paragraph') {
        result = this.completeParagraph();
      } else if (this.state.blockType === 'blockquote') {
        result = this.completeBlockquote();
      } else if (this.state.blockType === 'list') {
        result = this.completeList();
      } else if (this.state.blockType === 'table') {
        result = this.completeTable();
      } else if (this.state.blockType === 'code_block' || this.state.inCodeBlock) {
        result = this.completeIncompleteCodeBlock();
      } else {
        result = { type: 'need_next_token' };
      }
    } catch (error) {
      this.resetState();
      return { type: 'need_next_token', error: error };
    }

    return result;
  }

  private isBlockquote(line: string): boolean {
    return /^\s*>\s*/.test(line);
  }

  private stripBlockquotePrefix(line: string): string {
    const match = line.match(/^\s*>\s*/);
    if (match) {
      return line.slice(match[0].length);
    }
    return line;
  }

  // Extract list information including nesting level based on indentation
  private getListInfo(line: string): { indent: number; isOrdered: boolean; marker: string } | null {
    const match = line.match(/^(\s*)([-*+]|\d+[.)])\s+/);
    if (!match) return null;

    const indent = match[1].length;
    const marker = match[2];
    const isOrdered = /\d+[.)]/.test(marker); // Supports both . and ) for ordered lists

    return { indent, isOrdered, marker };
  }

  private isCodeBlockStart(line: string): boolean {
    const match = line.match(/^(\s*)(`{3,}|~{3,})/);
    return !!match;
  }

  private isHeading(trimmed: string): boolean {
    return /^#{1,6}\s/.test(trimmed);
  }

  private startCodeBlock(line: string): ParseResult {
    const match = line.match(/^(\s*)(`{3,}|~{3,})(.*)$/);
    if (!match) return { type: 'need_next_token' };

    this.state.inCodeBlock = true;
    this.state.codeBlockFence = match[2][0]; // ` or ~
    this.state.codeBlockFenceLength = match[2].length;
    this.state.blockType = 'code_block';
    this.state.buffer = [match[3].trim() || ''];

    return { type: 'need_more_lines' };
  }

  // Handle lines inside code blocks, looking for proper closing fence
  private handleCodeBlockLine(line: string): ParseResult {
    const trimmed = line.trim();
    // Check for closing fence: must match fence type and length, with no extra fence chars
    if (trimmed.startsWith(this.state.codeBlockFence!) && trimmed.length >= this.state.codeBlockFenceLength! && trimmed.charAt(this.state.codeBlockFenceLength!) !== this.state.codeBlockFence![0]) {
      const language = this.state.buffer[0];
      const code = this.state.buffer.slice(1).join('\n');

      const element: RenderedElement = {
        type: 'code_block',
        content: code,
        attributes: language ? { 'data-language': language } : {}
      };

      return this.completeElement(element);
    }

    this.state.buffer.push(line);
    return { type: 'need_more_lines' };
  }

  private handleHeading(line: string): ParseResult {
    const match = line.match(/^\s*(#{1,6})\s+(.+)$/);
    if (!match) return { type: 'need_next_token' };

    const level = match[1].length;
    const content = match[2].trim();

    const element: RenderedElement = {
      type: `h${level}`,
      content: this.parseInline(content)
    };

    return this.completeElement(element);
  }

  private handleBlockquote(line: string): ParseResult {
    this.state.blockType = 'blockquote';
    this.state.buffer = [this.stripBlockquotePrefix(line)];
    return { type: 'need_more_lines' };
  }

  private completeBlockquote(): ParseResult {
    const innerMarkdown = this.state.buffer.join('\n');
    const innerParser = new MarkdownParser({
      hooks: this.hooks,
      themeProvider: this.themeProvider
    });
    const children = innerParser.parse(innerMarkdown);
    const element: RenderedElement = {
      type: 'blockquote',
      content: '',
      children
    };
    return this.completeElement(element);
  }

  private handleList(line: string, listInfo: { indent: number; isOrdered: boolean; marker: string }): ParseResult {
    this.state.blockType = 'list';
    this.state.listType = listInfo.isOrdered ? 'ordered' : 'unordered';
    this.state.listLevels = [listInfo.indent];
    this.state.buffer = [line];
    return { type: 'need_more_lines' };
  }

  private completeList(): ParseResult {
    const items = this.parseListItems(this.state.buffer);
    const element: RenderedElement = {
      type: this.state.listType === 'ordered' ? 'ol' : 'ul',
      content: '',
      children: items
    };
    return this.completeElement(element);
  }

  private parseListItems(lines: string[]): RenderedElement[] {
    const items: RenderedElement[] = [];
    let currentItem: string[] = [];

    lines.forEach(line => {
      const listInfo = this.getListInfo(line);
      if (listInfo && currentItem.length > 0 && listInfo.indent <= (this.state.listLevels![this.state.listLevels!.length - 1] || 0)) {
        // Finish current item
        items.push(this.createListItem(currentItem));
        currentItem = [];
      }
      currentItem.push(line);
    });

    if (currentItem.length > 0) {
      items.push(this.createListItem(currentItem));
    }

    return items;
  }

  private createListItem(lines: string[]): RenderedElement {
    const firstLine = lines[0];
    const match = firstLine.match(/^\s*([-*+]|\d+[.)])\s+/);
    const prefixLength = match ? match[0].length : 0;
    const firstContent = firstLine.slice(prefixLength);
    const innerLines = [firstContent, ...lines.slice(1)];
    const innerMarkdown = innerLines.join('\n');
    const innerParser = new MarkdownParser({
      hooks: this.hooks,
      themeProvider: this.themeProvider
    });
    const children = innerParser.parse(innerMarkdown);

    const element: RenderedElement = {
      type: 'li',
      content: '',
      children
    };

    // Unwrap if single paragraph
    if (children.length === 1 && children[0].type === 'p') {
      element.content = children[0].content;
      element.children = undefined;
    }

    // Apply theme before returning
    let finalElement = element;
    
    // Apply theme hook first if it exists
    if (this.hooks['__theme__']) {
      finalElement = this.hooks['__theme__'](finalElement);
    }
    
    // Apply element-specific hook if it exists
    if (this.hooks[element.type]) {
      finalElement = this.hooks[element.type](finalElement);
    }
    
    return finalElement;
  }

  private handleParagraph(line: string): ParseResult {
    this.state.blockType = 'paragraph';
    this.state.buffer = [line];
    return { type: 'need_more_lines' };
  }

  private handleEmptyLine(): ParseResult {
    if (this.state.blockType && this.state.blockType !== 'code_block' && this.state.blockType !== 'blockquote' && this.state.blockType !== 'list') {
      return this.completeCurrentBlock();
    }
    return { type: 'need_more_lines' };
  }

  private completeParagraph(): ParseResult {
    const content = this.state.buffer[0]; // Only one line per paragraph now
    const element: RenderedElement = {
      type: 'p',
      content: this.parseInline(content)
    };
    return this.completeElement(element);
  }

  private completeIncompleteCodeBlock(): ParseResult {
    const language = this.state.buffer[0];
    const code = this.state.buffer.slice(1).join('\n');

    const element: RenderedElement = {
      type: 'code_block',
      content: code,
      attributes: language ? { 'data-language': language } : {}
    };

    return this.completeElement(element);
  }

  // Improved inline parsing with escape sequence support and tokenization
  // Still simplified - full CommonMark compliance would need a proper AST parser
  private parseInline(text: string): string {
    // Use a tokenizer approach for better accuracy
    const tokens: string[] = [];
    let i = 0;
    let current = '';
    let escape = false;

    while (i < text.length) {
      const char = text[i];

      if (escape) {
        current += char;
        escape = false;
        i++;
        continue;
      }

      if (char === '\\') {
        escape = true;
        i++;
        continue;
      }

      if (char === '*' || char === '_') {
        // Handle bold and italic
        const next = text[i + 1];
        if (next === '*' || next === '_') {
          // Bold
          if (current) {
            tokens.push(current);
            current = '';
          }
          tokens.push(char + next);
          i += 2;
          continue;
        } else {
          // Italic
          if (current) {
            tokens.push(current);
            current = '';
          }
          tokens.push(char);
          i++;
          continue;
        }
      } else if (char === '`') {
        // Code
        if (current) {
          tokens.push(current);
          current = '';
        }
        tokens.push('`');
        i++;
        continue;
      } else if (char === ':') {
        // Potential emoji syntax
        if (current) {
          tokens.push(current);
          current = '';
        }
        tokens.push(':');
        i++;
        continue;
      } else if (char === '[') {
        // Link or Image
        if (current) {
          tokens.push(current);
          current = '';
        }
        // Check if this is an image (preceded by !)
        if (i > 0 && text[i - 1] === '!') {
          tokens.push('![');
        } else {
          tokens.push('[');
        }
        i++;
        continue;
      } else if (char === '!' && i + 1 < text.length && text[i + 1] === '[') {
        // Image start
        if (current) {
          tokens.push(current);
          current = '';
        }
        // Don't push anything here, let the '[' handler catch it
        i++;
        continue;
      } else {
        current += char;
        i++;
      }
    }
    if (current) tokens.push(current);

    // Now process tokens with proper nesting
    // This is simplified; for full nesting, a stack-based parser is better
    let html = tokens.join('');
    
    // Process code spans first to protect their content from other processing
    const codeSpans: string[] = [];
    html = html.replace(/`([^`]+?)`/g, (match, content) => {
      const index = codeSpans.length;
      codeSpans.push(`<code>${content}</code>`);
      return `\x00CODE${index}\x00`;
    });
    
    // Process emoji syntax before other inline elements to prevent conflicts
    const emojiSpans: string[] = [];
    html = html.replace(/:([a-zA-Z0-9_+-]+):/g, (match, emojiName) => {
      const index = emojiSpans.length;
      emojiSpans.push(`<span class="emoji" data-emoji="${emojiName}">${match}</span>`);
      return `\x00EMOJI${index}\x00`;
    });
    
    // Apply replacements in order to handle some nesting: bold first, then italic
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>'); // Bold first
    html = html.replace(/\*([^*]+?)\*/g, '<em>$1</em>'); // Italic after
    html = html.replace(/_([^_]+?)_/g, '<em>$1</em>');
    
    // Now process images and links (code content is protected)
    html = html.replace(/!\[([^\]]*?)\]\(([^)]+?)\)/g, '<img src="$2" alt="$1" />'); // Images first
    html = html.replace(/\[([^\]]+?)\]\(([^)]+?)\)/g, '<a href="$2">$1</a>'); // Links after
    
    // Restore emoji spans
    html = html.replace(/\x00EMOJI(\d+)\x00/g, (match, index) => emojiSpans[parseInt(index)]);
    
    // Restore code spans
    html = html.replace(/\x00CODE(\d+)\x00/g, (match, index) => codeSpans[parseInt(index)]);

    return html;
  }

  private resetState(): void {
    this.state = {
      blockType: null,
      buffer: [],
      inCodeBlock: false,
      listLevels: []
    };
  }

  completeElement(element: RenderedElement): ParseResult {
    let finalElement = element;
    
    // Apply theme hook first if it exists
    if (this.hooks['__theme__']) {
      finalElement = this.hooks['__theme__'](finalElement);
    }
    
    // Apply element-specific hook if it exists
    if (this.hooks[element.type]) {
      finalElement = this.hooks[element.type](finalElement);
    }
    
    this.resetState();
    return { type: 'complete', element: finalElement };
  }

  reset(): void {
    this.resetState();
  }

  private isTableLine(line: string): boolean {
    const trimmed = line.trim();
    // Must have at least one pipe character and not be empty
    return trimmed.includes('|') && trimmed.length > 0;
  }

  private isTableSeparator(line: string): boolean {
    const trimmed = line.trim();
    // Table separator: | --- | --- | or |:---:|:---:| or --- | --- etc.
    // Must contain at least one dash and be composed of valid separator chars
    if (!trimmed.includes('-')) return false;
    
    // Remove leading/trailing pipes and check if valid separator pattern
    const cleaned = trimmed.replace(/^\|/, '').replace(/\|$/, '');
    const parts = cleaned.split('|');
    
    return parts.every(part => /^[\s\-:]+$/.test(part.trim()) && part.trim().includes('-'));
  }

  private handleTable(line: string): ParseResult {
    this.state.blockType = 'table';
    this.state.buffer = [line];
    return { type: 'need_more_lines' };
  }

  private completeTable(): ParseResult {
    if (this.state.buffer.length < 2) {
      // Not enough lines for a table, fall back to paragraph
      return this.completeParagraph();
    }

    const lines = this.state.buffer;
    const headerLine = lines[0];
    const possibleSeparatorLine = lines[1];

    // Validate table structure
    if (!this.isTableSeparator(possibleSeparatorLine)) {
      // Not a valid table, fall back to paragraph
      return this.completeParagraph();
    }

    // Parse headers and alignments
    const headers = this.parseTableRow(headerLine);
    const alignments = this.parseTableAlignments(possibleSeparatorLine);
    
    // Parse data rows (skip header and separator)
    const dataRows = lines.slice(2).map(line => this.parseTableRow(line));

    // Create table structure
    const theadElement: RenderedElement = {
      type: 'thead',
      content: '',
      children: [{
        type: 'tr',
        content: '',
        children: headers.map((header, index) => ({
          type: 'th',
          content: this.parseInline(header),
          attributes: alignments[index] && alignments[index] !== 'left' ? { style: `text-align: ${alignments[index]}` } : undefined
        }))
      }]
    };

    const tbodyElement: RenderedElement = {
      type: 'tbody',
      content: '',
      children: dataRows.map(row => ({
        type: 'tr',
        content: '',
        children: row.map((cell, index) => ({
          type: 'td',
          content: this.parseInline(cell),
          attributes: alignments[index] && alignments[index] !== 'left' ? { style: `text-align: ${alignments[index]}` } : undefined
        }))
      }))
    };

    const element: RenderedElement = {
      type: 'table',
      content: '',
      children: [this.applyThemeToElement(theadElement), this.applyThemeToElement(tbodyElement)]
    };

    return this.completeElement(element);
  }

  private parseTableRow(line: string): string[] {
    const trimmed = line.trim();
    // Remove leading and trailing pipes, then split by pipes
    const cleaned = trimmed.replace(/^\|/, '').replace(/\|$/, '');
    return cleaned.split('|').map(cell => cell.trim());
  }

  private parseTableAlignments(separatorLine: string): ('left' | 'center' | 'right')[] {
    const trimmed = separatorLine.trim();
    const cleaned = trimmed.replace(/^\|/, '').replace(/\|$/, '');
    const separators = cleaned.split('|').map(sep => sep.trim());
    
    return separators.map(sep => {
      if (sep.startsWith(':') && sep.endsWith(':')) {
        return 'center';
      } else if (sep.endsWith(':')) {
        return 'right';
      } else {
        return 'left';
      }
    });
  }

  parse(markdown: string): RenderedElement[] {
    this.resetState();
    const lines = markdown.split(/\r?\n/);
    const tokens: RenderedElement[] = [];
    let i = 0;
    while (i < lines.length) {
      const result = this.feedLine(lines[i]);
      if (result.type === 'complete' && result.element) {
        tokens.push(result.element);
      }
      if (result.remainingInput !== undefined) {
        // Stay on the same line
      } else {
        i++;
      }
    }
    // Flush any remaining block
    const flushResult = this.completeCurrentBlock();
    if (flushResult.type === 'complete' && flushResult.element) {
      tokens.push(flushResult.element);
    }
    return tokens;
  }

  setFormatter(formatter: OutputFormatter): void {
    this.formatter = formatter;
  }

  format(elements?: RenderedElement[]): any {
    const elementsToFormat = elements || this.parse('');
    return this.formatter.format(elementsToFormat);
  }

  parseAndFormat(markdown: string): any {
    const elements = this.parse(markdown);
    return this.formatter.format(elements);
  }
}

// Example: Blank Line Processor
export const blankLineProcessor: LineProcessor = {
  name: 'blank_line_handler',
  priority: 100, // High priority to catch before default empty line handler
  
  canHandle: (lineInfo: LineInfo, state: ParserState) => {
    return lineInfo.isWhitespaceOnly && !state.inCodeBlock;
  },
  
  process: (lineInfo: LineInfo, state: ParserState, parser: MarkdownParser) => {
    // If we have an active block, complete it first and reprocess this blank line
    if (state.blockType !== null) {
      const result = parser.completeCurrentBlock();
      if (result.type === 'complete') {
        result.remainingInput = lineInfo.raw;
      }
      return result;
    }
    
    // Create a special element for blank lines
    const element: RenderedElement = {
      type: 'empty_line',
      content: ''
    };
    
    return parser.completeElement(element);
  }
};

// Example: Image Processor for standalone image lines
export const imageProcessor: LineProcessor = {
  name: 'image_handler',
  priority: 90, // High priority to catch before paragraph handler
  
  canHandle: (lineInfo: LineInfo, state: ParserState) => {
    // Only handle standalone image lines (not within code blocks)
    if (state.inCodeBlock || state.blockType !== null) return false;
    
    // Check if line contains only an image (possibly with surrounding whitespace)
    const imageRegex = /^\s*!\[([^\]]*?)\]\(([^)]+?)\)\s*$/;
    return imageRegex.test(lineInfo.raw);
  },
  
  process: (lineInfo: LineInfo, state: ParserState, parser: MarkdownParser) => {
    const imageRegex = /^\s*!\[([^\]]*?)\]\(([^)]+?)\)\s*$/;
    const match = lineInfo.raw.match(imageRegex);
    
    if (!match) {
      return { type: 'need_next_token' };
    }
    
    const [, alt, src] = match;
    
    const element: RenderedElement = {
      type: 'img',
      content: '',
      attributes: {
        src: src.trim(),
        alt: alt.trim()
      }
    };
    
    return parser.completeElement(element);
  }
};

// Usage example:
// const parser = new MarkdownParser();
// parser.addLineProcessor(blankLineProcessor);
// parser.addLineProcessor(imageProcessor);

// Built-in Formatters

export class JsonFormatter implements OutputFormatter<RenderedElement[]> {
  name = 'json';

  constructor(private options: FormatterOptions = {}) {}

  format(elements: RenderedElement[]): RenderedElement[] {
    return elements;
  }

  formatElement(element: RenderedElement): RenderedElement {
    return element;
  }
}

export class HtmlFormatter implements OutputFormatter<string> {
  name = 'html';

  constructor(private options: FormatterOptions = {}) {}

  format(elements: RenderedElement[]): string {
    return elements.map(element => this.formatElement(element)).join('');
  }

  formatElement(element: RenderedElement): string {
    const tag = element.type === 'code_block' ? 'pre' : element.type;
    const classes = element.classes ? ` class="${element.classes.join(' ')}"` : '';
    const attrs = element.attributes ? 
      Object.entries(element.attributes)
        .map(([key, value]) => ` ${key}="${this.escapeAttribute(value)}"`)
        .join('') : '';
    
    // Handle self-closing tags
    if (element.type === 'img') {
      return `<${tag}${classes}${attrs} />`;
    }
    
    // Handle empty lines as <br> tags
    if (element.type === 'empty_line') {
      return `<br${classes}${attrs} />`;
    }
    
    if (element.children) {
      const childrenHTML = element.children.map(child => this.formatElement(child)).join('');
      return `<${tag}${classes}${attrs}>${childrenHTML}</${tag}>`;
    } else {
      const content = element.content || '';
      if (element.type === 'code_block') {
        return `<${tag}${classes}${attrs}><code>${this.escapeHtml(content)}</code></${tag}>`;
      }
      // For most content types, the content is already processed HTML from parseInline
      // But we should escape raw text content that wasn't processed
      const finalContent = this.shouldEscapeContent(element) ? this.escapeHtml(content) : content;
      return `<${tag}${classes}${attrs}>${finalContent}</${tag}>`;
    }
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private escapeAttribute(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;');
  }

  private shouldEscapeContent(element: RenderedElement): boolean {
    // Elements that contain raw text that should be escaped
    const rawTextElements = ['span', 'div', 'td', 'th'];
    if (rawTextElements.includes(element.type)) {
      return true;
    }
    
    // If content doesn't contain HTML tags but has special characters, escape it
    const content = element.content || '';
    return !content.includes('<') && (content.includes('&') || content.includes('>') || content.includes('"'));
  }
}

export class PrettyJsonFormatter implements OutputFormatter<string> {
  name = 'pretty-json';

  constructor(private options: FormatterOptions = {}) {}

  format(elements: RenderedElement[]): string {
    const indentSize = this.options.indentSize || 2;
    return JSON.stringify(elements, null, indentSize);
  }

  formatElement(element: RenderedElement): string {
    const indentSize = this.options.indentSize || 2;
    return JSON.stringify(element, null, indentSize);
  }
}
