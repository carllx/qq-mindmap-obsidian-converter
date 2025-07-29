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
     * @param {number} startHeaderLevel - 起始标题层级 (1-6)
     * @returns {string} Markdown文本
     */
    convert(nodes, originalMarkdown = null, startHeaderLevel = 1) {
        let markdown = '';
        
        for (const node of nodes) {
            const data = node.data || node;
            const isHeader = data.labels?.some(l => l.text === 'header');
            const isCodeBlock = data.labels?.some(l => l.text === 'code-block');
            const isDivider = data.labels?.some(l => l.text === 'divider') || data.title === '---';
            
            if (isHeader) {
                markdown += this.convertNodeAsHeader(node, startHeaderLevel - 1);
            } else if (isCodeBlock) {
                markdown += this.convertCodeBlock(node);
            } else if (isDivider) {
                markdown += this.convertDivider(node);
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
     * @param {number} baseDepth - 基础深度
     * @returns {string} Markdown文本
     */
    convertNodeAsHeader(node, baseDepth) {
        const data = node.data || node;
        let markdown = '';

        // 处理演示文稿节点
        if (data.title === this.PRESENTATION_NODE_TITLE && data.notes?.content) {
            return `\n\n<!--\n${this.convertNoteHtmlToPlainText(data.notes.content)}\n-->\n\n`;
        }

        // 处理图片
        if (data.images) {
            markdown += data.images.map(img => {
                // 尝试从notes中恢复alt信息
                let altText = 'image';
                if (data.notes?.content) {
                    const altMatch = data.notes.content.match(/<p>Image Alt: (.*?)<\/p>/);
                    if (altMatch) {
                        altText = altMatch[1];
                    }
                }
                return `![${altText}](${img.url})\n`;
            }).join('');
        }

        // 处理标题文本
        let titleText = this.convertRichTextToMarkdown(data.title).trim();
        if (titleText) {
            const headerLevel = Math.min(baseDepth + 1, 6); // 限制最大为H6
            markdown += `${'#'.repeat(headerLevel)} ${titleText}\n`;
        }

        // 处理子节点
        if (data.children?.attached) {
            for (const child of data.children.attached) {
                const childData = child.data || child;
                const isChildHeader = childData.labels?.some(l => l.text === 'header');
                const isChildCodeBlock = childData.labels?.some(l => l.text === 'code-block');
                const isChildDivider = childData.labels?.some(l => l.text === 'divider') || childData.title === '---';
                
                if (isChildHeader) {
                    markdown += this.convertNodeAsHeader(child, baseDepth + 1);
                } else if (isChildCodeBlock) {
                    markdown += this.convertCodeBlock(child);
                } else if (isChildDivider) {
                    markdown += this.convertDivider(child);
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

        let titleText = this.convertRichTextToMarkdown(data.title).trim();
        // 使用标准化的缩进管理器
        const indentStr = this.indentManager.createIndentString(indent);

        // 处理图片
        if (data.images) {
            markdown += data.images.map(img => {
                // 尝试从notes中恢复alt信息
                let altText = 'image';
                if (data.notes?.content) {
                    const altMatch = data.notes.content.match(/<p>Image Alt: (.*?)<\/p>/);
                    if (altMatch) {
                        altText = altMatch[1];
                    }
                }
                return `${indentStr}![${altText}](${img.url})\n`;
            }).join('');
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
                const isChildCodeBlock = (child.data || child).labels?.some(l => l.text === 'code-block');
                const isChildDivider = (child.data || child).labels?.some(l => l.text === 'divider') || (child.data || child).title === '---';
                
                if (isChildHeader) {
                    markdown += this.convertNodeAsHeader(child, 0);
                } else if (isChildCodeBlock) {
                    markdown += this.convertCodeBlock(child);
                } else if (isChildDivider) {
                    markdown += this.convertDivider(child);
                } else {
                    markdown += this.convertNode(child, indent + 1, true);
                }
            }
        }

        return markdown;
    }

    /**
     * 转换代码块节点
     * @param {Object} node - 代码块节点
     * @returns {string} Markdown文本
     */
    convertCodeBlock(node) {
        const data = node.data || node;
        let markdown = '';

        // 获取代码块标题（语言标识）
        const titleText = this.convertRichTextToMarkdown(data.title).trim();
        const language = titleText.replace(/^```/, '').trim();
        
        // 获取代码内容
        let codeContent = '';
        if (data.notes?.content) {
            // 从HTML注释中提取代码内容
            const htmlContent = data.notes.content;
            const codeMatch = htmlContent.match(/<pre><code>([\s\S]*?)<\/code><\/pre>/);
            if (codeMatch) {
                codeContent = codeMatch[1];
            } else {
                // 如果没有找到pre/code标签，直接使用HTML内容
                codeContent = this.convertNoteHtmlToPlainText(htmlContent);
            }
        }

        // 生成Markdown代码块
        if (language) {
            markdown += `\n\`\`\`${language}\n${codeContent}\n\`\`\`\n\n`;
        } else {
            markdown += `\n\`\`\`\n${codeContent}\n\`\`\`\n\n`;
        }

        return markdown;
    }

    /**
     * 转换分割线节点
     * @param {Object} node - 分割线节点
     * @returns {string} Markdown文本
     */
    convertDivider(node) {
        return '\n\n---\n\n';
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