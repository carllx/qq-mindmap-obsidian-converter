/**
 * 浏览器模块加载测试
 * 验证在浏览器环境中模块是否能正确加载
 */

// 模拟浏览器环境
const { JSDOM } = require('jsdom');
const fs = require('fs');

// 创建虚拟DOM
const dom = new JSDOM(`
<!DOCTYPE html>
<html>
<head>
    <title>Test</title>
</head>
<body>
    <div id="test"></div>
</body>
</html>
`, { url: 'http://localhost' });

// 设置全局对象
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;

// 模拟 markdown-it
global.markdownit = function() {
    return {
        render: function(text) { return text; },
        enable: function() { return this; }
    };
};

// 模拟 DOMPurify
global.DOMPurify = {
    sanitize: function(html) { return html; }
};

// 模拟 he 库
global.he = {
    encode: function(text) { return text; },
    decode: function(text) { return text; }
};

console.log('🧪 开始浏览器模块加载测试');
console.log('==================================================');

try {
    // 读取构建后的用户脚本
    const userScript = fs.readFileSync('QQmindmap2Obsidian.user.js', 'utf8');
    
    // 执行用户脚本
    const scriptFunction = new Function('markdownit', 'DOMPurify', 'he', userScript);
    scriptFunction(global.markdownit, global.DOMPurify, global.he);
    
    // 等待模块加载
    setTimeout(() => {
        console.log('📦 检查模块加载状态:');
        
        // 检查关键模块是否加载
        const modules = [
            'IndentManager',
            'LinePreserver', 
            'RichTextFormatter',
            'QQMindMapParser',
            'QQToMarkdownConverter',
            'MarkdownToQQConverter',
            'NotificationSystem',
            'InterfaceManager'
        ];
        
        let loadedCount = 0;
        for (const moduleName of modules) {
            if (window[moduleName]) {
                console.log(`   ✅ ${moduleName} 已加载`);
                loadedCount++;
            } else {
                console.log(`   ❌ ${moduleName} 未加载`);
            }
        }
        
        console.log(`\n📊 模块加载结果:`);
        console.log(`   总模块数: ${modules.length}`);
        console.log(`   已加载: ${loadedCount} ✅`);
        console.log(`   未加载: ${modules.length - loadedCount} ❌`);
        console.log(`   成功率: ${((loadedCount / modules.length) * 100).toFixed(1)}%`);
        
        if (loadedCount === modules.length) {
            console.log('\n🎉 所有模块加载成功！');
        } else {
            console.log('\n⚠️ 部分模块加载失败，需要检查依赖关系');
        }
        
        // 测试转换器实例化
        try {
            if (window.QQToMarkdownConverter) {
                const converter = new window.QQToMarkdownConverter();
                console.log('✅ QQToMarkdownConverter 实例化成功');
            }
            
            if (window.MarkdownToQQConverter) {
                const converter = new window.MarkdownToQQConverter(global.markdownit, global.he);
                console.log('✅ MarkdownToQQConverter 实例化成功');
            }
        } catch (error) {
            console.log('❌ 转换器实例化失败:', error.message);
        }
        
    }, 200);
    
} catch (error) {
    console.error('❌ 测试执行失败:', error.message);
}

console.log('=================================================='); 