/**
 * 针对具体bug的测试
 * 验证您提到的列表转换问题是否已修复
 */

// 模拟浏览器环境
if (typeof window === 'undefined') {
    global.window = {};
}

// 导入依赖
const MarkdownToQQConverter = require('../core/converters/md2qq.js');
const QQToMarkdownConverter = require('../core/converters/qq2md.js');

// 模拟依赖
const mockMarkdownIt = {
    parse: (text) => {
        return [{ type: 'text', content: text }];
    }
};

const mockHe = {
    encode: (text) => text,
    decode: (text) => text
};

const mockDOMPurify = {
    sanitize: (html) => html
};

// 测试用例
const specificTestCases = [
    {
        name: "粗体文本误判问题",
        input: "**以太发声器**（Etherophone）",
        description: "包含**的粗体文本不应该被误判为列表"
    },
    {
        name: "列表项包含粗体语法",
        input: "* **0-50cm** → *亲密色彩*（红色、橙色）\n* **50-100cm** → *舒适色调*（绿色、蓝色）\n* **100-200cm** → *冷静色彩*（蓝色、紫色）",
        description: "列表项包含粗体语法应该被正确识别"
    },
    {
        name: "纯粗体文本",
        input: "**粗体文本**",
        description: "纯粗体文本不应该被误判为列表"
    },
    {
        name: "包含*的普通文本",
        input: "这是一个*粗体*文本",
        description: "包含*的普通文本不应该被误判为列表"
    }
];

// 测试函数
function runSpecificTests() {
    console.log('🔍 开始特定bug测试...\n');
    
    const mdToQqConverter = new MarkdownToQQConverter(mockMarkdownIt, mockHe);
    
    specificTestCases.forEach((testCase, index) => {
        console.log(`📋 测试 ${index + 1}: ${testCase.name}`);
        console.log(`   描述: ${testCase.description}`);
        console.log(`   输入: "${testCase.input}"`);
        
        const lines = testCase.input.split('\n');
        let allCorrect = true;
        
        for (const line of lines) {
            const lineInfo = mdToQqConverter.parseLine(line);
            const isList = lineInfo.type === 'list';
            
            // 根据测试用例判断期望结果
            let expectedIsList = false;
            if (testCase.name.includes("列表项")) {
                expectedIsList = true;
            }
            
            if (isList !== expectedIsList) {
                allCorrect = false;
                console.log(`   ❌ 失败: 识别为${isList ? '列表' : '文本'} (期望: ${expectedIsList ? '列表' : '文本'})`);
            }
        }
        
        if (allCorrect) {
            console.log(`   ✅ 通过`);
        }
        
        console.log('');
    });
    
    console.log('🎯 特定bug测试完成！');
}

// 运行测试
if (require.main === module) {
    runSpecificTests();
}

module.exports = { runSpecificTests, specificTestCases }; 