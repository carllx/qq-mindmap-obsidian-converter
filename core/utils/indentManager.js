/**
 * 标准化缩进管理器
 * 统一处理 Markdown 和 QQ 思维导图之间的缩进转换
 */
class IndentManager {
    constructor() {
        // 标准缩进配置
        this.config = {
            tabSize: 2,           // 修复：改为2个空格，更符合Markdown习惯
            useTabs: false,       // 修复：改为false，使用空格而不是tab
            maxIndentLevel: 10    // 最大缩进级别
        };
    }

    /**
     * 标准化缩进字符串
     * @param {string} text - 原始文本
     * @returns {string} 标准化后的文本
     */
    normalizeIndent(text) {
        const lines = text.split('\n');
        const normalizedLines = lines.map(line => {
            const indentMatch = line.match(/^(\s*)/);
            if (!indentMatch) return line;

            const indentText = indentMatch[1];
            const indentLevel = this.calculateIndentLevel(indentText);
            const normalizedIndent = this.createIndentString(indentLevel);
            
            return normalizedIndent + line.substring(indentMatch[1].length);
        });
        
        return normalizedLines.join('\n');
    }

    /**
     * 计算缩进级别
     * @param {string} indentText - 缩进字符串
     * @returns {number} 缩进级别 (0, 1, 2, ...)
     */
    calculateIndentLevel(indentText) {
        if (!indentText) return 0;
        
        // 统一转换为空格计算
        const spaceCount = indentText.replace(/\t/g, ' '.repeat(this.config.tabSize)).length;
        return Math.floor(spaceCount / this.config.tabSize);
    }

    /**
     * 创建缩进字符串
     * @param {number} level - 缩进级别
     * @returns {string} 缩进字符串
     */
    createIndentString(level) {
        if (level <= 0) return '';
        
        if (this.config.useTabs) {
            return '\t'.repeat(level);
        } else {
            return ' '.repeat(level * this.config.tabSize);
        }
    }

    /**
     * 从 Markdown 行解析缩进信息
     * @param {string} line - Markdown 行
     * @returns {Object} 缩进信息
     */
    parseMarkdownIndent(line) {
        const trimmedLine = line.trim();
        const indentMatch = line.match(/^(\s*)/);
        const indentText = indentMatch ? indentMatch[1] : '';
        
        // 改进列表判断：更精确地识别真正的列表项
        const isHeader = /^(#{1,6})\s+/.test(trimmedLine);
        
        // 判断是否为真正的列表项：
        // 1. 不是标题
        // 2. 以列表标记开头（- * + 或 数字.）
        // 3. 列表标记后必须有空格
        // 4. 排除包含特殊字符的标题行（如 "3. 探索 (Explore) ──"）
        // 5. 排除包含粗体语法的行
        const isList = this.isValidListLine(line, trimmedLine, isHeader);
        
        return {
            originalIndent: indentText,
            level: this.calculateIndentLevel(indentText),
            content: trimmedLine,
            isList: isList,
            isHeader: isHeader
        };
    }

    /**
     * 验证是否为有效的列表行
     * @param {string} line - 原始行
     * @param {string} trimmedLine - 去除首尾空格的行
     * @param {boolean} isHeader - 是否为标题
     * @returns {boolean} 是否为有效列表
     */
    isValidListLine(line, trimmedLine, isHeader) {
        // 如果是标题，不是列表
        if (isHeader) {
            return false;
        }

        // 基本列表匹配模式
        const basicListMatch = line.match(/^(\s*)([-*+]|\d+\.)\s+(.+)$/);
        if (!basicListMatch) {
            return false;
        }

        const [, indent, marker, content] = basicListMatch;
        const trimmedContent = content.trim();

        // 排除整行都是粗体语法的情况（这些可能是误判的粗体文本）
        if (trimmedContent.match(/^[*_]+.*[*_]+$/)) {
            return false;
        }

        // 排除包含奇数个*字符且不以*开头的行
        if (trimmedContent.includes('*') && !trimmedContent.startsWith('*')) {
            const asteriskCount = (trimmedContent.match(/\*/g) || []).length;
            if (asteriskCount % 2 === 1) {
                // 奇数个*字符，可能是粗体语法的一部分
                return false;
            }
        }

        // 排除包含特殊分隔符的行
        if (trimmedContent.includes('──') || trimmedContent.includes('—') || trimmedContent.includes('–')) {
            return false;
        }

        // 验证列表标记后必须有空格
        const markerEndIndex = line.indexOf(marker) + marker.length;
        const afterMarker = line.substring(markerEndIndex);
        if (!afterMarker.startsWith(' ')) {
            return false;
        }

        return true;
    }

    /**
     * 从 QQ 节点获取缩进级别
     * @param {Object} node - QQ 节点
     * @param {number} baseLevel - 基础缩进级别
     * @returns {number} 缩进级别
     */
    getQQNodeIndentLevel(node, baseLevel = 0) {
        // QQ 节点的缩进级别由其层级决定
        return baseLevel;
    }

    /**
     * 验证缩进一致性
     * @param {string} originalText - 原始文本
     * @param {string} convertedText - 转换后文本
     * @returns {Object} 验证结果
     */
    validateIndentConsistency(originalText, convertedText) {
        const originalLines = originalText.split('\n');
        const convertedLines = convertedText.split('\n');
        
        const issues = [];
        
        for (let i = 0; i < Math.min(originalLines.length, convertedLines.length); i++) {
            const originalIndent = this.parseMarkdownIndent(originalLines[i]);
            const convertedIndent = this.parseMarkdownIndent(convertedLines[i]);
            
            if (originalIndent.level !== convertedIndent.level) {
                issues.push({
                    line: i + 1,
                    original: originalIndent.level,
                    converted: convertedIndent.level,
                    content: originalIndent.content.substring(0, 50)
                });
            }
        }
        
        return {
            isValid: issues.length === 0,
            issues: issues
        };
    }

    /**
     * 修复缩进不一致
     * @param {string} text - 需要修复的文本
     * @param {Array} corrections - 修正信息数组
     * @returns {string} 修复后的文本
     */
    fixIndentInconsistencies(text, corrections) {
        const lines = text.split('\n');
        
        corrections.forEach(correction => {
            const lineIndex = correction.line - 1;
            if (lineIndex >= 0 && lineIndex < lines.length) {
                const line = lines[lineIndex];
                const indentInfo = this.parseMarkdownIndent(line);
                const correctIndent = this.createIndentString(correction.correctLevel);
                lines[lineIndex] = correctIndent + indentInfo.content;
            }
        });
        
        return lines.join('\n');
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IndentManager;
} else if (typeof window !== 'undefined') {
    window.IndentManager = IndentManager;
} 