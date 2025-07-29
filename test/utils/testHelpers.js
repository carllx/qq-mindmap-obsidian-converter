/**
 * 测试工具模块
 * 提供通用的测试辅助函数和验证方法
 */

// 模拟环境
const mockMarkdownIt = {
    parseInline: (text) => {
        return [{ type: 'text', content: text }];
    }
};

// 模拟IndentManager
class MockIndentManager {
    parseMarkdownIndent(line) {
        const trimmedLine = line.trim();
        const indentMatch = line.match(/^(\s*)/);
        const indentText = indentMatch ? indentMatch[1] : '';
        
        const isHeader = /^(#{1,6})\s+/.test(trimmedLine);
        const isList = !isHeader && /^\s*([-*+]|\d+\.)\s+/.test(trimmedLine);
        
        return {
            originalIndent: indentText,
            level: indentText.length,
            content: trimmedLine,
            isList: isList,
            isHeader: isHeader
        };
    }
    
    createIndentString(level) {
        return ' '.repeat(level * 4);
    }
}

// 测试验证器
class TestValidator {
    /**
     * 验证节点结构
     * @param {Object} node - QQ节点
     * @param {Object} expected - 期望的结构
     * @returns {Object} 验证结果
     */
    static validateNodeStructure(node, expected) {
        const result = {
            isValid: true,
            errors: [],
            warnings: []
        };

        // 验证标题
        if (expected.title) {
            const actualTitle = this.extractNodeTitle(node);
            if (actualTitle !== expected.title) {
                result.isValid = false;
                result.errors.push(`标题不匹配: 期望 "${expected.title}", 实际 "${actualTitle}"`);
            }
        }

        // 验证标签
        if (expected.labels) {
            const actualLabels = node.labels?.map(l => l.text) || [];
            const missingLabels = expected.labels.filter(label => !actualLabels.includes(label));
            if (missingLabels.length > 0) {
                result.isValid = false;
                result.errors.push(`缺少标签: ${missingLabels.join(', ')}`);
            }
        }

        // 验证子节点数量
        if (expected.childCount !== undefined) {
            const actualChildCount = node.children?.attached?.length || 0;
            if (actualChildCount !== expected.childCount) {
                result.isValid = false;
                result.errors.push(`子节点数量不匹配: 期望 ${expected.childCount}, 实际 ${actualChildCount}`);
            }
        }

        return result;
    }

    /**
     * 验证转换完整性
     * @param {string} original - 原始Markdown
     * @param {string} converted - 转换后的Markdown
     * @returns {Object} 验证结果
     */
    static validateConversionIntegrity(original, converted) {
        const result = {
            isValid: true,
            errors: [],
            warnings: []
        };

        // 检查关键内容是否保留
        const keyContent = this.extractKeyContent(original);
        for (const content of keyContent) {
            if (!converted.includes(content)) {
                result.warnings.push(`可能丢失内容: "${content}"`);
            }
        }

        // 检查结构完整性
        const originalStructure = this.analyzeStructure(original);
        const convertedStructure = this.analyzeStructure(converted);
        
        if (originalStructure.headerCount !== convertedStructure.headerCount) {
            result.errors.push(`标题数量不匹配: 原始 ${originalStructure.headerCount}, 转换后 ${convertedStructure.headerCount}`);
            result.isValid = false;
        }

        return result;
    }

    /**
     * 验证双向转换
     * @param {string} original - 原始Markdown
     * @param {Function} mdToQQ - MD转QQ函数
     * @param {Function} qqToMD - QQ转MD函数
     * @returns {Object} 验证结果
     */
    static validateBidirectionalConversion(original, mdToQQ, qqToMD) {
        const result = {
            isValid: true,
            errors: [],
            warnings: []
        };

        try {
            // MD -> QQ
            const qqNodes = mdToQQ(original);
            
            // QQ -> MD
            const convertedMD = qqToMD(qqNodes);
            
            // 验证完整性
            const integrityResult = this.validateConversionIntegrity(original, convertedMD);
            result.errors.push(...integrityResult.errors);
            result.warnings.push(...integrityResult.warnings);
            
            if (!integrityResult.isValid) {
                result.isValid = false;
            }

        } catch (error) {
            result.isValid = false;
            result.errors.push(`转换过程出错: ${error.message}`);
        }

        return result;
    }

    /**
     * 提取节点标题
     * @param {Object} node - QQ节点
     * @returns {string} 标题文本
     */
    static extractNodeTitle(node) {
        if (typeof node.title === 'string') {
            return node.title;
        }
        if (node.title?.children) {
            return node.title.children.flatMap(p => 
                p.children?.map(textNode => textNode.text || '') || []
            ).join('');
        }
        return '';
    }

    /**
     * 提取关键内容
     * @param {string} markdown - Markdown文本
     * @returns {Array} 关键内容数组
     */
    static extractKeyContent(markdown) {
        const keyContent = [];
        
        // 提取标题
        const headerMatches = markdown.match(/^#{1,6}\s+(.+)$/gm);
        if (headerMatches) {
            keyContent.push(...headerMatches.map(match => match.replace(/^#{1,6}\s+/, '')));
        }
        
        // 提取代码块内容
        const codeMatches = markdown.match(/```[\s\S]*?```/g);
        if (codeMatches) {
            keyContent.push(...codeMatches.map(code => code.replace(/```.*?\n/, '').replace(/```$/, '')));
        }
        
        return keyContent;
    }

    /**
     * 分析结构
     * @param {string} markdown - Markdown文本
     * @returns {Object} 结构信息
     */
    static analyzeStructure(markdown) {
        const lines = markdown.split('\n');
        let headerCount = 0;
        let codeBlockCount = 0;
        let listItemCount = 0;
        
        for (const line of lines) {
            if (/^#{1,6}\s+/.test(line)) {
                headerCount++;
            }
            if (/^```/.test(line)) {
                codeBlockCount++;
            }
            if (/^\s*[-*+]\s+/.test(line)) {
                listItemCount++;
            }
        }
        
        return {
            headerCount,
            codeBlockCount,
            listItemCount,
            totalLines: lines.length
        };
    }
}

// 性能测试工具
class PerformanceTester {
    /**
     * 测试转换性能
     * @param {Function} converter - 转换函数
     * @param {string} testData - 测试数据
     * @param {number} iterations - 迭代次数
     * @returns {Object} 性能结果
     */
    static testPerformance(converter, testData, iterations = 100) {
        const startTime = process.hrtime.bigint();
        
        for (let i = 0; i < iterations; i++) {
            converter(testData);
        }
        
        const endTime = process.hrtime.bigint();
        const duration = Number(endTime - startTime) / 1000000; // 转换为毫秒
        
        return {
            totalTime: duration,
            averageTime: duration / iterations,
            iterations: iterations,
            throughput: iterations / (duration / 1000) // 每秒处理次数
        };
    }
}

// 导出工具
module.exports = {
    mockMarkdownIt,
    MockIndentManager,
    TestValidator,
    PerformanceTester
}; 