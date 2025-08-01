/**
 * HTML工具类
 * 负责处理HTML解码、文本转换等操作
 */

class HtmlUtils {
    /**
     * 解码HTML实体 (从 qq2md.js 提取)
     * @param {string} text - 包含HTML实体的文本
     * @returns {string} 解码后的文本
     */
    decodeHtmlEntities(text) {
        // 修复：改进HTML实体解码
        try {
            // 首先处理QQ思维导图特有的实体
            let decodedText = text
                .replace(/&nbsp;/g, ' ')  // 空格
                .replace(/&lt;/g, '<')    // 小于号
                .replace(/&gt;/g, '>')    // 大于号
                .replace(/&amp;/g, '&')   // 和号
                .replace(/&quot;/g, '"')  // 双引号
                .replace(/&#39;/g, "'");  // 单引号
            
            // 处理十进制HTML实体（包括中文字符）
            decodedText = decodedText.replace(/&#(\d+);/g, (match, dec) => {
                return String.fromCharCode(parseInt(dec, 10));
            });
            
            // 处理十六进制HTML实体
            decodedText = decodedText.replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => {
                return String.fromCharCode(parseInt(hex, 16));
            });
            
            return decodedText;
        } catch (error) {
            // 回退到手动解码常见实体
            return text
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'")
                .replace(/&nbsp;/g, ' ');
        }
    }

    /**
     * 简化的HTML到文本转换 (从 qq2md.js 提取)
     * @param {string} html - HTML内容
     * @returns {string} 纯文本内容
     */
    simpleHtmlToText(html) {
        if (!html) return '';
        
        let text = html;
        
        // 移除HTML标签，但保留内容
        text = text.replace(/<br\s*\/?>/gi, '\n');
        text = text.replace(/<\/?p[^>]*>/gi, '\n');
        text = text.replace(/<\/?div[^>]*>/gi, '\n');
        text = text.replace(/<\/?span[^>]*>/gi, '');
        text = text.replace(/<\/?code[^>]*>/gi, '');
        text = text.replace(/<\/?pre[^>]*>/gi, '');
        
        // 解码HTML实体
        text = this.decodeHtmlEntities(text);
        
        // 修复：更精确地处理空格和换行符，但保留原始格式
        // 将多个连续的换行符合并为两个换行符
        text = text.replace(/\n{3,}/g, '\n\n');
        
        return text;
    }

    /**
     * 转换注释HTML为纯文本 (从 qq2md.js 提取)
     * @param {string} html - HTML内容
     * @param {Object} qqParser - QQ解析器实例
     * @returns {string} 纯文本内容
     */
    convertNoteHtmlToPlainText(html, qqParser) {
        // 优先使用注入的 QQMindMapParser
        if (qqParser && typeof qqParser.convertNoteHtmlToPlainText === 'function') {
            return qqParser.convertNoteHtmlToPlainText(html);
        }
        
        // 降级到原始实现
        try {
            // 在Node.js环境中使用jsdom
            if (typeof window === 'undefined' || !window.DOMParser) {
                // 使用简化的HTML解析
                return this.simpleHtmlToText(html);
            }
            
            const doc = new DOMParser().parseFromString(html, 'text/html');
            doc.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
            return doc.body.textContent || '';
        } catch (error) {
            console.log('DOMParser failed, using fallback:', error.message);
            return this.simpleHtmlToText(html);
        }
    }
} 