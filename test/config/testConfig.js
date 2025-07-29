/**
 * 测试配置文件
 * 统一管理测试参数和设置
 */

module.exports = {
    // 测试环境配置
    environment: {
        // 是否启用详细日志
        verbose: true,
        
        // 是否保存测试结果到文件
        saveResults: true,
        
        // 测试结果输出目录
        outputDir: './test/results',
        
        // 性能测试迭代次数
        performanceIterations: 100,
        
        // 超时时间（毫秒）
        timeout: 5000
    },

    // 测试数据配置
    testData: {
        // 基础测试用例
        basic: {
            enabled: true,
            include: ['simpleHeader', 'parallelText', 'codeBlockWithSpecialChars', 'complexCodeBlock']
        },
        
        // 边界测试用例
        edge: {
            enabled: true,
            include: ['emptyContent', 'specialCharacters', 'nestedStructure']
        },
        
        // 错误测试用例
        error: {
            enabled: true,
            include: ['malformedMarkdown', 'unclosedCodeBlock']
        }
    },

    // 验证规则配置
    validation: {
        // 是否验证内容完整性
        checkContentIntegrity: true,
        
        // 是否验证结构完整性
        checkStructureIntegrity: true,
        
        // 是否验证双向转换
        checkBidirectionalConversion: true,
        
        // 允许的内容差异百分比
        allowedContentDifference: 0.1,
        
        // 关键内容必须保留
        requiredContent: ['title', 'code', 'list']
    },

    // 性能测试配置
    performance: {
        // 性能基准（毫秒）
        benchmarks: {
            mdToQQ: {
                simple: 10,
                complex: 50,
                large: 200
            },
            qqToMD: {
                simple: 5,
                complex: 30,
                large: 150
            }
        },
        
        // 性能警告阈值
        warnings: {
            mdToQQ: 100,
            qqToMD: 80
        }
    },

    // 报告配置
    reporting: {
        // 报告格式
        format: 'console', // 'console', 'json', 'html'
        
        // 是否包含性能数据
        includePerformance: true,
        
        // 是否包含详细错误信息
        includeDetails: true,
        
        // 是否生成可视化报告
        generateVisualReport: false
    },

    // 调试配置
    debug: {
        // 是否启用调试模式
        enabled: false,
        
        // 调试级别
        level: 'info', // 'error', 'warn', 'info', 'debug'
        
        // 是否保存中间结果
        saveIntermediateResults: false,
        
        // 调试输出目录
        debugOutputDir: './test/debug'
    }
}; 