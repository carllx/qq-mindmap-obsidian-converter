/**
 * 简单的列表标记保留测试
 */

// 模拟浏览器环境
if (typeof window === 'undefined') {
    global.window = {};
}

// 导入依赖
const MarkdownToQQConverter = require('../core/converters/md2qq.js');

// 模拟依赖
const mockMarkdownIt = {
    parse: (text) => {
        return [{ type: 'text', content: text }];
    },
    parseInline: (text) => {
        return [{ type: 'text', content: text }];
    }
};

const mockHe = {
    encode: (text) => text,
    decode: (text) => text
};

// 测试用例
const testCases = [
    {
        name: "无序列表标记保留",
        input: "* 列表项1",
        expectedMarker: "*"
    },
    {
        name: "无序列表标记保留（-）",
        input: "- 列表项2",
        expectedMarker: "-"
    },
    {
        name: "有序列表标记保留",
        input: "1. 列表项3",
        expectedMarker: "1."
    },
    {
        name: "列表项包含粗体",
        input: "* **粗体文本** 普通文本",
        expectedMarker: "*"
    }
];

// 测试函数
function testListMarkerPreservation() {
    console.log('🧪 开始简单列表标记保留测试...\n');
    
    const mdToQqConverter = new MarkdownToQQConverter(mockMarkdownIt, mockHe);
    
    let passedTests = 0;
    let totalTests = testCases.length;
    
    testCases.forEach((testCase, index) => {
        console.log(`📋 测试 ${index + 1}: ${testCase.name}`);
        console.log(`   输入: "${testCase.input}"`);
        console.log(`   期望标记: "${testCase.expectedMarker}"`);
        
        try {
            // MDtoQQ转换
            const lineInfo = mdToQqConverter.parseLine(testCase.input);
            console.log(`   解析结果: type=${lineInfo.type}, content="${lineInfo.content}"`);
            
            if (lineInfo.type === 'list') {
                console.log(`   列表标记: "${lineInfo.listMarker}"`);
                
                // 验证列表标记是否正确保留
                const isCorrect = lineInfo.listMarker === testCase.expectedMarker;
                
                if (isCorrect) {
                    console.log(`   ✅ 通过 - 列表标记正确保留`);
                    passedTests++;
                } else {
                    console.log(`   ❌ 失败: 期望标记 "${testCase.expectedMarker}", 实际 "${lineInfo.listMarker}"`);
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