/**
 * 测试 Markdown 格式转换功能
 */

// 模拟浏览器环境
global.window = global;
global.navigator = { clipboard: {} };

// 模拟 markdown-it
const markdownit = require('markdown-it')({
    html: true,
    linkify: true,
    breaks: false,
    typographer: false
}).enable(['strikethrough', 'emphasis']);

// 模拟 he 库
const he = require('he');

// 加载模块
const RichTextFormatter = require('../core/formatters/richText.js');
const MarkdownToQQConverter = require('../core/converters/md2qq.js');

// 创建实例
const richTextFormatter = new RichTextFormatter();

// 修复：在 Node.js 环境中正确初始化 MarkdownToQQConverter
const mdToQqConverter = new MarkdownToQQConverter(markdownit, he);

// 测试用例
const testCases = [
    {
        name: '基本格式测试',
        input: 'MDtoQQ时需要自动识别其格式例如 **粗体**, _斜体_, ~~strickthrough~~, 并在QQtoMD时, 需要对这些格式进行正确还原为md 格式.',
        expected: {
            hasBold: true,
            hasItalic: true,
            hasStrike: true
        }
    },
    {
        name: '混合格式测试',
        input: '这是**粗体**和_斜体_以及~~删除线~~的混合格式',
        expected: {
            hasBold: true,
            hasItalic: true,
            hasStrike: true
        }
    }
];

function testFormatConversion() {
    console.log('🧪 开始测试 Markdown 格式转换...\n');
    
    for (const testCase of testCases) {
        console.log(`📝 测试: ${testCase.name}`);
        console.log(`输入: ${testCase.input}`);
        
        try {
            // 使用 RichTextFormatter 直接测试
            const result = richTextFormatter.format(testCase.input, markdownit);
            console.log('结果:', JSON.stringify(result, null, 2));
            
            // 检查结果
            let hasBold = false;
            let hasItalic = false;
            let hasStrike = false;
            
            if (result.children && result.children[0] && result.children[0].children) {
                for (const textNode of result.children[0].children) {
                    if (textNode.fontWeight === 700) hasBold = true;
                    if (textNode.italic) hasItalic = true;
                    if (textNode.strike) hasStrike = true;
                }
            }
            
            console.log(`✅ 粗体: ${hasBold}, 斜体: ${hasItalic}, 删除线: ${hasStrike}`);
            
            // 验证期望结果
            if (testCase.expected.hasBold === hasBold && 
                testCase.expected.hasItalic === hasItalic && 
                testCase.expected.hasStrike === hasStrike) {
                console.log('✅ 测试通过\n');
            } else {
                console.log('❌ 测试失败\n');
            }
            
        } catch (error) {
            console.error('❌ 测试出错:', error.message);
        }
    }
    
    // 测试完整的 MD to QQ 转换
    console.log('🔄 测试完整的 MD to QQ 转换...');
    const fullTestInput = testCases[0].input;
    try {
        const mindMapData = mdToQqConverter.convert(fullTestInput);
        console.log('转换结果:', JSON.stringify(mindMapData, null, 2));
        console.log('✅ 完整转换测试完成\n');
    } catch (error) {
        console.error('❌ 完整转换测试失败:', error.message);
    }
}

// 运行测试
testFormatConversion(); 