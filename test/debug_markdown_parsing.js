/**
 * 调试 Markdown 解析
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

console.log('🔍 调试 Markdown 解析...\n');

// 测试输入
const testInput = '**粗体** *斜体* ~~删除线~~';

console.log('📝 输入:', testInput);

// 使用 markdown-it 解析
const tokens = markdownit.parseInline(testInput, {});
console.log('📝 Tokens:', JSON.stringify(tokens, null, 2));

// 测试 RichTextFormatter
console.log('\n📝 测试 RichTextFormatter...');
const RichTextFormatter = require('../core/formatters/richText.js');
const richTextFormatter = new RichTextFormatter();

const result = richTextFormatter.format(testInput, markdownit);
console.log('📝 结果:', JSON.stringify(result, null, 2));

// 检查文本节点
if (result.children && result.children[0] && result.children[0].children) {
    const textNodes = result.children[0].children;
    console.log('\n📝 文本节点分析:');
    
    for (let i = 0; i < textNodes.length; i++) {
        const node = textNodes[i];
        console.log(`节点 ${i}:`, {
            text: node.text,
            fontWeight: node.fontWeight,
            italic: node.italic,
            strike: node.strike
        });
    }
}

console.log('\n🎉 调试完成'); 