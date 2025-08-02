/**
 * 内联代码处理测试
 * 验证backtick内联代码是否按照普通文字处理
 */

// 模拟浏览器环境
if (typeof window === 'undefined') {
    global.window = {};
}

// 导入依赖
const MarkdownToQQConverter = require('../core/converters/md2qq.js');
const RichTextFormatter = require('../core/formatters/richText.js');

// 模拟依赖
const mockMarkdownIt = {
    parse: (text) => {
        return [{ type: 'text', content: text }];
    },
    parseInline: (text) => {
        // 简单的内联解析，处理内联代码
        const tokens = [];
        let currentIndex = 0;
        
        // 处理内联代码语法
        while (currentIndex < text.length) {
            const codeMatch = text.slice(currentIndex).match(/`([^`]+)`/);
            if (codeMatch) {
                if (currentIndex < codeMatch.index) {
                    tokens.push({
                        type: 'text',
                        content: text.slice(currentIndex, currentIndex + codeMatch.index)
                    });
                }
                tokens.push({
                    type: 'code_inline',
                    content: codeMatch[1]
                });
                currentIndex += codeMatch.index + codeMatch[0].length;
            } else {
                const remainingText = text.slice(currentIndex);
                if (remainingText.trim()) {
                    tokens.push({
                        type: 'text',
                        content: remainingText
                    });
                }
                break;
            }
        }
        
        return tokens.length > 0 ? tokens : [{ type: 'text', content: text }];
    }
};

const mockHe = {
    encode: (text) => text,
    decode: (text) => text
};

// 测试用例
const testCases = [
    {
        name: "简单内联代码",
        input: "这是一个`代码`示例",
        description: "内联代码应该按照普通文字处理"
    },
    {
        name: "内联代码在开头",
        input: "`代码`在开头",
        description: "开头的内联代码应该按照普通文字处理"
    },
    {
        name: "内联代码在结尾",
        input: "在结尾的`代码`",
        description: "结尾的内联代码应该按照普通文字处理"
    },
    {
        name: "多个内联代码",
        input: "`代码1`和`代码2`",
        description: "多个内联代码都应该按照普通文字处理"
    },
    {
        name: "内联代码包含特殊字符",
        input: "`console.log('hello')`",
        description: "包含特殊字符的内联代码应该按照普通文字处理"
    }
];

// 测试函数
function testInlineCodeProcessing() {
    console.log('🧪 开始内联代码处理测试...\n');
    
    const mdToQqConverter = new MarkdownToQQConverter(mockMarkdownIt, mockHe);
    const richTextFormatter = new RichTextFormatter(null);
    
    let passedTests = 0;
    let totalTests = testCases.length;
    
    testCases.forEach((testCase, index) => {
        console.log(`📋 测试 ${index + 1}: ${testCase.name}`);
        console.log(`   描述: ${testCase.description}`);
        console.log(`   输入: "${testCase.input}"`);
        
        try {
            // 步骤1: 解析行
            const lineInfo = mdToQqConverter.parseLine(testCase.input);
            console.log(`   解析结果: type=${lineInfo.type}, content="${lineInfo.content}"`);
            
            // 步骤2: 富文本格式化
            const tokens = mockMarkdownIt.parseInline(testCase.input);
            console.log(`   parseInline输出:`, JSON.stringify(tokens, null, 2));
            
            const qqTextNodes = richTextFormatter.buildQQNodesFromTokens(tokens);
            console.log(`   buildQQNodesFromTokens输出:`, JSON.stringify(qqTextNodes, null, 2));
            
            // 验证内联代码是否按照普通文字处理，并保留backtick标记
            let hasInlineCode = false;
            let hasSpecialFormatting = false;
            let hasBackticks = false;
            
            qqTextNodes.forEach(node => {
                if (node.text && (node.text.includes('代码') || node.text.includes('console.log'))) {
                    hasInlineCode = true;
                    // 检查是否有特殊格式（不应该有）
                    if (node.fontFamily === 'monospace' || node.backgroundColor === '#F0F0F0') {
                        hasSpecialFormatting = true;
                    }
                    // 检查是否保留了backtick标记
                    if (node.text.includes('`')) {
                        hasBackticks = true;
                    }
                }
            });
            
            if (hasInlineCode && !hasSpecialFormatting && hasBackticks) {
                console.log(`   ✅ 通过 - 内联代码按照普通文字处理，并保留backtick标记`);
                passedTests++;
            } else if (hasSpecialFormatting) {
                console.log(`   ❌ 失败 - 内联代码被添加了特殊格式`);
            } else if (!hasBackticks) {
                console.log(`   ❌ 失败 - 内联代码的backtick标记被删除了`);
            } else {
                console.log(`   ❌ 失败 - 未找到内联代码或处理不正确`);
            }
        } catch (error) {
            console.log(`   ❌ 错误: ${error.message}`);
        }
        
        console.log('');
    });
    
    console.log(`📊 测试结果: ${passedTests}/${totalTests} 通过`);
    
    if (passedTests === totalTests) {
        console.log('🎉 所有测试通过！内联代码处理功能正常工作。');
    } else {
        console.log('⚠️  部分测试失败，需要进一步调试。');
    }
}

// 运行测试
if (require.main === module) {
    testInlineCodeProcessing();
}

module.exports = { testInlineCodeProcessing, testCases }; 