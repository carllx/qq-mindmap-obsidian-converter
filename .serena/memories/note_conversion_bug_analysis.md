# QQ到MD转换Note丢失问题分析

## 问题描述
在QQ思维导图转Markdown的过程中，普通节点的notes内容丢失，没有被包装在HTML注释块`<!-- ... -->`中输出。

## 问题根本原因
在`core/converters/qq2md.js`的`convertNode`方法中，只有特殊节点类型会处理notes内容：

### 现有的notes处理逻辑：
1. **Presentation节点**: 转换为HTML注释块 `<!-- ... -->`
2. **图片节点**: notes用于提取alt信息
3. **普通文本节点**: **完全忽略notes内容** ❌

### 代码位置
- 文件: `core/converters/qq2md.js`
- 方法: `convertNode(node, indent, isListItem)`
- 行号: 约232-234行和327行末尾

## 问题具体表现
```javascript
// 当前代码只处理Presentation节点的notes
if (data.title === this.PRESENTATION_NODE_TITLE && data.notes?.content) {
    return `\n\n<!--\n${this.convertNoteHtmlToPlainText(data.notes.content)}\n-->\n\n`;
}

// 普通节点的notes内容被完全忽略
// 处理文本内容...
// 处理子节点...
return markdown; // ← notes内容丢失！
```

## 修复方案
需要在`convertNode`方法中添加对普通节点notes内容的处理逻辑，将其转换为HTML注释块。

### 建议的修复位置
在`convertNode`方法的末尾（return之前）添加notes处理逻辑：

```javascript
// 处理普通节点的notes内容
if (data.notes?.content && data.title !== this.PRESENTATION_NODE_TITLE && !data.images) {
    const notesText = this.convertNoteHtmlToPlainText(data.notes.content).trim();
    if (notesText) {
        markdown += `\n\n<!--\n${notesText}\n-->\n\n`;
    }
}
```

## 影响范围
- 影响所有包含notes内容的普通文本节点
- 不影响Presentation节点（已正确处理）
- 不影响图片节点（notes用于alt信息）
- 不影响代码块节点（有专门的处理逻辑）