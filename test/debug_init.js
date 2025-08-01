/**
 * 调试初始化过程
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

console.log('🔍 调试初始化过程...\n');

// 检查环境
console.log('📝 环境检查:');
console.log('typeof window:', typeof window);
console.log('typeof require:', typeof require);
console.log('window === global:', window === global);

// 检查模块
console.log('\n📝 模块检查:');
try {
    const RichTextFormatter = require('../core/formatters/richText.js');
    console.log('RichTextFormatter 类型:', typeof RichTextFormatter);
    console.log('是否为构造函数:', typeof RichTextFormatter === 'function');
} catch (error) {
    console.error('RichTextFormatter 加载失败:', error.message);
}

try {
    const IndentManager = require('../core/utils/indentManager.js');
    console.log('IndentManager 类型:', typeof IndentManager);
    console.log('是否为构造函数:', typeof IndentManager === 'function');
} catch (error) {
    console.error('IndentManager 加载失败:', error.message);
}

// 测试 MarkdownToQQConverter 初始化
console.log('\n📝 测试 MarkdownToQQConverter 初始化:');
try {
    const MarkdownToQQConverter = require('../core/converters/md2qq.js');
    console.log('MarkdownToQQConverter 类型:', typeof MarkdownToQQConverter);
    
    const converter = new MarkdownToQQConverter(markdownit, he);
    console.log('✅ MarkdownToQQConverter 创建成功');
    
    // 检查内部状态
    console.log('_initialized:', converter._initialized);
    console.log('richTextFormatter:', converter.richTextFormatter ? '已设置' : '未设置');
    console.log('indentManager:', converter.indentManager ? '已设置' : '未设置');
    
} catch (error) {
    console.error('❌ MarkdownToQQConverter 初始化失败:', error.message);
    console.error('错误堆栈:', error.stack);
}

console.log('\n🎉 调试完成'); 