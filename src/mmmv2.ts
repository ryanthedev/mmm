export interface Token {
  type: string;
  content?: string;
  children?: Token[];
  metadata?: Record<string, any>;
}

export interface ParsePlugin {
  name: string;
  priority: number; // Higher number = higher priority, runs first
  canHandle: (line: string) => boolean;
  parse: (line: string, parseInline: (text: string) => Token[]) => Token[] | null;
}

export interface TokenHook {
  name: string;
  tokenType: string; // The token type this hook applies to
  process: (token: Token) => Token; // Transform the token
}

export interface ParserConfig {
  plugins?: ParsePlugin[];
  hooks?: TokenHook[];
  emojiManager?: EmojiManager;
}

export enum TokenType {
  TEXT = 'text',
  BOLD = 'bold',
  ITALIC = 'italic',
  CODE_FENCE = 'code_fence',
  INLINE_CODE = 'inline_code',
  STRIKETHROUGH = 'strikethrough',
  HIGHLIGHT = 'highlight',
  SUBSCRIPT = 'subscript',
  SUPERSCRIPT = 'superscript',
  CURSOR = 'cursor',
  LINK = 'link',
  IMAGE = 'image',
  H1 = 'h1',
  H2 = 'h2',
  H3 = 'h3',
  H4 = 'h4',
  H5 = 'h5',
  H6 = 'h6',
  BLOCKQUOTE = 'blockquote',
  HORIZONTAL_RULE = 'hr',
  UNORDERED_LIST_ITEM = 'unordered_list_item',
  ORDERED_LIST_ITEM = 'ordered_list_item',
  TASK_LIST_ITEM = 'task_list_item',
  TABLE_ROW = 'table_row',
  TABLE_CELL = 'table_cell',
  TABLE_SEPARATOR = 'table_separator',
  FOOTNOTE_REF = 'footnote_ref',
  FOOTNOTE_DEF = 'footnote_def',
  EMPTY_LINE = 'empty_line',
  EMOJI = 'emoji'
}

export interface EmojiMapping {
  [shortcode: string]: string;
}

export class EmojiManager {
  private mappings: EmojiMapping = {};

  constructor(mappings?: EmojiMapping) {
    if (mappings) {
      this.mappings = { ...mappings };
    }
  }

  addEmoji(shortcode: string, emoji: string): void {
    this.mappings[shortcode] = emoji;
  }

  removeEmoji(shortcode: string): void {
    delete this.mappings[shortcode];
  }

  hasEmoji(shortcode: string): boolean {
    return shortcode in this.mappings;
  }

  getEmoji(shortcode: string): string | undefined {
    return this.mappings[shortcode];
  }

  getAllMappings(): EmojiMapping {
    return { ...this.mappings };
  }

  setMappings(mappings: EmojiMapping): void {
    this.mappings = { ...mappings };
  }

  clearMappings(): void {
    this.mappings = {};
  }
}


export function getDefaultEmojiMappings(): EmojiMapping {
  return {
    // Common emojis
    'smile': '😊',
    'joy': '😂',
    'heart': '❤️',
    'thumbs_up': '👍',
    'thumbs_down': '👎',
    'fire': '🔥',
    'star': '⭐',
    'rocket': '🚀',
    'tada': '🎉',
    'clap': '👏',
    'wave': '👋',
    'eyes': '👀',
    'thinking': '🤔',
    'wink': '😉',
    'confused': '😕',
    'cry': '😢',
    'angry': '😠',
    'cool': '😎',
    'sleeping': '😴',
    'sick': '🤒',
    // Food & drink
    'pizza': '🍕',
    'burger': '🍔',
    'coffee': '☕',
    'beer': '🍺',
    'cake': '🎂',
    // Animals
    'cat': '🐱',
    'dog': '🐶',
    'unicorn': '🦄',
    'lion': '🦁',
    'tiger': '🐅',
    // Nature
    'sun': '☀️',
    'moon': '🌙',
    'rainbow': '🌈',
    'tree': '🌳',
    'flower': '🌸',
    // Objects
    'car': '🚗',
    'plane': '✈️',
    'house': '🏠',
    'phone': '📞',
    'computer': '💻',
    // Symbols
    'check': '✅',
    'cross': '❌',
    'warning': '⚠️',
    'info': 'ℹ️',
    'question': '❓'
  };
}

