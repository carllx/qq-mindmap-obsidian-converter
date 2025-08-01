/**
 * 测试 markdown-it 的不同配置选项
 */

// 模拟浏览器环境
global.window = global;
global.navigator = { clipboard: {} };

// 测试不同的 markdown-it 配置
const markdownitConfigs = [
    {
        name: '默认配置',
        config: {
            html: true,
            linkify: true,
            breaks: false,
            typographer: false
        }
    },
    {
        name: '启用 emphasis 配置',
        config: {
            html: true,
            linkify: true,
            breaks: false,
            typographer: false,
            emphasis: {
                underscore: true  // 启用下划线作为强调标记
            }
        }
    }
];

// 模拟 he 库
const he = require('he');

// 加载模块
const RichTextFormatter = require('../core/formatters/richText.js');

// 测试输入
const testInput = '这是_斜体_文本';

console.log('🔍 测试 markdown-it 不同配置...\n');

for (const config of markdownitConfigs) {
    console.log(`📝 配置: ${config.name}`);
    
    // 创建 markdown-it 实例
    const markdownit = require('markdown-it')(config.config)
        .enable(['strikethrough', 'emphasis']);
    
    // 创建 RichTextFormatter 实例
    const richTextFormatter = new RichTextFormatter();
    
    // 解析 tokens
    const tokens = markdownit.parseInline(testInput, {});
    console.log('Tokens:', JSON.stringify(tokens, null, 2));
    
    // 处理结果
    const result = richTextFormatter.format(testInput, markdownit);
    console.log('结果:', JSON.stringify(result, null, 2));
    
    // 检查是否有斜体格式
    let hasItalic = false;
    if (result.children && result.children[0] && result.children[0].children) {
        for (const textNode of result.children[0].children) {
            if (textNode.italic) hasItalic = true;
        }
    }
    
    console.log(`✅ 斜体: ${hasItalic}`);
    console.log('---\n');
} 