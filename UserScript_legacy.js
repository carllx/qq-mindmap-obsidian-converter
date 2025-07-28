// ==UserScript==
// @name         QQ Mind Map to Obsidian Converter
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  Converts QQ Mind Map to Obsidian Markdown and vice-versa, with support for references and presentation notes.
// @author       carllx & Gemini
// @match        https://docs.qq.com/mind/*
// @grant        GM_setClipboard
// @grant        GM_getClipboard
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @require      https://cdn.jsdelivr.net/npm/markdown-it@14.1.0/dist/markdown-it.min.js
// @require      https://cdn.jsdelivr.net/npm/dompurify@3.1.5/dist/purify.min.js
// @icon         https://forum.obsidian.md/uploads/default/optimized/3X/a/b/abf9faf124ba8edea7e6e644ec69d669b49baa30_2_32x32.png
// ==/UserScript==

(function() {
    'use strict';

    // --- NOTIFICATION HELPER ---
    function showNotification(message, type = 'success', duration = 3000) {
        const notification = document.createElement('div');
        notification.id = 'converter-notification';
        notification.textContent = message;
        const successColor = '#4CAF50';
        const errorColor = '#f44336';

        GM_addStyle(`
            #converter-notification {
                position: fixed;
                top: -50px; /* Start off-screen */
                left: 50%;
                transform: translateX(-50%);
                background-color: ${type === 'success' ? successColor : errorColor};
                color: white;
                padding: 12px 20px;
                border-radius: 5px;
                z-index: 10000;
                font-size: 14px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                transition: top 0.5s ease, opacity 0.5s ease;
                opacity: 0;
            }
        `);
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.top = '20px';
            notification.style.opacity = '1';
        }, 100);

        // Animate out and remove
        setTimeout(() => {
            notification.style.top = '-50px';
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 500);
        }, duration);
    }


    // --- CONFIGURATION ---
    const CONFIG = {
        autoDetect: true,
    };

    // --- UI MANAGER ---
    class UIManager {
        constructor(converter) {
            this.converter = converter;
            this.init();
        }

        init() {
            this.waitForUIAndInject();
            this.startClipboardListener();
        }

        waitForUIAndInject() {
            const interval = setInterval(() => {
                const targetSelector = '#editor-root > div > div > div.Footer_footer__DdscW';
                const footer = document.querySelector(targetSelector);
                if (footer) {
                    clearInterval(interval);
                    this.createUI(footer);
                    this.addEventListeners();
                }
            }, 500);
        }

        createUI(parentElement) {
            const container = document.createElement('div');
            container.id = 'converter-container';
            container.innerHTML = `
                <div id="qq-to-md" class="converter-button">QQ to MD</div>
                <div id="md-to-qq" class="converter-button">MD to QQ</div>
                <div class="converter-options">
                    <label><input type="checkbox" id="auto-detect" ${CONFIG.autoDetect ? 'checked' : ''}> Auto</label>
                </div>
            `;
            parentElement.prepend(container);
            GM_addStyle(this.getStyles());
        }

        getStyles() {
            return `
                #converter-container {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 0 10px;
                    height: 100%;
                }
                .converter-button {
                    z-index: 9999;
                    background: #3c3c3c;
                    color: white;
                    padding: 4px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                    border: 1px solid #555;
                    transition: background-color 0.2s;
                }
                .converter-button:hover {
                    background: #555;
                }
                .converter-options {
                    display: flex;
                    align-items: center;
                    z-index: 9999;
                }
                .converter-options label {
                    display: flex;
                    align-items: center;
                    color: #ccc;
                    font-size: 12px;
                    cursor: pointer;
                }
                .converter-options input {
                    margin-right: 4px;
                    cursor: pointer;
                }
            `;
        }

        addEventListeners() {
            document.getElementById('qq-to-md').addEventListener('click', () => this.converter.convertQQToMD());
            document.getElementById('md-to-qq').addEventListener('click', () => this.converter.convertMDToQQ());

            document.getElementById('auto-detect').addEventListener('change', (e) => {
                CONFIG.autoDetect = e.target.checked;
                this.startClipboardListener();
            });
        }

        updateButtonStyles(sourceType) {
            const qqToMdBtn = document.getElementById('qq-to-md');
            const mdToQqBtn = document.getElementById('md-to-qq');
            if (!qqToMdBtn || !mdToQqBtn) return;

            qqToMdBtn.style.background = sourceType === 'qq' ? '#4CAF50' : '#3c3c3c';
            mdToQqBtn.style.background = sourceType === 'md' ? '#4CAF50' : '#3c3c3c';
        }

        handleCopy = () => {
            this.updateButtonStyles('qq');
        }

        handlePaste = (event) => {
            const types = event.clipboardData.types;
            if (types.includes('text/html')) {
                this.updateButtonStyles('qq');
            } else if (types.includes('text/plain')) {
                this.updateButtonStyles('md');
            }
        }

        startClipboardListener() {
            document.removeEventListener('copy', this.handleCopy);
            document.removeEventListener('paste', this.handlePaste);

            if (CONFIG.autoDetect) {
                document.addEventListener('copy', this.handleCopy);
                document.addEventListener('paste', this.handlePaste);
            } else {
                this.updateButtonStyles('none');
            }
        }
    }

    // --- CONSTANTS ---
    const PRESENTATION_NODE_TITLE = 'Presentation';

    // --- CONVERTER ---
    class Converter {
        constructor() {
            this.md = window.markdownit({
                html: false,
                linkify: true,
            })
            .use(this.wikilinksPlugin)
            .use(this.highlightPlugin);

            this.md.enable('strikethrough');
        }

        highlightPlugin(md) {
            function highlight(state, silent) {
                const marker = '==';
                const start = state.pos;
                if (!state.src.startsWith(marker, start)) return false;

                const end = state.src.indexOf(marker, start + marker.length);
                if (end === -1) return false;

                if (!silent) {
                    state.push('highlight_open', 'mark', 1);
                    const textToken = state.push('text', '', 0);
                    textToken.content = state.src.slice(start + marker.length, end);
                    state.push('highlight_close', 'mark', -1);
                }

                state.pos = end + marker.length;
                return true;
            }
            md.inline.ruler.before('emphasis', 'highlight', highlight);
        }

        wikilinksPlugin(md) {
            const wikiLinkPattern = /[[^|\n]+(?:\|[^\n]+)?]]/;

            function wikilink(state, silent) {
                const src = state.src;
                const pos = state.pos;

                if (pos + 4 > state.posMax || src.charCodeAt(pos) !== 0x5B || src.charCodeAt(pos + 1) !== 0x5B) {
                    return false;
                }

                const match = wikiLinkPattern.exec(src.slice(pos));
                if (!match) return false;

                if (!silent) {
                    state.push('wikilink_open', 'a', 1);
                    const textToken = state.push('text', '', 0);
                    textToken.content = match[2] ? match[2].trim() : match[1].trim();
                    state.push('wikilink_close', 'a', -1);
                }

                state.pos += match[0].length;
                return true;
            }

            md.inline.ruler.before('link', 'wikilink', wikilink);
        }

        async convertQQToMD() {
            try {
                const clipboardItems = await navigator.clipboard.read();
                for (const item of clipboardItems) {
                    if (item.types.includes('text/html')) {
                        const blob = await item.getType('text/html');
                        const html = await blob.text();
                        const mindMapData = this.extractMindMapData(html);
                        const markdown = this.convertToMarkdown(mindMapData);
                        GM_setClipboard(markdown);
                        showNotification('Converted to Markdown and copied to clipboard!');
                        return;
                    }
                }
                showNotification('No QQ Mind Map data found on clipboard.', 'error');
            } catch (err) {
                console.error('Failed to convert QQ to MD:', err);
                showNotification('Could not read clipboard or convert data.', 'error');
            }
        }

        async convertMDToQQ() {
            try {
                const markdown = await navigator.clipboard.readText();
                if (!markdown) {
                    showNotification('Clipboard is empty or contains no text.', 'error');
                    return;
                }
                const mindMapData = this.convertToMindMap(markdown);
                const html = DOMPurify.sanitize(`<div data-mind-map='${JSON.stringify(mindMapData)}'></div>`);
                const plainText = this.generatePlainText(mindMapData);
                const htmlBlob = new Blob([html], { type: 'text/html' });
                const textBlob = new Blob([plainText], { type: 'text/plain' });
                await navigator.clipboard.write([new ClipboardItem({ 'text/html': htmlBlob, 'text/plain': textBlob })]);
                showNotification('Converted to QQ Mind Map HTML and copied to clipboard!');
            } catch (err) {
                console.error('Failed to convert MD to QQ:', err);
                showNotification('Could not convert Markdown.', 'error');
            }
        }

        extractMindMapData(html) {
            const mindMapElement = new DOMParser().parseFromString(html, 'text/html').querySelector('[data-mind-map]');
            if (mindMapElement) {
                return JSON.parse(mindMapElement.getAttribute('data-mind-map'));
            }
            throw new Error('No data-mind-map attribute found.');
        }

        generatePlainText(nodes, depth = 0) {
            return nodes.map(node => {
                const data = node.data || node;
                let text = '';
                if (data.title === PRESENTATION_NODE_TITLE && data.notes?.content) {
                    text = this._convertNoteHtmlToPlainText(data.notes.content) + '\n';
                } else {
                    let titleText = '';
                    if (typeof data.title === 'string') {
                        titleText = data.title;
                    } else if (data.title?.children) {
                        titleText = data.title.children.flatMap(p => p.children?.map(t => t.text || '') || []).join('');
                    }
                    if (titleText.trim()) {
                        text = '\t'.repeat(depth) + titleText.trim() + '\n';
                    }
                }
                if (data.children?.attached) {
                    text += this.generatePlainText(data.children.attached, depth + 1);
                }
                return text;
            }).join('');
        }

        _convertNoteHtmlToPlainText(html) {
            const doc = new DOMParser().parseFromString(html, 'text/html');
            doc.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
            return doc.body.textContent || '';
        }

        // --- QQ to MD Conversion ---

        convertToMarkdown(nodes) {
            let markdown = '';
            for (const node of nodes) {
                const data = node.data || node;
                const isHeader = data.labels?.some(l => l.text === 'header');
                if (isHeader) {
                    markdown += this._convertNodeAsHeader(node, 0);
                } else {
                    markdown += this._convertNode(node, 0, true);
                }
            }
            return markdown.replace(/\n{3,}/g, '\n\n').trim();
        }

        _convertNodeAsHeader(node, depth) {
            const data = node.data || node;
            let markdown = '';

            if (data.title === PRESENTATION_NODE_TITLE && data.notes?.content) {
                return `\n\n<!--\n${this._convertNoteHtmlToPlainText(data.notes.content)}\n-->\n\n`;
            }
            if (data.title === '---') return '\n\n---\n\n';

            let titleText = this.convertRichTextToMarkdown(data.title).trim();
            if (data.images) {
                markdown += data.images.map(img => `![image](${img.url})\n`).join('');
            }
            if (titleText) {
                markdown += `${'#'.repeat(depth + 1)} ${titleText}\n`;
            }

            if (data.children?.attached) {
                markdown += '\n';
                for (const child of data.children.attached) {
                    const childData = child.data || child;
                    const isChildHeader = childData.labels?.some(l => l.text === 'header');
                    if (isChildHeader) {
                        markdown += this._convertNodeAsHeader(child, depth + 1);
                    } else {
                        markdown += this._convertNode(child, 0, false);
                    }
                }
            }
            return markdown;
        }

        _convertNode(node, indent, isListItem) {
            const data = node.data || node;
            let markdown = '';

            if (data.title === PRESENTATION_NODE_TITLE && data.notes?.content) {
                return `\n\n<!--\n${this._convertNoteHtmlToPlainText(data.notes.content)}\n-->\n\n`;
            }
            if (data.title === '---') return '\n\n---\n\n';

            let titleText = this.convertRichTextToMarkdown(data.title).trim();
            const indentStr = '\t'.repeat(indent);

            if (data.images) {
                markdown += data.images.map(img => `${indentStr}![image](${img.url})\n`).join('');
            }

            if (titleText) {
                let prefix = '';
                if (isListItem) {
                    prefix = /^\s*([-*+]|\d+\.)\s+/.test(titleText) ? '' : '- ';
                }
                markdown += `${indentStr}${prefix}${titleText}\n`;
            }

            if (data.children?.attached) {
                for (const child of data.children.attached) {
                    const isChildHeader = (child.data || child).labels?.some(l => l.text === 'header');
                    if (isChildHeader) {
                        markdown += this._convertNodeAsHeader(child, 0);
                    } else {
                        markdown += this._convertNode(child, indent + 1, true);
                    }
                }
            }
            return markdown;
        }

        convertRichTextToMarkdown(titleObject) {
            if (typeof titleObject === 'string') return titleObject;
            if (!titleObject?.children) return '';

            return titleObject.children.flatMap(p => p.children?.map(textNode => {
                let content = textNode.text || '';
                if (textNode.backgroundColor === '#FFF3A1') content = `==${content}==`;
                if (textNode.strike) content = `~~${content}~~`;
                if (textNode.fontStyle === 'italic') content = `*${content}*`;
                if (textNode.fontWeight === 'bold') content = `**${content}**`;
                if (textNode.underline) content = `[[${content}]]`;
                return content;
            }) || []).join('');
        }

        // --- MD to QQ Conversion ---

        convertToMindMap(markdown) {
            const lines = markdown.replace(/\r/g, '').split('\n');
            const forest = [];
            const stack = []; // { node, indentLevel, isText, headerLevel }
            let inCommentBlock = false;
            let commentContent = [];

            for (const line of lines) {
                if (inCommentBlock) {
                    if (line.includes('-->')) {
                        inCommentBlock = false;
                        commentContent.push(line.substring(0, line.indexOf('-->')));
                        const parentNode = stack.length > 0 ? stack[stack.length - 1].node : null;
                        if (parentNode) {
                            const note = `<p>${commentContent.join('\n').replace(/\n/g, '</p><p>')}</p>`;
                            parentNode.children.attached.push({ title: PRESENTATION_NODE_TITLE, notes: { content: note }, children: { attached: [] } });
                        }
                        commentContent = [];
                    } else {
                        commentContent.push(line);
                    }
                    continue;
                }

                const trimmedLine = line.trim();
                if (trimmedLine.startsWith('<!--')) {
                    const parentNode = stack.length > 0 ? stack[stack.length - 1].node : null;
                    if (parentNode) {
                        if (trimmedLine.endsWith('-->')) {
                            const note = `<p>${trimmedLine.slice(4, -3).trim().replace(/\n/g, '</p><p>')}</p>`;
                            parentNode.children.attached.push({ title: PRESENTATION_NODE_TITLE, notes: { content: note }, children: { attached: [] } });
                        } else {
                            inCommentBlock = true;
                            commentContent.push(line.substring(line.indexOf('<!--') + 4));
                        }
                    }
                    continue;
                }

                if (trimmedLine === '') continue;

                const indentMatch = line.match(/^(\s*)/);
                const indentText = indentMatch[1];
                const currentIndent = (indentText.match(/\t/g) || []).length + Math.floor(indentText.replace(/\t/g, '').length / 4);

                const headerMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/);
                const currentHeaderLevel = headerMatch ? headerMatch[1].length : 0;

                const isList = /^\s*([-*+]|\d+\.)\s+/.test(trimmedLine);
                const isText = !isList && !currentHeaderLevel;

                // --- Find Parent Node ---
                while (stack.length > 0) {
                    const top = stack[stack.length - 1];

                    if (currentHeaderLevel > 0) { // Current is a header
                        if (top.headerLevel > 0 && currentHeaderLevel > top.headerLevel) {
                            break; // Parent found: current is a sub-header
                        }
                    } else { // Current is not a header (isList or isText)
                        if (currentIndent > top.indentLevel) {
                            break; // Parent found: indented child
                        }
                        if (top.headerLevel > 0 && currentIndent === top.indentLevel) {
                             break; // Parent found: content for a header
                        }
                        if (isList && top.isText && currentIndent === top.indentLevel) {
                            break; // Parent found: list item after text
                        }
                    }
                    stack.pop();
                }

                const parentNode = stack.length > 0 ? stack[stack.length - 1].node : null;

                // --- Create New Node ---
                let newNode;
                const imageMatch = trimmedLine.match(/^!\[.*?\]\((.*?)\)$/);

                if (headerMatch) {
                    const HEADER_LABEL = { id: 'qq-mind-map-header-label', text: 'header', backgroundColor: '#ADCBFF', color: '#000000e1' };
                    newNode = { title: this.createRichTextNode(headerMatch[2].trim()), labels: [HEADER_LABEL], children: { attached: [] } };
                } else if (trimmedLine === '---') {
                    newNode = { title: '---', children: { attached: [] } };
                } else if (imageMatch) {
                    newNode = { title: '', images: [{ id: '', w: 200, h: 200, ow: 200, oh: 200, url: imageMatch[1] }], children: { attached: [] } };
                } else {
                    const content = trimmedLine.replace(/^(\s*[-*+>]\s*)/, '');
                    newNode = { title: this.createRichTextNode(content), children: { attached: [] } };
                }

                // --- Attach Node ---
                if (parentNode) {
                    if (!parentNode.children) parentNode.children = { attached: [] };
                    if (!parentNode.children.attached) parentNode.children.attached = [];
                    parentNode.children.attached.push(newNode);
                } else {
                    forest.push({ type: 5, data: newNode });
                }

                // --- Push to Stack ---
                stack.push({ node: newNode, indentLevel: currentIndent, isText, headerLevel: currentHeaderLevel });
            }
            return forest;
        }

        createRichTextNode(markdown) {
            const trimmedMarkdown = markdown.trim();
            if (trimmedMarkdown === '') {
                return {
                    children: [{ type: 'paragraph', children: [{type: 'text', text: ''}] }],
                    type: 'document',
                };
            }

            const tokens = this.md.parseInline(trimmedMarkdown, {});
            const qqTextNodes = this.buildQQNodesFromTokens(tokens);

            if (qqTextNodes.length === 0) {
                qqTextNodes.push({ type: 'text', text: trimmedMarkdown });
            }

            return {
                children: [{ type: 'paragraph', children: qqTextNodes }],
                type: 'document',
            };
        }

        buildQQNodesFromTokens(tokens) {
            const resultNodes = [];
            const styleStack = [];

            for (const token of tokens) {
                let content = token.content;
                switch (token.type) {
                    case 'strong_open': styleStack.push({ fontWeight: 'bold' }); continue;
                    case 'em_open': styleStack.push({ fontStyle: 'italic' }); continue;
                    case 's_open': styleStack.push({ strike: true }); continue;
                    case 'highlight_open': styleStack.push({ backgroundColor: '#FFF3A1' }); continue;
                    case 'wikilink_open': styleStack.push({ underline: true, color: '#0052D9' }); continue;
                    case 'link_open': styleStack.push({ underline: true, color: '#0052D9' }); continue;

                    case 'strong_close':
                    case 'em_close':
                    case 's_close':
                    case 'highlight_close':
                    case 'wikilink_close':
                    case 'link_close': styleStack.pop(); continue;

                    case 'text': break;
                    default: continue;
                }

                if (content) {
                    const finalStyle = styleStack.reduce((acc, s) => ({ ...acc, ...s }), {});
                    resultNodes.push({ type: 'text', text: content, ...finalStyle });
                }
            }
            return resultNodes;
        }
    }

    // --- INITIALIZATION ---
    const converter = new Converter();
    new UIManager(converter);

})();