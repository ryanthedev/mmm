import { describe, it, expect, beforeEach } from 'vitest';
import { 
  TokenParser, 
  EmojiManager, 
  getDefaultEmojiMappings, 
  createEmojiManagerWithNodeEmoji,
  TokenType,
  type EmojiMapping
} from '../src/mmmv2';

describe('EmojiManager', () => {
  let emojiManager: EmojiManager;

  beforeEach(() => {
    emojiManager = new EmojiManager();
  });

  it('should initialize empty', () => {
    expect(emojiManager.getAllMappings()).toEqual({});
  });

  it('should initialize with provided mappings', () => {
    const mappings = { 'smile': '😊', 'heart': '❤️' };
    const manager = new EmojiManager(mappings);
    expect(manager.getAllMappings()).toEqual(mappings);
  });

  it('should add emoji', () => {
    emojiManager.addEmoji('test', '🧪');
    expect(emojiManager.hasEmoji('test')).toBe(true);
    expect(emojiManager.getEmoji('test')).toBe('🧪');
  });

  it('should remove emoji', () => {
    emojiManager.addEmoji('test', '🧪');
    emojiManager.removeEmoji('test');
    expect(emojiManager.hasEmoji('test')).toBe(false);
    expect(emojiManager.getEmoji('test')).toBeUndefined();
  });

  it('should check if emoji exists', () => {
    emojiManager.addEmoji('exists', '✅');
    expect(emojiManager.hasEmoji('exists')).toBe(true);
    expect(emojiManager.hasEmoji('not_exists')).toBe(false);
  });

  it('should set new mappings', () => {
    emojiManager.addEmoji('old', '👴');
    const newMappings = { 'new': '🆕', 'fresh': '🌱' };
    emojiManager.setMappings(newMappings);
    expect(emojiManager.hasEmoji('old')).toBe(false);
    expect(emojiManager.getAllMappings()).toEqual(newMappings);
  });

  it('should clear all mappings', () => {
    emojiManager.addEmoji('test1', '1️⃣');
    emojiManager.addEmoji('test2', '2️⃣');
    emojiManager.clearMappings();
    expect(emojiManager.getAllMappings()).toEqual({});
  });
});

describe('Default emoji mappings', () => {
  it('should provide default emoji mappings', () => {
    const mappings = getDefaultEmojiMappings();
    expect(mappings).toHaveProperty('smile', '😊');
    expect(mappings).toHaveProperty('heart', '❤️');
    expect(mappings).toHaveProperty('pizza', '🍕');
    expect(mappings).toHaveProperty('rocket', '🚀');
  });

  it('should create emoji manager with node-emoji', () => {
    const manager = createEmojiManagerWithNodeEmoji();
    // Should have at least the default emojis (fallback) or node-emoji emojis
    expect(manager.hasEmoji('smile')).toBe(true);
    expect(manager.hasEmoji('heart')).toBe(true);
  });
});

describe('Emoji Parsing', () => {
  let emojiManager: EmojiManager;
  let parser: TokenParser;

  beforeEach(() => {
    emojiManager = new EmojiManager({
      'smile': '😊',
      'heart': '❤️',
      'rocket': '🚀',
      'thumbs_up': '👍'
    });
    
    parser = new TokenParser({
      emojiManager: emojiManager
    });
  });

  it('should convert simple emoji shortcode', () => {
    const tokens = parser.parse('Hello :smile:!');
    expect(tokens).toEqual([
      { type: TokenType.TEXT, content: 'Hello ' },
      { type: TokenType.EMOJI, content: '😊', metadata: { shortcode: 'smile' } },
      { type: TokenType.TEXT, content: '!' }
    ]);
  });

  it('should convert multiple emojis', () => {
    const tokens = parser.parse('I :heart: :rocket: science!');
    expect(tokens).toEqual([
      { type: TokenType.TEXT, content: 'I ' },
      { type: TokenType.EMOJI, content: '❤️', metadata: { shortcode: 'heart' } },
      { type: TokenType.TEXT, content: ' ' },
      { type: TokenType.EMOJI, content: '🚀', metadata: { shortcode: 'rocket' } },
      { type: TokenType.TEXT, content: ' science!' }
    ]);
  });

  it('should handle emoji at start and end', () => {
    const tokens = parser.parse(':rocket: Launch :thumbs_up:');
    expect(tokens).toEqual([
      { type: TokenType.EMOJI, content: '🚀', metadata: { shortcode: 'rocket' } },
      { type: TokenType.TEXT, content: ' Launch ' },
      { type: TokenType.EMOJI, content: '👍', metadata: { shortcode: 'thumbs_up' } }
    ]);
  });

  it('should ignore invalid shortcodes', () => {
    const tokens = parser.parse('Invalid :invalid_emoji: test');
    expect(tokens).toEqual([
      { type: TokenType.TEXT, content: 'Invalid :invalid_emoji: test' }
    ]);
  });

  it('should ignore malformed shortcodes', () => {
    const tokens = parser.parse('No closing :smile and opening heart: colon');
    expect(tokens).toEqual([
      { type: TokenType.TEXT, content: 'No closing :smile and opening heart: colon' }
    ]);
  });

  it('should handle adjacent emojis', () => {
    const tokens = parser.parse(':smile::heart:');
    expect(tokens).toEqual([
      { type: TokenType.EMOJI, content: '😊', metadata: { shortcode: 'smile' } },
      { type: TokenType.EMOJI, content: '❤️', metadata: { shortcode: 'heart' } }
    ]);
  });

  it('should handle empty shortcodes', () => {
    const tokens = parser.parse('Empty :: shortcode');
    expect(tokens).toEqual([
      { type: TokenType.TEXT, content: 'Empty :: shortcode' }
    ]);
  });

  it('should validate shortcode characters', () => {
    // Add emoji with special characters that should be invalid
    emojiManager.addEmoji('valid-emoji_123', '✅');
    
    const tokens = parser.parse(':valid-emoji_123: and :invalid emoji!: test');
    expect(tokens).toEqual([
      { type: TokenType.EMOJI, content: '✅', metadata: { shortcode: 'valid-emoji_123' } },
      { type: TokenType.TEXT, content: ' and :invalid emoji!: test' }
    ]);
  });
});

