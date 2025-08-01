/**
 * 调试 Markdown 格式解析过程
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

// 测试输入
const testInput = 'MDtoQQ时需要自动识别其格式例如 **粗体**, _斜体_, ~~strickthrough~~, 并在QQtoMD时, 需要对这些格式进行正确还原为md 格式.';

console.log('🔍 调试 Markdown 格式解析...\n');
console.log(`输入: ${testInput}\n`);

// 1. 使用 markdown-it 解析
console.log('📝 步骤1: markdown-it 解析');
const tokens = markdownit.parseInline(testInput, {});
console.log('Tokens:', JSON.stringify(tokens, null, 2));
console.log('');

// 2. 分析每个 token
console.log('🔍 步骤2: 分析每个 token');
tokens.forEach((token, index) => {
    console.log(`Token ${index}:`, {
        type: token.type,
        content: token.content,
        markup: token.markup,
        tag: token.tag
    });
});
console.log('');

// 3. 使用 RichTextFormatter 处理
console.log('🔄 步骤3: RichTextFormatter 处理');
const result = richTextFormatter.format(testInput, markdownit);
console.log('结果:', JSON.stringify(result, null, 2));
console.log('');

// 4. 检查结果中的格式
console.log('✅ 步骤4: 检查格式');
if (result.children && result.children[0] && result.children[0].children) {
    result.children[0].children.forEach((textNode, index) => {
        console.log(`文本节点 ${index}:`, {
            text: textNode.text,
            fontWeight: textNode.fontWeight,
            italic: textNode.italic,
            strike: textNode.strike
        });
    });
} else {
    console.log('❌ 没有找到文本节点');
} 