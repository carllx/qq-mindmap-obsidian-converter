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
                this.handleQQToMDConversion();
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

        /**
         * 处理QQ到MD转换，包含header level选择
         */
        async handleQQToMDConversion() {
            console.log('🔄 Handling QQ to MD conversion with header level selection');
            
            // 获取QQ思维导图数据
            const qqData = await this.converter.getQQMindMapData();
            if (!qqData || qqData.length === 0) {
                this.showNotification('未检测到QQ思维导图数据', 'error');
                return;
            }

            // 检查是否包含header节点
            const hasHeaders = this.checkForHeaderNodes(qqData);
            
            if (hasHeaders) {
                this.showHeaderLevelDialog(qqData);
            } else {
                // 没有header节点，直接转换
                this.converter.convertQQToMD();
            }
        }

        /**
         * 检查是否包含header节点
         * @param {Array} nodes - 节点数组
         * @returns {boolean} 是否包含header节点
         */
        checkForHeaderNodes(nodes) {
            for (const node of nodes) {
                const data = node.data || node;
                if (data.labels?.some(l => l.text === 'header')) {
                    return true;
                }
                if (data.children?.attached) {
                    if (this.checkForHeaderNodes(data.children.attached)) {
                        return true;
                    }
                }
            }
            return false;
        }

        /**
         * 显示header level选择对话框
         * @param {Array} qqData - QQ思维导图数据
         */
        showHeaderLevelDialog(qqData) {
            // 创建模态对话框
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
            `;

            const dialog = document.createElement('div');
            dialog.style.cssText = `
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                max-width: 400px;
                width: 90%;
            `;

            dialog.innerHTML = `
                <h3 style="margin: 0 0 15px 0; color: #333;">选择起始标题层级</h3>
                <p style="margin: 0 0 15px 0; color: #666; font-size: 14px;">
                    检测到思维导图中包含标题节点。请选择起始的标题层级，这将影响转换后的Markdown结构。
                </p>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 8px; color: #333;">
                        <input type="radio" name="headerLevel" value="1" checked> 
                        H1 (# 一级标题)
                    </label>
                    <label style="display: block; margin-bottom: 8px; color: #333;">
                        <input type="radio" name="headerLevel" value="2"> 
                        H2 (## 二级标题)
                    </label>
                    <label style="display: block; margin-bottom: 8px; color: #333;">
                        <input type="radio" name="headerLevel" value="3"> 
                        H3 (### 三级标题)
                    </label>
                    <label style="display: block; margin-bottom: 8px; color: #333;">
                        <input type="radio" name="headerLevel" value="4"> 
                        H4 (#### 四级标题)
                    </label>
                    <label style="display: block; margin-bottom: 8px; color: #333;">
                        <input type="radio" name="headerLevel" value="5"> 
                        H5 (##### 五级标题)
                    </label>
                    <label style="display: block; margin-bottom: 8px; color: #333;">
                        <input type="radio" name="headerLevel" value="6"> 
                        H6 (###### 六级标题)
                    </label>
                </div>
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button id="cancelBtn" style="
                        padding: 8px 16px;
                        border: 1px solid #ddd;
                        background: white;
                        border-radius: 4px;
                        cursor: pointer;
                    ">取消</button>
                    <button id="confirmBtn" style="
                        padding: 8px 16px;
                        border: none;
                        background: #007bff;
                        color: white;
                        border-radius: 4px;
                        cursor: pointer;
                    ">确认转换</button>
                </div>
            `;

            modal.appendChild(dialog);
            document.body.appendChild(modal);

            // 添加事件监听器
            const confirmBtn = dialog.querySelector('#confirmBtn');
            const cancelBtn = dialog.querySelector('#cancelBtn');

            confirmBtn.addEventListener('click', () => {
                const selectedLevel = parseInt(dialog.querySelector('input[name="headerLevel"]:checked').value);
                document.body.removeChild(modal);
                this.converter.convertQQToMDWithHeaderLevel(selectedLevel);
            });

            cancelBtn.addEventListener('click', () => {
                document.body.removeChild(modal);
            });

            // 点击背景关闭
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    document.body.removeChild(modal);
                }
            });
        }

        /**
         * 显示通知
         * @param {string} message - 消息内容
         * @param {string} type - 消息类型 ('success', 'error', 'info')
         */
        showNotification(message, type = 'info') {
            // 简单的通知实现
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 20px;
                border-radius: 4px;
                color: white;
                font-size: 14px;
                z-index: 10001;
                ${type === 'error' ? 'background: #dc3545;' : 
                  type === 'success' ? 'background: #28a745;' : 
                  'background: #17a2b8;'}
            `;
            notification.textContent = message;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 3000);
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

        /**
         * 获取QQ思维导图数据
         * @returns {Array|null} 思维导图数据或null
         */
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

        /**
         * 带header level的QQ到MD转换
         * @param {number} startHeaderLevel - 起始标题层级 (1-6)
         */
        async convertQQToMDWithHeaderLevel(startHeaderLevel = 1) {
            console.log('🔄 QQ to MD conversion with header level started:', startHeaderLevel);
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