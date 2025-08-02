/**
 * 简化的粗体和内联代码测试
 */

// 模拟 applyQQStyles 方法
function applyQQStyles(textNode) {
    let content = textNode.text || '';
    
    const isBold = textNode.fontWeight === 'bold' || textNode.fontWeight === 700;
    const isMonospace = textNode.fontFamily === 'monospace';
    
    // 如果同时具有粗体和等宽字体属性，处理为粗体包含内联代码
    if (isBold && isMonospace) {
        content = `**\`${content}\`**`; // 粗体包含内联代码
    } else if (isMonospace) {
        content = `\`${content}\``; // 内联代码
    } else if (isBold) {
        content = `**${content}**`; // 粗体
    }
    
    return content;
}

// 智能合并方法
function mergeBoldAndInlineCode(textNodes) {
    if (textNodes.length === 0) return '';
    
    let result = '';
    let currentBold = false;
    
    for (let i = 0; i < textNodes.length; i++) {
        const node = textNodes[i];
        const hasInlineCode = node.includes('`');
        const isBold = node.includes('**');
        
        if (isBold && !hasInlineCode) {
            // 纯粗体文本
            if (!currentBold) {
                result += '**';
                currentBold = true;
            }
            result += node.replace(/\*\*/g, '');
        } else if (hasInlineCode && !isBold) {
            // 纯内联代码
            if (currentBold) {
                result += '**';
                currentBold = false;
            }
            result += node;
        } else if (hasInlineCode && isBold) {
            // 粗体包含内联代码 - 特殊处理
            if (!currentBold) {
                result += '**';
                currentBold = true;
            }
            // 移除内联代码的粗体标记，保留反引号
            result += node.replace(/\*\*/g, '');
        } else {
            // 普通文本
            if (currentBold) {
                result += '**';
                currentBold = false;
            }
            result += node;
        }
    }
    
    // 关闭未闭合的粗体标记
    if (currentBold) {
        result += '**';
    }
    
    return result;
}

// 测试用例
console.log('=== 测试用例 ===');

// 测试1：**数据格式：`距离,归一化值`**
const testNodes1 = [
    { text: '数据格式：', fontWeight: 700 },
    { text: '距离,归一化值', fontWeight: 700, fontFamily: 'monospace' }
];

console.log('测试1 - 原始节点:', testNodes1);

const processedNodes1 = testNodes1.map(node => applyQQStyles(node));
console.log('测试1 - 处理后节点:', processedNodes1);

const result1 = mergeBoldAndInlineCode(processedNodes1);
console.log('测试1 - 最终结果:', result1);
console.log('测试1 - 期望结果: **数据格式：`距离,归一化值`**');
console.log('测试1 - 状态:', result1 === '**数据格式：`距离,归一化值`**' ? '✅ 成功' : '❌ 失败');

// 测试2：只有粗体
const testNodes2 = [
    { text: '普通粗体文字', fontWeight: 700 }
];

const processedNodes2 = testNodes2.map(node => applyQQStyles(node));
const result2 = mergeBoldAndInlineCode(processedNodes2);
console.log('\n测试2 - 只有粗体:', result2);
console.log('测试2 - 期望结果: **普通粗体文字**');
console.log('测试2 - 状态:', result2 === '**普通粗体文字**' ? '✅ 成功' : '❌ 失败');

// 测试3：只有内联代码
const testNodes3 = [
    { text: 'code', fontFamily: 'monospace' }
];

const processedNodes3 = testNodes3.map(node => applyQQStyles(node));
const result3 = mergeBoldAndInlineCode(processedNodes3);
console.log('\n测试3 - 只有内联代码:', result3);
console.log('测试3 - 期望结果: `code`');
console.log('测试3 - 状态:', result3 === '`code`' ? '✅ 成功' : '❌ 失败');

// 测试4：粗体包含内联代码（单个节点）
const testNodes4 = [
    { text: '距离,归一化值', fontWeight: 700, fontFamily: 'monospace' }
];

const processedNodes4 = testNodes4.map(node => applyQQStyles(node));
const result4 = mergeBoldAndInlineCode(processedNodes4);
console.log('\n测试4 - 粗体包含内联代码:', result4);
console.log('测试4 - 期望结果: **`距离,归一化值`**');
console.log('测试4 - 状态:', result4 === '**`距离,归一化值`**' ? '✅ 成功' : '❌ 失败'); 