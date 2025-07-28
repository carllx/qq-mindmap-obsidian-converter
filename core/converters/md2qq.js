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

        for (const line of lines) {
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
            
            // 推入栈
            stack.push({ 
                node: newNode, 
                indentLevel: lineInfo.indent, 
                isText: lineInfo.isText, 
                headerLevel: lineInfo.headerLevel 
            });
        }
        
        return forest;
    }

    /**
     * 解析行信息
     * @param {string} line - 原始行内容
     * @returns {Object} 行信息对象
     */
    parseLine(line) {
        // 使用标准化的缩进管理器
        const indentInfo = this.indentManager.parseMarkdownIndent(line);
        
        const headerMatch = indentInfo.content.match(/^(#{1,6})\s+(.+)$/);
        const currentHeaderLevel = headerMatch ? headerMatch[1].length : 0;

        const isList = indentInfo.isList;
        const isText = !isList && !currentHeaderLevel;

        return {
            trimmedLine: indentInfo.content,
            indent: indentInfo.level,
            headerLevel: currentHeaderLevel,
            isList,
            isText,
            headerMatch,
            imageMatch: indentInfo.content.match(/^!\[.*?\]\((.*?)\)$/)
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
            return { title: '---', children: { attached: [] } };
        } else if (imageMatch) {
            return { 
                title: '', 
                images: [{ 
                    id: '', 
                    w: 200, 
                    h: 200, 
                    ow: 200, 
                    oh: 200, 
                    url: imageMatch[1] 
                }], 
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