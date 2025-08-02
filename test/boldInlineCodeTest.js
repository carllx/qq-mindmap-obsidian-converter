/**
 * 测试粗体文本中包含内联代码的修复效果
 */

// 模拟 RichTextFormatter 的修复方法
function fixDuplicateBoldMarkers(text) {
    // 匹配连续的粗体节点，插入空格，确保Obsidian正常渲染
    // 例如：**数据格式：****`距离,归一化值`** -> **数据格式：** **`距离,归一化值`**
    return text.replace(/\*\*([^*]+)\*\*(?=\*\*)/g, '**$1** ');
}

// 测试用例
const testCases = [
    {
        name: "粗体文本包含内联代码（用空格分开）",
        input: "**数据格式：****`距离,归一化值`**",
        expected: "**数据格式：** **`距离,归一化值`**"
    },
    {
        name: "多个内联代码（用空格分开）",
        input: "**测试****`code1`****`code2`**",
        expected: "**测试** **`code1`** **`code2`**"
    },
    {
        name: "正常粗体文本（不应被修改）",
        input: "**正常粗体文本**",
        expected: "**正常粗体文本**"
    },
    {
        name: "内联代码不在粗体中（不应被修改）",
        input: "普通文本`代码`普通文本",
        expected: "普通文本`代码`普通文本"
    },
    {
        name: "复杂场景测试",
        input: "**配置项：****`api_key`** 和 ****`secret`**",
        expected: "**配置项：** **`api_key`** 和 **`secret`**"
    }
];

console.log("🧪 开始测试粗体文本中包含内联代码的修复效果...\n");

testCases.forEach((testCase, index) => {
    console.log(`📋 测试用例 ${index + 1}: ${testCase.name}`);
    console.log(`输入: "${testCase.input}"`);
    
    const result = fixDuplicateBoldMarkers(testCase.input);
    console.log(`输出: "${result}"`);
    console.log(`期望: "${testCase.expected}"`);
    
    const passed = result === testCase.expected;
    console.log(`结果: ${passed ? '✅ 通过' : '❌ 失败'}\n`);
});

console.log("\n✅ 测试完成！"); 