/**
 * StyleProcessor 单元测试
 */

// 模拟浏览器环境
if (typeof window === 'undefined') {
    global.window = {};
}

// 加载StyleProcessor
const StyleProcessor = require('../core/formatters/shared/styleProcessor.js');

describe('StyleProcessor', () => {
    let styleProcessor;

    beforeEach(() => {
        styleProcessor = new StyleProcessor();
    });

    describe('applyQQStyles', () => {
        test('应该正确处理粗体样式', () => {
            const textNode = { text: '粗体文本', fontWeight: 700 };
            const result = styleProcessor.applyQQStyles(textNode);
            expect(result).toBe('**粗体文本**');
        });

        test('应该正确处理斜体样式', () => {
            const textNode = { text: '斜体文本', italic: true };
            const result = styleProcessor.applyQQStyles(textNode);
            expect(result).toBe('*斜体文本*');
        });

        test('应该正确处理删除线样式', () => {
            const textNode = { text: '删除线文本', strike: true };
            const result = styleProcessor.applyQQStyles(textNode);
            expect(result).toBe('~~删除线文本~~');
        });

        test('应该正确处理高亮样式', () => {
            const textNode = { text: '高亮文本', backgroundColor: '#FFF3A1' };
            const result = styleProcessor.applyQQStyles(textNode);
            expect(result).toBe('==高亮文本==');
        });

        test('应该正确处理下划线样式', () => {
            const textNode = { text: '下划线文本', underline: true };
            const result = styleProcessor.applyQQStyles(textNode);
            expect(result).toBe('<u>下划线文本</u>');
        });

        test('应该正确处理内联代码样式', () => {
            const textNode = { text: 'code', fontFamily: 'monospace' };
            const result = styleProcessor.applyQQStyles(textNode);
            expect(result).toBe('`code`');
        });

        test('应该正确处理颜色样式', () => {
            const textNode = { text: '彩色文本', color: '#FF0000' };
            const result = styleProcessor.applyQQStyles(textNode);
            expect(result).toBe('<span style="color: #FF0000">彩色文本</span>');
        });

        test('应该正确处理背景色样式', () => {
            const textNode = { text: '背景色文本', backgroundColor: '#FFFF00' };
            const result = styleProcessor.applyQQStyles(textNode);
            expect(result).toBe('<span style="background-color: #FFFF00">背景色文本</span>');
        });

        test('应该正确处理多种样式组合', () => {
            const textNode = { 
                text: '组合样式文本', 
                fontWeight: 700, 
                italic: true,
                backgroundColor: '#FFF3A1'
            };
            const result = styleProcessor.applyQQStyles(textNode);
            expect(result).toBe('**==*组合样式文本*==**');
        });

        test('应该处理空文本', () => {
            const textNode = { text: '' };
            const result = styleProcessor.applyQQStyles(textNode);
            expect(result).toBe('');
        });

        test('应该处理没有text属性的节点', () => {
            const textNode = { fontWeight: 700 };
            const result = styleProcessor.applyQQStyles(textNode);
            expect(result).toBe('**');
        });
    });

    describe('mergeStyles', () => {
        test('应该正确合并样式栈', () => {
            const styleStack = [
                { fontWeight: 700 },
                { italic: true },
                { backgroundColor: '#FFF3A1' }
            ];
            const result = styleProcessor.mergeStyles(styleStack);
            expect(result).toEqual({
                fontWeight: 700,
                italic: true,
                backgroundColor: '#FFF3A1'
            });
        });

        test('应该处理空样式栈', () => {
            const result = styleProcessor.mergeStyles([]);
            expect(result).toEqual({});
        });

        test('应该处理单个样式', () => {
            const styleStack = [{ fontWeight: 700 }];
            const result = styleProcessor.mergeStyles(styleStack);
            expect(result).toEqual({ fontWeight: 700 });
        });
    });

    describe('validateRichTextNode', () => {
        test('应该验证有效的富文本节点', () => {
            const textNode = { text: '有效文本', fontWeight: 700 };
            const result = styleProcessor.validateRichTextNode(textNode);
            expect(result).toBe(true);
        });

        test('应该拒绝无效的富文本节点', () => {
            const textNode = { fontWeight: 700 }; // 缺少text属性
            const result = styleProcessor.validateRichTextNode(textNode);
            expect(result).toBe(false);
        });

        test('应该拒绝null节点', () => {
            const result = styleProcessor.validateRichTextNode(null);
            expect(result).toBe(false);
        });

        test('应该拒绝非对象节点', () => {
            const result = styleProcessor.validateRichTextNode('string');
            expect(result).toBe(false);
        });

        test('应该拒绝包含无效样式的节点', () => {
            const textNode = { text: '文本', invalidStyle: 'value' };
            const result = styleProcessor.validateRichTextNode(textNode);
            expect(result).toBe(false);
        });
    });

    describe('buildQQNodesFromTokens', () => {
        test('应该处理文本token', () => {
            const tokens = [{ type: 'text', content: '普通文本' }];
            const result = styleProcessor.buildQQNodesFromTokens(tokens);
            expect(result).toEqual([{ type: 'text', text: '普通文本' }]);
        });

        test('应该处理粗体token', () => {
            const tokens = [{ 
                type: 'strong', 
                content: '粗体文本',
                children: [{ type: 'text', content: '粗体文本' }]
            }];
            const result = styleProcessor.buildQQNodesFromTokens(tokens);
            expect(result).toEqual([{ 
                type: 'text', 
                text: '粗体文本',
                fontWeight: 700
            }]);
        });

        test('应该处理斜体token', () => {
            const tokens = [{ 
                type: 'em', 
                content: '斜体文本',
                children: [{ type: 'text', content: '斜体文本' }]
            }];
            const result = styleProcessor.buildQQNodesFromTokens(tokens);
            expect(result).toEqual([{ 
                type: 'text', 
                text: '斜体文本',
                italic: true
            }]);
        });

        test('应该处理内联代码token', () => {
            const tokens = [{ type: 'code_inline', content: 'code' }];
            const result = styleProcessor.buildQQNodesFromTokens(tokens);
            expect(result).toEqual([{ 
                type: 'text', 
                text: '`code`'
            }]);
        });

        test('应该处理嵌套样式', () => {
            const tokens = [{ 
                type: 'strong', 
                content: '粗体中的斜体',
                children: [{ 
                    type: 'em', 
                    content: '斜体',
                    children: [{ type: 'text', content: '斜体' }]
                }]
            }];
            const result = styleProcessor.buildQQNodesFromTokens(tokens);
            expect(result).toEqual([{ 
                type: 'text', 
                text: '斜体',
                fontWeight: 700,
                italic: true
            }]);
        });
    });

    describe('fixDuplicateBoldMarkers', () => {
        test('应该修复连续的粗体标记', () => {
            const text = '**数据格式：****`距离,归一化值`**';
            const result = styleProcessor.fixDuplicateBoldMarkers(text);
            expect(result).toBe('**数据格式：** **`距离,归一化值`**');
        });

        test('应该保持正常的粗体标记不变', () => {
            const text = '**正常粗体**';
            const result = styleProcessor.fixDuplicateBoldMarkers(text);
            expect(result).toBe('**正常粗体**');
        });

        test('应该处理没有连续粗体标记的文本', () => {
            const text = '普通文本';
            const result = styleProcessor.fixDuplicateBoldMarkers(text);
            expect(result).toBe('普通文本');
        });
    });

    describe('extractQQTextStyles', () => {
        test('应该提取QQ文本样式', () => {
            const titleObject = {
                children: [{
                    children: [
                        { text: '高亮文本', backgroundColor: '#FFF3A1' },
                        { text: '粗体文本', fontWeight: 700 },
                        { text: '斜体文本', italic: true },
                        { text: '删除线文本', strike: true }
                    ]
                }]
            };
            const result = styleProcessor.extractQQTextStyles(titleObject);
            expect(result).toEqual({
                highlight: true,
                bold: true,
                italic: true,
                strikethrough: true
            });
        });

        test('应该处理空的标题对象', () => {
            const result = styleProcessor.extractQQTextStyles({});
            expect(result).toEqual({});
        });

        test('应该处理没有children的标题对象', () => {
            const result = styleProcessor.extractQQTextStyles({ title: 'test' });
            expect(result).toEqual({});
        });
    });

    describe('getStyleMappings', () => {
        test('应该返回QQ到Markdown的样式映射', () => {
            const result = styleProcessor.getStyleMappings('qqToMd');
            expect(result).toBe(styleProcessor.qqToMdMappings);
        });

        test('应该返回Markdown到QQ的样式映射', () => {
            const result = styleProcessor.getStyleMappings('mdToQq');
            expect(result).toBe(styleProcessor.mdToQqMappings);
        });
    });

    describe('validateStyles', () => {
        test('应该验证有效的样式对象', () => {
            const styles = { fontWeight: 700, italic: true };
            const result = styleProcessor.validateStyles(styles);
            expect(result).toBe(true);
        });

        test('应该拒绝包含无效样式的对象', () => {
            const styles = { fontWeight: 700, invalidStyle: true };
            const result = styleProcessor.validateStyles(styles);
            expect(result).toBe(false);
        });

        test('应该拒绝null样式对象', () => {
            const result = styleProcessor.validateStyles(null);
            expect(result).toBe(false);
        });

        test('应该拒绝非对象样式', () => {
            const result = styleProcessor.validateStyles('string');
            expect(result).toBe(false);
        });
    });
}); 