'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Client, Intervention } from '@/lib/types';
import { daysUntil, formatCurrency } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Users, CalendarCheck, Clock, AlertTriangle, TrendingUp, Building2
} from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalClients: 0,
    upcomingInterventions: 0,
    pendingVisits: 0,
    monthlyRevenue: 0,
  });
  const [upcomingVisits, setUpcomingVisits] = useState<Client[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    const { data: clients } = await supabase.from('clients').select('*');
    const { data: interventions } = await supabase.from('interventions').select('*');

    if (!clients || !interventions) return;

    const today = new Date();
    const upcoming = interventions.filter((i: Intervention) => {
      const d = new Date(i.date_intervention);
      return d >= today && i.statut === 'planifiee';
    });

    const visits = clients
      .filter((c: Client) => {
        if (!c.prochaine_visite) return false;
        const d = new Date(c.prochaine_visite);
        const diff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diff >= 0 && diff <= 14;
      })
      .sort((a: Client, b: Client) => {
        if (!a.prochaine_visite || !b.prochaine_visite) return 0;
        return new Date(a.prochaine_visite).getTime() - new Date(b.prochaine_visite).getTime();
      });

    const completed = interventions.filter((i: Intervention) => i.statut === 'effectuee');
    const monthlyRevenue = completed.reduce((sum: number, i: Intervention) => sum + (i.montant || 0), 0);

    setStats({
      totalClients: clients.length,
      upcomingInterventions: upcoming.length,
      pendingVisits: visits.length,
      monthlyRevenue,
    });
    setUpcomingVisits(visits.slice(0, 5));

    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const monthlyData = months.map((name, idx) => {
      const count = interventions.filter((i: Intervention) => {
        const d = new Date(i.date_intervention);
        return d.getMonth() === idx && d.getFullYear() === today.getFullYear();
      }).length;
      return { name, interventions: count };
    });
    setChartData(monthlyData);
    setLoading(false);
  }

  const cards = [
    { label: 'Clients', value: stats.totalClients, icon: Users, color: 'bg-blue-500' },
    { label: 'Interventions à venir', value: stats.upcomingInterventions, icon: CalendarCheck, color: 'bg-emerald-500' },
    { label: 'Visites imminentes', value: stats.pendingVisits, icon: Clock, color: 'bg-amber-500' },
    { label: 'Revenu mensuel', value: formatCurrency(stats.monthlyRevenue), icon: TrendingUp, color: 'bg-purple-500' },
  ];

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
        <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
        <p className="text-sm text-slate-500">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm p-5 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{card.label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{card.value}</p>
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-5 border border-slate-200">
          <h2 className="font-semibold text-slate-900 mb-4">Interventions par mois</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="interventions" fill="#059669" radius={[4, 4, 0, 0]} name="Interventions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 className="font-semibold text-slate-900">Prochaines visites</h2>
          </div>
          {upcomingVisits.length === 0 ? (
            <p className="text-sm text-slate-500">Aucune visite imminente</p>
          ) : (
            <div className="space-y-3">
              {upcomingVisits.map((client) => {
                const days = daysUntil(client.prochaine_visite);
                return (
                  <div key={client.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <Building2 className="w-8 h-8 text-slate-400 mt-1" />
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-slate-900 truncate">{client.nom}</p>
                      <p className="text-xs text-slate-500">{client.ville}</p>
                      <p className="text-xs text-emerald-600 font-medium mt-1">
                        {days === 0 ? "Aujourd'hui" : days === 1 ? 'Demain' : `Dans ${days} jours`}
                      </p>
                    </div>
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
