/**
 * QQ思维导图转Markdown转换器
 * 负责将QQ思维导图数据转换为Markdown格式
 */

// 导入依赖 - 修复浏览器环境下的模块加载问题
let RichTextFormatter;
let IndentManager;
let LinePreserver;
let CodeBlockHandler;
let HtmlUtils;

// 在浏览器环境中，直接使用全局对象，不尝试require
if (typeof window !== 'undefined') {
    // 浏览器环境：使用全局对象
    RichTextFormatter = window.RichTextFormatter;
    IndentManager = window.IndentManager;
    LinePreserver = window.LinePreserver;
    CodeBlockHandler = window.CodeBlockHandler;
    HtmlUtils = window.HtmlUtils;
} else if (typeof require !== 'undefined') {
    // Node.js 环境：使用require
    try {
        RichTextFormatter = require('../formatters/richText.js');
        IndentManager = require('../utils/indentManager.js');
        LinePreserver = require('../utils/linePreserver.js');
        CodeBlockHandler = require('./shared/codeBlockHandler.js');
        HtmlUtils = require('./shared/htmlUtils.js');
    } catch (e) {
        console.warn('Node.js环境下模块加载失败:', e.message);
    }
}

class QQToMarkdownConverter {
    constructor(qqParser = null, DOMPurify = null) {
        this.PRESENTATION_NODE_TITLE = 'Presentation';
        // 延迟初始化依赖，避免模块未完全加载时出错
        this._initialized = false;
        
        // 注入依赖
        this.qqParser = qqParser;
        this.DOMPurify = DOMPurify;
        
        // 如果没有提供 qqParser，尝试从全局获取
        if (!this.qqParser && typeof window !== 'undefined') {
            this.qqParser = window.QQMindMapParser ? new window.QQMindMapParser() : null;
        }
        
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
                
                // 创建共享模块实例
                this.codeBlockHandler = new (window.CodeBlockHandler || CodeBlockHandler)(
                    this.richTextFormatter, 
                    window.he
                );
                this.htmlUtils = new (window.HtmlUtils || HtmlUtils)();
                
                this._initialized = true;
            } else {
                // Node.js 环境
                this.indentManager = new IndentManager();
                this.linePreserver = new LinePreserver();
                this.richTextFormatter = new RichTextFormatter();
                
                // 创建共享模块实例
                this.codeBlockHandler = new CodeBlockHandler(this.richTextFormatter, require('he'));
                this.htmlUtils = new HtmlUtils();
                
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
                // 从notes中提取alt信息
                let altText = 'image';
                if (data.notes?.content) {
                    // 尝试多种格式匹配alt信息
                    const altPatterns = [
                        /<p>Image Alt:\s*(.*?)<\/p>/i,
                        /<p>Alt:\s*(.*?)<\/p>/i,
                        /<p>图片描述:\s*(.*?)<\/p>/i,
                        /<p>描述:\s*(.*?)<\/p>/i,
                        /alt:\s*(.*?)(?:\n|$)/i,
                        /图片描述:\s*(.*?)(?:\n|$)/i
                    ];
                    
                    for (const pattern of altPatterns) {
                        const match = data.notes.content.match(pattern);
                        if (match && match[1].trim()) {
                            altText = match[1].trim();
                            break;
                        }
                    }
                    
                    // 如果没有找到alt信息，尝试使用notes的纯文本内容作为alt
                    if (altText === 'image' && data.notes.content.trim()) {
                        const plainText = this.convertNoteHtmlToPlainText(data.notes.content).trim();
                        if (plainText && plainText !== 'image') {
                            altText = plainText;
                        }
                    }
                }
                
                // 生成Markdown图片格式
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
                // 从notes中提取alt信息
                let altText = 'image';
                if (data.notes?.content) {
                    // 尝试多种格式匹配alt信息
                    const altPatterns = [
                        /<p>Image Alt:\s*(.*?)<\/p>/i,
                        /<p>Alt:\s*(.*?)<\/p>/i,
                        /<p>图片描述:\s*(.*?)<\/p>/i,
                        /<p>描述:\s*(.*?)<\/p>/i,
                        /alt:\s*(.*?)(?:\n|$)/i,
                        /图片描述:\s*(.*?)(?:\n|$)/i
                    ];
                    
                    for (const pattern of altPatterns) {
                        const match = data.notes.content.match(pattern);
                        if (match && match[1].trim()) {
                            altText = match[1].trim();
                            break;
                        }
                    }
                    
                    // 如果没有找到alt信息，尝试使用notes的纯文本内容作为alt
                    if (altText === 'image' && data.notes.content.trim()) {
                        const plainText = this.convertNoteHtmlToPlainText(data.notes.content).trim();
                        if (plainText && plainText !== 'image') {
                            altText = plainText;
                        }
                    }
                }
                
                // 生成Markdown图片格式
                return `${indentStr}![${altText}](${img.url})\n`;
            }).join('');
        }

        // 处理文本内容
        if (titleText) {
            let prefix = '';
            let finalIndent = '';
            
            if (isListItem) {
                // 检查是否已经包含列表标记
                const listMatch = titleText.match(/^([-*+]|\d+\.)\s+(.+)$/);
                if (listMatch) {
                    // 已经包含列表标记，直接使用
                    prefix = `${listMatch[1]} `;
                    titleText = listMatch[2]; // 移除列表标记，只保留内容
                } else {
                    // 没有列表标记，添加默认的 '- '
                    prefix = '- ';
                }
                
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
     * 转换代码块节点 - 使用 CodeBlockHandler
     * @param {Object} node - 代码块节点
     * @returns {string} Markdown文本
     */
    convertCodeBlock(node) {
        this._ensureInitialized(); // 确保依赖已初始化
        return this.codeBlockHandler.convertCodeBlock(node, this.richTextFormatter);
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
     * 转换注释HTML为纯文本 - 使用 HtmlUtils
     * @param {string} html - HTML内容
     * @returns {string} 纯文本内容
     */
    convertNoteHtmlToPlainText(html) {
        this._ensureInitialized(); // 确保依赖已初始化
        return this.htmlUtils.convertNoteHtmlToPlainText(html, this.qqParser);
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QQToMarkdownConverter;
} else if (typeof window !== 'undefined') {
    window.QQToMarkdownConverter = QQToMarkdownConverter;
} 