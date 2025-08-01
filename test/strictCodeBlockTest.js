/**
 * 严格代码块转换测试
 * 要求100%内容匹配，不允许任何差异
 */

// 模拟环境
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;

// 模拟he库
const he = require('he');

// 模拟markdown-it
const MarkdownIt = require('markdown-it');
const md = new MarkdownIt();

// 导入依赖模块
const IndentManager = require('../core/utils/indentManager.js');
const LinePreserver = require('../core/utils/linePreserver.js');
const RichTextFormatter = require('../core/formatters/richText.js');

// 导入转换器类
const MarkdownToQQConverter = require('../core/converters/md2qq.js');
const QQToMarkdownConverter = require('../core/converters/qq2md.js');

class StrictCodeBlockTestSuite {
    constructor() {
        this.mdToQQConverter = new MarkdownToQQConverter(md, he);
        this.qqToMDConverter = new QQToMarkdownConverter();
    }

    /**
     * 运行严格代码块转换测试
     */
    async runStrictCodeBlockTests() {
        console.log('🔍 开始严格代码块转换测试');
        console.log('==================================================');

        const testCases = [
            {
                name: 'Arduino代码块（严格测试）',
                markdown: `\`\`\`cpp
// Arduino超声波传感器代码
// 用于与TouchDesigner通信

const int trigPin = 2;    // 触发引脚
const int echoPin = 3;    // 回声引脚

long duration;
int distance;
int smoothDistance;
int lastDistance = 0;

void setup() {
  // 初始化串口通信
  Serial.begin(9600);
  
  // 设置引脚模式
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  
  Serial.println("Arduino Ultrasonic Sensor Ready");
}

void loop() {
  // 清除触发引脚
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  
  // 发送10微秒的高电平脉冲
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  
  // 读取回声引脚的脉冲持续时间
  duration = pulseIn(echoPin, HIGH);
  
  // 计算距离（厘米）
  distance = duration * 0.034 / 2;
  
  // 简单的平滑滤波
  smoothDistance = (distance + lastDistance) / 2;
  lastDistance = smoothDistance;
  
  // 限制距离范围（0-200cm）
  if (smoothDistance > 200) {
    smoothDistance = 200;
  }
  if (smoothDistance < 0) {
    smoothDistance = 0;
  }
  
  // 发送数据到TouchDesigner
  // 格式：distance,normalized_value
  float normalizedValue = smoothDistance / 200.0; // 归一化到0-1
  
  Serial.print(smoothDistance);
  Serial.print(",");
  Serial.println(normalizedValue, 3);
  
  // 延迟以控制数据发送频率
  delay(50); // 20Hz更新频率
}
\`\`\``,
                expectedLanguage: 'cpp'
            }
        ];

        let passedTests = 0;
        let totalTests = testCases.length;

        for (const testCase of testCases) {
            console.log(`\n📝 测试: ${testCase.name}`);
            console.log(`   语言: ${testCase.expectedLanguage}`);
            
            try {
                const result = await this.testStrictCodeBlockConversion(testCase);
                
                if (result.passed) {
                    console.log('   ✅ 通过');
                    passedTests++;
                } else {
                    console.log('   ❌ 失败');
                    console.log(`      错误: ${result.error}`);
                    if (result.details) {
                        console.log(`      详情: ${result.details}`);
                    }
                }
            } catch (error) {
                console.log('   ❌ 异常');
                console.log(`      错误: ${error.message}`);
            }
        }

        console.log('\n📊 测试结果');
        console.log('==================================================');
        console.log(`总测试数: ${totalTests}`);
        console.log(`通过: ${passedTests} ✅`);
        console.log(`失败: ${totalTests - passedTests} ❌`);
        console.log(`成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

        return {
            total: totalTests,
            passed: passedTests,
            failed: totalTests - passedTests,
            successRate: (passedTests / totalTests) * 100
        };
    }

    /**
     * 测试单个严格代码块转换
     */
    async testStrictCodeBlockConversion(testCase) {
        const { markdown, expectedLanguage } = testCase;

        // MD → QQ 转换
        const qqNodes = this.mdToQQConverter.convert(markdown);
        
        // 验证QQ节点结构
        if (!qqNodes || qqNodes.length === 0) {
            return {
                passed: false,
                error: 'MD→QQ转换失败：没有生成节点'
            };
        }

        // 查找代码块节点
        const codeBlockNode = this.findCodeBlockNode(qqNodes);
        if (!codeBlockNode) {
            return {
                passed: false,
                error: '未找到代码块节点'
            };
        }

        // 验证代码块标签
        const hasCodeBlockLabel = codeBlockNode.labels?.some(label => 
            label.text === 'code-block'
        );
        if (!hasCodeBlockLabel) {
            return {
                passed: false,
                error: '代码块节点缺少code-block标签'
            };
        }

        // 验证notes内容
        if (!codeBlockNode.notes?.content) {
            return {
                passed: false,
                error: '代码块节点缺少notes内容'
            };
        }

        // QQ → MD 转换
        const convertedMarkdown = this.qqToMDConverter.convert(qqNodes);
        
        // 验证转换结果
        const validation = this.validateStrictCodeBlockConversion(
            markdown, 
            convertedMarkdown, 
            expectedLanguage
        );

        return validation;
    }

    /**
     * 查找代码块节点
     */
    findCodeBlockNode(nodes) {
        for (const node of nodes) {
            const data = node.data || node;
            
            // 检查是否是代码块节点
            if (data.labels?.some(label => label.text === 'code-block')) {
                return data;
            }
            
            // 递归检查子节点
            if (data.children?.attached) {
                const found = this.findCodeBlockNode(data.children.attached);
                if (found) return found;
            }
        }
        return null;
    }

    /**
     * 验证严格代码块转换结果
     */
    validateStrictCodeBlockConversion(originalMarkdown, convertedMarkdown, expectedLanguage) {
        // 1. 检查是否包含代码块标记
        if (!convertedMarkdown.includes('```')) {
            return {
                passed: false,
                error: '转换结果缺少代码块标记',
                details: `期望包含 \`\`\`，实际结果: ${convertedMarkdown.substring(0, 100)}...`
            };
        }

        // 2. 检查语言标识
        if (expectedLanguage && !convertedMarkdown.includes(`\`\`\`${expectedLanguage}`)) {
            return {
                passed: false,
                error: `语言标识不匹配`,
                details: `期望 \`\`\`${expectedLanguage}，实际结果: ${convertedMarkdown.substring(0, 100)}...`
            };
        }

        // 3. 严格检查内容完整性 - 要求100%匹配
        const originalCode = this.extractCodeContent(originalMarkdown);
        const convertedCode = this.extractCodeContent(convertedMarkdown);
        
        if (originalCode !== convertedCode) {
            // 详细分析差异
            const analysis = this.analyzeDifferences(originalCode, convertedCode);
            
            return {
                passed: false,
                error: '代码内容不完全匹配',
                details: analysis
            };
        }

        return {
            passed: true,
            error: null,
            details: null
        };
    }

