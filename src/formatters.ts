import type { Token } from './mmmv2';
import { TokenType } from './mmmv2';

export interface Formatter {
  format(tokens: Token[]): string;
  formatToken(token: Token): string;
}

export class MarkdownFormatter implements Formatter {
  format(tokens: Token[]): string {
    return tokens.map(token => this.formatToken(token)).join('');
  }

  formatToken(token: Token): string {
    switch (token.type) {
      case TokenType.TEXT:
        return this.escapeMarkdown(token.content || '');

      case TokenType.BOLD:
        return `**${this.formatChildren(token)}**`;

      case TokenType.ITALIC:
        return `*${this.formatChildren(token)}*`;

      case TokenType.STRIKETHROUGH:
        return `~~${token.content || ''}~~`;

      case TokenType.HIGHLIGHT:
        return `==${token.content || ''}==`;

      case TokenType.SUBSCRIPT:
        return `~${token.content || ''}~`;

      case TokenType.SUPERSCRIPT:
        return `^${token.content || ''}^`;

      case TokenType.CURSOR:
        return `@!${token.content || ''}`;

      case TokenType.INLINE_CODE:
        return `\`${token.content || ''}\``;

      case TokenType.CODE_FENCE:
        const lang = token.metadata?.['lang'] || '';
        return `\`\`\`${lang}`;

      case TokenType.LINK:
        const href = token.metadata?.['href'] || '';
        const title = token.metadata?.['title'];
        const linkText = this.formatChildren(token);
        return title ? `[${linkText}](${href} "${title}")` : `[${linkText}](${href})`;

      case TokenType.IMAGE:
        const src = token.metadata?.['src'] || '';
        const imageTitle = token.metadata?.['title'];
        const altText = this.formatChildren(token);
        return imageTitle ? `![${altText}](${src} "${imageTitle}")` : `![${altText}](${src})`;

      case TokenType.H1:
        return `# ${this.formatChildren(token)}${this.formatHeadingId(token)}`;

      case TokenType.H2:
        return `## ${this.formatChildren(token)}${this.formatHeadingId(token)}`;

      case TokenType.H3:
        return `### ${this.formatChildren(token)}${this.formatHeadingId(token)}`;

      case TokenType.H4:
        return `#### ${this.formatChildren(token)}${this.formatHeadingId(token)}`;

      case TokenType.H5:
        return `##### ${this.formatChildren(token)}${this.formatHeadingId(token)}`;

      case TokenType.H6:
        return `###### ${this.formatChildren(token)}${this.formatHeadingId(token)}`;

      case TokenType.BLOCKQUOTE:
        const level = token.metadata?.['level'] || 1;
        const prefix = '>'.repeat(level) + ' ';
        return `${prefix}${this.formatChildren(token)}`;

      case TokenType.HORIZONTAL_RULE:
        return '---';

      case TokenType.UNORDERED_LIST_ITEM:
        const indent = ' '.repeat(token.metadata?.['indent'] || 0);
        return `${indent}- ${this.formatChildren(token)}`;

      case TokenType.ORDERED_LIST_ITEM:
        const orderedIndent = ' '.repeat(token.metadata?.['indent'] || 0);
        const start = token.metadata?.['start'] || 1;
        return `${orderedIndent}${start}. ${this.formatChildren(token)}`;

      case TokenType.TASK_LIST_ITEM:
        const taskIndent = ' '.repeat(token.metadata?.['indent'] || 0);
        const checked = token.metadata?.['checked'] ? 'x' : ' ';
        return `${taskIndent}- [${checked}] ${this.formatChildren(token)}`;

      case TokenType.TABLE_ROW:
        const cells = token.children?.map(cell => this.formatToken(cell)).join(' | ') || '';
        return `| ${cells} |`;

      case TokenType.TABLE_CELL:
        return this.formatChildren(token);

      case TokenType.TABLE_SEPARATOR:
        const alignments = token.metadata?.['alignments'] || [];
        const separators = alignments.map((alignment: string) => {
          switch (alignment) {
            case 'center': return ':---:';
            case 'right': return '---:';
            case 'left': return ':---';
            default: return '---';
          }
        });
        return `| ${separators.join(' | ')} |`;

      case TokenType.FOOTNOTE_REF:
        return `[^${token.content || ''}]`;

      case TokenType.FOOTNOTE_DEF:
        const id = token.metadata?.['id'] || '';
        return `[^${id}]: ${this.formatChildren(token)}`;

      case TokenType.EMPTY_LINE:
        return token.content || '';

      default:
        return token.content || this.formatChildren(token) || '';
    }
  }

  private formatChildren(token: Token): string {
    if (!token.children) return '';
    return token.children.map(child => this.formatToken(child)).join('');
  }

  private formatHeadingId(token: Token): string {
    const id = token.metadata?.['id'];
    return id ? ` {#${id}}` : '';
  }

