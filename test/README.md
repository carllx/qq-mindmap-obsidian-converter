# QQmindmap2Obsidian 测试单元说明文档

## 📋 概述

本测试单元为 QQmindmap2Obsidian 项目提供了一套完整的测试架构，专门针对 Markdown 与 QQ 思维导图之间的双向转换功能进行测试。**适配 Tampermonkey 环境，使用 CDN 依赖而非 npm 模块**。

## 🏗️ 架构设计

### 核心特点
- **数据复用**：避免重复生成大量占位符，提高测试效率
- **简化设计**：使用 `SimpleTestSuite` 替代复杂的模块系统
- **Tampermonkey适配**：模拟浏览器环境和CDN依赖
- **配置驱动**：通过配置文件统一控制测试行为
- **标准化报告**：统一的测试报告和验证标准

### 目录结构
```
test/
├── fixtures/              # 测试数据模块
│   └── testData.js       # 核心测试数据
├── utils/                # 测试工具模块
│   └── testHelpers.js    # 通用测试工具
├── suites/               # 测试套件模块（参考实现）
│   └── conversionTestSuite.js  # 转换测试套件模板
├── config/               # 配置模块
│   └── testConfig.js     # 测试配置
├── results/              # 测试结果（自动生成）
├── runTests.js           # 主运行脚本（实际使用）
└── README.md             # 本文档
```

## 🧪 测试数据模块 (fixtures/testData.js)

### 功能说明
提供代表性的测试用例，避免重复生成大量占位符。

### 数据结构
```javascript
{
    testName: {
        markdown: "测试用的Markdown内容",
        description: "测试用例描述"
    }
}
```

### 测试用例分类

#### 基础测试用例 (BASE_TEST_DATA)
- `simpleHeader`: 基础标题结构
- `multiLevelHeader`: 多级标题层级
- `parallelText`: 同级文本节点（问题1）
- `codeBlockWithSpecialChars`: 代码块特殊字符处理（问题2）
- `complexCodeBlock`: 复杂代码块（原始问题）
- `listStructure`: 列表层级结构
- `imageHandling`: 图片alt和title处理
- `divider`: 分割线处理
- `mixedContent`: 综合测试用例

#### 边界测试用例 (EDGE_CASES)
- `emptyContent`: 空行处理
- `specialCharacters`: HTML特殊字符转义
- `nestedStructure`: 深层嵌套结构
- `longText`: 长文本性能测试

#### 错误测试用例 (ERROR_CASES)
- `malformedMarkdown`: 标题层级跳跃
- `unclosedCodeBlock`: 未闭合代码块

### 使用方法
```javascript
const { BASE_TEST_DATA, EDGE_CASES, ERROR_CASES } = require('./fixtures/testData');

// 获取所有测试用例
const allCases = getAllTestCases();

// 获取特定类型的测试用例
const basicCases = getTestCasesByType('base');
```

## 🔧 测试工具模块 (utils/testHelpers.js)

### 功能说明
提供通用的测试辅助函数和验证方法。

### 核心组件

#### MockIndentManager
模拟缩进管理器，用于测试环境。

#### TestValidator
测试验证器，提供多种验证方法：

- `validateNodeStructure(node, expected)`: 验证节点结构
- `validateConversionIntegrity(original, converted)`: 验证转换完整性
- `validateBidirectionalConversion(original, mdToQQ, qqToMD)`: 验证双向转换

#### PerformanceTester
性能测试工具：

- `testPerformance(converter, testData, iterations)`: 测试转换性能

### 使用方法
```javascript
const { TestValidator, PerformanceTester, mockMarkdownIt } = require('./utils/testHelpers');

// 验证节点结构
const result = TestValidator.validateNodeStructure(node, expected);

// 性能测试
const perfResult = PerformanceTester.testPerformance(converter, testData, 100);
```

## 🧪 测试套件模块 (suites/conversionTestSuite.js)

### 功能说明
提供完整的测试套件模板，展示如何使用测试数据和工具。**注意：当前实际使用的是 `runTests.js` 中的 `SimpleTestSuite` 类**。

### 核心方法

#### runBasicTests()
运行基础功能测试，包括：
- 简单标题转换
- 同级文本处理
- 代码块特殊字符处理
- 复杂代码块处理

#### runEdgeTests()
运行边界测试，包括：
- 空内容处理
- 特殊字符转义
- 深层嵌套结构
- 长文本性能

#### runErrorTests()
运行错误处理测试，包括：
- 格式错误处理
- 未闭合代码块处理

#### runPerformanceTests()
运行性能测试，测量：
- MD→QQ 转换性能
- QQ→MD 转换性能

### 使用方法
```javascript
const ConversionTestSuite = require('./suites/conversionTestSuite');

const testSuite = new ConversionTestSuite();
const results = testSuite.runAllTests();
```

## ⚙️ 配置模块 (config/testConfig.js)

### 功能说明
统一管理测试参数和设置。

### 配置项说明

#### environment
- `verbose`: 是否启用详细日志
- `saveResults`: 是否保存测试结果到文件
- `outputDir`: 测试结果输出目录
- `performanceIterations`: 性能测试迭代次数
- `timeout`: 超时时间（毫秒）

