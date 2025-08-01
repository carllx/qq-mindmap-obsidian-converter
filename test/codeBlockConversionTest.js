/**
 * 代码块转换测试
 * 验证MDtoQQ转换中代码块的处理是否正确
 */

const { JSDOM } = require('jsdom');
const MarkdownIt = require('markdown-it');
const he = require('he');
const fs = require('fs');
const path = require('path');

// 创建虚拟浏览器环境
const dom = new JSDOM(`
<!DOCTYPE html>
<html>
<head>
    <title>Code Block Test</title>
</head>
<body>
    <div id="test-container"></div>
</body>
</html>
`, {
    url: 'http://localhost',
    runScripts: 'dangerously'
});

const window = dom.window;
global.window = window;

// 模拟依赖
window.IndentManager = require('../core/utils/indentManager.js');
window.LinePreserver = require('../core/utils/linePreserver.js');
window.RichTextFormatter = require('../core/formatters/richText.js');

// 导入转换器
const MarkdownToQQConverter = require('../core/converters/md2qq.js');

console.log('🧪 开始代码块转换测试...\n');

// 创建转换器实例
const md = new MarkdownIt();
const converter = new MarkdownToQQConverter(md, he);

// 读取原始Markdown文件
const originalMarkdown = fs.readFileSync(path.join(__dirname, 'codeblock_original.md'), 'utf8');

console.log('📝 原始Markdown:');
console.log(originalMarkdown);
console.log('\n🔄 开始转换...\n');

try {
    const result = converter.convert(originalMarkdown);
    
    console.log('✅ 转换完成！');
    console.log('\n📊 转换结果:');
    console.log(JSON.stringify(result, null, 2));
    
    // 分析代码块内容
    if (result.length > 0 && result[0].type === 5 && result[0].data) {
        const codeBlock = result[0].data;
        console.log('\n🔍 代码块分析:');
        console.log('标题:', codeBlock.title);
        console.log('标签:', codeBlock.labels);
        console.log('注释内容长度:', codeBlock.notes?.content?.length || 0);
        
        if (codeBlock.notes?.content) {
            console.log('\n📄 注释内容预览:');
            console.log(codeBlock.notes.content.substring(0, 500) + '...');
        }
    }
    
} catch (error) {
    console.error('❌ 转换失败:', error);
}

console.log('\n🏁 代码块转换测试完成'); 