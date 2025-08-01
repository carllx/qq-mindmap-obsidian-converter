const fs = require('fs');
const path = require('path');

/**
 * 文档优化脚本
 * 清理和重新组织项目文档，从架构角度确认文档位置
 */
class DocsOptimizer {
    constructor() {
        this.docsDir = 'docs';
        this.testDir = 'test';
        this.coreDir = 'core';
        this.projectRoot = '.';
    }

    /**
     * 分析当前文档结构
     */
    analyzeCurrentDocs() {
        console.log('📚 分析当前文档结构...');
        
        const docs = this.findAllDocs();
        
        console.log('\n📋 当前文档分布:');
        docs.forEach(doc => {
            const stats = fs.statSync(doc.path);
            const sizeKB = (stats.size / 1024).toFixed(2);
            console.log(`  ${doc.path}: ${sizeKB} KB`);
        });
        
        return docs;
    }

    /**
     * 查找所有文档文件
     */
    findAllDocs() {
        const docs = [];
        
        // 扫描各个目录
        const directories = [
            { path: this.docsDir, type: 'docs' },
            { path: this.testDir, type: 'test' },
            { path: this.coreDir, type: 'core' },
            { path: this.projectRoot, type: 'root' }
        ];
        
        directories.forEach(dir => {
            if (fs.existsSync(dir.path)) {
                const files = this.scanDirectory(dir.path);
                files.forEach(file => {
                    if (this.isDocFile(file)) {
                        docs.push({
                            path: file,
                            type: dir.type,
                            size: fs.statSync(file).size
                        });
                    }
                });
            }
        });
        
        return docs;
    }

    /**
     * 扫描目录
     */
    scanDirectory(dirPath) {
        const files = [];
        
        function scan(currentPath) {
            const items = fs.readdirSync(currentPath);
            
            items.forEach(item => {
                const fullPath = path.join(currentPath, item);
                const stat = fs.statSync(fullPath);
                
                // 排除 node_modules 目录
                if (item === 'node_modules') {
                    return;
                }
                
                if (stat.isDirectory()) {
                    scan(fullPath);
                } else if (stat.isFile()) {
                    files.push(fullPath);
                }
            });
        }
        
        scan(dirPath);
        return files;
    }

    /**
     * 判断是否为文档文件
     */
    isDocFile(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        return ext === '.md' || ext === '.txt' || ext === '.html';
    }

    /**
     * 分析文档内容和价值
     */
    analyzeDocValue(docs) {
        console.log('\n🔍 分析文档价值...');
        
        const analysis = [];
        
        docs.forEach(doc => {
            const content = fs.readFileSync(doc.path, 'utf8');
            const lines = content.split('\n').length;
            const hasCode = content.includes('```');
            const hasImages = content.includes('![');
            const hasLinks = content.includes('[') && content.includes('](');
            
            // 计算文档价值分数
            let score = 0;
            let value = 'low';
            
            // 基于内容长度
            if (lines > 100) score += 3;
            else if (lines > 50) score += 2;
            else if (lines > 20) score += 1;
            
            // 基于内容类型
            if (hasCode) score += 2;
            if (hasImages) score += 1;
            if (hasLinks) score += 1;
            
            // 基于文件位置
            if (doc.type === 'docs') score += 2;
            else if (doc.type === 'core') score += 1;
            
            // 基于文件名
            const fileName = path.basename(doc.path);
            if (fileName.includes('guide') || fileName.includes('guide')) score += 2;
            if (fileName.includes('readme') || fileName.includes('README')) score += 3;
            if (fileName.includes('index') || fileName.includes('INDEX')) score += 2;
            
            if (score >= 6) value = 'high';
            else if (score >= 3) value = 'medium';
            
            analysis.push({
                ...doc,
                lines,
                hasCode,
                hasImages,
                hasLinks,
                score,
                value
            });
        });
        
        return analysis;
    }

