/**
 * 测试粗体文字中包含内联代码的处理逻辑
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

// 模拟 RichTextFormatter - 使用修复后的逻辑
class MockRichTextFormatter {
    buildQQNodesFromTokens(tokens) {
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

                    case 'strong':
                        if (token.children && token.children.length > 0) {
                            const childStyle = {...currentStyle, fontWeight: 700};
                            const childNodes = this.buildQQNodesFromTokens(token.children);
                            childNodes.forEach(node => {
                                resultNodes.push({
                                    ...node,
                                    ...childStyle
                                });
                            });
                        } else {
                            resultNodes.push({
                                type: 'text',
                                text: content,
                                ...currentStyle,
                                fontWeight: 700
                            });
                        }
                        continue;

                    case 'code_inline':
                        resultNodes.push({
                            type: 'text',
                            text: `\`${content}\``,
                            ...currentStyle
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
                        
                    default:
                        if (token.children && token.children.length > 0) {
                            const childNodes = this.buildQQNodesFromTokens(token.children);
                            childNodes.forEach(node => {
                                resultNodes.push({
                                    ...node,
                                    ...currentStyle
                                });
                            });
                        } else if (content && content.trim()) {
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

    // 修复后的 applyQQStyles 方法
    applyQQStyles(textNode) {
        let content = textNode.text || '';
        
        // 检查是否已经包含Markdown格式标记
        const hasMarkdownFormatting = (text) => {
            // 检查是否包含反引号（内联代码）
            if (text.includes('`')) return true;
            // 检查是否包含粗体标记
            if (text.includes('**')) return true;
            // 检查是否包含斜体标记
            if (text.includes('*') && !text.match(/^\*[^*]+\*$/)) return true;
            // 检查是否包含删除线标记
            if (text.includes('~~')) return true;
            // 检查是否包含高亮标记
            if (text.includes('==')) return true;
            return false;
        };
        
        // 修复：避免对已经包含Markdown格式的文本重复应用粗体
        if ((textNode.fontWeight === 'bold' || textNode.fontWeight === 700) && !hasMarkdownFormatting(content)) {
            content = `**${content}**`;
        }
        
        if (textNode.fontFamily === 'monospace') {
            content = `\`${content}\``;
        }
        
        return content;
    }

    // 模拟QQ富文本对象结构
    convertQQToMarkdown(titleObject) {
        if (typeof titleObject === 'string') {
            return titleObject;
        }
        
        if (!titleObject?.children) {
            return '';
        }

        // 获取所有文本节点
        const textNodes = titleObject.children.flatMap(p => 
            p.children?.map(textNode => this.applyQQStyles(textNode)) || []
        );
        
        // 优化相邻节点的处理
        return this.optimizeAdjacentNodes(textNodes).join('');
    }

    // 优化相邻节点的处理，避免格式冲突
    optimizeAdjacentNodes(nodes) {
        if (nodes.length <= 1) {
            return nodes;
        }

        const optimized = [];
        let i = 0;

        while (i < nodes.length) {
            const currentNode = nodes[i];
            const nextNode = nodes[i + 1];

            // 检查当前节点是否以粗体结尾，下一个节点是否以内联代码开始
            if (nextNode && 
                currentNode.endsWith('**') && 
                nextNode.startsWith('`')) {
                // 在粗体和内联代码之间添加空格
                optimized.push(currentNode + ' ' + nextNode);
                i += 2;
            } else {
                optimized.push(currentNode);
                i++;
            }
        }

        return optimized;
    }
}

// 测试函数
function testBoldInlineCode() {
    console.log('🧪 测试粗体文字中包含内联代码的处理逻辑（完整修复后）');
    
    const formatter = new MockRichTextFormatter();
    
    // 步骤1: MD -> QQ 转换
    console.log('\n📥 MD -> QQ 转换:');
    const qqNodes = formatter.buildQQNodesFromTokens(mockTokens);
    console.log('QQ节点:', JSON.stringify(qqNodes, null, 2));
    
    // 步骤2: 创建模拟的QQ富文本对象
    const mockQQObject = {
        children: [{
            children: qqNodes
        }]
    };
    
    // 步骤3: QQ -> MD 转换
    console.log('\n📤 QQ -> MD 转换:');
    const result = formatter.convertQQToMarkdown(mockQQObject);
    console.log('最终结果:', result);
    
    // 检查问题
    const expected = '**数据格式：** `距离,归一化值`';
    const hasExtraStars = result.includes('****');
    
    console.log('\n🔍 问题分析:');
    console.log('期望结果:', expected);
    console.log('实际结果:', result);
    console.log('是否有多余星号:', hasExtraStars);
    console.log('问题是否解决:', result === expected);
    
    return {
        expected,
        actual: result,
        hasProblem: result !== expected,
        isFixed: result === expected
    };
}

// 运行测试
const testResult = testBoldInlineCode();
console.log('\n📊 测试结果:', testResult);

// 额外测试用例
console.log('\n🧪 额外测试用例:');

const testCases = [
    {
        name: '纯粗体文本',
        text: '普通粗体',
        fontWeight: 700,
        expected: '**普通粗体**'
    },
    {
        name: '包含内联代码的粗体',
        text: '`代码`',
        fontWeight: 700,
        expected: '`代码`'
    },
    {
        name: '混合内容',
        text: '文本`代码`文本',
        fontWeight: 700,
        expected: '文本`代码`文本'
    },
    {
        name: '已有粗体标记',
        text: '**已有粗体**',
        fontWeight: 700,
        expected: '**已有粗体**'
    }
];

testCases.forEach(testCase => {
    const formatter = new MockRichTextFormatter();
    const result = formatter.applyQQStyles({
        text: testCase.text,
        fontWeight: testCase.fontWeight
    });
    
    console.log(`${testCase.name}:`);
    console.log(`  输入: "${testCase.text}" (fontWeight: ${testCase.fontWeight})`);
    console.log(`  期望: "${testCase.expected}"`);
    console.log(`  实际: "${result}"`);
    console.log(`  通过: ${result === testCase.expected ? '✅' : '❌'}`);
    console.log('');
}); 