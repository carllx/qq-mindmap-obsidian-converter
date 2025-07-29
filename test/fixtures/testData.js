/**
 * 核心测试数据模块
 * 提供代表性的测试用例，避免重复生成大量占位符
 */

// 基础测试数据
const BASE_TEST_DATA = {
    // 简单标题
    simpleHeader: {
        markdown: `# 简单标题\n\n这是内容`,
        description: '基础标题结构'
    },
    
    // 多级标题
    multiLevelHeader: {
        markdown: `# 一级标题\n\n## 二级标题\n\n### 三级标题\n\n内容`,
        description: '多级标题层级'
    },
    
    // 同级文本
    parallelText: {
        markdown: `## 标题\n\n第一行正文\n第二行正文\n第三行正文`,
        description: '同级文本节点（问题1）'
    },
    
    // 代码块（含特殊字符）
    codeBlockWithSpecialChars: {
        markdown: `## 代码示例\n\n\`\`\`javascript\nconst user = "John's data";\nconst text = "Hello & World";\n\`\`\``,
        description: '代码块特殊字符处理（问题2）'
    },
    
    // 复杂代码块
    complexCodeBlock: {
        markdown: `## 复杂代码\n\n\`\`\`markdown\nArtist('s )Name Art Period/Movemen\nThis work of his is closely related\n\`\`\``,
        description: '复杂代码块（原始问题）'
    },
    
    // 列表结构
    listStructure: {
        markdown: `## 列表测试\n\n- 项目1\n- 项目2\n  - 子项目2.1\n  - 子项目2.2\n- 项目3`,
        description: '列表层级结构'
    },
    
    // 图片处理
    imageHandling: {
        markdown: `## 图片测试\n\n![Alt Text](image.jpg)\n\n![Another Image](photo.png "Title")`,
        description: '图片alt和title处理'
    },
    
    // 分割线
    divider: {
        markdown: `## 内容\n\n---\n\n更多内容`,
        description: '分割线处理'
    },
    
    // 混合内容
    mixedContent: {
        markdown: `# 混合内容测试\n\n## 文本部分\n\n这是普通文本。\n\n## 代码部分\n\n\`\`\`python\nprint("Hello World")\n\`\`\`\n\n## 列表部分\n\n- 项目A\n- 项目B\n\n---\n\n结束`,
        description: '综合测试用例'
    }
};

// 边界测试数据
const EDGE_CASES = {
    // 空内容
    emptyContent: {
        markdown: `# 标题\n\n\n\n`,
        description: '空行处理'
    },
    
    // 特殊字符
    specialCharacters: {
        markdown: `# 特殊字符测试\n\n内容包含：& < > " ' \`\n\n\`\`\`\n特殊字符：& < > " '\n\`\`\``,
        description: 'HTML特殊字符转义'
    },
    
    // 嵌套结构
    nestedStructure: {
        markdown: `# 嵌套测试\n\n## 二级\n\n### 三级\n\n#### 四级\n\n内容`,
        description: '深层嵌套结构'
    },
    
    // 长文本
    longText: {
        markdown: `# 长文本测试\n\n${'这是一段很长的文本内容，用于测试长文本的处理能力。'.repeat(10)}\n\n\`\`\`\n${'代码块中的长内容测试。'.repeat(5)}\n\`\`\``,
        description: '长文本性能测试'
    }
};

// 错误测试数据
const ERROR_CASES = {
    // 格式错误
    malformedMarkdown: {
        markdown: `# 标题\n\n### 跳级标题\n\n内容`,
        description: '标题层级跳跃'
    },
    
    // 未闭合代码块
    unclosedCodeBlock: {
        markdown: `# 测试\n\n\`\`\`javascript\nconsole.log("Hello");\n\n内容`,
        description: '未闭合代码块'
    }
};

// 导出测试数据
module.exports = {
    BASE_TEST_DATA,
    EDGE_CASES,
    ERROR_CASES,
    
    // 获取所有测试用例
    getAllTestCases() {
        return {
            ...BASE_TEST_DATA,
            ...EDGE_CASES,
            ...ERROR_CASES
        };
    },
    
    // 获取特定类型的测试用例
    getTestCasesByType(type) {
        const typeMap = {
            'base': BASE_TEST_DATA,
            'edge': EDGE_CASES,
            'error': ERROR_CASES
        };
        return typeMap[type] || {};
    }
}; 