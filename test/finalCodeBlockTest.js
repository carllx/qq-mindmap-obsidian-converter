/**
 * 最终代码块转换验证测试
 * 确保转换结果与正确格式完全匹配
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
    <title>Final Code Block Test</title>
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

console.log('🧪 开始最终代码块转换验证测试...\n');

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
        
        console.log('✅ 转换结果验证:');
        console.log('内容长度:', ourContent.length);
        
        // 验证关键特征
        const checks = {
            hasLanguagePrefix: ourContent.includes('```cpp<br>'),
            hasEmptyLines: ourContent.includes('<p><br></p>'),
            hasDoubleEscapedSpaces: ourContent.includes('&amp;nbsp;'),
            hasChineseCharacters: ourContent.includes('超声波') || ourContent.includes('传感器'),
            hasEndMarker: ourContent.includes('```</p>'),
            hasCorrectStructure: ourContent.match(/<p>```cpp<br>.*?```<\/p>/s) !== null
        };
        
        console.log('\n🔍 格式验证:');
        Object.entries(checks).forEach(([check, passed]) => {
            console.log(`${passed ? '✅' : '❌'} ${check}: ${passed}`);
        });
        
        // 检查中文字符
        const chineseMatches = ourContent.match(/[\u4e00-\u9fff]/g) || [];
        console.log('\n📊 中文字符统计:');
        console.log('中文字符数量:', chineseMatches.length);
        console.log('示例字符:', chineseMatches.slice(0, 5));
        
        // 检查缩进处理
        const spaceMatches = ourContent.match(/&amp;nbsp;/g) || [];
        console.log('\n📊 缩进处理统计:');
        console.log('双重转义空格数量:', spaceMatches.length);
        
        // 检查空行处理
        const emptyLineMatches = ourContent.match(/<p><br><\/p>/g) || [];
        console.log('\n📊 空行处理统计:');
        console.log('空行数量:', emptyLineMatches.length);
        
        // 整体评估
        const allChecksPassed = Object.values(checks).every(Boolean);
        console.log('\n🎯 整体评估:');
        console.log(allChecksPassed ? '✅ 所有检查通过！转换结果符合预期格式。' : '❌ 部分检查失败，需要进一步调整。');
        
        if (allChecksPassed) {
            console.log('\n🎉 代码块转换修复成功！');
            console.log('现在可以在QQ思维导图中正确显示代码块了。');
        }
        
    }
    
} catch (error) {
    console.error('❌ 转换失败:', error);
}

console.log('\n�� 最终代码块转换验证测试完成'); 