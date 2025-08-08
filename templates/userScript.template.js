// ==UserScript==
// @name         QQ Mind Map to Obsidian Converter (Simple)
// @namespace    http://tampermonkey.net/
// @version      2.0.0
// @description  Bidirectional conversion between QQ Mind Map and Obsidian Markdown
// @author       carllx
// @icon         https://docs.gtimg.com/docs-design-resources/document-management/tencent-docs/favicon/application-vnd.tdocs-apps.mind.png?ver=1
// @match        *://naotu.qq.com/mindcal/*
// @match        *://docs.qq.com/mind/*
// @grant        GM_setClipboard
// @grant        GM_notification
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @require      https://cdn.jsdelivr.net/npm/markdown-it@14.1.0/dist/markdown-it.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/dompurify/2.3.8/purify.min.js
// ==/UserScript==

// {{HE_LIBRARY}}

(function (markdownit, DOMPurify, he) {
    'use strict';

    console.log('🚀 QQ Mind Map Converter starting...');

    // 简化的模块系统
    const modules = {};
    
    function define(name, factory) { 
        try {
            modules[name] = factory();
            console.log('✅ Module loaded:', name);
        } catch (error) {
            console.error('❌ Error loading module:', name, error);
        }
    }
    
    function require(name) { 
        const module = modules[name];
        if (!module) {
            console.error('❌ Module not found:', name);
        }
        return module;
    }

{{MODULES}}

    // 主转换器类
    class MainConverter {
        constructor() {
            this.setupMarkdownIt();
            this.initializeComponents();
        }

        setupMarkdownIt() {
            if (typeof markdownit === 'undefined') {
                console.error('❌ markdown-it not available');
                return;
            }
            
            this.md = markdownit({
                html: true,
                linkify: true,
                breaks: false,  // 控制换行行为
                typographer: false  // 禁用排版转换
            })
            // 启用删除线支持
            .enable(['strikethrough'])
            // 确保强调和粗体格式正确解析
            .enable(['emphasis'])
            // 如果需要额外插件支持，可以添加
            // .use(markdownItUnderline)  // 下划线支持（需要额外插件）
            // .use(markdownItMark);      // 高亮支持（需要额外插件）
        }
        

        initializeComponents() {
            try {
                // 获取模块
                const NotificationSystem = modules.NotificationSystem;
                const QQMindMapParser = modules.QQMindMapParser;
                const StyleProcessor = modules.StyleProcessor;
                const QQToMarkdownConverter = modules.QQToMarkdownConverter;
                const MarkdownToQQConverter = modules.MarkdownToQQConverter;
                const InterfaceManager = modules.InterfaceManager;
                const IndentManager = modules.IndentManager;
                const LinePreserver = modules.LinePreserver;
                const RichTextFormatter = modules.RichTextFormatter;
                const CodeBlockHandler = modules.CodeBlockHandler;
                const NodeManager = modules.NodeManager;
                const HtmlUtils = modules.HtmlUtils;

                this.notifications = new NotificationSystem();
                this.notifications.addStyles();
                
                // 创建依赖实例
                this.qqParser = new QQMindMapParser();
                this.indentManager = new IndentManager();
                this.linePreserver = new LinePreserver(this.indentManager);
                this.richTextFormatter = new RichTextFormatter(this.qqParser);
                
                // 创建共享模块实例
                this.codeBlockHandler = new CodeBlockHandler(this.richTextFormatter, he);
                this.nodeManager = new NodeManager();
                this.htmlUtils = new HtmlUtils();
                
                // 创建转换器，传递共享模块依赖
                this.qqToMdConverter = new QQToMarkdownConverter(this.qqParser, DOMPurify);
                this.mdToQqConverter = new MarkdownToQQConverter(this.md, he);
                this.interfaceManager = new InterfaceManager(this);
            } catch (error) {
                console.error('❌ Error initializing components:', error);
            }
        }

        async convertQQToMD() {
            try {
                this.interfaceManager.setLoadingState(true);
                this.notifications.show('QQ to MD conversion started', 'info');

                const clipboardItems = await navigator.clipboard.read();
                for (const item of clipboardItems) {
                    if (item.types.includes('text/html')) {
                        const blob = await item.getType('text/html');
                        const html = await blob.text();
                        const mindMapData = this.qqParser.extractMindMapData(html);
                        const markdown = this.qqToMdConverter.convert(mindMapData);
                        GM_setClipboard(markdown);
                        this.notifications.success('QQ to MD conversion completed!');
                        return;
                    }
                }
                this.notifications.error('No QQ mind map data found in clipboard');
            } catch (err) {
                console.error('❌ QQ to MD conversion failed:', err);
                this.notifications.error('Conversion failed: ' + err.message);
            } finally {
                this.interfaceManager.setLoadingState(false);
            }
        }

        async getQQMindMapData() {
            try {
                const clipboardItems = await navigator.clipboard.read();
                for (const item of clipboardItems) {
                    if (item.types.includes('text/html')) {
                        const blob = await item.getType('text/html');
                        const html = await blob.text();
                        return this.qqParser.extractMindMapData(html);
                    }
                }
                return null;
            } catch (err) {
                console.error('❌ Failed to get QQ mind map data:', err);
                return null;
            }
        }

        async convertQQToMDWithHeaderLevel(startHeaderLevel = 1) {
            try {
                this.interfaceManager.setLoadingState(true);
                this.notifications.show(`QQ to MD conversion started (H${startHeaderLevel})`, 'info');

                const mindMapData = await this.getQQMindMapData();
                if (!mindMapData) {
                    this.notifications.error('No QQ mind map data found in clipboard');
                    return;
                }

                const markdown = this.qqToMdConverter.convert(mindMapData, null, startHeaderLevel);
                GM_setClipboard(markdown);
                this.notifications.success(`QQ to MD conversion completed! (Starting from H${startHeaderLevel})`);
            } catch (err) {
                console.error('❌ QQ to MD conversion with header level failed:', err);
                this.notifications.error('Conversion failed: ' + err.message);
            } finally {
                this.interfaceManager.setLoadingState(false);
            }
        }

        async convertMDToQQ() {
            try {
                this.interfaceManager.setLoadingState(true);
                this.notifications.show('MD to QQ conversion started', 'info');

                const markdown = await navigator.clipboard.readText();
                if (!markdown) {
                    this.notifications.error('Clipboard is empty or contains no text');
                    return;
                }

                const mindMapData = this.mdToQqConverter.convert(markdown);
                if (typeof DOMPurify === 'undefined') {
                    console.error('❌ DOMPurify not available');
                    this.notifications.error('DOMPurify library not loaded');
                    return;
                }
                
                // 确保数据结构符合QQ思维导图的richtext格式
                const sanitizedData = this.sanitizeMindMapData(mindMapData);
                const html = DOMPurify.sanitize('<div data-mind-map=\'' + JSON.stringify(sanitizedData) + '\'></div>');
                const plainText = this.qqParser.generatePlainText(sanitizedData);
                
                const htmlBlob = new Blob([html], { type: 'text/html' });
                const textBlob = new Blob([plainText], { type: 'text/plain' });
                
                await navigator.clipboard.write([
                    new ClipboardItem({ 
                        'text/html': htmlBlob, 
                        'text/plain': textBlob 
                    })
                ]);
                
                this.notifications.success('MD to QQ conversion completed!');
            } catch (err) {
                console.error('❌ MD to QQ conversion failed:', err);
                this.notifications.error('Conversion failed: ' + err.message);
            } finally {
                this.interfaceManager.setLoadingState(false);
            }
        }

        /**
         * 清理和验证思维导图数据，确保符合QQ思维导图的richtext格式
         * @param {Array} mindMapData - 原始思维导图数据
         * @returns {Array} 清理后的数据
         */
        sanitizeMindMapData(mindMapData) {
            const sanitizedData = [];
            
            for (const node of mindMapData) {
                if (node.type === 5 && node.data) {
                    // 确保每个节点都有必要的字段
                    const sanitizedNode = {
                        type: 5,
                        data: {
                            id: node.data.id || this.generateNodeId(),
                            title: node.data.title || '',
                            collapse: node.data.collapse !== undefined ? node.data.collapse : false,
                            children: {
                                attached: node.data.children?.attached || []
                            }
                        }
                    };
                    
                    // 添加可选的字段
                    if (node.data.labels) {
                        sanitizedNode.data.labels = node.data.labels;
                    }
                    if (node.data.notes) {
                        sanitizedNode.data.notes = node.data.notes;
                    }
                    if (node.data.images) {
                        sanitizedNode.data.images = node.data.images;
                    }
                    
                    sanitizedData.push(sanitizedNode);
                }
            }
            
            return sanitizedData;
        }

        /**
         * 生成唯一节点ID
         * @returns {string} 唯一ID
         */
        generateNodeId() {
            return 'node_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
    }

    // 主函数
    async function main() {
        try {
            // 检查核心依赖库是否加载成功
            if (typeof markdownit === 'undefined' || typeof DOMPurify === 'undefined' || typeof he === 'undefined') {
                const missing = [
                    (typeof markdownit === 'undefined' ? 'markdown-it' : null),
                    (typeof DOMPurify === 'undefined' ? 'DOMPurify' : null),
                    (typeof he === 'undefined' ? 'he' : null)
                ].filter(Boolean).join(', ');
                
                const errorMsg = `QQmindmap2Obsidian Error: A critical library (${missing}) failed to load. Please check your internet connection, browser console, and script manager's log for errors.`;
                console.error(errorMsg);
                alert(errorMsg);
                return;
            }
            
            // 等待页面加载
            if (document.readyState !== 'complete') {
                await new Promise((resolve) => {
                    window.addEventListener('load', resolve);
                });
            }
            
            // 等待页面初始化
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            const converter = new MainConverter();

            // 创建全局对象
            window.QQMindMap2Obsidian = {
                converter,
                QQMindMapParser: modules.QQMindMapParser,
                QQToMarkdownConverter: modules.QQToMarkdownConverter,
                MarkdownToQQConverter: modules.MarkdownToQQConverter,
                NotificationSystem: modules.NotificationSystem,
                InterfaceManager: modules.InterfaceManager,
                CodeBlockHandler: modules.CodeBlockHandler,
                NodeManager: modules.NodeManager,
                HtmlUtils: modules.HtmlUtils,
                status: 'ready'
            };
            
        } catch (error) {
            console.error('❌ Error in main function:', error);
        }
    }

    // 启动主函数
    main();

})(window.markdownit, window.DOMPurify, window.he); 