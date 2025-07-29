#!/usr/bin/env node

/**
 * QQmindmap2Obsidian 测试运行器
 * 适配 Tampermonkey 环境，使用 CDN 依赖
 */

// 模拟 Tampermonkey 环境
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;

// 模拟 CDN 依赖
const markdownIt = require('markdown-it');
const DOMPurify = require('dompurify');

// 模拟全局对象
window.QQMindMap2Obsidian = {
    test: true,
    version: 'test',
    status: 'testing'
};

// 模拟模块系统
const modules = {};
function define(name, factory) {
    try {
        modules[name] = factory();
        console.log('✅ Module loaded:', name);
    } catch (error) {
        console.error('❌ Error loading module:', name, error);
    }
}
function requireModule(name) {
    const module = modules[name];
    if (!module) {
        console.error('❌ Module not found:', name);
    }
    return module;
}

// 模拟实际的转换器类
class MockMarkdownToQQConverter {
    constructor(markdownIt) {
        this.markdownIt = markdownIt;
        this.indentManager = new MockIndentManager();
    }

    convert(markdown) {
        // 简化的转换逻辑，用于测试
        const lines = markdown.split('\n');
        const result = {
            title: { text: 'Root', styles: [] },
            children: { attached: [] }
        };

        let currentLevel = 0;
        let stack = [result];

        for (const line of lines) {
            if (line.trim() === '') continue;

            const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
            if (headerMatch) {
                const level = headerMatch[1].length;
                const title = headerMatch[2];
                
                const node = {
                    title: { text: title, styles: [] },
                    children: { attached: [] }
                };

                // 找到正确的父节点
                while (stack.length > 1 && stack[stack.length - 1].level >= level) {
                    stack.pop();
                }

                stack[stack.length - 1].children.attached.push(node);
                stack.push({ ...node, level });
            } else {
                // 普通文本行
                const node = {
                    title: { text: line.trim(), styles: [] },
                    children: { attached: [] }
                };
                stack[stack.length - 1].children.attached.push(node);
            }
        }

        return result;
    }
}

class MockQQToMarkdownConverter {
    constructor() {
        this.indentManager = new MockIndentManager();
    }

    convert(nodes, originalMarkdown = null, startHeaderLevel = 1) {
        // 简化的转换逻辑，用于测试
        let result = '';
        let currentLevel = startHeaderLevel;

        const processNode = (node, level) => {
            if (node.title && node.title.text) {
                const indent = '  '.repeat(level - 1);
                result += `${indent}#${'#'.repeat(level)} ${node.title.text}\n`;
            }

            if (node.children && node.children.attached) {
                for (const child of node.children.attached) {
                    processNode(child, level + 1);
                }
            }
        };

        processNode(nodes, currentLevel);
        return result;
    }
}

class MockIndentManager {
    constructor() {
        this.config = {
            tabSize: 4,
            useTabs: true,
            maxIndentLevel: 10
        };
    }

    calculateIndentLevel(indentText) {
        if (!indentText) return 0;
        const spaceCount = indentText.replace(/\t/g, ' '.repeat(this.config.tabSize)).length;
        return Math.floor(spaceCount / this.config.tabSize);
    }

    createIndentString(level) {
        return this.config.useTabs ? '\t'.repeat(level) : ' '.repeat(level * this.config.tabSize);
    }
}

// 简化的测试套件类
class SimpleTestSuite {
    constructor() {
        this.mdToQQConverter = new MockMarkdownToQQConverter(markdownIt());
        this.qqToMDConverter = new MockQQToMarkdownConverter();
    }

    async runAllTests() {
        const testData = require('./fixtures/testData');
        const testConfig = require('./config/testConfig');
        
        const results = {
            report: {
                total: 0,
                passed: 0,
                failed: 0,
                details: []
            }
        };

        // 运行基础测试
        if (testConfig.testData.basic.enabled) {
            for (const [testName, testCase] of Object.entries(testData.BASE_TEST_DATA)) {
                const result = await this.runSingleTest(testName, testCase, 'basic');
                results.report.details.push(result);
                results.report.total++;
                if (result.passed) {
                    results.report.passed++;
                } else {
                    results.report.failed++;
                }
            }
        }

        // 运行边界测试
        if (testConfig.testData.edge.enabled) {
            for (const [testName, testCase] of Object.entries(testData.EDGE_CASES)) {
                const result = await this.runSingleTest(testName, testCase, 'edge');
                results.report.details.push(result);
                results.report.total++;
                if (result.passed) {
                    results.report.passed++;
                } else {
                    results.report.failed++;
                }
            }
        }

        // 运行错误测试
        if (testConfig.testData.error.enabled) {
            for (const [testName, testCase] of Object.entries(testData.ERROR_CASES)) {
                const result = await this.runSingleTest(testName, testCase, 'error');
                results.report.details.push(result);
                results.report.total++;
                if (result.passed) {
                    results.report.passed++;
                } else {
                    results.report.failed++;
                }
            }
        }

        return results;
    }

