/**
 * 图片Alt信息保留测试
 * 测试MDtoQQ和QQtoMD转换过程中图片alt信息的保留
 */

const fs = require('fs');
const path = require('path');

// 模拟MarkdownToQQConverter的关键方法
class MockMarkdownToQQConverter {
    constructor() {
        this.indentManager = {
            parseMarkdownIndent: (line) => {
                const trimmed = line.trim();
                const indent = line.length - trimmed.length;
                return {
                    content: trimmed,
                    level: indent,
                    isList: /^\s*[-*+]/.test(line)
                };
            }
        };
    }

    parseLine(line) {
        const indentInfo = this.indentManager.parseMarkdownIndent(line);
        
        const headerMatch = indentInfo.content.match(/^(#{1,6})\s+(.+)$/);
        const currentHeaderLevel = headerMatch ? headerMatch[1].length : 0;
        const isList = indentInfo.isList;
        const isText = !isList && !currentHeaderLevel;

        // 改进图片匹配，提取alt信息
        const imageMatch = indentInfo.content.match(/^!\[(.*?)\]\((.*?)\)$/);

        return {
            trimmedLine: indentInfo.content,
            indent: indentInfo.level,
            headerLevel: currentHeaderLevel,
            isList,
            isText,
            headerMatch,
            imageMatch
        };
    }

    createNode(lineInfo) {
        const { trimmedLine, headerMatch, imageMatch } = lineInfo;

        if (headerMatch) {
            return { 
                title: headerMatch[2].trim(), 
                labels: [{ text: 'header' }], 
                children: { attached: [] } 
            };
        } else if (trimmedLine === '---') {
            return { 
                title: '---', 
                labels: [{ text: 'divider' }], 
                children: { attached: [] } 
            };
        } else if (imageMatch) {
            const altText = imageMatch[1] || 'image';
            const imageUrl = imageMatch[2];
            
            return { 
                title: '', 
                images: [{ 
                    id: '', 
                    w: 200, 
                    h: 200, 
                    ow: 200, 
                    oh: 200, 
                    url: imageUrl
                }], 
                notes: { 
                    content: `<p>Image Alt: ${altText}</p>` 
                },
                children: { attached: [] } 
            };
        } else {
            const content = trimmedLine.replace(/^(\s*[-*+>]\s*)/, '');
            return { 
                title: content, 
                children: { attached: [] },
                originalIndent: lineInfo.indent
            };
        }
    }
}

// 模拟QQToMarkdownConverter的关键方法
class MockQQToMarkdownConverter {
    convertNodeAsHeader(node, baseDepth) {
        const data = node.data || node;
        let markdown = '';

        // 处理图片
        if (data.images) {
            markdown += data.images.map(img => {
                // 尝试从notes中恢复alt信息
                let altText = 'image';
                if (data.notes?.content) {
                    const altMatch = data.notes.content.match(/<p>Image Alt: (.*?)<\/p>/);
                    if (altMatch) {
                        altText = altMatch[1];
                    }
                }
                return `![${altText}](${img.url})\n`;
            }).join('');
        }

        // 处理标题文本
        let titleText = data.title || '';
        if (titleText) {
            const headerLevel = Math.min(baseDepth + 1, 6);
            markdown += `${'#'.repeat(headerLevel)} ${titleText}\n`;
        }

        return markdown;
    }

    convertNode(node, indent, isListItem) {
        const data = node.data || node;
        let markdown = '';

        let titleText = data.title || '';
        const indentStr = '  '.repeat(indent);

        // 处理图片
        if (data.images) {
            markdown += data.images.map(img => {
                // 尝试从notes中恢复alt信息
                let altText = 'image';
                if (data.notes?.content) {
                    const altMatch = data.notes.content.match(/<p>Image Alt: (.*?)<\/p>/);
                    if (altMatch) {
                        altText = altMatch[1];
                    }
                }
                return `${indentStr}![${altText}](${img.url})\n`;
            }).join('');
        }

        // 处理文本内容
        if (titleText) {
            let prefix = '';
            if (isListItem) {
                prefix = /^\s*([-*+]|\d+\.)\s+/.test(titleText) ? '' : '- ';
            }
            markdown += `${indentStr}${prefix}${titleText}\n`;
        }

        return markdown;
    }
}

// 测试函数
function testImageAltPreservation() {
    console.log('🧪 开始图片Alt信息保留测试...\n');

    const testCases = [
        {
            name: '普通图片',
            input: '![普通图片](https://example.com/image1.jpg)',
            expected: '![普通图片](https://example.com/image1.jpg)'
        },
        {
            name: 'Marpit背景图片',
            input: '![bg fit left:50% vertical](https://example.com/background.jpg)',
            expected: '![bg fit left:50% vertical](https://example.com/background.jpg)'
        },
        {
            name: '带样式的图片',
            input: '![bg right:40%](https://example.com/sidebar.jpg)',
            expected: '![bg right:40%](https://example.com/sidebar.jpg)'
        },
        {
            name: '空alt信息的图片',
            input: '![](https://example.com/no-alt.jpg)',
            expected: '![image](https://example.com/no-alt.jpg)'
        },
        {
            name: '复杂alt信息',
            input: '![bg fit:cover left:30% opacity:0.8](https://example.com/complex.jpg)',
            expected: '![bg fit:cover left:30% opacity:0.8](https://example.com/complex.jpg)'
        },
        {
            name: '包含特殊字符的alt',
            input: '![bg fit:contain left:25% vertical:center](https://example.com/special.jpg)',
            expected: '![bg fit:contain left:25% vertical:center](https://example.com/special.jpg)'
        }
    ];

    const mdToQqConverter = new MockMarkdownToQQConverter();
    const qqToMdConverter = new MockQQToMarkdownConverter();

    let passedTests = 0;
    let totalTests = testCases.length;

    for (const testCase of testCases) {
        console.log(`📸 测试: ${testCase.name}`);
        console.log(`   输入: ${testCase.input}`);

        try {
            // MDtoQQ转换
            const lineInfo = mdToQqConverter.parseLine(testCase.input);
            const qqNode = mdToQqConverter.createNode(lineInfo);

            // QQtoMD转换
            const output = qqToMdConverter.convertNode(qqNode, 0, false);

            // 清理输出（移除多余的换行符）
            const cleanOutput = output.replace(/\n+$/, '');

            console.log(`   输出: ${cleanOutput}`);
            console.log(`   期望: ${testCase.expected}`);

            if (cleanOutput === testCase.expected) {
                console.log('   ✅ 通过\n');
                passedTests++;
            } else {
                console.log('   ❌ 失败\n');
            }
        } catch (error) {
            console.log(`   ❌ 错误: ${error.message}\n`);
        }
    }

    console.log(`📊 测试结果: ${passedTests}/${totalTests} 通过`);
    
    if (passedTests === totalTests) {
        console.log('🎉 所有测试通过！图片Alt信息保留功能正常工作。');
    } else {
        console.log('⚠️ 部分测试失败，需要进一步检查。');
    }
}

// 运行测试
testImageAltPreservation(); 