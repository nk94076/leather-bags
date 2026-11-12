"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { FormField, inputClass } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { AdminCard } from "@/components/admin/admin-ui";

interface LegalSection {
  heading: string;
  body: string;
}

interface AboutContent {
  hero: { title: string; subtitle: string };
  sections: LegalSection[];
  stats: { label: string; value: string }[];
}

interface LegalContent {
  updatedAt: string;
  sections: LegalSection[];
}

interface ContactContent {
  intro: string;
  hours: string;
}

export function CmsPageEditor({
  slug,
  title: initialTitle,
  metaTitle: initialMetaTitle,
  metaDesc: initialMetaDesc,
  content,
}: {
  slug: string;
  title: string;
  metaTitle: string;
  metaDesc: string;
  content: unknown;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [metaTitle, setMetaTitle] = useState(initialMetaTitle);
  const [metaDesc, setMetaDesc] = useState(initialMetaDesc);
  const [saving, setSaving] = useState(false);

  const [aboutContent, setAboutContent] = useState<AboutContent | null>(slug === "about-us" ? (content as AboutContent) : null);
  const [contactContent, setContactContent] = useState<ContactContent | null>(
    slug === "contact-us" ? (content as ContactContent) : null
  );
  const [legalContent, setLegalContent] = useState<LegalContent | null>(
    slug !== "about-us" && slug !== "contact-us" ? (content as LegalContent) : null
  );

  async function handleSave() {
    setSaving(true);
    const finalContent = aboutContent ?? contactContent ?? legalContent;
    const res = await fetch(`/api/admin/pages/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, metaTitle, metaDesc, content: finalContent }),
    });
    setSaving(false);
    if (!res.ok) {
      toast.error("Could not save page");
      return;
    }
    toast.success("Page updated");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminCard>
        <h2 className="mb-4 font-display text-lg text-brand-ink">Page Settings</h2>
        <div className="flex flex-col gap-4">
          <FormField label="Page Title">
            <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} />
          </FormField>
          <FormField label="Meta Title (SEO)">
            <input className={inputClass} value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
          </FormField>
          <FormField label="Meta Description (SEO)">
            <textarea rows={2} className={inputClass} value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} />
          </FormField>
        </div>
      </AdminCard>

      {aboutContent && (
        <>
          <AdminCard>
            <h2 className="mb-4 font-display text-lg text-brand-ink">Hero</h2>
            <div className="flex flex-col gap-4">
              <FormField label="Hero Title">
                <input
                  className={inputClass}
                  value={aboutContent.hero.title}
                  onChange={(e) => setAboutContent({ ...aboutContent, hero: { ...aboutContent.hero, title: e.target.value } })}
                />
              </FormField>
              <FormField label="Hero Subtitle">
                <textarea
                  rows={2}
                  className={inputClass}
                  value={aboutContent.hero.subtitle}
                  onChange={(e) => setAboutContent({ ...aboutContent, hero: { ...aboutContent.hero, subtitle: e.target.value } })}
                />
              </FormField>
            </div>
          </AdminCard>

          <AdminCard>
            <h2 className="mb-4 font-display text-lg text-brand-ink">Stats</h2>
            <div className="flex flex-col gap-3">
              {aboutContent.stats.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    className={inputClass}
                    placeholder="Value (e.g. 10+)"
                    value={s.value}
                    onChange={(e) => {
                      const stats = [...aboutContent.stats];
                      stats[i] = { ...stats[i], value: e.target.value };
                      setAboutContent({ ...aboutContent, stats });
                    }}
                  />
                  <input
                    className={inputClass}
                    placeholder="Label"
                    value={s.label}
                    onChange={(e) => {
                      const stats = [...aboutContent.stats];
                      stats[i] = { ...stats[i], label: e.target.value };
                      setAboutContent({ ...aboutContent, stats });
                    }}
                  />
                  <button
                    onClick={() => setAboutContent({ ...aboutContent, stats: aboutContent.stats.filter((_, idx) => idx !== i) })}
                    className="text-black/30 hover:text-red-500"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setAboutContent({ ...aboutContent, stats: [...aboutContent.stats, { label: "New Stat", value: "0" }] })}
                className="flex items-center gap-1 self-start text-xs font-medium text-brand-primary hover:underline"
              >
                <Plus size={13} /> Add Stat
              </button>
            </div>
          </AdminCard>

          <SectionsEditor
            sections={aboutContent.sections}
            onChange={(sections) => setAboutContent({ ...aboutContent, sections })}
          />
        </>
      )}

      {contactContent && (
        <AdminCard>
          <h2 className="mb-4 font-display text-lg text-brand-ink">Contact Info</h2>
          <div className="flex flex-col gap-4">
            <FormField label="Intro Text">
              <textarea
                rows={2}
                className={inputClass}
                value={contactContent.intro}
                onChange={(e) => setContactContent({ ...contactContent, intro: e.target.value })}
              />
            </FormField>
            <FormField label="Business Hours">
              <input
                className={inputClass}
                value={contactContent.hours}
                onChange={(e) => setContactContent({ ...contactContent, hours: e.target.value })}
              />
            </FormField>
          </div>
        </AdminCard>
      )}

      {legalContent && (
        <SectionsEditor sections={legalContent.sections} onChange={(sections) => setLegalContent({ ...legalContent, sections })} />
      )}

      <Button onClick={handleSave} disabled={saving} className="self-start">
        {saving ? "Saving..." : "Save Page"}
      </Button>
    </div>
  );
}

function SectionsEditor({ sections, onChange }: { sections: LegalSection[]; onChange: (s: LegalSection[]) => void }) {
  return (
    <AdminCard>
      <h2 className="mb-4 font-display text-lg text-brand-ink">Content Sections</h2>
      <div className="flex flex-col gap-5">
        {sections.map((s, i) => (
          <div key={i} className="rounded-xl border border-black/10 p-4">
            <div className="mb-2 flex items-center justify-between">
              <input
                className={`${inputClass} font-medium`}
                value={s.heading}
                onChange={(e) => {
                  const next = [...sections];
                  next[i] = { ...next[i], heading: e.target.value };
                  onChange(next);
                }}
              />
              <button onClick={() => onChange(sections.filter((_, idx) => idx !== i))} className="ml-2 text-black/30 hover:text-red-500">
                <Trash2 size={15} />
              </button>
            </div>
            <textarea
              rows={3}
              className={inputClass}
              value={s.body}
              onChange={(e) => {
                const next = [...sections];
                next[i] = { ...next[i], body: e.target.value };
                onChange(next);
              }}
            />
          </div>
        ))}
        <button
          onClick={() => onChange([...sections, { heading: "New Section", body: "" }])}
          className="flex items-center gap-1 self-start text-xs font-medium text-brand-primary hover:underline"
        >
          <Plus size={13} /> Add Section
        </button>
      </div>
    </AdminCard>
  );
}
