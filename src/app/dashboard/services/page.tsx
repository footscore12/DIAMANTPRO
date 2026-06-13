'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Service } from '@/lib/types';
import { Plus, Search, Sparkles, Bug, Euro, Trash2, Edit3 } from 'lucide-react';

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'nettoyage' | '3d'>('all');
  const router = useRouter();

  useEffect(() => { loadServices(); }, []);

  async function loadServices() {
    const { data } = await supabase.from('services').select('*').order('domaine').order('nom');
    if (data) setServices(data);
    setLoading(false);
  }

  async function deleteService(id: string, nom: string) {
    if (!confirm(`Supprimer le service "${nom}" ?`)) return;
    await supabase.from('services').delete().eq('id', id);
    loadServices();
  }

  const filtered = services.filter(s => {
    if (filter !== 'all' && s.domaine !== filter) return false;
    return s.nom.toLowerCase().includes(search.toLowerCase());
  });

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Services</h1>
        <button onClick={() => router.push('/dashboard/services/new')}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
          <Plus className="w-4 h-4" /> Nouveau service
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Rechercher un service..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
        </div>
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
          {(['all', 'nettoyage', '3d'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm rounded-md transition ${filter === f ? 'bg-white dark:bg-slate-800 shadow text-slate-900 dark:text-white font-medium' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}>
              {f === 'all' ? 'Tous' : f === 'nettoyage' ? '🧹 Nettoyage' : '🐭 3D'}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">Aucun service trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((service) => (
            <div key={service.id}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${service.domaine === 'nettoyage' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                    {service.domaine === 'nettoyage' ? <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" /> : <Bug className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{service.nom}</h3>
                    {service.description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{service.description}</p>}
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${service.domaine === 'nettoyage' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'}`}>
                        {service.domaine === 'nettoyage' ? 'Nettoyage' : '3D'}
                      </span>
                      {service.prix_defaut && service.prix_defaut > 0 && (
                        <span className="text-xs text-emerald-600 font-medium flex items-center gap-0.5">
                          <Euro className="w-3 h-3" /> {service.prix_defaut} MAD
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => router.push(`/dashboard/services/${service.id}`)}
                    className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteService(service.id, service.nom)}
                    className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition">
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
