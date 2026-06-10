import { NextResponse } from "next/server";

export async function POST() {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "DEEPSEEK_API_KEY 未配置" },
      { status: 500 }
    );
  }

  const prompt = `你是一位大学英语六级命题专家。请生成一道符合近年CET-6真题风格的作文题。

要求：
1. 题目为英文
2. 写作要求用中文说明
3. 提供3点写作提纲（中文）

请严格按以下JSON格式返回，不要包含其他内容：
{
  "topic": "英文题目",
  "requirements": "写作要求",
  "outline": ["提纲1", "提纲2", "提纲3"]
}`;

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
        temperature: 0.8,
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

    // 尝试从返回内容中提取 JSON
    let topicData;
    try {
      // 先尝试直接解析
      topicData = JSON.parse(content);
    } catch {
      // 如果失败，尝试从 markdown 代码块中提取
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        topicData = JSON.parse(jsonMatch[1]);
      } else {
        // 尝试匹配任意 JSON 对象
        const objMatch = content.match(/\{[\s\S]*\}/);
        if (objMatch) {
          topicData = JSON.parse(objMatch[0]);
        } else {
          throw new Error("无法解析返回内容");
        }
      }
    }

    return NextResponse.json(topicData);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "未知错误";
    return NextResponse.json(
      { error: `请求失败: ${message}` },
      { status: 500 }
    );
  }
}
