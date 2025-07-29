/**
 * 转换测试套件模板
 * 展示如何使用测试数据和工具进行高效测试
 */

const { BASE_TEST_DATA, EDGE_CASES, ERROR_CASES } = require('../fixtures/testData');
const { TestValidator, PerformanceTester, mockMarkdownIt } = require('../utils/testHelpers');

// 模拟转换器（实际使用时替换为真实的转换器）
class MockMDToQQConverter {
    constructor() {
        this.md = mockMarkdownIt;
    }
    
    convert(markdown) {
        // 简化的转换逻辑，实际使用时替换为真实实现
        const lines = markdown.split('\n');
        const result = [];
        
        for (const line of lines) {
            if (line.startsWith('#')) {
                result.push({
                    title: line.replace(/^#+\s+/, ''),
                    labels: [{ text: 'header' }],
                    children: { attached: [] }
                });
            } else if (line.trim() && !line.startsWith('```')) {
                result.push({
                    title: line.trim(),
                    children: { attached: [] }
                });
            }
        }
        
        return [{ type: 5, data: result[0] || { title: 'Empty', children: { attached: [] } } }];
    }
}

class MockQQToMDConverter {
    convert(nodes) {
        // 简化的转换逻辑，实际使用时替换为真实实现
        let result = '';
        for (const node of nodes) {
            const data = node.data || node;
            if (data.labels?.some(l => l.text === 'header')) {
                result += `# ${data.title}\n\n`;
            } else if (data.title) {
                result += `${data.title}\n\n`;
            }
        }
        return result;
    }
}

// 测试套件类
class ConversionTestSuite {
    constructor() {
        this.mdToQQConverter = new MockMDToQQConverter();
        this.qqToMDConverter = new MockQQToMDConverter();
        this.results = {
            passed: 0,
            failed: 0,
            total: 0,
            details: []
        };
    }

    /**
     * 运行基础功能测试
     */
    runBasicTests() {
        console.log('🧪 运行基础功能测试...\n');
        
        for (const [testName, testCase] of Object.entries(BASE_TEST_DATA)) {
            this.runSingleTest(testName, testCase, 'basic');
        }
    }

    /**
     * 运行边界测试
     */
    runEdgeTests() {
        console.log('🧪 运行边界测试...\n');
        
        for (const [testName, testCase] of Object.entries(EDGE_CASES)) {
            this.runSingleTest(testName, testCase, 'edge');
        }
    }

    /**
     * 运行错误处理测试
     */
    runErrorTests() {
        console.log('🧪 运行错误处理测试...\n');
        
        for (const [testName, testCase] of Object.entries(ERROR_CASES)) {
            this.runSingleTest(testName, testCase, 'error');
        }
    }

    /**
     * 运行单个测试
     */
    runSingleTest(testName, testCase, testType) {
        console.log(`📋 测试: ${testName}`);
        console.log(`📝 描述: ${testCase.description}`);
        
        try {
            // MD -> QQ 转换
            const qqNodes = this.mdToQQConverter.convert(testCase.markdown);
            
            // QQ -> MD 转换
            const convertedMD = this.qqToMDConverter.convert(qqNodes);
            
            // 验证双向转换
            const validationResult = TestValidator.validateBidirectionalConversion(
                testCase.markdown,
                (md) => this.mdToQQConverter.convert(md),
                (qq) => this.qqToMDConverter.convert(qq)
            );
            
            // 记录结果
            const testResult = {
                name: testName,
                type: testType,
                description: testCase.description,
                passed: validationResult.isValid,
                errors: validationResult.errors,
                warnings: validationResult.warnings,
                originalLength: testCase.markdown.length,
                convertedLength: convertedMD.length
            };
            
            this.results.details.push(testResult);
            this.results.total++;
            
            if (testResult.passed) {
                this.results.passed++;
                console.log('✅ 通过');
            } else {
                this.results.failed++;
                console.log('❌ 失败');
                if (testResult.errors.length > 0) {
                    console.log('  错误:', testResult.errors.join(', '));
                }
            }
            
        } catch (error) {
            this.results.failed++;
            this.results.total++;
            console.log('❌ 异常:', error.message);
            
            this.results.details.push({
                name: testName,
                type: testType,
                description: testCase.description,
                passed: false,
                errors: [error.message],
                warnings: []
            });
        }
        
        console.log('');
    }

    /**
     * 运行性能测试
     */
    runPerformanceTests() {
        console.log('⚡ 运行性能测试...\n');
        
        const performanceResults = {};
        
        for (const [testName, testCase] of Object.entries(BASE_TEST_DATA)) {
            console.log(`📊 测试性能: ${testName}`);
            
            const mdToQQPerformance = PerformanceTester.testPerformance(
                (md) => this.mdToQQConverter.convert(md),
                testCase.markdown,
                100
            );
            
            const qqToMDPerformance = PerformanceTester.testPerformance(
                (qq) => this.qqToMDConverter.convert(qq),
                this.mdToQQConverter.convert(testCase.markdown),
                100
            );
            
            performanceResults[testName] = {
                mdToQQ: mdToQQPerformance,
                qqToMD: qqToMDPerformance
            };
            
            console.log(`   MD->QQ: ${mdToQQPerformance.averageTime.toFixed(2)}ms/次`);
            console.log(`   QQ->MD: ${qqToMDPerformance.averageTime.toFixed(2)}ms/次`);
        }
        
        return performanceResults;
    }

    /**
     * 生成测试报告
     */
    generateReport() {
        console.log('\n📊 测试报告');
        console.log('='.repeat(50));
        console.log(`总测试数: ${this.results.total}`);
        console.log(`通过: ${this.results.passed} ✅`);
        console.log(`失败: ${this.results.failed} ❌`);
        console.log(`成功率: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);
        
        if (this.results.failed > 0) {
            console.log('\n❌ 失败的测试:');
            this.results.details
                .filter(result => !result.passed)
                .forEach(result => {
                    console.log(`  - ${result.name}: ${result.errors.join(', ')}`);
                });
        }
        
        return this.results;
    }

    /**
     * 运行完整测试套件
     */
    runAllTests() {
        console.log('🚀 开始运行完整测试套件\n');
        
        this.runBasicTests();
        this.runEdgeTests();
        this.runErrorTests();
        
        const performanceResults = this.runPerformanceTests();
        
        const report = this.generateReport();
        
        return {
            report,
            performanceResults
        };
    }
}

// 使用示例
if (require.main === module) {
    const testSuite = new ConversionTestSuite();
    const results = testSuite.runAllTests();
    
    console.log('\n🎯 测试完成！');
}

module.exports = ConversionTestSuite; 