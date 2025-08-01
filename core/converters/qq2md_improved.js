/**
 * 改进的QQ转Markdown转换器
 * 使用专业库处理HTML解析和转换
 */

// 导入依赖
let TurndownService;
let DOMPurify;
let showdown;

if (typeof require !== 'undefined') {
    try {
        TurndownService = require('turndown');
        DOMPurify = require('dompurify');
        showdown = require('showdown');
    } catch (e) {
        // 如果无法导入，使用全局对象
        TurndownService = window.TurndownService;
        DOMPurify = window.DOMPurify;
        showdown = window.showdown;
    }
}

class ImprovedQQToMarkdownConverter {
    constructor() {
        this.initializeLibraries();
    }

    /**
     * 初始化库
     */
    initializeLibraries() {
        // 初始化Turndown (HTML to Markdown)
        if (TurndownService) {
            this.turndownService = new TurndownService({
                headingStyle: 'atx',
                codeBlockStyle: 'fenced',
                emDelimiter: '*'
            });
            
            // 自定义代码块处理
            this.turndownService.addRule('codeBlocks', {
                filter: function (node) {
                    return node.nodeName === 'PRE' && node.firstChild && node.firstChild.nodeName === 'CODE';
                },
                replacement: function (content, node) {
                    const code = node.firstChild.textContent;
                    const language = node.firstChild.className || '';
                    return `\`\`\`${language}\n${code}\n\`\`\``;
                }
            });
        }

        // 初始化Showdown (Markdown to HTML)
        if (showdown) {
            this.showdown = new showdown.Converter({
                tables: true,
                strikethrough: true,
                tasklists: true
            });
        }
    }

    /**
     * 转换QQ思维导图数据为Markdown
     */
    convert(qqNodes) {
        if (!qqNodes || qqNodes.length === 0) {
            return '';
        }

        let markdown = '';
        
        for (const node of qqNodes) {
            const data = node.data || node;
            markdown += this.convertNode(data);
        }

        return markdown;
    }

    /**
     * 转换单个节点
     */
    convertNode(node) {
        let markdown = '';

        // 处理标题
        if (node.title) {
            markdown += this.convertTitle(node.title);
        }

        // 处理代码块
        if (this.isCodeBlock(node)) {
            markdown += this.convertCodeBlock(node);
        } else {
            // 处理普通文本
            if (node.notes?.content) {
                markdown += this.convertNotes(node.notes.content);
            }
        }

        // 处理子节点
        if (node.children?.attached) {
            for (const child of node.children.attached) {
                markdown += this.convertNode(child);
            }
        }

        return markdown;
    }

    /**
     * 判断是否为代码块
     */
    isCodeBlock(node) {
        return node.labels?.some(label => label.text === 'code-block');
    }

    /**
     * 转换代码块
     */
    convertCodeBlock(node) {
        if (!node.notes?.content) {
            return '';
        }

        // 使用Turndown处理HTML
        if (this.turndownService) {
            try {
                // 清理HTML
                const cleanHtml = this.cleanHtml(node.notes.content);
                // 转换为Markdown
                const markdown = this.turndownService.turndown(cleanHtml);
                return this.extractCodeFromMarkdown(markdown);
            } catch (error) {
                console.warn('Turndown转换失败，使用备用方法:', error);
                return this.fallbackCodeBlockConversion(node.notes.content);
            }
        } else {
            return this.fallbackCodeBlockConversion(node.notes.content);
        }
    }

    /**
     * 清理HTML内容
     */
    cleanHtml(html) {
        if (DOMPurify) {
            return DOMPurify.sanitize(html, {
                ALLOWED_TAGS: ['p', 'br', 'code', 'pre', 'span', 'div'],
                ALLOWED_ATTR: ['class']
            });
        }
        return html;
    }

    /**
     * 从Markdown中提取代码块
     */
    extractCodeFromMarkdown(markdown) {
        const codeBlockMatch = markdown.match(/```\w*\n([\s\S]*?)\n```/);
        if (codeBlockMatch) {
            return codeBlockMatch[0];
        }
        return markdown;
    }

    /**
     * 备用代码块转换方法
     */
    fallbackCodeBlockConversion(htmlContent) {
        // 简化的HTML解析
        let content = htmlContent
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<\/?p[^>]*>/gi, '\n')
            .replace(/<\/?div[^>]*>/gi, '\n')
            .replace(/<\/?span[^>]*>/gi, '')
            .replace(/<\/?code[^>]*>/gi, '')
            .replace(/<\/?pre[^>]*>/gi, '');

        // 解码HTML实体
        content = this.decodeHtmlEntities(content);
        
        // 清理代码块标记
        content = this.cleanCodeBlockMarkers(content);
        
        return `\`\`\`cpp\n${content}\n\`\`\``;
    }

    /**
     * 转换标题
     */
    convertTitle(title) {
        if (typeof title === 'string') {
            return `# ${title}\n\n`;
        }
        return '';
    }

    /**
     * 转换注释
     */
    convertNotes(htmlContent) {
        if (this.turndownService) {
            try {
                const cleanHtml = this.cleanHtml(htmlContent);
                return this.turndownService.turndown(cleanHtml);
            } catch (error) {
                console.warn('注释转换失败:', error);
                return this.fallbackNotesConversion(htmlContent);
            }
        } else {
            return this.fallbackNotesConversion(htmlContent);
        }
    }

    /**
     * 备用注释转换方法
     */
    fallbackNotesConversion(htmlContent) {
        return this.decodeHtmlEntities(htmlContent.replace(/<[^>]*>/g, ''));
    }

    /**
     * 解码HTML实体
     */
    decodeHtmlEntities(text) {
        if (!text) return '';
        
        // 使用DOMPurify解码
        if (DOMPurify) {
            try {
                const div = document.createElement('div');
                div.innerHTML = text;
                return div.textContent || div.innerText || '';
            } catch (error) {
                console.warn('DOMPurify解码失败，使用备用方法:', error);
            }
        }

        // 备用解码方法
        return text
            .replace(/&nbsp;/g, ' ')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(parseInt(dec, 10)))
            .replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)));
    }

    /**
     * 清理代码块标记
     */
    cleanCodeBlockMarkers(content) {
        return content
            .replace(/^```\w*\n/, '')
            .replace(/\n```$/, '')
            .trim();
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImprovedQQToMarkdownConverter;
} else if (typeof window !== 'undefined') {
    window.ImprovedQQToMarkdownConverter = ImprovedQQToMarkdownConverter;
} 