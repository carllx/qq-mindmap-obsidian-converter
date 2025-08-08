#!/usr/bin/env node

/**
 * 验证Tampermonkey脚本更新状态
 * 使用方法: node verify-update.js
 */

const https = require('https');
const fs = require('fs');

class UpdateVerifier {
    constructor() {
        this.scriptUrl = 'https://gist.githubusercontent.com/carllx/481c282bd808552229e305ce50c1d832/raw/QQmindmap2Obsidian.user.js';
        this.localScript = 'QQmindmap2Obsidian.user.js';
    }

    async verify() {
        console.log('🔍 验证脚本更新状态...\n');

        try {
            // 1. 获取本地版本
            const localVersion = this.getLocalVersion();
            console.log(`📱 本地版本: ${localVersion}`);

            // 2. 获取线上版本
            const onlineVersion = await this.getOnlineVersion();
            console.log(`☁️  线上版本: ${onlineVersion}`);

            // 3. 比较版本
            this.compareVersions(localVersion, onlineVersion);

            // 4. 提供Tampermonkey操作指导
            this.provideTampermonkeyGuide();

        } catch (error) {
            console.error('❌ 验证失败:', error.message);
        }
    }

    getLocalVersion() {
        if (!fs.existsSync(this.localScript)) {
            throw new Error('本地脚本文件不存在，请先运行 node build.js');
        }

        const content = fs.readFileSync(this.localScript, 'utf8');
        const versionMatch = content.match(/\/\/ @version\s+([\d\.]+)/);
        
        if (!versionMatch) {
            throw new Error('无法解析本地脚本版本号');
        }

        return versionMatch[1];
    }

    getOnlineVersion() {
        return new Promise((resolve, reject) => {
            https.get(this.scriptUrl, (res) => {
                if (res.statusCode === 301 || res.statusCode === 302) {
                    // 处理重定向
                    this.getOnlineVersionFromUrl(res.headers.location).then(resolve).catch(reject);
                    return;
                }

                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const versionMatch = data.match(/\/\/ @version\s+([\d\.]+)/);
                        if (!versionMatch) {
                            reject(new Error('无法解析线上脚本版本号'));
                            return;
                        }
                        resolve(versionMatch[1]);
                    } catch (error) {
                        reject(error);
                    }
                });
            }).on('error', reject);
        });
    }

    getOnlineVersionFromUrl(url) {
        return new Promise((resolve, reject) => {
            https.get(url, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const versionMatch = data.match(/\/\/ @version\s+([\d\.]+)/);
                        if (!versionMatch) {
                            reject(new Error('无法解析线上脚本版本号'));
                            return;
                        }
                        resolve(versionMatch[1]);
                    } catch (error) {
                        reject(error);
                    }
                });
            }).on('error', reject);
        });
    }

    compareVersions(local, online) {
        console.log('\n📊 版本比较:');
        
        if (local === online) {
            console.log('✅ 版本一致 - 本地和线上版本相同');
            console.log('🔄 Tampermonkey应该能检测到这个版本');
        } else {
            console.log('⚠️  版本不一致');
            console.log(`   本地: ${local}`);
            console.log(`   线上: ${online}`);
            
            if (this.isNewerVersion(online, local)) {
                console.log('📤 线上版本更新，建议重新部署');
            } else {
                console.log('📥 本地版本更新，可能需要重新部署');
            }
        }
    }

    isNewerVersion(version1, version2) {
        // 简单的版本比较，适用于时间戳格式的版本号
        return version1 > version2;
    }

    provideTampermonkeyGuide() {
        console.log('\n🔧 Tampermonkey操作指南:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('');
        console.log('📥 首次安装:');
        console.log(`   1. 浏览器访问: ${this.scriptUrl}`);
        console.log('   2. Tampermonkey会自动提示安装');
        console.log('   3. 点击"安装"按钮');
        console.log('');
        console.log('🔄 检查更新:');
        console.log('   方法1: Tampermonkey Dashboard → 找到脚本 → 点击"检查更新"');
        console.log('   方法2: 等待自动检查（默认每天检查一次）');
        console.log('');
        console.log('⚙️  配置自动更新:');
        console.log('   1. Tampermonkey Dashboard → 点击脚本名称进入编辑');
        console.log('   2. 点击"设置"标签');
        console.log('   3. 在"更新"部分设置检查间隔');
        console.log('');
        console.log('🚀 开发工作流:');
        console.log('   1. 修改代码');
        console.log('   2. 运行: node build.js --deploy');
        console.log('   3. 运行: node verify-update.js (验证)');
        console.log('   4. Tampermonkey自动检测更新');
        console.log('');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    const verifier = new UpdateVerifier();
    verifier.verify();
}

module.exports = UpdateVerifier;
