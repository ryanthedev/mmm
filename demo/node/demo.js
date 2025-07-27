#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Import the built MMM library
import { MarkdownParser, blankLineProcessor } from '../../dist/mmm.js';

// Colors for console output
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    dim: '\x1b[2m'
};

function colorize(text, color) {
    return `${colors[color]}${text}${colors.reset}`;
}

function printHeader(title) {
    console.log('\n' + colorize('='.repeat(60), 'cyan'));
    console.log(colorize(`  ${title}`, 'bold'));
    console.log(colorize('='.repeat(60), 'cyan'));
}

function printSubHeader(title) {
    console.log('\n' + colorize(`--- ${title} ---`, 'yellow'));
}

function printMarkdown(content) {
    console.log(colorize('Markdown Input:', 'blue'));
    console.log(colorize(content, 'dim'));
}

function printResult(result) {
    console.log(colorize('\nParsed Result:', 'green'));
    console.log(JSON.stringify(result, null, 2));
}

function printHTML(html) {
    console.log(colorize('\nHTML Output:', 'magenta'));
    console.log(html);
}

// Convert parsed elements to HTML
function renderToHTML(elements) {
    return elements.map(element => {
        const tag = element.type === 'code_block' ? 'pre' : element.type;
        const classes = element.classes ? ` class="${element.classes.join(' ')}"` : '';
        const attrs = element.attributes ? 
            Object.entries(element.attributes)
                .map(([key, value]) => ` ${key}="${value}"`)
                .join('') : '';
        
        if (element.children) {
            const childrenHTML = renderToHTML(element.children);
            return `<${tag}${classes}${attrs}>${childrenHTML}</${tag}>`;
        } else {
            const content = element.content || '';
            if (element.type === 'code_block') {
                return `<${tag}${classes}${attrs}><code>${escapeHtml(content)}</code></${tag}>`;
            }
            return `<${tag}${classes}${attrs}>${content}</${tag}>`;
        }
    }).join('\n');
}

function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function runDemo(title, markdown, parser = new MarkdownParser()) {
    printSubHeader(title);
    printMarkdown(markdown);
    
    const result = parser.parse(markdown);
    printResult(result);
    
    const html = renderToHTML(result);
    printHTML(html);
}

function main() {
    printHeader('MMM Parser Node.js Demo');
    
    console.log(colorize('This demo showcases the MMM parser capabilities in a Node.js environment.', 'white'));
    
    // Basic examples
    runDemo('Simple Paragraph', 'This is a simple paragraph with **bold** and *italic* text.');
    
    runDemo('Heading', '# Main Title\n\nThis is content under the heading.');
    
    runDemo('Code Block', '```javascript\nfunction hello() {\n    console.log("Hello, World!");\n}\n```');
    
    runDemo('List', '1. First item\n2. Second item\n   - Nested item\n   - Another nested\n3. Third item');
    
    runDemo('Blockquote', '> This is a blockquote\n> with multiple lines\n>\n> And a paragraph break');
    
    runDemo('Table', '| Name | Age | City |\n|------|-----|------|\n| John | 30  | NYC  |\n| Jane | 25  | LA   |');
    
    runDemo('Table with Alignment', '| Left | Center | Right |\n|:-----|:------:|------:|\n| L1   | C1     | R1    |\n| L2   | C2     | R2    |');
    
    // Performance demo
    printSubHeader('Performance Demo');
    
    const largeMarkdown = `# Performance Test\n\n` + 
        'This is a paragraph. '.repeat(50) + '\n\n' +
        '- ' + 'List item. '.repeat(10) + '\n'.repeat(25) +
        '```\n' + 'Code line\n'.repeat(50) + '```\n\n' +
        '| Col1 | Col2 | Col3 |\n|------|------|------|\n' +
        ('| Data | More | Info |\n').repeat(25);
    
    console.log(colorize(`Processing ${largeMarkdown.length} character document...`, 'blue'));
    
    const startTime = process.hrtime.bigint();
    const perfParser = new MarkdownParser();
    const perfResult = perfParser.parse(largeMarkdown);
    const endTime = process.hrtime.bigint();
    
    const durationMs = Number(endTime - startTime) / 1000000;
    
    console.log(colorize(`✅ Processed in ${durationMs.toFixed(2)}ms`, 'green'));
    console.log(colorize(`✅ Generated ${perfResult.length} elements`, 'green'));
    console.log(colorize(`✅ Average: ${(durationMs / perfResult.length).toFixed(2)}ms per element`, 'green'));

    printHeader('Demo Complete');
    console.log(colorize('All examples have been processed successfully!', 'green'));
    console.log(colorize('Check the output above to see how MMM parses different markdown constructs.', 'white'));
}

// Run the demo
main();