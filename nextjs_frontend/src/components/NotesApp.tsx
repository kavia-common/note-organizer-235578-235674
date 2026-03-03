"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { Note, Tag } from "@/lib/api";
import { createNote, deleteNote, listNotes, listTags, updateNote } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Pill } from "@/components/ui/Pill";
import { Textarea } from "@/components/ui/Textarea";

type Props = {
  onLogout: () => void;
};

/**
 * PUBLIC_INTERFACE
 * Main notes application UI (list/grid, sidebar tags, search, pinned/favorites, create/edit modal).
 */
export function NotesApp({ onLogout }: Props) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const [view, setView] = useState<"grid" | "list">("grid");

  const [tags, setTags] = useState<Tag[]>([]);
  const derivedTags = useMemo(() => {
    const map = new Map<string, number>();
    for (const n of notes) {
      for (const t of n.tags || []) map.set(t, (map.get(t) || 0) + 1);
    }
    const arr = Array.from(map.entries()).map(([name, count]) => ({ name, count }));
    arr.sort((a, b) => a.name.localeCompare(b.name));
    return arr;
  }, [notes]);

  const tagItems = tags.length ? tags : derivedTags;

  const pinned = useMemo(() => notes.filter((n) => n.pinned), [notes]);
  const favorites = useMemo(() => notes.filter((n) => n.favorite && !n.pinned), [notes]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return notes.filter((n) => {
      if (selectedTag && !(n.tags || []).includes(selectedTag)) return false;
      if (!q) return true;
      return (
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        (n.tags || []).join(" ").toLowerCase().includes(q)
      );
    });
  }, [notes, query, selectedTag]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Note | null>(null);

  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formTags, setFormTags] = useState("");
  const [formPinned, setFormPinned] = useState(false);
  const [formFavorite, setFormFavorite] = useState(false);

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const data = await listNotes({ q: query || undefined, tag: selectedTag || undefined });
      setNotes(Array.isArray(data) ? data : []);
      const t = await listTags();
      setTags(t);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to load notes from backend.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // initial load
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreate() {
    setEditing(null);
    setFormTitle("");
    setFormContent("");
    setFormTags("");
    setFormPinned(false);
    setFormFavorite(false);
    setFormError(null);
    setModalOpen(true);
  }

  function openEdit(note: Note) {
    setEditing(note);
    setFormTitle(note.title || "");
    setFormContent(note.content || "");
    setFormTags((note.tags || []).join(", "));
    setFormPinned(!!note.pinned);
    setFormFavorite(!!note.favorite);
    setFormError(null);
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;
    setModalOpen(false);
  }

  function parseTags(text: string): string[] {
    const tags = text
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    // unique
    return Array.from(new Set(tags));
  }

  async function submitNote() {
    setFormError(null);
    if (!formTitle.trim()) {
      setFormError("Title is required.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: formTitle.trim(),
        content: formContent.trim(),
        tags: parseTags(formTags),
        pinned: formPinned,
        favorite: formFavorite,
      };

      if (editing) {
        const updated = await updateNote(editing.id, payload);
        setNotes((prev) => prev.map((n) => (n.id === editing.id ? updated : n)));
      } else {
        const created = await createNote(payload);
        setNotes((prev) => [created, ...prev]);
      }

      setModalOpen(false);
      // refresh tags counts
      const t = await listTags();
      setTags(t);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to save note.";
      setFormError(message);
    } finally {
      setSaving(false);
    }
  }

  async function togglePin(note: Note) {
    try {
      const updated = await updateNote(note.id, { pinned: !note.pinned });
      setNotes((prev) => prev.map((n) => (n.id === note.id ? updated : n)));
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to update note.";
      setError(message);
    }
  }

  async function toggleFav(note: Note) {
    try {
      const updated = await updateNote(note.id, { favorite: !note.favorite });
      setNotes((prev) => prev.map((n) => (n.id === note.id ? updated : n)));
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to update note.";
      setError(message);
    }
  }

  async function remove(note: Note) {
    if (!confirm(`Delete "${note.title}"?`)) return;
    try {
      await deleteNote(note.id);
      setNotes((prev) => prev.filter((n) => n.id !== note.id));
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to delete note.";
      setError(message);
    }
  }

  function NotesSection({ title, items }: { title: string; items: Note[] }) {
    if (!items.length) return null;

    return (
      <section className="mb-6">
        <div className="mb-2 flex items-center justify-between gap-3">
          <h2 className="text-sm font-extrabold tracking-wide">{title}</h2>
          <div className="text-xs opacity-70">{items.length}</div>
        </div>
        <div className={view === "grid" ? "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3" : "space-y-2"}>
          {items.map((n) => (
            <article
              key={String(n.id)}
              className="rounded-lg border-2 border-black bg-[var(--surface)] p-3 shadow-[4px_4px_0_0_#000]"
            >
              <header className="flex items-start justify-between gap-2">
                <button
                  className="text-left"
                  onClick={() => openEdit(n)}
                  aria-label={`Edit note ${n.title}`}
                >
                  <div className="text-sm font-extrabold leading-tight">{n.title}</div>
                  <div className="mt-1 line-clamp-3 text-xs opacity-80">{n.content}</div>
                </button>
                <div className="flex shrink-0 flex-col gap-1">
                  <Button size="sm" variant="ghost" onClick={() => togglePin(n)}>
                    {n.pinned ? "Unpin" : "Pin"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => toggleFav(n)}>
                    {n.favorite ? "Unfave" : "Fave"}
                  </Button>
                </div>
              </header>

              <div className="mt-2 flex flex-wrap gap-2">
                {(n.tags || []).slice(0, 6).map((t) => (
                  <Pill key={t} onClick={() => setSelectedTag(t)} title="Filter by tag">
                    #{t}
                  </Pill>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="text-[10px] font-semibold opacity-70">
                  ID: {String(n.id)}
                </div>
                <Button size="sm" variant="danger" onClick={() => remove(n)}>
                  Delete
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <header className="sticky top-0 z-40 border-b-2 border-black bg-[var(--surface)] shadow-[0_4px_0_0_#000]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="rounded-md border-2 border-black bg-[var(--accent)] px-2 py-1 text-xs font-extrabold text-black shadow-[2px_2px_0_0_#000]">
              NOTE-OS
            </div>
            <div>
              <div className="text-sm font-extrabold leading-tight">Retro Notes</div>
              <div className="text-xs opacity-70">Fast + crunchy UI. Search, tags, pin, favorite.</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => setView((v) => (v === "grid" ? "list" : "grid"))}>
              View: {view === "grid" ? "Grid" : "List"}
            </Button>
            <Button onClick={openCreate}>+ New Note</Button>
            <Button variant="ghost" onClick={onLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 py-4 md:grid-cols-[260px_1fr]">
        <aside className="rounded-lg border-2 border-black bg-[var(--surface)] p-3 shadow-[6px_6px_0_0_#000]">
          <div className="text-xs font-extrabold tracking-wide">FILTERS</div>

          <div className="mt-3 space-y-3">
            <Input
              label="Search"
              placeholder="title, content, tags..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={refresh} disabled={loading}>
                {loading ? "Loading..." : "Refresh"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedTag(null);
                  setQuery("");
                }}
              >
                Clear
              </Button>
            </div>

            <div>
              <div className="mb-2 text-xs font-extrabold">Tags</div>
              <div className="flex flex-wrap gap-2">
                <Pill active={!selectedTag} onClick={() => setSelectedTag(null)}>
                  All
                </Pill>
                {tagItems.map((t) => (
                  <Pill
                    key={t.name}
                    active={selectedTag === t.name}
                    onClick={() => setSelectedTag((cur) => (cur === t.name ? null : t.name))}
                    title="Toggle tag filter"
                  >
                    #{t.name}
                    {typeof t.count === "number" ? ` (${t.count})` : ""}
                  </Pill>
                ))}
              </div>
            </div>

            <div className="rounded-md border-2 border-black bg-[var(--surface2)] p-2 text-xs shadow-[2px_2px_0_0_#000]">
              <div className="font-extrabold">Tip</div>
              <div className="mt-1 opacity-80">
                Use <span className="font-semibold">Pin</span> for “sticky” notes and{" "}
                <span className="font-semibold">Fave</span> for quick access.
              </div>
            </div>
          </div>
        </aside>

        <section>
          {error ? (
            <div
              role="alert"
              className="mb-4 rounded-lg border-2 border-black bg-[var(--danger)] p-3 text-sm font-semibold shadow-[4px_4px_0_0_#000]"
            >
              {error}
            </div>
          ) : null}

          <NotesSection title="Pinned" items={pinned} />
          <NotesSection title="Favorites" items={favorites} />

          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-extrabold tracking-wide">
              Notes {selectedTag ? `(tag: #${selectedTag})` : ""}
            </h2>
            <div className="text-xs opacity-70">{filtered.length} shown</div>
          </div>

          {loading ? (
            <div className="rounded-lg border-2 border-black bg-[var(--surface)] p-4 shadow-[6px_6px_0_0_#000]">
              <div className="text-sm font-extrabold">Loading notes...</div>
              <div className="mt-1 text-xs opacity-70">Contacting backend API.</div>
            </div>
          ) : filtered.length ? (
            <div className={view === "grid" ? "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3" : "space-y-2"}>
              {filtered.map((n) => (
                <article
                  key={String(n.id)}
                  className="rounded-lg border-2 border-black bg-[var(--surface)] p-3 shadow-[4px_4px_0_0_#000]"
                >
                  <header className="flex items-start justify-between gap-2">
                    <button className="text-left" onClick={() => openEdit(n)}>
                      <div className="text-sm font-extrabold leading-tight">{n.title}</div>
                      <div className="mt-1 line-clamp-3 text-xs opacity-80">{n.content}</div>
                    </button>
                    <div className="flex shrink-0 flex-col gap-1">
                      <Button size="sm" variant="ghost" onClick={() => togglePin(n)}>
                        {n.pinned ? "Unpin" : "Pin"}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => toggleFav(n)}>
                        {n.favorite ? "Unfave" : "Fave"}
                      </Button>
                    </div>
                  </header>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {(n.tags || []).slice(0, 6).map((t) => (
                      <Pill key={t} onClick={() => setSelectedTag(t)}>
                        #{t}
                      </Pill>
                    ))}
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-[10px] font-semibold opacity-70">
                      {n.pinned ? "PINNED" : n.favorite ? "FAVORITE" : "—"}
                    </div>
                    <Button size="sm" variant="danger" onClick={() => remove(n)}>
                      Delete
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border-2 border-black bg-[var(--surface)] p-4 shadow-[6px_6px_0_0_#000]">
              <div className="text-sm font-extrabold">No notes found.</div>
              <div className="mt-1 text-xs opacity-70">
                Try clearing filters, or create your first note.
              </div>
              <div className="mt-3">
                <Button onClick={openCreate}>+ New Note</Button>
              </div>
            </div>
          )}
        </section>
      </main>

      <Modal
        open={modalOpen}
        title={editing ? "Edit Note" : "Create Note"}
        onClose={closeModal}
        footer={
          <>
            <Button variant="ghost" onClick={closeModal} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={submitNote} disabled={saving}>
              {saving ? "Saving..." : editing ? "Save Changes" : "Create Note"}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-3">
          <Input
            label="Title"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            placeholder="e.g. Fix spaceship UI"
          />
          <Textarea
            label="Content"
            value={formContent}
            onChange={(e) => setFormContent(e.target.value)}
            placeholder="Write your note..."
          />
          <Input
            label="Tags (comma-separated)"
            value={formTags}
            onChange={(e) => setFormTags(e.target.value)}
            placeholder="retro, work, idea"
            hint="Example: retro, work, idea"
          />

          <div className="flex flex-wrap items-center gap-2">
            <Pill active={formPinned} onClick={() => setFormPinned((v) => !v)}>
              {formPinned ? "Pinned ✓" : "Pin"}
            </Pill>
            <Pill active={formFavorite} onClick={() => setFormFavorite((v) => !v)}>
              {formFavorite ? "Favorite ✓" : "Favorite"}
            </Pill>
          </div>

          {formError ? (
            <div
              role="alert"
              className="rounded-md border-2 border-black bg-[var(--danger)] px-3 py-2 text-sm font-semibold"
            >
              {formError}
            </div>
          ) : null}
        </div>
      </Modal>
    </div>
  );
}
