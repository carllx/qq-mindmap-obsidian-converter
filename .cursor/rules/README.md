# Cursor Rules 规则文件说明

## 📁 规则文件结构

本项目使用 Cursor MDC (Model Definition Context) 规则文件来指导 AI 开发。规则文件按功能分类，使用三位数字命名系统。

```
.cursor/rules/
├── 001-core-philosophy.mdc      # 核心哲学 - 根本原因问题解决
├── 002-architecture-principles.mdc  # 架构原则 - 模块化设计和代码组织
├── 003-markdown-processing.mdc   # Markdown处理 - markdown-it令牌处理
├── 004-qq-mindmap-structure.mdc # QQ思维导图结构 - 数据结构和节点处理
├── 005-testing-strategy.mdc     # 测试策略 - 测试架构和验证方法
├── 006-tampermonkey-integration.mdc # Tampermonkey集成 - 用户脚本开发
├── 007-innovation-guidelines.mdc # 创新指南 - 功能添加和重构指导
└── README.md                    # 本文档
```

## 🎯 规则文件说明

### 001-core-philosophy.mdc
**适用范围**: 全局 (`**/*`)
**应用方式**: 始终应用 (`alwaysApply: true`)

核心哲学和问题解决方法，定义项目的基本原则：
- 根本原因问题解决
- 深度分析优先
- 架构驱动设计
- 数据完整性保证

### 002-architecture-principles.mdc
**适用范围**: 核心模块 (`core/**/*`, `ui/**/*`, `templates/**/*`)
**应用方式**: 自动附加 (`Auto Attached`)

架构设计原则和代码组织：
- 模块化设计原则
- 代码组织结构
- 技术栈考虑
- 设计模式应用

### 003-markdown-processing.mdc
**适用范围**: Markdown相关文件 (`core/converters/md2qq.js`, `core/parsers/mdParser.js`, `core/formatters/richText.js`)
**应用方式**: 自动附加 (`Auto Attached`)

Markdown处理相关指导：
- markdown-it令牌处理
- 转换挑战解决
- 具体代码示例
- 性能优化建议

### 004-qq-mindmap-structure.mdc
**适用范围**: QQ思维导图相关文件 (`core/converters/qq2md.js`, `core/parsers/qqParser.js`)
**应用方式**: 自动附加 (`Auto Attached`)

QQ思维导图数据结构处理：
- 节点层次结构
- 富文本处理
- 特殊内容处理
- 数据完整性验证

### 005-testing-strategy.mdc
**适用范围**: 测试相关文件 (`test/**/*`, `**/*test.js`, `**/*Test.js`)
**应用方式**: 自动附加 (`Auto Attached`)

测试策略和验证方法：
- 测试架构设计
- 测试用例设计
- 验证方法
- 性能测试

### 006-tampermonkey-integration.mdc
**适用范围**: 用户脚本相关文件 (`QQmindmap2Obsidian.user.js`, `ui/**/*`, `templates/**/*`)
**应用方式**: 自动附加 (`Auto Attached`)

Tampermonkey用户脚本开发：
- CDN依赖管理
- 浏览器环境适配
- UI组件开发
- 安全考虑

### 007-innovation-guidelines.mdc
**适用范围**: 全局 (`**/*`)
**应用方式**: 代理请求 (`Agent Requested`)

创新和重构指导：
- 功能添加指导
- 重构原则
- 设计模式应用
- 质量保证

## 🚀 使用指南

### 规则应用优先级
1. **001-core-philosophy.mdc** - 始终应用，提供基础指导
2. **特定领域规则** - 根据文件类型自动应用
3. **007-innovation-guidelines.mdc** - AI根据需求决定是否应用

### 规则组合使用
- 多个规则可以同时应用
- 规则之间相互补充，不冲突
- 具体规则优先于通用规则

### 规则更新
- 定期审查和更新规则
- 根据项目发展调整规则内容
- 保持规则与实际代码同步

## 📋 最佳实践

### 规则编写
- 保持规则简洁明确（< 500行）
- 提供具体的代码示例
- 使用 `@filename.ts` 引用相关文件
- 避免模糊的指导

### 规则维护
- 定期审查规则的有效性
- 根据反馈调整规则内容
- 保持规则与项目发展同步
- 记录重要的规则变更

### 规则测试
- 测试规则在不同场景下的效果
- 验证规则是否达到预期目标
- 收集用户反馈并改进规则

## 🔧 技术细节

### MDC 格式
所有规则文件使用 MDC 格式，包含：
- YAML 元数据头部
- Markdown 内容
- 代码示例和引用

### 规则类型
- **Always**: 始终应用
- **Auto Attached**: 根据文件模式自动附加
- **Agent Requested**: AI 根据需求决定是否应用
- **Manual**: 需要手动引用

### 文件引用
使用 `@filename.ts` 语法引用相关文件：
```markdown
参考 @core/converters/md2qq.js 中的转换逻辑
```

---

**版本**: 2.0.0  
**最后更新**: 2024年12月  
**维护者**: QQmindmap2Obsidian 开发团队 