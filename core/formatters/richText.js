/**
 * 富文本格式处理器
 * 负责处理富文本格式的转换和样式应用
 */
class RichTextFormatter {
    constructor(qqParser = null) {
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
        
        // 注入 QQMindMapParser 依赖
        this.qqParser = qqParser;
        
        // 如果没有提供 qqParser，尝试从全局获取
        if (!this.qqParser && typeof window !== 'undefined') {
            this.qqParser = window.QQMindMapParser ? new window.QQMindMapParser() : null;
        }
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

        // 获取所有文本节点
        const textNodes = titleObject.children.flatMap(p => 
            p.children?.map(textNode => this.applyQQStyles(textNode)) || []
        );
        
        // 智能合并粗体和内联代码
        let result = this.mergeBoldAndInlineCode(textNodes);
        
        return result;
    }

    /**
     * 智能合并粗体和内联代码，避免产生多余的星号
     * @param {Array} textNodes - 文本节点数组
     * @returns {string} 合并后的文本
     */
    mergeBoldAndInlineCode(textNodes) {
        if (textNodes.length === 0) return '';
        
        let result = '';
        let currentBold = false;
        
        for (let i = 0; i < textNodes.length; i++) {
            const node = textNodes[i];
            const hasInlineCode = node.includes('`');
            const isBold = node.includes('**');
            
            if (isBold && !hasInlineCode) {
                // 纯粗体文本
                if (!currentBold) {
                    result += '**';
                    currentBold = true;
                }
                result += node.replace(/\*\*/g, '');
            } else if (hasInlineCode && !isBold) {
                // 纯内联代码
                if (currentBold) {
                    result += '**';
                    currentBold = false;
                }
                result += node;
            } else if (hasInlineCode && isBold) {
                // 粗体包含内联代码 - 特殊处理
                if (!currentBold) {
                    result += '**';
                    currentBold = true;
                }
                // 移除内联代码的粗体标记，保留反引号
                result += node.replace(/\*\*/g, '');
            } else {
                // 普通文本
                if (currentBold) {
                    result += '**';
                    currentBold = false;
                }
                result += node;
            }
        }
        
        // 关闭未闭合的粗体标记
        if (currentBold) {
            result += '**';
        }
        
        return result;
    }

    /**
     * 修复粗体文字中包含内联代码时的格式问题
     * @param {string} text - 原始文本
     * @returns {string} 修复后的文本
     */
    fixBoldInlineCodeFormatting(text) {
        // 匹配模式：**`code`** 或 ****`code`****
        // 修复为：**`code`**
        return text.replace(/\*\*\*\*`([^`]+)`\*\*\*\*/g, '**`$1`**');
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
        
        // 修复：智能处理粗体和内联代码的组合
        const isBold = textNode.fontWeight === 'bold' || textNode.fontWeight === 700;
        const isMonospace = textNode.fontFamily === 'monospace';
        
        // 如果同时具有粗体和等宽字体属性，处理为粗体包含内联代码
        if (isBold && isMonospace) {
            content = `**\`${content}\`**`; // 粗体包含内联代码
        } else if (isMonospace) {
            content = `\`${content}\``; // 内联代码
        } else if (isBold) {
            content = `**${content}**`; // 粗体
        }
        
        if (textNode.underline) {
            content = `<u>${content}</u>`; // 修复：使用HTML标签而不是[[]]
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

                    // 自包含的样式token
                    case 'strong':
                        // 处理粗体内容
                        if (token.children && token.children.length > 0) {
                            // 递归处理子tokens
                            const childStyle = {...currentStyle, fontWeight: 700};
                            const childNodes = this.buildQQNodesFromTokens(token.children);
                            childNodes.forEach(node => {
                                resultNodes.push({
                                    ...node,
                                    ...childStyle
                                });
                            });
                        } else {
                            resultNodes.push({
                                type: 'text',
                                text: content,
                                ...currentStyle,
                                fontWeight: 700
                            });
                        }
                        continue;

                    case 'em':
                        // 处理斜体内容
                        if (token.children && token.children.length > 0) {
                            const childStyle = {...currentStyle, italic: true};
                            const childNodes = this.buildQQNodesFromTokens(token.children);
                            childNodes.forEach(node => {
                                resultNodes.push({
                                    ...node,
                                    ...childStyle
                                });
                            });
                        } else {
                            resultNodes.push({
                                type: 'text',
                                text: content,
                                ...currentStyle,
                                italic: true
                            });
                        }
                        continue;

                    // 内联代码（自包含token）- 修复：保留backtick标记
                    case 'code_inline':
                        resultNodes.push({
                            type: 'text',
                            text: content, // 不添加反引号，让applyQQStyles处理
                            fontFamily: 'monospace' // 标记为等宽字体，不继承粗体样式
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
                        if (content && content.trim()) {
                            resultNodes.push({
                                type: 'text',
                                text: content,
                                ...currentStyle
                            });
                        }
                        continue;
                        
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
                        resultNodes.push({
                            type: 'text',
                            text: content,
                            ...currentStyle
                        });
                        continue;

                    // 其他类型的token，尝试处理子tokens
                    default:
                        if (token.children && token.children.length > 0) {
                            // 递归处理子tokens
                            const childNodes = this.buildQQNodesFromTokens(token.children);
                            childNodes.forEach(node => {
                                resultNodes.push({
                                    ...node,
                                    ...currentStyle
                                });
                            });
                        } else if (content && content.trim()) {
                            // 如果没有子tokens但有内容，作为普通文本处理
                            resultNodes.push({
                                type: 'text',
                                text: content,
                                ...currentStyle
                            });
                        }
                        continue;
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
     * 提取QQ文本内容 - 使用 QQMindMapParser 的方法
     * @param {Object} titleObject - QQ标题对象
     * @returns {string} 提取的文本内容
     */
    extractQQTextContent(titleObject) {
        // 优先使用注入的 QQMindMapParser
        if (this.qqParser && typeof this.qqParser.extractTextContent === 'function') {
            return this.qqParser.extractTextContent(titleObject);
        }
        
        // 降级到原始实现
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
     * 提取QQ文本样式 - 使用 QQMindMapParser 的方法
     * @param {Object} titleObject - QQ标题对象
     * @returns {Object} 样式对象
     */
    extractQQTextStyles(titleObject) {
        // 优先使用注入的 QQMindMapParser
        if (this.qqParser && typeof this.qqParser.extractTextStyles === 'function') {
            return this.qqParser.extractTextStyles(titleObject);
        }
        
        // 降级到原始实现
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