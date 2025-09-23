import { parse } from './dist/mmm.js';

console.log('=== CURSOR PARSING ANALYSIS ===\n');

// Test cursor with different token types
const tests = [
  // Basic cursor tests
  { name: 'Basic cursor', input: '@!' },
  { name: 'Cursor with char', input: '@!x' },
  { name: 'Multiple cursors', input: '@!@!@!' },

  // Cursor with inline formatting
  { name: 'Cursor in bold', input: '**bo@!ld**' },
  { name: 'Cursor in italic', input: '*it@!al*' },
  { name: 'Cursor in code', input: '`co@!de`' },
  { name: 'Cursor in strikethrough', input: '~~str@!ike~~' },
  { name: 'Cursor in highlight', input: '==hi@!gh==' },
  { name: 'Cursor in subscript', input: '~sub@!script~' },
  { name: 'Cursor in superscript', input: '^sup@!er^' },

  // Cursor before formatting markers
  { name: 'Cursor before bold', input: '@!**bold**' },
  { name: 'Cursor before italic', input: '@!*italic*' },
  { name: 'Cursor before code', input: '@!`code`' },
  { name: 'Cursor before link', input: '@![link](url)' },
  { name: 'Cursor before image', input: '@!![alt](img.jpg)' },

  // Cursor after formatting markers
  { name: 'Cursor after bold', input: '**bold**@!' },
  { name: 'Cursor after italic', input: '*italic*@!' },

  // Cursor at marker boundaries
  { name: 'Cursor between bold markers', input: '*@!*bold*@!*' },
  { name: 'Cursor breaking bold', input: '**bo@!ld**' },
  { name: 'Cursor at start of marker', input: '@!**text**' },

  // Cursor with links and images
  { name: 'Cursor in link text', input: '[li@!nk](url)' },
  { name: 'Cursor in link URL', input: '[link](ur@!l)' },
  { name: 'Cursor in image alt', input: '![al@!t](img.jpg)' },
  { name: 'Cursor in image URL', input: '![alt](im@!g.jpg)' },

  // Cursor with autolinks
  { name: 'Cursor in autolink', input: '<http://ex@!ample.com>' },

  // Cursor with emoji shortcodes
  { name: 'Cursor in emoji', input: ':sm@!ile:' },
  { name: 'Cursor before emoji', input: '@!:smile:' },

  // Cursor with footnotes
  { name: 'Cursor in footnote ref', input: '[^foo@!tnote]' },
  { name: 'Cursor before footnote', input: '@![^footnote]' },

  // Complex combinations
  { name: 'Cursor in nested formatting', input: '**bold *it@!al* bold**' },
  { name: 'Cursor with multiple formats', input: '**@!bold** *@!italic*' },

  // Edge cases
  { name: 'Cursor at end of text', input: 'text@!' },
  { name: 'Cursor at start of text', input: '@!text' },
  { name: 'Cursor only', input: '@!' },
  { name: 'Escaped cursor', input: '\\@!text' },

  // Block level elements - these should be tested at line level
  { name: 'Line with cursor in heading', input: '# Head@!ing' },
  { name: 'Line with cursor in blockquote', input: '> Quo@!te' },
  { name: 'Line with cursor in list', input: '- It@!em' },
  { name: 'Line with cursor in table', input: '| ce@!ll | cell |' },
];

tests.forEach((test, i) => {
  console.log(`${i + 1}. ${test.name}`);
  console.log(`   Input: "${test.input}"`);

  try {
    const result = parse(test.input);
    console.log(`   Output:`, JSON.stringify(result, null, 4));

    // Check if cursor token exists
    const hasCursor = JSON.stringify(result).includes('"type":"cursor"');
    console.log(`   Has cursor: ${hasCursor}`);

    if (!hasCursor && test.input.includes('@!')) {
      console.log(`   ⚠️  WARNING: Input contains @! but no cursor token found!`);
    }

  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
  }

  console.log('');
});

console.log('=== SUMMARY ===');
console.log('This analysis shows how cursor tokens (@!) interact with other markdown elements.');
console.log('Issues to look for:');
console.log('1. Cursor tokens being consumed by other parsers');
console.log('2. Cursor tokens breaking other formatting');
console.log('3. Cursor tokens not being recognized in certain contexts');
console.log('4. Multiple cursor handling');