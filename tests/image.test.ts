import { describe, beforeEach, test, expect } from 'vitest'
import { MarkdownParser, imageProcessor, RenderedElement } from '../src/mmm';
import { createMockParser } from './test-utils';

describe('Image Support', () => {
  let parser: MarkdownParser;

  beforeEach(() => {
    // Note: image processor is now enabled by default
    parser = createMockParser();
  });

  describe('Standalone Images', () => {
    test('should parse simple image', () => {
      const result = parser.parse('![Alt text](https://example.com/image.jpg)');
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        type: 'img',
        content: '',
        attributes: {
          src: 'https://example.com/image.jpg',
          alt: 'Alt text'
        },
        classes: ['max-w-full', 'h-auto', 'my-1', 'test-image']
      });
    });

    test('should parse image with empty alt text', () => {
      const result = parser.parse('![](https://example.com/image.jpg)');
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        type: 'img',
        content: '',
        attributes: {
          src: 'https://example.com/image.jpg',
          alt: ''
        }
      });
    });

    test('should parse image with whitespace around', () => {
      const result = parser.parse('   ![Alt text](https://example.com/image.jpg)   ');
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        type: 'img',
        content: '',
        attributes: {
          src: 'https://example.com/image.jpg',
          alt: 'Alt text'
        }
      });
    });

    test('should parse image with relative path', () => {
      const result = parser.parse('![Logo](./assets/logo.png)');
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        type: 'img',
        content: '',
        attributes: {
          src: './assets/logo.png',
          alt: 'Logo'
        }
      });
    });

    test('should parse image with complex alt text', () => {
      const result = parser.parse('![A beautiful sunset over the mountains](sunset.jpg)');
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        type: 'img',
        content: '',
        attributes: {
          src: 'sunset.jpg',
          alt: 'A beautiful sunset over the mountains'
        }
      });
    });

    test('should handle multiple images', () => {
      const markdown = '![Image 1](img1.jpg)\n\n![Image 2](img2.jpg)';
      const result = parser.parse(markdown);
      expect(result).toHaveLength(3); // Now includes empty_line element
      expect(result[0].attributes?.src).toBe('img1.jpg');
      expect(result[0].attributes?.alt).toBe('Image 1');
      expect(result[1].type).toBe('empty_line');
      expect(result[2].attributes?.src).toBe('img2.jpg');
      expect(result[2].attributes?.alt).toBe('Image 2');
    });
  });

  describe('Inline Images', () => {
    test('should parse image within paragraph', () => {
      const result = parser.parse('Here is an image: ![Alt](image.jpg) in text.');
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('p');
      expect(result[0].content).toContain('<img src="image.jpg" alt="Alt" />');
    });

    test('should parse multiple images in paragraph', () => {
      const result = parser.parse('First ![Image 1](img1.jpg) and second ![Image 2](img2.jpg) images.');
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('p');
      expect(result[0].content).toContain('<img src="img1.jpg" alt="Image 1" />');
      expect(result[0].content).toContain('<img src="img2.jpg" alt="Image 2" />');
    });

    test('should handle images with other inline formatting', () => {
      const result = parser.parse('**Bold** text with ![image](test.jpg) and *italic* text.');
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('p');
      expect(result[0].content).toContain('<strong>Bold</strong>');
      expect(result[0].content).toContain('<img src="test.jpg" alt="image" />');
      expect(result[0].content).toContain('<em>italic</em>');
    });

    test('should handle images with links', () => {
      const result = parser.parse('Check this ![image](img.jpg) and [link](http://example.com).');
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('p');
      expect(result[0].content).toContain('<img src="img.jpg" alt="image" />');
      expect(result[0].content).toContain('<a href="http://example.com">link</a>');
    });
  });

  describe('Images in Lists', () => {
    test('should parse images in unordered list', () => {
      const markdown = '- Item with ![image](img.jpg)\n- Another item';
      const result = parser.parse(markdown);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('ul');
      expect(result[0].children?.[0].content).toContain('<img src="img.jpg" alt="image" />');
    });

    test('should parse images in ordered list', () => {
      const markdown = '1. First item with ![image](img1.jpg)\n2. Second item with ![image](img2.jpg)';
      const result = parser.parse(markdown);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('ol');
      expect(result[0].children?.[0].content).toContain('<img src="img1.jpg" alt="image" />');
      expect(result[0].children?.[1].content).toContain('<img src="img2.jpg" alt="image" />');
    });
  });

  describe('Images in Blockquotes', () => {
    test('should parse images in blockquotes', () => {
      const markdown = '> This quote has an image: ![Quote image](quote.jpg)';
      const result = parser.parse(markdown);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('blockquote');
      expect(result[0].children?.[0].content).toContain('<img src="quote.jpg" alt="Quote image" />');
    });
  });

  describe('Images in Headings', () => {
    test('should parse images in headings', () => {
      const result = parser.parse('# Heading with ![icon](icon.png) image');
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('h1');
      expect(result[0].content).toContain('<img src="icon.png" alt="icon" />');
    });

    test('should parse images in different heading levels', () => {
      const markdown = '## Level 2 ![icon](icon2.png)\n### Level 3 ![icon](icon3.png)';
      const result = parser.parse(markdown);
      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('h2');
      expect(result[0].content).toContain('<img src="icon2.png" alt="icon" />');
      expect(result[1].type).toBe('h3');
      expect(result[1].content).toContain('<img src="icon3.png" alt="icon" />');
    });
  });

  describe('Edge Cases', () => {
    test('should not parse incomplete image syntax', () => {
      const result = parser.parse('![Alt text](incomplete');
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('p');
      expect(result[0].content).not.toContain('<img');
    });

    test('should handle images with special characters in alt text', () => {
      const result = parser.parse('![Alt with "quotes" and \'apostrophes\'](image.jpg)');
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        type: 'img',
        attributes: {
          alt: 'Alt with "quotes" and \'apostrophes\'',
          src: 'image.jpg'
        }
      });
    });

    test('should handle images with special characters in URL', () => {
      const result = parser.parse('![Alt](https://example.com/images/test%20image.jpg?v=1&format=webp)');
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        type: 'img',
        attributes: {
          alt: 'Alt',
          src: 'https://example.com/images/test%20image.jpg?v=1&format=webp'
        }
      });
    });

    test('should handle nested brackets in alt text', () => {
      const result = parser.parse('![Alt [with] brackets](image.jpg)');
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('p');
      // This should fall back to paragraph since nested brackets break the image syntax
    });

    test('should not parse images inside code blocks', () => {
      const markdown = '```\n![Not an image](test.jpg)\n```';
      const result = parser.parse(markdown);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('code_block');
      expect(result[0].content).toContain('![Not an image](test.jpg)');
    });

    test('should not parse images inside inline code', () => {
      const result = parser.parse('Here is code: `![Not an image](test.jpg)` in text.');
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('p');
      expect(result[0].content).toContain('<code>![Not an image](test.jpg)</code>');
    });
  });

  describe('Theme Integration', () => {
    test('should apply default theme classes to standalone images', () => {
      const result = parser.parse('![Test](test.jpg)');
      expect(result[0].classes).toEqual(['max-w-full', 'h-auto', 'my-1', 'test-image']);
    });

    test('should support custom image theme', () => {
      const customParser = createMockParser({
        theme: {
          image: {
            classes: ['test-image', 'custom-image', 'rounded'],
            attributes: { loading: 'lazy' }
          }
        }
      });
      
      const result = customParser.parse('![Test](test.jpg)');
      expect(result[0].classes).toEqual(['max-w-full', 'h-auto', 'my-1', 'test-image', 'custom-image', 'rounded']);
      expect(result[0].attributes?.loading).toBe('lazy');
    });
  });
});