/**
 * Arduino代码块转换调试
 */

const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;

const he = require('he');
const MarkdownIt = require('markdown-it');
const md = new MarkdownIt();

// 导入依赖模块
const IndentManager = require('../core/utils/indentManager.js');
const LinePreserver = require('../core/utils/linePreserver.js');
const RichTextFormatter = require('../core/formatters/richText.js');

// 导入转换器类
const MarkdownToQQConverter = require('../core/converters/md2qq.js');
const QQToMarkdownConverter = require('../core/converters/qq2md.js');

const arduinoCode = `\`\`\`cpp
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
\`\`\``;

async function debugArduinoConversion() {
    console.log('🔍 调试Arduino代码块转换');
    console.log('==================================================');
    
    const mdToQQConverter = new MarkdownToQQConverter(md, he);
    const qqToMDConverter = new QQToMarkdownConverter();
    
    console.log('\n📝 原始Markdown:');
    console.log(arduinoCode);
    
    // MD → QQ 转换
    console.log('\n🔄 MD → QQ 转换...');
    const qqNodes = mdToQQConverter.convert(arduinoCode);
    
    // 查找代码块节点
    const codeBlockNode = findCodeBlockNode(qqNodes);
    if (codeBlockNode) {
        console.log('\n📋 QQ节点结构:');
        console.log('标题:', codeBlockNode.title);
        console.log('标签:', codeBlockNode.labels);
        console.log('Notes内容长度:', codeBlockNode.notes?.content?.length || 0);
        
        if (codeBlockNode.notes?.content) {
            console.log('\n📄 Notes内容 (前200字符):');
            console.log(codeBlockNode.notes.content.substring(0, 200));
            
            // 添加HTML内容分析
            console.log('\n🔍 HTML内容分析:');
            const htmlContent = codeBlockNode.notes.content;
            const paragraphMatches = htmlContent.match(/<p>([\s\S]*?)<\/p>/g);
            if (paragraphMatches) {
                console.log(`找到 ${paragraphMatches.length} 个段落`);
                for (let i = 0; i < Math.min(paragraphMatches.length, 10); i++) {
                    const paragraph = paragraphMatches[i];
                    const content = paragraph.replace(/<\/?p>/g, '').trim();
                    console.log(`段落${i+1}: "${content}" (长度: ${content.length})`);
                }
            }
        }
    }
    
    // QQ → MD 转换
    console.log('\n🔄 QQ → MD 转换...');
    const convertedMarkdown = qqToMDConverter.convert(qqNodes);
    
    console.log('\n📝 转换后的Markdown:');
    console.log(convertedMarkdown);
    
    // 提取代码内容进行比较
    const originalCode = extractCodeContent(arduinoCode);
    const convertedCode = extractCodeContent(convertedMarkdown);
    
    console.log('\n📊 内容比较:');
    console.log('原始代码长度:', originalCode.length);
    console.log('转换代码长度:', convertedCode.length);
    console.log('内容匹配:', originalCode === convertedCode);
    
    if (originalCode !== convertedCode) {
        console.log('\n❌ 内容不匹配详情:');
        console.log('原始代码 (前100字符):');
        console.log(originalCode.substring(0, 100));
        console.log('\n转换代码 (前100字符):');
        console.log(convertedCode.substring(0, 100));
        
        // 添加标准化比较
        const normalizeCodeContent = (code) => {
            return code
                .replace(/\r\n/g, '\n')
                .replace(/\r/g, '\n')
                .replace(/[ \t]+/g, ' ')
                .replace(/\n{3,}/g, '\n\n')
                .trim();
        };
        
        const normalizedOriginal = normalizeCodeContent(originalCode);
        const normalizedConverted = normalizeCodeContent(convertedCode);
        
        console.log('\n🔍 标准化比较:');
        console.log('标准化后匹配:', normalizedOriginal === normalizedConverted);
        console.log('标准化原始长度:', normalizedOriginal.length);
        console.log('标准化转换长度:', normalizedConverted.length);
        
        if (normalizedOriginal !== normalizedConverted) {
            console.log('\n❌ 标准化后仍不匹配:');
            console.log('标准化原始 (前100字符):');
            console.log(normalizedOriginal.substring(0, 100));
            console.log('\n标准化转换 (前100字符):');
            console.log(normalizedConverted.substring(0, 100));
        }
        
        // 添加更详细的比较
        console.log('\n🔍 详细比较:');
        const originalLines = originalCode.split('\n');
        const convertedLines = convertedCode.split('\n');
        
        console.log(`原始行数: ${originalLines.length}`);
        console.log(`转换行数: ${convertedLines.length}`);
        
        const maxLines = Math.max(originalLines.length, convertedLines.length);
        for (let i = 0; i < Math.min(maxLines, 10); i++) {
            const originalLine = originalLines[i] || '';
            const convertedLine = convertedLines[i] || '';
            const match = originalLine === convertedLine ? '✅' : '❌';
            console.log(`${match} 行${i+1}: "${originalLine}" vs "${convertedLine}"`);
        }
        
        // 检查尾部差异
        console.log('\n🔍 尾部比较:');
        for (let i = Math.max(0, maxLines - 5); i < maxLines; i++) {
            const originalLine = originalLines[i] || '';
            const convertedLine = convertedLines[i] || '';
            const match = originalLine === convertedLine ? '✅' : '❌';
            console.log(`${match} 行${i+1}: "${originalLine}" vs "${convertedLine}"`);
        }
        
        // 检查字符级别的差异
        console.log('\n🔍 字符级别比较:');
        const minLength = Math.min(originalCode.length, convertedCode.length);
        for (let i = 0; i < minLength; i++) {
            if (originalCode[i] !== convertedCode[i]) {
                console.log(`❌ 位置${i}: "${originalCode[i]}" vs "${convertedCode[i]}"`);
                console.log(`   原始: "${originalCode.substring(i, i+20)}"`);
                console.log(`   转换: "${convertedCode.substring(i, i+20)}"`);
                break;
            }
        }
    }
}

function findCodeBlockNode(nodes) {
    for (const node of nodes) {
        const data = node.data || node;
        
        if (data.labels?.some(label => label.text === 'code-block')) {
            return data;
        }
        
        if (data.children?.attached) {
            const found = findCodeBlockNode(data.children.attached);
            if (found) return found;
        }
    }
    return null;
}

function extractCodeContent(markdown) {
    const codeBlockMatch = markdown.match(/```\w*\n([\s\S]*?)\n```/);
    if (codeBlockMatch) {
        return codeBlockMatch[1].trim();
    }
    return '';
}

debugArduinoConversion()
    .then(() => {
        console.log('\n🎉 调试完成！');
    })
    .catch((error) => {
        console.error('\n💥 调试失败:', error);
    }); 