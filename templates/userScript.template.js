// ==UserScript==
// @name         QQ Mind Map to Obsidian Converter (Simple)
// @namespace    http://tampermonkey.net/
// @version      2.0.0
// @description  Converts QQ Mind Map to Obsidian Markdown and vice-versa
// @author       carllx & Gemini
// @match        https://docs.qq.com/mind/*
// @grant        GM_setClipboard
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @require      https://cdn.jsdelivr.net/npm/markdown-it@14.1.0/dist/markdown-it.min.js
// @require      https://cdn.jsdelivr.net/npm/dompurify@3.1.5/dist/purify.min.js
// ==/UserScript==

(function() {
    'use strict';

    console.log('🚀 QQ Mind Map Converter (Simple) starting...');

    // 立即创建全局对象
    window.QQMindMap2Obsidian = {
        test: true,
        version: 'simple',
        status: 'initializing'
    };
    console.log('✅ Initial global object created:', window.QQMindMap2Obsidian);

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

    // 简化的UI管理器
    class SimpleInterfaceManager {
        constructor(converter) {
            this.converter = converter;
            this.container = null;
        }

        init() {
            console.log('🔧 Initializing UI...');
            this.waitForUIAndInject();
        }

        waitForUIAndInject() {
            console.log('🔍 Looking for target element...');
            const interval = setInterval(() => {
                // 尝试多个可能的选择器
                const selectors = [
                    '#editor-root > div > div > div.Footer_footer__DdscW',
                    '.Footer_footer__DdscW',
                    'footer',
                    'body'
                ];
                
                let targetElement = null;
                for (const selector of selectors) {
                    targetElement = document.querySelector(selector);
                    if (targetElement) {
                        console.log('✅ Found target element with selector:', selector);
                        break;
                    }
                }
                
                if (targetElement) {
                    clearInterval(interval);
                    this.createUI(targetElement);
                    console.log('✅ UI created successfully');
                } else {
                    console.log('⏳ Target element not found, retrying...');
                }
            }, 1000);
        }

        createUI(parentElement) {
            // 创建容器
            this.container = document.createElement('div');
            this.container.id = 'converter-container';
            this.container.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                gap: 10px;
                background: rgba(255, 255, 255, 0.95);
                padding: 10px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                border: 1px solid #e0e0e0;
            `;

            // 创建按钮
            const qqToMdBtn = document.createElement('button');
            qqToMdBtn.textContent = 'QQ to MD';
            qqToMdBtn.style.cssText = `
                background: #4CAF50;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
            `;
            qqToMdBtn.onclick = () => {
                console.log('🔘 QQ to MD button clicked');
                this.converter.convertQQToMD();
            };

            const mdToQqBtn = document.createElement('button');
            mdToQqBtn.textContent = 'MD to QQ';
            mdToQqBtn.style.cssText = `
                background: #2196F3;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
            `;
            mdToQqBtn.onclick = () => {
                console.log('🔘 MD to QQ button clicked');
                this.converter.convertMDToQQ();
            };

            // 添加按钮到容器
            this.container.appendChild(qqToMdBtn);
            this.container.appendChild(mdToQqBtn);

            // 添加到页面
            parentElement.appendChild(this.container);
            console.log('✅ UI elements added to page');
        }

        setLoadingState(isLoading) {
            console.log('🔄 Loading state:', isLoading);
        }
    }

    // 简化的主转换器类
    class MainConverter {
        constructor() {
            console.log('🔧 MainConverter constructor called');
            this.setupMarkdownIt();
            this.initializeComponents();
        }

        setupMarkdownIt() {
            console.log('🔧 Setting up markdown-it...');
            if (typeof window.markdownit === 'undefined') {
                console.error('❌ markdown-it not available');
                return;
            }
            this.md = window.markdownit({
                html: false,
                linkify: true,
            }).enable('strikethrough');
            console.log('✅ markdown-it setup complete');
        }

        initializeComponents() {
            console.log('🔧 Initializing components...');
            try {
                // 使用 require 获取模块
                const NotificationSystem = require('NotificationSystem');
                const QQMindMapParser = require('QQMindMapParser');
                const QQToMarkdownConverter = require('QQToMarkdownConverter');
                const MarkdownToQQConverter = require('MarkdownToQQConverter');

                this.notifications = new NotificationSystem();
                this.notifications.addStyles();
                this.qqParser = new QQMindMapParser();
                this.qqToMdConverter = new QQToMarkdownConverter();
                this.mdToQqConverter = new MarkdownToQQConverter(this.md);
                this.interfaceManager = new SimpleInterfaceManager(this);
                this.interfaceManager.init();
                console.log('✅ All components initialized');
            } catch (error) {
                console.error('❌ Error initializing components:', error);
            }
        }

        async convertQQToMD() {
            console.log('🔄 QQ to MD conversion started');
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

        async convertMDToQQ() {
            console.log('🔄 MD to QQ conversion started');
            try {
                this.interfaceManager.setLoadingState(true);
                this.notifications.show('MD to QQ conversion started', 'info');

                const markdown = await navigator.clipboard.readText();
                if (!markdown) {
                    this.notifications.error('Clipboard is empty or contains no text');
                    return;
                }

                const mindMapData = this.mdToQqConverter.convert(markdown);
                // 检查 DOMPurify 是否可用
                if (typeof window.DOMPurify === 'undefined') {
                    console.error('❌ DOMPurify not available');
                    this.notifications.error('DOMPurify library not loaded');
                    return;
                }
                const html = window.DOMPurify.sanitize('<div data-mind-map=\'' + JSON.stringify(mindMapData) + '\'></div>');
                const plainText = this.qqParser.generatePlainText(mindMapData);
                
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
    }

    // 主函数
    async function main() {
        try {
            console.log('🚀 Main function starting...');
            
            // 等待页面加载
            if (document.readyState === 'complete') {
                console.log('✅ Page already loaded');
            } else {
                console.log('⏳ Waiting for page to load...');
                await new Promise((resolve) => {
                    window.addEventListener('load', resolve);
                });
                console.log('✅ Page loaded');
            }
            
            // 等待3秒确保页面完全初始化
            console.log('⏳ Waiting 3 seconds for page initialization...');
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            console.log('🔧 Creating MainConverter instance...');
            const converter = new MainConverter();

            // 创建全局对象
            const globalObject = {
                converter,
                QQMindMapParser: require('QQMindMapParser'),
                QQToMarkdownConverter: require('QQToMarkdownConverter'),
                MarkdownToQQConverter: require('MarkdownToQQConverter'),
                NotificationSystem: require('NotificationSystem'),
                status: 'ready'
            };

            // 直接赋值到全局作用域
            window.QQMindMap2Obsidian = globalObject;
            
            console.log('✅ Global object created:', window.QQMindMap2Obsidian);
            
            // 验证对象是否真的在全局作用域中
            setTimeout(() => {
                console.log('🔍 Verification - Global object check:', window.QQMindMap2Obsidian);
                if (window.QQMindMap2Obsidian) {
                    console.log('✅ Global object is accessible!');
                } else {
                    console.log('❌ Global object is not accessible!');
                }
            }, 1000);
            
        } catch (error) {
            console.error('❌ Error in main function:', error);
        }
    }

    // 启动主函数
    main();

})(); 