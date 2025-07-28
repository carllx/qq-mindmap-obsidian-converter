/**
 * Markdown解析器
 * 负责解析Markdown文本结构，识别标题、列表、图片等元素
 */
class MarkdownParser {
    constructor() {
        this.linePatterns = {
            header: /^(#{1,6})\s+(.+)$/,
            list: /^\s*([-*+]|\d+\.)\s+(.+)$/,
            image: /^!\[.*?\]\((.*?)\)$/,
            divider: /^---$/,
            comment: /^<!--(.+?)-->$/,
            commentStart: /^<!--(.+)$/,
            commentEnd: /^(.+?)-->$/
        };
    }

    /**
     * 解析Markdown文本
     * @param {string} markdown - Markdown文本
     * @returns {Array} 解析后的行数组
     */
    parse(markdown) {
        const lines = markdown.replace(/\r/g, '').split('\n');
        const parsedLines = [];
        let inCommentBlock = false;
        let commentContent = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmedLine = line.trim();

            // 处理注释块
            if (inCommentBlock) {
                if (line.includes('-->')) {
                    inCommentBlock = false;
                    commentContent.push(line.substring(0, line.indexOf('-->')));
                    parsedLines.push({
                        type: 'comment',
                        content: commentContent.join('\n'),
                        indent: this.calculateIndent(line),
                        lineNumber: i
                    });
                    commentContent = [];
                } else {
                    commentContent.push(line);
                }
                continue;
            }

            // 处理单行注释
            if (trimmedLine.startsWith('<!--')) {
                if (trimmedLine.endsWith('-->')) {
                    parsedLines.push({
                        type: 'comment',
                        content: trimmedLine.slice(4, -3).trim(),
                        indent: this.calculateIndent(line),
                        lineNumber: i
                    });
                } else {
                    inCommentBlock = true;
                    commentContent.push(line.substring(line.indexOf('<!--') + 4));
                }
                continue;
            }

            // 跳过空行
            if (trimmedLine === '') {
                parsedLines.push({
                    type: 'empty',
                    content: '',
                    indent: 0,
                    lineNumber: i
                });
                continue;
            }

            // 解析各种行类型
            const parsedLine = this.parseLine(line, i);
            if (parsedLine) {
                parsedLines.push(parsedLine);
            }
        }

        return parsedLines;
    }

    /**
     * 解析单行内容
     * @param {string} line - 原始行内容
     * @param {number} lineNumber - 行号
     * @returns {Object} 解析后的行对象
     */
    parseLine(line, lineNumber) {
        const trimmedLine = line.trim();
        const indent = this.calculateIndent(line);

        // 标题
        const headerMatch = trimmedLine.match(this.linePatterns.header);
        if (headerMatch) {
            return {
                type: 'header',
                level: headerMatch[1].length,
                content: headerMatch[2].trim(),
                indent,
                lineNumber
            };
        }

        // 分割线
        if (this.linePatterns.divider.test(trimmedLine)) {
            return {
                type: 'divider',
                content: '---',
                indent,
                lineNumber
            };
        }

        // 图片
        const imageMatch = trimmedLine.match(this.linePatterns.image);
        if (imageMatch) {
            return {
                type: 'image',
                url: imageMatch[1],
                content: trimmedLine,
                indent,
                lineNumber
            };
        }

        // 列表项
        const listMatch = trimmedLine.match(this.linePatterns.list);
        if (listMatch) {
            return {
                type: 'list',
                marker: listMatch[1],
                content: listMatch[2].trim(),
                indent,
                lineNumber
            };
        }

        // 普通文本
        return {
            type: 'text',
            content: trimmedLine,
            indent,
            lineNumber
        };
    }

    /**
     * 计算缩进级别
     * @param {string} line - 行内容
     * @returns {number} 缩进级别
     */
    calculateIndent(line) {
        const indentMatch = line.match(/^(\s*)/);
        const indentText = indentMatch[1];
        return (indentText.match(/\t/g) || []).length + 
               Math.floor(indentText.replace(/\t/g, '').length / 4);
    }

    /**
     * 构建节点层次结构
     * @param {Array} parsedLines - 解析后的行数组
     * @returns {Array} 层次化的节点数组
     */
    buildHierarchy(parsedLines) {
        const forest = [];
        const stack = []; // { node, indentLevel, headerLevel }

        for (const line of parsedLines) {
            if (line.type === 'empty' || line.type === 'comment') {
                // 处理注释
                if (line.type === 'comment' && stack.length > 0) {
                    const parentNode = stack[stack.length - 1].node;
                    if (parentNode.children) {
                        parentNode.children.push({
                            type: 'presentation',
                            content: line.content
                        });
                    }
                }
                continue;
            }

            // 查找父节点
            while (stack.length > 0) {
                const top = stack[stack.length - 1];

                if (line.type === 'header') {
                    if (top.headerLevel > 0 && line.level > top.headerLevel) {
                        break; // 当前是子标题
                    }
                } else {
                    if (line.indent > top.indentLevel) {
                        break; // 当前是缩进的子项
                    }
                    if (top.headerLevel > 0 && line.indent === top.indentLevel) {
                        break; // 当前是标题的内容
                    }
                }
                stack.pop();
            }

            // 创建新节点
            const newNode = this.createNode(line);
            const parentNode = stack.length > 0 ? stack[stack.length - 1].node : null;

            // 附加节点
            if (parentNode) {
                if (!parentNode.children) parentNode.children = [];
                parentNode.children.push(newNode);
            } else {
                forest.push(newNode);
            }

            // 推入栈
            stack.push({
                node: newNode,
                indentLevel: line.indent,
                headerLevel: line.type === 'header' ? line.level : 0
            });
        }

        return forest;
    }

    /**
     * 创建节点对象
     * @param {Object} line - 解析后的行对象
     * @returns {Object} 节点对象
     */
    createNode(line) {
        const baseNode = {
            type: line.type,
            content: line.content,
            lineNumber: line.lineNumber
        };

        switch (line.type) {
            case 'header':
                return {
                    ...baseNode,
                    level: line.level,
                    children: []
                };
            case 'list':
                return {
                    ...baseNode,
                    marker: line.marker,
                    children: []
                };
            case 'image':
                return {
                    ...baseNode,
                    url: line.url,
                    children: []
                };
            case 'divider':
                return {
                    ...baseNode,
                    children: []
                };
            default:
                return {
                    ...baseNode,
                    children: []
                };
        }
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MarkdownParser;
} else if (typeof window !== 'undefined') {
    window.MarkdownParser = MarkdownParser;
} 