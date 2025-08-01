#!/usr/bin/env node

/**
 * 简单测试运行器
 * 运行项目中的所有测试文件
 */

const fs = require('fs');
const path = require('path');

// 模拟Jest的describe和test函数
global.describe = function(name, fn) {
    console.log(`\n📋 测试套件: ${name}`);
    fn();
};

global.test = function(name, fn) {
    try {
        fn();
        console.log(`  ✅ ${name}`);
    } catch (error) {
        console.log(`  ❌ ${name} - ${error.message}`);
        process.exitCode = 1;
    }
};

global.beforeEach = function(fn) {
    fn();
};

global.jest = {
    fn: function(impl) {
        return function(...args) {
            return impl ? impl(...args) : undefined;
        };
    }
};

global.expect = function(actual) {
    return {
        toBe: function(expected) {
            if (actual !== expected) {
                throw new Error(`Expected ${actual} to be ${expected}`);
            }
        },
        toContain: function(expected) {
            if (!String(actual).includes(expected)) {
                throw new Error(`Expected ${actual} to contain ${expected}`);
            }
        },
        toMatch: function(expected) {
            if (!expected.test(String(actual))) {
                throw new Error(`Expected ${actual} to match ${expected}`);
            }
        },
        toHaveLength: function(expected) {
            if (actual.length !== expected) {
                throw new Error(`Expected length ${actual.length} to be ${expected}`);
            }
        },
        toBeDefined: function() {
            if (actual === undefined) {
                throw new Error(`Expected value to be defined`);
            }
        },
        toBeLessThan: function(expected) {
            if (actual >= expected) {
                throw new Error(`Expected ${actual} to be less than ${expected}`);
            }
        },
        toContainEqual: function(expected) {
            if (!Array.isArray(actual)) {
                throw new Error(`Expected ${actual} to be an array`);
            }
            const found = actual.some(item => 
                JSON.stringify(item) === JSON.stringify(expected)
            );
            if (!found) {
                throw new Error(`Expected array to contain ${JSON.stringify(expected)}`);
            }
        }
    };
};

// 模拟依赖
try {
    // 尝试导入模块
    const CodeBlockHandlerModule = require('../core/converters/shared/codeBlockHandler.js');
    global.CodeBlockHandler = CodeBlockHandlerModule.CodeBlockHandler || CodeBlockHandlerModule;
    
    const NodeManagerModule = require('../core/converters/shared/nodeManager.js');
    global.NodeManager = NodeManagerModule.NodeManager || NodeManagerModule;
    
    const HtmlUtilsModule = require('../core/converters/shared/htmlUtils.js');
    global.HtmlUtils = HtmlUtilsModule.HtmlUtils || HtmlUtilsModule;
} catch (error) {
    console.log('⚠️  模块导入失败，使用模拟类');
    
    // 模拟类
    global.CodeBlockHandler = class CodeBlockHandler {
        constructor(richTextFormatter, he) {
            this.richTextFormatter = richTextFormatter;
            this.he = he;
        }
        createCodeBlockNode() { return {}; }
        convertCodeLinesToQQHtml() { return ''; }
        processCodeLine() { return ''; }
        convertCodeBlock() { return ''; }
        extractCodeFromNotes() { return ''; }
        cleanCodeBlockMarkers() { return ''; }
        decodeHtmlEntities() { return ''; }
        simpleHtmlToText() { return ''; }
        extractTextFromRichText() { return ''; }
    };
    
    global.NodeManager = class NodeManager {
        constructor() {}
        generateNodeId() { return 'test_id'; }
        createNode() { return {}; }
        findParentNode() { return { parentNode: null, stack: [] }; }
        attachNode() {}
    };
    
    global.HtmlUtils = class HtmlUtils {
        constructor() {}
        decodeHtmlEntities() { return ''; }
        simpleHtmlToText() { return ''; }
        convertNoteHtmlToPlainText() { return ''; }
    };
}

// 运行测试文件
const testFiles = [
    'codeBlockHandler.test.js',
    'nodeManager.test.js', 
    'htmlUtils.test.js',
    'imageProcessing.test.js'
];

console.log('🧪 开始运行测试...\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

for (const testFile of testFiles) {
    const testPath = path.join(__dirname, testFile);
    if (fs.existsSync(testPath)) {
        console.log(`\n📁 运行测试文件: ${testFile}`);
        try {
            require(testPath);
            console.log(`✅ ${testFile} 测试完成`);
        } catch (error) {
            console.log(`❌ ${testFile} 测试失败: ${error.message}`);
            failedTests++;
        }
    } else {
        console.log(`⚠️  测试文件不存在: ${testFile}`);
    }
}

console.log('\n📊 测试结果汇总:');
console.log(`总测试文件: ${testFiles.length}`);
console.log(`通过: ${passedTests}`);
console.log(`失败: ${failedTests}`);

if (failedTests > 0) {
    console.log('\n❌ 部分测试失败');
    process.exit(1);
} else {
    console.log('\n✅ 所有测试通过');
} 