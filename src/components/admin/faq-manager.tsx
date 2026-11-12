"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { FormField, inputClass } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { AdminCard } from "@/components/admin/admin-ui";

export interface FaqData {
  id: string;
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
}

export function FaqManager({ faqs }: { faqs: FaqData[] }) {
  const router = useRouter();
  const [items, setItems] = useState(faqs);
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      {items.map((f) => (
        <FaqRow
          key={f.id}
          faq={f}
          onSaved={(saved) => setItems(items.map((it) => (it.id === saved.id ? saved : it)))}
          onDeleted={() => {
            setItems(items.filter((it) => it.id !== f.id));
            router.refresh();
          }}
        />
      ))}

      {showNew ? (
        <NewFaqForm
          onCreated={(f) => {
            setItems([...items, f]);
            setShowNew(false);
            router.refresh();
          }}
          onCancel={() => setShowNew(false)}
        />
      ) : (
        <Button variant="outline" size="sm" onClick={() => setShowNew(true)} className="self-start">
          <Plus size={14} /> Add FAQ
        </Button>
      )}
    </div>
  );
}

function FaqRow({ faq, onSaved, onDeleted }: { faq: FaqData; onSaved: (f: FaqData) => void; onDeleted: () => void }) {
  const [values, setValues] = useState(faq);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof FaqData>(key: K, value: FaqData[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch(`/api/admin/faqs/${values.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      toast.error("Could not save");
      return;
    }
    toast.success("FAQ saved");
    onSaved(data);
  }

  async function handleDelete() {
    const res = await fetch(`/api/admin/faqs/${values.id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Could not delete");
      return;
    }
    toast.success("FAQ removed");
    onDeleted();
  }

  return (
    <AdminCard className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_140px]">
        <FormField label="Question">
          <input className={inputClass} value={values.question} onChange={(e) => set("question", e.target.value)} />
        </FormField>
        <FormField label="Category">
          <input className={inputClass} value={values.category} onChange={(e) => set("category", e.target.value)} />
        </FormField>
      </div>
      <FormField label="Answer">
        <textarea rows={2} className={inputClass} value={values.answer} onChange={(e) => set("answer", e.target.value)} />
      </FormField>
      <div className="flex items-center gap-4">
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
        <button onClick={handleDelete} className="flex items-center gap-1 text-xs text-red-500 hover:underline">
          <Trash2 size={13} /> Delete
        </button>
      </div>
    </AdminCard>
  );
}

function NewFaqForm({ onCreated, onCancel }: { onCreated: (f: FaqData) => void; onCancel: () => void }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("General");
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    setSaving(true);
    const res = await fetch("/api/admin/faqs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, answer, category, sortOrder: 0 }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      toast.error("Could not create FAQ");
      return;
    }
    toast.success("FAQ added");
    onCreated(data);
  }

  return (
    <AdminCard className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_140px]">
        <FormField label="Question">
          <input className={inputClass} value={question} onChange={(e) => setQuestion(e.target.value)} />
        </FormField>
        <FormField label="Category">
          <input className={inputClass} value={category} onChange={(e) => setCategory(e.target.value)} />
        </FormField>
      </div>
      <FormField label="Answer">
        <textarea rows={2} className={inputClass} value={answer} onChange={(e) => setAnswer(e.target.value)} />
      </FormField>
      <div className="flex items-center gap-3">
        <Button size="sm" onClick={handleCreate} disabled={saving}>
          {saving ? "Adding..." : "Add FAQ"}
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </AdminCard>
  );
}
