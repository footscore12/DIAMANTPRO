'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Client, Intervention } from '@/lib/types';
import { daysUntil, formatCurrency, formatDateShort } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Users, CalendarCheck, Clock, AlertTriangle, TrendingUp, Building2,
  Phone, MapPin, Bell, BellRing, X, ChevronRight
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalClients: 0,
    upcomingInterventions: 0,
    pendingVisits: 0,
    monthlyRevenue: 0,
  });
  const [upcomingVisits, setUpcomingVisits] = useState<(Client & { days: number })[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNotif, setShowNotif] = useState(false);
  const [notifDismissed, setNotifDismissed] = useState<string[]>([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    if (upcomingVisits.length > 0 && !showNotif) {
      const urgent = upcomingVisits.filter(v => v.days <= 3 && !notifDismissed.includes(v.id));
      if (urgent.length > 0) {
        if (Notification.permission === 'granted') {
          new Notification('DIAMANT PRO - Visites imminentes', {
            body: `${urgent.length} visite(s) dans les 3 jours !`,
            icon: '/favicon.ico',
          });
        }
        setShowNotif(true);
        const audio = new Audio();
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACAf39/f4B/f3+AgH9/f3+Af39/gH9/f3+Af3+AgH9/f3+Af39/gH9/f4B/f3+AgH9/f3+Af39/gH9/f4B/f3+AgH9/f3+Af39/gH9/f4B/f39/gH9/gH+Af39/gH9/f4B/f3+AgH9/f3+Af39/gH9/gH+Af3+Af3+Af39/gH9/gH9/f3+Af39/gH9/f4B/f3+Af39/gH9/f4B/f39/gH+Af39/gH9/f4B/f3+Af39/gH9/f4B/f39/gH9/gH+Af3+Af39/gH9/gH+Af39/gH9/f4B/f3+Af39/gH9/f4B/f3+Af39/gH9/f4B/f39/gH+Af39/gH9/f4B/f3+Af39/gH9/f4B/f39/gH+Af39/gH9/f4B/gH+Af39/gH9/f4B/f3+Af39/gH9/f4B/f39/gH+Af39/gH9/f4B/f3+Af39/gH9/f4B/f3+Af3+Af4B/f3+Af39/gH+Af39/gH9/f4B/f3+Af39/gH9/gH9/f4B/f39/gH+Af39/gH9/f4B/f3+Af3+Af4B/f3+Af39/gH+Af39/gH9/f4B/f3+Af39/gH9/f39/gH+Af39/gH9/f4B/f3+Af39/gH9/f4B/f39/gH+Af39/gH9/f4B/f3+Af39/gH+Af39/gH9/f4B/f39/gH9/gH+Af3+Af39/gH9/gH+Af39/gH9/f4B/f39/gH+Af39/gH9/f4B/f3+Af39/gH+Af39/gH9/f4B/f39/gH+Af39/gH9/f4B/f39/gH9/f4B/f39/gH+Af39/gH9/f4B/f39/gH+Af39/gH9/f4B/f39/gH+Af39/gH+Af3+Af4B/f3+Af39/gH9/f4B/f39/gH+Af39/gH9/f4B/f3+Af3+Af4B/f3+Af39/gH+Af39/gH9/f4B/f3+Af3+Af4B/f3+Af39/gH+Af39/gH9/f39/gH+Af39/gH9/f4B/f3+Af39/gH+Af39/gH9/f4B/f39/gH+Af39/gH9/f4B/f3+Af39/gH+Af39/gH9/f4B/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f4B/f39/gH+Af39/gH9/f4B/f3+Af39/gH+Af39/gH9/f4B/f39/gH+Af39/gH9/f4B/f39/gH9/f4B/f39/gH+Af39/gH9/f4B/f39/gH+Af39/gH9/f4B/f39/gH9/f4B/f3+Af39/gH+Af39/gH9/f4B/f39/gH+Af39/gH9/f4B/f3+Af39/gH+Af39/gH9/f4B/f39/gH+Af39/gH+Af39/gH9/f4B/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f4B/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH+Af39/gH9/f4B/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH+Af39/gH9/f4B/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH+Af39/gH9/f39/gH+Af39/gH+Af39/gH9/f39/gH+Af39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af39/gH9/f39/gH+Af0=';
        audio.volume = 0.3;
        audio.play().catch(() => {});
      }
    }
  }, [upcomingVisits]);

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
      .map((c: Client) => ({
        ...c,
        days: daysUntil(c.prochaine_visite),
      }))
      .sort((a, b) => a.days - b.days);

    const completed = interventions.filter((i: Intervention) => i.statut === 'effectuee');
    const monthlyRevenue = completed.reduce((sum: number, i: Intervention) => sum + (i.montant || 0), 0);

    setStats({
      totalClients: clients.length,
      upcomingInterventions: upcoming.length,
      pendingVisits: visits.length,
      monthlyRevenue,
    });
    setUpcomingVisits(visits.slice(0, 8));

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
        <div className="flex items-center gap-3">
          <button onClick={() => { Notification.requestPermission(); }}
            className="text-xs text-slate-400 hover:text-slate-600 transition" title="Activer les notifications">
            <Bell className="w-4 h-4" />
          </button>
          <p className="text-sm text-slate-500">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Notification banner */}
      {showNotif && upcomingVisits.filter(v => v.days <= 3 && !notifDismissed.includes(v.id)).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <BellRing className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-red-800 text-sm">🔔 Visites imminentes !</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {upcomingVisits.filter(v => v.days <= 3 && !notifDismissed.includes(v.id)).map(v => (
                <span key={v.id} className="bg-white border border-red-200 px-2.5 py-1 rounded-lg text-xs text-red-700 flex items-center gap-1">
                  <Building2 className="w-3 h-3" /> {v.nom} - {v.days === 0 ? "Aujourd'hui" : v.days === 1 ? 'Demain' : `J-${v.days}`}
                </span>
              ))}
            </div>
          </div>
          <button onClick={() => setShowNotif(false)} className="text-red-400 hover:text-red-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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

        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className={`w-5 h-5 ${upcomingVisits.length > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
                <h2 className="font-semibold text-slate-900">Prochaines visites</h2>
              </div>
              {upcomingVisits.length > 0 && (
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                  {upcomingVisits.length} à venir
                </span>
              )}
            </div>
            {upcomingVisits.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">Aucune visite prévue</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {upcomingVisits.map((client) => (
                  <div key={client.id}
                    onClick={() => router.push(`/dashboard/clients/${client.id}`)}
                    className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition ${
                      client.days <= 1 ? 'bg-red-50 border border-red-100' : client.days <= 3 ? 'bg-amber-50 border border-amber-100' : 'bg-slate-50'
                    }`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      client.days <= 1 ? 'bg-red-100' : client.days <= 3 ? 'bg-amber-100' : 'bg-emerald-100'
                    }`}>
                      <Building2 className={`w-4 h-4 ${
                        client.days <= 1 ? 'text-red-600' : client.days <= 3 ? 'text-amber-600' : 'text-emerald-600'
                      }`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm text-slate-900 truncate">{client.nom}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        {client.ville && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" /> {client.ville}</span>}
                        {client.telephone && <span className="flex items-center gap-0.5"><Phone className="w-3 h-3" /> {client.telephone}</span>}
                      </div>
                      <p className={`text-xs font-medium mt-1 ${
                        client.days <= 1 ? 'text-red-600' : client.days <= 3 ? 'text-amber-600' : 'text-emerald-600'
                      }`}>
                        {client.days === 0 ? "Aujourd'hui" : client.days === 1 ? 'Demain' : `Dans ${client.days} jours`}
                        {' · '}{formatDateShort(client.prochaine_visite!)}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 mt-1 shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <button onClick={() => router.push('/dashboard/planner')}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2 shadow-sm">
            <CalendarCheck className="w-4 h-4" />
            Voir le calendrier complet
          </button>
        </div>
      </div>
    </div>
  );
}
