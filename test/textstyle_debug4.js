/**
 * 详细调试 markdown-it 配置和版本
 */

// 模拟浏览器环境
global.window = global;
global.navigator = { clipboard: {} };

// 检查 markdown-it 版本
const markdownit = require('markdown-it');
console.log('📦 markdown-it 版本:', require('markdown-it/package.json').version);

// 测试不同的配置
const configs = [
    {
        name: '默认配置',
        config: {}
    },
    {
        name: '启用 emphasis',
        config: {
            emphasis: {
                underscore: true
            }
        }
    },
    {
        name: '启用所有 emphasis 选项',
        config: {
            emphasis: {
                underscore: true,
                asterisk: true
            }
        }
    }
];

// 模拟 he 库
const he = require('he');

// 加载模块
const RichTextFormatter = require('../core/formatters/richText.js');

// 测试输入
const testInputs = [
    '这是_斜体_文本',
    '这是*斜体*文本',
    '这是**粗体**文本',
    '这是~~删除线~~文本'
];

console.log('🔍 详细调试 markdown-it 配置...\n');

for (const config of configs) {
    console.log(`📝 配置: ${config.name}`);
    console.log('配置对象:', JSON.stringify(config.config, null, 2));
    
    // 创建 markdown-it 实例
    const md = markdownit(config.config)
        .enable(['strikethrough', 'emphasis']);
    
    // 创建 RichTextFormatter 实例
    const richTextFormatter = new RichTextFormatter();
    
    for (const input of testInputs) {
        console.log(`\n输入: ${input}`);
        
        // 解析 tokens
        const tokens = md.parseInline(input, {});
        console.log('Tokens 类型:', tokens.map(t => t.type));
        
        // 处理结果
        const result = richTextFormatter.format(input, md);
        
        // 检查结果
        let hasBold = false;
        let hasItalic = false;
        let hasStrike = false;
        
        if (result.children && result.children[0] && result.children[0].children) {
            for (const textNode of result.children[0].children) {
                if (textNode.fontWeight === 700) hasBold = true;
                if (textNode.italic) hasItalic = true;
                if (textNode.strike) hasStrike = true;
            }
        }
        
        console.log(`格式: 粗体=${hasBold}, 斜体=${hasItalic}, 删除线=${hasStrike}`);
    }
    
    console.log('\n' + '-'.repeat(50) + '\n');
} 