  private escapeMarkdown(text: string): string {
    return text.replace(/([\\`*_{}[\]()#+\-!~^=|])/g, '\\$1');
  }
}

export class HTMLFormatter implements Formatter {
  format(tokens: Token[]): string {
    return tokens.map(token => this.formatToken(token)).join('');
  }

  formatToken(token: Token): string {
    switch (token.type) {
      case TokenType.TEXT:
        return this.escapeHtml(token.content || '');

      case TokenType.BOLD:
        return `<strong>${this.formatChildren(token)}</strong>`;

      case TokenType.ITALIC:
        return `<em>${this.formatChildren(token)}</em>`;

      case TokenType.STRIKETHROUGH:
        return `<del>${this.escapeHtml(token.content || '')}</del>`;

      case TokenType.HIGHLIGHT:
        return `<mark>${this.escapeHtml(token.content || '')}</mark>`;

      case TokenType.SUBSCRIPT:
        return `<sub>${this.escapeHtml(token.content || '')}</sub>`;

      case TokenType.SUPERSCRIPT:
        return `<sup>${this.escapeHtml(token.content || '')}</sup>`;

      case TokenType.CURSOR:
        const cursorContent = this.escapeHtml(token.content || '');
        return `<span class="cursor">${cursorContent}</span>`;

      case TokenType.INLINE_CODE:
        return `<code>${this.escapeHtml(token.content || '')}</code>`;

      case TokenType.CODE_FENCE:
        const lang = token.metadata?.['lang'] || '';
        const langClass = lang ? ` class="language-${this.escapeHtml(lang)}"` : '';
        return `<pre><code${langClass}>${this.escapeHtml(token.content || '')}</code></pre>`;

      case TokenType.LINK:
        const href = this.escapeHtml(token.metadata?.['href'] || '');
        const title = token.metadata?.['title'];
        const titleAttr = title ? ` title="${this.escapeHtml(title)}"` : '';
        return `<a href="${href}"${titleAttr}>${this.formatChildren(token)}</a>`;

      case TokenType.IMAGE:
        const src = this.escapeHtml(token.metadata?.['src'] || '');
        const imageTitle = token.metadata?.['title'];
        const alt = this.formatChildren(token);
        const titleAttribute = imageTitle ? ` title="${this.escapeHtml(imageTitle)}"` : '';
        return `<img src="${src}" alt="${alt}"${titleAttribute}>`;

      case TokenType.H1:
        const h1Id = token.metadata?.['id'] ? ` id="${this.escapeHtml(token.metadata['id'])}"` : '';
        return `<h1${h1Id}>${this.formatChildren(token)}</h1>`;

      case TokenType.H2:
        const h2Id = token.metadata?.['id'] ? ` id="${this.escapeHtml(token.metadata['id'])}"` : '';
        return `<h2${h2Id}>${this.formatChildren(token)}</h2>`;

      case TokenType.H3:
        const h3Id = token.metadata?.['id'] ? ` id="${this.escapeHtml(token.metadata['id'])}"` : '';
        return `<h3${h3Id}>${this.formatChildren(token)}</h3>`;

      case TokenType.H4:
        const h4Id = token.metadata?.['id'] ? ` id="${this.escapeHtml(token.metadata['id'])}"` : '';
        return `<h4${h4Id}>${this.formatChildren(token)}</h4>`;

      case TokenType.H5:
        const h5Id = token.metadata?.['id'] ? ` id="${this.escapeHtml(token.metadata['id'])}"` : '';
        return `<h5${h5Id}>${this.formatChildren(token)}</h5>`;

      case TokenType.H6:
        const h6Id = token.metadata?.['id'] ? ` id="${this.escapeHtml(token.metadata['id'])}"` : '';
        return `<h6${h6Id}>${this.formatChildren(token)}</h6>`;

      case TokenType.BLOCKQUOTE:
        return `<blockquote>${this.formatChildren(token)}</blockquote>`;

      case TokenType.HORIZONTAL_RULE:
        return '<hr>';

      case TokenType.UNORDERED_LIST_ITEM:
        return `<li>${this.formatChildren(token)}</li>`;

      case TokenType.ORDERED_LIST_ITEM:
        return `<li>${this.formatChildren(token)}</li>`;

      case TokenType.TASK_LIST_ITEM:
        const checked = token.metadata?.['checked'] ? ' checked' : '';
        const checkboxId = Math.random().toString(36).substr(2, 9);
        return `<li><input type="checkbox" id="${checkboxId}"${checked} disabled> <label for="${checkboxId}">${this.formatChildren(token)}</label></li>`;

      case TokenType.TABLE_ROW:
        const cells = token.children?.map(cell => this.formatToken(cell)).join('') || '';
        return `<tr>${cells}</tr>`;

      case TokenType.TABLE_CELL:
        return `<td>${this.formatChildren(token)}</td>`;

      case TokenType.TABLE_SEPARATOR:
        return '';

      case TokenType.FOOTNOTE_REF:
        const refId = this.escapeHtml(token.content || '');
        return `<sup><a href="#fn-${refId}" id="fnref-${refId}">${refId}</a></sup>`;

      case TokenType.FOOTNOTE_DEF:
        const defId = this.escapeHtml(token.metadata?.['id'] || '');
        return `<div id="fn-${defId}" class="footnote"><a href="#fnref-${defId}">${defId}</a>: ${this.formatChildren(token)}</div>`;

      case TokenType.EMPTY_LINE:
        return '<br>';

      default:
        return this.escapeHtml(token.content || '') || this.formatChildren(token) || '';
    }
  }

  private formatChildren(token: Token): string {
    if (!token.children) return '';
    return token.children.map(child => this.formatToken(child)).join('');
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}