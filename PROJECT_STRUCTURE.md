# 🏗️ 项目结构说明

## 📁 目录结构

```
QQmindmap2Obsidian/
├── build.js                          # 🔧 构建脚本（使用模板系统）
├── templates/                        # 📋 模板目录
│   └── userScript.template.js            # 用户脚本模板
├── core/                            # 🧠 核心模块
│   ├── parsers/                     # 解析器模块
│   │   └── qqParser.js              # QQ思维导图解析器
│   ├── converters/                  # 转换器模块
│   │   ├── qq2md.js                 # QQ转Markdown转换器
│   │   └── md2qq.js                 # Markdown转QQ转换器
│   └── utils/                       # 工具模块
│       ├── indentManager.js          # 缩进管理器
│       └── linePreserver.js         # 行格式保持器
├── ui/                              # 🎨 用户界面模块
│   └── notifications.js             # 通知系统
├── QQmindmap2Obsidian.user.js # 🎯 构建输出文件
└── PROJECT_STRUCTURE.md             # 本文档
```

## 🔧 构建系统

### 新的构建方式
- **模板驱动**：使用 `templates/userScript.template.js` 作为基础模板
- **模块化**：自动读取和注入核心模块
- **可维护**：分离模板和构建逻辑，易于调试和修改

### 构建命令
```bash
node build.js
```

### 构建流程
1. 读取模板文件 `templates/userScript.template.js`
2. 读取核心模块文件
3. 将模块代码注入到模板的 `{{MODULES}}` 占位符
4. 生成最终的 `QQmindmap2Obsidian.user.js`

## 📦 模块说明

### 核心模块 (core/)
- **qqParser.js**: QQ思维导图数据解析
- **qq2md.js**: QQ思维导图转Markdown
- **md2qq.js**: Markdown转QQ思维导图

### 工具模块 (core/utils/)
- **indentManager.js**: 缩进标准化处理
  - 统一 Markdown 和 QQ 思维导图的缩进计算
  - 支持制表符和空格缩进
  - 提供缩进验证和修正功能
- **linePreserver.js**: 行格式保持器
  - 智能分析原始文档的空行结构
  - 保持标题后的空行
  - 维护列表项之间的适当间距
  - 防止不必要的空行添加

### 界面模块 (ui/)
- **notifications.js**: 用户通知系统

## 🎯 使用方式

### 开发模式
1. 修改核心模块文件
2. 运行 `node build.js` 重新构建
3. 在 Tampermonkey 中更新脚本

### 模板修改
- 编辑 `templates/userScript.template.js` 修改脚本结构
- 使用 `{{MODULES}}` 占位符标记模块注入位置

## 🆕 新增特性

### 格式保持优化
- **LinePreserver**: 专门处理空行和格式保持
- **智能空行判断**: 基于上下文决定是否保持空行
- **配置化处理**: 可调整的空行处理规则
- **原始格式保持**: 在转换过程中保持原始文档的格式结构

### 缩进标准化
- **IndentManager**: 统一处理缩进计算和生成
- **多格式支持**: 支持制表符和空格缩进
- **一致性保证**: 确保双向转换的缩进一致性

### 空行处理规则
```javascript
// 标题后的空行应该保持
if (prevLine.match(/^(#{1,6})\s+/)) {
    return true;
}

// 列表项之间的空行应该保持（但不要太多）
if (prevLine.match(/^\s*[-*+]\s/) && nextLine.match(/^\s*[-*+]\s/)) {
    return true;
}

// 段落之间的空行应该保持
if (prevLine !== '' && nextLine !== '' && 
    !prevLine.match(/^(#{1,6})\s+/) && 
    !nextLine.match(/^(#{1,6})\s+/)) {
    return true;
}
```

## ✅ 优势

### 相比旧版本
- ✅ **可维护性**：模板与构建逻辑分离
- ✅ **可读性**：模板文件易于理解和修改
- ✅ **可扩展性**：轻松添加新模块
- ✅ **调试友好**：错误定位更准确
- ✅ **版本控制**：模板和模块独立管理
- ✅ **格式保持**：智能的空行和格式保持机制
- ✅ **缩进标准化**：统一的缩进处理系统

### 技术特点
- 🔧 **模板系统**：使用占位符替换
- 📦 **模块化**：清晰的模块边界
- 🎯 **单一职责**：每个文件职责明确
- 🔄 **自动化**：一键构建和部署
- 📝 **格式保持**：智能的行格式保持系统
- 📏 **缩进标准化**：统一的缩进处理机制

## 🚀 下一步计划

1. **添加更多模块**：根据需要扩展功能
2. **优化构建**：添加压缩和优化选项
3. **测试框架**：添加单元测试
4. **文档完善**：详细的API文档
5. **格式保持增强**：进一步优化空行处理算法
6. **缩进处理优化**：支持更多缩进格式和规则 