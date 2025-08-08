const fs = require('fs');
const https = require('https');
const { execSync } = require('child_process');

// 尝试加载.env文件
function loadEnvFile() {
    try {
        if (fs.existsSync('.env')) {
            const envContent = fs.readFileSync('.env', 'utf8');
            envContent.split('\n').forEach(line => {
                const [key, value] = line.split('=');
                if (key && value && !key.startsWith('#')) {
                    process.env[key.trim()] = value.trim();
                }
            });
            console.log('✅ 已加载.env文件');
        }
    } catch (error) {
        console.warn('⚠️  无法加载.env文件:', error.message);
    }
}

// 加载环境变量
loadEnvFile();

/**
 * 自动部署脚本到GitHub Gist
 * 需要GitHub Personal Access Token
 * 运行: GITHUB_TOKEN=your_token node deploy-gist.js
 */
class GistDeployer {
    constructor() {
        this.scriptPath = 'QQmindmap2Obsidian.user.js';
        this.token = process.env.GITHUB_TOKEN;
        this.gistId = process.env.GIST_ID; // 可选：指定现有Gist ID
    }

    async deploy() {
        console.log('🚀 开始自动部署到GitHub Gist...');
        
        if (!this.token) {
            console.error('❌ 请设置GITHUB_TOKEN环境变量');
            console.log('💡 获取token: https://github.com/settings/tokens');
            console.log('💡 需要gist权限');
            console.log('💡 使用方法: GITHUB_TOKEN=your_token node deploy-gist.js');
            process.exit(1);
        }
        
        try {
            // 1. 构建脚本
            console.log('📦 构建用户脚本...');
            execSync('node build.js', { stdio: 'inherit' });
            
            // 2. 读取脚本内容并更新
            let scriptContent = fs.readFileSync(this.scriptPath, 'utf8');
            
            // 3. 更新版本号
            const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '.');
            const newVersion = `2.0.${timestamp}`;
            scriptContent = this.updateUserScriptMetadata(scriptContent, newVersion);
            
            // 4. 部署到Gist
            const gistUrl = await this.deployToGist(scriptContent, newVersion);
            
            // 5. 更新本地文件
            fs.writeFileSync(this.scriptPath, scriptContent);
            
            console.log('✅ 部署成功！');
            console.log(`🔗 Gist URL: ${gistUrl}`);
            console.log(`📦 脚本URL: ${gistUrl}/raw/QQmindmap2Obsidian.user.js`);
            
        } catch (error) {
            console.error('❌ 部署失败:', error.message);
            process.exit(1);
        }
    }
    
    updateUserScriptMetadata(content, version) {
        let updateUrl = '';
        let downloadUrl = '';
        
        if (this.gistId) {
            // 获取用户名用于构建正确的URL
            updateUrl = `https://gist.githubusercontent.com/carllx/${this.gistId}/raw/QQmindmap2Obsidian.user.js`;
            downloadUrl = updateUrl;
        } else {
            // 如果没有指定Gist ID，先使用占位符
            updateUrl = '// Will be updated after gist creation';
            downloadUrl = '// Will be updated after gist creation';
        }
        
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
    
    async deployToGist(content, version) {
        const gistData = {
            description: `QQ Mind Map to Obsidian Converter v${version}`,
            public: true,
            files: {
                "QQmindmap2Obsidian.user.js": {
                    content: content
                },
                "README.md": {
                    content: this.createReadme(version)
                }
            }
        };
        
        const method = this.gistId ? 'PATCH' : 'POST';
        const path = this.gistId ? `/gists/${this.gistId}` : '/gists';
        
        console.log(`📤 ${this.gistId ? '更新' : '创建'} Gist...`);
        
        return new Promise((resolve, reject) => {
            const postData = JSON.stringify(gistData);
            
            const options = {
                hostname: 'api.github.com',
                path: path,
                method: method,
                headers: {
                    'Authorization': `token ${this.token}`,
                    'User-Agent': 'QQMindMap-Deploy-Script',
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                }
            };
            
            const req = https.request(options, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    if (res.statusCode === 200 || res.statusCode === 201) {
                        const response = JSON.parse(data);
                        
                        // 如果是新创建的Gist，保存ID供下次使用
                        if (!this.gistId) {
                            this.gistId = response.id;
                            console.log(`💾 新Gist ID: ${this.gistId}`);
                            console.log('💡 下次使用: GIST_ID=' + this.gistId + ' GITHUB_TOKEN=your_token node deploy-gist.js');
                            
                            // 更新URL并重新上传
                            const updatedContent = this.updateGistUrls(content, this.gistId);
                            this.updateGistContent(updatedContent, version).then(() => {
                                resolve(response.html_url);
                            }).catch(reject);
                        } else {
                            resolve(response.html_url);
                        }
                    } else {
                        reject(new Error(`GitHub API error: ${res.statusCode} ${data}`));
                    }
                });
            });
            
            req.on('error', (err) => {
                reject(err);
            });
            
            req.write(postData);
            req.end();
        });
    }
    
    updateGistUrls(content, gistId) {
        const updateUrl = `https://gist.githubusercontent.com/carllx/${gistId}/raw/QQmindmap2Obsidian.user.js`;
        
        content = content.replace(
            /^(\/\/ @updateURL\s+).*$/m,
            `$1${updateUrl}`
        );
        
        content = content.replace(
            /^(\/\/ @downloadURL\s+).*$/m,
            `$1${updateUrl}`
        );
        
        return content;
    }
    
    async updateGistContent(content, version) {
        const gistData = {
            files: {
                "QQmindmap2Obsidian.user.js": {
                    content: content
                }
            }
        };
        
        return new Promise((resolve, reject) => {
            const postData = JSON.stringify(gistData);
            
            const options = {
                hostname: 'api.github.com',
                path: `/gists/${this.gistId}`,
                method: 'PATCH',
                headers: {
                    'Authorization': `token ${this.token}`,
                    'User-Agent': 'QQMindMap-Deploy-Script',
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                }
            };
            
            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => { data += chunk; });
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        console.log('✅ Gist URL已更新');
                        resolve();
                    } else {
                        reject(new Error(`Failed to update Gist: ${res.statusCode} ${data}`));
                    }
                });
            });
            
            req.on('error', reject);
            req.write(postData);
            req.end();
        });
    }
    
    createReadme(version) {
        return `# QQ Mind Map to Obsidian Converter

**版本:** ${version}  
**更新时间:** ${new Date().toLocaleString('zh-CN')}

## 🚀 安装方法

1. 安装 [Tampermonkey](https://tampermonkey.net/) 浏览器扩展
2. 点击以下链接安装脚本：
   
   **[📦 安装用户脚本](https://gist.githubusercontent.com/raw/${this.gistId}/QQmindmap2Obsidian.user.js)**

## 🔄 自动更新

脚本已配置自动更新功能，Tampermonkey会定期检查更新。

## 📚 功能说明

- 🔄 QQ思维导图 ↔ Obsidian Markdown 双向转换
- 📝 支持富文本格式保留
- 🖼️ 支持图片和附件处理
- 🎨 支持样式和结构保持
- 📋 一键复制到剪贴板

## 🌐 支持的网站

- \`naotu.qq.com\` - QQ思维导图
- \`docs.qq.com/mind\` - 腾讯文档思维导图

## 🐛 问题反馈

如果遇到问题，请在GitHub仓库提交Issue。

---
*由 deploy-gist.js 自动生成*`;
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    const deployer = new GistDeployer();
    deployer.deploy();
}

module.exports = GistDeployer;
