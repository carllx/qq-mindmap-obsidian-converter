const fs = require('fs');
const { execSync } = require('child_process');

/**
 * 自动部署脚本到GitHub Pages
 * 运行: node deploy.js
 */
class AutoDeployer {
    constructor() {
        this.scriptPath = 'QQmindmap2Obsidian.user.js';
        this.deployBranch = 'gh-pages';
        this.deployFile = 'userscript.js';
    }

    async deploy() {
        console.log('🚀 开始自动部署到GitHub Pages...');
        
        try {
            // 1. 首先构建脚本
            console.log('📦 构建用户脚本...');
            execSync('node build.js', { stdio: 'inherit' });
            
            // 2. 检查脚本文件是否存在
            if (!fs.existsSync(this.scriptPath)) {
                throw new Error('用户脚本文件不存在，请先运行构建');
            }
            
            // 3. 读取脚本内容并更新版本号和更新URL
            let scriptContent = fs.readFileSync(this.scriptPath, 'utf8');
            
            // 更新版本号（基于当前时间戳）
            const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '.');
            const newVersion = `2.0.${timestamp}`;
            
            // 更新脚本头部的元数据
            scriptContent = this.updateUserScriptMetadata(scriptContent, newVersion);
            
            // 4. 保存更新后的脚本
            fs.writeFileSync(this.scriptPath, scriptContent);
            console.log(`✅ 脚本版本已更新为: ${newVersion}`);
            
            // 5. 部署到GitHub Pages
            this.deployToGitHubPages();
            
            // 6. 提供使用说明
            this.printUsageInstructions();
            
        } catch (error) {
            console.error('❌ 部署失败:', error.message);
            process.exit(1);
        }
    }
    
    updateUserScriptMetadata(content, version) {
        // 获取仓库信息
        const repoUrl = this.getRepoUrl();
        const updateUrl = `${repoUrl}/userscript.js`;
        const downloadUrl = updateUrl;
        
        // 更新版本号
        content = content.replace(
            /^(\/\/ @version\s+)[\d\.]+/m, 
            `$1${version}`
        );
        
        // 添加或更新 updateURL
        if (content.includes('@updateURL')) {
            content = content.replace(
                /^(\/\/ @updateURL\s+).*$/m,
                `$1${updateUrl}`
            );
        } else {
            content = content.replace(
                /(\/\/ @version.*)/,
                `$1\n// @updateURL      ${updateUrl}`
            );
        }
        
        // 添加或更新 downloadURL  
        if (content.includes('@downloadURL')) {
            content = content.replace(
                /^(\/\/ @downloadURL\s+).*$/m,
                `$1${downloadUrl}`
            );
        } else {
            content = content.replace(
                /(\/\/ @updateURL.*)/,
                `$1\n// @downloadURL   ${downloadUrl}`
            );
        }
        
        return content;
    }
    
    getRepoUrl() {
        try {
            // 获取远程仓库URL
            const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
            
            // 转换为GitHub Pages URL
            if (remoteUrl.includes('github.com')) {
                const match = remoteUrl.match(/github\.com[:/]([^/]+)\/([^/]+?)(?:\.git)?$/);
                if (match) {
                    const [, owner, repo] = match;
                    return `https://${owner}.github.io/${repo}`;
                }
            }
            
            throw new Error('无法识别GitHub仓库URL');
        } catch (error) {
            console.warn('⚠️  无法自动获取仓库URL，使用默认配置');
            return 'https://yourusername.github.io/QQmindmap2Obsidian';
        }
    }
    
    deployToGitHubPages() {
        console.log('📤 部署到GitHub Pages...');
        
        try {
            // 创建临时目录
            if (!fs.existsSync('temp-deploy')) {
                fs.mkdirSync('temp-deploy');
            }
            
            // 复制脚本文件到临时目录
            fs.copyFileSync(this.scriptPath, `temp-deploy/${this.deployFile}`);
            
            // 创建简单的index.html
            const indexHtml = this.createIndexHtml();
            fs.writeFileSync('temp-deploy/index.html', indexHtml);
            
            // Git操作
            const commands = [
                'git add .',
                'git commit -m "Update userscript"',
                'git subtree push --prefix temp-deploy origin gh-pages'
            ];
            
            commands.forEach(cmd => {
                console.log(`  执行: ${cmd}`);
                execSync(cmd, { stdio: 'inherit' });
            });
            
            // 清理临时目录
            fs.rmSync('temp-deploy', { recursive: true, force: true });
            
            console.log('✅ 部署到GitHub Pages成功！');
            
        } catch (error) {
            console.error('❌ GitHub Pages部署失败:', error.message);
            console.log('\n💡 替代方案：请手动执行以下步骤：');
            console.log('1. 创建gh-pages分支');
            console.log('2. 将QQmindmap2Obsidian.user.js复制为userscript.js');
            console.log('3. 推送到gh-pages分支');
            console.log('4. 在GitHub仓库设置中启用Pages功能');
        }
    }
    
    createIndexHtml() {
        const repoUrl = this.getRepoUrl();
        return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QQ Mind Map to Obsidian Converter</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px; 
            margin: 0 auto; 
            padding: 2rem;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .install-button {
            display: inline-block;
            background: #007acc;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin: 1rem 0;
        }
        .install-button:hover {
            background: #005999;
        }
        .code {
            background: #f8f8f8;
            padding: 1rem;
            border-radius: 4px;
            font-family: 'Monaco', 'Consolas', monospace;
            overflow-x: auto;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔄 QQ Mind Map to Obsidian Converter</h1>
        <p>这是一个Tampermonkey用户脚本，用于在QQ思维导图和Obsidian Markdown之间进行双向转换。</p>
        
        <h2>📦 安装方式</h2>
        <ol>
            <li>确保已安装 <a href="https://tampermonkey.net/" target="_blank">Tampermonkey</a> 扩展</li>
            <li>点击下面的安装按钮</li>
            <li>在弹出的页面中点击"安装"</li>
        </ol>
        
        <a href="./userscript.js" class="install-button">🚀 安装用户脚本</a>
        
        <h2>🔄 自动更新</h2>
        <p>脚本支持自动更新。Tampermonkey会定期检查更新，您也可以手动检查：</p>
        <div class="code">
            Tampermonkey Dashboard → 您的脚本 → 检查更新
        </div>
        
        <h2>📚 使用说明</h2>
        <ul>
            <li>访问 <code>naotu.qq.com</code> 或 <code>docs.qq.com/mind</code></li>
            <li>界面会出现转换工具按钮</li>
            <li>支持 QQ思维导图 ↔ Obsidian Markdown 双向转换</li>
            <li>转换结果会自动复制到剪贴板</li>
        </ul>
        
        <h2>🐛 问题反馈</h2>
        <p>如遇到问题，请到 <a href="https://github.com/your-repo/issues" target="_blank">GitHub Issues</a> 反馈。</p>
    </div>
</body>
</html>`;
    }
    
    printUsageInstructions() {
        const repoUrl = this.getRepoUrl();
        
        console.log('\n🎉 部署完成！使用方法：');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('1. 🌐 访问您的GitHub Pages页面:');
        console.log(`   ${repoUrl}`);
        console.log('');
        console.log('2. 📦 在Tampermonkey中添加脚本:');
        console.log(`   ${repoUrl}/userscript.js`);
        console.log('');
        console.log('3. 🔄 自动更新配置已完成，Tampermonkey会自动检查更新');
        console.log('');
        console.log('4. 🚀 每次运行 `node deploy.js` 都会自动发布新版本');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    const deployer = new AutoDeployer();
    deployer.deploy();
}

module.exports = AutoDeployer;
