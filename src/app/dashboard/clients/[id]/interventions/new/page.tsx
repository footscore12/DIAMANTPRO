'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Service } from '@/lib/types';
import { ArrowLeft, Save, Sparkles, Bug } from 'lucide-react';
import Link from 'next/link';

export default function NewInterventionPage() {
  const { id } = useParams();
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [saving, setSaving] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({
    date_intervention: new Date().toISOString().split('T')[0],
    heure_debut: '',
    heure_fin: '',
    type_prestation: '',
    montant: '',
    notes: '',
  });
  const [selectedServiceId, setSelectedServiceId] = useState('');

  useEffect(() => {
    supabase.from('services').select('*').order('domaine').order('nom').then(({ data }) => {
      if (data) setServices(data);
    });
  }, []);

  function handleServiceSelect(serviceId: string) {
    setSelectedServiceId(serviceId);
    setCustomMode(false);
    const service = services.find(s => s.id === serviceId);
    if (service) {
      setForm(prev => ({
        ...prev,
        type_prestation: service.nom,
        montant: service.prix_defaut && service.prix_defaut > 0 ? service.prix_defaut.toString() : '',
      }));
    }
  }

  function enableCustomMode() {
    setCustomMode(true);
    setSelectedServiceId('');
    setForm(prev => ({ ...prev, type_prestation: '', montant: '' }));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase.from('interventions').insert([{
      client_id: id,
      date_intervention: form.date_intervention,
      heure_debut: form.heure_debut || null,
      heure_fin: form.heure_fin || null,
      type_prestation: form.type_prestation,
      statut: 'planifiee',
      montant: form.montant ? parseFloat(form.montant) : null,
      notes: form.notes || null,
    }]);

    if (!error) router.push(`/dashboard/clients/${id}`);
    setSaving(false);
  };

  const nettoyageServices = services.filter(s => s.domaine === 'nettoyage');
  const threeDServices = services.filter(s => s.domaine === '3d');

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/dashboard/clients/${id}`} className="p-2 hover:bg-slate-100 rounded-lg transition">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Nouvelle intervention</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
            <input type="date" value={form.date_intervention}
              onChange={(e) => setForm({ ...form, date_intervention: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" required />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Type de prestation *</label>
            {!customMode ? (
              <div className="space-y-2">
                <select value={selectedServiceId} onChange={(e) => handleServiceSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
                  <option value="">-- Choisir un service --</option>
                  {nettoyageServices.length > 0 && (
                    <optgroup label="🧹 Nettoyage">
                      {nettoyageServices.map(s => (
                        <option key={s.id} value={s.id}>{s.nom}{s.prix_defaut && s.prix_defaut > 0 ? `  (${s.prix_defaut} MAD)` : ''}</option>
                      ))}
                    </optgroup>
                  )}
                  {threeDServices.length > 0 && (
                    <optgroup label="🐭 3D (Dératisation / Désinfection / Désinsectisation)">
                      {threeDServices.map(s => (
                        <option key={s.id} value={s.id}>{s.nom}{s.prix_defaut && s.prix_defaut > 0 ? `  (${s.prix_defaut} MAD)` : ''}</option>
                      ))}
                    </optgroup>
                  )}
                </select>
                <button type="button" onClick={enableCustomMode}
                  className="text-xs text-emerald-600 hover:text-emerald-700">
                  + Prestation personnalisée (hors liste)
                </button>
                {selectedServiceId && services.find(s => s.id === selectedServiceId) && (
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    {services.find(s => s.id === selectedServiceId)?.domaine === 'nettoyage' ? <Sparkles className="w-3 h-3" /> : <Bug className="w-3 h-3" />}
                    {services.find(s => s.id === selectedServiceId)?.description}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <input type="text" value={form.type_prestation}
                  onChange={(e) => setForm({ ...form, type_prestation: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" required
                  placeholder="Tapez la prestation..." />
                <button type="button" onClick={() => { setCustomMode(false); setSelectedServiceId(''); }}
                  className="text-xs text-slate-500 hover:text-slate-700">
                  ← Retour à la liste des services
                </button>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Montant (MAD)</label>
            <input type="number" step="0.01" value={form.montant}
              onChange={(e) => setForm({ ...form, montant: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Heure début</label>
            <input type="time" value={form.heure_debut}
              onChange={(e) => setForm({ ...form, heure_debut: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Heure fin</label>
            <input type="time" value={form.heure_fin}
              onChange={(e) => setForm({ ...form, heure_fin: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" rows={3} />
          </div>
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
