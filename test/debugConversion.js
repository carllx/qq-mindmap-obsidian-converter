/**
 * 调试转换过程
 * 逐步跟踪MDtoQQ转换的每个步骤
 */

// 模拟浏览器环境
if (typeof window === 'undefined') {
    global.window = {};
}

// 导入依赖
const MarkdownToQQConverter = require('../core/converters/md2qq.js');
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
                // 如果没有找到粗体语法，添加剩余文本
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
const debugCases = [
    {
        name: "问题案例1",
        input: "**以太发声器**（Etherophone）",
        description: "粗体文本被误判为列表"
    },
    {
        name: "问题案例2", 
        input: "* **0-50cm** → *亲密色彩*（红色、橙色）",
        description: "列表项中的粗体语法被破坏"
    }
];

// 调试函数
function debugConversion() {
    console.log('🔍 开始调试转换过程...\n');
    
    const converter = new MarkdownToQQConverter(mockMarkdownIt, mockHe);
    const nodeManager = new NodeManager();
    const richTextFormatter = new RichTextFormatter();
    
    debugCases.forEach((testCase, index) => {
        console.log(`📋 调试 ${index + 1}: ${testCase.name}`);
        console.log(`   描述: ${testCase.description}`);
        console.log(`   输入: "${testCase.input}"`);
        console.log('');
        
        // 步骤1: 解析行
        console.log('   步骤1: 解析行');
        const lineInfo = converter.parseLine(testCase.input);
        console.log(`   结果: type=${lineInfo.type}, content="${lineInfo.content}"`);
        
        // 添加列表验证调试
        if (lineInfo.type === 'list') {
            const listMatch = converter.isValidListItem(testCase.input);
            console.log(`   列表验证:`, listMatch);
        }
        console.log('');
        
        // 步骤2: 创建节点
        console.log('   步骤2: 创建节点');
        const node = nodeManager.createNode(lineInfo, richTextFormatter, mockMarkdownIt, {});
        console.log(`   结果: title="${node.title}"`);
        console.log(`   输入内容: "${lineInfo.content}"`);
        console.log(`   完整节点:`, JSON.stringify(node, null, 2));
        console.log('');
        
        // 步骤3: 富文本格式化
        console.log('   步骤3: 富文本格式化');
        console.log(`   输入到parseInline: "${lineInfo.content}"`);
        const tokens = mockMarkdownIt.parseInline(lineInfo.content);
        console.log(`   parseInline输出:`, JSON.stringify(tokens, null, 2));
        const qqTextNodes = richTextFormatter.buildQQNodesFromTokens(tokens);
        console.log(`   buildQQNodesFromTokens输出:`, JSON.stringify(qqTextNodes, null, 2));
        const formatted = richTextFormatter.format(lineInfo.content, mockMarkdownIt);
        console.log(`   结果:`, JSON.stringify(formatted, null, 2));
        console.log('');
        
        console.log('   ' + '='.repeat(50));
        console.log('');
    });
}

// 运行调试
if (require.main === module) {
    debugConversion();
}

module.exports = { debugConversion, debugCases }; 