import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "DEEPSEEK_API_KEY 未配置" },
      { status: 500 }
    );
  }

  const { topic, essay } = await request.json();

  if (!topic || !essay) {
    return NextResponse.json(
      { error: "缺少题目或作文内容" },
      { status: 400 }
    );
  }

  const prompt = `你是一位大学英语六级阅卷老师。请严格按照CET-6作文评分标准批改。

作文题目：${topic}
学生作文：${essay}

请从以下维度分析：
1. 内容完整度
2. 语言表达
3. 逻辑结构
4. 语法准确性
5. 词汇丰富度

请严格按照下面格式输出（使用Markdown）：

# 总评分（15分制）
[给出分数，如 12/15，并简要说明]

# 内容评价
[分析内容是否切题、完整]

# 语言评价
[分析语言表达的流畅度和准确性]

# 逻辑结构
[分析段落结构和逻辑衔接]

# 语法错误分析
[列出具体错误，给出正确写法]

# 高级表达替换建议
[给出5-8个可以替换的高级词汇或句型]

# 提升建议
[给出3条具体可执行的提升建议]

# 高分范文
[根据题目写一段14-15分水平的范文，150-200词]`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-v4-pro",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `DeepSeek API 错误: ${response.status} - ${errorText}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    return NextResponse.json({ result: content });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "未知错误";
    return NextResponse.json(
      { error: `请求失败: ${message}` },
      { status: 500 }
    );
  }
}
