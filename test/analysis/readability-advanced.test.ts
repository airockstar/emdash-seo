import { describe, it, expect } from "vitest";
import {
  checkPassiveVoice,
  checkSentenceLength,
  checkTransitionWords,
  checkParagraphLength,
} from "../../src/analysis/readability.js";

describe("checkPassiveVoice", () => {
  it("passes when passive voice usage is low", () => {
    const text = "The team builds great products. They ship fast. They iterate quickly. They test everything. They deploy often. They monitor closely. They fix bugs. They write docs. They review code. They plan sprints.";
    const result = checkPassiveVoice(text);
    expect(result.status).toBe("pass");
  });

  it("warns when passive voice usage exceeds 10%", () => {
    // Every sentence is passive
    const text = "The code was reviewed. The tests were executed. The bugs were fixed. The docs were written. The feature was shipped. The app was deployed. The data was collected. The report was generated. The issue was resolved. The task was completed.";
    const result = checkPassiveVoice(text);
    expect(result.status).toBe("warn");
    expect(result.message).toContain("passive voice");
  });

  it("passes for short text", () => {
    const result = checkPassiveVoice("Short text.");
    expect(result.status).toBe("pass");
  });

  it("has correct id", () => {
    const result = checkPassiveVoice("The code was reviewed by the team and they approved it quickly enough.");
    expect(result.id).toBe("passive-voice");
  });
});

describe("checkSentenceLength", () => {
  it("passes when most sentences are short", () => {
    const text = "Keep it simple. Write short sentences. Readers appreciate clarity. Brevity is key. Short is good. Clear writing wins. Focus on the point. Remove filler words. Stay on topic. Be direct.";
    const result = checkSentenceLength(text);
    expect(result.status).toBe("pass");
  });

  it("warns when too many sentences are long", () => {
    const sentences = Array(10).fill(
      "This is a very long sentence that contains many many many many many many many many many many many many words in it to exceed the twenty word limit easily"
    );
    const text = sentences.join(". ") + ".";
    const result = checkSentenceLength(text);
    expect(result.status).toBe("warn");
    expect(result.message).toContain("over 20 words");
  });

  it("passes for short text", () => {
    const result = checkSentenceLength("Short.");
    expect(result.status).toBe("pass");
  });

  it("has correct id", () => {
    const result = checkSentenceLength("This is a sentence that is just about right for testing purposes in this context here.");
    expect(result.id).toBe("sentence-length");
  });
});

describe("checkTransitionWords", () => {
  it("passes when sufficient transition words are used", () => {
    const text = "However, this is important. Therefore, we should act. Moreover, the data supports this. Furthermore, experts agree. Additionally, the cost is low. Consequently, we proceed. Meanwhile, the team prepares. Nevertheless, risks exist. Although it is hard, we succeed. Also this matters.";
    const result = checkTransitionWords(text);
    expect(result.status).toBe("pass");
  });

  it("warns when too few transition words are used", () => {
    const text = "The sky is blue. The grass is green. Water is wet. Fire is hot. Ice is cold. Snow is white. Rain falls down. Wind blows hard. Sun shines bright. Stars twinkle.";
    const result = checkTransitionWords(text);
    expect(result.status).toBe("warn");
    expect(result.message).toContain("transition words");
  });

  it("passes for short text", () => {
    const result = checkTransitionWords("Short.");
    expect(result.status).toBe("pass");
  });

  it("has correct id", () => {
    const result = checkTransitionWords("This is enough text to actually run the analysis on it reliably.");
    expect(result.id).toBe("transition-words");
  });
});

describe("checkParagraphLength", () => {
  it("passes when paragraphs are short", () => {
    const text = "First paragraph with just a few words.\n\nSecond paragraph also short.";
    const result = checkParagraphLength(text);
    expect(result.status).toBe("pass");
  });

  it("warns when a paragraph exceeds 150 words", () => {
    const longParagraph = Array(160).fill("word").join(" ");
    const text = "Short intro.\n\n" + longParagraph;
    const result = checkParagraphLength(text);
    expect(result.status).toBe("warn");
    expect(result.message).toContain("150 words");
  });

  it("passes for short text", () => {
    const result = checkParagraphLength("Short.");
    expect(result.status).toBe("pass");
  });

  it("has correct id", () => {
    const result = checkParagraphLength("This is a paragraph that is long enough to test the check properly here.");
    expect(result.id).toBe("paragraph-length");
  });

  it("counts multiple long paragraphs", () => {
    const longParagraph = Array(160).fill("word").join(" ");
    const text = longParagraph + "\n\n" + longParagraph;
    const result = checkParagraphLength(text);
    expect(result.status).toBe("warn");
    expect(result.message).toContain("2 paragraph(s)");
  });
});