    /**
     * 生成文档架构建议
     */
    generateArchitectureRecommendations(analysis) {
        console.log('\n🏗️ 文档架构建议...');
        
        const recommendations = {
            highValue: [],
            mediumValue: [],
            lowValue: [],
            duplicates: [],
            misplaced: []
        };
        
        // 分类文档
        analysis.forEach(doc => {
            if (doc.value === 'high') {
                recommendations.highValue.push(doc);
            } else if (doc.value === 'medium') {
                recommendations.mediumValue.push(doc);
            } else {
                recommendations.lowValue.push(doc);
            }
            
            // 检查重复内容
            const fileName = path.basename(doc.path);
            const similarDocs = analysis.filter(d => 
                d !== doc && 
                path.basename(d.path) === fileName
            );
            
            if (similarDocs.length > 0) {
                recommendations.duplicates.push({
                    original: doc,
                    duplicates: similarDocs
                });
            }
            
            // 检查位置是否合适
            if (this.isMisplaced(doc)) {
                recommendations.misplaced.push(doc);
            }
        });
        
        return recommendations;
    }

    /**
     * 判断文档是否放错位置
     */
    isMisplaced(doc) {
        const fileName = path.basename(doc.path);
        
        // 核心功能文档应该在 docs 目录
        if (doc.type === 'core' && fileName.includes('richtext')) {
            return true;
        }
        
        // 测试文档应该在 test 目录
        if (doc.type === 'test' && fileName.includes('test')) {
            return false;
        }
        
        // 开发指南应该在 docs 目录
        if (doc.type === 'test' && fileName.includes('guide')) {
            return true;
        }
        
        return false;
    }

    /**
     * 生成优化建议
     */
    generateOptimizationPlan(recommendations) {
        console.log('\n💡 优化建议:');
        
        // 高价值文档
        if (recommendations.highValue.length > 0) {
            console.log('\n📚 高价值文档 (建议保留):');
            recommendations.highValue.forEach(doc => {
                console.log(`  ✅ ${doc.path} (${doc.lines} 行, ${(doc.size / 1024).toFixed(2)} KB)`);
            });
        }
        
        // 中等价值文档
        if (recommendations.mediumValue.length > 0) {
            console.log('\n📖 中等价值文档 (建议审查):');
            recommendations.mediumValue.forEach(doc => {
                console.log(`  🔍 ${doc.path} (${doc.lines} 行, ${(doc.size / 1024).toFixed(2)} KB)`);
            });
        }
        
        // 低价值文档
        if (recommendations.lowValue.length > 0) {
            console.log('\n🗑️ 低价值文档 (建议删除):');
            recommendations.lowValue.forEach(doc => {
                console.log(`  🗑️ ${doc.path} (${doc.lines} 行, ${(doc.size / 1024).toFixed(2)} KB)`);
            });
        }
        
        // 重复文档
        if (recommendations.duplicates.length > 0) {
            console.log('\n🔄 重复文档 (建议合并):');
            recommendations.duplicates.forEach(dup => {
                console.log(`  🔄 ${dup.original.path} 与以下文件重复:`);
                dup.duplicates.forEach(d => {
                    console.log(`      ${d.path}`);
                });
            });
        }
        
        // 位置不当的文档
        if (recommendations.misplaced.length > 0) {
            console.log('\n📍 位置不当的文档 (建议移动):');
            recommendations.misplaced.forEach(doc => {
                const suggestedPath = this.getSuggestedPath(doc);
                console.log(`  📍 ${doc.path} → ${suggestedPath}`);
            });
        }
    }

    /**
     * 获取建议的文档路径
     */
    getSuggestedPath(doc) {
        const fileName = path.basename(doc.path);
        
        if (fileName.includes('richtext')) {
            return `docs/richtext-format-guide.md`;
        }
        
        if (fileName.includes('guide')) {
            return `docs/${fileName}`;
        }
        
        if (fileName.includes('test')) {
            return `test/${fileName}`;
        }
        
        return `docs/${fileName}`;
    }