#### testData
- `basic.enabled`: 是否启用基础测试
- `edge.enabled`: 是否启用边界测试
- `error.enabled`: 是否启用错误测试

#### validation
- `checkContentIntegrity`: 是否验证内容完整性
- `checkStructureIntegrity`: 是否验证结构完整性
- `checkBidirectionalConversion`: 是否验证双向转换
- `allowedContentDifference`: 允许的内容差异百分比

#### performance
- `benchmarks`: 性能基准设置
- `warnings`: 性能警告阈值

### 使用方法
```javascript
const testConfig = require('./config/testConfig');

// 检查是否启用详细日志
if (testConfig.environment.verbose) {
    console.log('详细日志输出');
}
```

## 🚀 主运行脚本 (runTests.js)

### 功能说明
提供完整的测试运行入口，支持命令行参数。**适配 Tampermonkey 环境，使用 CDN 依赖**。

### 核心特点
- **Tampermonkey适配**: 模拟浏览器环境和CDN依赖
- **简化设计**: 使用 `SimpleTestSuite` 替代复杂的模块系统
- **数据复用**: 通过 `testData.js` 避免重复生成占位符
- **配置驱动**: 通过 `testConfig.js` 统一管理测试行为

### 命令行选项
```bash
# 运行所有测试
node test/runTests.js

# 只运行基础测试
node test/runTests.js --basic-only

# 跳过性能测试
node test/runTests.js --no-performance

# 详细输出
node test/runTests.js --verbose

# 显示帮助信息
node test/runTests.js --help
```

### 输出结果
- 控制台实时输出测试进度
- 自动生成测试报告
- 保存详细结果到 JSON 文件
- 提供性能分析数据

## 📊 测试报告格式

### 基础报告
```json
{
  "report": {
    "passed": 8,
    "failed": 1,
    "total": 9,
    "details": [
      {
        "name": "simpleHeader",
        "type": "basic",
        "description": "基础标题结构",
        "passed": true,
        "errors": [],
        "warnings": []
      }
    ]
  }
}
```

### 性能报告
```json
{
  "performanceResults": {
    "simpleHeader": {
      "mdToQQ": {
        "totalTime": 15.2,
        "averageTime": 0.152,
        "iterations": 100,
        "throughput": 657.89
      },
      "qqToMD": {
        "totalTime": 8.5,
        "averageTime": 0.085,
        "iterations": 100,
        "throughput": 1176.47
      }
    }
  }
}
```

## 🔍 测试验证标准

### 内容完整性验证
- 标题内容必须保留
- 代码块内容必须完整
- 列表结构必须保持
- 图片信息必须保留

### 结构完整性验证
- 标题层级必须正确
- 节点关系必须准确
- 缩进结构必须保持
- 特殊标签必须正确

### 双向转换验证
- MD→QQ→MD 转换后内容应基本一致
- 关键信息不应丢失
- 结构关系应保持
- 性能应在可接受范围内

## 🛠️ 扩展指南

### 添加新的测试用例
1. 在 `fixtures/testData.js` 中添加新的测试数据
2. 在相应的测试分类中添加用例
3. 更新测试描述和预期结果

### 添加新的验证规则
1. 在 `utils/testHelpers.js` 的 `TestValidator` 中添加新方法
2. 在测试套件中调用新的验证方法
3. 更新配置文件中的验证选项

### 自定义测试配置
1. 修改 `config/testConfig.js` 中的配置项
2. 根据项目需求调整性能基准
3. 设置适合的验证规则

### 集成真实转换器
1. 修改 `runTests.js` 中的 `MockMarkdownToQQConverter` 和 `MockQQToMarkdownConverter`
2. 替换为真实的转换器逻辑
3. 更新验证规则以适应真实转换结果

## 🐛 故障排除

### 常见问题

#### 测试失败
- 检查测试数据是否正确
- 验证转换器是否正确实现
- 查看详细错误信息

#### 性能问题
- 检查性能基准设置
- 分析转换器实现效率
- 考虑优化算法

#### 配置问题
- 确认配置文件格式正确
- 检查路径设置
- 验证权限设置

### 调试技巧
1. 启用详细日志：`--verbose`
2. 查看中间结果：启用 `saveIntermediateResults`
3. 分析性能瓶颈：查看性能报告
4. 对比历史结果：查看保存的测试结果

## 📈 最佳实践

### 测试编写
1. 使用有意义的测试用例名称
2. 提供清晰的测试描述
3. 包含边界条件和错误情况
4. 保持测试数据的代表性

### 性能优化
1. 定期运行性能测试
2. 监控性能变化趋势
3. 设置合理的性能基准
4. 优化转换算法

### 维护管理
1. 定期更新测试数据
2. 及时修复失败的测试
3. 保持测试代码的可读性
4. 记录重要的测试变更

## 📞 支持与反馈

如有问题或建议，请：
1. 查看本文档的相关章节
2. 检查测试日志和错误信息
3. 参考项目的主文档
4. 提交 Issue 或 Pull Request

---

**版本**: 2.0.0  
**最后更新**: 2024年12月  
**维护者**: QQmindmap2Obsidian 开发团队  
**环境**: Tampermonkey + CDN 依赖 