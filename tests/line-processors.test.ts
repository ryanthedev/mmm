import { describe, beforeEach, test, expect } from 'vitest'
import { MarkdownParser, LineProcessor, blankLineProcessor } from '../src/mmm';

describe('Line Processors', () => {
  let parser: MarkdownParser;

  beforeEach(() => {
    parser = new MarkdownParser();
  });

  describe('Blank Line Processor', () => {
    beforeEach(() => {
      parser.addLineProcessor(blankLineProcessor);
    });

    test('should handle blank lines between paragraphs', () => {
      const markdown = 'First paragraph\n\nSecond paragraph';
      const result = parser.parse(markdown);
      
      expect(result).toHaveLength(3);
      expect(result[0].type).toBe('p');
      expect(result[0].content).toBe('First paragraph');
      expect(result[1].type).toBe('empty_line');
      expect(result[2].type).toBe('p');
      expect(result[2].content).toBe('Second paragraph');
    });

    test('should handle multiple consecutive blank lines', () => {
      const markdown = 'Paragraph\n\n\n\nAnother paragraph';
      const result = parser.parse(markdown);
      
      expect(result).toHaveLength(5);
      expect(result[0].type).toBe('p');
      expect(result[1].type).toBe('empty_line');
      expect(result[2].type).toBe('empty_line');
      expect(result[3].type).toBe('empty_line');
      expect(result[4].type).toBe('p');
    });

    test('should have correct styling for empty lines', () => {
      const result = parser.parse('Text\n\nMore text');
      const emptyLine = result.find(el => el.type === 'empty_line');
      
      expect(emptyLine).toBeDefined();
      expect(emptyLine!.classes).toContain('my-2');
      expect(emptyLine!.content).toBe('');
    });

    test('should not interfere with code blocks', () => {
      const markdown = '```\ncode line 1\n\ncode line 2\n```';
      const result = parser.parse(markdown);
      
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('code_block');
      expect(result[0].content).toBe('code line 1\n\ncode line 2');
    });
  });

  describe('Custom Line Processors', () => {
    test('should process lines in priority order', () => {
      const highPriorityProcessor: LineProcessor = {
        name: 'high_priority',
        priority: 100,
        canHandle: (lineInfo) => lineInfo.trimmed.includes('HIGH'),
        process: (lineInfo) => ({
          type: 'complete',
          element: {
            type: 'high_priority',
            content: lineInfo.trimmed,
            classes: ['high']
          }
        })
      };

      const lowPriorityProcessor: LineProcessor = {
        name: 'low_priority',
        priority: 10,
        canHandle: (lineInfo) => lineInfo.trimmed.includes('HIGH'),
        process: (lineInfo) => ({
          type: 'complete',
          element: {
            type: 'low_priority',
            content: lineInfo.trimmed,
            classes: ['low']
          }
        })
      };

      parser.addLineProcessor(lowPriorityProcessor);
      parser.addLineProcessor(highPriorityProcessor);

      const result = parser.parse('This has HIGH priority');
      expect(result[0].type).toBe('high_priority');
    });

    test('should handle special markdown extensions', () => {
      const alertProcessor: LineProcessor = {
        name: 'alert',
        priority: 80,
        canHandle: (lineInfo) => /^!!! (info|warning|error)/.test(lineInfo.trimmed),
        process: (lineInfo) => {
          const match = lineInfo.trimmed.match(/^!!! (info|warning|error)\s+(.+)$/);
          if (!match) return { type: 'need_next_token' };
          
          const [, alertType, message] = match;
          return {
            type: 'complete',
            element: {
              type: 'alert',
              content: message,
              attributes: { 'data-alert-type': alertType },
              classes: [`alert-${alertType}`, 'p-4', 'rounded', 'mb-4']
            }
          };
        }
      };

      parser.addLineProcessor(alertProcessor);

      const result = parser.parse('!!! warning This is a warning message');
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        type: 'alert',
        content: 'This is a warning message',
        attributes: { 'data-alert-type': 'warning' },
        classes: ['alert-warning', 'p-4', 'rounded', 'mb-4']
      });
    });

    test('should handle task list items', () => {
      const taskListProcessor: LineProcessor = {
        name: 'task_list',
        priority: 90,
        canHandle: (lineInfo) => /^- \[[ x]\]/.test(lineInfo.trimmed),
        process: (lineInfo) => {
          const match = lineInfo.trimmed.match(/^- \[([x ])\]\s+(.+)$/);
          if (!match) return { type: 'need_next_token' };
          
          const [, checkbox, task] = match;
          const isChecked = checkbox === 'x';
          
          return {
            type: 'complete',
            element: {
              type: 'task_item',
              content: task,
              attributes: { 
                'data-checked': isChecked.toString(),
                'data-task': 'true'
              },
              classes: ['task-item', isChecked ? 'completed' : 'pending']
            }
          };
        }
      };

      parser.addLineProcessor(taskListProcessor);

      const markdown = '- [x] Completed task\n- [ ] Pending task';
      const result = parser.parse(markdown);
      
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        type: 'task_item',
        content: 'Completed task',
        attributes: { 'data-checked': 'true', 'data-task': 'true' },
        classes: ['task-item', 'completed']
      });
      expect(result[1]).toMatchObject({
        type: 'task_item',
        content: 'Pending task',
        attributes: { 'data-checked': 'false', 'data-task': 'true' },
        classes: ['task-item', 'pending']
      });
    });

    test('should handle horizontal rules', () => {
      const hrProcessor: LineProcessor = {
        name: 'horizontal_rule',
        priority: 85,
        canHandle: (lineInfo) => /^---+$|^\*\*\*+$|^___+$/.test(lineInfo.trimmed),
        process: () => ({
          type: 'complete',
          element: {
            type: 'hr',
            content: '',
            classes: ['border-t', 'border-gray-300', 'my-8']
          }
        })
      };

      parser.addLineProcessor(hrProcessor);

      const tests = ['---', '***', '___', '-------'];
      tests.forEach(rule => {
        const result = parser.parse(rule);
        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
          type: 'hr',
          content: '',
          classes: ['border-t', 'border-gray-300', 'my-8']
        });
      });
    });
  });

  describe('Processor State Management', () => {
    test('should have access to parser state', () => {
      const stateAwareProcessor: LineProcessor = {
        name: 'state_aware',
        priority: 70,
        canHandle: (lineInfo, state) => {
          return lineInfo.trimmed === 'STATE_CHECK' && state.blockType === null;
        },
        process: (lineInfo, state) => ({
          type: 'complete',
          element: {
            type: 'state_info',
            content: `Block type: ${state.blockType || 'none'}`,
            classes: ['state-debug']
          }
        })
      };

      parser.addLineProcessor(stateAwareProcessor);

      const result = parser.parse('STATE_CHECK');
      expect(result[0]).toMatchObject({
        type: 'state_info',
        content: 'Block type: none'
      });
    });

    test('should handle complex multi-line processing', () => {
      const multiLineProcessor: LineProcessor = {
        name: 'multi_line',
        priority: 75,
        canHandle: (lineInfo) => lineInfo.trimmed.startsWith('MULTI_START'),
        process: (lineInfo, state, parser) => {
          // Start a custom block type
          state.blockType = 'custom_multi' as any;
          state.buffer = [lineInfo.trimmed.replace('MULTI_START', '').trim()];
          return { type: 'need_more_lines' };
        }
      };

      const endProcessor: LineProcessor = {
        name: 'multi_end',
        priority: 76,
        canHandle: (lineInfo, state) => {
          return lineInfo.trimmed === 'MULTI_END' && state.blockType === 'custom_multi';
        },
        process: (lineInfo, state) => {
          const content = state.buffer.join('\n');
          state.blockType = null;
          state.buffer = [];
          
          return {
            type: 'complete',
            element: {
              type: 'multi_block',
              content: content,
              classes: ['multi-content']
            }
          };
        }
      };

      parser.addLineProcessor(multiLineProcessor);
      parser.addLineProcessor(endProcessor);

      const markdown = 'MULTI_START Content line 1\nContent line 2\nMULTI_END';
      const result = parser.parse(markdown);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        type: 'multi_block',
        content: 'Content line 1\nContent line 2',
        classes: ['multi-content']
      });
    });
  });
});