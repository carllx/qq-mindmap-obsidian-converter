# Core目录重构任务清单

## 📋 项目概述

### 目标
将core目录中的长脚本按功能领域解构，提取重叠功能，提高代码可维护性，同时保持向后兼容。

### 重构方案
**方案1：按功能领域解构**
- 提取重叠的代码块处理功能
- 提取重叠的节点管理功能  
- 提取重叠的依赖管理功能
- 保持主转换器接口不变

## 🎯 任务清单

### 阶段1：准备工作

#### 任务1.1：创建共享目录结构
- [ ] 创建 `core/converters/shared/` 目录
- [ ] 创建 `core/formatters/shared/` 目录
- [ ] 更新 `.gitignore` 确保新目录被跟踪

#### 任务1.2：备份当前代码
- [ ] 创建 `backup/` 目录
- [ ] 备份所有core目录下的文件
- [ ] 记录当前构建状态和测试结果

#### 任务1.3：建立测试基准
- [ ] 运行现有测试，记录基准结果
- [ ] 创建功能测试用例
- [ ] 建立性能基准测试

### 阶段2：提取代码块处理功能

#### 任务2.1：分析代码块处理重叠
- [ ] 分析 `md2qq.js` 中的代码块处理方法
- [ ] 分析 `qq2md.js` 中的代码块处理方法
- [ ] 识别重叠的代码块处理逻辑

#### 任务2.2：创建 CodeBlockHandler 类
```javascript
// core/converters/shared/codeBlockHandler.js
class CodeBlockHandler {
    constructor(richTextFormatter, he) {
        this.richTextFormatter = richTextFormatter;
        this.he = he;
    }
    
    // 从 md2qq.js 提取的方法
    createCodeBlockNode(codeLines, language) { /* 实现 */ }
    convertCodeLinesToQQHtml(codeLines, language) { /* 实现 */ }
    processCodeLine(line) { /* 实现 */ }
    
    // 从 qq2md.js 提取的方法
    convertCodeBlock(node) { /* 实现 */ }
    extractCodeFromNotes(htmlContent) { /* 实现 */ }
    cleanCodeBlockMarkers(codeContent) { /* 实现 */ }
}
```

#### 任务2.3：更新主转换器使用 CodeBlockHandler
- [ ] 修改 `md2qq.js` 使用 CodeBlockHandler
- [ ] 修改 `qq2md.js` 使用 CodeBlockHandler
- [ ] 确保依赖注入正确传递

#### 任务2.4：测试代码块处理功能
- [ ] 创建 CodeBlockHandler 单元测试
- [ ] 测试代码块双向转换
- [ ] 验证HTML实体编码/解码
- [ ] 测试不同编程语言的处理

### 阶段3：提取节点管理功能

#### 任务3.1：分析节点管理重叠
- [ ] 分析 `md2qq.js` 中的节点管理方法
- [ ] 识别节点创建、查找、附加等逻辑
- [ ] 确定节点ID生成策略

#### 任务3.2：创建 NodeManager 类
```javascript
// core/converters/shared/nodeManager.js
class NodeManager {
    generateNodeId() { /* 实现 */ }
    createNode(lineInfo) { /* 实现 */ }
    findParentNode(stack, lineInfo) { /* 实现 */ }
    attachNode(newNode, parentNode, forest) { /* 实现 */ }
    validateNode(node) { /* 实现 */ }
}
```

#### 任务3.3：更新主转换器使用 NodeManager
- [ ] 修改 `md2qq.js` 使用 NodeManager
- [ ] 确保节点层级关系正确处理
- [ ] 验证节点ID唯一性

#### 任务3.4：测试节点管理功能
- [ ] 创建 NodeManager 单元测试
- [ ] 测试节点创建和层级关系
- [ ] 测试节点ID生成唯一性
- [ ] 测试复杂嵌套结构

### 阶段4：提取依赖管理功能

#### 任务4.1：分析依赖管理重叠
- [ ] 分析两个转换器的依赖初始化逻辑
- [ ] 识别环境检测和模块加载逻辑
- [ ] 确定错误处理和重试机制

