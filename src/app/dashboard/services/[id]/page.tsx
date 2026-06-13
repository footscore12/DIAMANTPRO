'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Service, DOMAINES } from '@/lib/types';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function EditServicePage() {
  const { id } = useParams();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    nom: '',
    domaine: 'nettoyage' as 'nettoyage' | '3d',
    description: '',
    prix_defaut: '',
  });

  useEffect(() => {
    supabase.from('services').select('*').eq('id', id).single().then(({ data }) => {
      if (data) {
        setForm({
          nom: data.nom,
          domaine: data.domaine,
          description: data.description || '',
          prix_defaut: data.prix_defaut?.toString() || '',
        });
      }
      setLoading(false);
    });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom.trim()) return;
    setSaving(true);

    await supabase.from('services').update({
      nom: form.nom,
      domaine: form.domaine,
      description: form.description || null,
      prix_defaut: form.prix_defaut ? parseFloat(form.prix_defaut) : null,
    }).eq('id', id);

    router.push('/dashboard/services');
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
    </div>
  );

  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/services" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition">
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Modifier le service</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nom *</label>
          <input type="text" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" required />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Domaine</label>
          <div className="flex gap-3">
            {DOMAINES.map(d => (
              <button key={d} type="button" onClick={() => setForm({ ...form, domaine: d })}
                className={`flex-1 px-4 py-3 rounded-lg border-2 text-sm font-medium transition ${
                  form.domaine === d
                    ? d === 'nettoyage'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'border-amber-500 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                }`}>
                {d === 'nettoyage' ? '🧹 Nettoyage' : '🐭 3D'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" rows={3} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Prix par défaut (MAD)</label>
          <input type="number" step="0.01" value={form.prix_defaut} onChange={(e) => setForm({ ...form, prix_defaut: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50">
            <Save className="w-4 h-4" />
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
}
