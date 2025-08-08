/**
 * 测试自动部署功能
 */
const { execSync } = require('child_process');
const https = require('https');

async function testDeployment() {
    console.log('🧪 开始测试自动部署功能...\n');
    
    try {
        // 1. 测试构建和部署
        console.log('1️⃣ 测试构建和部署...');
        const buildOutput = execSync('node build.js --deploy', { encoding: 'utf8' });
        console.log('✅ 构建和部署成功');
        
        // 2. 提取脚本URL
        const urlMatch = buildOutput.match(/📦 脚本URL: (https:\/\/[^\s]+)/);
        if (!urlMatch) {
            throw new Error('无法找到脚本URL');
        }
        const scriptUrl = urlMatch[1];
        console.log(`🔗 脚本URL: ${scriptUrl}`);
        
        // 3. 测试线上文件访问
        console.log('\n2️⃣ 测试线上文件访问...');
        await testUrlAccess(scriptUrl);
        console.log('✅ 线上文件可正常访问');
        
        // 4. 验证版本号
        console.log('\n3️⃣ 验证版本号和更新URL...');
        await testScriptMetadata(scriptUrl);
        console.log('✅ 脚本元数据正确');
        
        console.log('\n🎉 所有测试通过！自动部署功能已就绪');
        console.log('\n📋 使用方法:');
        console.log('  - 日常更新: node build.js --deploy');
        console.log('  - 仅构建: node build.js');
        console.log(`  - Tampermonkey安装: ${scriptUrl}`);
        
    } catch (error) {
        console.error('❌ 测试失败:', error.message);
        process.exit(1);
    }
}

function testUrlAccess(url) {
    return new Promise((resolve, reject) => {
        function makeRequest(requestUrl) {
            https.get(requestUrl, (res) => {
                if (res.statusCode === 200) {
                    console.log(`  状态码: ${res.statusCode}`);
                    console.log(`  内容类型: ${res.headers['content-type']}`);
                    console.log(`  文件大小: ${res.headers['content-length']} bytes`);
                    resolve();
                } else if (res.statusCode === 301 || res.statusCode === 302) {
                    console.log(`  重定向: ${res.statusCode} -> ${res.headers.location}`);
                    makeRequest(res.headers.location);
                } else {
                    reject(new Error(`HTTP ${res.statusCode}`));
                }
            }).on('error', reject);
        }
        makeRequest(url);
    });
}

function testScriptMetadata(url) {
    return new Promise((resolve, reject) => {
        function makeRequest(requestUrl) {
            https.get(requestUrl, (res) => {
                if (res.statusCode === 301 || res.statusCode === 302) {
                    makeRequest(res.headers.location);
                    return;
                }
                
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                try {
                    // 检查脚本头部
                    const lines = data.split('\n').slice(0, 20);
                    
                    const versionLine = lines.find(line => line.includes('@version'));
                    const updateUrlLine = lines.find(line => line.includes('@updateURL'));
                    const downloadUrlLine = lines.find(line => line.includes('@downloadURL'));
                    
                    if (!versionLine) throw new Error('未找到版本号');
                    if (!updateUrlLine) throw new Error('未找到updateURL');
                    if (!downloadUrlLine) throw new Error('未找到downloadURL');
                    
                    console.log(`  版本号: ${versionLine.trim()}`);
                    console.log(`  更新URL: ${updateUrlLine.trim()}`);
                    console.log(`  下载URL: ${downloadUrlLine.trim()}`);
                    
                    // 验证URL格式
                    if (!updateUrlLine.includes('gist.githubusercontent.com')) {
                        throw new Error('updateURL格式不正确');
                    }
                    
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
            }).on('error', reject);
        }
        makeRequest(url);
    });
}

// 运行测试
if (require.main === module) {
    testDeployment();
}

module.exports = { testDeployment };
