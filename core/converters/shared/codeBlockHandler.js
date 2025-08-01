/**
 * 代码块处理器
 * 负责处理代码块的双向转换功能
 */

class CodeBlockHandler {
    /**
     * @param {object} richTextFormatter - 富文本格式化器
     * @param {object} he - he库实例
     */
    constructor(richTextFormatter, he) {
        if (!he || typeof he.encode !== 'function') {
            throw new Error("CodeBlockHandler requires the 'he' library, but it was not provided or is invalid.");
        }
        this.richTextFormatter = richTextFormatter;
        this.he = he;
        
        // 代码块标签定义
        this.CODE_BLOCK_LABEL = {
            id: 'qq-mind-map-code-block-label',
            text: 'code-block',
            backgroundColor: 'rgb(172, 226, 197)',
            color: '#000000'
        };
    }

    /**
     * 生成唯一节点ID
     * @returns {string} 唯一ID
     */
    generateNodeId() {
        return 'node_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 创建代码块节点 (从 md2qq.js 提取)
     * @param {Array} codeLines - 代码行数组
     * @param {string} language - 编程语言
     * @param {object} markdownIt - markdown-it实例
     * @returns {Object} 代码块节点
     */
    createCodeBlockNode(codeLines, language, markdownIt) {
        // 生成QQ思维导图期望的HTML格式
        const title = language ? `\`\`\`${language}` : '```';
        
        // 将代码行转换为QQ思维导图期望的HTML格式
        const htmlContent = this.convertCodeLinesToQQHtml(codeLines, language);
        
        return {
            id: this.generateNodeId(),
            title: this.richTextFormatter.format(title, markdownIt),
            labels: [this.CODE_BLOCK_LABEL],
            notes: { content: htmlContent },
            collapse: false,
            children: { attached: [] }
        };
    }

    /**
     * 将代码行转换为QQ思维导图期望的HTML格式 (从 md2qq.js 提取)
     * @param {Array} codeLines - 代码行数组
     * @param {string} language - 编程语言
     * @returns {string} QQ思维导图格式的HTML
     */
    convertCodeLinesToQQHtml(codeLines, language = '') {
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
     * 处理单行代码，包括缩进和特殊字符 (从 md2qq.js 提取)
     * @param {string} line - 原始代码行
     * @returns {string} 处理后的HTML
     */
    processCodeLine(line) {
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

        // 处理特殊字符
        result = result.replace(/&lt;/g, '\\u{3C}');
        result = result.replace(/&gt;/g, '\\u{3E}');
        result = result.replace(/&amp;/g, '\\u{26}');
        result = result.replace(/&quot;/g, '\\u{22}');
        result = result.replace(/&#39;/g, '\\u{27}');

        // 修复：将双反斜杠转换为单反斜杠以匹配QQ思维导图期望
        result = result.replace(/\\\\u\{/g, '\\u{');
        
        // 修复：将Unicode转义转换为实际字符以匹配QQ思维导图期望
        result = result.replace(/\\u\{([0-9A-F]+)\}/g, (match, hex) => {
            return String.fromCodePoint(parseInt(hex, 16));
        });

        // 处理缩进：将前导空格转换为&nbsp;，使用双重转义
        result = result.replace(/^ +/g, (spaces) => '&amp;nbsp;'.repeat(spaces.length));

        // 处理换行符
        result = result.replace(/\n/g, '\\n');
        result = result.replace(/\r/g, '\\r');
        result = result.replace(/\t/g, '\\t');

        // 添加换行标签
        return result + '<br>';
    }

    /**
     * 转换代码块节点为Markdown (从 qq2md.js 提取)
     * @param {Object} node - 代码块节点
     * @param {object} richTextFormatter - 富文本格式化器
     * @returns {string} Markdown文本
     */
    convertCodeBlock(node, richTextFormatter) {
        const data = node.data || node;
        let markdown = '';

        // 获取代码块标题（语言标识）
        const titleText = richTextFormatter.convertRichTextToMarkdown(data.title).trim();
        
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
     * 从注释中提取代码内容 (从 qq2md.js 提取)
     * @param {string} htmlContent - HTML内容
     * @returns {string} 代码内容
     */
    extractCodeFromNotes(htmlContent) {
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
     * 清理代码内容中的代码块标记 (从 qq2md.js 提取)
     * @param {string} codeContent - 代码内容
     * @returns {string} 清理后的代码内容
     */
    cleanCodeBlockMarkers(codeContent) {
        // 修复：更精确地清理代码块标记
        // 移除开头的代码块标记（包括语言标识）
        codeContent = codeContent.replace(/^```\w*\n?/, '');
        // 移除结尾的代码块标记
        codeContent = codeContent.replace(/```\s*$/, '');
        
        return codeContent;
    }

    /**
     * 解码HTML实体 (从 qq2md.js 提取)
     * @param {string} text - 包含HTML实体的文本
     * @returns {string} 解码后的文本
     */
    decodeHtmlEntities(text) {
        // 使用he库解码HTML实体
        return this.he.decode(text);
    }

    /**
     * 简单的HTML到文本转换 (从 qq2md.js 提取)
     * @param {string} html - HTML内容
     * @returns {string} 纯文本内容
     */
    simpleHtmlToText(html) {
        // 创建临时DOM元素来解析HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        // 提取文本内容
        let text = tempDiv.textContent || tempDiv.innerText || '';
        
        // 清理多余的空白字符
        text = text.replace(/\s+/g, ' ').trim();
        
        return text;
    }
} 