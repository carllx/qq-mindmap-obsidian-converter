/**
 * 调试不同的 Markdown 格式解析
 */

// 模拟浏览器环境
global.window = global;
global.navigator = { clipboard: {} };

// 模拟 markdown-it
const markdownit = require('markdown-it')({
    html: true,
    linkify: true,
    breaks: false,
    typographer: false
}).enable(['strikethrough', 'emphasis']);

// 模拟 he 库
const he = require('he');

// 加载模块
const RichTextFormatter = require('../core/formatters/richText.js');

// 创建实例
const richTextFormatter = new RichTextFormatter();

// 测试不同的格式
const testCases = [
    {
        name: '下划线斜体',
        input: '这是_斜体_文本',
        expected: 'italic'
    },
    {
        name: '星号斜体',
        input: '这是*斜体*文本',
        expected: 'italic'
    },
    {
        name: '双星号粗体',
        input: '这是**粗体**文本',
        expected: 'bold'
    },
    {
        name: '删除线',
        input: '这是~~删除线~~文本',
        expected: 'strike'
    }
];

console.log('🔍 调试不同 Markdown 格式解析...\n');

for (const testCase of testCases) {
    console.log(`📝 测试: ${testCase.name}`);
    console.log(`输入: ${testCase.input}`);
    
    // 使用 markdown-it 解析
    const tokens = markdownit.parseInline(testCase.input, {});
    console.log('Tokens:', JSON.stringify(tokens, null, 2));
    
    // 使用 RichTextFormatter 处理
    const result = richTextFormatter.format(testCase.input, markdownit);
    console.log('结果:', JSON.stringify(result, null, 2));
    
    // 检查结果
    let hasFormat = false;
    if (result.children && result.children[0] && result.children[0].children) {
        for (const textNode of result.children[0].children) {
            if (testCase.expected === 'bold' && textNode.fontWeight === 700) hasFormat = true;
            if (testCase.expected === 'italic' && textNode.italic) hasFormat = true;
            if (testCase.expected === 'strike' && textNode.strike) hasFormat = true;
        }
    }
    
    console.log(`✅ ${testCase.expected}: ${hasFormat}`);
    console.log('---\n');
} 