const fs = require('fs');
const path = require('path');

/**
 * 项目优化脚本
 * 清理无效文件并检查项目结构
 */
class ProjectOptimizer {
    constructor() {
        this.buildScript = 'build.js';
        this.templateFile = 'templates/userScript.template.js';
        this.outputFile = 'QQmindmap2Obsidian.user.js';
    }

    /**
     * 分析构建脚本中引用的模块
     */
    analyzeBuildScript() {
        console.log('🔍 分析构建脚本...');
        
        const buildContent = fs.readFileSync(this.buildScript, 'utf8');
        const moduleRegex = /file:\s*['"]([^'"]+)['"]/g;
        const referencedModules = [];
        let match;
        
        while ((match = moduleRegex.exec(buildContent)) !== null) {
            referencedModules.push(match[1]);
        }
        
        console.log('📦 构建脚本引用的模块:');
        referencedModules.forEach(module => {
            const exists = fs.existsSync(module);
            const status = exists ? '✅' : '❌';
            console.log(`  ${status} ${module}`);
        });
        
        return referencedModules;
    }

    /**
     * 检查可能无效的文件
     */
    findInvalidFiles() {
        console.log('\n🔍 检查可能无效的文件...');
        
        const invalidFiles = [];
        
        // 检查旧版本文件
        const legacyFiles = [
            'UserScript_legacy.js'
        ];
        
        legacyFiles.forEach(file => {
            if (fs.existsSync(file)) {
                invalidFiles.push({
                    file,
                    reason: '旧版本文件，已被新版本替代',
                    action: 'delete'
                });
            }
        });
        
        // 检查未使用的模块
        const unusedModules = [
            'core/converters/qq2md_improved.js',
            'core/parsers/mdParser.js'
        ];
        
        unusedModules.forEach(module => {
            if (fs.existsSync(module)) {
                invalidFiles.push({
                    file: module,
                    reason: '在构建脚本中未被引用',
                    action: 'review'
                });
            }
        });
        
        // 检查调试文件
        const debugFiles = [
            'test/debugArduino.js',
            'test/debug_init.js',
            'test/debug_markdown_parsing.js',
            'test/debug_modules.js',
            'test/textstyle_debug.js',
            'test/textstyle_debug2.js',
            'test/textstyle_debug3.js',
            'test/textstyle_debug4.js'
        ];
        
        debugFiles.forEach(file => {
            if (fs.existsSync(file)) {
                invalidFiles.push({
                    file,
                    reason: '调试文件，开发阶段使用',
                    action: 'review'
                });
            }
        });
        
        // 检查过时的测试文件
        const outdatedTestFiles = [
            'test/libraryComparisonTest.js',
            'test/browser_global_test.js',
            'test/browser_simulation_test.js',
            'test/browserModuleLoadTest.js',
            'test/browserModuleTest.js'
        ];
        
        outdatedTestFiles.forEach(file => {
            if (fs.existsSync(file)) {
                invalidFiles.push({
                    file,
                    reason: '过时的测试文件',
                    action: 'review'
                });
            }
        });
        
        return invalidFiles;
    }

    /**
     * 检查文件大小和内容
     */
    analyzeFileStats() {
        console.log('\n📊 文件大小分析...');
        
        const filesToAnalyze = [
            'QQmindmap2Obsidian.user.js',
            'UserScript_legacy.js',
            'core/converters/qq2md.js',
            'core/converters/qq2md_improved.js',
            'core/converters/md2qq.js',
            'core/parsers/qqParser.js',
            'core/parsers/mdParser.js',
            'core/formatters/richText.js',
            'core/utils/indentManager.js',
            'core/utils/linePreserver.js',
            'ui/notifications.js',
            'ui/interface.js'
        ];
        
        filesToAnalyze.forEach(file => {
            if (fs.existsSync(file)) {
                const stats = fs.statSync(file);
                const sizeKB = (stats.size / 1024).toFixed(2);
                console.log(`  ${file}: ${sizeKB} KB`);
            }
        });
    }

    /**
     * 生成优化报告
     */
    generateOptimizationReport() {
        console.log('\n📋 项目优化报告');
        console.log('==================================================');
        
        // 分析构建脚本
        const referencedModules = this.analyzeBuildScript();
        
        // 查找无效文件
        const invalidFiles = this.findInvalidFiles();
        
        // 分析文件统计
        this.analyzeFileStats();
        
        // 生成建议
        console.log('\n💡 优化建议:');
        
        if (invalidFiles.length === 0) {
            console.log('  ✅ 项目结构良好，没有发现明显的问题');
        } else {
            invalidFiles.forEach(item => {
                const action = item.action === 'delete' ? '删除' : '审查';
                console.log(`  ${item.action === 'delete' ? '🗑️' : '🔍'} ${item.file}`);
                console.log(`     原因: ${item.reason}`);
                console.log(`     建议: ${action}`);
                console.log('');
            });
        }
        
        // 检查构建输出
        if (fs.existsSync(this.outputFile)) {
            const stats = fs.statSync(this.outputFile);
            const sizeKB = (stats.size / 1024).toFixed(2);
            console.log(`  📦 构建输出: ${this.outputFile} (${sizeKB} KB)`);
        } else {
            console.log('  ⚠️  构建输出文件不存在，请运行 build.js');
        }
        
        return {
            referencedModules,
            invalidFiles,
            totalInvalidFiles: invalidFiles.length
        };
    }

    /**
     * 执行清理操作
     */
    async cleanupFiles(invalidFiles, dryRun = true) {
        console.log(`\n${dryRun ? '🔍' : '🗑️'} ${dryRun ? '模拟清理' : '执行清理'}...`);
        
        const filesToDelete = invalidFiles.filter(item => item.action === 'delete');
        
        if (filesToDelete.length === 0) {
            console.log('  ✅ 没有需要删除的文件');
            return;
        }
        
        for (const item of filesToDelete) {
            if (fs.existsSync(item.file)) {
                if (dryRun) {
                    console.log(`  🔍 将删除: ${item.file}`);
                } else {
                    try {
                        fs.unlinkSync(item.file);
                        console.log(`  ✅ 已删除: ${item.file}`);
                    } catch (error) {
                        console.error(`  ❌ 删除失败: ${item.file}`, error.message);
                    }
                }
            }
        }
        
        if (dryRun) {
            console.log(`\n💡 运行 'node optimize_project.js cleanup' 来实际删除这些文件`);
        }
    }
}

// 主函数
async function main() {
    const optimizer = new ProjectOptimizer();
    
    const args = process.argv.slice(2);
    const command = args[0];
    
    if (command === 'cleanup') {
        const report = optimizer.generateOptimizationReport();
        await optimizer.cleanupFiles(report.invalidFiles, false);
    } else {
        const report = optimizer.generateOptimizationReport();
        await optimizer.cleanupFiles(report.invalidFiles, true);
        
        console.log('\n📈 优化总结:');
        console.log(`  - 引用的模块: ${report.referencedModules.length}`);
        console.log(`  - 可能无效的文件: ${report.totalInvalidFiles}`);
        console.log(`  - 建议删除的文件: ${report.invalidFiles.filter(f => f.action === 'delete').length}`);
        console.log(`  - 建议审查的文件: ${report.invalidFiles.filter(f => f.action === 'review').length}`);
    }
}

// 运行优化器
main().catch(console.error); 