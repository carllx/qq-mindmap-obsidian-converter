/**
 * 简化测试：验证基本功能
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

console.log('🧪 简化测试开始...\n');

// 测试 1: 直接测试 RichTextFormatter
console.log('📝 测试 1: RichTextFormatter');
try {
    const RichTextFormatter = require('../core/formatters/richText.js');
    const richTextFormatter = new RichTextFormatter();
    console.log('✅ RichTextFormatter 创建成功');
    
    // 测试基本格式化
    const result = richTextFormatter.format('**粗体**', markdownit);
    console.log('✅ RichTextFormatter.format() 执行成功');
    
} catch (error) {
    console.error('❌ RichTextFormatter 测试失败:', error.message);
}

// 测试 2: 直接测试 IndentManager
console.log('\n📝 测试 2: IndentManager');
try {
    const IndentManager = require('../core/utils/indentManager.js');
    const indentManager = new IndentManager();
    console.log('✅ IndentManager 创建成功');
    
    // 测试基本功能
    const level = indentManager.calculateIndentLevel('  ');
    console.log('✅ IndentManager.calculateIndentLevel() 执行成功，结果:', level);
    
} catch (error) {
    console.error('❌ IndentManager 测试失败:', error.message);
}

// 测试 3: 测试 MarkdownToQQConverter
console.log('\n📝 测试 3: MarkdownToQQConverter');
try {
    const MarkdownToQQConverter = require('../core/converters/md2qq.js');
    const mdToQqConverter = new MarkdownToQQConverter(markdownit, he);
    console.log('✅ MarkdownToQQConverter 创建成功');
    
    // 测试基本转换
    const mindMapData = mdToQqConverter.convert('**粗体**');
    console.log('✅ MarkdownToQQConverter.convert() 执行成功');
    console.log('转换结果节点数:', mindMapData.length);
    
} catch (error) {
    console.error('❌ MarkdownToQQConverter 测试失败:', error.message);
    console.error('错误堆栈:', error.stack);
}

console.log('\n🎉 简化测试完成'); 