#### 任务4.2：创建 DependencyManager 类
```javascript
// core/converters/shared/dependencyManager.js
class DependencyManager {
    constructor() {
        this._initialized = false;
        this._dependencies = {};
    }
    
    initDependencies() { /* 实现 */ }
    ensureInitialized() { /* 实现 */ }
    getDependency(name) { /* 实现 */ }
    validateDependencies() { /* 实现 */ }
}
```

#### 任务4.3：更新主转换器使用 DependencyManager
- [ ] 修改 `md2qq.js` 使用 DependencyManager
- [ ] 修改 `qq2md.js` 使用 DependencyManager
- [ ] 确保依赖注入正确工作

#### 任务4.4：测试依赖管理功能
- [ ] 创建 DependencyManager 单元测试
- [ ] 测试浏览器环境依赖加载
- [ ] 测试Node.js环境依赖加载
- [ ] 测试依赖初始化失败处理

### 阶段5：优化富文本处理

#### 任务5.1：分析富文本处理复杂度
- [ ] 分析 `richText.js` 中的复杂方法
- [ ] 识别可以独立的功能模块
- [ ] 确定样式处理逻辑

#### 任务5.2：创建 StyleProcessor 类
```javascript
// core/formatters/shared/styleProcessor.js
class StyleProcessor {
    constructor() {
        this.styleMappings = { /* 样式映射 */ };
    }
    
    processTokenStyles(tokens) { /* 实现 */ }
    mergeStyles(styleStack) { /* 实现 */ }
    validateStyles(styles) { /* 实现 */ }
}
```

#### 任务5.3：更新 RichTextFormatter 使用 StyleProcessor
- [ ] 修改 `richText.js` 使用 StyleProcessor
- [ ] 简化主格式化器逻辑
- [ ] 保持现有接口不变

#### 任务5.4：测试富文本处理功能
- [ ] 创建 StyleProcessor 单元测试
- [ ] 测试样式映射和合并
- [ ] 测试复杂富文本转换
- [ ] 验证样式验证逻辑

### 阶段6：集成测试和验证

#### 任务6.1：更新构建脚本
- [ ] 修改 `build.js` 包含新的共享模块
- [ ] 更新模块加载顺序，确保依赖关系正确
- [ ] 添加共享模块到模块列表
- [ ] 更新全局对象创建逻辑
- [ ] 确保所有模块正确注入
- [ ] 测试模块加载顺序和依赖关系

#### 任务6.2：更新模板文件
- [ ] 修改 `templates/userScript.template.js`
- [ ] 更新依赖注入逻辑，包含新的共享模块
- [ ] 确保转换器正确接收共享模块依赖
- [ ] 更新组件初始化顺序
- [ ] 确保全局对象正确创建
- [ ] 测试依赖注入和组件初始化

#### 任务6.3：全面集成测试
- [ ] 测试完整的双向转换流程
- [ ] 测试各种复杂场景
- [ ] 验证性能没有退化
- [ ] 测试错误处理机制

## 🛡️ 防止依赖和引用失效的建议

### 1. 渐进式重构策略

#### 1.1 保持接口不变
```javascript
// 原有接口保持不变
class MarkdownToQQConverter {
    constructor(markdownIt, he) {
        // 内部使用新的共享模块，但接口不变
        this.dependencyManager = new DependencyManager();
        this.codeBlockHandler = new CodeBlockHandler(this.richTextFormatter, he);
        this.nodeManager = new NodeManager();
    }
    
    // 公共方法保持不变
    convert(markdown) { /* 实现 */ }
}
```

#### 1.2 使用依赖注入模式
```javascript
// 通过构造函数注入依赖，避免硬编码
class CodeBlockHandler {
    constructor(richTextFormatter, he) {
        this.richTextFormatter = richTextFormatter;
        this.he = he;
    }
}
```

#### 1.3 保留降级实现
```javascript
// 如果共享模块不可用，使用原始实现
createCodeBlockNode(codeLines, language) {
    if (this.codeBlockHandler) {
        return this.codeBlockHandler.createCodeBlockNode(codeLines, language);
    }
    // 降级到原始实现
    return this._originalCreateCodeBlockNode(codeLines, language);
}
```