    /**
     * 执行文档优化
     */
    async optimizeDocs(dryRun = true) {
        console.log(`\n${dryRun ? '🔍' : '🔄'} ${dryRun ? '模拟优化' : '执行优化'}...`);
        
        const docs = this.findAllDocs();
        const analysis = this.analyzeDocValue(docs);
        const recommendations = this.generateArchitectureRecommendations(analysis);
        
        this.generateOptimizationPlan(recommendations);
        
        if (!dryRun) {
            // 执行实际的优化操作
            await this.performOptimization(recommendations);
        }
        
        return {
            totalDocs: docs.length,
            highValue: recommendations.highValue.length,
            mediumValue: recommendations.mediumValue.length,
            lowValue: recommendations.lowValue.length,
            duplicates: recommendations.duplicates.length,
            misplaced: recommendations.misplaced.length
        };
    }

    /**
     * 执行优化操作
     */
    async performOptimization(recommendations) {
        console.log('\n🔄 执行优化操作...');
        
        // 创建备份目录
        const backupDir = 'docs_backup_' + Date.now();
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir);
        }
        
        // 移动位置不当的文档
        for (const doc of recommendations.misplaced) {
            const suggestedPath = this.getSuggestedPath(doc);
            const suggestedDir = path.dirname(suggestedPath);
            
            // 创建目标目录
            if (!fs.existsSync(suggestedDir)) {
                fs.mkdirSync(suggestedDir, { recursive: true });
            }
            
            // 备份原文件
            const backupPath = path.join(backupDir, path.basename(doc.path));
            fs.copyFileSync(doc.path, backupPath);
            
            // 移动文件
            fs.renameSync(doc.path, suggestedPath);
            console.log(`  ✅ 移动: ${doc.path} → ${suggestedPath}`);
        }
        
        // 删除低价值文档
        for (const doc of recommendations.lowValue) {
            // 备份文件
            const backupPath = path.join(backupDir, path.basename(doc.path));
            fs.copyFileSync(doc.path, backupPath);
            
            // 删除文件
            fs.unlinkSync(doc.path);
            console.log(`  🗑️ 删除: ${doc.path}`);
        }
        
        console.log(`\n💾 备份文件保存在: ${backupDir}`);
    }

    /**
     * 生成新的文档结构
     */
    generateNewDocStructure() {
        console.log('\n📁 建议的新文档结构:');
        
        const structure = `
docs/
├── README.md                    # 项目主要文档
├── DEVELOPMENT_GUIDE.md         # 开发指南 (合并现有指南)
├── CODE_BLOCK_GUIDE.md         # 代码块处理指南
├── RICHTEXT_FORMAT_GUIDE.md    # QQ思维导图格式指南
├── BROWSER_ENVIRONMENT.md       # 浏览器环境说明
└── ARCHITECTURE.md             # 项目架构文档

test/
├── README.md                   # 测试说明
└── test_*.md                  # 测试相关文档

core/
└── (无文档文件，技术文档移至docs/)

项目根目录/
├── README.md                   # 项目简介
├── PROJECT_STRUCTURE.md        # 项目结构说明
└── OPTIMIZATION_SUMMARY.md    # 优化总结
        `;
        
        console.log(structure);
    }
}

// 主函数
async function main() {
    const optimizer = new DocsOptimizer();
    
    const args = process.argv.slice(2);
    const command = args[0];
    
    if (command === 'optimize') {
        const result = await optimizer.optimizeDocs(false);
        optimizer.generateNewDocStructure();
        
        console.log('\n📈 优化总结:');
        console.log(`  - 总文档数: ${result.totalDocs}`);
        console.log(`  - 高价值文档: ${result.highValue}`);
        console.log(`  - 中等价值文档: ${result.mediumValue}`);
        console.log(`  - 低价值文档: ${result.lowValue}`);
        console.log(`  - 重复文档: ${result.duplicates}`);
        console.log(`  - 位置不当文档: ${result.misplaced}`);
    } else {
        const result = await optimizer.optimizeDocs(true);
        optimizer.generateNewDocStructure();
        
        console.log('\n💡 运行 "node docs_optimizer.js optimize" 来执行实际优化');
    }
}

// 运行优化器
main().catch(console.error); 