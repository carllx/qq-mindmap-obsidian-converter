/**
 * Markdown转QQ转换器
 * 负责将Markdown格式转换为QQ思维导图数据
 */

// 导入依赖 - 修复浏览器环境下的模块加载问题
let RichTextFormatter;
let IndentManager;
let CodeBlockHandler;
let NodeManager;

// 在浏览器环境中，直接使用全局对象，不尝试require
if (typeof window !== 'undefined') {
    // 浏览器环境：使用全局对象
    RichTextFormatter = window.RichTextFormatter;
    IndentManager = window.IndentManager;
    CodeBlockHandler = window.CodeBlockHandler;
    NodeManager = window.NodeManager;
} else if (typeof require !== 'undefined') {
    // Node.js 环境：使用require
    try {
        RichTextFormatter = require('../formatters/richText.js');
        IndentManager = require('../utils/indentManager.js');
        CodeBlockHandler = require('./shared/codeBlockHandler.js');
        NodeManager = require('./shared/nodeManager.js');
    } catch (e) {
        console.warn('Node.js环境下模块加载失败:', e.message);
    }
}

class MarkdownToQQConverter {
    /**
     * @param {object} markdownIt - markdown-it 实例
     * @param {object} he - he 库实例
     */
    constructor(markdownIt, he) {
        if (!he || typeof he.encode !== 'function') {
            throw new Error("MarkdownToQQConverter requires the 'he' library, but it was not provided or is invalid.");
        }
        this.md = markdownIt;
        this.he = he;
        this.PRESENTATION_NODE_TITLE = 'Presentation';
        this.HEADER_LABEL = { 
            id: 'qq-mind-map-header-label', 
            text: 'header', 
            backgroundColor: '#ADCBFF', 
            color: '#000000e1' 
        };
        this.CODE_BLOCK_LABEL = {
            id: 'qq-mind-map-code-block-label',
            text: 'code-block',
            backgroundColor: 'rgb(172, 226, 197)',
            color: '#000000'
        };
        this.DIVIDER_LABEL = {
            id: 'qq-mind-map-divider-label',
            text: 'divider',
            backgroundColor: '#E0E0E0',
            color: '#666666'
        };
        
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
            if (typeof window !== 'undefined' && typeof global === 'undefined') {
                // 真正的浏览器环境
                // 检查依赖是否可用
                if (typeof window.RichTextFormatter === 'undefined' || typeof window.IndentManager === 'undefined') {
                    console.warn('⚠️ 浏览器环境中依赖模块未加载，等待重试...');
                    this._initialized = false;
                    return;
                }
                
                this.richTextFormatter = new window.RichTextFormatter();
                this.indentManager = new window.IndentManager();
                
                // 初始化代码块处理器
                if (typeof window.CodeBlockHandler !== 'undefined') {
                    this.codeBlockHandler = new window.CodeBlockHandler(this.richTextFormatter, this.he);
                } else {
                    throw new Error('CodeBlockHandler 未加载，无法初始化 MarkdownToQQConverter');
                }
                
                // 初始化节点管理器
                if (typeof window.NodeManager !== 'undefined') {
                    this.nodeManager = new window.NodeManager();
                } else {
                    throw new Error('NodeManager 未加载，无法初始化 MarkdownToQQConverter');
                }
                
                this._initialized = true;
                console.log('✅ 浏览器环境依赖初始化成功');
            } else {
                // Node.js 环境 - 直接 require 模块
                const RichTextFormatter = require('../formatters/richText.js');
                const IndentManager = require('../utils/indentManager.js');
                this.richTextFormatter = new RichTextFormatter();
                this.indentManager = new IndentManager();
                
                // 初始化代码块处理器
                try {
                    const CodeBlockHandler = require('./shared/codeBlockHandler.js');
                    this.codeBlockHandler = new CodeBlockHandler(this.richTextFormatter, this.he);
                } catch (e) {
                    throw new Error(`CodeBlockHandler 加载失败: ${e.message}`);
                }
                
                // 初始化节点管理器
                try {
                    const NodeManager = require('./shared/nodeManager.js');
                    this.nodeManager = new NodeManager();
                } catch (e) {
                    throw new Error(`NodeManager 加载失败: ${e.message}`);
                }
                
                this._initialized = true;
                console.log('✅ Node.js 环境依赖初始化成功');
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
                // 在浏览器环境中，如果依赖未加载，等待一段时间后重试
                if (typeof window !== 'undefined' && typeof global === 'undefined') {
                    console.log('🔄 等待依赖模块加载，将在 100ms 后重试...');
                    setTimeout(() => {
                        this._initDependencies();
                        if (!this._initialized) {
                            console.log('🔄 再次等待依赖模块加载，将在 200ms 后重试...');
                            setTimeout(() => {
                                this._initDependencies();
                                if (!this._initialized) {
                                    throw new Error('无法初始化MarkdownToQQConverter依赖，请检查模块是否正确加载');
                                }
                            }, 200);
                        }
                    }, 100);
                } else {
                    throw new Error('无法初始化MarkdownToQQConverter依赖');
                }
            }
        }
    }

    /**
     * 转换Markdown为思维导图数据
     * @param {string} markdown - Markdown文本
     * @returns {Array} 思维导图节点数组
     */
    convert(markdown) {
        this._ensureInitialized(); // 确保依赖已初始化
        const lines = markdown.replace(/\r/g, '').split('\n');
        const forest = [];
        const stack = []; // { node, indentLevel, isText, headerLevel }
        let inCommentBlock = false;
        let commentContent = [];
        let inCodeBlock = false;
        let codeBlockContent = [];
        let codeBlockLanguage = '';

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // 处理代码块
            if (inCodeBlock) {
                if (line.trim() === '```') {
                    // 代码块结束
                    inCodeBlock = false;
                    
                    // 修复：代码块应该添加到最近的标题节点，而不是栈顶节点
                    let parentNode = null;
                    
                    // 从栈顶开始查找最近的标题节点
                    for (let i = stack.length - 1; i >= 0; i--) {
                        const stackItem = stack[i];
                        if (stackItem.headerLevel > 0) {
                            parentNode = stackItem.node;
                            break;
                        }
                    }
                    
                    // 如果没有找到标题节点，使用栈顶节点
                    if (!parentNode && stack.length > 0) {
                        parentNode = stack[stack.length - 1].node;
                    }
                    
                    if (parentNode) {
                        const codeNode = this.createCodeBlockNode(codeBlockContent, codeBlockLanguage);
                        parentNode.children.attached.push(codeNode);
                    } else {
                        // 如果没有父节点，作为顶级节点
                        forest.push({ type: 5, data: this.createCodeBlockNode(codeBlockContent, codeBlockLanguage) });
                    }
                    
                    codeBlockContent = [];
                    codeBlockLanguage = '';
                    continue;
                } else {
                    // 继续收集代码块内容
                    codeBlockContent.push(line);
                    continue;
                }
            }
            
            // 检查代码块开始
            const codeBlockMatch = line.match(/^```(\w+)?$/);
            if (codeBlockMatch) {
                inCodeBlock = true;
                codeBlockLanguage = codeBlockMatch[1] || '';
                continue;
            }
            
            // 处理注释块
            if (line.trim() === '<!--') {
                inCommentBlock = true;
                commentContent = [];
                continue;
            }
            
            if (inCommentBlock) {
                if (line.trim() === '-->') {
                    inCommentBlock = false;
                    // 创建演示文稿节点
                    const presentationNode = {
                        type: 5,
                        data: {
                            id: this.generateNodeId(),
                            title: this.PRESENTATION_NODE_TITLE,
                            notes: { content: commentContent.join('\n') },
                            collapse: false,
                            children: { attached: [] }
                        }
                    };
                    forest.push(presentationNode);
                    continue;
                } else {
                    commentContent.push(line);
                    continue;
                }
            }
            
            // 跳过空行
            if (line.trim() === '') {
                continue;
            }
            
            // 解析当前行
            const lineInfo = this.parseLine(line);
            
            // 查找父节点
            const parentInfo = this.findParentNode(stack, lineInfo);
            
            // 创建新节点
            const newNode = this.createNode(lineInfo);
            
            // 附加节点
            this.attachNode(newNode, parentInfo.parentNode, forest);
            
            // 更新栈 - 修复层级关系处理
            if (parentInfo.parentIndex >= 0) {
                // 移除父节点之后的所有节点，保持正确的层级结构
                stack.splice(parentInfo.parentIndex + 1);
            } else {
                // 如果没有找到父节点，清空栈（当前节点将成为顶级节点）
                stack.length = 0;
            }
            
            // 将新节点推入栈
            stack.push({ 
                node: newNode, 
                indentLevel: lineInfo.indent, 
                isText: lineInfo.isText, 
                headerLevel: lineInfo.headerLevel,
                type: lineInfo.type // 添加类型信息以便后续判断
            });
        }
        
        return forest;
    }

    /**
     * 解析单行Markdown
     * @param {string} line - 原始行
     * @returns {Object} 行信息
     */
    parseLine(line) {
        this._ensureInitialized(); // 确保依赖已初始化
        const trimmedLine = line.trim();
        
        // 计算缩进级别
        const indentMatch = line.match(/^(\s*)/);
        const indent = this.indentManager.calculateIndentLevel(indentMatch ? indentMatch[1] : '');
        
        // 检查是否为标题
        const headerMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/);
        if (headerMatch) {
            return {
                type: 'header',
                level: headerMatch[1].length,
                content: headerMatch[2],
                indent: indent,
                headerLevel: headerMatch[1].length,
                isText: false
            };
        }
        
        // 检查是否为分割线
        if (trimmedLine.match(/^[-*_]{3,}$/)) {
            return {
                type: 'divider',
                content: '---',
                indent: indent,
                headerLevel: 0,
                isText: false
            };
        }
        
        // 检查是否为图片
        const imageMatch = trimmedLine.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
        if (imageMatch) {
            return {
                type: 'image',
                alt: imageMatch[1],
                url: imageMatch[2],
                indent: indent,
                headerLevel: 0,
                isText: false
            };
        }
        
        // 修复：更精确的列表项识别
        // 1. 确保列表标记后必须有空格
        // 2. 排除包含粗体语法的情况
        // 3. 排除包含其他Markdown语法的行
        const listMatch = this.isValidListItem(line);
        if (listMatch) {
            // 修复：正确计算列表项的缩进级别
            // 列表项的缩进应该包括列表标记前的空格
            const listIndentText = listMatch.indent;
            const listIndent = this.indentManager.calculateIndentLevel(listIndentText);
            
            return {
                type: 'list',
                content: listMatch.content, // 这里已经是去除列表标记的内容
                indent: listIndent,
                headerLevel: 0,
                isText: true,
                // 新增：保留列表标记信息，用于QQtoMD转换时的准确识别
                listMarker: listMatch.marker,
                originalContent: line.trim() // 保留原始内容，包含列表标记
            };
        }
        
        // 普通文本
        return {
            type: 'text',
            content: trimmedLine,
            indent: indent,
            headerLevel: 0,
            isText: true
        };
    }

    /**
     * 验证是否为有效的列表项
     * @param {string} line - 原始行
     * @returns {Object|null} 列表信息或null
     */
    isValidListItem(line) {
        // 基本列表匹配模式
        const basicListMatch = line.match(/^(\s*)([-*+]|\d+\.)\s+(.+)$/);
        if (!basicListMatch) {
            return null;
        }

        const [, indent, marker, content] = basicListMatch;
        const trimmedContent = content.trim();

        // 排除整行都是粗体语法的情况（这些可能是误判的粗体文本）
        if (trimmedContent.match(/^[*_]+.*[*_]+$/)) {
            return null;
        }

        // 排除包含奇数个*字符且不以*开头的行
        if (trimmedContent.includes('*') && !trimmedContent.startsWith('*')) {
            const asteriskCount = (trimmedContent.match(/\*/g) || []).length;
            if (asteriskCount % 2 === 1) {
                // 奇数个*字符，可能是粗体语法的一部分
                return null;
            }
        }

        // 排除包含特殊分隔符的行
        if (trimmedContent.includes('──') || trimmedContent.includes('—') || trimmedContent.includes('–')) {
            return null;
        }

        // 验证列表标记后必须有空格
        const markerEndIndex = line.indexOf(marker) + marker.length;
        const afterMarker = line.substring(markerEndIndex);
        if (!afterMarker.startsWith(' ')) {
            return null;
        }

        return {
            indent: indent,
            marker: marker,
            content: trimmedContent
        };
    }

    /**
     * 查找父节点
     * @param {Array} stack - 节点栈
     * @param {Object} lineInfo - 行信息
     * @returns {Object} 父节点信息
     */
    findParentNode(stack, lineInfo) {
        this._ensureInitialized(); // 确保依赖已初始化
        return this.nodeManager.findParentNode(stack, lineInfo);
    }

    /**
     * 创建节点
     * @param {Object} lineInfo - 行信息
     * @returns {Object} 节点数据
     */
    createNode(lineInfo) {
        this._ensureInitialized(); // 确保依赖已初始化
        const labels = {
            HEADER_LABEL: this.HEADER_LABEL,
            DIVIDER_LABEL: this.DIVIDER_LABEL
        };
        return this.nodeManager.createNode(lineInfo, this.richTextFormatter, this.md, labels);
    }

    /**
     * 生成唯一节点ID
     * @returns {string} 唯一ID
     */
    generateNodeId() {
        return this.nodeManager.generateNodeId();
    }

    /**
     * 创建代码块节点
     * @param {Array} codeLines - 代码行数组
     * @param {string} language - 编程语言
     * @returns {Object} 代码块节点
     */
    createCodeBlockNode(codeLines, language) {
        this._ensureInitialized(); // 确保依赖已初始化
        return this.codeBlockHandler.createCodeBlockNode(codeLines, language, this.md);
    }

    /**
     * 将代码行转换为QQ思维导图期望的HTML格式
     * @param {Array} codeLines - 代码行数组
     * @param {string} language - 编程语言
     * @returns {string} QQ思维导图格式的HTML
     */
    convertCodeLinesToQQHtml(codeLines, language = '') {
        this._ensureInitialized(); // 确保依赖已初始化
        return this.codeBlockHandler.convertCodeLinesToQQHtml(codeLines, language);
    }

    /**
     * 创建段落
     * @param {Array} lines - 代码行数组
     * @returns {string} 段落HTML
     */
    createParagraph(lines) {
        this._ensureInitialized(); // 确保依赖已初始化
        const processedLines = lines.map(line => this.processCodeLine(line));
        return `<p>${processedLines.join('')}</p>`;
    }

    /**
     * 处理单行代码，包括缩进和特殊字符
     * @param {string} line - 原始代码行
     * @returns {string} 处理后的HTML
     */
    processCodeLine(line) {
        this._ensureInitialized(); // 确保依赖已初始化
        return this.codeBlockHandler.processCodeLine(line);
    }

    /**
     * 附加节点
     * @param {Object} newNode - 新节点
     * @param {Object} parentNode - 父节点
     * @param {Array} forest - 根节点数组
     */
    attachNode(newNode, parentNode, forest) {
        this.nodeManager.attachNode(newNode, parentNode, forest);
    }

    /**
     * 创建富文本节点
     * @param {string} markdown - Markdown文本
     * @returns {Object} 富文本节点
     */
    createRichTextNode(markdown) {
        this._ensureInitialized(); // 确保依赖已初始化
        return this.richTextFormatter.format(markdown, this.md);
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MarkdownToQQConverter;
} else if (typeof window !== 'undefined') {
    window.MarkdownToQQConverter = MarkdownToQQConverter;
}