# 代码块处理开发指南

## 📋 概述

本文档详细说明了 QQmindmap2Obsidian 项目中代码块处理的设计原理、实现方法和最佳实践。代码块处理是双向转换系统的核心功能之一，涉及 Markdown 与 QQ 思维导图之间的复杂格式转换。

## 🏗️ 架构设计

### 核心组件

```
代码块处理架构
├── MarkdownToQQConverter (MD → QQ)
│   ├── 代码块识别与解析
│   ├── 语言标识提取
│   ├── HTML格式转换
│   └── Unicode字符处理
├── QQToMarkdownConverter (QQ → MD)
│   ├── 代码块节点识别
│   ├── HTML内容解析
│   ├── 语言标识恢复
│   └── Markdown格式重建
└── 测试验证系统
    ├── 单元测试
    ├── 集成测试
    └── 格式验证
```

### 数据流

```
Markdown代码块 → 解析识别 → HTML转换 → QQ思维导图节点
                ↓
QQ思维导图节点 → 节点识别 → HTML解析 → Markdown代码块
```

## 🔧 实现细节

### 1. Markdown → QQ 转换 (md2qq.js)

#### 代码块识别
```javascript
// 检查代码块开始标记
const codeBlockMatch = line.match(/^```(\w+)?$/);
if (codeBlockMatch) {
    inCodeBlock = true;
    codeBlockLanguage = codeBlockMatch[1] || '';
    continue;
}

