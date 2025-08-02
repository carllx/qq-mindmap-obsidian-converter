/**
 * 节点管理器
 * 负责处理节点的创建、查找、附加等操作
 */

class NodeManager {
    /**
     * 生成唯一节点ID
     * @returns {string} 唯一ID
     */
    generateNodeId() {
        return 'node_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 创建节点 (从 md2qq.js 提取)
     * @param {Object} lineInfo - 行信息
     * @param {Object} richTextFormatter - 富文本格式化器
     * @param {Object} markdownIt - markdown-it实例
     * @param {Object} labels - 标签定义
     * @returns {Object} 节点数据
     */
    createNode(lineInfo, richTextFormatter, markdownIt, labels) {
        const nodeId = this.generateNodeId();
        
        if (lineInfo.type === 'header') {
            return {
                id: nodeId,
                title: richTextFormatter.format(lineInfo.content, markdownIt),
                labels: [labels.HEADER_LABEL],
                collapse: false,
                children: { attached: [] }
            };
        } else if (lineInfo.type === 'divider') {
            return {
                id: nodeId,
                title: '---',
                labels: [labels.DIVIDER_LABEL],
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
                    w: 80,
                    h: 80,
                    ow: 80,
                    oh: 80,
                    url: imageUrl
                }], 
                notes: { 
                    content: `<p>Image Alt: ${altText}</p>` 
                },
                collapse: false,
                children: { attached: [] } 
            };
        } else {
            // 修复：正确处理列表项内容
            let content = lineInfo.content;
            
            // 如果是列表项，保留列表标记以便QQtoMD转换时准确识别
            if (lineInfo.type === 'list' && lineInfo.listMarker) {
                // 在内容前添加列表标记
                content = `${lineInfo.listMarker} ${content}`;
            }
            
            return { 
                id: nodeId,
                title: richTextFormatter.format(content, markdownIt), 
                collapse: false,
                children: { attached: [] },
                originalIndent: lineInfo.indent
            };
        }
    }

    /**
     * 查找父节点 (从 md2qq.js 提取)
     * @param {Array} stack - 节点栈
     * @param {Object} lineInfo - 行信息
     * @returns {Object} 父节点信息
     */
    findParentNode(stack, lineInfo) {
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
     * 附加节点 (从 md2qq.js 提取)
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
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NodeManager;
} else if (typeof window !== 'undefined') {
    window.NodeManager = NodeManager;
} 