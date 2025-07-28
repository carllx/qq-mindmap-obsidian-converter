/**
 * QQ转Markdown转换器
 * 负责将QQ思维导图数据转换为Markdown格式
 */
class QQToMarkdownConverter {
    constructor() {
        this.PRESENTATION_NODE_TITLE = 'Presentation';
        this.indentManager = new IndentManager();
        this.linePreserver = new LinePreserver();
    }

    /**
     * 转换思维导图节点为Markdown
     * @param {Array} nodes - 思维导图节点数组
     * @returns {string} Markdown文本
     */
    convert(nodes, originalMarkdown = null) {
        let markdown = '';
        
        for (const node of nodes) {
            const data = node.data || node;
            const isHeader = data.labels?.some(l => l.text === 'header');
            
            if (isHeader) {
                markdown += this.convertNodeAsHeader(node, 0);
            } else {
                markdown += this.convertNode(node, 0, true);
            }
        }
        
        // 如果有原始Markdown，使用LinePreserver保持格式
        if (originalMarkdown) {
            return this.linePreserver.preserveFormat(originalMarkdown, markdown);
        }
        
        return markdown.replace(/\n{3,}/g, '\n\n').trim();
    }

    /**
     * 转换标题节点
     * @param {Object} node - 节点对象
     * @param {number} depth - 当前深度
     * @returns {string} Markdown文本
     */
    convertNodeAsHeader(node, depth) {
        const data = node.data || node;
        let markdown = '';

        // 处理演示文稿节点
        if (data.title === this.PRESENTATION_NODE_TITLE && data.notes?.content) {
            return `\n\n<!--\n${this.convertNoteHtmlToPlainText(data.notes.content)}\n-->\n\n`;
        }

        // 处理分割线
        if (data.title === '---') {
            return '\n\n---\n\n';
        }

        // 处理图片
        if (data.images) {
            markdown += data.images.map(img => `![image](${img.url})\n`).join('');
        }

        // 处理标题文本
        let titleText = this.convertRichTextToMarkdown(data.title).trim();
        if (titleText) {
            markdown += `${'#'.repeat(depth + 1)} ${titleText}\n`;
        }

        // 处理子节点
        if (data.children?.attached) {
            for (const child of data.children.attached) {
                const childData = child.data || child;
                const isChildHeader = childData.labels?.some(l => l.text === 'header');
                
                if (isChildHeader) {
                    markdown += this.convertNodeAsHeader(child, depth + 1);
                } else {
                    markdown += this.convertNode(child, 0, false);
                }
            }
        }

        return markdown;
    }

    /**
     * 转换普通节点
     * @param {Object} node - 节点对象
     * @param {number} indent - 缩进级别
     * @param {boolean} isListItem - 是否为列表项
     * @returns {string} Markdown文本
     */
    convertNode(node, indent, isListItem) {
        const data = node.data || node;
        let markdown = '';

        // 处理演示文稿节点
        if (data.title === this.PRESENTATION_NODE_TITLE && data.notes?.content) {
            return `\n\n<!--\n${this.convertNoteHtmlToPlainText(data.notes.content)}\n-->\n\n`;
        }

        // 处理分割线
        if (data.title === '---') {
            return '\n\n---\n\n';
        }

        let titleText = this.convertRichTextToMarkdown(data.title).trim();
        // 使用标准化的缩进管理器
        const indentStr = this.indentManager.createIndentString(indent);

        // 处理图片
        if (data.images) {
            markdown += data.images.map(img => `${indentStr}![image](${img.url})\n`).join('');
        }

        // 处理文本内容
        if (titleText) {
            let prefix = '';
            let finalIndent = '';
            
            if (isListItem) {
                prefix = /^\s*([-*+]|\d+\.)\s+/.test(titleText) ? '' : '- ';
                // 使用原始缩进信息来决定是否添加缩进
                const originalIndent = data.originalIndent || 0;
                if (originalIndent > 0) {
                    finalIndent = this.indentManager.createIndentString(originalIndent);
                }
            } else {
                finalIndent = indentStr;
            }
            markdown += `${finalIndent}${prefix}${titleText}\n`;
        }

        // 处理子节点
        if (data.children?.attached) {
            for (const child of data.children.attached) {
                const isChildHeader = (child.data || child).labels?.some(l => l.text === 'header');
                
                if (isChildHeader) {
                    markdown += this.convertNodeAsHeader(child, 0);
                } else {
                    markdown += this.convertNode(child, indent + 1, true);
                }
            }
        }

        return markdown;
    }

    /**
     * 转换富文本为Markdown
     * @param {Object|string} titleObject - 标题对象或字符串
     * @returns {string} Markdown文本
     */
    convertRichTextToMarkdown(titleObject) {
        if (typeof titleObject === 'string') {
            return titleObject;
        }
        
        if (!titleObject?.children) {
            return '';
        }

        return titleObject.children.flatMap(p => 
            p.children?.map(textNode => {
                let content = textNode.text || '';
                
                // 应用样式
                if (textNode.backgroundColor === '#FFF3A1') {
                    content = `==${content}==`;
                }
                if (textNode.strike) {
                    content = `~~${content}~~`;
                }
                if (textNode.fontStyle === 'italic') {
                    content = `*${content}*`;
                }
                if (textNode.fontWeight === 'bold') {
                    content = `**${content}**`;
                }
                if (textNode.underline) {
                    content = `[[${content}]]`;
                }
                
                return content;
            }) || []
        ).join('');
    }

    /**
     * 转换注释HTML为纯文本
     * @param {string} html - HTML内容
     * @returns {string} 纯文本内容
     */
    convertNoteHtmlToPlainText(html) {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        doc.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
        return doc.body.textContent || '';
    }
}

// 导出模块
if (typeof window !== 'undefined') {
    window.QQToMarkdownConverter = QQToMarkdownConverter;
} 