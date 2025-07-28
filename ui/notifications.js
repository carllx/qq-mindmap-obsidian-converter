/**
 * 通知系统
 * 负责显示用户反馈和状态提示
 */
class NotificationSystem {
    constructor() {
        this.notificationId = 'converter-notification';
        this.defaultDuration = 3000;
        this.colors = {
            success: '#4CAF50',
            error: '#f44336',
            warning: '#ff9800',
            info: '#2196F3'
        };
    }

    /**
     * 显示通知
     * @param {string} message - 通知消息
     * @param {string} type - 通知类型 ('success', 'error', 'warning', 'info')
     * @param {number} duration - 显示时长（毫秒）
     */
    show(message, type = 'success', duration = this.defaultDuration) {
        // 移除现有通知
        this.removeExisting();

        // 创建通知元素
        const notification = this.createNotification(message, type);
        
        // 添加到页面
        document.body.appendChild(notification);

        // 动画显示
        this.animateIn(notification);

        // 自动隐藏
        setTimeout(() => {
            this.animateOut(notification);
        }, duration);
    }

    /**
     * 显示成功通知
     * @param {string} message - 消息内容
     * @param {number} duration - 显示时长
     */
    success(message, duration = this.defaultDuration) {
        this.show(message, 'success', duration);
    }

    /**
     * 显示错误通知
     * @param {string} message - 消息内容
     * @param {number} duration - 显示时长
     */
    error(message, duration = this.defaultDuration) {
        this.show(message, 'error', duration);
    }

    /**
     * 显示警告通知
     * @param {string} message - 消息内容
     * @param {number} duration - 显示时长
     */
    warning(message, duration = this.defaultDuration) {
        this.show(message, 'warning', duration);
    }

    /**
     * 显示信息通知
     * @param {string} message - 消息内容
     * @param {number} duration - 显示时长
     */
    info(message, duration = this.defaultDuration) {
        this.show(message, 'info', duration);
    }

    /**
     * 创建通知元素
     * @param {string} message - 消息内容
     * @param {string} type - 通知类型
     * @returns {Element} 通知元素
     */
    createNotification(message, type) {
        const notification = document.createElement('div');
        notification.id = this.notificationId;
        notification.textContent = message;
        notification.className = `notification notification-${type}`;
        
        return notification;
    }

    /**
     * 添加通知样式
     */
    addStyles() {
        const styles = `
            #converter-notification {
                position: fixed;
                top: -50px;
                left: 50%;
                transform: translateX(-50%);
                background-color: ${this.colors.success};
                color: white;
                padding: 12px 20px;
                border-radius: 5px;
                z-index: 10000;
                font-size: 14px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                transition: top 0.5s ease, opacity 0.5s ease;
                opacity: 0;
                max-width: 400px;
                word-wrap: break-word;
                text-align: center;
            }
            #converter-notification.notification-error {
                background-color: ${this.colors.error};
            }
            #converter-notification.notification-warning {
                background-color: ${this.colors.warning};
            }
            #converter-notification.notification-info {
                background-color: ${this.colors.info};
            }
            #converter-notification.notification-success {
                background-color: ${this.colors.success};
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
     * 动画显示通知
     * @param {Element} notification - 通知元素
     */
    animateIn(notification) {
        setTimeout(() => {
            notification.style.top = '20px';
            notification.style.opacity = '1';
        }, 100);
    }

    /**
     * 动画隐藏通知
     * @param {Element} notification - 通知元素
     */
    animateOut(notification) {
        notification.style.top = '-50px';
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 500);
    }

    /**
     * 移除现有通知
     */
    removeExisting() {
        const existing = document.getElementById(this.notificationId);
        if (existing) {
            existing.remove();
        }
    }

    /**
     * 显示进度通知
     * @param {string} message - 消息内容
     * @returns {Function} 完成回调函数
     */
    showProgress(message) {
        this.show(message, 'info', 0); // 不自动隐藏
        return (finalMessage, type = 'success') => {
            this.show(finalMessage, type);
        };
    }

    /**
     * 显示确认对话框
     * @param {string} message - 消息内容
     * @param {Function} onConfirm - 确认回调
     * @param {Function} onCancel - 取消回调
     */
    confirm(message, onConfirm, onCancel) {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: white;
            padding: 20px;
            border-radius: 8px;
            max-width: 400px;
            text-align: center;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        `;

        dialog.innerHTML = `
            <div style="margin-bottom: 20px; font-size: 16px;">${message}</div>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button id="confirm-yes" style="padding: 8px 16px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">确认</button>
                <button id="confirm-no" style="padding: 8px 16px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;">取消</button>
            </div>
        `;

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        const handleConfirm = () => {
            overlay.remove();
            if (onConfirm) onConfirm();
        };

        const handleCancel = () => {
            overlay.remove();
            if (onCancel) onCancel();
        };

        dialog.querySelector('#confirm-yes').addEventListener('click', handleConfirm);
        dialog.querySelector('#confirm-no').addEventListener('click', handleCancel);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) handleCancel();
        });
    }
}

// 导出模块
if (typeof window !== 'undefined') {
    window.NotificationSystem = NotificationSystem;
} 