### 2. 模块加载策略

#### 2.1 动态模块检测
```javascript
// 检测模块是否可用
function getModule(name) {
    if (typeof window !== 'undefined' && window[name]) {
        return window[name];
    }
    if (typeof require !== 'undefined') {
        try {
            return require(`./shared/${name}.js`);
        } catch (e) {
            console.warn(`Module ${name} not available, using fallback`);
            return null;
        }
    }
    return null;
}
```

#### 2.2 构建脚本模块顺序更新
```javascript
// build.js 更新后的模块顺序
const modules = [
    { name: 'IndentManager', file: 'core/utils/indentManager.js' },
    { name: 'LinePreserver', file: 'core/utils/linePreserver.js' },
    { name: 'QQMindMapParser', file: 'core/parsers/qqParser.js' },
    { name: 'RichTextFormatter', file: 'core/formatters/richText.js' },
    { name: 'CodeBlockHandler', file: 'core/converters/shared/codeBlockHandler.js' },
    { name: 'NodeManager', file: 'core/converters/shared/nodeManager.js' },
    { name: 'DependencyManager', file: 'core/converters/shared/dependencyManager.js' },
    { name: 'QQToMarkdownConverter', file: 'core/converters/qq2md.js' },
    { name: 'MarkdownToQQConverter', file: 'core/converters/md2qq.js' },
    { name: 'NotificationSystem', file: 'ui/notifications.js' },
    { name: 'InterfaceManager', file: 'ui/interface.js' }
];
```

#### 2.3 模板文件依赖注入更新
```javascript
// templates/userScript.template.js 更新
initializeComponents() {
    try {
        // 获取模块
        const modules = this.getModules();
        
        // 创建共享模块实例
        this.indentManager = new modules.IndentManager();
        this.linePreserver = new modules.LinePreserver(this.indentManager);
        this.qqParser = new modules.QQMindMapParser();
        this.richTextFormatter = new modules.RichTextFormatter(this.qqParser);
        
        // 创建共享处理器
        this.codeBlockHandler = new modules.CodeBlockHandler(this.richTextFormatter, he);
        this.nodeManager = new modules.NodeManager();
        this.dependencyManager = new modules.DependencyManager();
        
        // 创建转换器，传递共享模块
        this.qqToMdConverter = new modules.QQToMarkdownConverter(
            this.qqParser, 
            DOMPurify,
            this.codeBlockHandler,
            this.nodeManager,
            this.dependencyManager
        );
        
        this.mdToQqConverter = new modules.MarkdownToQQConverter(
            this.md, 
            he,
            this.codeBlockHandler,
            this.nodeManager,
            this.dependencyManager
        );
        
        this.interfaceManager = new modules.InterfaceManager(this);
    } catch (error) {
        console.error('❌ Error initializing components:', error);
    }
}
```

#### 2.4 错误处理和重试
```javascript
// 依赖初始化失败时的重试机制
_initDependencies() {
    try {
        this._loadDependencies();
        this._initialized = true;
    } catch (error) {
        console.warn('Dependency initialization failed, will retry:', error);
        this._initialized = false;
        // 在下次使用时重试
    }
}
```

### 3. 测试策略

#### 3.1 单元测试覆盖
```javascript
// 为每个共享模块创建单元测试
describe('CodeBlockHandler', () => {
    test('should create code block node correctly', () => {
        const handler = new CodeBlockHandler(mockRichTextFormatter, mockHe);
        const result = handler.createCodeBlockNode(['console.log("test")'], 'javascript');
        expect(result.labels).toContainEqual({ text: 'code-block' });
    });
});
```

#### 3.2 集成测试
```javascript
// 测试完整的转换流程
describe('Integration Tests', () => {
    test('should convert markdown to QQ and back without data loss', () => {
        const originalMarkdown = '# Test\n```javascript\nconsole.log("test");\n```';
        const qqData = md2qqConverter.convert(originalMarkdown);
        const convertedMarkdown = qq2mdConverter.convert(qqData);
        expect(convertedMarkdown).toContain('console.log("test")');
    });
});
```

