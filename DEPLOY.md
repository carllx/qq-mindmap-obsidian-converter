# 🚀 自动部署指南

这个项目支持多种方式自动部署Tampermonkey脚本到线上，实现自动更新功能。

## 🎯 方案概览

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| **GitHub Pages** | 免费、稳定、CDN加速 | 需要public仓库 | 开源项目首选 |
| **GitHub Gist** | 简单快速、支持private | 无自定义域名 | 个人项目 |

## 🚀 方案一：GitHub Pages（推荐）

### 设置步骤

1. **启用GitHub Pages**
   ```bash
   # 在GitHub仓库设置中启用Pages功能
   # 选择 "Deploy from a branch"
   # 分支选择 "gh-pages"
   ```

2. **一键部署**
   ```bash
   # 构建并部署到GitHub Pages
   node deploy.js
   
   # 或者使用集成命令
   node build.js --deploy --target=pages
   ```

3. **脚本URL**
   ```
   https://yourusername.github.io/QQmindmap2Obsidian/userscript.js
   ```

### 自动更新配置

脚本会自动添加以下元数据：
```javascript
// @updateURL      https://yourusername.github.io/QQmindmap2Obsidian/userscript.js
// @downloadURL   https://yourusername.github.io/QQmindmap2Obsidian/userscript.js
```

## 🔗 方案二：GitHub Gist

### 设置步骤

1. **获取GitHub Token**
   - 访问 https://github.com/settings/tokens
   - 创建Personal Access Token
   - 勾选 `gist` 权限

2. **首次部署**
   ```bash
   # 设置环境变量并部署
   GITHUB_TOKEN=your_token node deploy-gist.js
   
   # 或者使用集成命令
   GITHUB_TOKEN=your_token node build.js --deploy --target=gist
   ```

3. **后续更新**
   ```bash
   # 使用保存的Gist ID
   GIST_ID=your_gist_id GITHUB_TOKEN=your_token node deploy-gist.js
   ```

### 环境变量配置

创建 `.env` 文件（不要提交到git）：
```bash
GITHUB_TOKEN=your_personal_access_token
GIST_ID=your_gist_id_after_first_deployment
```

## ⚡ 快捷使用

### 集成构建与部署

```bash
# 构建 + 部署到GitHub Pages
node build.js --deploy --target=pages

# 构建 + 部署到GitHub Gist
GITHUB_TOKEN=your_token node build.js --deploy --target=gist

# 仅构建（默认行为）
node build.js
```

### NPM Scripts配置

在 `package.json` 中添加：

```json
{
  "scripts": {
    "build": "node build.js",
    "deploy:pages": "node build.js --deploy --target=pages",
    "deploy:gist": "node deploy-gist.js",
    "deploy": "npm run deploy:gist"
  }
}
```

使用方法：
```bash
npm run build
npm run deploy:pages
npm run deploy:gist
```

## 🔄 自动更新机制

### 版本号生成规则

脚本会自动生成基于时间戳的版本号：
- 格式：`2.0.YYYYMMDD.HHMMSS`
- 示例：`2.0.20241201.143025`

### Tampermonkey检查更新

Tampermonkey会：
1. 定期检查 `@updateURL` 的脚本版本
2. 发现新版本时提示用户更新
3. 用户确认后从 `@downloadURL` 下载新版本

### 手动检查更新

在Tampermonkey管理面板：
1. 找到您的脚本
2. 点击"检查更新"
3. 确认安装新版本

## 🔧 高级配置

### 自定义域名（GitHub Pages）

1. 在仓库设置中配置自定义域名
2. 修改 `deploy.js` 中的 `getRepoUrl()` 方法：

```javascript
getRepoUrl() {
    return 'https://your-custom-domain.com';
}
```

### CI/CD自动部署

#### GitHub Actions示例

创建 `.github/workflows/deploy.yml`：

```yaml
name: Auto Deploy
on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - uses: actions/setup-node@v2
      with:
        node-version: '18'
    - run: npm install
    - run: node build.js --deploy --target=pages
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## 🐛 故障排除

### 常见问题

1. **部署失败**
   - 检查GitHub Token权限
   - 确保仓库为public（GitHub Pages）
   - 检查网络连接

2. **自动更新不工作**
   - 检查脚本元数据中的URL是否正确
   - 确认线上文件可访问
   - 验证版本号格式

3. **权限错误**
   ```bash
   # 确保脚本有执行权限
   chmod +x deploy.js deploy-gist.js
   ```

### 调试模式

```bash
# 启用详细日志
DEBUG=1 node deploy.js
DEBUG=1 node deploy-gist.js
```

## 📚 最佳实践

1. **测试流程**：先在测试分支验证部署流程
2. **备份策略**：定期备份重要的Gist ID和Token
3. **版本管理**：保持构建脚本和源码同步
4. **安全考虑**：不要在代码中硬编码Token

## 🎉 总结

选择最适合您的部署方案：

- **开源项目** → GitHub Pages
- **私有项目** → GitHub Gist  
- **企业使用** → 自建CDN

每次运行部署命令后，用户的Tampermonkey就能自动获取最新版本！
