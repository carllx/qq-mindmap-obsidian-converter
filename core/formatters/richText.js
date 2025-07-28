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
                fontStyle: {
                    'italic': '*{content}*'
                },
                fontWeight: {
                    'bold': '**{content}**'
                },
                underline: '[[{content}]]'
            },
            // Markdown到QQ的样式映射
            mdToQq: {
                highlight: { backgroundColor: '#FFF3A1' },
                strikethrough: { strike: true },
                italic: { fontStyle: 'italic' },
                bold: { fontWeight: 'bold' },
                wikilink: { underline: true, color: '#0052D9' },
                link: { underline: true, color: '#0052D9' }
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
        
        // 应用背景色（高亮）
        if (textNode.backgroundColor === '#FFF3A1') {
            content = `==${content}==`;
        }
        
        // 应用删除线
        if (textNode.strike) {
            content = `~~${content}~~`;
        }
        
        // 应用斜体
        if (textNode.fontStyle === 'italic') {
            content = `*${content}*`;
        }
        
        // 应用粗体
        if (textNode.fontWeight === 'bold') {
            content = `**${content}**`;
        }
        
        // 应用下划线（Wiki链接）
        if (textNode.underline) {
            content = `[[${content}]]`;
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

        for (const token of tokens) {
            let content = token.content;
            
            // 处理样式开始标记
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

                // 处理样式结束标记
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

            // 应用累积的样式
            if (content) {
                const finalStyle = this.mergeStyles(styleStack);
                resultNodes.push({ 
                    type: 'text', 
                    text: content, 
                    ...finalStyle 
                });
            }
        }
        
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
                if (textNode.fontStyle === 'italic') {
                    styles.italic = true;
                }
                if (textNode.fontWeight === 'bold') {
                    styles.bold = true;
                }
                if (textNode.underline) {
                    styles.underline = true;
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
        const validStyles = ['backgroundColor', 'strike', 'fontStyle', 'fontWeight', 'underline', 'color'];
        const nodeKeys = Object.keys(textNode);
        
        for (const key of nodeKeys) {
            if (key !== 'text' && key !== 'type' && !validStyles.includes(key)) {
                return false;
            }
        }

        return true;
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RichTextFormatter;
} else if (typeof window !== 'undefined') {
    window.RichTextFormatter = RichTextFormatter;
} 