describe('Emoji integration with other formatting', () => {
  let emojiManager: EmojiManager;
  let parser: TokenParser;

  beforeEach(() => {
    emojiManager = new EmojiManager({
      'smile': '😊',
      'heart': '❤️'
    });
    
    parser = new TokenParser({
      emojiManager: emojiManager
    });
  });

  it('should work with bold text', () => {
    const tokens = parser.parse('**Bold :smile: text**');
    expect(tokens).toEqual([
      { 
        type: TokenType.BOLD, 
        children: [
          { type: TokenType.TEXT, content: 'Bold ' },
          { type: TokenType.EMOJI, content: '😊', metadata: { shortcode: 'smile' } },
          { type: TokenType.TEXT, content: ' text' }
        ]
      }
    ]);
  });

  it('should work with italic text', () => {
    const tokens = parser.parse('*Italic :heart: text*');
    expect(tokens).toEqual([
      { 
        type: TokenType.ITALIC, 
        children: [
          { type: TokenType.TEXT, content: 'Italic ' },
          { type: TokenType.EMOJI, content: '❤️', metadata: { shortcode: 'heart' } },
          { type: TokenType.TEXT, content: ' text' }
        ]
      }
    ]);
  });

  it('should work in headings', () => {
    const tokens = parser.parse('# Heading with :smile:');
    expect(tokens).toEqual([
      { 
        type: TokenType.H1,
        children: [
          { type: TokenType.TEXT, content: 'Heading with ' },
          { type: TokenType.EMOJI, content: '😊', metadata: { shortcode: 'smile' } }
        ]
      }
    ]);
  });
});

describe('Runtime emoji management', () => {
  let emojiManager: EmojiManager;
  let parser: TokenParser;

  beforeEach(() => {
    emojiManager = new EmojiManager({ 'smile': '😊' });
    parser = new TokenParser({ emojiManager: emojiManager });
  });

  it('should reflect runtime changes to emoji mappings', () => {
    // Initially only smile emoji
    let tokens = parser.parse('Test :smile: and :heart:');
    expect(tokens).toEqual([
      { type: TokenType.TEXT, content: 'Test ' },
      { type: TokenType.EMOJI, content: '😊', metadata: { shortcode: 'smile' } },
      { type: TokenType.TEXT, content: ' and :heart:' }
    ]);

    // Add heart emoji at runtime
    emojiManager.addEmoji('heart', '❤️');
    
    tokens = parser.parse('Test :smile: and :heart:');
    expect(tokens).toEqual([
      { type: TokenType.TEXT, content: 'Test ' },
      { type: TokenType.EMOJI, content: '😊', metadata: { shortcode: 'smile' } },
      { type: TokenType.TEXT, content: ' and ' },
      { type: TokenType.EMOJI, content: '❤️', metadata: { shortcode: 'heart' } }
    ]);

    // Remove smile emoji at runtime  
    emojiManager.removeEmoji('smile');
    
    tokens = parser.parse('Test :smile: and :heart:');
    expect(tokens).toEqual([
      { type: TokenType.TEXT, content: 'Test :smile: and ' },
      { type: TokenType.EMOJI, content: '❤️', metadata: { shortcode: 'heart' } }
    ]);
  });
});