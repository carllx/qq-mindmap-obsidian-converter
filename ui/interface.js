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
    }

    /**
     * 等待UI加载并注入组件
     */
    waitForUIAndInject() {
        let attempts = 0;
        const maxAttempts = 10;
        
        const interval = setInterval(() => {
            attempts++;
            
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
                if (targetElement) break;
            }
            
            if (targetElement) {
                clearInterval(interval);
                this.createUI(targetElement);
                this.addEventListeners();
            } else if (attempts >= maxAttempts) {
                clearInterval(interval);
                this.createUI(document.body);
                this.addEventListeners();
            }
        }, 1000);
    }

    /**
     * 创建UI组件
     * @param {Element} parentElement - 父元素
     */
    createUI(parentElement) {
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
        qqToMdBtn.onclick = () => this.handleQQToMDConversion();

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
        mdToQqBtn.onclick = () => this.converter.convertMDToQQ();

        // 添加按钮到容器
        this.container.appendChild(qqToMdBtn);
        this.container.appendChild(mdToQqBtn);

        // 添加到页面
        parentElement.appendChild(this.container);
    }

    /**
     * 添加事件监听器
     */
    addEventListeners() {
        // 可以在这里添加更多事件监听器
    }

    /**
     * 处理QQ到MD转换，包含header level选择
     */
    async handleQQToMDConversion() {
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
            if (data.labels && data.labels.some(l => l.text === 'header')) {
                return true;
            }
            if (data.children && data.children.attached) {
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

    /**
     * 设置加载状态
     * @param {boolean} isLoading - 是否正在加载
     */
    setLoadingState(isLoading) {
        // 可以在这里添加加载状态的UI更新
    }

    /**
     * 销毁UI组件
     */
    destroy() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InterfaceManager;
} else if (typeof window !== 'undefined') {
    window.InterfaceManager = InterfaceManager;
} 