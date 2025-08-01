/**
 * QQ思维导图转Markdown转换器
 * 负责将QQ思维导图数据转换为Markdown格式
 */

// 导入依赖 - 修复浏览器环境下的模块加载问题
let RichTextFormatter;
let IndentManager;
let LinePreserver;

// 在浏览器环境中，直接使用全局对象，不尝试require
if (typeof window !== 'undefined') {
    // 浏览器环境：使用全局对象
    RichTextFormatter = window.RichTextFormatter;
    IndentManager = window.IndentManager;
    LinePreserver = window.LinePreserver;
} else if (typeof require !== 'undefined') {
    // Node.js 环境：使用require
    try {
        RichTextFormatter = require('../formatters/richText.js');
        IndentManager = require('../utils/indentManager.js');
        LinePreserver = require('../utils/linePreserver.js');
    } catch (e) {
        console.warn('Node.js环境下模块加载失败:', e.message);
    }
}

class QQToMarkdownConverter {
    constructor() {
        this.PRESENTATION_NODE_TITLE = 'Presentation';
        // 延迟初始化依赖，避免模块未完全加载时出错
        this._initialized = false;
        this._initDependencies();
    }

    /**
     * 初始化依赖
     */
    _initDependencies() {
        try {
            // 尝试从全局对象获取依赖
            if (typeof window !== 'undefined') {
                this.indentManager = new (window.IndentManager || IndentManager)();
                this.linePreserver = new (window.LinePreserver || LinePreserver)();
                this.richTextFormatter = new (window.RichTextFormatter || RichTextFormatter)();
                this._initialized = true;
            } else {
                // Node.js 环境
                this.indentManager = new IndentManager();
                this.linePreserver = new LinePreserver();
                this.richTextFormatter = new RichTextFormatter();
                this._initialized = true;
            }
        } catch (error) {
            console.warn('⚠️ 依赖初始化失败，将在首次使用时重试:', error.message);
            this._initialized = false;
        }
    }

    /**
     * 确保依赖已初始化
     */
    _ensureInitialized() {
        if (!this._initialized) {
            this._initDependencies();
            if (!this._initialized) {
                throw new Error('无法初始化QQToMarkdownConverter依赖');
            }
        }
    }

    /**
     * 转换思维导图节点为Markdown
     * @param {Array} nodes - 思维导图节点数组
     * @param {number} startHeaderLevel - 起始标题层级 (1-6)
     * @returns {string} Markdown文本
     */
    convert(nodes, originalMarkdown = null, startHeaderLevel = 1) {
        this._ensureInitialized(); // 确保依赖已初始化
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
        this._ensureInitialized(); // 确保依赖已初始化
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
        this._ensureInitialized(); // 确保依赖已初始化
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
        this._ensureInitialized(); // 确保依赖已初始化
        const data = node.data || node;
        let markdown = '';

        // 获取代码块标题（语言标识）
        const titleText = this.convertRichTextToMarkdown(data.title).trim();
        
        // 处理语言标识 - 避免重复的代码块标记
        let language = '';
        if (titleText.startsWith('```')) {
            // 如果标题已经是代码块格式，提取语言
            language = titleText.replace(/^```/, '').trim();
        } else {
            // 否则使用标题作为语言
            language = titleText;
        }
        
        // 获取代码内容
        let codeContent = '';
        if (data.notes?.content) {
            codeContent = this.extractCodeFromNotes(data.notes.content);
        }

        // 确保代码内容不包含代码块标记
        codeContent = this.cleanCodeBlockMarkers(codeContent);

        // 生成Markdown代码块 - 避免嵌套
        if (language && language !== '```' && language !== '') {
            markdown += `\n\`\`\`${language}\n${codeContent}\n\`\`\`\n\n`;
        } else {
            markdown += `\n\`\`\`\n${codeContent}\n\`\`\`\n\n`;
        }

        return markdown;
    }

    /**
     * 从注释中提取代码内容
     * @param {string} htmlContent - HTML内容
     * @returns {string} 代码内容
     */
    extractCodeFromNotes(htmlContent) {
        this._ensureInitialized(); // 确保依赖已初始化
        // 修复：使用更简单直接的方法解析HTML内容
        
        // 1. 直接解析HTML内容，提取所有文本
        let codeContent = this.simpleHtmlToText(htmlContent);
        
        // 2. 清理代码块标记，但保留注释
        codeContent = this.cleanCodeBlockMarkers(codeContent);
        
        // 3. 如果内容为空，尝试其他方法
        if (!codeContent.trim()) {
            // 回退到原有的pre/code标签解析
            const preCodeMatch = htmlContent.match(/<pre><code>([\s\S]*?)<\/code><\/pre>/);
            if (preCodeMatch) {
                codeContent = this.decodeHtmlEntities(preCodeMatch[1]);
                codeContent = this.cleanCodeBlockMarkers(codeContent);
                return codeContent;
            }
            
            // 尝试从code标签中提取
            const codeMatch = htmlContent.match(/<code>([\s\S]*?)<\/code>/);
            if (codeMatch) {
                codeContent = this.decodeHtmlEntities(codeMatch[1]);
                codeContent = this.cleanCodeBlockMarkers(codeContent);
                return codeContent;
            }
            
            // 尝试从pre标签中提取
            const preMatch = htmlContent.match(/<pre>([\s\S]*?)<\/pre>/);
            if (preMatch) {
                codeContent = this.decodeHtmlEntities(preMatch[1]);
                codeContent = this.cleanCodeBlockMarkers(codeContent);
                return codeContent;
            }
        }
        
        return codeContent;
    }

    /**
     * 清理代码内容中的代码块标记
     * @param {string} codeContent - 代码内容
     * @returns {string} 清理后的代码内容
     */
    cleanCodeBlockMarkers(codeContent) {
        this._ensureInitialized(); // 确保依赖已初始化
        // 修复：更精确地清理代码块标记
        // 移除开头的代码块标记（包括语言标识）
        codeContent = codeContent.replace(/^```\w*\n?/, '');
        // 移除结尾的代码块标记
        codeContent = codeContent.replace(/\n?```$/, '');
        // 移除中间的代码块标记（如果有多行）
        codeContent = codeContent.replace(/\n```\w*\n/g, '\n');
        codeContent = codeContent.replace(/\n```\n/g, '\n');
        
        // 清理多余的换行符
        codeContent = codeContent.replace(/\n{3,}/g, '\n\n');
        
        return codeContent.trim();
    }

    /**
     * 解码HTML实体
     * @param {string} text - 包含HTML实体的文本
     * @returns {string} 解码后的文本
     */
    decodeHtmlEntities(text) {
        this._ensureInitialized(); // 确保依赖已初始化
        // 修复：改进HTML实体解码
        try {
            // 首先处理QQ思维导图特有的实体
            let decodedText = text
                .replace(/&nbsp;/g, ' ')  // 空格
                .replace(/&lt;/g, '<')    // 小于号
                .replace(/&gt;/g, '>')    // 大于号
                .replace(/&amp;/g, '&')   // 和号
                .replace(/&quot;/g, '"')  // 双引号
                .replace(/&#39;/g, "'");  // 单引号
            
            // 处理十进制HTML实体（包括中文字符）
            decodedText = decodedText.replace(/&#(\d+);/g, (match, dec) => {
                return String.fromCharCode(parseInt(dec, 10));
            });
            
            // 处理十六进制HTML实体
            decodedText = decodedText.replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => {
                return String.fromCharCode(parseInt(hex, 16));
            });
            
            return decodedText;
        } catch (error) {
            // 回退到手动解码常见实体
            return text
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'")
                .replace(/&nbsp;/g, ' ');
        }
    }

