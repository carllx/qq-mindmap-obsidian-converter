/**
 * 富文本格式处理器
 * 负责处理富文本格式的转换和样式应用
 */
class RichTextFormatter {
    constructor(qqParser = null) {
        // 注入 QQMindMapParser 依赖
        this.qqParser = qqParser;
        
        // 如果没有提供 qqParser，尝试从全局获取
        if (!this.qqParser && typeof window !== 'undefined') {
            this.qqParser = window.QQMindMapParser ? new window.QQMindMapParser() : null;
        }

        // 创建样式处理器
        if (typeof StyleProcessor !== 'undefined') {
            this.styleProcessor = new StyleProcessor();
        } else if (typeof window !== 'undefined' && window.StyleProcessor) {
            this.styleProcessor = new window.StyleProcessor();
        } else {
            console.warn('StyleProcessor not available, using fallback implementation');
            this.styleProcessor = null;
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

        let result = titleObject.children.flatMap(p => 
            p.children?.map(textNode => this.applyQQStyles(textNode)) || []
        ).join('');
        
        // 后处理：修复多余的粗体标记
        result = this.fixDuplicateBoldMarkers(result);
        
        return result;
    }

    /**
     * 修复多余的粗体标记
     * 解决粗体文本中包含内联代码时产生多余星号的问题
     * @param {string} text - 原始文本
     * @returns {string} 修复后的文本
     */
    fixDuplicateBoldMarkers(text) {
        if (this.styleProcessor) {
            return this.styleProcessor.fixDuplicateBoldMarkers(text);
        }
        
        // 降级实现
        return text.replace(/\*\*([^*]+)\*\*(?=\*\*)/g, '**$1** ');
    }

    /**
     * 应用QQ样式到文本
     * @param {Object} textNode - QQ文本节点
     * @returns {string} 带样式的文本
     */
    applyQQStyles(textNode) {
        if (this.styleProcessor) {
            return this.styleProcessor.applyQQStyles(textNode);
        }
        
        // 降级实现
        let content = textNode.text || '';
        
        if (textNode.backgroundColor === '#FFF3A1') {
            content = `==${content}==`;
        }
        
        if (textNode.strike) {
            content = `~~${content}~~`;
        }
        
        if (textNode.italic) {
            content = `*${content}*`;
        }
        
        if (textNode.fontWeight === 'bold' || textNode.fontWeight === 700) {
            content = `**${content}**`;
        }
        
        if (textNode.underline) {
            content = `<u>${content}</u>`;
        }
        
        if (textNode.fontFamily === 'monospace') {
            content = `\`${content}\``;
        }
        
        if (textNode.color && textNode.color !== '#000000') {
            content = `<span style="color: ${textNode.color}">${content}</span>`;
        }
        
        if (textNode.backgroundColor && textNode.backgroundColor !== '#FFF3A1') {
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
        if (this.styleProcessor) {
            return this.styleProcessor.buildQQNodesFromTokens(tokens);
        }
        
        // 降级实现 - 简化版本
        const resultNodes = [];
        
        for (const token of tokens) {
            if (token.type === 'text' && token.content && token.content.trim()) {
                resultNodes.push({
                    type: 'text',
                    text: token.content
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
        if (this.styleProcessor) {
            return this.styleProcessor.mergeStyles(styleStack);
        }
        
        // 降级实现
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
        if (this.styleProcessor) {
            return this.styleProcessor.extractQQTextStyles(titleObject);
        }
        
        // 降级实现
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
                if (textNode.italic) {
                    styles.italic = true;
                }
                if (textNode.fontWeight === 700) {
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
        if (this.styleProcessor) {
            return this.styleProcessor.validateRichTextNode(textNode);
        }
        
        // 降级实现
        if (!textNode || typeof textNode !== 'object') {
            return false;
        }

        if (typeof textNode.text !== 'string') {
            return false;
        }

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