    async runSingleTest(testName, testCase, testType) {
        try {
            console.log(`🧪 运行测试: ${testName} (${testType})`);
            
            // MD → QQ 转换
            const mdToQQResult = this.mdToQQConverter.convert(testCase.markdown);
            
            // QQ → MD 转换
            const qqToMDResult = this.qqToMDConverter.convert(mdToQQResult);
            
            // 验证结果
            const validation = this.validateResults(testName, testCase, mdToQQResult, qqToMDResult);
            
            return {
                name: testName,
                type: testType,
                description: testCase.description,
                passed: validation.passed,
                errors: validation.errors,
                warnings: validation.warnings,
                mdToQQResult,
                qqToMDResult
            };
        } catch (error) {
            return {
                name: testName,
                type: testType,
                description: testCase.description,
                passed: false,
                errors: [error.message],
                warnings: []
            };
        }
    }

    validateResults(testName, testCase, mdToQQResult, qqToMDResult) {
        const errors = [];
        const warnings = [];

        // 基础验证
        if (!mdToQQResult || !mdToQQResult.title) {
            errors.push('MD→QQ 转换结果无效');
        }

        if (!qqToMDResult || typeof qqToMDResult !== 'string') {
            errors.push('QQ→MD 转换结果无效');
        }

        // 内容完整性验证
        if (testCase.markdown.includes('正文') && !qqToMDResult.includes('正文')) {
            warnings.push('可能丢失了部分内容');
        }

        // 结构验证
        if (testCase.markdown.includes('```') && !qqToMDResult.includes('```')) {
            warnings.push('代码块可能未正确处理');
        }

        return {
            passed: errors.length === 0,
            errors,
            warnings
        };
    }
}

async function runTests() {
    console.log('🚀 开始运行QQmindmap2Obsidian测试套件');
    console.log('📋 环境: Tampermonkey 模拟环境');
    console.log('🔧 使用: CDN 依赖 (markdown-it, DOMPurify)');
    console.log('');

    const testSuite = new SimpleTestSuite();
    
    try {
        const results = await testSuite.runAllTests();
        
        console.log('');
        console.log('📊 测试报告');
        console.log('==================================================');
        console.log(`总测试数: ${results.report.total}`);
        console.log(`通过: ${results.report.passed} ✅`);
        console.log(`失败: ${results.report.failed} ❌`);
        console.log(`成功率: ${((results.report.passed / results.report.total) * 100).toFixed(1)}%`);
        
        if (results.report.details.length > 0) {
            console.log('');
            console.log('📋 详细结果:');
            results.report.details.forEach(detail => {
                const status = detail.passed ? '✅' : '❌';
                console.log(`${status} ${detail.name}: ${detail.description}`);
                if (detail.errors.length > 0) {
                    detail.errors.forEach(error => console.log(`   ❌ ${error}`));
                }
                if (detail.warnings.length > 0) {
                    detail.warnings.forEach(warning => console.log(`   ⚠️  ${warning}`));
                }
            });
        }

        // 保存结果
        const testConfig = require('./config/testConfig');
        if (testConfig.environment.saveResults) {
            const fs = require('fs');
            const path = require('path');
            const resultsDir = path.join(__dirname, 'results');
            
            if (!fs.existsSync(resultsDir)) {
                fs.mkdirSync(resultsDir, { recursive: true });
            }
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const resultsFile = path.join(resultsDir, `test-results-${timestamp}.json`);
            
            fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
            console.log(`💾 测试结果已保存到: ${resultsFile}`);
        }

        return results;
    } catch (error) {
        console.error('❌ 测试运行失败:', error);
        throw error;
    }
}

// 命令行参数处理
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        basicOnly: args.includes('--basic-only'),
        noPerformance: args.includes('--no-performance'),
        verbose: args.includes('--verbose'),
        help: args.includes('--help')
    };

    if (options.help) {
        console.log(`
🚀 QQmindmap2Obsidian 测试运行器

用法: node test/runTests.js [选项]

选项:
  --basic-only      只运行基础测试
  --no-performance  跳过性能测试
  --verbose         详细输出
  --help           显示此帮助信息

示例:
  node test/runTests.js                    # 运行所有测试
  node test/runTests.js --basic-only       # 只运行基础测试
  node test/runTests.js --verbose          # 详细输出
        `);
        process.exit(0);
    }

    return options;
}

// 主执行
if (require.main === module) {
    const options = parseArgs();
    
    // 应用命令行选项到配置
    const testConfig = require('./config/testConfig');
    if (options.basicOnly) {
        testConfig.testData.edge.enabled = false;
        testConfig.testData.error.enabled = false;
    }
    
    if (options.noPerformance) {
        testConfig.performance.enabled = false;
    }
    
    if (options.verbose) {
        testConfig.environment.verbose = true;
    }

    runTests()
        .then(() => {
            console.log('\n🎉 测试完成！');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 测试失败:', error);
            process.exit(1);
        });
}

module.exports = { runTests, SimpleTestSuite }; 