"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { EMPTY_PROGRAM_EVENT, joinCoupleNames, splitCoupleNames } from "./content";
import type { ContactPerson, InvitationFormState, ProgramEvent } from "./types";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</Label>
      {children}
    </div>
  );
}

function updateEvent(form: InvitationFormState, idx: number, patch: Partial<ProgramEvent>): ProgramEvent[] {
  const arr = [...(form.program_events || [])];
  while (arr.length <= idx) arr.push({ ...EMPTY_PROGRAM_EVENT });
  arr[idx] = { ...arr[idx], ...patch };
  return arr;
}

function ContactsEditor({
  label,
  contacts,
  onChange,
}: {
  label: string;
  contacts: ContactPerson[];
  onChange: (v: ContactPerson[]) => void;
}) {
  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
        <Button type="button" size="sm" variant="outline" className="rounded-full text-[11px] h-7" onClick={() => onChange([...(contacts || []), { name: "", phones: [""] }])}>+ Add</Button>
      </div>
      {(contacts || []).map((person, idx) => (
        <div key={idx} className="space-y-2">
          <div className="flex gap-2">
            <Input value={person.name} onChange={(e) => { const arr = [...contacts]; arr[idx] = { ...arr[idx], name: e.target.value }; onChange(arr); }} placeholder="Name" className="h-8 text-xs" />
            <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={() => { const arr = [...contacts]; arr.splice(idx, 1); onChange(arr); }}><X className="h-3.5 w-3.5" /></Button>
          </div>
          {(person.phones || []).map((phone, pidx) => (
            <Input key={pidx} value={phone} onChange={(e) => { const arr = [...contacts]; const phones = [...(arr[idx].phones || [])]; phones[pidx] = e.target.value; arr[idx] = { ...arr[idx], phones }; onChange(arr); }} placeholder="Phone" className="h-8 text-xs" />
          ))}
        </div>
      ))}
    </section>
  );
}

export function InvitationForm({ form, setForm }: { form: InvitationFormState; setForm: (updater: (f: InvitationFormState) => InvitationFormState) => void }) {
  const rwNames = splitCoupleNames(form.couple_names);
  const enNames = splitCoupleNames(form.couple_names_en);
  const events = form.program_events?.length ? form.program_events : [{ ...EMPTY_PROGRAM_EVENT }, { ...EMPTY_PROGRAM_EVENT }];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="rounded-2xl border border-slate-100 bg-white p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Ubutumire</p>
          <Field label="Subject">
            <Textarea value={form.bible_verse_rw} onChange={(e) => setForm((f) => ({ ...f, bible_verse_rw: e.target.value }))} rows={4} />
          </Field>
          <Field label="Description">
            <Textarea value={form.description_rw} onChange={(e) => setForm((f) => ({ ...f, description_rw: e.target.value }))} rows={5} />
          </Field>
          <Field label="Couple name">
            <div className="space-y-2">
              <Input value={rwNames.left} onChange={(e) => setForm((f) => ({ ...f, couple_names: joinCoupleNames(e.target.value, splitCoupleNames(f.couple_names).right) }))} className="h-10" />
              <p className="text-center text-slate-400 text-sm">&amp;</p>
              <Input value={rwNames.right} onChange={(e) => setForm((f) => ({ ...f, couple_names: joinCoupleNames(splitCoupleNames(f.couple_names).left, e.target.value) }))} className="h-10" />
            </div>
          </Field>
          <Field label="Date">
            <Textarea value={form.wedding_date} onChange={(e) => setForm((f) => ({ ...f, wedding_date: e.target.value }))} rows={2} />
          </Field>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Invitation</p>
          <Field label="Subject">
            <Textarea value={form.bible_verse_en} onChange={(e) => setForm((f) => ({ ...f, bible_verse_en: e.target.value }))} rows={4} />
          </Field>
          <Field label="Description">
            <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={5} />
          </Field>
          <Field label="Couple name">
            <div className="space-y-2">
              <Input value={enNames.left} onChange={(e) => setForm((f) => ({ ...f, couple_names_en: joinCoupleNames(e.target.value, splitCoupleNames(f.couple_names_en).right) }))} className="h-10" />
              <p className="text-center text-slate-400 text-sm">&amp;</p>
              <Input value={enNames.right} onChange={(e) => setForm((f) => ({ ...f, couple_names_en: joinCoupleNames(splitCoupleNames(f.couple_names_en).left, e.target.value) }))} className="h-10" />
            </div>
          </Field>
          <Field label="Date">
            <Textarea value={form.wedding_date_en} onChange={(e) => setForm((f) => ({ ...f, wedding_date_en: e.target.value }))} rows={2} />
          </Field>
        </section>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-4 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Schedule time and description</p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-full text-xs"
            onClick={() => setForm((f) => ({ ...f, program_events: [...(f.program_events || []), { ...EMPTY_PROGRAM_EVENT }] }))}
          >
            + Schedule
          </Button>
        </div>
        {events.map((ev, idx) => (
          <div key={idx} className="rounded-xl border border-slate-100 p-3 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Schedule {idx + 1}</p>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                disabled={events.length <= 1}
                onClick={() => {
                  const arr = [...events];
                  arr.splice(idx, 1);
                  setForm((f) => ({ ...f, program_events: arr }));
                }}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Ubutumire</p>
                <Input value={ev.time || ""} onChange={(e) => setForm((f) => ({ ...f, program_events: updateEvent(f, idx, { time: e.target.value }) }))} placeholder="Time" className="h-9 text-sm" />
                <Textarea value={ev.event || ""} onChange={(e) => setForm((f) => ({ ...f, program_events: updateEvent(f, idx, { event: e.target.value }) }))} placeholder="Description" rows={3} />
              </div>
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Invitation</p>
                <Input value={ev.time_en || ""} onChange={(e) => setForm((f) => ({ ...f, program_events: updateEvent(f, idx, { time_en: e.target.value }) }))} placeholder="Time" className="h-9 text-sm" />
                <Textarea value={ev.event_en || ""} onChange={(e) => setForm((f) => ({ ...f, program_events: updateEvent(f, idx, { event_en: e.target.value }) }))} placeholder="Description" rows={3} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="rounded-2xl border border-slate-100 bg-white p-4 space-y-3">
          <Field label="Conclusion">
            <Textarea value={form.invitation_note} onChange={(e) => setForm((f) => ({ ...f, invitation_note: e.target.value }))} rows={3} />
          </Field>
          <Field label="Note">
            <Textarea value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} rows={2} />
          </Field>
        </section>
        <section className="rounded-2xl border border-slate-100 bg-white p-4 space-y-3">
          <Field label="Conclusion">
            <Textarea value={form.invitation_note_en} onChange={(e) => setForm((f) => ({ ...f, invitation_note_en: e.target.value }))} rows={3} />
          </Field>
          <Field label="Note">
            <Textarea value={form.rsvp_details} onChange={(e) => setForm((f) => ({ ...f, rsvp_details: e.target.value }))} rows={2} />
          </Field>
        </section>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-4 space-y-3">
        <Field label="Venue">
          <Textarea value={form.venue} onChange={(e) => setForm((f) => ({ ...f, venue: e.target.value }))} rows={2} />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ContactsEditor label="Contacts (left)" contacts={form.bride_contacts} onChange={(v) => setForm((f) => ({ ...f, bride_contacts: v }))} />
        <ContactsEditor label="Contacts (right)" contacts={form.groom_contacts} onChange={(v) => setForm((f) => ({ ...f, groom_contacts: v }))} />
      </div>
    </div>
  );
}
