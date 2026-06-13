'use client';

import { useState, useRef } from 'react';
import { Intervention, Client } from '@/lib/types';
import { formatCurrency, getStatusColor, getStatusLabel } from '@/lib/utils';
import { MapPin } from 'lucide-react';

import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventClickArg } from '@fullcalendar/core';

const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });

interface PlannerContentProps {
  interventions: (Intervention & { client?: Client })[];
  clients: Client[];
}

export default function PlannerContent({ interventions, clients }: PlannerContentProps) {
  const [selectedIntervention, setSelectedIntervention] = useState<(Intervention & { client?: Client }) | null>(null);
  const calendarRef = useRef<FullCalendar>(null);

  const events = interventions.map((i) => ({
    id: i.id,
    title: `${i.client?.nom || 'Client'} - ${i.type_prestation}`,
    start: i.date_intervention,
    allDay: true,
    backgroundColor: i.statut === 'effectuee' ? '#10b981' : i.statut === 'annulee' ? '#ef4444' : '#3b82f6',
    textColor: '#fff',
    borderColor: 'transparent',
    extendedProps: { intervention: i },
  }));

  const handleEventClick = (arg: EventClickArg) => {
    const inter = arg.event.extendedProps.intervention as Intervention & { client?: Client };
    setSelectedIntervention(inter);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Planning</h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events}
            eventClick={handleEventClick}
            height="auto"
            locale="fr"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek',
            }}
            buttonText={{
              today: "Aujourd'hui",
              month: 'Mois',
              week: 'Semaine',
            }}
            noEventsText="Aucune intervention"
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
            }}
          />
        </div>

        <div className="space-y-6">
          {selectedIntervention && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3">D&eacute;tails de l&apos;intervention</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-slate-500 dark:text-slate-400">Client:</span> <span className="font-medium">{selectedIntervention.client?.nom}</span></p>
                <p><span className="text-slate-500 dark:text-slate-400">Date:</span> {new Date(selectedIntervention.date_intervention).toLocaleDateString('fr-FR')}</p>
                <p><span className="text-slate-500 dark:text-slate-400">Prestation:</span> {selectedIntervention.type_prestation}</p>
                <p><span className="text-slate-500 dark:text-slate-400">Statut:</span>{' '}
                  <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${getStatusColor(selectedIntervention.statut)}`}>
                    {getStatusLabel(selectedIntervention.statut)}
                  </span>
                </p>
                {selectedIntervention.montant && (
                  <p><span className="text-slate-500 dark:text-slate-400">Montant:</span> {formatCurrency(selectedIntervention.montant)}</p>
                )}
                {selectedIntervention.notes && (
                  <p><span className="text-slate-500 dark:text-slate-400">Notes:</span> {selectedIntervention.notes}</p>
                )}
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              Carte clients
            </h3>
            <div className="h-72 rounded-lg overflow-hidden">
              <MapContainer
                center={[31.7917, -7.0926]}
                zoom={6}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {clients.filter(c => c.adresse).map((client) => (
                  <Marker
                    key={client.id}
                    position={[31.7917, -7.0926]}
                  >
                    <Popup>
                      <div className="text-sm">
                        <p className="font-semibold">{client.nom}</p>
                        <p className="text-slate-500 dark:text-slate-400">{client.adresse}, {client.ville}</p>
                        {client.telephone && <p className="text-slate-500 dark:text-slate-400">📞 {client.telephone}</p>}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
