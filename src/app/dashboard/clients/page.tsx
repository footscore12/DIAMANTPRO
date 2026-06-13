'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Client } from '@/lib/types';
import { formatDate, daysUntil, isUpcoming } from '@/lib/utils';
import { Plus, Search, Building2, Phone, MapPin, AlertTriangle, Calendar, Trash2 } from 'lucide-react';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    const { data } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
    if (data) setClients(data);
    setLoading(false);
  }

  async function deleteClient(id: string, nom: string) {
    if (!confirm(`Supprimer le client "${nom}" ? Cette action est irréversible.`)) return;
    await supabase.from('clients').delete().eq('id', id);
    loadClients();
  }

  const filtered = clients.filter((c) =>
    c.nom.toLowerCase().includes(search.toLowerCase()) ||
    c.telephone?.includes(search) ||
    c.ville?.toLowerCase().includes(search.toLowerCase())
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
        <button
          onClick={() => router.push('/dashboard/clients/new')}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          <Plus className="w-4 h-4" />
          Nouveau client
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Rechercher un client..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">Aucun client trouvé</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((client) => (
            <div
              key={client.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition cursor-pointer"
              onClick={() => router.push(`/dashboard/clients/${client.id}`)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{client.nom}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-slate-500">
                      {client.telephone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" /> {client.telephone}
                        </span>
                      )}
                      {client.ville && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> {client.ville}
                        </span>
                      )}
                      {client.prochaine_visite && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> {formatDate(client.prochaine_visite)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isUpcoming(client.prochaine_visite) && (
                    <span className="flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                      <AlertTriangle className="w-3 h-3" />
                      {daysUntil(client.prochaine_visite) === 0 ? "Aujourd'hui" : `J-${daysUntil(client.prochaine_visite)}`}
                    </span>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteClient(client.id, client.nom); }}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
