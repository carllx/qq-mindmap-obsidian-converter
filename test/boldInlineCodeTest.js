/**
 * 测试粗体文字中包含内联代码的处理逻辑
 * 重现问题：**数据格式：`距离,归一化值`** 转换后产生多余星号
 */

// 模拟 markdown-it 的 tokens
const mockTokens = [
    {
        type: 'strong_open',
        content: ''
    },
    {
        type: 'text',
        content: '数据格式：'
    },
    {
        type: 'code_inline',
        content: '距离,归一化值'
    },
    {
        type: 'strong_close',
        content: ''
    }
];

// 模拟 RichTextFormatter 的 buildQQNodesFromTokens 方法
function buildQQNodesFromTokens(tokens) {
    const resultNodes = [];
    const styleStack = [];
    let currentStyle = {};

    const processTokens = (tokenList) => {
        for (const token of tokenList) {
            let content = token.content;
            
            switch (token.type) {
                case 'strong_open': 
                    styleStack.push({...currentStyle});
                    currentStyle = {...currentStyle, fontWeight: 700};
                    continue;
                    
                case 'strong_close':
                    if (styleStack.length > 0) {
                        currentStyle = styleStack.pop();
                    } else {
                        currentStyle = {};
                    }
                    continue;

                case 'code_inline':
                    resultNodes.push({
                        type: 'text',
                        text: content, // 不添加反引号，让applyQQStyles处理
                        fontFamily: 'monospace' // 标记为等宽字体，不继承粗体样式
                    });
                    continue;

                case 'text': 
                    if (content && content.trim()) {
                        resultNodes.push({
                            type: 'text',
                            text: content,
                            ...currentStyle
                        });
                    }
                    continue;
            }
        }
    };

    processTokens(tokens);
    return resultNodes;
}

// 修复前的 applyQQStyles 方法（有问题的版本）
function applyQQStyles_before(textNode) {
    let content = textNode.text || '';
    
    if (textNode.fontWeight === 'bold' || textNode.fontWeight === 700) {
        content = `**${content}**`; // 粗体
    }
    
    if (textNode.fontFamily === 'monospace') {
        content = `\`${content}\``; // 内联代码
    }
    
    return content;
}

// 修复后的 applyQQStyles 方法（简化版本）
function applyQQStyles_after(textNode) {
    let content = textNode.text || '';
    
    // 修复：简化粗体和内联代码的处理逻辑
    const isBold = textNode.fontWeight === 'bold' || textNode.fontWeight === 700;
    const isMonospace = textNode.fontFamily === 'monospace';
    
    // 如果同时具有粗体和等宽字体属性，优先处理为内联代码
    if (isMonospace) {
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
        } else if (hasInlineCode && isBold) {
            // 粗体包含内联代码
            if (!currentBold) {
                result += '**';
                currentBold = true;
            }
            // 移除内联代码的粗体标记，保留反引号
            result += node.replace(/\*\*/g, '');
        } else if (hasInlineCode && !isBold) {
            // 纯内联代码
            if (currentBold) {
                result += '**';
                currentBold = false;
            }
            result += node;
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

// 测试修复前的逻辑
console.log('=== 修复前的逻辑测试 ===');
const nodes_before = buildQQNodesFromTokens(mockTokens);
console.log('生成的节点:', JSON.stringify(nodes_before, null, 2));

let result_before = '';
for (const node of nodes_before) {
    result_before += applyQQStyles_before(node);
}
console.log('修复前结果:', result_before);
console.log('期望结果: **数据格式：`距离,归一化值`**');
console.log('问题: 产生了多余的星号');

console.log('\n=== 修复后的逻辑测试 ===');
const nodes_after = buildQQNodesFromTokens(mockTokens);
console.log('生成的节点:', JSON.stringify(nodes_after, null, 2));

let result_after = '';
for (const node of nodes_after) {
    result_after += applyQQStyles_after(node);
}
console.log('修复后结果:', result_after);
console.log('期望结果: **数据格式：`距离,归一化值`**');
console.log('修复状态:', result_after === '**数据格式：`距离,归一化值`**' ? '✅ 修复成功' : '❌ 仍有问题');

console.log('\n=== 完整流程测试 ===');
// 测试完整的转换流程
const textNodes = [];
for (const node of nodes_after) {
    textNodes.push(applyQQStyles_after(node));
}
const finalResult = mergeBoldAndInlineCode(textNodes);
console.log('完整流程结果:', finalResult);
console.log('期望结果: **数据格式：`距离,归一化值`**');
console.log('最终修复状态:', finalResult === '**数据格式：`距离,归一化值`**' ? '✅ 修复成功' : '❌ 仍有问题');

// 测试更多边界情况
console.log('\n=== 边界情况测试 ===');

// 测试1：只有粗体，没有内联代码
const test1 = [
    { text: '普通粗体文字', fontWeight: 700 }
];
let result1 = '';
for (const node of test1) {
    result1 += applyQQStyles_after(node);
}
console.log('测试1 - 只有粗体:', result1);

// 测试2：只有内联代码，没有粗体
const test2 = [
    { text: 'code', fontFamily: 'monospace' }
];
let result2 = '';
for (const node of test2) {
    result2 += applyQQStyles_after(node);
}
console.log('测试2 - 只有内联代码:', result2);

// 测试3：粗体包含内联代码
const test3 = [
    { text: '数据格式：', fontWeight: 700 },
    { text: '距离,归一化值', fontWeight: 700, fontFamily: 'monospace' }
];
let result3 = '';
for (const node of test3) {
    result3 += applyQQStyles_after(node);
}
console.log('测试3 - 粗体包含内联代码:', result3);

// 测试4：复杂组合
const test4 = [
    { text: '粗体文字', fontWeight: 700 },
    { text: '内联代码', fontFamily: 'monospace' },
    { text: '普通文字', fontWeight: 700 }
];
let result4 = '';
for (const node of test4) {
    result4 += applyQQStyles_after(node);
}
console.log('测试4 - 复杂组合:', result4); 