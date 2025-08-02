/**
 * 全面测试粗体文字中包含内联代码的处理逻辑
 */

// 测试用例
const testCases = [
    {
        name: '基本粗体文本',
        input: '**数据格式：`距离,归一化值`**',
        expected: '**数据格式：** `距离,归一化值`',
        description: '粗体文本中包含内联代码'
    },
    {
        name: '纯粗体文本',
        input: '**普通粗体文本**',
        expected: '**普通粗体文本**',
        description: '不包含内联代码的粗体文本'
    },
    {
        name: '内联代码在开头',
        input: '**`代码`文本**',
        expected: '`代码` **文本**',
        description: '内联代码在粗体文本开头'
    },
    {
        name: '内联代码在结尾',
        input: '**文本`代码`**',
        expected: '**文本** `代码`',
        description: '内联代码在粗体文本结尾'
    },
    {
        name: '多个内联代码',
        input: '**文本`代码1`更多文本`代码2`**',
        expected: '**文本** `代码1` **更多文本** `代码2`',
        description: '粗体文本中包含多个内联代码'
    },
    {
        name: '嵌套格式',
        input: '**粗体*斜体`代码`*文本**',
        expected: '**粗体*斜体`代码`*文本**',
        description: '复杂的嵌套格式'
    }
];

// 模拟 markdown-it tokens 生成器
function generateTokens(markdown) {
    const tokens = [];
    
    // 简单的token解析（仅用于测试）
    if (markdown.includes('**')) {
        const parts = markdown.split('**');
        if (parts.length >= 3) {
            const content = parts[1];
            
            // 添加strong_open
            tokens.push({ type: 'strong_open', content: '' });
            
            // 解析内容中的内联代码
            const codeMatches = content.match(/`([^`]+)`/g);
            if (codeMatches) {
                let remainingContent = content;
                
                codeMatches.forEach(codeMatch => {
                    const codeContent = codeMatch.slice(1, -1);
                    const beforeCode = remainingContent.substring(0, remainingContent.indexOf(codeMatch));
                    
                    if (beforeCode) {
                        tokens.push({ type: 'text', content: beforeCode });
                    }
                    
                    tokens.push({ type: 'code_inline', content: codeContent });
                    
                    remainingContent = remainingContent.substring(remainingContent.indexOf(codeMatch) + codeMatch.length);
                });
                
                if (remainingContent) {
                    tokens.push({ type: 'text', content: remainingContent });
                }
            } else {
                tokens.push({ type: 'text', content: content });
            }
            
            // 添加strong_close
            tokens.push({ type: 'strong_close', content: '' });
        }
    }
    
    return tokens;
}

// 模拟 RichTextFormatter
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

    applyQQStyles(textNode) {
        let content = textNode.text || '';
        
        // 检查是否已经包含Markdown格式标记
        const hasMarkdownFormatting = (text) => {
            if (text.includes('`')) return true;
            if (text.includes('**')) return true;
            if (text.includes('*') && !text.match(/^\*[^*]+\*$/)) return true;
            if (text.includes('~~')) return true;
            if (text.includes('==')) return true;
            return false;
        };
        
        // 修复：避免对已经包含Markdown格式的文本重复应用粗体
        if ((textNode.fontWeight === 'bold' || textNode.fontWeight === 700) && !hasMarkdownFormatting(content)) {
            content = `**${content}**`;
        }
        
        return content;
    }

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
            } 
            // 检查当前节点是否以内联代码结尾，下一个节点是否以粗体开始
            else if (nextNode && 
                     currentNode.endsWith('`') && 
                     nextNode.startsWith('**')) {
                // 在内联代码和粗体之间添加空格
                optimized.push(currentNode + ' ' + nextNode);
                i += 2;
            }
            // 检查当前节点是否以内联代码结尾，下一个节点是否以内联代码开始
            else if (nextNode && 
                     currentNode.endsWith('`') && 
                     nextNode.startsWith('`')) {
                // 在两个内联代码之间添加空格
                optimized.push(currentNode + ' ' + nextNode);
                i += 2;
            }
            else {
                optimized.push(currentNode);
                i++;
            }
        }

        return optimized;
    }
}

// 运行测试
function runComprehensiveTest() {
    console.log('🧪 全面测试粗体文字中包含内联代码的处理逻辑');
    console.log('=' .repeat(60));
    
    const formatter = new MockRichTextFormatter();
    let passedTests = 0;
    let totalTests = testCases.length;
    
    testCases.forEach((testCase, index) => {
        console.log(`\n📋 测试 ${index + 1}: ${testCase.name}`);
        console.log(`📝 描述: ${testCase.description}`);
        console.log(`📥 输入: "${testCase.input}"`);
        
        // 生成tokens
        const tokens = generateTokens(testCase.input);
        console.log(`🔧 生成的tokens:`, JSON.stringify(tokens, null, 2));
        
        // MD -> QQ 转换
        const qqNodes = formatter.buildQQNodesFromTokens(tokens);
        console.log(`📦 QQ节点:`, JSON.stringify(qqNodes, null, 2));
        
        // 创建模拟QQ对象
        const mockQQObject = {
            children: [{
                children: qqNodes
            }]
        };
        
        // QQ -> MD 转换
        const result = formatter.convertQQToMarkdown(mockQQObject);
        console.log(`📤 输出: "${result}"`);
        console.log(`🎯 期望: "${testCase.expected}"`);
        
        const passed = result === testCase.expected;
        console.log(`✅ 结果: ${passed ? '通过' : '失败'}`);
        
        if (passed) {
            passedTests++;
        } else {
            console.log(`❌ 差异: 期望 "${testCase.expected}" 但得到 "${result}"`);
        }
        
        console.log('-'.repeat(40));
    });
    
    console.log(`\n📊 测试总结:`);
    console.log(`总测试数: ${totalTests}`);
    console.log(`通过测试: ${passedTests}`);
    console.log(`失败测试: ${totalTests - passedTests}`);
    console.log(`成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    return {
        total: totalTests,
        passed: passedTests,
        failed: totalTests - passedTests,
        successRate: (passedTests / totalTests) * 100
    };
}

// 执行测试
const testResults = runComprehensiveTest();
console.log('\n🎉 测试完成!'); 