#### 3.3 性能测试
```javascript
// 确保重构后性能没有退化
describe('Performance Tests', () => {
    test('should maintain conversion performance', () => {
        const startTime = performance.now();
        // 执行转换
        const endTime = performance.now();
        expect(endTime - startTime).toBeLessThan(1000); // 1秒内完成
    });
});
```

## 📊 测试计划

### 阶段1：基础功能测试
- [ ] 测试代码块双向转换
- [ ] 测试节点创建和管理
- [ ] 测试依赖初始化
- [ ] 测试富文本格式转换

### 阶段2：边界条件测试
- [ ] 测试空代码块处理
- [ ] 测试特殊字符编码
- [ ] 测试深层嵌套结构
- [ ] 测试大文件处理

### 阶段3：错误处理测试
- [ ] 测试依赖加载失败
- [ ] 测试无效输入处理
- [ ] 测试网络错误恢复
- [ ] 测试内存泄漏检测

### 阶段4：性能回归测试
- [ ] 测试转换速度
- [ ] 测试内存使用
- [ ] 测试CPU使用率
- [ ] 测试并发处理

## 📈 成功指标

### 代码质量指标
- [ ] 代码重复率降低 > 30%
- [ ] 平均文件行数 < 200行
- [ ] 单元测试覆盖率 > 80%
- [ ] 集成测试通过率 100%

### 性能指标
- [ ] 转换速度无退化
- [ ] 内存使用无增加
- [ ] 构建时间无增加
- [ ] 文件大小无显著增加

### 兼容性指标
- [ ] 现有API 100%兼容
- [ ] 浏览器兼容性无变化
- [ ] Node.js兼容性无变化
- [ ] 第三方库兼容性无变化

## 🚀 实施时间表

### 第1周：准备工作
- 完成阶段1的所有任务
- 建立测试基准
- 创建共享目录结构

### 第2周：代码块处理重构
- 完成阶段2的所有任务
- 提取代码块处理功能
- 完成相关测试

### 第3周：节点管理重构
- 完成阶段3的所有任务
- 提取节点管理功能
- 完成相关测试

### 第4周：依赖管理重构
- 完成阶段4的所有任务
- 提取依赖管理功能
- 完成相关测试

### 第5周：富文本处理优化
- 完成阶段5的所有任务
- 优化富文本处理
- 完成相关测试

### 第6周：集成测试和发布
- 完成阶段6的所有任务
- 全面集成测试
- 性能优化和发布

## 📝 风险控制

### 高风险项
1. **依赖注入失败** - 可能导致功能完全失效
   - 缓解措施：保留原始实现作为降级方案
   - 监控措施：添加详细的错误日志

2. **性能退化** - 可能影响用户体验
   - 缓解措施：在每个阶段进行性能测试
   - 监控措施：建立性能基准和监控

3. **兼容性破坏** - 可能影响现有用户
   - 缓解措施：保持所有公共接口不变
   - 监控措施：全面的回归测试

### 中风险项
1. **代码复杂度增加** - 可能影响维护性
   - 缓解措施：添加详细的文档和注释
   - 监控措施：代码复杂度分析

2. **测试覆盖率下降** - 可能影响质量
   - 缓解措施：为每个新模块编写测试
   - 监控措施：持续监控测试覆盖率

## 📋 检查清单

### 重构前检查
- [ ] 所有现有测试通过
- [ ] 性能基准已建立
- [ ] 备份已完成
- [ ] 团队已通知

### 重构中检查
- [ ] 每个阶段完成后运行测试
- [ ] 性能无退化
- [ ] 代码质量指标达标
- [ ] 文档已更新

### 重构后检查
- [ ] 所有测试通过
- [ ] 性能基准达标
- [ ] 文档完整
- [ ] 团队培训完成

---

**注意**: 本任务清单应根据实际实施情况进行调整和更新。每个阶段完成后应进行回顾和总结，确保重构目标的达成。 