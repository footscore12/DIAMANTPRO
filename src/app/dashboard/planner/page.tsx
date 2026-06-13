'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Intervention, Client } from '@/lib/types';
import dynamic from 'next/dynamic';

const PlannerContent = dynamic(() => import('@/components/planner/PlannerContent'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
    </div>
  ),
});

export default function PlannerPage() {
  const [interventions, setInterventions] = useState<(Intervention & { client?: Client })[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data: intData } = await supabase
        .from('interventions')
        .select('*, client:clients(*)')
        .order('date_intervention', { ascending: true });

      const { data: clData } = await supabase.from('clients').select('*');

      if (intData) setInterventions(intData as any);
      if (clData) setClients(clData);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return <PlannerContent interventions={interventions} clients={clients} />;
}
