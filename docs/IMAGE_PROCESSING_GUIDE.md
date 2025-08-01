# 图片处理功能指南

## 概述

QQ到MD转换中的图片处理功能负责将QQ思维导图中的图片节点转换为标准的Markdown图片格式：`![alt](url)`

## 功能特性

### 1. Alt文本提取

系统会从节点的notes内容中提取alt文本，支持以下格式：

#### 英文格式
- `<p>Image Alt: 描述文本</p>`
- `<p>Alt: 描述文本</p>`
- `alt: 描述文本`

#### 中文格式
- `<p>图片描述: 描述文本</p>`
- `<p>描述: 描述文本</p>`
- `图片描述: 描述文本`

#### 降级处理
如果未找到特定格式的alt信息，系统会：
1. 使用notes的纯文本内容作为alt
2. 如果notes为空，使用默认值"image"

### 2. URL处理

支持多种URL格式：
- HTTP/HTTPS URLs
- 相对路径
- Data URLs (base64编码)

### 3. 多图片支持

一个节点可以包含多个图片，每个图片都会生成独立的Markdown格式。

## 使用示例

### 基本用法

```javascript
// QQ思维导图节点
const node = {
    data: {
        images: [{ url: 'https://example.com/image.jpg' }],
        notes: { content: '<p>Image Alt: Beautiful sunset</p>' }
    }
};

// 转换结果
// ![Beautiful sunset](https://example.com/image.jpg)
```

### 中文描述

```javascript
const node = {
    data: {
        images: [{ url: 'https://example.com/image.jpg' }],
        notes: { content: '<p>图片描述: 美丽的风景</p>' }
    }
};

// 转换结果
// ![美丽的风景](https://example.com/image.jpg)
```

### 多图片节点

```javascript
const node = {
    data: {
        images: [
            { url: 'https://example.com/image1.jpg' },
            { url: 'https://example.com/image2.jpg' }
        ],
        notes: { content: '<p>Image Alt: First image</p><p>Image Alt: Second image</p>' }
    }
};

// 转换结果
// ![First image](https://example.com/image1.jpg)
// ![Second image](https://example.com/image2.jpg)
```

### 降级处理

```javascript
// 没有特定alt格式的节点
const node = {
    data: {
        images: [{ url: 'https://example.com/image.jpg' }],
        notes: { content: '<p>This is a general description</p>' }
    }
};

// 转换结果
// ![This is a general description](https://example.com/image.jpg)
```

## 实现细节

### 正则表达式模式

系统使用以下正则表达式来匹配alt文本：

```javascript
const altPatterns = [
    /<p>Image Alt:\s*(.*?)<\/p>/i,
    /<p>Alt:\s*(.*?)<\/p>/i,
    /<p>图片描述:\s*(.*?)<\/p>/i,
    /<p>描述:\s*(.*?)<\/p>/i,
    /alt:\s*(.*?)(?:\n|$)/i,
    /图片描述:\s*(.*?)(?:\n|$)/i
];
```

### 处理流程

1. **检查图片数组**：确认节点包含图片
2. **提取alt文本**：
   - 遍历所有alt模式
   - 找到第一个匹配的模式
   - 提取并清理alt文本
3. **降级处理**：
   - 如果未找到特定格式，使用notes的纯文本
   - 如果notes为空，使用默认值"image"
4. **生成Markdown**：使用 `![alt](url)` 格式

### 错误处理

- **空notes**：使用默认alt "image"
- **null notes**：使用默认alt "image"
- **空alt文本**：使用默认alt "image"
- **特殊字符**：保留在alt文本中
- **中文字符**：完全支持

## 测试覆盖

### 单元测试

系统包含完整的单元测试覆盖：

- Alt文本提取测试
- URL处理测试
- 边界情况测试
- 中文支持测试
- 多图片处理测试

### 测试用例

```javascript
// 测试文件：test/imageProcessing.test.js
describe('Image Processing Tests', () => {
    // 各种测试场景
});
```

## 注意事项

1. **Alt文本长度**：没有限制，但建议保持合理长度
2. **特殊字符**：alt文本中的特殊字符会被保留
3. **URL验证**：系统不验证URL的有效性
4. **编码问题**：支持UTF-8编码的中文字符

## 未来改进

1. **更多alt格式**：支持更多自定义alt格式
2. **URL验证**：添加URL有效性检查
3. **图片优化**：支持图片尺寸和格式信息
4. **批量处理**：优化多图片的处理性能 