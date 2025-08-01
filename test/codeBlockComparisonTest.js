/**
 * 代码块转换比较测试
 * 比较我们的转换结果与正确格式的差异
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
    <title>Code Block Comparison Test</title>
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

console.log('🧪 开始代码块转换比较测试...\n');

// 创建转换器实例
const md = new MarkdownIt();
const converter = new MarkdownToQQConverter(md, he);

// 读取原始Markdown文件
const originalMarkdown = fs.readFileSync(path.join(__dirname, 'codeblock_original.md'), 'utf8');

try {
    const result = converter.convert(originalMarkdown);
    
    if (result.length > 0 && result[0].type === 5 && result[0].data) {
        const codeBlock = result[0].data;
        const ourContent = codeBlock.notes?.content || '';
        
        console.log('✅ 我们的转换结果:');
        console.log('内容长度:', ourContent.length);
        console.log('内容预览:');
        console.log(ourContent.substring(0, 1000) + '...');
        
        // 分析关键特征
        console.log('\n🔍 关键特征分析:');
        console.log('空行数量:', (ourContent.match(/<p><br><\/p>/g) || []).length);
        console.log('&amp;nbsp;数量:', (ourContent.match(/&amp;nbsp;/g) || []).length);
        console.log('&nbsp;数量:', (ourContent.match(/&nbsp;/g) || []).length);
        console.log('Unicode转义数量:', (ourContent.match(/&#\d+;/g) || []).length);
        console.log('换行标签数量:', (ourContent.match(/<br>/g) || []).length);
        
        // 检查是否包含正确的结构
        const hasCorrectStructure = 
            ourContent.includes('```cpp<br>') &&
            ourContent.includes('<p><br></p>') &&
            ourContent.includes('&amp;nbsp;') &&
            ourContent.includes('```</p>');
            
        console.log('\n✅ 结构检查:');
        console.log('包含语言标识:', ourContent.includes('```cpp<br>'));
        console.log('包含空行处理:', ourContent.includes('<p><br></p>'));
        console.log('包含双重转义空格:', ourContent.includes('&amp;nbsp;'));
        console.log('包含结束标记:', ourContent.includes('```</p>'));
        console.log('整体结构正确:', hasCorrectStructure);
        
    }
    
} catch (error) {
    console.error('❌ 转换失败:', error);
}

console.log('\n🏁 代码块转换比较测试完成'); 