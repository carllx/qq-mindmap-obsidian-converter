const fs = require('fs');
const path = require('path');

// 简单构建脚本 - 使用简单模板
function buildUserScript() {
    console.log('🔧 开始构建简单版本的用户脚本...');
    
    // 1. 读取简单模板文件
    const templatePath = 'templates/userScript.template.js';
    if (!fs.existsSync(templatePath)) {
        console.error('❌ 模板文件不存在:', templatePath);
        return;
    }
    
    let template = fs.readFileSync(templatePath, 'utf8');
    
    // Inject the 'he' library
    const heLibraryPath = 'lib/he.min.js';
    if (fs.existsSync(heLibraryPath)) {
        const heCode = fs.readFileSync(heLibraryPath, 'utf8');
        template = template.replace('// {{HE_LIBRARY}}', heCode);
    } else {
        console.error('❌ `he` library not found at:', heLibraryPath);
    }
    
    // 2. 读取模块文件
    const modules = [
        { name: 'IndentManager', file: 'core/utils/indentManager.js' },
        { name: 'LinePreserver', file: 'core/utils/linePreserver.js' },
        { name: 'QQMindMapParser', file: 'core/parsers/qqParser.js' },
        { name: 'QQToMarkdownConverter', file: 'core/converters/qq2md.js' },
        { name: 'MarkdownToQQConverter', file: 'core/converters/md2qq.js' },
        { name: 'NotificationSystem', file: 'ui/notifications.js' }
    ];
    
    // 3. 生成模块代码
    let moduleCode = '';
    for (const module of modules) {
        console.log(`📦 处理模块: ${module.file}`);
        if (!fs.existsSync(module.file)) {
            console.error(`❌ 模块文件不存在: ${module.file}`);
            continue;
        }
        
        const content = fs.readFileSync(module.file, 'utf8');
        const className = extractClassName(content);
        moduleCode += `    define('${module.name}', function() {\n        ${content}\n        return ${className};\n    });\n\n`;
    }
    
    // 添加全局变量定义
    moduleCode += `    // 创建全局变量以便其他模块使用\n`;
    moduleCode += `    const IndentManager = modules.IndentManager;\n`;
    moduleCode += `    const LinePreserver = modules.LinePreserver;\n\n`;
    
    // 4. 替换模板中的占位符
    template = template.replace('{{MODULES}}', moduleCode);
    
    // 5. 写入输出文件
    fs.writeFileSync('QQmindmap2Obsidian.user.js', template);
    console.log('✅ 简单版本用户脚本构建完成: QQmindmap2Obsidian.user.js');
    console.log(`📊 文件大小: ${(template.length / 1024).toFixed(2)} KB`);
}

// 提取类名的辅助函数
function extractClassName(content) {
    const classMatch = content.match(/class\s+(\w+)/);
    return classMatch ? classMatch[1] : 'UnknownClass';
}

// 执行构建
buildUserScript(); 