// 检查代码块结束标记
if (line.trim() === '```') {
    inCodeBlock = false;
    // 处理代码块内容...
}
```

#### 代码块节点创建
```javascript
createCodeBlockNode(codeLines, language) {
    const title = language ? `\`\`\`${language}` : '```';
    const htmlContent = this.convertCodeLinesToQQHtml(codeLines, language);
    
    return {
        id: this.generateNodeId(),
        title: this.richTextFormatter.format(title),
        labels: [this.CODE_BLOCK_LABEL],
        notes: { content: htmlContent },
        collapse: false,
        children: { attached: [] }
    };
}
```

#### HTML格式转换
```javascript
convertCodeLinesToQQHtml(codeLines, language = '') {
    const paragraphs = [];
    let currentParagraphLines = [];

    // 处理代码行，正确处理空行
    for (let i = 0; i < codeLines.length; i++) {
        const line = codeLines[i];
        
        if (line.trim() === '') {
            // 空行：结束当前段落，添加空段落
            flushParagraph();
            paragraphs.push('<p><br></p>');
        } else {
            // 非空行：添加到当前段落
            currentParagraphLines.push(line);
        }
    }
    
    // 添加语言标识到第一个段落
    if (paragraphs.length > 0) {
        const languagePrefix = language ? `\`\`\`${language}<br>` : '```<br>';
        paragraphs[0] = paragraphs[0].replace('<p>', `<p>${languagePrefix}`);
    }
    
    // 添加结束标记
    paragraphs.push('<p>```</p>');
    
    return paragraphs.join('\n');
}
```

#### Unicode字符处理
```javascript
processCodeLine(line) {
    // 使用he库进行HTML实体编码
    const escapedLine = this.he.encode(line, {
        'useNamedReferences': false,
        'allowUnsafeSymbols': false,
        'decimal': false
    });

    // 将HTML实体转换为Unicode转义格式
    let result = escapedLine.replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => {
        return `\\u{${hex.toUpperCase()}}`;
    });
    
    // 修复：将双反斜杠转换为单反斜杠
    result = result.replace(/\\\\u\{/g, '\\u{');
    
    // 修复：将Unicode转义转换为实际字符
    result = result.replace(/\\u\{([0-9A-F]+)\}/g, (match, hex) => {
        return String.fromCodePoint(parseInt(hex, 16));
    });

    // 处理缩进：将前导空格转换为&nbsp;
    result = result.replace(/^ +/g, (spaces) => '&amp;nbsp;'.repeat(spaces.length));

    return result + '<br>';
}
```

### 2. QQ → Markdown 转换 (qq2md.js)

#### 代码块节点识别
```javascript
convertCodeBlock(node) {
    const data = node.data || node;
    
    // 获取代码块标题（语言标识）
    const titleText = this.convertRichTextToMarkdown(data.title).trim();
    
    // 处理语言标识
    let language = '';
    if (titleText.startsWith('```')) {
        language = titleText.replace(/^```/, '').trim();
    } else {
        language = titleText;
    }
    
    // 获取代码内容
    let codeContent = '';
    if (data.notes?.content) {
        codeContent = this.extractCodeFromNotes(data.notes.content);
    }
    
    // 生成Markdown代码块
    if (language && language !== '```' && language !== '') {
        return `\n\`\`\`${language}\n${codeContent}\n\`\`\`\n\n`;
    } else {
        return `\n\`\`\`\n${codeContent}\n\`\`\`\n\n`;
    }
}
```

#### HTML内容解析
```javascript
extractCodeFromNotes(htmlContent) {
    // 1. 直接解析HTML内容，提取所有文本
    let codeContent = this.simpleHtmlToText(htmlContent);
    
    // 2. 清理代码块标记，但保留注释
    codeContent = this.cleanCodeBlockMarkers(codeContent);
    
    // 3. 如果内容为空，尝试其他方法
    if (!codeContent.trim()) {
        // 回退到原有的pre/code标签解析
        const preCodeMatch = htmlContent.match(/<pre><code>([\s\S]*?)<\/code><\/pre>/);
        if (preCodeMatch) {
            codeContent = this.decodeHtmlEntities(preCodeMatch[1]);
            codeContent = this.cleanCodeBlockMarkers(codeContent);
            return codeContent;
        }
    }
    
    return codeContent;
}
```

#### 代码块标记清理
```javascript
cleanCodeBlockMarkers(codeContent) {
    // 移除开头的代码块标记（包括语言标识）
    codeContent = codeContent.replace(/^```\w*\n?/, '');
    // 移除结尾的代码块标记
    codeContent = codeContent.replace(/\n?```$/, '');
    // 移除中间的代码块标记
    codeContent = codeContent.replace(/\n```\w*\n/g, '\n');
    codeContent = codeContent.replace(/\n```\n/g, '\n');
    
    // 清理多余的换行符
    codeContent = codeContent.replace(/\n{3,}/g, '\n\n');
    
    return codeContent.trim();
}
```

## 🎯 关键特性

### 1. 语言标识处理
- **MD → QQ**: 提取语言标识并作为节点标题
- **QQ → MD**: 从节点标题恢复语言标识
- **支持**: 所有标准编程语言标识

### 2. 特殊字符处理
- **HTML实体**: 使用 `he` 库进行编码/解码
- **Unicode字符**: 正确处理中文字符和其他Unicode字符
- **缩进处理**: 将空格转换为 `&nbsp;` 实体

### 3. 空行处理
- **保持结构**: 正确处理代码块中的空行
- **HTML格式**: 使用 `<p><br></p>` 表示空行
- **格式保持**: 在转换过程中保持原始格式

### 4. 代码块标记
- **开始标记**: `\`\`\`language`
- **结束标记**: `\`\`\``
- **清理逻辑**: 避免重复的代码块标记

## 🧪 测试策略

### 测试用例分类

#### 1. 基础功能测试
```javascript
{
    name: '基础代码块',
    markdown: `\`\`\`javascript
console.log('Hello World');
\`\`\``,
    expectedLanguage: 'javascript'
}
```

#### 2. 特殊字符测试
```javascript
{
    name: '包含特殊字符的代码块',
    markdown: `\`\`\`python
def test_function():
    print("Hello 'World'")
    print('Hello "World"')
    print("Hello & World")
\`\`\``,
    expectedLanguage: 'python'
}
```

#### 3. 中文字符测试
```javascript
{
    name: 'Arduino代码块（实际案例）',
    markdown: `\`\`\`cpp
// Arduino超声波传感器代码
// 用于与TouchDesigner通信
\`\`\``,
    expectedLanguage: 'cpp'
}
```

### 验证方法

#### 1. 格式验证
```javascript
const checks = {
    hasLanguagePrefix: ourContent.includes('```cpp<br>'),
    hasEmptyLines: ourContent.includes('<p><br></p>'),
    hasDoubleEscapedSpaces: ourContent.includes('&amp;nbsp;'),
    hasChineseCharacters: ourContent.includes('超声波') || ourContent.includes('传感器'),
    hasEndMarker: ourContent.includes('```</p>'),
    hasCorrectStructure: ourContent.match(/<p>```cpp<br>.*?```<\/p>/s) !== null
};
```

#### 2. 内容验证
```javascript
// 检查中文字符
const chineseMatches = ourContent.match(/[\u4e00-\u9fff]/g) || [];
console.log('中文字符数量:', chineseMatches.length);
console.log('示例字符:', chineseMatches.slice(0, 5));
```

## 🚨 常见问题与解决方案

### 1. Unicode转义问题
**问题**: 中文字符显示为 `\\u{8D85}` 格式
**解决方案**: 
```javascript
// 修复：将Unicode转义转换为实际字符
result = result.replace(/\\u\{([0-9A-F]+)\}/g, (match, hex) => {
    return String.fromCodePoint(parseInt(hex, 16));
});
```

### 2. 双反斜杠问题
**问题**: Unicode转义使用双反斜杠
**解决方案**:
```javascript
// 修复：将双反斜杠转换为单反斜杠
result = result.replace(/\\\\u\{/g, '\\u{');
```

### 3. 代码块标记重复
**问题**: 转换后出现重复的代码块标记
**解决方案**:
```javascript
cleanCodeBlockMarkers(codeContent) {
    // 移除开头的代码块标记（包括语言标识）
    codeContent = codeContent.replace(/^```\w*\n?/, '');
    // 移除结尾的代码块标记
    codeContent = codeContent.replace(/\n?```$/, '');
    return codeContent.trim();
}
```

### 4. 缩进丢失
**问题**: 代码缩进在转换过程中丢失
**解决方案**:
```javascript
// 处理缩进：将前导空格转换为&nbsp;
result = result.replace(/^ +/g, (spaces) => '&amp;nbsp;'.repeat(spaces.length));
```

## 📋 最佳实践

### 1. 依赖库使用
- **优先使用**: 充分利用 `he` 库进行HTML实体处理
- **避免重复**: 不要重复实现已有的功能
- **保持一致性**: 在整个项目中使用相同的处理方式

### 2. 错误处理
```javascript
try {
    const result = converter.convert(markdown);
    // 处理成功结果
} catch (error) {
    console.error('转换失败:', error);
    // 提供降级处理
}
```

### 3. 性能优化
- **避免重复解析**: 缓存解析结果
- **减少DOM操作**: 使用字符串处理而非DOM操作
- **内存管理**: 及时释放大型对象

### 4. 可维护性
- **清晰命名**: 使用描述性的变量和函数名
- **模块化**: 将复杂逻辑拆分为小函数
- **文档注释**: 为关键函数添加详细注释

## 🔄 扩展指南

### 添加新语言支持
1. 在测试用例中添加新语言
2. 验证语言标识的提取和恢复
3. 确保特殊语法正确处理

### 添加新特性
1. 分析需求对现有架构的影响
2. 设计向后兼容的接口
3. 添加相应的测试用例
4. 更新文档

### 性能优化
1. 识别性能瓶颈
2. 使用性能分析工具
3. 优化关键路径
4. 验证优化效果

## 📚 相关资源

- [Markdown-it 文档](https://markdown-it.github.io/)
- [he 库文档](https://github.com/mathiasbynens/he)
- [Unicode 处理指南](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/fromCodePoint)
- [HTML 实体编码](https://developer.mozilla.org/en-US/docs/Glossary/Entity)

---

**版本**: 2.3  
**最后更新**: 2024年12月  
**维护者**: QQmindmap2Obsidian 开发团队 