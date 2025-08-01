# Cursor Rules 规则文件说明

## 📁 规则文件结构

本项目使用 Cursor MDC (Model Definition Context) 规则文件来指导 AI 开发。规则文件按功能分类，使用三位数字命名系统。

```
.cursor/rules/
├── 001-core-philosophy.mdc      # 核心哲学 - 根本原因问题解决和架构原则
├── 002-technical-implementation.mdc # 技术实现 - Markdown处理和QQ思维导图结构
├── 003-environment-integration.mdc  # 环境集成 - Tampermonkey集成和测试策略
└── README.md                    # 本文档
```

## 🎯 规则文件说明

### 001-core-philosophy.mdc
**适用范围**: 全局 (`**/*`)
**应用方式**: 始终应用 (`alwaysApply: true`)

核心哲学和根本指导原则，整合了：
- 根本原因问题解决方法
- 架构设计原则和代码组织
- 测试策略和验证方法
- 创新和重构指导
- 避免打补丁式编程

### 002-technical-implementation.mdc
**适用范围**: 核心模块 (`core/**/*`, `ui/**/*`, `templates/**/*`)
**应用方式**: 自动附加 (`Auto Attached`)

技术实现指导，涵盖：
- Markdown-it 令牌处理
- QQ 思维导图数据结构
- 转换算法和模式
- 特殊内容处理
- 性能优化策略

### 003-environment-integration.mdc
**适用范围**: 用户脚本相关文件 (`QQmindmap2Obsidian.user.js`, `ui/**/*`, `templates/**/*`, `test/**/*`)
**应用方式**: 自动附加 (`Auto Attached`)

环境集成指导，涵盖：
- Tampermonkey 用户脚本开发
- 浏览器环境适配
- UI 组件开发
- 测试策略和验证方法
- 安全考虑和性能优化

## 🚀 使用指南

### 规则应用优先级
1. **001-core-philosophy.mdc** - 始终应用，提供基础指导
2. **002-technical-implementation.mdc** - 技术实现相关文件自动应用
3. **003-environment-integration.mdc** - 环境集成相关文件自动应用

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

## 📊 优化总结

### 优化前
- 8个规则文件
- 内容重复和冗余
- 过于详细的代码示例
- 维护成本高

### 优化后
- 3个核心规则文件
- 内容整合和精简
- 保留关键概念和示例
- 降低维护成本

### 优化效果
- **数量减少**: 从8个文件减少到3个文件（减少62.5%）
- **内容精简**: 去除重复内容，保留核心概念
- **结构清晰**: 按功能分类，逻辑更清晰
- **维护简化**: 减少文件数量，降低维护成本

---

**版本**: 3.0.0  
**最后更新**: 2024年12月  
**维护者**: QQmindmap2Obsidian 开发团队 