/**
 * 列表标记保留测试
 * 验证MDtoQQ和QQtoMD转换时列表标记的正确处理
 */

// 模拟浏览器环境
if (typeof window === 'undefined') {
    global.window = {};
}

// 导入依赖
const MarkdownToQQConverter = require('../core/converters/md2qq.js');
const QQToMarkdownConverter = require('../core/converters/qq2md.js');
const NodeManager = require('../core/converters/shared/nodeManager.js');
const RichTextFormatter = require('../core/formatters/richText.js');

// 模拟依赖
const mockMarkdownIt = {
    parse: (text) => {
        return [{ type: 'text', content: text }];
    },
    parseInline: (text) => {
        // 简单的内联解析
        const tokens = [];
        let currentIndex = 0;
        
        // 处理粗体语法
        while (currentIndex < text.length) {
            const boldMatch = text.slice(currentIndex).match(/\*\*(.*?)\*\*/);
            if (boldMatch) {
                if (currentIndex < boldMatch.index) {
                    tokens.push({
                        type: 'text',
                        content: text.slice(currentIndex, currentIndex + boldMatch.index)
                    });
                }
                tokens.push({
                    type: 'strong',
                    content: boldMatch[1],
                    children: [
                        { type: 'text', content: boldMatch[1] }
                    ]
                });
                currentIndex += boldMatch.index + boldMatch[0].length;
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

const mockDOMPurify = {
    sanitize: (html) => html
};

// 模拟全局对象
global.window = {
    IndentManager: require('../core/utils/indentManager.js'),
    LinePreserver: require('../core/utils/linePreserver.js'),
    QQMindMapParser: require('../core/parsers/qqParser.js'),
    RichTextFormatter: require('../core/formatters/richText.js'),
    CodeBlockHandler: require('../core/converters/shared/codeBlockHandler.js'),
    NodeManager: require('../core/converters/shared/nodeManager.js'),
    HtmlUtils: require('../core/converters/shared/htmlUtils.js')
};

// 测试用例
const testCases = [
    {
        name: "无序列表标记保留",
        input: "* 列表项1",
        expectedMD: "* 列表项1",
        description: "无序列表应该保留 * 标记"
    },
    {
        name: "无序列表标记保留（-）",
        input: "- 列表项2",
        expectedMD: "- 列表项2",
        description: "无序列表应该保留 - 标记"
    },
    {
        name: "有序列表标记保留",
        input: "1. 列表项3",
        expectedMD: "1. 列表项3",
        description: "有序列表应该保留数字标记"
    },
    {
        name: "列表项包含粗体",
        input: "* **粗体文本** 普通文本",
        expectedMD: "* **粗体文本** 普通文本",
        description: "列表项中的粗体语法应该保持完整"
    }
];

// 测试函数
function testListMarkerPreservation() {
    console.log('🧪 开始列表标记保留测试...\n');
    
    const mdToQqConverter = new MarkdownToQQConverter(mockMarkdownIt, mockHe);
    
    let passedTests = 0;
    let totalTests = testCases.length;
    
    testCases.forEach((testCase, index) => {
        console.log(`📋 测试 ${index + 1}: ${testCase.name}`);
        console.log(`   描述: ${testCase.description}`);
        console.log(`   输入: "${testCase.input}"`);
        console.log(`   期望标记: "${testCase.expectedMD.split(' ')[0]}"`);
        
        try {
            // 步骤1: MDtoQQ转换
            const lineInfo = mdToQqConverter.parseLine(testCase.input);
            console.log(`   解析结果: type=${lineInfo.type}, content="${lineInfo.content}"`);
            
            if (lineInfo.type === 'list') {
                console.log(`   列表标记: "${lineInfo.listMarker}"`);
                
                // 验证列表标记是否正确保留
                const expectedMarker = testCase.expectedMD.split(' ')[0];
                const isCorrect = lineInfo.listMarker === expectedMarker;
                
                if (isCorrect) {
                    console.log(`   ✅ 通过 - 列表标记正确保留`);
                    passedTests++;
                } else {
                    console.log(`   ❌ 失败: 期望标记 "${expectedMarker}", 实际 "${lineInfo.listMarker}"`);
                }
            } else {
                console.log(`   ❌ 失败: 应该被识别为列表项，但被识别为 ${lineInfo.type}`);
            }
        } catch (error) {
            console.log(`   ❌ 错误: ${error.message}`);
        }
        
        console.log('');
    });
    
    console.log(`📊 测试结果: ${passedTests}/${totalTests} 通过`);
    
    if (passedTests === totalTests) {
        console.log('🎉 所有测试通过！列表标记保留功能正常工作。');
    } else {
        console.log('⚠️  部分测试失败，需要进一步调试。');
    }
}

// 运行测试
if (require.main === module) {
    testListMarkerPreservation();
}

module.exports = { testListMarkerPreservation, testCases }; 