/**
 * 样式处理器
 * 负责处理富文本样式的映射、合并、验证和转换
 */
class StyleProcessor {
    constructor() {
        // QQ到Markdown的样式映射
        this.qqToMdMappings = {
            backgroundColor: {
                '#FFF3A1': '=={content}=='
            },
            strike: '~~{content}~~',
            italic: '*{content}*',
            fontWeight: {
                'bold': '**{content}**',
                700: '**{content}**'
            },
            underline: '<u>{content}</u>'
        };

        // Markdown到QQ的样式映射
        this.mdToQqMappings = {
            highlight: { backgroundColor: '#FFF3A1' },
            strikethrough: { strike: true },
            italic: { italic: true },
            bold: { fontWeight: 700 },
            wikilink: { underline: true, color: '#0052D9' },
            link: { underline: true, color: '#0052D9' },
            code: { fontFamily: 'monospace', backgroundColor: '#F0F0F0' }
        };

        // 有效的样式属性列表
        this.validStyles = [
            'backgroundColor', 'strike', 'italic', 'fontWeight', 
            'underline', 'color', 'fontFamily'
        ];
    }

    /**
     * 应用QQ样式到文本
     * @param {Object} textNode - QQ文本节点
     * @returns {string} 带样式的文本
     */
    applyQQStyles(textNode) {
        let content = textNode.text || '';
        
        // 按照Markdown嵌套规则应用样式：内层样式先应用，外层样式后应用
        // 1. 首先应用内联代码样式（最内层）
        if (textNode.fontFamily === 'monospace') {
            content = `\`${content}\``;
        }
        
        // 2. 应用斜体样式
        if (textNode.italic) {
            content = `*${content}*`;
        }
        
        // 3. 应用高亮样式
        if (textNode.backgroundColor === '#FFF3A1') {
            content = `==${content}==`;
        }
        
        // 4. 应用删除线样式
        if (textNode.strike) {
            content = `~~${content}~~`;
        }
        
        // 5. 应用粗体样式（最外层）
        if (textNode.fontWeight === 'bold' || textNode.fontWeight === 700) {
            content = `**${content}**`;
        }
        
        // 6. 应用下划线样式
        if (textNode.underline) {
            content = `<u>${content}</u>`;
        }
        
        // 7. 应用颜色样式（HTML标签）
        if (textNode.color && textNode.color !== '#000000') {
            content = `<span style="color: ${textNode.color}">${content}</span>`;
        }
        
        // 8. 应用背景色样式（HTML标签）
        if (textNode.backgroundColor && textNode.backgroundColor !== '#FFF3A1') {
            content = `<span style="background-color: ${textNode.backgroundColor}">${content}</span>`;
        }
        
        return content;
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
     * 验证富文本节点
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
        const nodeKeys = Object.keys(textNode);
        
        for (const key of nodeKeys) {
            if (key !== 'text' && key !== 'type' && !this.validStyles.includes(key)) {
                return false;
            }
        }

        return true;
    }

    /**
     * 从Markdown token构建QQ文本节点
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
                    // 开启标签 - 推入完整的当前样式状态
                    case 'strong_open': 
                        styleStack.push({...currentStyle});
                        currentStyle = {...currentStyle, fontWeight: 700};
                        continue;
                        
                    case 'em_open': 
                        styleStack.push({...currentStyle});
                        currentStyle = {...currentStyle, italic: true};
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

                    // 关闭标签 - 恢复到上一个样式状态
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

                    // 内联代码（自包含token）
                    case 'code_inline':
                        resultNodes.push({
                            type: 'text',
                            text: `\`${content}\``, // 保留backtick标记
                            ...currentStyle
                        });
                        continue;

                    // HTML标签处理
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
     * 修复多余的粗体标记
     * @param {string} text - 原始文本
     * @returns {string} 修复后的文本
     */
    fixDuplicateBoldMarkers(text) {
        // 匹配连续的粗体节点，插入空格，确保Obsidian正常渲染
        return text.replace(/\*\*([^*]+)\*\*(?=\*\*)/g, '**$1** ');
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
     * 获取样式映射
     * @param {string} direction - 映射方向 ('qqToMd' 或 'mdToQq')
     * @returns {Object} 样式映射对象
     */
    getStyleMappings(direction) {
        return direction === 'qqToMd' ? this.qqToMdMappings : this.mdToQqMappings;
    }

    /**
     * 验证样式对象
     * @param {Object} styles - 样式对象
     * @returns {boolean} 是否有效
     */
    validateStyles(styles) {
        if (!styles || typeof styles !== 'object') {
            return false;
        }

        const styleKeys = Object.keys(styles);
        return styleKeys.every(key => this.validStyles.includes(key));
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StyleProcessor;
} else if (typeof window !== 'undefined') {
    window.StyleProcessor = StyleProcessor;
} 