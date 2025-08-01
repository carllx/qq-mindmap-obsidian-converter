/**
 * 库处理对比测试
 * 比较手动HTML处理和专业库处理的差异
 */

// 模拟环境
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;

// 导入库
const TurndownService = require('turndown');
const DOMPurify = require('dompurify');

// 导入转换器
const QQToMarkdownConverter = require('../core/converters/qq2md.js');
const ImprovedQQToMarkdownConverter = require('../core/converters/qq2md_improved.js');

class LibraryComparisonTest {
    constructor() {
        this.originalConverter = new QQToMarkdownConverter();
        this.improvedConverter = new ImprovedQQToMarkdownConverter();
        
        // 初始化Turndown
        this.turndownService = new TurndownService({
            headingStyle: 'atx',
            codeBlockStyle: 'fenced',
            emDelimiter: '*'
        });
    }

    /**
     * 运行对比测试
     */
    async runComparisonTest() {
        console.log('🔍 库处理对比测试');
        console.log('==================================================');

        const testCases = [
            {
                name: 'Arduino代码块对比',
                qqNodes: this.createArduinoTestNodes()
            }
        ];

        for (const testCase of testCases) {
            console.log(`\n📝 测试: ${testCase.name}`);
            
            // 原始方法
            console.log('\n🔄 原始方法结果:');
            const originalResult = this.originalConverter.convert(testCase.qqNodes);
            console.log('长度:', originalResult.length);
            console.log('前100字符:', originalResult.substring(0, 100));

            // 改进方法
            console.log('\n🔄 改进方法结果:');
            const improvedResult = this.improvedConverter.convert(testCase.qqNodes);
            console.log('长度:', improvedResult.length);
            console.log('前100字符:', improvedResult.substring(0, 100));

            // 直接使用Turndown
            console.log('\n🔄 直接Turndown结果:');
            const turndownResult = this.testDirectTurndown(testCase.qqNodes);
            console.log('长度:', turndownResult.length);
            console.log('前100字符:', turndownResult.substring(0, 100));

            // 分析差异
            this.analyzeDifferences(originalResult, improvedResult, turndownResult);
        }
    }

    /**
     * 创建Arduino测试节点
     */
    createArduinoTestNodes() {
        const arduinoHtml = 
            '<p>```cpp<br>// Arduino&#36229;&#22768;&#27874;&#20256;&#24863;&#22120;&#20195;&#30721;<br>// &#29992;&#20110;&#19982;TouchDesigner&#36890;&#20449;<br></p>' +
            '<p><br></p>' +
            '<p>const int trigPin = 2;    // &#35302;&#21457;&#24341;&#33050;<br>const int echoPin = 3;    // &#22238;&#22768;&#24341;&#33050;<br></p>' +
            '<p><br></p>' +
            '<p>long duration;<br>int distance;<br>int smoothDistance;<br>int lastDistance = 0;<br></p>' +
            '<p><br></p>' +
            '<p>void setup() {<br>&nbsp;&nbsp;// &#21021;&#22987;&#21270;&#20018;&#21475;&#36890;&#20449;<br>&nbsp;&nbsp;Serial.begin(9600);<br></p>' +
            '<p><br></p>' +
            '<p>&nbsp;&nbsp;// &#35774;&#32622;&#24341;&#33050;&#27169;&#24335;<br>&nbsp;&nbsp;pinMode(trigPin, OUTPUT);<br>&nbsp;&nbsp;pinMode(echoPin, INPUT);<br></p>' +
            '<p><br></p>' +
            '<p>&nbsp;&nbsp;Serial.println("Arduino Ultrasonic Sensor Ready");<br>}<br></p>' +
            '<p><br></p>' +
            '<p>void loop() {<br>&nbsp;&nbsp;// &#28165;&#38500;&#35302;&#21457;&#24341;&#33050;<br>&nbsp;&nbsp;digitalWrite(trigPin, LOW);<br>&nbsp;&nbsp;delayMicroseconds(2);<br></p>' +
            '<p><br></p>' +
            '<p>&nbsp;&nbsp;// &#21457;&#36865;10&#24494;&#31186;&#30340;&#39640;&#30005;&#24179;&#33033;&#20914;<br>&nbsp;&nbsp;digitalWrite(trigPin, HIGH);<br>&nbsp;&nbsp;delayMicroseconds(10);<br>&nbsp;&nbsp;digitalWrite(trigPin, LOW);<br></p>' +
            '<p><br></p>' +
            '<p>&nbsp;&nbsp;// &#35835;&#21462;&#22238;&#22768;&#24341;&#33050;&#30340;&#33033;&#20914;&#25345;&#32493;&#26102;&#38388;<br>&nbsp;&nbsp;duration = pulseIn(echoPin, HIGH);<br></p>' +
            '<p><br></p>' +
            '<p>&nbsp;&nbsp;// &#35745;&#31639;&#36317;&#31163;&#65288;&#21462;&#31859;&#65289;<br>&nbsp;&nbsp;distance = duration * 0.034 / 2;<br></p>' +
            '<p><br></p>' +
            '<p>&nbsp;&nbsp;// &#31616;&#21333;&#30340;&#24179;&#28388;&#28388;&#27874;<br>&nbsp;&nbsp;smoothDistance = (distance + lastDistance) / 2;<br>&nbsp;&nbsp;lastDistance = smoothDistance;<br></p>' +
            '<p><br></p>' +
            '<p>&nbsp;&nbsp;// &#38480;&#21046;&#36317;&#31163;&#33539;&#22260;&#65288;0-200cm&#65289;<br>&nbsp;&nbsp;if (smoothDistance > 200) {<br>&nbsp;&nbsp;&nbsp;&nbsp;smoothDistance = 200;<br>&nbsp;&nbsp;}<br>&nbsp;&nbsp;if (smoothDistance < 0) {<br>&nbsp;&nbsp;&nbsp;&nbsp;smoothDistance = 0;<br>&nbsp;&nbsp;}<br></p>' +
            '<p><br></p>' +
            '<p>&nbsp;&nbsp;// &#21457;&#36865;&#25968;&#25454;&#21040;TouchDesigner<br>&nbsp;&nbsp;// &#26684;&#24335;&#65306;distance,normalized_value<br>&nbsp;&nbsp;float normalizedValue = smoothDistance / 200.0; // &#24402;&#19968;&#21270;&#21040;0-1<br></p>' +
            '<p><br></p>' +
            '<p>&nbsp;&nbsp;Serial.print(smoothDistance);<br>&nbsp;&nbsp;Serial.print(",");<br>&nbsp;&nbsp;Serial.println(normalizedValue, 3);<br></p>' +
            '<p><br></p>' +
            '<p>&nbsp;&nbsp;// &#24310;&#36831;&#20197;&#25511;&#21046;&#25968;&#25454;&#21457;&#36865;&#39057;&#29575;<br>&nbsp;&nbsp;delay(50); // 20Hz&#26356;&#26032;&#39057;&#29575;<br>}<br></p>';

        return [{
            data: {
                title: 'Arduino代码',
                labels: [{
                    id: 'qq-mind-map-code-block-label',
                    text: 'code-block',
                    backgroundColor: 'rgb(172, 226, 197)',
                    color: '#000000'
                }],
                notes: {
                    content: arduinoHtml
                }
            }
        }];
    }

