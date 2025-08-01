/**
 * 层级关系测试
 * 验证MDtoQQ转换是否正确处理层级关系
 */

const { JSDOM } = require('jsdom');
const MarkdownIt = require('markdown-it');
const he = require('he');

// 创建虚拟浏览器环境
const dom = new JSDOM(`
<!DOCTYPE html>
<html>
<head>
    <title>Hierarchy Test</title>
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

console.log('🧪 开始层级关系测试...\n');

// 创建转换器实例
const md = new MarkdownIt();
const converter = new MarkdownToQQConverter(md, he);

// 测试用例
const testMarkdown = `# 主标题
## 子标题1
### 子子标题1
内容1
内容2
### 子子标题2
内容3
## 子标题2
内容4
- 列表项1
  - 子列表项1
  - 子列表项2
- 列表项2
`;

console.log('📝 测试Markdown:');
console.log(testMarkdown);
console.log('\n🔍 分析每行的缩进:');
testMarkdown.split('\n').forEach((line, index) => {
    const indentMatch = line.match(/^(\s*)/);
    const indentText = indentMatch ? indentMatch[1] : '';
    const spaceCount = indentText.length;
    const tabCount = Math.floor(spaceCount / 2);
    
    // 检查列表项匹配
    const listMatch = line.match(/^(\s*)([-*+]|\d+\.)\s+(.+)$/);
    const isList = listMatch !== null;
    const listIndent = isList ? Math.floor(listMatch[1].length / 2) : 0;
    
    console.log(`行 ${index + 1}: "${line}" | 空格数: ${spaceCount} | 缩进级别: ${tabCount} | 是否列表: ${isList} | 列表缩进: ${listIndent}`);
});

console.log('\n🔍 测试parseLine方法:');
testMarkdown.split('\n').forEach((line, index) => {
    if (line.trim() !== '') {
        const lineInfo = converter.parseLine(line);
        console.log(`行 ${index + 1}: "${line}" -> type: ${lineInfo.type}, indent: ${lineInfo.indent}, content: "${lineInfo.content}"`);
    }
});

console.log('\n🔄 开始转换...\n');

try {
    const result = converter.convert(testMarkdown);
    
    console.log('✅ 转换完成！');
    console.log('\n📊 转换结果:');
    console.log(JSON.stringify(result, null, 2));
    
    // 分析层级结构
    console.log('\n🔍 层级结构分析:');
    analyzeHierarchy(result);
    
    // 添加调试信息：检查每个节点的缩进信息
    console.log('\n🔍 节点缩进信息:');
    function analyzeNodeIndent(nodes, level = 0) {
        nodes.forEach((node, index) => {
            if (node.type === 5 && node.data) {
                const title = node.data.title || '无标题';
                const indent = node.data.originalIndent || 0;
                console.log(`${'  '.repeat(level)}${index + 1}. ${title} (缩进: ${indent})`);
                
                if (node.data.children && node.data.children.attached) {
                    analyzeNodeIndent(node.data.children.attached, level + 1);
                }
            }
        });
    }
    analyzeNodeIndent(result);
    
} catch (error) {
    console.error('❌ 转换失败:', error);
}

/**
 * 分析层级结构
 */
function analyzeHierarchy(nodes, level = 0) {
    nodes.forEach((node, index) => {
        if (node.type === 5 && node.data) {
            const title = node.data.title || '无标题';
            console.log(`${'  '.repeat(level)}${index + 1}. ${title}`);
            
            if (node.data.children && node.data.children.attached) {
                analyzeHierarchy(node.data.children.attached, level + 1);
            }
        }
    });
}

console.log('\n🏁 层级关系测试完成'); 