/**
 * 用户界面管理器
 * 负责创建和管理转换工具的UI组件
 */
class InterfaceManager {
    constructor(converter) {
        this.converter = converter;
        this.container = null;
        this.config = {
            autoDetect: true
        };
        this.init();
    }

    /**
     * 初始化界面
     */
    init() {
        this.waitForUIAndInject();
        this.startClipboardListener();
    }

    /**
     * 等待UI加载并注入组件
     */
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

    /**
     * 创建UI组件
     * @param {Element} parentElement - 父元素
     */
    createUI(parentElement) {
        this.container = document.createElement('div');
        this.container.id = 'converter-container';
        this.container.innerHTML = `
            <div id="qq-to-md" class="converter-button">QQ to MD</div>
            <div id="md-to-qq" class="converter-button">MD to QQ</div>
            <div class="converter-options">
                <label><input type="checkbox" id="auto-detect" ${this.config.autoDetect ? 'checked' : ''}> Auto</label>
            </div>
        `;
        parentElement.prepend(this.container);
        this.addStyles();
    }

    /**
     * 添加样式
     */
    addStyles() {
        const styles = `
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
                user-select: none;
            }
            .converter-button:hover {
                background: #555;
            }
            .converter-button.active {
                background: #4CAF50;
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
                user-select: none;
            }
            .converter-options input {
                margin-right: 4px;
                cursor: pointer;
            }
        `;
        
        if (typeof GM_addStyle !== 'undefined') {
            GM_addStyle(styles);
        } else {
            const styleElement = document.createElement('style');
            styleElement.textContent = styles;
            document.head.appendChild(styleElement);
        }
    }

    /**
     * 添加事件监听器
     */
    addEventListeners() {
        const qqToMdBtn = document.getElementById('qq-to-md');
        const mdToQqBtn = document.getElementById('md-to-qq');
        const autoDetectCheckbox = document.getElementById('auto-detect');

        if (qqToMdBtn) {
            qqToMdBtn.addEventListener('click', () => {
                this.converter.convertQQToMD();
            });
        }

        if (mdToQqBtn) {
            mdToQqBtn.addEventListener('click', () => {
                this.converter.convertMDToQQ();
            });
        }

        if (autoDetectCheckbox) {
            autoDetectCheckbox.addEventListener('change', (e) => {
                this.config.autoDetect = e.target.checked;
                this.startClipboardListener();
            });
        }
    }

    /**
     * 更新按钮样式
     * @param {string} sourceType - 源类型 ('qq', 'md', 'none')
     */
    updateButtonStyles(sourceType) {
        const qqToMdBtn = document.getElementById('qq-to-md');
        const mdToQqBtn = document.getElementById('md-to-qq');
        
        if (!qqToMdBtn || !mdToQqBtn) return;

        // 移除所有活动状态
        qqToMdBtn.classList.remove('active');
        mdToQqBtn.classList.remove('active');

        // 设置活动状态
        if (sourceType === 'qq') {
            qqToMdBtn.classList.add('active');
        } else if (sourceType === 'md') {
            mdToQqBtn.classList.add('active');
        }
    }

    /**
     * 处理复制事件
     */
    handleCopy = () => {
        this.updateButtonStyles('qq');
    }

    /**
     * 处理粘贴事件
     * @param {ClipboardEvent} event - 粘贴事件
     */
    handlePaste = (event) => {
        const types = event.clipboardData.types;
        if (types.includes('text/html')) {
            this.updateButtonStyles('qq');
        } else if (types.includes('text/plain')) {
            this.updateButtonStyles('md');
        }
    }

    /**
     * 启动剪贴板监听器
     */
    startClipboardListener() {
        // 移除现有监听器
        document.removeEventListener('copy', this.handleCopy);
        document.removeEventListener('paste', this.handlePaste);

        if (this.config.autoDetect) {
            document.addEventListener('copy', this.handleCopy);
            document.addEventListener('paste', this.handlePaste);
        } else {
            this.updateButtonStyles('none');
        }
    }

    /**
     * 显示加载状态
     * @param {boolean} isLoading - 是否正在加载
     */
    setLoadingState(isLoading) {
        const qqToMdBtn = document.getElementById('qq-to-md');
        const mdToQqBtn = document.getElementById('md-to-qq');
        
        if (qqToMdBtn) {
            qqToMdBtn.style.opacity = isLoading ? '0.6' : '1';
            qqToMdBtn.style.cursor = isLoading ? 'not-allowed' : 'pointer';
        }
        
        if (mdToQqBtn) {
            mdToQqBtn.style.opacity = isLoading ? '0.6' : '1';
            mdToQqBtn.style.cursor = isLoading ? 'not-allowed' : 'pointer';
        }
    }

    /**
     * 销毁界面
     */
    destroy() {
        if (this.container) {
            this.container.remove();
        }
        document.removeEventListener('copy', this.handleCopy);
        document.removeEventListener('paste', this.handlePaste);
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InterfaceManager;
} else if (typeof window !== 'undefined') {
    window.InterfaceManager = InterfaceManager;
} 