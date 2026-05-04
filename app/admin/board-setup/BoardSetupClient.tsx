// =====================================================================
// app/admin/board-setup/BoardSetupClient.tsx
// Client Component — board member management + config per association
// =====================================================================

'use client';

import { useState, useEffect, useCallback } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Association {
  association_code: string;
  association_name: string;
}

interface BoardMember {
  id: string;
  association_code: string;
  name: string;
  email: string;
  role: string | null;
  sort_order: number;
  active: boolean;
  substitute_name: string | null;
  substitute_email: string | null;
  substitute_active: boolean;
}

interface BoardConfig {
  required_signatures: number;
  approval_letter_template: string | null;
}

interface Props {
  associations: Association[];
}

const ROLES = ['President', 'Vice President', 'Secretary', 'Treasurer', 'Member'];

// ---------------------------------------------------------------------------
// EditRow — inline editing for a board member
// ---------------------------------------------------------------------------

function EditRow({
  member,
  onSave,
  onDelete,
}: {
  member: BoardMember;
  onSave: (id: string, patch: Partial<BoardMember>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: member.name,
    email: member.email,
    role: member.role ?? '',
    sort_order: member.sort_order,
    active: member.active,
    substitute_active: member.substitute_active,
    substitute_name: member.substitute_name ?? '',
    substitute_email: member.substitute_email ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function save() {
    setSaving(true);
    await onSave(member.id, {
      ...form,
      role: form.role || null,
      substitute_name: form.substitute_name || null,
      substitute_email: form.substitute_email || null,
    });
    setSaving(false);
    setEditing(false);
  }

  async function del() {
    if (!confirm(`Remove ${member.name} from board?`)) return;
    setDeleting(true);
    await onDelete(member.id);
    setDeleting(false);
  }

  if (!editing) {
    return (
      <tr className="border-b border-gray-100 last:border-0">
        <td className="px-4 py-3 text-sm font-medium text-[#0d0d0d]">{member.name}</td>
        <td className="px-4 py-3 text-sm text-gray-600">{member.role ?? '—'}</td>
        <td className="px-4 py-3 text-sm text-gray-600">{member.email}</td>
        <td className="px-4 py-3 text-sm text-center text-gray-600">{member.sort_order}</td>
        <td className="px-4 py-3 text-sm text-center">
          <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${member.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
            {member.active ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-center">
          {member.substitute_active ? (
            <div className="text-xs">
              <div className="font-medium text-purple-700">{member.substitute_name}</div>
              <div className="text-gray-500">{member.substitute_email}</div>
            </div>
          ) : (
            <span className="text-gray-400 text-xs">—</span>
          )}
        </td>
        <td className="px-4 py-3 text-right">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setEditing(true)}
              className="px-3 py-1 text-xs rounded border border-[#f26a1b] text-[#f26a1b] hover:bg-orange-50 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={del}
              disabled={deleting}
              className="px-3 py-1 text-xs rounded border border-red-300 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              {deleting ? '…' : 'Remove'}
            </button>
          </div>
        </td>
      </tr>
    );
  }

  // Editing mode
  return (
    <tr className="border-b border-gray-100 bg-orange-50">
      <td colSpan={7} className="px-4 py-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 mb-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-[#f26a1b] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-[#f26a1b] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-[#f26a1b] focus:outline-none bg-white"
            >
              <option value="">— Select role —</option>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Sort Order</label>
            <input
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))}
              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-[#f26a1b] focus:outline-none"
            />
          </div>
          <div className="flex items-end gap-4 pb-1">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                className="rounded accent-[#f26a1b]"
              />
              Active
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.substitute_active}
                onChange={(e) => setForm((f) => ({ ...f, substitute_active: e.target.checked }))}
                className="rounded accent-purple-600"
              />
              Use substitute
            </label>
          </div>
        </div>
        {form.substitute_active && (
          <div className="grid grid-cols-2 gap-3 mb-3 p-3 bg-purple-50 rounded border border-purple-100">
            <div>
              <label className="block text-xs font-semibold text-purple-700 mb-1">Substitute Name</label>
              <input
                value={form.substitute_name}
                onChange={(e) => setForm((f) => ({ ...f, substitute_name: e.target.value }))}
                className="w-full rounded border border-purple-200 px-2 py-1.5 text-sm focus:border-purple-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-purple-700 mb-1">Substitute Email</label>
              <input
                type="email"
                value={form.substitute_email}
                onChange={(e) => setForm((f) => ({ ...f, substitute_email: e.target.value }))}
                className="w-full rounded border border-purple-200 px-2 py-1.5 text-sm focus:border-purple-400 focus:outline-none"
              />
            </div>
          </div>
        )}
        <div className="flex gap-2">
          <button
            onClick={save}
            disabled={saving}
            className="px-4 py-1.5 rounded bg-[#f26a1b] text-white text-sm font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button
            onClick={() => setEditing(false)}
            className="px-4 py-1.5 rounded border border-gray-300 text-sm text-gray-600 hover:border-gray-400 transition-colors"
          >
            Cancel
          </button>
        </div>
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Main client component
// ---------------------------------------------------------------------------

export default function BoardSetupClient({ associations }: Props) {
  const [selectedCode, setSelectedCode] = useState<string>('');
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [config, setConfig] = useState<BoardConfig>({ required_signatures: 1, approval_letter_template: null });
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [configSaving, setConfigSaving] = useState(false);
  const [configSaved, setConfigSaved] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);

  // Add member form
  const [addForm, setAddForm] = useState({ name: '', email: '', role: '', sort_order: 0 });
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const fetchData = useCallback(async (code: string) => {
    setLoadingMembers(true);
    setLoadingConfig(true);

    const [membersRes, configRes] = await Promise.all([
      fetch(`/api/admin/board-members?code=${encodeURIComponent(code)}`).then((r) => r.json()),
      fetch(`/api/admin/board-config?code=${encodeURIComponent(code)}`).then((r) => r.json()),
    ]);

    if (membersRes.ok) setMembers(membersRes.members ?? []);
    if (configRes.ok) {
      setConfig({
        required_signatures: configRes.required_signatures ?? 1,
        approval_letter_template: configRes.approval_letter_template ?? null,
      });
    }

    setLoadingMembers(false);
    setLoadingConfig(false);
  }, []);

  useEffect(() => {
    if (selectedCode) fetchData(selectedCode);
  }, [selectedCode, fetchData]);

  async function saveConfig() {
    if (!selectedCode) return;
    setConfigSaving(true);
    setConfigError(null);
    setConfigSaved(false);
    try {
      const res = await fetch('/api/admin/board-config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          association_code: selectedCode,
          required_signatures: config.required_signatures,
          approval_letter_template: config.approval_letter_template || null,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error ?? 'Save failed');
      setConfigSaved(true);
      setTimeout(() => setConfigSaved(false), 3000);
    } catch (err) {
      setConfigError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setConfigSaving(false);
    }
  }

  async function handleSaveMember(id: string, patch: Partial<BoardMember>) {
    const res = await fetch(`/api/admin/board-members/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    const json = await res.json();
    if (json.ok && json.member) {
      setMembers((prev) => prev.map((m) => (m.id === id ? json.member : m)));
    }
  }

  async function handleDeleteMember(id: string) {
    const res = await fetch(`/api/admin/board-members/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (json.ok) {
      setMembers((prev) => prev.filter((m) => m.id !== id));
    }
  }

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCode || !addForm.name || !addForm.email) return;
    setAdding(true);
    setAddError(null);
    try {
      const res = await fetch('/api/admin/board-members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          association_code: selectedCode,
          name: addForm.name,
          email: addForm.email,
          role: addForm.role || null,
          sort_order: addForm.sort_order,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error ?? 'Add failed');
      setMembers((prev) => [...prev, json.member]);
      setAddForm({ name: '', email: '', role: '', sort_order: 0 });
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setAdding(false);
    }
  }

  const selectedAssoc = associations.find((a) => a.association_code === selectedCode);

  return (
    <div className="max-w-5xl">
      {/* Association selector */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Association</label>
        <select
          value={selectedCode}
          onChange={(e) => setSelectedCode(e.target.value)}
          className="w-full max-w-sm rounded border border-gray-300 px-3 py-2 text-sm bg-white focus:border-[#f26a1b] focus:outline-none focus:ring-1 focus:ring-[#f26a1b]"
        >
          <option value="">— Select association —</option>
          {associations.map((a) => (
            <option key={a.association_code} value={a.association_code}>
              {a.association_name} ({a.association_code})
            </option>
          ))}
        </select>
      </div>

      {!selectedCode && (
        <p className="text-gray-400 text-sm">Select an association to manage its board settings.</p>
      )}

      {selectedCode && (
        <div className="space-y-10">

          {/* ── Board Config ── */}
          <section>
            <h2 className="text-lg font-bold text-[#0d0d0d] border-l-4 border-[#f26a1b] pl-3 mb-5">
              Board Configuration
            </h2>

            {loadingConfig ? (
              <p className="text-sm text-gray-400">Loading config…</p>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-5 max-w-2xl">
                {/* Required signatures */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Required Signatures to Approve
                  </label>
                  <div className="flex gap-4">
                    {[1, 2].map((n) => (
                      <label key={n} className="flex items-center gap-2 cursor-pointer text-sm">
                        <input
                          type="radio"
                          name="required_signatures"
                          value={n}
                          checked={config.required_signatures === n}
                          onChange={() => setConfig((c) => ({ ...c, required_signatures: n }))}
                          className="accent-[#f26a1b]"
                        />
                        {n} {n === 1 ? 'signature' : 'signatures'}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Approval letter template */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Approval Letter Template
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Available variables:{' '}
                    <code className="bg-gray-100 px-1 rounded">{'{{applicant_name}}'}</code>,{' '}
                    <code className="bg-gray-100 px-1 rounded">{'{{unit}}'}</code>,{' '}
                    <code className="bg-gray-100 px-1 rounded">{'{{association}}'}</code>,{' '}
                    <code className="bg-gray-100 px-1 rounded">{'{{date}}'}</code>,{' '}
                    <code className="bg-gray-100 px-1 rounded">{'{{board_member_name}}'}</code>
                  </p>
                  <textarea
                    value={config.approval_letter_template ?? ''}
                    onChange={(e) => setConfig((c) => ({ ...c, approval_letter_template: e.target.value }))}
                    rows={6}
                    placeholder="I, the undersigned board member of {{association}}, hereby confirm that the application of {{applicant_name}} for Unit {{unit}} has been reviewed and approved in accordance with the Association's governing documents."
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-[#0d0d0d] focus:border-[#f26a1b] focus:outline-none focus:ring-1 focus:ring-[#f26a1b] resize-y font-mono"
                  />
                </div>

                {/* Save button */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={saveConfig}
                    disabled={configSaving}
                    className="px-5 py-2 rounded bg-[#f26a1b] text-white text-sm font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors"
                  >
                    {configSaving ? 'Saving…' : 'Save Config'}
                  </button>
                  {configSaved && <span className="text-sm text-green-600 font-medium">Saved!</span>}
                  {configError && <span className="text-sm text-red-600">{configError}</span>}
                </div>
              </div>
            )}
          </section>

          {/* ── Board Members ── */}
          <section>
            <h2 className="text-lg font-bold text-[#0d0d0d] border-l-4 border-[#f26a1b] pl-3 mb-5">
              Board Members
              {selectedAssoc && (
                <span className="ml-2 text-sm font-normal text-gray-500">— {selectedAssoc.association_name}</span>
              )}
            </h2>

            {loadingMembers ? (
              <p className="text-sm text-gray-400">Loading members…</p>
            ) : (
              <>
                {members.length === 0 ? (
                  <p className="text-sm text-gray-400 mb-4">No board members configured yet.</p>
                ) : (
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-4 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">Name</th>
                          <th className="px-4 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">Role</th>
                          <th className="px-4 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">Email</th>
                          <th className="px-4 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wide text-center">Order</th>
                          <th className="px-4 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wide text-center">Active</th>
                          <th className="px-4 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wide text-center">Substitute</th>
                          <th className="px-4 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wide text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {members.map((m) => (
                          <EditRow
                            key={m.id}
                            member={m}
                            onSave={handleSaveMember}
                            onDelete={handleDeleteMember}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Add member form */}
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                  <h3 className="text-sm font-semibold text-[#0d0d0d] uppercase tracking-wide mb-4">
                    Add Board Member
                  </h3>
                  <form onSubmit={handleAddMember} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Name *</label>
                      <input
                        required
                        value={addForm.name}
                        onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
                        placeholder="Full name"
                        className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-[#f26a1b] focus:outline-none"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Email *</label>
                      <input
                        required
                        type="email"
                        value={addForm.email}
                        onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))}
                        placeholder="board@example.com"
                        className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-[#f26a1b] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Role</label>
                      <select
                        value={addForm.role}
                        onChange={(e) => setAddForm((f) => ({ ...f, role: e.target.value }))}
                        className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm bg-white focus:border-[#f26a1b] focus:outline-none"
                      >
                        <option value="">— Role —</option>
                        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Sort Order</label>
                      <input
                        type="number"
                        value={addForm.sort_order}
                        onChange={(e) => setAddForm((f) => ({ ...f, sort_order: Number(e.target.value) }))}
                        className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-[#f26a1b] focus:outline-none"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-4 flex items-center gap-3 pt-1">
                      <button
                        type="submit"
                        disabled={adding}
                        className="px-5 py-2 rounded bg-[#f26a1b] text-white text-sm font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors"
                      >
                        {adding ? 'Adding…' : '+ Add Member'}
                      </button>
                      {addError && <span className="text-sm text-red-600">{addError}</span>}
                    </div>
                  </form>
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