    /**
     * 测试直接使用Turndown
     */
    testDirectTurndown(qqNodes) {
        const codeBlockNode = this.findCodeBlockNode(qqNodes);
        if (!codeBlockNode?.notes?.content) {
            return '';
        }

        try {
            // 清理HTML
            const cleanHtml = DOMPurify.sanitize(codeBlockNode.notes.content, {
                ALLOWED_TAGS: ['p', 'br', 'code', 'pre', 'span', 'div'],
                ALLOWED_ATTR: ['class']
            });

            // 转换为Markdown
            const markdown = this.turndownService.turndown(cleanHtml);
            
            // 提取代码块
            const codeBlockMatch = markdown.match(/```\w*\n([\s\S]*?)\n```/);
            if (codeBlockMatch) {
                return codeBlockMatch[0];
            }
            
            return markdown;
        } catch (error) {
            console.error('Turndown转换失败:', error);
            return '';
        }
    }

    /**
     * 查找代码块节点
     */
    findCodeBlockNode(nodes) {
        for (const node of nodes) {
            const data = node.data || node;
            
            if (data.labels?.some(label => label.text === 'code-block')) {
                return data;
            }
            
            if (data.children?.attached) {
                const found = this.findCodeBlockNode(data.children.attached);
                if (found) return found;
            }
        }
        return null;
    }

    /**
     * 分析差异
     */
    analyzeDifferences(original, improved, turndown) {
        console.log('\n📊 差异分析:');
        console.log('原始方法长度:', original.length);
        console.log('改进方法长度:', improved.length);
        console.log('直接Turndown长度:', turndown.length);

        // 提取代码内容进行比较
        const originalCode = this.extractCodeContent(original);
        const improvedCode = this.extractCodeContent(improved);
        const turndownCode = this.extractCodeContent(turndown);

        console.log('\n代码内容长度:');
        console.log('原始:', originalCode.length);
        console.log('改进:', improvedCode.length);
        console.log('Turndown:', turndownCode.length);

        // 检查是否包含空行
        const originalLines = originalCode.split('\n');
        const improvedLines = improvedCode.split('\n');
        const turndownLines = turndownCode.split('\n');

        console.log('\n行数统计:');
        console.log('原始:', originalLines.length);
        console.log('改进:', improvedLines.length);
        console.log('Turndown:', turndownLines.length);

        // 检查空行
        const originalEmptyLines = originalLines.filter(line => line.trim() === '').length;
        const improvedEmptyLines = improvedLines.filter(line => line.trim() === '').length;
        const turndownEmptyLines = turndownLines.filter(line => line.trim() === '').length;

        console.log('\n空行统计:');
        console.log('原始:', originalEmptyLines);
        console.log('改进:', improvedEmptyLines);
        console.log('Turndown:', turndownEmptyLines);
    }

    /**
     * 提取代码内容
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
async function runLibraryComparisonTest() {
    const test = new LibraryComparisonTest();
    return await test.runComparisonTest();
}

// 如果直接运行此文件
if (require.main === module) {
    runLibraryComparisonTest()
        .then(() => {
            console.log('\n🎉 库处理对比测试完成！');
        })
        .catch((error) => {
            console.error('\n💥 测试运行失败:', error);
        });
}

module.exports = { LibraryComparisonTest, runLibraryComparisonTest }; 