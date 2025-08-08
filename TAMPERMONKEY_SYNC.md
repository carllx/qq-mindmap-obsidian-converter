# 🔄 Tampermonkey同步指南

本指南将帮助您设置Tampermonkey自动同步您的 `node build.js --deploy` 部署结果。

## 📱 快速设置

### 步骤1: 安装脚本
在浏览器中访问以下URL：
```
https://gist.githubusercontent.com/carllx/481c282bd808552229e305ce50c1d832/raw/QQmindmap2Obsidian.user.js
```

Tampermonkey会自动识别并提示安装。

### 步骤2: 配置自动更新
1. 打开Tampermonkey Dashboard
2. 找到 "QQ Mind Map to Obsidian Converter" 脚本
3. 点击脚本名称进入编辑页面
4. 点击 "设置" 标签
5. 在 "更新" 部分：
   - 设置 "检查间隔" 为 "天" (每天检查一次)
   - 或设置为 "请求时" (每次打开相关页面检查)

## 🚀 开发工作流

### 完整流程
```bash
# 1. 修改代码后部署
npm run deploy

# 2. 验证部署状态
npm run verify

# 3. 或者一键执行上述两步
npm run dev
```

### 传统命令
```bash
# 仅构建
node build.js

# 构建并部署
node build.js --deploy

# 验证更新状态
node verify-update.js
```

## 🔧 Tampermonkey操作

### 手动检查更新
1. **方法一**: Dashboard操作
   - 打开Tampermonkey Dashboard
   - 找到您的脚本行
   - 点击 "最后更新" 列的日期
   - 选择 "检查更新"

2. **方法二**: 脚本编辑页面
   - 进入脚本编辑页面
   - 点击顶部的 "检查更新" 按钮

### 自动更新设置详解

#### 检查间隔选项:
- **从不**: 禁用自动更新检查
- **天**: 每天检查一次（推荐）
- **小时**: 每小时检查一次
- **请求时**: 每次访问匹配网站时检查

#### 更新模式:
- **检查**: 发现更新时提示用户
- **检查并安装**: 自动安装更新

## 📊 版本管理机制

### 版本号格式
```
2.0.YYYYMMDD.HHMMSS
```
例如: `2.0.20250808.095155`

### 自动更新原理
1. **Tampermonkey检查**: 定期访问 `@updateURL` 获取最新版本号
2. **版本比较**: 比较本地和远程版本号
3. **提示更新**: 发现新版本时提示用户
4. **自动安装**: 从 `@downloadURL` 下载新版本

## 🛠️ 故障排除

### 常见问题

#### 1. 更新检查失败
**症状**: 提示"检查更新失败"
**解决**:
```bash
# 验证线上版本是否可访问
curl -I "https://gist.githubusercontent.com/carllx/481c282bd808552229e305ce50c1d832/raw/QQmindmap2Obsidian.user.js"

# 重新部署
npm run deploy
```

#### 2. 版本号不匹配
**症状**: 显示版本不一致
**解决**:
```bash
# 检查版本状态
npm run verify

# 如果需要，重新部署
npm run deploy
```

#### 3. 自动更新不工作
**检查项**:
- [ ] 确认脚本包含正确的 `@updateURL` 和 `@downloadURL`
- [ ] 确认Tampermonkey自动更新设置已启用
- [ ] 确认网络连接正常
- [ ] 确认GitHub Gist可访问

### 调试命令
```bash
# 检查脚本元数据
grep -E "@(version|updateURL|downloadURL)" QQmindmap2Obsidian.user.js

# 测试线上访问
curl -s "https://gist.githubusercontent.com/carllx/481c282bd808552229e305ce50c1d832/raw/QQmindmap2Obsidian.user.js" | head -10

# 完整验证
npm run verify
```

## 📋 最佳实践

### 开发建议
1. **每次修改后验证**: 使用 `npm run verify` 确认部署成功
2. **版本控制**: Git提交前确保线上版本已更新
3. **测试流程**: 在测试环境先验证脚本功能

### 用户体验
1. **合理的更新频率**: 不要过于频繁地发布更新
2. **版本说明**: 在commit message中记录主要变更
3. **向后兼容**: 尽量保持API和功能的向后兼容性

## 🎯 高级配置

### 自定义更新间隔
可以通过修改 `@updateURL` 添加参数来控制缓存：
```javascript
// @updateURL https://your-url/script.js?v=timestamp
```

### 多环境部署
```bash
# 开发环境
GIST_ID=dev_gist_id npm run deploy

# 生产环境  
GIST_ID=prod_gist_id npm run deploy
```

## 📞 支持

如果遇到同步问题：
1. 首先运行 `npm run verify` 诊断
2. 检查GitHub Token权限
3. 确认网络和防火墙设置
4. 查看Tampermonkey控制台错误信息

---

**记住**: 每次运行 `npm run deploy` 后，Tampermonkey用户会在下次检查更新时自动获取最新版本！🚀
