import * as v from "valibot";
import type { LectureType } from "../../models/lecture";

const ClaudeResponseSchema = v.object({
  content: v.array(
    v.object({
      type: v.string(),
      text: v.string(),
    }),
  ),
});

export async function generateLectureText(
  weekTitle: string,
  keywords: string,
  type: LectureType,
  apiKey: string,
): Promise<string> {
  const systemPrompt =
    type === "audio"
      ? "あなたはCS講師です。音声講義用のテキストを口語体で生成してください。数式は使わず、3000-5000字で「なぜ重要か」「直感的にどういう話か」を中心に構成してください。"
      : "あなたはCS講師です。テキスト講義資料を生成してください。数式・擬似コード・図・例題・練習問題を含めてください。";

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8192,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `「${weekTitle}」について講義テキストを生成してください。キーワード: ${keywords}`,
        },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Claude API error ${res.status}: ${body}`);
  }

  const data = v.parse(ClaudeResponseSchema, await res.json());
  const textBlock = data.content.find((b) => b.type === "text");
  if (!textBlock) {
    throw new Error("No text content in Claude response");
  }
  return textBlock.text;
}