    /**
     * 转换分割线节点
     * @param {Object} node - 分割线节点
     * @returns {string} Markdown文本
     */
    convertDivider(node) {
        this._ensureInitialized(); // 确保依赖已初始化
        return '\n\n---\n\n';
    }

    /**
     * 转换富文本为Markdown
     * @param {Object|string} titleObject - 标题对象或字符串
     * @returns {string} Markdown文本
     */
    convertRichTextToMarkdown(titleObject) {
        this._ensureInitialized(); // 确保依赖已初始化
        return this.richTextFormatter.convertQQToMarkdown(titleObject);
    }

    /**
     * 转换注释HTML为纯文本
     * @param {string} html - HTML内容
     * @returns {string} 纯文本内容
     */
    convertNoteHtmlToPlainText(html) {
        this._ensureInitialized(); // 确保依赖已初始化
        try {
            // 在Node.js环境中使用jsdom
            if (typeof window === 'undefined' || !window.DOMParser) {
                // 使用简化的HTML解析
                return this.simpleHtmlToText(html);
            }
            
            const doc = new DOMParser().parseFromString(html, 'text/html');
            doc.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
            return doc.body.textContent || '';
        } catch (error) {
            console.log('DOMParser failed, using fallback:', error.message);
            return this.simpleHtmlToText(html);
        }
    }

    /**
     * 简化的HTML到文本转换
     * @param {string} html - HTML内容
     * @returns {string} 纯文本内容
     */
    simpleHtmlToText(html) {
        this._ensureInitialized(); // 确保依赖已初始化
        if (!html) return '';
        
        let text = html;
        
        // 移除HTML标签，但保留内容
        text = text.replace(/<br\s*\/?>/gi, '\n');
        text = text.replace(/<\/?p[^>]*>/gi, '\n');
        text = text.replace(/<\/?div[^>]*>/gi, '\n');
        text = text.replace(/<\/?span[^>]*>/gi, '');
        text = text.replace(/<\/?code[^>]*>/gi, '');
        text = text.replace(/<\/?pre[^>]*>/gi, '');
        
        // 解码HTML实体
        text = this.decodeHtmlEntities(text);
        
        // 修复：更精确地处理空格和换行符，但保留原始格式
        // 将多个连续的换行符合并为两个换行符
        text = text.replace(/\n{3,}/g, '\n\n');
        
        return text;
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QQToMarkdownConverter;
} else if (typeof window !== 'undefined') {
    window.QQToMarkdownConverter = QQToMarkdownConverter;
} 