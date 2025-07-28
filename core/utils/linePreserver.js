/**
 * 行格式保持器
 * 专门处理 Markdown 转换过程中的空行和格式保持
 */
class LinePreserver {
    constructor() {
        this.config = {
            preserveEmptyLines: true,    // 是否保持空行
            normalizeSpacing: true,      // 是否标准化间距
            maxConsecutiveEmptyLines: 2  // 最大连续空行数
        };
    }

    /**
     * 分析 Markdown 文档的行结构
     * @param {string} markdown - Markdown 文本
     * @returns {Array} 行结构数组
     */
    analyzeLineStructure(markdown) {
        const lines = markdown.split('\n');
        const structure = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmedLine = line.trim();
            
            structure.push({
                index: i,
                original: line,
                trimmed: trimmedLine,
                isEmpty: trimmedLine === '',
                isHeader: /^(#{1,6})\s+/.test(trimmedLine),
                isList: /^\s*([-*+]|\d+\.)\s+/.test(trimmedLine),
                isSeparator: trimmedLine === '---',
                indentLevel: this.calculateIndentLevel(line),
                shouldPreserve: this.shouldPreserveLine(line, i, lines)
            });
        }
        
        return structure;
    }

    /**
     * 计算缩进级别
     * @param {string} line - 行内容
     * @returns {number} 缩进级别
     */
    calculateIndentLevel(line) {
        const match = line.match(/^(\s*)/);
        if (!match) return 0;
        
        const indentText = match[1];
        return (indentText.match(/\t/g) || []).length;
    }

    /**
     * 判断是否应该保持该行
     * @param {string} line - 行内容
     * @param {number} index - 行索引
     * @param {Array} allLines - 所有行
     * @returns {boolean} 是否应该保持
     */
    shouldPreserveLine(line, index, allLines) {
        const trimmedLine = line.trim();
        
        // 空行处理
        if (trimmedLine === '') {
            // 检查前后行来决定是否保持空行
            const prevLine = index > 0 ? allLines[index - 1].trim() : '';
            const nextLine = index < allLines.length - 1 ? allLines[index + 1].trim() : '';
            
            // 标题后的空行应该保持
            if (prevLine.match(/^(#{1,6})\s+/)) {
                return true;
            }
            
            // 列表项之间的空行应该保持（但不要太多）
            if (prevLine.match(/^\s*[-*+]\s/) && nextLine.match(/^\s*[-*+]\s/)) {
                return true;
            }
            
            // 段落之间的空行应该保持
            if (prevLine !== '' && nextLine !== '' && 
                !prevLine.match(/^(#{1,6})\s+/) && 
                !nextLine.match(/^(#{1,6})\s+/)) {
                return true;
            }
            
            return false;
        }
        
        return true;
    }

    /**
     * 清理和标准化空行
     * @param {Array} structure - 行结构数组
     * @returns {Array} 清理后的行结构
     */
    normalizeEmptyLines(structure) {
        const result = [];
        let consecutiveEmptyCount = 0;
        
        for (const lineInfo of structure) {
            if (lineInfo.isEmpty) {
                consecutiveEmptyCount++;
                if (consecutiveEmptyCount <= this.config.maxConsecutiveEmptyLines) {
                    result.push(lineInfo);
                }
            } else {
                consecutiveEmptyCount = 0;
                result.push(lineInfo);
            }
        }
        
        return result;
    }

    /**
     * 从行结构重建 Markdown
     * @param {Array} structure - 行结构数组
     * @returns {string} 重建的 Markdown
     */
    rebuildMarkdown(structure) {
        return structure
            .filter(lineInfo => lineInfo.shouldPreserve)
            .map(lineInfo => lineInfo.original)
            .join('\n');
    }

    /**
     * 保持原始格式的转换
     * @param {string} originalMarkdown - 原始 Markdown
     * @param {string} convertedContent - 转换后的内容
     * @returns {string} 格式保持后的内容
     */
    preserveFormat(originalMarkdown, convertedContent) {
        // 分析原始文档结构
        const originalStructure = this.analyzeLineStructure(originalMarkdown);
        const convertedLines = convertedContent.split('\n');
        
        // 创建新的结构，保持原始的空行模式
        const newStructure = [];
        let convertedIndex = 0;
        
        for (const originalLine of originalStructure) {
            if (originalLine.isEmpty && originalLine.shouldPreserve) {
                // 保持原始空行
                newStructure.push({ original: '', shouldPreserve: true });
            } else if (!originalLine.isEmpty) {
                // 使用转换后的内容
                if (convertedIndex < convertedLines.length) {
                    newStructure.push({ 
                        original: convertedLines[convertedIndex], 
                        shouldPreserve: true 
                    });
                    convertedIndex++;
                }
            }
        }
        
        // 添加剩余的转换内容
        while (convertedIndex < convertedLines.length) {
            newStructure.push({ 
                original: convertedLines[convertedIndex], 
                shouldPreserve: true 
            });
            convertedIndex++;
        }
        
        return this.rebuildMarkdown(newStructure);
    }
}

// 导出模块
if (typeof window !== 'undefined') {
    window.LinePreserver = LinePreserver;
} 