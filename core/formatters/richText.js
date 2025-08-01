/**
 * 富文本格式处理器
 * 负责处理富文本格式的转换和样式应用
 */
class RichTextFormatter {
    constructor() {
        this.styleMappings = {
            // QQ到Markdown的样式映射
            qqToMd: {
                backgroundColor: {
                    '#FFF3A1': '=={content}=='
                },
                strike: '~~{content}~~',
                italic: '*{content}*', // 修复：使用 italic 而不是 fontStyle
                fontWeight: {
                    'bold': '**{content}**',
                    700: '**{content}**'
                },
                underline: '<u>{content}</u>' // 修复：使用HTML标签而不是[[]]
            },
            // Markdown到QQ的样式映射
            mdToQq: {
                highlight: { backgroundColor: '#FFF3A1' },
                strikethrough: { strike: true },
                italic: { italic: true }, // 修复：使用 italic 而不是 fontStyle
                bold: { fontWeight: 700 }, // 修复：使用数值700
                wikilink: { underline: true, color: '#0052D9' },
                link: { underline: true, color: '#0052D9' },
                code: { fontFamily: 'monospace', backgroundColor: '#F0F0F0' }
            }
        };
    }

    /**
     * 将QQ富文本对象转换为Markdown
     * @param {Object|string} titleObject - QQ标题对象或字符串
     * @returns {string} Markdown文本
     */
    convertQQToMarkdown(titleObject) {
        if (typeof titleObject === 'string') {
            return titleObject;
        }
        
        if (!titleObject?.children) {
            return '';
        }

        return titleObject.children.flatMap(p => 
            p.children?.map(textNode => this.applyQQStyles(textNode)) || []
        ).join('');
    }

    /**
     * 应用QQ样式到文本
     * @param {Object} textNode - QQ文本节点
     * @returns {string} 带样式的文本
     */
    applyQQStyles(textNode) {
        let content = textNode.text || '';
        
        // 修复：使用正确的属性名称和标准Markdown格式
        if (textNode.backgroundColor === '#FFF3A1') {
            content = `==${content}==`; // 高亮格式
        }
        
        if (textNode.strike) {
            content = `~~${content}~~`; // 删除线
        }
        
        if (textNode.italic) { // 修复：使用 italic 而不是 fontStyle === 'italic'
            content = `*${content}*`; // 斜体
        }
        
        if (textNode.fontWeight === 'bold' || textNode.fontWeight === 700) { // 修复：支持字符串和数值
            content = `**${content}**`; // 粗体
        }
        
        if (textNode.underline) {
            content = `<u>${content}</u>`; // 修复：使用HTML标签而不是[[]]
        }
        
        // 添加对更多格式的支持
        if (textNode.fontFamily === 'monospace') {
            content = `\`${content}\``; // 内联代码
        }
        
        if (textNode.color && textNode.color !== '#000000') {
            // 对于有颜色的文本，使用HTML标签保持颜色信息
            content = `<span style="color: ${textNode.color}">${content}</span>`;
        }
        
        if (textNode.backgroundColor && textNode.backgroundColor !== '#FFF3A1') {
            // 对于有背景色的文本，使用HTML标签保持背景色信息
            content = `<span style="background-color: ${textNode.backgroundColor}">${content}</span>`;
        }
        
        return content;
    }

    /**
     * 从Markdown tokens构建QQ富文本节点
     * @param {Array} tokens - Markdown tokens
     * @returns {Array} QQ文本节点数组
     */
    buildQQNodesFromTokens(tokens) {
        const resultNodes = [];
        const styleStack = [];
        let currentStyle = {};

        // 递归处理嵌套的tokens
        const processTokens = (tokenList) => {
            for (const token of tokenList) {
                let content = token.content;
                
                // 处理样式开始标记
                switch (token.type) {
                    // 开启标签 - 修正：推入完整的当前样式状态
                    case 'strong_open': 
                        styleStack.push({...currentStyle});
                        currentStyle = {...currentStyle, fontWeight: 700};
                        continue;
                        
                    case 'em_open': 
                        styleStack.push({...currentStyle});
                        currentStyle = {...currentStyle, italic: true}; // 修复：使用 italic 而不是 fontStyle
                        continue;
                        
                    case 's_open': 
                        styleStack.push({...currentStyle});
                        currentStyle = {...currentStyle, strike: true};
                        continue;
                        
                    case 'highlight_open': 
                        styleStack.push({...currentStyle});
                        currentStyle = {...currentStyle, backgroundColor: '#FFF3A1'};
                        continue;
                        
                    case 'wikilink_open': 
                    case 'link_open': 
                        styleStack.push({...currentStyle});
                        currentStyle = {...currentStyle, underline: true, color: '#0052D9'};
                        continue;

                    // 关闭标签 - 修正：恢复到上一个样式状态
                    case 'strong_close':
                    case 'em_close':
                    case 's_close':
                    case 'highlight_close':
                    case 'wikilink_close':
                    case 'link_close': 
                        if (styleStack.length > 0) {
                            currentStyle = styleStack.pop();
                        } else {
                            currentStyle = {};
                        }
                        continue;

                    // 内联代码（自包含token）
                    case 'code_inline':
                        const codeStyle = { 
                            fontFamily: 'monospace', 
                            backgroundColor: '#F0F0F0' 
                        };
                        resultNodes.push({
                            type: 'text',
                            text: content,
                            ...currentStyle,
                            ...codeStyle
                        });
                        continue;

                    // HTML标签处理 - 修正：改进HTML标签解析
                    case 'html_inline':
                        if (content.includes('<u>')) {
                            styleStack.push({...currentStyle});
                            currentStyle = {...currentStyle, underline: true};
                            continue;
                        } else if (content.includes('</u>')) {
                            if (styleStack.length > 0) {
                                currentStyle = styleStack.pop();
                            }
                            continue;
                        }
                        // 其他HTML内容作为文本处理
                        break;

                    // 文本内容
                    case 'text': 
                        break;
                        
                    // 链接（自包含）
                    case 'link':
                        const linkStyle = { underline: true, color: '#0052D9' };
                        resultNodes.push({
                            type: 'text',
                            text: content,
                            ...currentStyle,
                            ...linkStyle
                        });
                        continue;
                        
                    // 图片处理
                    case 'image':
                        content = content || 'image';
                        break;
                        
                    // HTML块
                    case 'html_block':
                        break;
                        
                    // 处理嵌套的inline token
                    case 'inline':
                        if (token.children) {
                            processTokens(token.children);
                        }
                        continue;
                        
                    default: 
                        continue;
                }

                // 处理有内容的token - 修正：使用当前样式状态
                if (content) {
                    const textNode = {
                        type: 'text', 
                        text: content, 
                        ...currentStyle
                    };
                    resultNodes.push(textNode);
                }
            }
        };

        processTokens(tokens);
        return resultNodes;
    }

