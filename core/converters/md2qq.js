/**
 * Markdown转QQ转换器
 * 负责将Markdown格式转换为QQ思维导图数据
 */

// 导入依赖 - 修复浏览器环境下的模块加载问题
let RichTextFormatter;
let IndentManager;

// 在浏览器环境中，直接使用全局对象，不尝试require
if (typeof window !== 'undefined') {
    // 浏览器环境：使用全局对象
    RichTextFormatter = window.RichTextFormatter;
    IndentManager = window.IndentManager;
} else if (typeof require !== 'undefined') {
    // Node.js 环境：使用require
    try {
        RichTextFormatter = require('../formatters/richText.js');
        IndentManager = require('../utils/indentManager.js');
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
                this._initialized = true;
                console.log('✅ 浏览器环境依赖初始化成功');
            } else {
                // Node.js 环境 - 直接 require 模块
                const RichTextFormatter = require('../formatters/richText.js');
                const IndentManager = require('../utils/indentManager.js');
                this.richTextFormatter = new RichTextFormatter();
                this.indentManager = new IndentManager();
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
        
        // 检查是否为列表项
        const listMatch = line.match(/^(\s*)([-*+]|\d+\.)\s+(.+)$/);
        if (listMatch) {
            // 修复：正确计算列表项的缩进级别
            // 列表项的缩进应该包括列表标记前的空格
            const listIndentText = listMatch[1];
            const listIndent = this.indentManager.calculateIndentLevel(listIndentText);
            
            return {
                type: 'list',
                content: listMatch[3],
                indent: listIndent,
                headerLevel: 0,
                isText: true
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
     * 查找父节点
     * @param {Array} stack - 节点栈
     * @param {Object} lineInfo - 行信息
     * @returns {Object} 父节点信息
     */
    findParentNode(stack, lineInfo) {
        this._ensureInitialized(); // 确保依赖已初始化
        let parentIndex = -1;
        let parentNode = null;
        
        // 从栈顶开始查找合适的父节点
        for (let i = stack.length - 1; i >= 0; i--) {
            const stackItem = stack[i];
            
            // 如果当前是标题
            if (lineInfo.headerLevel > 0) {
                // 标题的父节点应该是层级更小的标题
                if (stackItem.headerLevel > 0 && lineInfo.headerLevel > stackItem.headerLevel) {
                    parentIndex = i;
                    parentNode = stackItem.node;
                    break;
                }
            } else {
                // 非标题内容的父节点判断
                // 1. 如果当前行缩进级别大于栈中节点的缩进级别，则可以作为子节点
                if (lineInfo.indent > stackItem.indentLevel) {
                    parentIndex = i;
                    parentNode = stackItem.node;
                    break;
                }
                // 2. 如果当前行缩进级别等于栈中节点的缩进级别，且栈中节点是标题，则可以作为标题的内容
                if (lineInfo.indent === stackItem.indentLevel && stackItem.headerLevel > 0) {
                    parentIndex = i;
                    parentNode = stackItem.node;
                    break;
                }
                // 3. 如果当前行缩进级别等于栈中节点的缩进级别，且都是列表项，则可以作为同级节点
                if (lineInfo.indent === stackItem.indentLevel && lineInfo.type === 'list' && stackItem.type === 'list') {
                    // 同级列表项，弹出当前父节点，寻找更上层的父节点
                    continue;
                }
                // 4. 如果当前行缩进级别等于栈中节点的缩进级别，且都是普通文本，则可以作为同级节点
                if (lineInfo.indent === stackItem.indentLevel && lineInfo.type === 'text' && stackItem.type === 'text') {
                    // 同级文本，弹出当前父节点，寻找更上层的父节点
                    continue;
                }
            }
        }
        
        return { parentIndex, parentNode };
    }

    /**
     * 创建节点
     * @param {Object} lineInfo - 行信息
     * @returns {Object} 节点数据
     */
    createNode(lineInfo) {
        this._ensureInitialized(); // 确保依赖已初始化
        const nodeId = this.generateNodeId();
        
        if (lineInfo.type === 'header') {
            return {
                id: nodeId,
                title: this.richTextFormatter.format(lineInfo.content, this.md),
                labels: [this.HEADER_LABEL],
                collapse: false,
                children: { attached: [] }
            };
        } else if (lineInfo.type === 'divider') {
            return {
                id: nodeId,
                title: '---',
                labels: [this.DIVIDER_LABEL],
                collapse: false,
                children: { attached: [] }
            };
        } else if (lineInfo.type === 'image') {
            const altText = lineInfo.alt || 'image';
            const imageUrl = lineInfo.url;
            
            return { 
                id: nodeId,
                title: '', 
                images: [{ 
                    id: this.generateNodeId(), 
                    w: 80, // 设置合适的宽度作为缩略图
                    h: 80, // 设置合适的高度作为缩略图
                    ow: 80, // 原始宽度
                    oh: 80, // 原始高度
                    url: imageUrl
                }], 
                notes: { 
                    content: `<p>Image Alt: ${altText}</p>` 
                },
                collapse: false,
                children: { attached: [] } 
            };
        } else {
            const content = lineInfo.content.replace(/^(\s*[-*+>]\s*)/, '');
            return { 
                id: nodeId,
                title: this.richTextFormatter.format(content, this.md), 
                collapse: false,
                children: { attached: [] },
                originalIndent: lineInfo.indent // 保存原始缩进信息
            };
        }
    }

    /**
     * 生成唯一节点ID
     * @returns {string} 唯一ID
     */
    generateNodeId() {
        return 'node_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 创建代码块节点
     * @param {Array} codeLines - 代码行数组
     * @param {string} language - 编程语言
     * @returns {Object} 代码块节点
     */
    createCodeBlockNode(codeLines, language) {
        this._ensureInitialized(); // 确保依赖已初始化
        // 修复：生成QQ思维导图期望的HTML格式
        const title = language ? `\`\`\`${language}` : '```';
        
        // 将代码行转换为QQ思维导图期望的HTML格式
        const htmlContent = this.convertCodeLinesToQQHtml(codeLines, language);
        
        return {
            id: this.generateNodeId(),
            title: this.richTextFormatter.format(title, this.md),
            labels: [this.CODE_BLOCK_LABEL],
            notes: { content: htmlContent },
            collapse: false,
            children: { attached: [] }
        };
    }

    /**
     * 将代码行转换为QQ思维导图期望的HTML格式
     * @param {Array} codeLines - 代码行数组
     * @param {string} language - 编程语言
     * @returns {string} QQ思维导图格式的HTML
     */
    convertCodeLinesToQQHtml(codeLines, language = '') {
        this._ensureInitialized(); // 确保依赖已初始化
        const paragraphs = [];
        let currentParagraphLines = [];

        const flushParagraph = () => {
            if (currentParagraphLines.length > 0) {
                const paragraphContent = currentParagraphLines.map(line => this.processCodeLine(line)).join('');
                paragraphs.push(`<p>${paragraphContent}</p>`);
                currentParagraphLines = [];
            }
        };

        // 处理代码行，正确处理空行
        for (let i = 0; i < codeLines.length; i++) {
            const line = codeLines[i];
            
            if (line.trim() === '') {
                // 空行：结束当前段落，添加空段落
                flushParagraph();
                paragraphs.push('<p><br></p>');
            } else {
                // 非空行：添加到当前段落
                currentParagraphLines.push(line);
            }
        }
        
        // 处理最后一个段落
        flushParagraph();

        // 添加语言标识到第一个段落
        if (paragraphs.length > 0) {
            const languagePrefix = language ? `\`\`\`${language}<br>` : '```<br>';
            paragraphs[0] = paragraphs[0].replace('<p>', `<p>${languagePrefix}`);
        } else {
            // 如果没有内容，创建默认段落
            const languagePrefix = language ? `\`\`\`${language}<br>` : '```<br>';
            paragraphs.push(`<p>${languagePrefix}</p>`);
        }
        
        // 添加结束标记
        paragraphs.push('<p>```</p>');

        return paragraphs.join('\n');
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
        
        // 使用he库进行HTML实体编码
        const escapedLine = this.he.encode(line, {
            'useNamedReferences': false,
            'allowUnsafeSymbols': false,
            'decimal': false // 使用十六进制格式
        });

        // 将HTML实体转换为Unicode转义格式以匹配QQ思维导图期望
        let result = escapedLine.replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => {
            return `\\u{${hex.toUpperCase()}}`;
        });
        
        // 修复：将双反斜杠转换为单反斜杠以匹配QQ思维导图期望
        result = result.replace(/\\\\u\{/g, '\\u{');
        
        // 修复：将Unicode转义转换为实际字符以匹配QQ思维导图期望
        result = result.replace(/\\u\{([0-9A-F]+)\}/g, (match, hex) => {
            return String.fromCodePoint(parseInt(hex, 16));
        });

        // 处理缩进：将前导空格转换为&nbsp;，使用双重转义
        result = result.replace(/^ +/g, (spaces) => '&amp;nbsp;'.repeat(spaces.length));

        // 添加换行标签
        return result + '<br>';
    }

    /**
     * 附加节点
     * @param {Object} newNode - 新节点
     * @param {Object} parentNode - 父节点
     * @param {Array} forest - 根节点数组
     */
    attachNode(newNode, parentNode, forest) {
        if (parentNode) {
            if (!parentNode.children) parentNode.children = { attached: [] };
            if (!parentNode.children.attached) parentNode.children.attached = [];
            parentNode.children.attached.push(newNode);
        } else {
            forest.push({ type: 5, data: newNode });
        }
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