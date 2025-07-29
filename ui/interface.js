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
                this.handleQQToMDConversion();
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
     * 处理QQ到MD转换，包含header level选择
     */
    handleQQToMDConversion() {
        // 获取QQ思维导图数据
        const qqData = this.converter.getQQMindMapData();
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
        if (this.notificationSystem) {
            this.notificationSystem.show(message, type);
        } else {
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