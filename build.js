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
    
    // 2. 读取模块文件 - 按依赖顺序排列
    const modules = [
        { name: 'IndentManager', file: 'core/utils/indentManager.js' },
        { name: 'LinePreserver', file: 'core/utils/linePreserver.js' },
        { name: 'QQMindMapParser', file: 'core/parsers/qqParser.js' },
        { name: 'StyleProcessor', file: 'core/formatters/shared/styleProcessor.js' },
        { name: 'RichTextFormatter', file: 'core/formatters/richText.js' },
        { name: 'CodeBlockHandler', file: 'core/converters/shared/codeBlockHandler.js' },
        { name: 'NodeManager', file: 'core/converters/shared/nodeManager.js' },
        { name: 'HtmlUtils', file: 'core/converters/shared/htmlUtils.js' },
        { name: 'QQToMarkdownConverter', file: 'core/converters/qq2md.js' },
        { name: 'MarkdownToQQConverter', file: 'core/converters/md2qq.js' },
        { name: 'NotificationSystem', file: 'ui/notifications.js' },
        { name: 'InterfaceManager', file: 'ui/interface.js' }
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
    
    // 4. 添加全局变量定义 - 在所有模块加载完成后
    moduleCode += `    // 等待所有模块加载完成后创建全局变量\n`;
    moduleCode += `    setTimeout(() => {\n`;
    moduleCode += `        if (modules.IndentManager) window.IndentManager = modules.IndentManager;\n`;
    moduleCode += `        if (modules.LinePreserver) window.LinePreserver = modules.LinePreserver;\n`;
    moduleCode += `        if (modules.QQMindMapParser) window.QQMindMapParser = modules.QQMindMapParser;\n`;
    moduleCode += `        if (modules.StyleProcessor) window.StyleProcessor = modules.StyleProcessor;\n`;
    moduleCode += `        if (modules.RichTextFormatter) window.RichTextFormatter = modules.RichTextFormatter;\n`;
    moduleCode += `        if (modules.CodeBlockHandler) window.CodeBlockHandler = modules.CodeBlockHandler;\n`;
    moduleCode += `        if (modules.NodeManager) window.NodeManager = modules.NodeManager;\n`;
    moduleCode += `        if (modules.HtmlUtils) window.HtmlUtils = modules.HtmlUtils;\n`;
    moduleCode += `        if (modules.QQToMarkdownConverter) window.QQToMarkdownConverter = modules.QQToMarkdownConverter;\n`;
    moduleCode += `        if (modules.MarkdownToQQConverter) window.MarkdownToQQConverter = modules.MarkdownToQQConverter;\n`;
    moduleCode += `        if (modules.NotificationSystem) window.NotificationSystem = modules.NotificationSystem;\n`;
    moduleCode += `        if (modules.InterfaceManager) window.InterfaceManager = modules.InterfaceManager;\n`;
    moduleCode += `        console.log('✅ 全局变量已创建');\n`;
    moduleCode += `    }, 100);\n\n`;
    
    // 5. 替换模板中的占位符
    template = template.replace('{{MODULES}}', moduleCode);
    
    // 6. 写入输出文件
    fs.writeFileSync('QQmindmap2Obsidian.user.js', template);
    console.log('✅ 简单版本用户脚本构建完成: QQmindmap2Obsidian.user.js');
    console.log(`📊 文件大小: ${(template.length / 1024).toFixed(2)} KB`);
}

// 提取类名的辅助函数
function extractClassName(content) {
    const classMatch = content.match(/class\s+(\w+)/);
    return classMatch ? classMatch[1] : 'UnknownClass';
}

// 解析命令行参数
const args = process.argv.slice(2);
const shouldDeploy = args.includes('--deploy') || args.includes('-d');
const deployTarget = args.find(arg => arg.startsWith('--target='))?.split('=')[1] || 'gist';

// 执行构建
buildUserScript();

// 如果指定了部署选项，则自动部署
if (shouldDeploy) {
    console.log(`\n🚀 开始自动部署到 ${deployTarget}...`);
    
    try {
        if (deployTarget === 'pages' || deployTarget === 'github-pages') {
            const AutoDeployer = require('./deploy.js');
            const deployer = new AutoDeployer();
            deployer.deploy();
        } else if (deployTarget === 'gist') {
            const GistDeployer = require('./deploy-gist.js');
            const deployer = new GistDeployer();
            deployer.deploy();
        } else {
            console.error('❌ 不支持的部署目标:', deployTarget);
            console.log('💡 支持的目标: gist, pages');
        }
    } catch (error) {
        console.error('❌ 自动部署失败:', error.message);
        console.log('💡 请手动运行部署脚本');
    }
} 