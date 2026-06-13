'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Client, Intervention, Document as Doc } from '@/lib/types';
import { formatDate, formatCurrency, getStatusColor, getStatusLabel, isUpcoming, daysUntil } from '@/lib/utils';
import {
  ArrowLeft, Building2, Phone, Mail, MapPin, FileText, Calendar, Plus, Edit3,
  AlertTriangle, ClipboardList, CreditCard, Truck
} from 'lucide-react';
import Link from 'next/link';

export default function ClientDetailPage() {
  const { id } = useParams();
  const [client, setClient] = useState<Client | null>(null);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [documents, setDocuments] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<Client>>({});

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    const { data: c } = await supabase.from('clients').select('*').eq('id', id).single();
    const { data: i } = await supabase.from('interventions').select('*').eq('client_id', id).order('date_intervention', { ascending: false });
    const { data: d } = await supabase.from('documents').select('*').eq('client_id', id).order('created_at', { ascending: false });

    if (c) { setClient(c); setForm(c); }
    if (i) setInterventions(i);
    if (d) setDocuments(d);
    setLoading(false);
  }

  async function updateClient() {
    if (!client) return;
    await supabase.from('clients').update(form).eq('id', client.id);
    setClient({ ...client, ...form });
    setEditing(false);
  }

  async function deleteIntervention(interventionId: string) {
    if (!confirm('Supprimer cette intervention ?')) return;
    await supabase.from('interventions').delete().eq('id', interventionId);
    loadData();
  }

  async function toggleStatut(interventionId: string, currentStatut: string) {
    const newStatut = currentStatut === 'planifiee' ? 'effectuee' : 'planifiee';
    await supabase.from('interventions').update({ statut: newStatut }).eq('id', interventionId);
    loadData();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!client) {
    return <div className="p-6 text-center text-slate-500">Client introuvable</div>;
  }

  const docIcons: Record<string, any> = {
    devis: FileText, facture: CreditCard, bon_livraison: Truck,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/clients" className="p-2 hover:bg-slate-100 rounded-lg transition">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Client</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        {!editing ? (
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Building2 className="w-7 h-7 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{client.nom}</h2>
                <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2 text-sm text-slate-600">
                  {client.telephone && <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {client.telephone}</span>}
                  {client.email && <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {client.email}</span>}
                  {(client.ville || client.adresse) && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {[client.adresse, client.ville].filter(Boolean).join(', ')}</span>}
                  {client.ice && <span className="text-slate-400">ICE: {client.ice}</span>}
                </div>
                {client.prochaine_visite && (
                  <div className="flex items-center gap-2 mt-3">
                    <span className="flex items-center gap-1 text-sm text-slate-600">
                      <Calendar className="w-4 h-4" /> Prochaine visite: {formatDate(client.prochaine_visite)}
                    </span>
                    {isUpcoming(client.prochaine_visite) && (
                      <span className="flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                        <AlertTriangle className="w-3 h-3" />
                        {daysUntil(client.prochaine_visite) === 0 ? "Aujourd'hui" : `J-${daysUntil(client.prochaine_visite)}`}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <button onClick={() => setEditing(true)}
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-emerald-600 px-3 py-2 rounded-lg hover:bg-emerald-50 transition">
              <Edit3 className="w-4 h-4" /> Modifier
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="font-semibold text-slate-900">Modifier le client</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input value={form.nom || ''} onChange={(e) => setForm({ ...form, nom: e.target.value })}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Nom" />
              <input value={form.telephone || ''} onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Téléphone" />
              <input value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Email" />
              <input value={form.ice || ''} onChange={(e) => setForm({ ...form, ice: e.target.value })}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="ICE" />
              <input value={form.ville || ''} onChange={(e) => setForm({ ...form, ville: e.target.value })}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Ville" />
              <input value={form.code_postal || ''} onChange={(e) => setForm({ ...form, code_postal: e.target.value })}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Code postal" />
              <div className="md:col-span-3">
                <textarea value={form.adresse || ''} onChange={(e) => setForm({ ...form, adresse: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Adresse" rows={2} />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Prochaine visite</label>
                <input type="date" value={form.prochaine_visite?.split('T')[0] || ''} onChange={(e) => setForm({ ...form, prochaine_visite: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-slate-500 mb-1">Notes</label>
                <textarea value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" rows={2} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditing(false)}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition">Annuler</button>
              <button onClick={updateClient}
                className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">Enregistrer</button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-emerald-600" />
              Interventions ({interventions.length})
            </h2>
            <Link href={`/dashboard/clients/${id}/interventions/new`}
              className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700">
              <Plus className="w-4 h-4" /> Ajouter
            </Link>
          </div>
          {interventions.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">Aucune intervention</p>
          ) : (
            <div className="space-y-2">
              {interventions.map((interv) => (
                <div key={interv.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${getStatusColor(interv.statut)}`}>
                        {getStatusLabel(interv.statut)}
                      </span>
                      <span className="text-sm font-medium text-slate-900">{interv.type_prestation}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {formatDate(interv.date_intervention)}
                      {interv.montant && ` - ${formatCurrency(interv.montant)}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggleStatut(interv.id, interv.statut)}
                      className="p-1.5 text-xs text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition"
                      title={interv.statut === 'planifiee' ? 'Marquer effectuée' : 'Marquer planifiée'}>
                      {interv.statut === 'planifiee' ? '✓' : '↩'}
                    </button>
                    <button onClick={() => deleteIntervention(interv.id)}
                      className="p-1.5 text-xs text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition">
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-emerald-600" />
            Documents ({documents.length})
          </h2>
          {documents.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">Aucun document</p>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => {
                const Icon = docIcons[doc.type] || FileText;
                return (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{doc.numero}</p>
                        <p className="text-xs text-slate-500">{formatDate(doc.date_emission)}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${getStatusColor(doc.statut)}`}>
                      {getStatusLabel(doc.statut)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