    /**
     * 合并样式栈
     * @param {Array} styleStack - 样式栈
     * @returns {Object} 合并后的样式对象
     */
    mergeStyles(styleStack) {
        return styleStack.reduce((acc, style) => ({ ...acc, ...style }), {});
    }

    /**
     * 创建QQ富文本节点结构
     * @param {Array} textNodes - 文本节点数组
     * @returns {Object} QQ富文本节点
     */
    createQQRichTextNode(textNodes) {
        if (textNodes.length === 0) {
            textNodes.push({ type: 'text', text: '' });
        }

        return {
            children: [{ 
                type: 'paragraph', 
                children: textNodes 
            }],
            type: 'document',
        };
    }

    /**
     * 提取QQ文本内容
     * @param {Object} titleObject - QQ标题对象
     * @returns {string} 纯文本内容
     */
    extractQQTextContent(titleObject) {
        if (typeof titleObject === 'string') {
            return titleObject;
        }
        
        if (!titleObject?.children) {
            return '';
        }

        return titleObject.children
            .flatMap(p => p.children?.map(t => t.text || '') || [])
            .join('');
    }

    /**
     * 提取QQ文本样式
     * @param {Object} titleObject - QQ标题对象
     * @returns {Object} 样式对象
     */
    extractQQTextStyles(titleObject) {
        const styles = {};
        
        if (!titleObject?.children) {
            return styles;
        }

        titleObject.children.forEach(p => {
            p.children?.forEach(textNode => {
                if (textNode.backgroundColor === '#FFF3A1') {
                    styles.highlight = true;
                }
                if (textNode.strike) {
                    styles.strikethrough = true;
                }
                if (textNode.italic) { // 修复：使用 italic 而不是 fontStyle
                    styles.italic = true;
                }
                if (textNode.fontWeight === 700) { // 修复：使用数值700
                    styles.bold = true;
                }
            });
        });
        
        return styles;
    }

    /**
     * 验证富文本格式
     * @param {Object} textNode - 文本节点
     * @returns {boolean} 是否有效
     */
    validateRichTextNode(textNode) {
        if (!textNode || typeof textNode !== 'object') {
            return false;
        }

        // 检查必需的属性
        if (typeof textNode.text !== 'string') {
            return false;
        }

        // 检查样式属性的有效性
        const validStyles = ['backgroundColor', 'strike', 'italic', 'fontWeight', 'underline', 'color', 'fontFamily'];
        const nodeKeys = Object.keys(textNode);
        
        for (const key of nodeKeys) {
            if (key !== 'text' && key !== 'type' && !validStyles.includes(key)) {
                return false;
            }
        }

        return true;
    }

    /**
     * 格式化Markdown文本为QQ富文本节点
     * @param {string} markdown - Markdown文本
     * @param {object} markdownIt - markdown-it实例
     * @returns {Object} QQ富文本节点
     */
    format(markdown, markdownIt) {
        const trimmedMarkdown = markdown.trim();
        if (trimmedMarkdown === '') {
            return {
                children: [{ type: 'paragraph', children: [{type: 'text', text: ''}] }],
                type: 'document',
            };
        }

        if (!markdownIt) {
            // 如果没有提供markdownIt，返回简单的文本节点
            return {
                children: [{ type: 'paragraph', children: [{type: 'text', text: trimmedMarkdown}] }],
                type: 'document',
            };
        }

        const tokens = markdownIt.parseInline(trimmedMarkdown, {});
        const qqTextNodes = this.buildQQNodesFromTokens(tokens);

        if (qqTextNodes.length === 0) {
            qqTextNodes.push({ type: 'text', text: trimmedMarkdown });
        }

        return this.createQQRichTextNode(qqTextNodes);
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RichTextFormatter;
} else if (typeof window !== 'undefined') {
    window.RichTextFormatter = RichTextFormatter;
} 