'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { CompanySettings, DEFAULT_COMPANY } from '@/lib/types';
import { Save, Building2, Phone, Mail, Fingerprint } from 'lucide-react';

export default function ConfigurationPage() {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    telephone: DEFAULT_COMPANY.telephone,
    email: DEFAULT_COMPANY.email,
    ice: DEFAULT_COMPANY.ice,
    adresse: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const { data } = await supabase.from('company_settings').select('*').limit(1).single();
    if (data) {
      setSettings(data);
      setForm({ telephone: data.telephone, email: data.email, ice: data.ice, adresse: data.adresse || '' });
    }
    setLoading(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    if (settings) {
      await supabase.from('company_settings').update(form).eq('id', settings.id);
    } else {
      await supabase.from('company_settings').insert([form]);
    }

    setSaved(true);
    setSaving(false);
    loadSettings();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
          <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Configuration</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Informations de la société DIAMANT PRO SERVICES</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-2">
            <Phone className="w-4 h-4 text-slate-400" /> Téléphone
          </label>
          <input type="text" value={form.telephone}
            onChange={(e) => setForm({ ...form, telephone: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-2">
            <Mail className="w-4 h-4 text-slate-400" /> Email
          </label>
          <input type="email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-2">
            <Fingerprint className="w-4 h-4 text-slate-400" /> ICE
          </label>
          <input type="text" value={form.ice}
            onChange={(e) => setForm({ ...form, ice: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Adresse</label>
          <textarea value={form.adresse}
            onChange={(e) => setForm({ ...form, adresse: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" rows={2} />
        </div>

        <div className="flex items-center justify-between pt-2">
          {saved && (
            <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">✓ Enregistré</span>
          )}
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50 ml-auto">
            <Save className="w-4 h-4" />
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>

      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
        <p className="text-sm text-emerald-800 dark:text-emerald-300">
          Ces informations apparaîtront sur les documents PDF (devis, factures, bons de livraison) et sur la page de connexion.
        </p>
      </div>
    </div>
  );
}
