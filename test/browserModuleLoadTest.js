/**
 * 浏览器模块加载测试
 * 验证在浏览器环境中所有模块是否能正确加载和实例化
 */

const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// 创建虚拟浏览器环境
const dom = new JSDOM(`
<!DOCTYPE html>
<html>
<head>
    <title>Module Load Test</title>
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
const document = window.document;

// 模拟浏览器全局对象
global.window = window;
global.document = document;
global.navigator = window.navigator;
global.location = window.location;

// 读取构建后的用户脚本
const userScriptPath = path.join(__dirname, '..', 'QQmindmap2Obsidian.user.js');
const userScriptContent = fs.readFileSync(userScriptPath, 'utf8');

console.log('🧪 开始浏览器模块加载测试...\n');

try {
    // 在虚拟浏览器环境中执行用户脚本
    const script = document.createElement('script');
    script.textContent = userScriptContent;
    document.head.appendChild(script);
    
    console.log('✅ 用户脚本已加载到虚拟浏览器环境');
    
    // 等待模块初始化
    setTimeout(() => {
        console.log('\n📋 检查全局模块是否可用:');
        
        const modulesToCheck = [
            'IndentManager',
            'LinePreserver', 
            'RichTextFormatter',
            'QQMindMapParser',
            'QQToMarkdownConverter',
            'MarkdownToQQConverter',
            'NotificationSystem',
            'InterfaceManager'
        ];
        
        let allModulesAvailable = true;
        
        modulesToCheck.forEach(moduleName => {
            if (window[moduleName]) {
                console.log(`✅ ${moduleName}: 可用`);
            } else {
                console.log(`❌ ${moduleName}: 不可用`);
                allModulesAvailable = false;
            }
        });
        
        if (allModulesAvailable) {
            console.log('\n🎉 所有模块都可用！');
            
            // 测试模块实例化
            console.log('\n🧪 测试模块实例化:');
            
            try {
                const indentManager = new window.IndentManager();
                console.log('✅ IndentManager 实例化成功');
            } catch (error) {
                console.log('❌ IndentManager 实例化失败:', error.message);
            }
            
            try {
                const linePreserver = new window.LinePreserver();
                console.log('✅ LinePreserver 实例化成功');
            } catch (error) {
                console.log('❌ LinePreserver 实例化失败:', error.message);
            }
            
            try {
                const richTextFormatter = new window.RichTextFormatter();
                console.log('✅ RichTextFormatter 实例化成功');
            } catch (error) {
                console.log('❌ RichTextFormatter 实例化失败:', error.message);
            }
            
            try {
                const qqToMdConverter = new window.QQToMarkdownConverter();
                console.log('✅ QQToMarkdownConverter 实例化成功');
            } catch (error) {
                console.log('❌ QQToMarkdownConverter 实例化失败:', error.message);
            }
            
            try {
                // 需要模拟 markdown-it 和 he 库
                const mockMarkdownIt = {
                    render: (text) => `<p>${text}</p>`
                };
                const mockHe = {
                    encode: (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                };
                const mdToQqConverter = new window.MarkdownToQQConverter(mockMarkdownIt, mockHe);
                console.log('✅ MarkdownToQQConverter 实例化成功');
            } catch (error) {
                console.log('❌ MarkdownToQQConverter 实例化失败:', error.message);
            }
            
        } else {
            console.log('\n❌ 部分模块不可用，需要检查构建过程');
        }
        
    }, 200); // 给模块初始化更多时间
    
} catch (error) {
    console.error('❌ 测试过程中出现错误:', error);
}

console.log('\n🏁 浏览器模块加载测试完成'); 