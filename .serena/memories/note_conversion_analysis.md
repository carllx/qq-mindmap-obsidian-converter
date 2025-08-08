# QQmindmap2Obsidian Note转换过程执行逻辑分析

## MD to QQ 转换过程中的 Note 处理

### 核心执行流程

#### 1. 注释块处理 (<!-- ... -->)
- **位置**: `core/converters/md2qq.js` convert方法中
- **处理逻辑**:
  - 检测HTML注释块开始 `<!--`
  - 收集注释内容到 `commentContent` 数组
  - 检测注释块结束 `-->`
  - 创建 Presentation 节点，将注释内容存储在 `notes.content` 中

```javascript
// 处理注释块
if (line.trim() === '<!--') {
    inCommentBlock = true;
    commentContent = [];
    continue;
}

if (inCommentBlock) {
    if (line.trim() === '-->') {
        inCommentBlock = false;
        // 创建演示文稿节点
        const presentationNode = {
            type: 5,
            data: {
                id: this.generateNodeId(),
                title: this.PRESENTATION_NODE_TITLE,
                notes: { content: commentContent.join('\n') },
                collapse: false,
                children: { attached: [] }
            }
        };
        forest.push(presentationNode);
        continue;
    } else {
        commentContent.push(line);
        continue;
    }
}
```

#### 2. 图片节点的Alt信息存储
- **位置**: `core/converters/shared/nodeManager.js` createNode方法
- **处理逻辑**:
  - 当检测到图片类型时，将alt文本存储在notes中
  - 格式: `<p>Image Alt: ${altText}</p>`

```javascript
if (lineInfo.type === 'image') {
    const altText = lineInfo.alt || 'image';
    return { 
        id: nodeId,
        title: lineInfo.url,
        images: [{ url: lineInfo.url }],
        notes: { 
            content: `<p>Image Alt: ${altText}</p>` 
        },
        collapse: false,
        children: { attached: [] } 
    };
}
```

#### 3. 代码块的Content存储
- **位置**: `core/converters/shared/codeBlockHandler.js`
- **处理逻辑**:
  - 将代码内容转换为QQ思维导图期望的HTML格式
  - 存储在节点的 `notes.content` 中
  - 处理特殊字符转义和制表符转换

```javascript
convertCodeLinesToQQHtml(codeLines, language = '') {
    // 处理代码行，正确处理空行
    // 添加语言标识到第一个段落
    // 添加结束标记
    return paragraphs.join('\n');
}
```

## QQ to MD 转换过程中的 Note 处理

### 核心执行流程

#### 1. Presentation节点识别与转换
- **位置**: `core/converters/qq2md.js` convertNodeAsHeader和convertNode方法
- **处理逻辑**:
  - 检测节点标题是否为 `PRESENTATION_NODE_TITLE`
  - 将notes内容转换为HTML注释块
  - 使用 `convertNoteHtmlToPlainText` 处理HTML内容

```javascript
// 处理演示文稿节点
if (data.title === this.PRESENTATION_NODE_TITLE && data.notes?.content) {
    return `\n\n<!--\n${this.convertNoteHtmlToPlainText(data.notes.content)}\n-->\n\n`;
}
```

#### 2. 图片Alt信息提取
- **位置**: `core/converters/qq2md.js` convertNodeAsHeader和convertNode方法
- **处理逻辑**:
  - 支持多种Alt信息格式的识别
  - 中英文格式兼容: "Image Alt:", "Alt:", "图片描述:", "描述:"
  - 降级策略: 如果没有找到特定格式，使用整个notes内容作为alt

```javascript
// 处理图片
if (data.images) {
    markdown += data.images.map(img => {
        // 从notes中提取alt信息
        let altText = 'image';
        if (data.notes?.content) {
            // 尝试多种格式匹配alt信息
            const altPatterns = [
                /<p>Image Alt:\s*(.*?)<\/p>/i,
                /<p>Alt:\s*(.*?)<\/p>/i,
                /<p>图片描述:\s*(.*?)<\/p>/i,
                /<p>描述:\s*(.*?)<\/p>/i,
                /alt:\s*(.*?)(?:\n|$)/i,
                /图片描述:\s*(.*?)(?:\n|$)/i
            ];
            
            for (const pattern of altPatterns) {
                const match = data.notes.content.match(pattern);
                if (match && match[1].trim()) {
                    altText = match[1].trim();
                    break;
                }
            }
            
            // 如果没有找到alt信息，尝试使用notes的纯文本内容作为alt
            if (altText === 'image' && data.notes.content.trim()) {
                const plainText = this.convertNoteHtmlToPlainText(data.notes.content).trim();
                if (plainText && plainText !== 'image') {
                    altText = plainText;
                }
            }
        }
        
        // 生成Markdown图片格式
        return `![${altText}](${img.url})\n`;
    }).join('');
}
```

#### 3. 代码块Content提取
- **位置**: `core/converters/shared/codeBlockHandler.js` convertCodeBlock方法
- **处理逻辑**:
  - 从notes.content中提取代码内容
  - 清理HTML标记和代码块边界标记
  - 处理制表符和特殊字符

```javascript
convertCodeBlock(node, richTextFormatter) {
    const data = node.data || node;
    
    // 获取代码内容
    let codeContent = '';
    if (data.notes?.content) {
        codeContent = this.extractCodeFromNotes(data.notes.content);
    }
    
    // 处理语言标识
    // 生成Markdown代码块格式
    return `\n\n\`\`\`${language}\n${codeContent}\n\`\`\`\n\n`;
}
```

### HTML处理工具类

#### HtmlUtils类 (`core/converters/shared/htmlUtils.js`)
- **核心功能**: 提供HTML到纯文本的转换
- **主要方法**:
  - `convertNoteHtmlToPlainText`: 统一的HTML转文本接口
  - `decodeHtmlEntities`: HTML实体解码
  - `simpleHtmlToText`: 简化的HTML标签移除

```javascript
convertNoteHtmlToPlainText(html, qqParser) {
    // 优先使用注入的 QQMindMapParser
    if (qqParser && typeof qqParser.convertNoteHtmlToPlainText === 'function') {
        return qqParser.convertNoteHtmlToPlainText(html);
    }
    
    // 降级到原始实现
    // 使用DOMParser或简化HTML解析
    return this.simpleHtmlToText(html);
}
```

## 关键设计模式

### 1. 依赖注入模式
- QQParser可以作为参数注入，提供更精确的HTML解析
- 降级策略确保在没有特定解析器时仍能工作

### 2. 策略模式
- 多种Alt信息提取策略，按优先级尝试
- 多种HTML解析策略 (DOMParser vs 简化解析)

### 3. 责任链模式
- 注释块、图片、代码块等不同类型内容的处理链

## 容错机制

### 1. HTML解析容错
- DOMParser失败时回退到简化解析
- HTML实体解码异常时使用基础实体替换

### 2. 内容提取容错
- Alt信息提取失败时使用默认值或整个notes内容
- 代码内容提取失败时返回空字符串

### 3. 格式保持
- 制表符统一转换为4个空格
- 换行符标准化处理
- 特殊字符转义处理