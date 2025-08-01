/**
 * 调试模块加载
 */

console.log('🔍 调试模块加载...\n');

// 检查 RichTextFormatter
console.log('📝 检查 RichTextFormatter');
try {
    const RichTextFormatter = require('../core/formatters/richText.js');
    console.log('✅ RichTextFormatter 模块加载成功');
    console.log('类型:', typeof RichTextFormatter);
    console.log('是否为构造函数:', typeof RichTextFormatter === 'function');
    
    if (typeof RichTextFormatter === 'function') {
        const instance = new RichTextFormatter();
        console.log('✅ RichTextFormatter 实例创建成功');
    }
} catch (error) {
    console.error('❌ RichTextFormatter 模块加载失败:', error.message);
}

// 检查 IndentManager
console.log('\n📝 检查 IndentManager');
try {
    const IndentManager = require('../core/utils/indentManager.js');
    console.log('✅ IndentManager 模块加载成功');
    console.log('类型:', typeof IndentManager);
    console.log('是否为构造函数:', typeof IndentManager === 'function');
    
    if (typeof IndentManager === 'function') {
        const instance = new IndentManager();
        console.log('✅ IndentManager 实例创建成功');
    }
} catch (error) {
    console.error('❌ IndentManager 模块加载失败:', error.message);
}

// 检查全局变量
console.log('\n📝 检查全局变量');
console.log('window:', typeof window);
console.log('global:', typeof global);
console.log('module:', typeof module);
console.log('require:', typeof require);

console.log('\n🎉 调试完成'); 