export function createEmojiManagerWithNodeEmoji(): EmojiManager {
  try {
    // Try to import node-emoji if available
    const nodeEmoji = require('node-emoji');
    const mappings: EmojiMapping = {};
    
    // Get all emoji from node-emoji
    const emojiLib = nodeEmoji.emoji;
    for (const [shortcode, emoji] of Object.entries(emojiLib)) {
      mappings[shortcode] = emoji as string;
    }
    
    return new EmojiManager(mappings);
  } catch (error) {
    // Fall back to default mappings if node-emoji is not available
    return new EmojiManager(getDefaultEmojiMappings());
  }
}

function parseInline(text: string, emojiManager?: EmojiManager): Token[] {
  const tokens: Token[] = [];
  let remaining = text;
  let currentIndex = 0;

  while (currentIndex < remaining.length) {
    let matched = false;

    // Handle escaping
    if (remaining[currentIndex] === '\\' && currentIndex + 1 < remaining.length) {
      const escapedChar = remaining[currentIndex + 1];
      if (escapedChar !== undefined) {
        // Push any text before the backslash
        if (currentIndex > 0) {
          tokens.push({ type: TokenType.TEXT, content: remaining.slice(0, currentIndex) });
        }
        // Push the escaped character
        tokens.push({ type: TokenType.TEXT, content: escapedChar });
        // Update remaining string and reset index
        remaining = remaining.slice(currentIndex + 2);
        currentIndex = 0;
        matched = true;
        continue;
      }
    }

    // Handle emoji :shortcode:
    if (!matched && emojiManager && remaining[currentIndex] === ':') {
      const nextColonIndex = remaining.indexOf(':', currentIndex + 1);
      if (nextColonIndex !== -1) {
        const shortcode = remaining.slice(currentIndex + 1, nextColonIndex);
        
        // Check if it's a valid shortcode (alphanumeric, underscore, hyphen, not empty)
        if (/^[a-zA-Z0-9_-]+$/.test(shortcode) && emojiManager.hasEmoji(shortcode)) {
          const emoji = emojiManager.getEmoji(shortcode);
          if (emoji) {
            if (currentIndex > 0) {
              tokens.push({ type: TokenType.TEXT, content: remaining.slice(0, currentIndex) });
            }
            tokens.push({
              type: TokenType.EMOJI,
              content: emoji,
              metadata: { shortcode }
            });
            remaining = remaining.slice(nextColonIndex + 1);
            currentIndex = 0;
            matched = true;
          }
        }
      }
    }

    // Handle cursor @!
    if (!matched && remaining.slice(currentIndex, currentIndex + 2) === '@!') {
      if (currentIndex > 0) {
        tokens.push({ type: TokenType.TEXT, content: remaining.slice(0, currentIndex) });
      }
      
      // Capture the next character after @! (if it exists)
      const nextCharIndex = currentIndex + 2;
      let cursorContent = '';
      let consumeLength = 2; // Start with @! length
      
      if (nextCharIndex < remaining.length) {
        cursorContent = remaining[nextCharIndex] || '';
        consumeLength = 3; // @! + one character
      }
      
      tokens.push({ 
        type: TokenType.CURSOR, 
        content: cursorContent 
      });
      remaining = remaining.slice(currentIndex + consumeLength);
      currentIndex = 0;
      matched = true;
    }

    // Handle image ![alt](url "title")
    if (!matched) {
      const imageMatch = remaining.slice(currentIndex).match(/^!\[(.*?)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/);
      if (imageMatch) {
        const altText = imageMatch[1] || '';
        const src = imageMatch[2];
        const title = imageMatch[3] || '';
        if (currentIndex > 0) {
          tokens.push({ type: TokenType.TEXT, content: remaining.slice(0, currentIndex) });
        }
        tokens.push({
          type: TokenType.IMAGE,
          children: parseInline(altText, emojiManager),
          metadata: { src, title }
        });
        remaining = remaining.slice(currentIndex + imageMatch[0].length);
        currentIndex = 0;
        matched = true;
      }
    }

    // Handle footnote reference [^id]
    if (!matched && remaining.slice(currentIndex, currentIndex + 2) === '[^') {
      const endBracket = remaining.indexOf(']', currentIndex + 2);
      if (endBracket !== -1) {
        const id = remaining.slice(currentIndex + 2, endBracket);
        if (/^[\w]+$/.test(id)) {
          if (currentIndex > 0) {
            tokens.push({ type: TokenType.TEXT, content: remaining.slice(0, currentIndex) });
          }
          tokens.push({ type: TokenType.FOOTNOTE_REF, content: id });
          remaining = remaining.slice(endBracket + 1);
          currentIndex = 0;
          matched = true;
        }
      }
    }

    // Handle link [text](url "title")
    if (!matched) {
      const linkMatch = remaining.slice(currentIndex).match(/^\[(.*?)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/);
      if (linkMatch) {
        const linkText = linkMatch[1] || '';
        const href = linkMatch[2];
        const title = linkMatch[3] || '';
        if (currentIndex > 0) {
          tokens.push({ type: TokenType.TEXT, content: remaining.slice(0, currentIndex) });
        }
        tokens.push({
          type: TokenType.LINK,
          children: parseInline(linkText, emojiManager),
          metadata: { href, title }
        });
        remaining = remaining.slice(currentIndex + linkMatch[0].length);
        currentIndex = 0;
        matched = true;
      }
    }

    // Handle autolink <url>
    if (!matched && remaining[currentIndex] === '<') {
      // Try image-card first
      const imageCardMatch = remaining.slice(currentIndex).match(/^<image-card\s+alt="([^"]*?)"\s+src="([^"]*?)"\s*><\/image-card>/);
      if (imageCardMatch) {
        const alt = imageCardMatch[1] || '';
        const src = imageCardMatch[2] || '';
        if (currentIndex > 0) {
          tokens.push({ type: TokenType.TEXT, content: remaining.slice(0, currentIndex) });
        }
        tokens.push({
          type: TokenType.IMAGE,
          children: parseInline(alt, emojiManager),
          metadata: { src, title: '' }
        });
        remaining = remaining.slice(currentIndex + imageCardMatch[0].length);
        currentIndex = 0;
        matched = true;
      } else {
        // Try autolink
        const autoLinkMatch = remaining.slice(currentIndex).match(/^<((?:https?|ftp|mailto):[^>]+)>/);
        if (autoLinkMatch) {
          const url = autoLinkMatch[1] || '';
          if (currentIndex > 0) {
            tokens.push({ type: TokenType.TEXT, content: remaining.slice(0, currentIndex) });
          }
          tokens.push({
            type: TokenType.LINK,
            children: [{ type: TokenType.TEXT, content: url }],
            metadata: { href: url }
          });
          remaining = remaining.slice(currentIndex + autoLinkMatch[0].length);
          currentIndex = 0;
          matched = true;
        }
      }
    }

    // Handle strikethrough ~~text~~
    if (!matched && remaining.slice(currentIndex, currentIndex + 2) === '~~') {
      const endIndex = remaining.indexOf('~~', currentIndex + 2);
      if (endIndex !== -1) {
        if (currentIndex > 0) {
          tokens.push({ type: TokenType.TEXT, content: remaining.slice(0, currentIndex) });
        }
        tokens.push({
          type: TokenType.STRIKETHROUGH,
          content: remaining.slice(currentIndex + 2, endIndex)
        });
        remaining = remaining.slice(endIndex + 2);
        currentIndex = 0;
        matched = true;
      }
    }

    // Handle highlight ==text==
    if (!matched && remaining.slice(currentIndex, currentIndex + 2) === '==') {
      const endIndex = remaining.indexOf('==', currentIndex + 2);
      if (endIndex !== -1) {
        if (currentIndex > 0) {
          tokens.push({ type: TokenType.TEXT, content: remaining.slice(0, currentIndex) });
        }
        tokens.push({
          type: TokenType.HIGHLIGHT,
          content: remaining.slice(currentIndex + 2, endIndex)
        });
        remaining = remaining.slice(endIndex + 2);
        currentIndex = 0;
        matched = true;
      }
    }

    // Handle bold **text**
    if (!matched && remaining.slice(currentIndex, currentIndex + 2) === '**') {
      let endIndex = remaining.indexOf('**', currentIndex + 2);
      
      // Special case: if we find ***, the first * belongs to italic and ** belongs to bold
      if (endIndex !== -1 && endIndex + 2 < remaining.length && remaining[endIndex + 2] === '*') {
        // This is ***, so we want the content to include the first *, and the bold ends after the **
        endIndex = endIndex + 1; // Include the * that belongs to italic in the content
      }
      
      if (endIndex !== -1) {
        if (currentIndex > 0) {
          tokens.push({ type: TokenType.TEXT, content: remaining.slice(0, currentIndex) });
        }
        tokens.push({
          type: TokenType.BOLD,
          children: parseInline(remaining.slice(currentIndex + 2, endIndex), emojiManager)
        });
        remaining = remaining.slice(endIndex + 2);
        currentIndex = 0;
        matched = true;
      }
    }

    // Handle bold __text__
    if (!matched && remaining.slice(currentIndex, currentIndex + 2) === '__') {
      const endIndex = remaining.indexOf('__', currentIndex + 2);
      if (endIndex !== -1) {
        if (currentIndex > 0) {
          tokens.push({ type: TokenType.TEXT, content: remaining.slice(0, currentIndex) });
        }
        tokens.push({
          type: TokenType.BOLD,
          children: parseInline(remaining.slice(currentIndex + 2, endIndex), emojiManager)
        });
        remaining = remaining.slice(endIndex + 2);
        currentIndex = 0;
        matched = true;
      }
    }

    // Handle inline code `code`
    if (!matched && remaining[currentIndex] === '`' && remaining.slice(currentIndex, currentIndex + 3) !== '```') {
      const endIndex = remaining.indexOf('`', currentIndex + 1);
      if (endIndex !== -1) {
        if (currentIndex > 0) {
          tokens.push({ type: TokenType.TEXT, content: remaining.slice(0, currentIndex) });
        }
        tokens.push({
          type: TokenType.INLINE_CODE,
          content: remaining.slice(currentIndex + 1, endIndex)
        });
        remaining = remaining.slice(endIndex + 1);
        currentIndex = 0;
        matched = true;
      }
    }

    // Handle italic *text*
    if (!matched && remaining[currentIndex] === '*' && remaining[currentIndex + 1] !== '*') {
      const endIndex = remaining.indexOf('*', currentIndex + 1);
      if (endIndex !== -1) {
        if (currentIndex > 0) {
          tokens.push({ type: TokenType.TEXT, content: remaining.slice(0, currentIndex) });
        }
        tokens.push({
          type: TokenType.ITALIC,
          children: parseInline(remaining.slice(currentIndex + 1, endIndex), emojiManager)
        });
        remaining = remaining.slice(endIndex + 1);
        currentIndex = 0;
        matched = true;
      }
    }

    // Handle italic _text_
    if (!matched && remaining[currentIndex] === '_' && remaining[currentIndex + 1] !== '_') {
      const endIndex = remaining.indexOf('_', currentIndex + 1);
      if (endIndex !== -1) {
        if (currentIndex > 0) {
          tokens.push({ type: TokenType.TEXT, content: remaining.slice(0, currentIndex) });
        }
        tokens.push({
          type: TokenType.ITALIC,
          children: parseInline(remaining.slice(currentIndex + 1, endIndex), emojiManager)
        });
        remaining = remaining.slice(endIndex + 1);
        currentIndex = 0;
        matched = true;
      }
    }

    // Handle subscript ~text~
    if (!matched && remaining[currentIndex] === '~' && remaining[currentIndex + 1] !== '~') {
      const endIndex = remaining.indexOf('~', currentIndex + 1);
      if (endIndex !== -1) {
        if (currentIndex > 0) {
          tokens.push({ type: TokenType.TEXT, content: remaining.slice(0, currentIndex) });
        }
        tokens.push({
          type: TokenType.SUBSCRIPT,
          content: remaining.slice(currentIndex + 1, endIndex)
        });
        remaining = remaining.slice(endIndex + 1);
        currentIndex = 0;
        matched = true;
      }
    }

    // Handle superscript ^text^
    if (!matched && remaining[currentIndex] === '^' && remaining.slice(currentIndex, currentIndex + 2) !== '^ ') {  // Avoid footnote confusion
      const endIndex = remaining.indexOf('^', currentIndex + 1);
      if (endIndex !== -1) {
        if (currentIndex > 0) {
          tokens.push({ type: TokenType.TEXT, content: remaining.slice(0, currentIndex) });
        }
        tokens.push({
          type: TokenType.SUPERSCRIPT,
          content: remaining.slice(currentIndex + 1, endIndex)
        });
        remaining = remaining.slice(endIndex + 1);
        currentIndex = 0;
        matched = true;
      }
    }

    if (!matched) {
      currentIndex++;
    }
  }

  // Add any remaining text
  if (remaining.length > 0) {
    tokens.push({ type: TokenType.TEXT, content: remaining });
  }

  return tokens.filter(t => t.content || t.children?.length || t.type === TokenType.CURSOR);  // Filter empty, but keep cursor tokens
}

export class TokenParser {
  private plugins: ParsePlugin[] = [];
  private hooks: Map<string, TokenHook[]> = new Map();
  private emojiManager?: EmojiManager;

  constructor(config?: ParserConfig) {
    if (config?.plugins) {
      this.plugins = [...config.plugins].sort((a, b) => b.priority - a.priority);
    }
    if (config?.hooks) {
      for (const hook of config.hooks) {
        this.addHook(hook);
      }
    }
    if (config?.emojiManager) {
      this.emojiManager = config.emojiManager;
    }
  }

  addPlugin(plugin: ParsePlugin): void {
    this.plugins.push(plugin);
    this.plugins.sort((a, b) => b.priority - a.priority);
  }

  removePlugin(name: string): void {
    this.plugins = this.plugins.filter(p => p.name !== name);
  }

  addHook(hook: TokenHook): void {
    if (!this.hooks.has(hook.tokenType)) {
      this.hooks.set(hook.tokenType, []);
    }
    this.hooks.get(hook.tokenType)!.push(hook);
  }

  removeHook(tokenType: string, hookName: string): void {
    const hooks = this.hooks.get(tokenType);
    if (hooks) {
      const filtered = hooks.filter(h => h.name !== hookName);
      if (filtered.length === 0) {
        this.hooks.delete(tokenType);
      } else {
        this.hooks.set(tokenType, filtered);
      }
    }
  }

  private applyHooks(token: Token): Token {
    const hooks = this.hooks.get(token.type);
    if (!hooks || hooks.length === 0) {
      return token;
    }

    let processedToken = token;
    for (const hook of hooks) {
      processedToken = hook.process(processedToken);
    }
    return processedToken;
  }

  private processTokenRecursively(token: Token): Token {
    // First, process children recursively if they exist
    if (token.children) {
      token = {
        ...token,
        children: token.children.map(child => this.processTokenRecursively(child))
      };
    }

    // Then apply hooks to this token (after children are processed)
    return this.applyHooks(token);
  }

  parse(line: string): Token[] {
    // Try plugins first (in priority order)
    for (const plugin of this.plugins) {
      if (plugin.canHandle(line)) {
        const result = plugin.parse(line, (text: string) => parseInline(text, this.emojiManager));
        if (result !== null) {
          // Apply hooks to the result
          return result.map(token => this.processTokenRecursively(token));
        }
      }
    }

    // Fall back to built-in parsing and apply hooks
    const tokens = parseBuiltIn(line, this.emojiManager);
    return tokens.map(token => this.processTokenRecursively(token));
  }
}

// Built-in parsing logic (extracted from original parse function)
function parseBuiltIn(line: string, emojiManager?: EmojiManager): Token[] {
  let tokens: Token[] = [];

  // Check for empty line (empty string, whitespace only, or newlines)
  if (line.trim() === '' || /^[\s\r\n]*$/.test(line)) {
    return [{ type: TokenType.EMPTY_LINE, content: line }];
  }

  // Check for code fence
  const codeFenceMatch = line.match(/^```\s*(\w+)?\s*$/);
  if (codeFenceMatch) {
    const token: Token = {
      type: TokenType.CODE_FENCE,
      content: ''
    };
    if (codeFenceMatch[1]) {
      token.metadata = { lang: codeFenceMatch[1] };
    }
    return [token];
  }

  // Check for horizontal rule
  const trimmed = line.trim();
  const isHR = trimmed.length >= 3 && (
    /^(-|\s)*$/.test(trimmed.replace(/-/g, '')) && trimmed.replace(/[^-]/g, '').length >= 3 ||
    /^(\*|\s)*$/.test(trimmed.replace(/\*/g, '')) && trimmed.replace(/[^\*]/g, '').length >= 3 ||
    /^(_|\s)*$/.test(trimmed.replace(/_/g, '')) && trimmed.replace(/[^_]/g, '').length >= 3
  );
  if (isHR) {
    return [{ type: TokenType.HORIZONTAL_RULE }];
  }

  // Check for footnote definition [^id]: text
  const footnoteDefMatch = line.match(/^\[\^([\w]+)\]:\s+(.*)$/);
  if (footnoteDefMatch) {
    const id = footnoteDefMatch[1] || '';
    const content = footnoteDefMatch[2] || '';
    return [{
      type: TokenType.FOOTNOTE_DEF,
      metadata: { id },
      children: parseInline(content, emojiManager)
    }];
  }

  // Check for blockquote
  const blockquoteMatch = line.match(/^((?:>\s*)+)(.*)$/);
  if (blockquoteMatch) {
    const levelStr = blockquoteMatch[1] || '';
    const content = (blockquoteMatch[2] || '').trim();
    const level = (levelStr.match(/>/g) || []).length;
    const blockquoteToken: Token = {
      type: TokenType.BLOCKQUOTE,
      metadata: { level },
      children: parseInline(content, emojiManager)
    };
    return [blockquoteToken];
  }

  // Check for headings with optional ID
  const headingMatch = line.match(/^(#{1,6})\s+(.+?)(?:\s+{#([\w-]+)})?\s*$/);
  if (headingMatch) {
    const level = (headingMatch[1] || '').length;
    const headingType = `h${level}` as TokenType;
    const content = headingMatch[2] || '';
    const token: Token = {
      type: headingType,
      children: parseInline(content, emojiManager)
    };
    if (headingMatch[3]) {
      token.metadata = { id: headingMatch[3] };
    }
    return [token];
  }

  // Check for list items
  const listMatch = line.match(/^(\s*)([-+*]|\d+\.)\s+(.*)$/);
  if (listMatch) {
    const indent = (listMatch[1] || '').length;
    const marker = listMatch[2] || '';
    let content = listMatch[3] || '';
    let isTask = false;
    let checked = false;
    const taskMatch = content.match(/^(\[.\])\s+(.*)$/);
    if (taskMatch) {
      isTask = true;
      checked = taskMatch[1] === '[x]' || taskMatch[1] === '[X]';
      content = taskMatch[2] || '';
    }
    const type = isTask ? TokenType.TASK_LIST_ITEM :
      (/^\d+\.$/.test(marker) ? TokenType.ORDERED_LIST_ITEM : TokenType.UNORDERED_LIST_ITEM);
    const metadata: Record<string, any> = { indent };
    if (type === TokenType.ORDERED_LIST_ITEM) {
      metadata['start'] = parseInt(marker.slice(0, -1), 10);
    }
    if (isTask) {
      metadata['checked'] = checked;
    }
    return [{
      type,
      metadata,
      children: parseInline(content, emojiManager)
    }];
  }

  // Check for table row or separator
  if (line.includes('|')) {
    let cells = line.split('|').map(cell => cell.trim());
    if (cells[0] === '') cells.shift();
    if (cells[cells.length - 1] === '') cells.pop();
    if (cells.length >= 2) {
      const isSeparator = cells.every(cell => /^:?-+:?$/.test(cell));
      if (isSeparator) {
        const alignments = cells.map(cell => {
          if (cell.startsWith(':') && cell.endsWith(':')) return 'center';
          if (cell.startsWith(':')) return 'left';
          if (cell.endsWith(':')) return 'right';
          return 'none';
        });
        return [{
          type: TokenType.TABLE_SEPARATOR,
          metadata: { alignments }
        }];
      } else {
        return [{
          type: TokenType.TABLE_ROW,
          children: cells.map(cell => ({
            type: TokenType.TABLE_CELL,
            children: parseInline(cell, emojiManager)
          }))
        }];
      }
    }
  }

  // Default to inline parsing for paragraphs/text
  tokens = parseInline(line, emojiManager);

  // If only one text token, return it directly
  if (tokens.length === 1 && tokens[0]?.type === TokenType.TEXT) {
    return tokens;
  }

  return tokens;
}

// Backward compatibility: original parse function
export function parse(line: string, emojiManager?: EmojiManager): Token[] {
  return parseBuiltIn(line, emojiManager);
}