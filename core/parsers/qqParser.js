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