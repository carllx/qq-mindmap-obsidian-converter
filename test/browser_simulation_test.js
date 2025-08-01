/**
 * 模拟浏览器环境测试
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

console.log('🧪 模拟浏览器环境测试...\n');

// 模拟模块系统
const modules = {};

function define(name, factory) { 
    try {
        modules[name] = factory();
        console.log('✅ Module loaded:', name);
    } catch (error) {
        console.error('❌ Error loading module:', name, error);
    }
}

// 加载模块
console.log('📝 加载模块...');

// 加载 IndentManager
define('IndentManager', function() {
    const IndentManager = require('../core/utils/indentManager.js');
    return IndentManager;
});

// 加载 RichTextFormatter
define('RichTextFormatter', function() {
    const RichTextFormatter = require('../core/formatters/richText.js');
    return RichTextFormatter;
});

// 加载 MarkdownToQQConverter
define('MarkdownToQQConverter', function() {
    const MarkdownToQQConverter = require('../core/converters/md2qq.js');
    return MarkdownToQQConverter;
});

// 模拟全局变量设置
console.log('\n📝 设置全局变量...');
setTimeout(() => {
    if (modules.IndentManager) window.IndentManager = modules.IndentManager;
    if (modules.RichTextFormatter) window.RichTextFormatter = modules.RichTextFormatter;
    if (modules.MarkdownToQQConverter) window.MarkdownToQQConverter = modules.MarkdownToQQConverter;
    console.log('✅ 全局变量已创建');
    
    // 测试 MarkdownToQQConverter
    console.log('\n📝 测试 MarkdownToQQConverter...');
    try {
        const converter = new window.MarkdownToQQConverter(markdownit, he);
        console.log('✅ MarkdownToQQConverter 创建成功');
        
        // 测试转换
        const result = converter.convert('**粗体** *斜体* ~~删除线~~');
        console.log('✅ 转换成功，结果节点数:', result.length);
        
        // 检查结果
        if (result.length > 0 && result[0].data && result[0].data.title) {
            const title = result[0].data.title;
            console.log('✅ 标题对象:', title);
            
            if (title.children && title.children[0] && title.children[0].children) {
                const textNodes = title.children[0].children;
                console.log('✅ 文本节点数:', textNodes.length);
                
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
        }
        
    } catch (error) {
        console.error('❌ MarkdownToQQConverter 测试失败:', error.message);
        console.error('错误堆栈:', error.stack);
    }
    
}, 100);

console.log('\n🎉 浏览器环境模拟测试完成'); 