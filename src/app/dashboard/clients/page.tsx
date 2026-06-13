'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Client, Intervention } from '@/lib/types';
import { formatDate, formatDateShort, daysUntil, isUpcoming } from '@/lib/utils';
import { Plus, Search, Building2, Phone, MapPin, AlertTriangle, Calendar, Trash2, Clock, FileText } from 'lucide-react';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    const { data: c } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
    const { data: i } = await supabase.from('interventions').select('*').order('date_intervention', { ascending: false });
    if (c) setClients(c);
    if (i) setInterventions(i);
    setLoading(false);
  }

  async function deleteClient(id: string, nom: string) {
    if (!confirm(`Supprimer "${nom}" ? Cette action est irréversible.`)) return;
    await supabase.from('clients').delete().eq('id', id);
    loadClients();
  }

  function getLastIntervention(clientId: string): Intervention | undefined {
    return interventions.find(i => i.client_id === clientId);
  }

  const filtered = clients.filter((c) =>
    c.nom.toLowerCase().includes(search.toLowerCase()) ||
    c.telephone?.includes(search) ||
    c.ville?.toLowerCase().includes(search.toLowerCase()) ||
    c.ice?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Clients</h1>
        <button onClick={() => router.push('/dashboard/clients/new')}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
          <Plus className="w-4 h-4" /> Nouveau client
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" placeholder="Rechercher par nom, ville, téléphone ou ICE..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">Aucun client trouvé</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Client</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Ville</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Téléphone</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">ICE</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Dernière intervention</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Horaire</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Prochaine visite</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((client) => {
                  const lastInt = getLastIntervention(client.id);
                  return (
                    <tr key={client.id}
                      className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition"
                      onClick={() => router.push(`/dashboard/clients/${client.id}`)}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span className="text-sm font-medium text-slate-900">{client.nom}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {client.ville && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {client.ville}</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {client.telephone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-400" /> {client.telephone}</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500 font-mono">{client.ice || '-'}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {lastInt ? (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {formatDateShort(lastInt.date_intervention)}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {lastInt?.heure_debut ? (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {lastInt.heure_debut.slice(0, 5)}{lastInt.heure_fin ? `-${lastInt.heure_fin.slice(0, 5)}` : ''}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {client.prochaine_visite ? (
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-sm text-slate-600">{formatDateShort(client.prochaine_visite)}</span>
                            {isUpcoming(client.prochaine_visite) && (
                              <span className={`flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-full font-medium ${
                                daysUntil(client.prochaine_visite) <= 1
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}>
                                <AlertTriangle className="w-3 h-3" />
                                {daysUntil(client.prochaine_visite) === 0 ? 'Aujourd\'hui'
                                  : daysUntil(client.prochaine_visite) === 1 ? 'Demain'
                                  : `J-${daysUntil(client.prochaine_visite)}`}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={(e) => { e.stopPropagation(); deleteClient(client.id, client.nom); }}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500">
            {filtered.length} client{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
}
