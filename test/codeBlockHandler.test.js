/**
 * CodeBlockHandler 单元测试
 * 测试代码块处理功能
 */

// 模拟依赖
const mockRichTextFormatter = {
    format: jest.fn((text) => ({ children: [{ text }] })),
    convertQQToMarkdown: jest.fn((obj) => obj.children?.[0]?.text || obj)
};

const mockHe = {
    encode: jest.fn((text) => text.replace(/</g, '&lt;').replace(/>/g, '&gt;')),
    decode: jest.fn((text) => text.replace(/&lt;/g, '<').replace(/&gt;/g, '>'))
};

describe('CodeBlockHandler', () => {
    let handler;

    beforeEach(() => {
        handler = new CodeBlockHandler(mockRichTextFormatter, mockHe);
    });

    describe('createCodeBlockNode', () => {
        test('should create code block node correctly', () => {
            const codeLines = ['console.log("test");', 'return true;'];
            const language = 'javascript';
            const mockMarkdownIt = {};

            const result = handler.createCodeBlockNode(codeLines, language, mockMarkdownIt);

            expect(result.id).toBeDefined();
            expect(result.labels).toContainEqual({ 
                id: 'qq-mind-map-code-block-label',
                text: 'code-block',
                backgroundColor: 'rgb(172, 226, 197)',
                color: '#000000'
            });
            expect(result.notes.content).toContain('console.log("test")');
            expect(result.collapse).toBe(false);
            expect(result.children.attached).toEqual([]);
        });

        test('should handle empty code lines', () => {
            const codeLines = [];
            const language = 'python';
            const mockMarkdownIt = {};

            const result = handler.createCodeBlockNode(codeLines, language, mockMarkdownIt);

            expect(result.title).toBeDefined();
            expect(result.labels).toContainEqual({ text: 'code-block' });
            expect(result.notes.content).toContain('```python');
        });

        test('should handle code with special characters', () => {
            const codeLines = ['<script>alert("test")</script>'];
            const language = 'html';
            const mockMarkdownIt = {};

            const result = handler.createCodeBlockNode(codeLines, language, mockMarkdownIt);

            expect(result.notes.content).toContain('&lt;script&gt;');
            expect(result.notes.content).not.toContain('<script>');
        });
    });

    describe('convertCodeLinesToQQHtml', () => {
        test('should convert code lines to QQ HTML format', () => {
            const codeLines = ['function test() {', '  return true;', '}'];
            const language = 'javascript';

            const result = handler.convertCodeLinesToQQHtml(codeLines, language);

            expect(result).toContain('<p>```javascript<br>');
            expect(result).toContain('function test() {');
            expect(result).toContain('```</p>');
        });

        test('should handle empty lines correctly', () => {
            const codeLines = ['line1', '', 'line2'];
            const language = 'python';

            const result = handler.convertCodeLinesToQQHtml(codeLines, language);

            expect(result).toContain('<p><br></p>');
            expect(result).toContain('line1');
            expect(result).toContain('line2');
        });

        test('should handle code without language', () => {
            const codeLines = ['console.log("test");'];
            const language = '';

            const result = handler.convertCodeLinesToQQHtml(codeLines, language);

            expect(result).toContain('<p>```<br>');
            expect(result).toContain('console.log("test");');
        });

        test('should handle code with tabs and newlines correctly', () => {
            const codeLines = [
                'graph TD',
                '\tA[Arduino传感器] --> B[串口数据]',
                '\tB --> C[TouchDesigner接收]',
                '\tC --> D[视觉艺术创作]',
                '\tD --> E[互动体验]'
            ];
            const language = 'mermaid';

            const result = handler.convertCodeLinesToQQHtml(codeLines, language);

            expect(result).toContain('<p>```mermaid<br>');
            expect(result).toContain('graph TD');
            expect(result).toContain('A[Arduino传感器]');
            expect(result).toContain('```</p>');
        });
    });

    describe('processCodeLine', () => {
        test('should encode HTML entities', () => {
            const line = '<script>alert("test")</script>';
            const result = handler.processCodeLine(line);

            expect(result).toContain('&lt;script&gt;');
            expect(result).not.toContain('<script>');
        });

        test('should handle normal text', () => {
            const line = 'console.log("Hello World");';
            const result = handler.processCodeLine(line);

            expect(result).toBe('console.log("Hello World");');
        });

        test('should handle Chinese characters', () => {
            const line = 'console.log("你好世界");';
            const result = handler.processCodeLine(line);

            expect(result).toBe('console.log("你好世界");');
        });
    });

    describe('convertCodeBlock', () => {
        test('should convert QQ code block to markdown', () => {
            const node = {
                title: { children: [{ text: '```javascript' }] },
                notes: { content: '<p>console.log("test");</p>' }
            };

            const result = handler.convertCodeBlock(node, mockRichTextFormatter);

            expect(result).toContain('```javascript');
            expect(result).toContain('console.log("test");');
            expect(result).toContain('```');
        });

        test('should handle code block without language', () => {
            const node = {
                title: { children: [{ text: '```' }] },
                notes: { content: '<p>console.log("test");</p>' }
            };

            const result = handler.convertCodeBlock(node, mockRichTextFormatter);

            expect(result).toContain('```');
            expect(result).toContain('console.log("test");');
        });

        test('should extract code from notes content', () => {
            const node = {
                title: { children: [{ text: '```python' }] },
                notes: { content: '<p>```python<br>print("Hello")<br>```</p>' }
            };

            const result = handler.convertCodeBlock(node, mockRichTextFormatter);

            expect(result).toContain('```python');
            expect(result).toContain('print("Hello")');
        });
    });

    describe('extractCodeFromNotes', () => {
        test('should extract code from HTML content', () => {
            const htmlContent = '<p>```javascript<br>console.log("test");<br>```</p>';
            const result = handler.extractCodeFromNotes(htmlContent);

            expect(result).toContain('console.log("test");');
            expect(result).not.toContain('```javascript');
        });

        test('should handle pre/code tags', () => {
            const htmlContent = '<pre><code>console.log("test");</code></pre>';
            const result = handler.extractCodeFromNotes(htmlContent);

            expect(result).toContain('console.log("test");');
        });

        test('should handle empty content', () => {
            const htmlContent = '';
            const result = handler.extractCodeFromNotes(htmlContent);

            expect(result).toBe('');
        });

        test('should handle code with tabs and newlines correctly', () => {
            const htmlContent = '<p>```mermaid<br>graph TD<br>\\tA[Arduino传感器] --> B[串口数据]<br>\\tB --> C[TouchDesigner接收]<br>\\tC --> D[视觉艺术创作]<br>\\tD --> E[互动体验]<br>```</p>';
            const result = handler.extractCodeFromNotes(htmlContent);

            expect(result).toContain('graph TD');
            expect(result).toContain('    A[Arduino传感器] --> B[串口数据]');
            expect(result).toContain('    B --> C[TouchDesigner接收]');
            expect(result).toContain('    C --> D[视觉艺术创作]');
            expect(result).toContain('    D --> E[互动体验]');
            
            // 验证换行符正确保留
            const lines = result.split('\n');
            expect(lines).toContain('graph TD');
            expect(lines).toContain('    A[Arduino传感器] --> B[串口数据]');
            expect(lines).toContain('    B --> C[TouchDesigner接收]');
        });
    });

    describe('cleanCodeBlockMarkers', () => {
        test('should remove code block markers', () => {
            const codeContent = '```javascript\nconsole.log("test");\n```';
            const result = handler.cleanCodeBlockMarkers(codeContent);

            expect(result).toBe('console.log("test");');
            expect(result).not.toContain('```');
        });

        test('should handle multiple code blocks', () => {
            const codeContent = '```js\ncode1\n```\n```js\ncode2\n```';
            const result = handler.cleanCodeBlockMarkers(codeContent);

            expect(result).toContain('code1');
            expect(result).toContain('code2');
            expect(result).not.toContain('```');
        });

        test('should preserve code content', () => {
            const codeContent = '```python\nprint("Hello")\nreturn True\n```';
            const result = handler.cleanCodeBlockMarkers(codeContent);

            expect(result).toContain('print("Hello")');
            expect(result).toContain('return True');
        });
    });

    describe('decodeHtmlEntities', () => {
        test('should decode HTML entities', () => {
            const encoded = '&lt;script&gt;alert(&quot;test&quot;)&lt;/script&gt;';
            const result = handler.decodeHtmlEntities(encoded);

            expect(result).toBe('<script>alert("test")</script>');
        });

        test('should handle Chinese characters', () => {
            const encoded = '&#x58F0;&#x97F3;&#x65C5;&#x7A0B;';
            const result = handler.decodeHtmlEntities(encoded);

            expect(result).toBe('声旅程');
        });

        test('should handle decimal entities', () => {
            const encoded = '&#60;&#62;&#38;';
            const result = handler.decodeHtmlEntities(encoded);

            expect(result).toBe('<>');
        });
    });

    describe('simpleHtmlToText', () => {
        test('should convert HTML to text', () => {
            const html = '<p>Hello <strong>World</strong></p><br><p>Test</p>';
            const result = handler.simpleHtmlToText(html);

            expect(result).toContain('Hello World');
            expect(result).toContain('Test');
        });

        test('should handle empty HTML', () => {
            const html = '';
            const result = handler.simpleHtmlToText(html);

            expect(result).toBe('');
        });

        test('should handle null HTML', () => {
            const result = handler.simpleHtmlToText(null);

            expect(result).toBe('');
        });
    });
}); 