    /**
     * 分析内容差异
     */
    analyzeDifferences(originalCode, convertedCode) {
        const originalLines = originalCode.split('\n');
        const convertedLines = convertedCode.split('\n');
        
        let analysis = `原始长度: ${originalCode.length}, 转换长度: ${convertedCode.length}\n`;
        analysis += `原始行数: ${originalLines.length}, 转换行数: ${convertedLines.length}\n\n`;
        
        const maxLines = Math.max(originalLines.length, convertedLines.length);
        let differences = 0;
        
        for (let i = 0; i < maxLines; i++) {
            const originalLine = originalLines[i] || '';
            const convertedLine = convertedLines[i] || '';
            
            if (originalLine !== convertedLine) {
                differences++;
                analysis += `行${i+1} 不匹配:\n`;
                analysis += `  原始: "${originalLine}"\n`;
                analysis += `  转换: "${convertedLine}"\n`;
                analysis += `  差异: ${this.findFirstDifference(originalLine, convertedLine)}\n\n`;
            }
        }
        
        analysis += `总差异行数: ${differences}`;
        return analysis;
    }

    /**
     * 找到第一个差异位置
     */
    findFirstDifference(str1, str2) {
        const minLength = Math.min(str1.length, str2.length);
        for (let i = 0; i < minLength; i++) {
            if (str1[i] !== str2[i]) {
                return `位置${i}: "${str1[i]}" vs "${str2[i]}"`;
            }
        }
        if (str1.length !== str2.length) {
            return `长度不同: ${str1.length} vs ${str2.length}`;
        }
        return '无差异';
    }

    /**
     * 提取代码内容（去除代码块标记）
     */
    extractCodeContent(markdown) {
        const codeBlockMatch = markdown.match(/```\w*\n([\s\S]*?)\n```/);
        if (codeBlockMatch) {
            return codeBlockMatch[1].trim();
        }
        return '';
    }
}

// 运行测试
async function runStrictCodeBlockTests() {
    const testSuite = new StrictCodeBlockTestSuite();
    return await testSuite.runStrictCodeBlockTests();
}

// 如果直接运行此文件
if (require.main === module) {
    runStrictCodeBlockTests()
        .then((results) => {
            console.log('\n🎉 严格代码块转换测试完成！');
            process.exit(results.failed === 0 ? 0 : 1);
        })
        .catch((error) => {
            console.error('\n💥 测试运行失败:', error);
            process.exit(1);
        });
}

module.exports = { StrictCodeBlockTestSuite, runStrictCodeBlockTests }; 