/**
 * 测试浏览器环境中的 global 变量问题
 */

console.log('🧪 测试浏览器环境中的 global 变量...\n');

// 检查环境变量
console.log('📝 环境变量检查:');
console.log('typeof window:', typeof window);
console.log('typeof global:', typeof global);
console.log('window === global:', typeof window !== 'undefined' && window === global);

// 测试环境检测逻辑
console.log('\n📝 测试环境检测逻辑:');

// 模拟真正的浏览器环境（没有 global）
const originalGlobal = global;
delete global;

console.log('删除 global 后:');
console.log('typeof window:', typeof window);
console.log('typeof global:', typeof global);

// 测试条件判断
const isBrowser = typeof window !== 'undefined' && typeof global === 'undefined';
console.log('isBrowser:', isBrowser);

// 恢复 global（为了不影响其他测试）
global = originalGlobal;

console.log('\n📝 测试 Node.js 环境检测逻辑:');
console.log('恢复 global 后:');
console.log('typeof window:', typeof window);
console.log('typeof global:', typeof global);

const isNode = typeof window !== 'undefined' && typeof global !== 'undefined';
console.log('isNode:', isNode);

console.log('\n🎉 环境检测测试完成'); 