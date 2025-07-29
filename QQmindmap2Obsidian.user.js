// ==UserScript==
// @name         QQ Mind Map to Obsidian Converter (Simple)
// @namespace    http://tampermonkey.net/
// @version      2.0.0
// @description  Converts QQ Mind Map to Obsidian Markdown and vice-versa
// @author       carllx & Gemini
// @match        https://docs.qq.com/mind/*
// @grant        GM_setClipboard
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @require      https://cdn.jsdelivr.net/npm/markdown-it@14.1.0/dist/markdown-it.min.js
// @require      https://cdn.jsdelivr.net/npm/dompurify@3.1.5/dist/purify.min.js
// ==/UserScript==

(function() {
    'use strict';

    console.log('🚀 QQ Mind Map Converter (Simple) starting...');

    // 立即创建全局对象
    window.QQMindMap2Obsidian = {
        test: true,
        version: 'simple',
        status: 'initializing'
    };
    console.log('✅ Initial global object created:', window.QQMindMap2Obsidian);

    // 简化的模块系统
    const modules = {};
    function define(name, factory) { 
        try {
            modules[name] = factory();
            console.log('✅ Module loaded:', name);
        } catch (error) {
            console.error('❌ Error loading module:', name, error);
        }
    }
    function require(name) { 
        const module = modules[name];
        if (!module) {
            console.error('❌ Module not found:', name);
        }
        return module;
    }

    define('IndentManager', function() {
        /**
 * 标准化缩进管理器
 * 统一处理 Markdown 和 QQ 思维导图之间的缩进转换
 */
class IndentManager {
    constructor() {
        // 标准缩进配置
        this.config = {
            tabSize: 4,           // 一个 tab 等于多少个空格
            useTabs: true,        // 是否使用 tab 而不是空格
            maxIndentLevel: 10    // 最大缩进级别
        };
    }

    /**
     * 标准化缩进字符串
     * @param {string} text - 原始文本
     * @returns {string} 标准化后的文本
     */
    normalizeIndent(text) {
        const lines = text.split('\n');
        const normalizedLines = lines.map(line => {
            const indentMatch = line.match(/^(\s*)/);
            if (!indentMatch) return line;

            const indentText = indentMatch[1];
            const indentLevel = this.calculateIndentLevel(indentText);
            const normalizedIndent = this.createIndentString(indentLevel);
            
            return normalizedIndent + line.substring(indentMatch[1].length);
        });
        
        return normalizedLines.join('\n');
    }

    /**
     * 计算缩进级别
     * @param {string} indentText - 缩进字符串
     * @returns {number} 缩进级别 (0, 1, 2, ...)
     */
    calculateIndentLevel(indentText) {
        if (!indentText) return 0;
        
        // 统一转换为空格计算
        const spaceCount = indentText.replace(/\t/g, ' '.repeat(this.config.tabSize)).length;
        return Math.floor(spaceCount / this.config.tabSize);
    }

    /**
     * 创建缩进字符串
     * @param {number} level - 缩进级别
     * @returns {string} 缩进字符串
     */
    createIndentString(level) {
        if (level <= 0) return '';
        
        if (this.config.useTabs) {
            return '\t'.repeat(level);
        } else {
            return ' '.repeat(level * this.config.tabSize);
        }
    }

    /**
     * 从 Markdown 行解析缩进信息
     * @param {string} line - Markdown 行
     * @returns {Object} 缩进信息
     */
    parseMarkdownIndent(line) {
        const trimmedLine = line.trim();
        const indentMatch = line.match(/^(\s*)/);
        const indentText = indentMatch ? indentMatch[1] : '';
        
        // 改进列表判断：更精确地识别真正的列表项
        const isHeader = /^(#{1,6})\s+/.test(trimmedLine);
        
        // 判断是否为真正的列表项：
        // 1. 不是标题
        // 2. 以列表标记开头（- * + 或 数字.）
        // 3. 列表标记后必须有空格
        // 4. 排除包含特殊字符的标题行（如 "3. 探索 (Explore) ──"）
        const isList = !isHeader && 
                      /^\s*([-*+]|\d+\.)\s+/.test(trimmedLine) &&
                      !trimmedLine.includes('──') && // 排除包含特殊分隔符的行
                      !trimmedLine.includes('—') &&  // 排除包含破折号的行
                      !trimmedLine.includes('–');    // 排除包含短横线的行
        
        return {
            originalIndent: indentText,
            level: this.calculateIndentLevel(indentText),
            content: trimmedLine,
            isList: isList,
            isHeader: isHeader
        };
    }

    /**
     * 从 QQ 节点获取缩进级别
     * @param {Object} node - QQ 节点
     * @param {number} baseLevel - 基础缩进级别
     * @returns {number} 缩进级别
     */
    getQQNodeIndentLevel(node, baseLevel = 0) {
        // QQ 节点的缩进级别由其层级决定
        return baseLevel;
    }

    /**
     * 验证缩进一致性
     * @param {string} originalText - 原始文本
     * @param {string} convertedText - 转换后文本
     * @returns {Object} 验证结果
     */
    validateIndentConsistency(originalText, convertedText) {
        const originalLines = originalText.split('\n');
        const convertedLines = convertedText.split('\n');
        
        const issues = [];
        
        for (let i = 0; i < Math.min(originalLines.length, convertedLines.length); i++) {
            const originalIndent = this.parseMarkdownIndent(originalLines[i]);
            const convertedIndent = this.parseMarkdownIndent(convertedLines[i]);
            
            if (originalIndent.level !== convertedIndent.level) {
                issues.push({
                    line: i + 1,
                    original: originalIndent.level,
                    converted: convertedIndent.level,
                    content: originalIndent.content.substring(0, 50)
                });
            }
        }
        
        return {
            isValid: issues.length === 0,
            issues: issues
        };
    }

    /**
     * 修复缩进不一致
     * @param {string} text - 需要修复的文本
     * @param {Array} corrections - 修正信息数组
     * @returns {string} 修复后的文本
     */
    fixIndentInconsistencies(text, corrections) {
        const lines = text.split('\n');
        
        corrections.forEach(correction => {
            const lineIndex = correction.line - 1;
            if (lineIndex >= 0 && lineIndex < lines.length) {
                const line = lines[lineIndex];
                const indentInfo = this.parseMarkdownIndent(line);
                const correctIndent = this.createIndentString(correction.correctLevel);
                lines[lineIndex] = correctIndent + indentInfo.content;
            }
        });
        
        return lines.join('\n');
    }
}

// 导出模块
if (typeof window !== 'undefined') {
    window.IndentManager = IndentManager;
} 
        return IndentManager;
    });

    define('LinePreserver', function() {
        /**
 * 行格式保持器
 * 专门处理 Markdown 转换过程中的空行和格式保持
 */
class LinePreserver {
    constructor() {
        this.config = {
            preserveEmptyLines: true,    // 是否保持空行
            normalizeSpacing: true,      // 是否标准化间距
            maxConsecutiveEmptyLines: 2  // 最大连续空行数
        };
    }

    /**
     * 分析 Markdown 文档的行结构
     * @param {string} markdown - Markdown 文本
     * @returns {Array} 行结构数组
     */
    analyzeLineStructure(markdown) {
        const lines = markdown.split('\n');
        const structure = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmedLine = line.trim();
            
            structure.push({
                index: i,
                original: line,
                trimmed: trimmedLine,
                isEmpty: trimmedLine === '',
                isHeader: /^(#{1,6})\s+/.test(trimmedLine),
                isList: /^\s*([-*+]|\d+\.)\s+/.test(trimmedLine),
                isSeparator: trimmedLine === '---',
                indentLevel: this.calculateIndentLevel(line),
                shouldPreserve: this.shouldPreserveLine(line, i, lines)
            });
        }
        
        return structure;
    }

    /**
     * 计算缩进级别
     * @param {string} line - 行内容
     * @returns {number} 缩进级别
     */
    calculateIndentLevel(line) {
        const match = line.match(/^(\s*)/);
        if (!match) return 0;
        
        const indentText = match[1];
        return (indentText.match(/\t/g) || []).length;
    }

    /**
     * 判断是否应该保持该行
     * @param {string} line - 行内容
     * @param {number} index - 行索引
     * @param {Array} allLines - 所有行
     * @returns {boolean} 是否应该保持
     */
    shouldPreserveLine(line, index, allLines) {
        const trimmedLine = line.trim();
        
        // 空行处理
        if (trimmedLine === '') {
            // 检查前后行来决定是否保持空行
            const prevLine = index > 0 ? allLines[index - 1].trim() : '';
            const nextLine = index < allLines.length - 1 ? allLines[index + 1].trim() : '';
            
            // 标题后的空行应该保持
            if (prevLine.match(/^(#{1,6})\s+/)) {
                return true;
            }
            
            // 列表项之间的空行应该保持（但不要太多）
            if (prevLine.match(/^\s*[-*+]\s/) && nextLine.match(/^\s*[-*+]\s/)) {
                return true;
            }
            
            // 段落之间的空行应该保持
            if (prevLine !== '' && nextLine !== '' && 
                !prevLine.match(/^(#{1,6})\s+/) && 
                !nextLine.match(/^(#{1,6})\s+/)) {
                return true;
            }
            
            return false;
        }
        
        return true;
    }

    /**
     * 清理和标准化空行
     * @param {Array} structure - 行结构数组
     * @returns {Array} 清理后的行结构
     */
    normalizeEmptyLines(structure) {
        const result = [];
        let consecutiveEmptyCount = 0;
        
        for (const lineInfo of structure) {
            if (lineInfo.isEmpty) {
                consecutiveEmptyCount++;
                if (consecutiveEmptyCount <= this.config.maxConsecutiveEmptyLines) {
                    result.push(lineInfo);
                }
            } else {
                consecutiveEmptyCount = 0;
                result.push(lineInfo);
            }
        }
        
        return result;
    }

    /**
     * 从行结构重建 Markdown
     * @param {Array} structure - 行结构数组
     * @returns {string} 重建的 Markdown
     */
    rebuildMarkdown(structure) {
        return structure
            .filter(lineInfo => lineInfo.shouldPreserve)
            .map(lineInfo => lineInfo.original)
            .join('\n');
    }

    /**
     * 保持原始格式的转换
     * @param {string} originalMarkdown - 原始 Markdown
     * @param {string} convertedContent - 转换后的内容
     * @returns {string} 格式保持后的内容
     */
    preserveFormat(originalMarkdown, convertedContent) {
        // 分析原始文档结构
        const originalStructure = this.analyzeLineStructure(originalMarkdown);
        const convertedLines = convertedContent.split('\n');
        
        // 创建新的结构，保持原始的空行模式
        const newStructure = [];
        let convertedIndex = 0;
        
        for (const originalLine of originalStructure) {
            if (originalLine.isEmpty && originalLine.shouldPreserve) {
                // 保持原始空行
                newStructure.push({ original: '', shouldPreserve: true });
            } else if (!originalLine.isEmpty) {
                // 使用转换后的内容
                if (convertedIndex < convertedLines.length) {
                    newStructure.push({ 
                        original: convertedLines[convertedIndex], 
                        shouldPreserve: true 
                    });
                    convertedIndex++;
                }
            }
        }
        
        // 添加剩余的转换内容
        while (convertedIndex < convertedLines.length) {
            newStructure.push({ 
                original: convertedLines[convertedIndex], 
                shouldPreserve: true 
            });
            convertedIndex++;
        }
        
        return this.rebuildMarkdown(newStructure);
    }
}

// 导出模块
if (typeof window !== 'undefined') {
    window.LinePreserver = LinePreserver;
} 
        return LinePreserver;
    });

    define('QQMindMapParser', function() {
        /**
 * QQ思维导图解析器
 * 负责解析QQ思维导图的HTML结构和数据格式
 */
class QQMindMapParser {
    constructor() {
        this.PRESENTATION_NODE_TITLE = 'Presentation';
    }

    /**
     * 从HTML中提取思维导图数据
     * @param {string} html - 包含思维导图数据的HTML
     * @returns {Array} 思维导图节点数组
     */
    extractMindMapData(html) {
        try {
            const mindMapElement = new DOMParser()
                .parseFromString(html, 'text/html')
                .querySelector('[data-mind-map]');
            
            if (!mindMapElement) {
                throw new Error('No data-mind-map attribute found in HTML');
            }
            
            return JSON.parse(mindMapElement.getAttribute('data-mind-map'));
        } catch (error) {
            throw new Error(`Failed to extract mind map data: ${error.message}`);
        }
    }

    /**
     * 解析节点结构
     * @param {Object} node - 思维导图节点
     * @returns {Object} 解析后的节点数据
     */
    parseNode(node) {
        const data = node.data || node;
        return {
            title: this.parseTitle(data.title),
            images: data.images || [],
            labels: data.labels || [],
            notes: data.notes,
            children: this.parseChildren(data.children),
            isHeader: this.isHeaderNode(data),
            isPresentation: data.title === this.PRESENTATION_NODE_TITLE,
            isDivider: data.title === '---'
        };
    }

    /**
     * 解析标题内容
     * @param {Object|string} title - 标题对象或字符串
     * @returns {Object} 解析后的标题数据
     */
    parseTitle(title) {
        if (typeof title === 'string') {
            return { type: 'text', content: title, styles: {} };
        }
        
        if (!title?.children) {
            return { type: 'text', content: '', styles: {} };
        }

        return {
            type: 'rich-text',
            content: this.extractTextContent(title),
            styles: this.extractTextStyles(title)
        };
    }

    /**
     * 提取文本内容
     * @param {Object} titleObject - 标题对象
     * @returns {string} 提取的文本内容
     */
    extractTextContent(titleObject) {
        return titleObject.children
            .flatMap(p => p.children?.map(t => t.text || '') || [])
            .join('');
    }

    /**
     * 提取文本样式
     * @param {Object} titleObject - 标题对象
     * @returns {Object} 样式对象
     */
    extractTextStyles(titleObject) {
        const styles = {};
        titleObject.children.forEach(p => {
            p.children?.forEach(textNode => {
                if (textNode.backgroundColor === '#FFF3A1') styles.highlight = true;
                if (textNode.strike) styles.strikethrough = true;
                if (textNode.fontStyle === 'italic') styles.italic = true;
                if (textNode.fontWeight === 'bold') styles.bold = true;
                if (textNode.underline) styles.underline = true;
            });
        });
        return styles;
    }

    /**
     * 解析子节点
     * @param {Object} children - 子节点对象
     * @returns {Array} 子节点数组
     */
    parseChildren(children) {
        if (!children?.attached) return [];
        return children.attached.map(child => this.parseNode(child));
    }

    /**
     * 判断是否为标题节点
     * @param {Object} data - 节点数据
     * @returns {boolean} 是否为标题节点
     */
    isHeaderNode(data) {
        return data.labels?.some(label => label.text === 'header');
    }

    /**
     * 生成纯文本表示
     * @param {Array} nodes - 节点数组
     * @param {number} depth - 当前深度
     * @returns {string} 纯文本内容
     */
    generatePlainText(nodes, depth = 0) {
        return nodes.map(node => {
            const parsedNode = this.parseNode(node);
            let text = '';

            if (parsedNode.isPresentation && parsedNode.notes?.content) {
                text = this.convertNoteHtmlToPlainText(parsedNode.notes.content) + '\n';
            } else if (!parsedNode.isDivider) {
                const titleText = typeof parsedNode.title === 'string' 
                    ? parsedNode.title 
                    : parsedNode.title.content;
                
                if (titleText.trim()) {
                    text = '\t'.repeat(depth) + titleText.trim() + '\n';
                }
            }

            if (parsedNode.children.length > 0) {
                text += this.generatePlainText(parsedNode.children, depth + 1);
            }

            return text;
        }).join('');
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
    window.QQMindMapParser = QQMindMapParser;
} 
        return QQMindMapParser;
    });

    define('QQToMarkdownConverter', function() {
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
        return QQToMarkdownConverter;
    });

    define('MarkdownToQQConverter', function() {
        /**
 * Markdown转QQ转换器
 * 负责将Markdown格式转换为QQ思维导图数据
 */
class MarkdownToQQConverter {
    constructor(markdownIt) {
        this.md = markdownIt;
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
            backgroundColor: '#F0F0F0',
            color: '#000000'
        };
        this.DIVIDER_LABEL = {
            id: 'qq-mind-map-divider-label',
            text: 'divider',
            backgroundColor: '#E0E0E0',
            color: '#666666'
        };
        this.indentManager = new IndentManager();
    }

    /**
     * 转换Markdown为思维导图数据
     * @param {string} markdown - Markdown文本
     * @returns {Array} 思维导图节点数组
     */
    convert(markdown) {
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
                } else {
                    // 修复：保留原始行内容，包括撇号等特殊字符
                    codeBlockContent.push(line);
                }
                continue;
            }

            // 检查代码块开始
            const codeBlockMatch = line.trim().match(/^```(\w*)$/);
            if (codeBlockMatch) {
                inCodeBlock = true;
                codeBlockLanguage = codeBlockMatch[1] || '';
                codeBlockContent = [];
                continue;
            }

            // 处理注释块
            if (inCommentBlock) {
                if (line.includes('-->')) {
                    inCommentBlock = false;
                    commentContent.push(line.substring(0, line.indexOf('-->')));
                    const parentNode = stack.length > 0 ? stack[stack.length - 1].node : null;
                    if (parentNode) {
                        const note = `<p>${commentContent.join('\n').replace(/\n/g, '</p><p>')}</p>`;
                        parentNode.children.attached.push({ 
                            title: this.PRESENTATION_NODE_TITLE, 
                            notes: { content: note }, 
                            children: { attached: [] } 
                        });
                    }
                    commentContent = [];
                } else {
                    commentContent.push(line);
                }
                continue;
            }

            const trimmedLine = line.trim();
            
            // 处理注释开始
            if (trimmedLine.startsWith('<!--')) {
                const parentNode = stack.length > 0 ? stack[stack.length - 1].node : null;
                if (parentNode) {
                    if (trimmedLine.endsWith('-->')) {
                        const note = `<p>${trimmedLine.slice(4, -3).trim().replace(/\n/g, '</p><p>')}</p>`;
                        parentNode.children.attached.push({ 
                            title: this.PRESENTATION_NODE_TITLE, 
                            notes: { content: note }, 
                            children: { attached: [] } 
                        });
                    } else {
                        inCommentBlock = true;
                        commentContent.push(line.substring(line.indexOf('<!--') + 4));
                    }
                }
                continue;
            }

            // 保留空行信息，但不创建节点
            if (trimmedLine === '') {
                // 空行时重置栈中的某些状态，但不完全跳过
                continue;
            }

            // 解析行信息
            const lineInfo = this.parseLine(line);
            
            // 查找父节点
            const parentNode = this.findParentNode(stack, lineInfo);
            
            // 创建新节点
            const newNode = this.createNode(lineInfo);
            
            // 附加节点
            this.attachNode(newNode, parentNode, forest);
            
            // 推入栈 - 但分割线节点不推入栈，避免干扰层次结构
            if (trimmedLine !== '---') {
                stack.push({ 
                    node: newNode, 
                    indentLevel: lineInfo.indent, 
                    isText: lineInfo.isText, 
                    headerLevel: lineInfo.headerLevel 
                });
            }
        }
        
        return forest;
    }

    /**
     * 解析行内容
     * @param {string} line - 原始行
     * @returns {Object} 解析结果
     */
    parseLine(line) {
        // 使用标准化的缩进管理器
        const indentInfo = this.indentManager.parseMarkdownIndent(line);
        
        const headerMatch = indentInfo.content.match(/^(#{1,6})\s+(.+)$/);
        const currentHeaderLevel = headerMatch ? headerMatch[1].length : 0;

        const isList = indentInfo.isList;
        const isText = !isList && !currentHeaderLevel;

        // 改进图片匹配，提取alt信息
        const imageMatch = indentInfo.content.match(/^!\[(.*?)\]\((.*?)\)$/);

        return {
            trimmedLine: indentInfo.content,
            indent: indentInfo.level,
            headerLevel: currentHeaderLevel,
            isList,
            isText,
            headerMatch,
            imageMatch
        };
    }

    /**
     * 查找父节点
     * @param {Array} stack - 节点栈
     * @param {Object} lineInfo - 行信息
     * @returns {Object|null} 父节点
     */
    findParentNode(stack, lineInfo) {
        while (stack.length > 0) {
            const top = stack[stack.length - 1];

            if (lineInfo.headerLevel > 0) { // 当前是标题
                if (top.headerLevel > 0 && lineInfo.headerLevel > top.headerLevel) {
                    break; // 父节点找到：当前是子标题
                }
            } else { // 当前不是标题（列表或文本）
                if (lineInfo.indent > top.indentLevel) {
                    break; // 父节点找到：缩进的子项
                }
                if (top.headerLevel > 0 && lineInfo.indent === top.indentLevel) {
                    break; // 父节点找到：标题的内容
                }
                if (lineInfo.isList && top.isText && lineInfo.indent === top.indentLevel) {
                    break; // 父节点找到：文本后的列表项
                }
                // 修复：同级文本应该作为同级节点，而不是父子关系
                if (lineInfo.indent === top.indentLevel && lineInfo.isText && top.isText) {
                    // 同级文本，弹出当前父节点，寻找更上层的父节点
                    stack.pop();
                    continue;
                }
                // 如果当前行缩进小于等于父节点，且不是标题，则弹出父节点
                if (lineInfo.indent <= top.indentLevel && top.headerLevel === 0) {
                    stack.pop();
                    continue;
                }
            }
            stack.pop();
        }

        return stack.length > 0 ? stack[stack.length - 1].node : null;
    }

    /**
     * 创建节点
     * @param {Object} lineInfo - 行信息
     * @returns {Object} 新节点
     */
    createNode(lineInfo) {
        const { trimmedLine, headerMatch, imageMatch } = lineInfo;

        if (headerMatch) {
            return { 
                title: this.createRichTextNode(headerMatch[2].trim()), 
                labels: [this.HEADER_LABEL], 
                children: { attached: [] } 
            };
        } else if (trimmedLine === '---') {
            return { 
                title: '---', 
                labels: [this.DIVIDER_LABEL], 
                children: { attached: [] } 
            };
        } else if (imageMatch) {
            const altText = imageMatch[1] || 'image';
            const imageUrl = imageMatch[2];
            
            return { 
                title: '', 
                images: [{ 
                    id: '', 
                    w: 80, // 设置合适的宽度作为缩略图
                    h: 80, // 设置合适的高度作为缩略图
                    ow: 80, // 原始宽度
                    oh: 80, // 原始高度
                    url: imageUrl
                }], 
                notes: { 
                    content: `<p>Image Alt: ${altText}</p>` 
                },
                children: { attached: [] } 
            };
        } else {
            const content = trimmedLine.replace(/^(\s*[-*+>]\s*)/, '');
            return { 
                title: this.createRichTextNode(content), 
                children: { attached: [] },
                originalIndent: lineInfo.indent // 保存原始缩进信息
            };
        }
    }

    /**
     * 创建代码块节点
     * @param {Array} codeLines - 代码行数组
     * @param {string} language - 编程语言
     * @returns {Object} 代码块节点
     */
    createCodeBlockNode(codeLines, language) {
        // 修复：确保代码内容完整保留，包括特殊字符
        const codeContent = codeLines.join('\n');
        const title = language ? `\`\`\`${language}` : '```';
        
        return {
            title: this.createRichTextNode(title),
            labels: [this.CODE_BLOCK_LABEL],
            notes: { content: `<pre><code>${this.escapeHtml(codeContent)}</code></pre>` },
            children: { attached: [] }
        };
    }

    /**
     * 转义HTML特殊字符
     * @param {string} text - 需要转义的文本
     * @returns {string} 转义后的文本
     */
    escapeHtml(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
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
        const trimmedMarkdown = markdown.trim();
        if (trimmedMarkdown === '') {
            return {
                children: [{ type: 'paragraph', children: [{type: 'text', text: ''}] }],
                type: 'document',
            };
        }

        const tokens = this.md.parseInline(trimmedMarkdown, {});
        const qqTextNodes = this.buildQQNodesFromTokens(tokens);

        if (qqTextNodes.length === 0) {
            qqTextNodes.push({ type: 'text', text: trimmedMarkdown });
        }

        return {
            children: [{ type: 'paragraph', children: qqTextNodes }],
            type: 'document',
        };
    }

    /**
     * 从Markdown tokens构建QQ文本节点
     * @param {Array} tokens - Markdown tokens
     * @returns {Array} QQ文本节点数组
     */
    buildQQNodesFromTokens(tokens) {
        const resultNodes = [];
        const styleStack = [];

        for (const token of tokens) {
            let content = token.content;
            
            switch (token.type) {
                case 'strong_open': 
                    styleStack.push({ fontWeight: 'bold' }); 
                    continue;
                case 'em_open': 
                    styleStack.push({ fontStyle: 'italic' }); 
                    continue;
                case 's_open': 
                    styleStack.push({ strike: true }); 
                    continue;
                case 'highlight_open': 
                    styleStack.push({ backgroundColor: '#FFF3A1' }); 
                    continue;
                case 'wikilink_open': 
                    styleStack.push({ underline: true, color: '#0052D9' }); 
                    continue;
                case 'link_open': 
                    styleStack.push({ underline: true, color: '#0052D9' }); 
                    continue;

                case 'strong_close':
                case 'em_close':
                case 's_close':
                case 'highlight_close':
                case 'wikilink_close':
                case 'link_close': 
                    styleStack.pop(); 
                    continue;

                case 'text': 
                    break;
                default: 
                    continue;
            }

            if (content) {
                const finalStyle = styleStack.reduce((acc, s) => ({ ...acc, ...s }), {});
                resultNodes.push({ type: 'text', text: content, ...finalStyle });
            }
        }
        
        return resultNodes;
    }
}

// 导出模块
if (typeof window !== 'undefined') {
    window.MarkdownToQQConverter = MarkdownToQQConverter;
}

        return MarkdownToQQConverter;
    });

    define('NotificationSystem', function() {
        /**
 * 通知系统
 * 负责显示用户反馈和状态提示
 */
class NotificationSystem {
    constructor() {
        this.notificationId = 'converter-notification';
        this.defaultDuration = 3000;
        this.colors = {
            success: '#4CAF50',
            error: '#f44336',
            warning: '#ff9800',
            info: '#2196F3'
        };
    }

    /**
     * 显示通知
     * @param {string} message - 通知消息
     * @param {string} type - 通知类型 ('success', 'error', 'warning', 'info')
     * @param {number} duration - 显示时长（毫秒）
     */
    show(message, type = 'success', duration = this.defaultDuration) {
        // 移除现有通知
        this.removeExisting();

        // 创建通知元素
        const notification = this.createNotification(message, type);
        
        // 添加到页面
        document.body.appendChild(notification);

        // 动画显示
        this.animateIn(notification);

        // 自动隐藏
        setTimeout(() => {
            this.animateOut(notification);
        }, duration);
    }

    /**
     * 显示成功通知
     * @param {string} message - 消息内容
     * @param {number} duration - 显示时长
     */
    success(message, duration = this.defaultDuration) {
        this.show(message, 'success', duration);
    }

    /**
     * 显示错误通知
     * @param {string} message - 消息内容
     * @param {number} duration - 显示时长
     */
    error(message, duration = this.defaultDuration) {
        this.show(message, 'error', duration);
    }

    /**
     * 显示警告通知
     * @param {string} message - 消息内容
     * @param {number} duration - 显示时长
     */
    warning(message, duration = this.defaultDuration) {
        this.show(message, 'warning', duration);
    }

    /**
     * 显示信息通知
     * @param {string} message - 消息内容
     * @param {number} duration - 显示时长
     */
    info(message, duration = this.defaultDuration) {
        this.show(message, 'info', duration);
    }

    /**
     * 创建通知元素
     * @param {string} message - 消息内容
     * @param {string} type - 通知类型
     * @returns {Element} 通知元素
     */
    createNotification(message, type) {
        const notification = document.createElement('div');
        notification.id = this.notificationId;
        notification.textContent = message;
        notification.className = `notification notification-${type}`;
        
        return notification;
    }

    /**
     * 添加通知样式
     */
    addStyles() {
        const styles = `
            #converter-notification {
                position: fixed;
                top: -50px;
                left: 50%;
                transform: translateX(-50%);
                background-color: ${this.colors.success};
                color: white;
                padding: 12px 20px;
                border-radius: 5px;
                z-index: 10000;
                font-size: 14px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                transition: top 0.5s ease, opacity 0.5s ease;
                opacity: 0;
                max-width: 400px;
                word-wrap: break-word;
                text-align: center;
            }
            #converter-notification.notification-error {
                background-color: ${this.colors.error};
            }
            #converter-notification.notification-warning {
                background-color: ${this.colors.warning};
            }
            #converter-notification.notification-info {
                background-color: ${this.colors.info};
            }
            #converter-notification.notification-success {
                background-color: ${this.colors.success};
            }
        `;

        if (typeof GM_addStyle !== 'undefined') {
            GM_addStyle(styles);
        } else {
            const styleElement = document.createElement('style');
            styleElement.textContent = styles;
            document.head.appendChild(styleElement);
        }
    }

    /**
     * 动画显示通知
     * @param {Element} notification - 通知元素
     */
    animateIn(notification) {
        setTimeout(() => {
            notification.style.top = '20px';
            notification.style.opacity = '1';
        }, 100);
    }

    /**
     * 动画隐藏通知
     * @param {Element} notification - 通知元素
     */
    animateOut(notification) {
        notification.style.top = '-50px';
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 500);
    }

    /**
     * 移除现有通知
     */
    removeExisting() {
        const existing = document.getElementById(this.notificationId);
        if (existing) {
            existing.remove();
        }
    }

    /**
     * 显示进度通知
     * @param {string} message - 消息内容
     * @returns {Function} 完成回调函数
     */
    showProgress(message) {
        this.show(message, 'info', 0); // 不自动隐藏
        return (finalMessage, type = 'success') => {
            this.show(finalMessage, type);
        };
    }

    /**
     * 显示确认对话框
     * @param {string} message - 消息内容
     * @param {Function} onConfirm - 确认回调
     * @param {Function} onCancel - 取消回调
     */
    confirm(message, onConfirm, onCancel) {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: white;
            padding: 20px;
            border-radius: 8px;
            max-width: 400px;
            text-align: center;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        `;

        dialog.innerHTML = `
            <div style="margin-bottom: 20px; font-size: 16px;">${message}</div>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button id="confirm-yes" style="padding: 8px 16px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">确认</button>
                <button id="confirm-no" style="padding: 8px 16px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;">取消</button>
            </div>
        `;

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        const handleConfirm = () => {
            overlay.remove();
            if (onConfirm) onConfirm();
        };

        const handleCancel = () => {
            overlay.remove();
            if (onCancel) onCancel();
        };

        dialog.querySelector('#confirm-yes').addEventListener('click', handleConfirm);
        dialog.querySelector('#confirm-no').addEventListener('click', handleCancel);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) handleCancel();
        });
    }
}

// 导出模块
if (typeof window !== 'undefined') {
    window.NotificationSystem = NotificationSystem;
} 
        return NotificationSystem;
    });



    // 简化的UI管理器
    class SimpleInterfaceManager {
        constructor(converter) {
            this.converter = converter;
            this.container = null;
        }

        init() {
            console.log('🔧 Initializing UI...');
            this.waitForUIAndInject();
        }

        waitForUIAndInject() {
            console.log('🔍 Looking for target element...');
            const interval = setInterval(() => {
                // 尝试多个可能的选择器
                const selectors = [
                    '#editor-root > div > div > div.Footer_footer__DdscW',
                    '.Footer_footer__DdscW',
                    'footer',
                    'body'
                ];
                
                let targetElement = null;
                for (const selector of selectors) {
                    targetElement = document.querySelector(selector);
                    if (targetElement) {
                        console.log('✅ Found target element with selector:', selector);
                        break;
                    }
                }
                
                if (targetElement) {
                    clearInterval(interval);
                    this.createUI(targetElement);
                    console.log('✅ UI created successfully');
                } else {
                    console.log('⏳ Target element not found, retrying...');
                }
            }, 1000);
        }

        createUI(parentElement) {
            // 创建容器
            this.container = document.createElement('div');
            this.container.id = 'converter-container';
            this.container.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                gap: 10px;
                background: rgba(255, 255, 255, 0.95);
                padding: 10px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                border: 1px solid #e0e0e0;
            `;

            // 创建按钮
            const qqToMdBtn = document.createElement('button');
            qqToMdBtn.textContent = 'QQ to MD';
            qqToMdBtn.style.cssText = `
                background: #4CAF50;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
            `;
            qqToMdBtn.onclick = () => {
                console.log('🔘 QQ to MD button clicked');
                this.handleQQToMDConversion();
            };

            const mdToQqBtn = document.createElement('button');
            mdToQqBtn.textContent = 'MD to QQ';
            mdToQqBtn.style.cssText = `
                background: #2196F3;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
            `;
            mdToQqBtn.onclick = () => {
                console.log('🔘 MD to QQ button clicked');
                this.converter.convertMDToQQ();
            };

            // 添加按钮到容器
            this.container.appendChild(qqToMdBtn);
            this.container.appendChild(mdToQqBtn);

            // 添加到页面
            parentElement.appendChild(this.container);
            console.log('✅ UI elements added to page');
        }

        /**
         * 处理QQ到MD转换，包含header level选择
         */
        async handleQQToMDConversion() {
            console.log('🔄 Handling QQ to MD conversion with header level selection');
            
            // 获取QQ思维导图数据
            const qqData = await this.converter.getQQMindMapData();
            if (!qqData || qqData.length === 0) {
                this.showNotification('未检测到QQ思维导图数据', 'error');
                return;
            }

            // 检查是否包含header节点
            const hasHeaders = this.checkForHeaderNodes(qqData);
            
            if (hasHeaders) {
                this.showHeaderLevelDialog(qqData);
            } else {
                // 没有header节点，直接转换
                this.converter.convertQQToMD();
            }
        }

        /**
         * 检查是否包含header节点
         * @param {Array} nodes - 节点数组
         * @returns {boolean} 是否包含header节点
         */
        checkForHeaderNodes(nodes) {
            for (const node of nodes) {
                const data = node.data || node;
                if (data.labels?.some(l => l.text === 'header')) {
                    return true;
                }
                if (data.children?.attached) {
                    if (this.checkForHeaderNodes(data.children.attached)) {
                        return true;
                    }
                }
            }
            return false;
        }

        /**
         * 显示header level选择对话框
         * @param {Array} qqData - QQ思维导图数据
         */
        showHeaderLevelDialog(qqData) {
            // 创建模态对话框
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
            `;

            const dialog = document.createElement('div');
            dialog.style.cssText = `
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                max-width: 400px;
                width: 90%;
            `;

            dialog.innerHTML = `
                <h3 style="margin: 0 0 15px 0; color: #333;">选择起始标题层级</h3>
                <p style="margin: 0 0 15px 0; color: #666; font-size: 14px;">
                    检测到思维导图中包含标题节点。请选择起始的标题层级，这将影响转换后的Markdown结构。
                </p>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 8px; color: #333;">
                        <input type="radio" name="headerLevel" value="1" checked> 
                        H1 (# 一级标题)
                    </label>
                    <label style="display: block; margin-bottom: 8px; color: #333;">
                        <input type="radio" name="headerLevel" value="2"> 
                        H2 (## 二级标题)
                    </label>
                    <label style="display: block; margin-bottom: 8px; color: #333;">
                        <input type="radio" name="headerLevel" value="3"> 
                        H3 (### 三级标题)
                    </label>
                    <label style="display: block; margin-bottom: 8px; color: #333;">
                        <input type="radio" name="headerLevel" value="4"> 
                        H4 (#### 四级标题)
                    </label>
                    <label style="display: block; margin-bottom: 8px; color: #333;">
                        <input type="radio" name="headerLevel" value="5"> 
                        H5 (##### 五级标题)
                    </label>
                    <label style="display: block; margin-bottom: 8px; color: #333;">
                        <input type="radio" name="headerLevel" value="6"> 
                        H6 (###### 六级标题)
                    </label>
                </div>
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button id="cancelBtn" style="
                        padding: 8px 16px;
                        border: 1px solid #ddd;
                        background: white;
                        border-radius: 4px;
                        cursor: pointer;
                    ">取消</button>
                    <button id="confirmBtn" style="
                        padding: 8px 16px;
                        border: none;
                        background: #007bff;
                        color: white;
                        border-radius: 4px;
                        cursor: pointer;
                    ">确认转换</button>
                </div>
            `;

            modal.appendChild(dialog);
            document.body.appendChild(modal);

            // 添加事件监听器
            const confirmBtn = dialog.querySelector('#confirmBtn');
            const cancelBtn = dialog.querySelector('#cancelBtn');

            confirmBtn.addEventListener('click', () => {
                const selectedLevel = parseInt(dialog.querySelector('input[name="headerLevel"]:checked').value);
                document.body.removeChild(modal);
                this.converter.convertQQToMDWithHeaderLevel(selectedLevel);
            });

            cancelBtn.addEventListener('click', () => {
                document.body.removeChild(modal);
            });

            // 点击背景关闭
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    document.body.removeChild(modal);
                }
            });
        }

        /**
         * 显示通知
         * @param {string} message - 消息内容
         * @param {string} type - 消息类型 ('success', 'error', 'info')
         */
        showNotification(message, type = 'info') {
            // 简单的通知实现
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 20px;
                border-radius: 4px;
                color: white;
                font-size: 14px;
                z-index: 10001;
                ${type === 'error' ? 'background: #dc3545;' : 
                  type === 'success' ? 'background: #28a745;' : 
                  'background: #17a2b8;'}
            `;
            notification.textContent = message;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 3000);
        }

        setLoadingState(isLoading) {
            console.log('🔄 Loading state:', isLoading);
        }
    }

    // 简化的主转换器类
    class MainConverter {
        constructor() {
            console.log('🔧 MainConverter constructor called');
            this.setupMarkdownIt();
            this.initializeComponents();
        }

        setupMarkdownIt() {
            console.log('🔧 Setting up markdown-it...');
            if (typeof window.markdownit === 'undefined') {
                console.error('❌ markdown-it not available');
                return;
            }
            this.md = window.markdownit({
                html: false,
                linkify: true,
            }).enable('strikethrough');
            console.log('✅ markdown-it setup complete');
        }

        initializeComponents() {
            console.log('🔧 Initializing components...');
            try {
                // 使用 require 获取模块
                const NotificationSystem = require('NotificationSystem');
                const QQMindMapParser = require('QQMindMapParser');
                const QQToMarkdownConverter = require('QQToMarkdownConverter');
                const MarkdownToQQConverter = require('MarkdownToQQConverter');

                this.notifications = new NotificationSystem();
                this.notifications.addStyles();
                this.qqParser = new QQMindMapParser();
                this.qqToMdConverter = new QQToMarkdownConverter();
                this.mdToQqConverter = new MarkdownToQQConverter(this.md);
                this.interfaceManager = new SimpleInterfaceManager(this);
                this.interfaceManager.init();
                console.log('✅ All components initialized');
            } catch (error) {
                console.error('❌ Error initializing components:', error);
            }
        }

        async convertQQToMD() {
            console.log('🔄 QQ to MD conversion started');
            try {
                this.interfaceManager.setLoadingState(true);
                this.notifications.show('QQ to MD conversion started', 'info');

                const clipboardItems = await navigator.clipboard.read();
                for (const item of clipboardItems) {
                    if (item.types.includes('text/html')) {
                        const blob = await item.getType('text/html');
                        const html = await blob.text();
                        const mindMapData = this.qqParser.extractMindMapData(html);
                        const markdown = this.qqToMdConverter.convert(mindMapData);
                        GM_setClipboard(markdown);
                        this.notifications.success('QQ to MD conversion completed!');
                        return;
                    }
                }
                this.notifications.error('No QQ mind map data found in clipboard');
            } catch (err) {
                console.error('❌ QQ to MD conversion failed:', err);
                this.notifications.error('Conversion failed: ' + err.message);
            } finally {
                this.interfaceManager.setLoadingState(false);
            }
        }

        /**
         * 获取QQ思维导图数据
         * @returns {Array|null} 思维导图数据或null
         */
        async getQQMindMapData() {
            try {
                const clipboardItems = await navigator.clipboard.read();
                for (const item of clipboardItems) {
                    if (item.types.includes('text/html')) {
                        const blob = await item.getType('text/html');
                        const html = await blob.text();
                        return this.qqParser.extractMindMapData(html);
                    }
                }
                return null;
            } catch (err) {
                console.error('❌ Failed to get QQ mind map data:', err);
                return null;
            }
        }

        /**
         * 带header level的QQ到MD转换
         * @param {number} startHeaderLevel - 起始标题层级 (1-6)
         */
        async convertQQToMDWithHeaderLevel(startHeaderLevel = 1) {
            console.log('🔄 QQ to MD conversion with header level started:', startHeaderLevel);
            try {
                this.interfaceManager.setLoadingState(true);
                this.notifications.show(`QQ to MD conversion started (H${startHeaderLevel})`, 'info');

                const mindMapData = await this.getQQMindMapData();
                if (!mindMapData) {
                    this.notifications.error('No QQ mind map data found in clipboard');
                    return;
                }

                const markdown = this.qqToMdConverter.convert(mindMapData, null, startHeaderLevel);
                GM_setClipboard(markdown);
                this.notifications.success(`QQ to MD conversion completed! (Starting from H${startHeaderLevel})`);
            } catch (err) {
                console.error('❌ QQ to MD conversion with header level failed:', err);
                this.notifications.error('Conversion failed: ' + err.message);
            } finally {
                this.interfaceManager.setLoadingState(false);
            }
        }

        async convertMDToQQ() {
            console.log('🔄 MD to QQ conversion started');
            try {
                this.interfaceManager.setLoadingState(true);
                this.notifications.show('MD to QQ conversion started', 'info');

                const markdown = await navigator.clipboard.readText();
                if (!markdown) {
                    this.notifications.error('Clipboard is empty or contains no text');
                    return;
                }

                const mindMapData = this.mdToQqConverter.convert(markdown);
                // 检查 DOMPurify 是否可用
                if (typeof window.DOMPurify === 'undefined') {
                    console.error('❌ DOMPurify not available');
                    this.notifications.error('DOMPurify library not loaded');
                    return;
                }
                const html = window.DOMPurify.sanitize('<div data-mind-map=\'' + JSON.stringify(mindMapData) + '\'></div>');
                const plainText = this.qqParser.generatePlainText(mindMapData);
                
                const htmlBlob = new Blob([html], { type: 'text/html' });
                const textBlob = new Blob([plainText], { type: 'text/plain' });
                
                await navigator.clipboard.write([
                    new ClipboardItem({ 
                        'text/html': htmlBlob, 
                        'text/plain': textBlob 
                    })
                ]);
                
                this.notifications.success('MD to QQ conversion completed!');
            } catch (err) {
                console.error('❌ MD to QQ conversion failed:', err);
                this.notifications.error('Conversion failed: ' + err.message);
            } finally {
                this.interfaceManager.setLoadingState(false);
            }
        }
    }

    // 主函数
    async function main() {
        try {
            console.log('🚀 Main function starting...');
            
            // 等待页面加载
            if (document.readyState === 'complete') {
                console.log('✅ Page already loaded');
            } else {
                console.log('⏳ Waiting for page to load...');
                await new Promise((resolve) => {
                    window.addEventListener('load', resolve);
                });
                console.log('✅ Page loaded');
            }
            
            // 等待3秒确保页面完全初始化
            console.log('⏳ Waiting 3 seconds for page initialization...');
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            console.log('🔧 Creating MainConverter instance...');
            const converter = new MainConverter();

            // 创建全局对象
            const globalObject = {
                converter,
                QQMindMapParser: require('QQMindMapParser'),
                QQToMarkdownConverter: require('QQToMarkdownConverter'),
                MarkdownToQQConverter: require('MarkdownToQQConverter'),
                NotificationSystem: require('NotificationSystem'),
                status: 'ready'
            };

            // 直接赋值到全局作用域
            window.QQMindMap2Obsidian = globalObject;
            
            console.log('✅ Global object created:', window.QQMindMap2Obsidian);
            
            // 验证对象是否真的在全局作用域中
            setTimeout(() => {
                console.log('🔍 Verification - Global object check:', window.QQMindMap2Obsidian);
                if (window.QQMindMap2Obsidian) {
                    console.log('✅ Global object is accessible!');
                } else {
                    console.log('❌ Global object is not accessible!');
                }
            }, 1000);
            
        } catch (error) {
            console.error('❌ Error in main function:', error);
        }
    }

    // 启动主函数
    main();

})(); 