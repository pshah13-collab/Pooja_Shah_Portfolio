export type Question = { id: string; text: string; done: boolean };

const STORAGE_KEY = "meet-questions";

function isQuestion(value: unknown): value is Question {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Question).id === "string" &&
    typeof (value as Question).text === "string"
  );
}

/**
 * Reads the visitor's notepad from localStorage.
 * corrupt = true means the saved data was unreadable and had to be dropped.
 */
export function loadQuestions(): { questions: Question[]; corrupt: boolean } {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { questions: [], corrupt: false };
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return { questions: [], corrupt: true };

    const questions: Question[] = [];
    for (const entry of parsed) {
      if (isQuestion(entry)) {
        questions.push({
          id: entry.id,
          text: entry.text,
          done: Boolean(entry.done),
        });
      }
    }
    return { questions, corrupt: questions.length !== parsed.length };
  } catch {
    return { questions: [], corrupt: true };
  }
}

export function saveQuestions(questions: Question[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
  } catch {
    // storage unavailable (private mode) — notepad just won't persist
  }
}

/** Open (un-asked) questions as "- question" lines, for the booking form draft. */
export function loadOpenQuestionLines(): string {
  const { questions } = loadQuestions();
  return questions
    .filter((q) => !q.done && q.text.trim())
    .map((q) => `- ${q.text.trim()}`)
    .join("\n");
}
