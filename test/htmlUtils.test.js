/**
 * HtmlUtils 单元测试
 * 测试HTML工具功能
 */

describe('HtmlUtils', () => {
    let htmlUtils;

    beforeEach(() => {
        htmlUtils = new HtmlUtils();
    });

    describe('decodeHtmlEntities', () => {
        test('should decode basic HTML entities', () => {
            const encoded = '&lt;script&gt;alert(&quot;test&quot;)&lt;/script&gt;';
            const result = htmlUtils.decodeHtmlEntities(encoded);

            expect(result).toBe('<script>alert("test")</script>');
        });

        test('should handle Chinese characters', () => {
            const encoded = '&#x58F0;&#x97F3;&#x65C5;&#x7A0B;';
            const result = htmlUtils.decodeHtmlEntities(encoded);

            expect(result).toBe('声旅程');
        });

        test('should handle decimal entities', () => {
            const encoded = '&#60;&#62;&#38;&#34;&#39;';
            const result = htmlUtils.decodeHtmlEntities(encoded);

            expect(result).toBe('<>"\'');
        });

        test('should handle mixed entities', () => {
            const encoded = 'Hello &lt;World&gt; &#x58F0;&#x97F3; &amp; Test';
            const result = htmlUtils.decodeHtmlEntities(encoded);

            expect(result).toBe('Hello <World> 声音 & Test');
        });

        test('should handle empty string', () => {
            const result = htmlUtils.decodeHtmlEntities('');

            expect(result).toBe('');
        });

        test('should handle null input', () => {
            const result = htmlUtils.decodeHtmlEntities(null);

            expect(result).toBe('');
        });

        test('should handle undefined input', () => {
            const result = htmlUtils.decodeHtmlEntities(undefined);

            expect(result).toBe('');
        });

        test('should handle text without entities', () => {
            const text = 'Hello World';
            const result = htmlUtils.decodeHtmlEntities(text);

            expect(result).toBe('Hello World');
        });

        test('should handle error gracefully', () => {
            // 模拟解码错误
            const originalStringFromCharCode = String.fromCharCode;
            String.fromCharCode = jest.fn().mockImplementation(() => {
                throw new Error('Invalid character code');
            });

            const encoded = '&#999999;'; // 无效的字符代码
            const result = htmlUtils.decodeHtmlEntities(encoded);

            expect(result).toBe('&amp;&lt;&gt;&quot;&#39;&nbsp;');

            // 恢复原始函数
            String.fromCharCode = originalStringFromCharCode;
        });
    });

    describe('simpleHtmlToText', () => {
        test('should convert HTML to text', () => {
            const html = '<p>Hello <strong>World</strong></p><br><p>Test</p>';
            const result = htmlUtils.simpleHtmlToText(html);

            expect(result).toContain('Hello World');
            expect(result).toContain('Test');
        });

        test('should handle empty HTML', () => {
            const result = htmlUtils.simpleHtmlToText('');

            expect(result).toBe('');
        });

        test('should handle null HTML', () => {
            const result = htmlUtils.simpleHtmlToText(null);

            expect(result).toBe('');
        });

        test('should handle undefined HTML', () => {
            const result = htmlUtils.simpleHtmlToText(undefined);

            expect(result).toBe('');
        });

        test('should replace br tags with newlines', () => {
            const html = 'Line 1<br>Line 2<br/>Line 3';
            const result = htmlUtils.simpleHtmlToText(html);

            expect(result).toContain('Line 1\nLine 2\nLine 3');
        });

        test('should replace p tags with newlines', () => {
            const html = '<p>Paragraph 1</p><p>Paragraph 2</p>';
            const result = htmlUtils.simpleHtmlToText(html);

            expect(result).toContain('Paragraph 1\nParagraph 2');
        });

        test('should replace div tags with newlines', () => {
            const html = '<div>Div 1</div><div>Div 2</div>';
            const result = htmlUtils.simpleHtmlToText(html);

            expect(result).toContain('Div 1\nDiv 2');
        });

        test('should remove span tags', () => {
            const html = '<span>Text</span><span>More text</span>';
            const result = htmlUtils.simpleHtmlToText(html);

            expect(result).toBe('TextMore text');
        });

        test('should remove code tags', () => {
            const html = '<code>console.log("test")</code>';
            const result = htmlUtils.simpleHtmlToText(html);

            expect(result).toBe('console.log("test")');
        });

        test('should remove pre tags', () => {
            const html = '<pre>function test() { return true; }</pre>';
            const result = htmlUtils.simpleHtmlToText(html);

            expect(result).toBe('function test() { return true; }');
        });

        test('should handle nested tags', () => {
            const html = '<p>Hello <strong>World</strong> <em>Test</em></p>';
            const result = htmlUtils.simpleHtmlToText(html);

            expect(result).toContain('Hello World Test');
        });

        test('should normalize multiple newlines', () => {
            const html = '<p>Text 1</p>\n\n<p>Text 2</p>\n\n\n<p>Text 3</p>';
            const result = htmlUtils.simpleHtmlToText(html);

            expect(result).toMatch(/Text 1\n\nText 2\n\nText 3/);
        });

        test('should decode HTML entities in text', () => {
            const html = '<p>Hello &lt;World&gt; &amp; Test</p>';
            const result = htmlUtils.simpleHtmlToText(html);

            expect(result).toContain('Hello <World> & Test');
        });
    });

    describe('convertNoteHtmlToPlainText', () => {
        test('should use QQMindMapParser if available', () => {
            const mockQqParser = {
                convertNoteHtmlToPlainText: jest.fn().mockReturnValue('Parsed text')
            };
            const html = '<p>Test HTML</p>';

            const result = htmlUtils.convertNoteHtmlToPlainText(html, mockQqParser);

            expect(result).toBe('Parsed text');
            expect(mockQqParser.convertNoteHtmlToPlainText).toHaveBeenCalledWith(html);
        });

        test('should fallback to simpleHtmlToText if parser not available', () => {
            const html = '<p>Hello <strong>World</strong></p>';
            const result = htmlUtils.convertNoteHtmlToPlainText(html, null);

            expect(result).toContain('Hello World');
        });

        test('should handle DOMParser in browser environment', () => {
            // 模拟浏览器环境
            global.window = {
                DOMParser: class {
                    parseFromString(html, type) {
                        return {
                            querySelectorAll: jest.fn().mockReturnValue([]),
                            body: { textContent: 'Parsed content' }
                        };
                    }
                }
            };

            const html = '<p>Test content</p>';
            const result = htmlUtils.convertNoteHtmlToPlainText(html, null);

            expect(result).toBe('Parsed content');

            // 清理模拟
            delete global.window;
        });

        test('should handle DOMParser failure', () => {
            // 模拟DOMParser失败
            global.window = {
                DOMParser: class {
                    parseFromString() {
                        throw new Error('DOMParser error');
                    }
                }
            };

            const html = '<p>Test content</p>';
            const result = htmlUtils.convertNoteHtmlToPlainText(html, null);

            expect(result).toContain('Test content');

            // 清理模拟
            delete global.window;
        });

        test('should handle Node.js environment', () => {
            // 模拟Node.js环境
            delete global.window;

            const html = '<p>Test content</p>';
            const result = htmlUtils.convertNoteHtmlToPlainText(html, null);

            expect(result).toContain('Test content');
        });

        test('should handle empty HTML', () => {
            const result = htmlUtils.convertNoteHtmlToPlainText('', null);

            expect(result).toBe('');
        });

        test('should handle null HTML', () => {
            const result = htmlUtils.convertNoteHtmlToPlainText(null, null);

            expect(result).toBe('');
        });
    });

    describe('complex scenarios', () => {
        test('should handle complex HTML with mixed content', () => {
            const html = `
                <p>Introduction</p>
                <div>Main content with <strong>bold</strong> and <em>italic</em> text.</div>
                <br>
                <p>Code example: <code>console.log("test")</code></p>
                <pre><code>function test() {
    return true;
}</code></pre>
                <p>End with &lt;special&gt; characters &amp; symbols.</p>
            `;

            const result = htmlUtils.simpleHtmlToText(html);

            expect(result).toContain('Introduction');
            expect(result).toContain('Main content with bold and italic text');
            expect(result).toContain('Code example: console.log("test")');
            expect(result).toContain('function test() {');
            expect(result).toContain('End with <special> characters & symbols');
        });

        test('should handle Chinese content with entities', () => {
            const html = '<p>中文内容 &#x58F0;&#x97F3; 测试</p>';
            const result = htmlUtils.simpleHtmlToText(html);

            expect(result).toContain('中文内容 声音 测试');
        });

        test('should handle mixed language content', () => {
            const html = `
                <p>English: Hello World</p>
                <p>中文: 你好世界</p>
                <p>Code: &lt;script&gt;alert("test")&lt;/script&gt;</p>
            `;

            const result = htmlUtils.simpleHtmlToText(html);

            expect(result).toContain('English: Hello World');
            expect(result).toContain('中文: 你好世界');
            expect(result).toContain('Code: <script>alert("test")</script>');
        });
    });
}); 