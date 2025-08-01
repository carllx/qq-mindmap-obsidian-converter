/**
 * 真正的浏览器环境模拟测试
 */

console.log('🧪 真正的浏览器环境模拟测试...\n');

// 模拟真正的浏览器环境
const browserWindow = {};
const browserGlobal = undefined;

console.log('📝 浏览器环境变量:');
console.log('typeof browserWindow:', typeof browserWindow);
console.log('typeof browserGlobal:', typeof browserGlobal);

// 测试环境检测逻辑
console.log('\n📝 测试环境检测逻辑:');

const isBrowser = typeof browserWindow !== 'undefined' && typeof browserGlobal === 'undefined';
console.log('isBrowser:', isBrowser);

// 测试 Node.js 环境
console.log('\n📝 测试 Node.js 环境:');
console.log('typeof window:', typeof window);
console.log('typeof global:', typeof global);

const isNode = typeof window !== 'undefined' && typeof global !== 'undefined';
console.log('isNode:', isNode);

// 测试修复后的逻辑
console.log('\n📝 测试修复后的逻辑:');

// 模拟浏览器环境
const testWindow = {};
const testGlobal = undefined;

const browserCondition = typeof testWindow !== 'undefined' && typeof testGlobal === 'undefined';
console.log('浏览器条件 (window存在, global不存在):', browserCondition);

// 模拟 Node.js 环境
const testWindow2 = global;
const testGlobal2 = global;

const nodeCondition = typeof testWindow2 !== 'undefined' && typeof testGlobal2 !== 'undefined';
console.log('Node.js条件 (window存在, global存在):', nodeCondition);

console.log('\n🎉 浏览器环境模拟测试完成'); 