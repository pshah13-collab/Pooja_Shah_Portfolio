"use client";

import { useEffect, useState } from "react";
import { loadQuestions, saveQuestions, type Question } from "@/lib/notepad";
import { inputClasses } from "@/lib/ui";

export function MeetNotepad() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [warning, setWarning] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const { questions: loadedQuestions, corrupt } = loadQuestions();
      setQuestions(loadedQuestions);
      setLoaded(true);
      if (corrupt) {
        setWarning(
          "⚠ your saved notes were unreadable, so the notepad started fresh.",
        );
        saveQuestions(loadedQuestions);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveQuestions(questions);
  }, [questions, loaded]);

  function addQuestion(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    if (text.length > 300) {
      setQuestions((prev) => [
        { id: crypto.randomUUID(), text: `${text.slice(0, 297)}...`, done: false },
        ...prev,
      ]);
    } else {
      setQuestions((prev) => [
        { id: crypto.randomUUID(), text, done: false },
        ...prev,
      ]);
    }
    setDraft("");
  }

  function toggle(id: string) {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, done: !q.done } : q)),
    );
  }

  function startEdit(question: Question) {
    setEditingId(question.id);
    setEditText(question.text);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditText("");
  }

  function saveEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingId) return;
    const text = editText.trim();
    if (text) {
      setQuestions((prev) =>
        prev.map((q) => (q.id === editingId ? { ...q, text } : q)),
      );
    }
    cancelEdit();
  }

  function remove(id: string) {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    if (editingId === id) cancelEdit();
  }

  return (
    <div className="rounded-lg border border-accent/20 bg-black/30 p-4 sm:p-5">
      {warning && (
        <p className="mb-4 flex items-start justify-between gap-3 rounded-lg border border-highlight/40 bg-highlight/10 px-3 py-2 text-sm text-highlight">
          <span>{warning}</span>
          <button
            type="button"
            onClick={() => setWarning(null)}
            aria-label="dismiss warning"
            className="shrink-0 text-highlight transition-opacity hover:opacity-70"
          >
            [x]
          </button>
        </p>
      )}
      <form onSubmit={addQuestion} className="flex gap-2" noValidate>
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={300}
          placeholder="e.g. ask about Tokenly"
          className={inputClasses}
        />
        <button
          type="submit"
          className="shrink-0 rounded-md border border-accent/40 bg-accent/10 px-4 py-2 text-sm text-accent-bright transition-colors hover:bg-accent/20"
        >
          add
        </button>
      </form>

      {questions.length === 0 ? (
        <div className="mt-4 rounded-md border border-dashed border-accent/25 px-3 py-4 text-center">
          <p className="text-sm text-foreground/60">no questions yet</p>
          <p className="mt-1 text-xs text-foreground/40">
            jot down what you want to ask in the chat — saved in your browser,
            just for you.
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs">
            {["ask about Tokenly", "ask about availability", "walk me through Bronco Health"].map(
              (example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() =>
                    setQuestions((prev) => [
                      { id: crypto.randomUUID(), text: example, done: false },
                      ...prev,
                    ])
                  }
                  className="rounded border border-accent/25 bg-accent/5 px-2 py-1 text-accent-bright transition-colors hover:bg-accent/15"
                >
                  {example}
                </button>
              ),
            )}
          </div>
        </div>
      ) : (
        <ul className="mt-4 space-y-2 text-sm">
          {questions.map((question) => (
            <li key={question.id} className="flex items-start gap-2">
              {editingId === question.id ? (
                <>
                  <span className="mt-0.5 text-accent" aria-hidden>
                    &gt;
                  </span>
                  <form onSubmit={saveEdit} className="flex min-w-0 flex-1 gap-2" noValidate>
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      maxLength={300}
                      autoFocus
                      className={inputClasses}
                    />
                    <button
                      type="submit"
                      className="shrink-0 text-xs text-accent-bright transition-colors hover:text-accent"
                    >
                      [ save ]
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="shrink-0 text-xs text-foreground/60 transition-colors hover:text-foreground"
                    >
                      [ cancel ]
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => toggle(question.id)}
                    aria-label={question.done ? "mark as open" : "mark as asked"}
                    className={`mt-0.5 text-accent transition-colors ${
                      question.done ? "opacity-50" : ""
                    }`}
                  >
                    {question.done ? "[x]" : "[ ]"}
                  </button>
                  <span
                    className={`min-w-0 flex-1 ${
                      question.done
                        ? "text-foreground/40 line-through"
                        : "text-foreground/80"
                    }`}
                  >
                    {question.text}
                  </span>
                  <span className="flex shrink-0 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => startEdit(question)}
                      aria-label="edit question"
                      className="text-accent-bright transition-colors hover:text-accent"
                    >
                      [ edit ]
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(question.id)}
                      aria-label="remove question"
                      className="text-highlight transition-opacity hover:opacity-80"
                    >
                      [x]
                    </button>
                  </span>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
