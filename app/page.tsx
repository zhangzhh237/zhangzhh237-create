"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Sparkles,
  Loader2,
  Copy,
  Check,
  PenLine,
  BookOpen,
  Wand2,
} from "lucide-react";

// ---------- Types ----------

interface TopicData {
  topic: string;
  requirements: string;
  outline: string[];
}

// ---------- Constants ----------

const ENCOURAGEMENTS = [
  "你已经比昨天更进步啦 ✨",
  "继续保持，六级稳稳拿下 💕",
  "这篇结构很不错，再润色一下就更好了 🌸",
  "你的英文表达越来越自然了 🌟",
  "今天的努力不会白费，加油呀 💖",
];

// ---------- Helpers ----------

function countWords(text: string): number {
  if (!text.trim()) return 0;
  return text.trim().split(/\s+/).length;
}

function getWordCountHint(count: number): string {
  if (count < 150) return "再写一点就达到要求啦～";
  if (count <= 200) return "字数刚刚好 ✨";
  return "内容很充实 🌸";
}

function getWordCountColor(count: number): string {
  if (count < 150) return "text-amber-500";
  if (count <= 200) return "text-emerald-500";
  return "text-rose-400";
}

// Simple markdown-to-HTML converter
function markdownToHtml(md: string): string {
  if (!md) return "";

  // Split into lines for processing
  const lines = md.split("\n");
  const result: string[] = [];
  let inPre = false;
  let preContent: string[] = [];
  let inList = false;
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      result.push(`<ul class="list-disc pl-5 mb-3">${listItems.join("")}</ul>`);
      listItems = [];
      inList = false;
    }
  };

  const flushPre = () => {
    if (preContent.length > 0) {
      const code = preContent.join("\n").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      result.push(`<pre class="bg-stone-100 p-4 rounded-xl overflow-x-auto my-3"><code class="bg-transparent p-0 text-stone-700">${code}</code></pre>`);
      preContent = [];
      inPre = false;
    }
  };

  const processInline = (text: string): string => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong class=\"font-semibold text-stone-800\">$1</strong>")
      .replace(/\*(.*?)\*/g, "<em class=\"italic\">$1</em>")
      .replace(/`([^`]+)`/g, "<code class=\"bg-stone-100 px-1.5 py-0.5 rounded text-sm font-mono text-rose-600\">$1</code>");
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block handling
    if (line.startsWith("```")) {
      if (inPre) {
        flushPre();
      } else {
        flushList();
        inPre = true;
      }
      continue;
    }

    if (inPre) {
      preContent.push(line);
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      flushList();
      continue;
    }

    // Headings
    const h1Match = line.match(/^# (.*)$/);
    if (h1Match) {
      flushList();
      result.push(`<h1 class="text-2xl font-bold text-stone-800 mt-6 mb-4">${processInline(h1Match[1])}</h1>`);
      continue;
    }

    const h2Match = line.match(/^## (.*)$/);
    if (h2Match) {
      flushList();
      result.push(`<h2 class="text-xl font-bold text-stone-800 mt-5 mb-3">${processInline(h2Match[1])}</h2>`);
      continue;
    }

    const h3Match = line.match(/^### (.*)$/);
    if (h3Match) {
      flushList();
      result.push(`<h3 class="text-lg font-semibold text-stone-800 mt-4 mb-2">${processInline(h3Match[1])}</h3>`);
      continue;
    }

    // Blockquote
    const bqMatch = line.match(/^\> (.*)$/);
    if (bqMatch) {
      flushList();
      result.push(`<blockquote class="border-l-4 border-rose-300 pl-4 italic text-stone-600 my-3">${processInline(bqMatch[1])}</blockquote>`);
      continue;
    }

    // List items
    const liMatch = line.match(/^\- (.*)$/);
    if (liMatch) {
      inList = true;
      listItems.push(`<li class="mb-1">${processInline(liMatch[1])}</li>`);
      continue;
    }

    // Numbered list items
    const olMatch = line.match(/^\d+\.\s+(.*)$/);
    if (olMatch) {
      inList = true;
      listItems.push(`<li class="mb-1">${processInline(olMatch[1])}</li>`);
      continue;
    }

    // Regular paragraph
    flushList();
    result.push(`<p class="mb-3 leading-relaxed">${processInline(line)}</p>`);
  }

  flushList();
  flushPre();

  return result.join("\n");
}

// Extract the high-score essay section from markdown
function extractEssaySection(md: string): string | null {
  const match = md.match(/# 高分范文\s*\n([\s\S]*?)(?=\n# |$)/);
  return match ? match[1].trim() : null;
}

// ---------- Typewriter Hook ----------

function useTypewriter(text: string, speed: number = 12) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    if (!text) {
      setDisplayed("");
      setDone(false);
      indexRef.current = 0;
      return;
    }

    setDisplayed("");
    setDone(false);
    indexRef.current = 0;

    const interval = setInterval(() => {
      indexRef.current += 1;
      if (indexRef.current >= text.length) {
        setDisplayed(text);
        setDone(true);
        clearInterval(interval);
      } else {
        setDisplayed(text.slice(0, indexRef.current));
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return { displayed, done };
}

// ---------- Components ----------

function Header() {
  return (
    <header className="text-center py-10 px-4">
      <h1 className="text-3xl md:text-4xl font-bold text-stone-800 tracking-tight mb-2">
        🌷 六级作文小陪练
      </h1>
      <p className="text-stone-500 text-base md:text-lg">
        今天也离六级高分更近一步～
      </p>
    </header>
  );
}

function TopicCard({
  topic,
  onGenerate,
  loading,
}: {
  topic: TopicData | null;
  onGenerate: () => void;
  loading: boolean;
}) {
  return (
    <div className="card p-6 md:p-8 mb-6 animate-fadeIn">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-rose-400" />
          <h2 className="text-lg font-semibold text-stone-800">作文题目</h2>
        </div>
        <button
          onClick={onGenerate}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-400 hover:bg-rose-500 disabled:bg-rose-300 text-white rounded-full text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 shadow-sm"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin-slow" />
              生成中...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              随机生成作文题
            </>
          )}
        </button>
      </div>

      {topic && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-stone-50 rounded-xl p-4 border border-stone-100">
            <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">
              题目
            </p>
            <p className="font-serif text-lg text-stone-800 leading-relaxed">
              {topic.topic}
            </p>
          </div>

          <div className="bg-stone-50 rounded-xl p-4 border border-stone-100">
            <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">
              写作要求
            </p>
            <p className="text-stone-700 leading-relaxed">
              {topic.requirements}
            </p>
          </div>

          <div className="bg-stone-50 rounded-xl p-4 border border-stone-100">
            <p className="text-xs text-stone-400 uppercase tracking-wider mb-2">
              写作提纲
            </p>
            <ol className="list-decimal list-inside space-y-1.5 text-stone-700">
              {topic.outline.map((item, i) => (
                <li key={i} className="leading-relaxed">
                  {item}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {!topic && !loading && (
        <div className="text-center py-8 text-stone-400 text-sm">
          点击上方按钮生成一道作文题吧～
        </div>
      )}
    </div>
  );
}

function EssayInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const wordCount = countWords(value);

  return (
    <div className="card p-6 md:p-8 mb-6 animate-fadeIn">
      <div className="flex items-center gap-2 mb-4">
        <PenLine className="w-5 h-5 text-amber-400" />
        <h2 className="text-lg font-semibold text-stone-800">作文内容</h2>
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="请把你的作文粘贴到这里..."
        className="w-full h-64 p-4 bg-stone-50 border border-stone-200 rounded-xl text-stone-700 placeholder:text-stone-400 resize-none focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 transition-all font-serif text-base leading-relaxed"
      />

      <div className="flex items-center justify-between mt-3 px-1">
        <span className="text-sm text-stone-500">
          Word Count: <span className="font-medium text-stone-700">{wordCount}</span>
        </span>
        <span className={`text-sm font-medium ${getWordCountColor(wordCount)}`}>
          {getWordCountHint(wordCount)}
        </span>
      </div>
    </div>
  );
}

function GradeButton({
  onClick,
  loading,
  disabled,
}: {
  onClick: () => void;
  loading: boolean;
  disabled: boolean;
}) {
  return (
    <div className="flex justify-center mb-8">
      <button
        onClick={onClick}
        disabled={loading || disabled}
        className="inline-flex items-center gap-2 px-8 py-3.5 bg-amber-400 hover:bg-amber-500 disabled:bg-amber-200 text-white rounded-full text-base font-semibold transition-all duration-300 hover:-translate-y-0.5 shadow-md disabled:shadow-none disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin-slow" />
            老师正在认真阅读你的作文...
          </>
        ) : (
          <>
            <BookOpen className="w-5 h-5" />
            开始批改
          </>
        )}
      </button>
    </div>
  );
}

function ScoreBadge({ scoreText }: { scoreText: string }) {
  // Extract score like "12/15"
  const match = scoreText.match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+)/);
  const score = match ? match[1] : "?";
  const total = match ? match[2] : "15";

  return (
    <div className="flex flex-col items-center justify-center py-6 mb-4 bg-gradient-to-br from-rose-50 to-amber-50 rounded-2xl border border-rose-100">
      <span className="text-sm text-stone-500 mb-1">总评分</span>
      <div className="flex items-baseline gap-1">
        <span className="text-5xl font-bold text-rose-500">{score}</span>
        <span className="text-xl text-stone-400">/ {total}</span>
      </div>
      <span className="text-xs text-stone-400 mt-1">15分制</span>
    </div>
  );
}

function ResultCard({
  result,
  onCopy,
  copied,
}: {
  result: string;
  onCopy: () => void;
  copied: boolean;
}) {
  const { displayed, done } = useTypewriter(result, 10);

  // Split content to separate score section and the rest
  const scoreMatch = displayed.match(/^(.*?)# 总评分（15分制）\s*\n([\s\S]*?)(?=\n# |$)([\s\S]*)$/);
  
  let preScore = "";
  let scoreSection = "";
  let postScore = "";
  
  if (scoreMatch) {
    preScore = scoreMatch[1];
    scoreSection = scoreMatch[2];
    postScore = scoreMatch[3];
  } else {
    postScore = displayed;
  }

  // Extract essay for copy button
  const fullEssay = extractEssaySection(result);

  return (
    <div className="card p-6 md:p-8 mb-6 animate-fadeIn">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-rose-400" />
        <h2 className="text-lg font-semibold text-stone-800">批改结果</h2>
      </div>

      {preScore && (
        <div
          className="markdown-content"
          dangerouslySetInnerHTML={{ __html: markdownToHtml(preScore) }}
        />
      )}

      {scoreSection && <ScoreBadge scoreText={scoreSection} />}

      {postScore && (
        <div
          className="markdown-content"
          dangerouslySetInnerHTML={{ __html: markdownToHtml(postScore) }}
        />
      )}

      {/* Copy button for essay section - shown after typing completes */}
      {done && fullEssay && (
        <div className="mt-6 pt-4 border-t border-stone-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-stone-500">高分范文已生成完毕</span>
            <button
              onClick={onCopy}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-800 rounded-lg text-sm font-medium transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  已复制
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  复制范文
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {!done && (
        <div className="flex items-center gap-2 text-stone-400 text-sm mt-4">
          <span className="inline-block w-2 h-2 bg-rose-400 rounded-full animate-pulse" />
          正在逐字显示中...
        </div>
      )}
    </div>
  );
}

function Encouragement() {
  const [text, setText] = useState("");

  useEffect(() => {
    setText(ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]);
  }, []);

  return (
    <div className="text-center py-6 text-stone-500 text-sm animate-fadeIn">
      <p>{text}</p>
    </div>
  );
}

// ---------- Main Page ----------

export default function HomePage() {
  const [topic, setTopic] = useState<TopicData | null>(null);
  const [essay, setEssay] = useState("");
  const [topicLoading, setTopicLoading] = useState(false);
  const [gradeLoading, setGradeLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showEncouragement, setShowEncouragement] = useState(false);

  const generateTopic = useCallback(async () => {
    setTopicLoading(true);
    setError("");
    try {
      const res = await fetch("/api/topic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "生成题目失败");
      }
      setTopic(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "生成题目失败";
      setError(msg);
    } finally {
      setTopicLoading(false);
    }
  }, []);

  const gradeEssay = useCallback(async () => {
    if (!topic || !essay.trim()) return;
    setGradeLoading(true);
    setError("");
    setResult("");
    setShowEncouragement(false);

    try {
      const res = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.topic, essay }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "批改失败");
      }
      setResult(data.result || "");
      setShowEncouragement(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "批改失败";
      setError(msg);
    } finally {
      setGradeLoading(false);
    }
  }, [topic, essay]);

  const copyEssay = useCallback(() => {
    const essayText = extractEssaySection(result);
    if (essayText) {
      navigator.clipboard.writeText(essayText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [result]);

  return (
    <main className="min-h-screen bg-stone-50">
      <div className="max-w-2xl mx-auto px-4 pb-12">
        <Header />

        <TopicCard
          topic={topic}
          onGenerate={generateTopic}
          loading={topicLoading}
        />

        <EssayInput value={essay} onChange={setEssay} />

        <GradeButton
          onClick={gradeEssay}
          loading={gradeLoading}
          disabled={!topic || !essay.trim()}
        />

        {error && (
          <div className="card p-4 mb-6 bg-red-50 border-red-100 text-red-600 text-sm text-center animate-fadeIn">
            {error}
          </div>
        )}

        {result && (
          <ResultCard
            result={result}
            onCopy={copyEssay}
            copied={copied}
          />
        )}

        {showEncouragement && <Encouragement />}
      </div>
    </main>
  );  
}
fix regex
