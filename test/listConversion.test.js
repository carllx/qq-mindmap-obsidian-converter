/**
 * 列表转换测试
 * 验证列表识别逻辑是否正确处理各种边界情况
 */

// 模拟浏览器环境
if (typeof window === 'undefined') {
    global.window = {};
}

// 导入依赖
const MarkdownToQQConverter = require('../core/converters/md2qq.js');
const IndentManager = require('../core/utils/indentManager.js');

// 模拟 markdown-it 和 he 库
const mockMarkdownIt = {
    parse: (text) => {
        // 简单的 token 解析模拟
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
        name: "正常无序列表",
        input: "* 列表项1\n* 列表项2",
        shouldBeList: true,
        description: "标准的无序列表应该被正确识别"
    },
    {
        name: "正常有序列表",
        input: "1. 列表项1\n2. 列表项2",
        shouldBeList: true,
        description: "标准的有序列表应该被正确识别"
    },
    {
        name: "包含粗体语法的文本",
        input: "**以太发声器**（Etherophone）",
        shouldBeList: false,
        description: "包含**粗体语法的文本不应该被误判为列表"
    },
    {
        name: "包含*字符的粗体文本",
        input: "* **0-50cm** → *亲密色彩*（红色、橙色）",
        shouldBeList: true,
        description: "包含*字符的列表项应该被正确识别为列表"
    },
    {
        name: "包含奇数个*字符的文本",
        input: "这是一个*粗体*文本",
        shouldBeList: false,
        description: "包含奇数个*字符的文本不应该被误判为列表"
    },
    {
        name: "包含偶数个*字符的文本",
        input: "这是一个**粗体**文本",
        shouldBeList: false,
        description: "包含偶数个*字符的文本不应该被误判为列表"
    },
    {
        name: "列表项包含粗体",
        input: "* **粗体文本** 普通文本",
        shouldBeList: true,
        description: "列表项可以包含粗体语法"
    },
    {
        name: "包含特殊分隔符的文本",
        input: "3. 探索 (Explore) ──",
        shouldBeList: false,
        description: "包含特殊分隔符的文本不应该被误判为列表"
    }
];

// 测试函数
function runTests() {
    console.log('🧪 开始列表转换测试...\n');
    
    const indentManager = new IndentManager();
    const converter = new MarkdownToQQConverter(mockMarkdownIt, mockHe);
    
    let passedTests = 0;
    let totalTests = testCases.length;
    
    testCases.forEach((testCase, index) => {
        console.log(`📋 测试 ${index + 1}: ${testCase.name}`);
        console.log(`   描述: ${testCase.description}`);
        console.log(`   输入: "${testCase.input}"`);
        
        const lines = testCase.input.split('\n');
        let allPassed = true;
        
        for (const line of lines) {
            // 测试 IndentManager 的列表判断
            const indentInfo = indentManager.parseMarkdownIndent(line);
            const isListByIndentManager = indentInfo.isList;
            
            // 测试 MarkdownToQQConverter 的列表判断
            const lineInfo = converter.parseLine(line);
            const isListByConverter = lineInfo.type === 'list';
            
            // 验证结果
            const expectedIsList = testCase.shouldBeList;
            const indentManagerCorrect = isListByIndentManager === expectedIsList;
            const converterCorrect = isListByConverter === expectedIsList;
            
            if (!indentManagerCorrect || !converterCorrect) {
                allPassed = false;
                console.log(`   ❌ 失败:`);
                console.log(`      IndentManager: ${isListByIndentManager} (期望: ${expectedIsList})`);
                console.log(`      Converter: ${isListByConverter} (期望: ${expectedIsList})`);
            }
        }
        
        if (allPassed) {
            console.log(`   ✅ 通过`);
            passedTests++;
        }
        
        console.log('');
    });
    
    console.log(`📊 测试结果: ${passedTests}/${totalTests} 通过`);
    
    if (passedTests === totalTests) {
        console.log('🎉 所有测试通过！列表识别逻辑修复成功。');
    } else {
        console.log('⚠️  部分测试失败，需要进一步调试。');
    }
}

// 运行测试
if (require.main === module) {
    runTests();
}

module.exports = { runTests, testCases }; 