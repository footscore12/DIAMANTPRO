'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Client, Intervention, Document as Doc, Service } from '@/lib/types';
import { formatCurrency, generateDocumentNumber, getStatusColor, getStatusLabel } from '@/lib/utils';
import { PDFDownloadLink } from '@react-pdf/renderer';
import InvoicePDF from '@/components/documents/InvoicePDF';
import QuotePDF from '@/components/documents/QuotePDF';
import DeliveryNotePDF from '@/components/documents/DeliveryNotePDF';
import {
  FileText, Plus, CreditCard, Truck, Download, X
} from 'lucide-react';

export default function DocumentsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [documents, setDocuments] = useState<Doc[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [docType, setDocType] = useState<'devis' | 'facture' | 'bon_livraison'>('facture');
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedIntervention, setSelectedIntervention] = useState('');
  const [montant, setMontant] = useState('');
  const [prestation, setPrestation] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [cl, ints, docs, svs] = await Promise.all([
      supabase.from('clients').select('*').order('nom'),
      supabase.from('interventions').select('*').order('date_intervention', { ascending: false }),
      supabase.from('documents').select('*, client:clients(*)').order('created_at', { ascending: false }),
      supabase.from('services').select('*').order('domaine').order('nom'),
    ]);
    if (cl.data) setClients(cl.data);
    if (ints.data) setInterventions(ints.data);
    if (docs.data) setDocuments(docs.data as any);
    if (svs.data) setServices(svs.data);
    setLoading(false);
  }

  async function saveDocument() {
    if (!selectedClient || !montant) return;

    const numero = generateDocumentNumber(docType);

    const { error } = await supabase.from('documents').insert([{
      client_id: selectedClient,
      intervention_id: selectedIntervention || null,
      type: docType,
      numero,
      date_emission: new Date().toISOString().split('T')[0],
      montant_ht: parseFloat(montant),
      montant_ttc: parseFloat(montant) * 1.2,
      statut: 'brouillon',
    }]);

    if (!error) {
      setShowModal(false);
      loadData();
      resetForm();
    }
  }

  function resetForm() {
    setSelectedClient('');
    setSelectedIntervention('');
    setMontant('');
    setPrestation('');
  }

  function openModal(type: 'devis' | 'facture' | 'bon_livraison') {
    setDocType(type);
    setShowModal(true);
  }

  function handleClientSelect(clientId: string) {
    setSelectedClient(clientId);
    const clientInts = interventions.filter(i => i.client_id === clientId);
    if (clientInts.length > 0) {
      const last = clientInts[0];
      setSelectedIntervention(last.id);
      setMontant(last.montant?.toString() || '');
      setPrestation(last.type_prestation);
    }
  }

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
        <h1 className="text-2xl font-bold text-slate-900">Documents</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => openModal('devis')}
            className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition">
            <FileText className="w-4 h-4" /> Devis
          </button>
          <button onClick={() => openModal('facture')}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
            <Plus className="w-4 h-4" /> Facture
          </button>
          <button onClick={() => openModal('bon_livraison')}
            className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition">
            <Truck className="w-4 h-4" /> BL
          </button>
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">Aucun document généré</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Numéro</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Client</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Date</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase">Montant</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-slate-500 uppercase">Statut</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => {
                  const clientDoc = doc.client || clients.find(c => c.id === doc.client_id);
                  const labels: Record<string, string> = { devis: 'Devis', facture: 'Facture', bon_livraison: 'Bon Livraison' };
                  const icons: Record<string, any> = { devis: FileText, facture: CreditCard, bon_livraison: Truck };
                  const Icon = icons[doc.type] || FileText;

                  const docForPdf = { client: clientDoc!, intervention: interventions.find(i => i.id === doc.intervention_id) || interventions[0] };

                  return (
                    <tr key={doc.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-900">{labels[doc.type]}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{doc.numero}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{clientDoc?.nom || '-'}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{new Date(doc.date_emission).toLocaleDateString('fr-FR')}</td>
                      <td className="px-4 py-3 text-sm text-right font-medium">{formatCurrency(doc.montant_ttc || 0)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${getStatusColor(doc.statut)}`}>
                          {getStatusLabel(doc.statut)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {clientDoc && (
                          <PDFDownloadLink
                            document={
                              doc.type === 'facture' ? (
                                <InvoicePDF
                                  client={clientDoc}
                                  intervention={docForPdf.intervention}
                                  numero={doc.numero}
                                  date={new Date(doc.date_emission).toLocaleDateString('fr-FR')}
                                />
                              ) : doc.type === 'devis' ? (
                                <QuotePDF
                                  client={clientDoc}
                                  prestation={docForPdf.intervention?.type_prestation || 'Prestation'}
                                  montant={doc.montant_ht || 0}
                                  numero={doc.numero}
                                  date={new Date(doc.date_emission).toLocaleDateString('fr-FR')}
                                />
                              ) : (
                                <DeliveryNotePDF
                                  client={clientDoc}
                                  intervention={docForPdf.intervention}
                                  numero={doc.numero}
                                  date={new Date(doc.date_emission).toLocaleDateString('fr-FR')}
                                />
                              )
                            }
                            fileName={`${doc.numero}.pdf`}
                          >
                            {({ loading: _loading }) => (
                              <button className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition" title="Télécharger PDF">
                                <Download className="w-4 h-4" />
                              </button>
                            )}
                          </PDFDownloadLink>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Nouveau{docType === 'devis' ? ' Devis' : docType === 'facture' ? 'e Facture' : ' Bon de Livraison'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 rounded">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select value={docType} onChange={(e) => setDocType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
                  <option value="devis">Devis</option>
                  <option value="facture">Facture</option>
                  <option value="bon_livraison">Bon de Livraison</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Client</label>
                <select value={selectedClient} onChange={(e) => handleClientSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
                  <option value="">Sélectionner un client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.nom}</option>
                  ))}
                </select>
              </div>

              {selectedClient && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Intervention liée</label>
                    <select value={selectedIntervention} onChange={(e) => {
                      setSelectedIntervention(e.target.value);
                      const int = interventions.find(i => i.id === e.target.value);
                      if (int) { setMontant(int.montant?.toString() || ''); setPrestation(int.type_prestation); }
                    }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
                      <option value="">Sans intervention</option>
                      {interventions.filter(i => i.client_id === selectedClient).map((i) => (
                        <option key={i.id} value={i.id}>
                          {new Date(i.date_intervention).toLocaleDateString('fr-FR')} - {i.type_prestation}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Prestation</label>
                    <div className="flex gap-2">
                      <input type="text" value={prestation} onChange={(e) => setPrestation(e.target.value)}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Ou taper directement" />
                      <select onChange={(e) => {
                        const svc = services.find(s => s.id === e.target.value);
                        if (svc) {
                          setPrestation(svc.nom);
                          if (!montant && svc.prix_defaut && svc.prix_defaut > 0) setMontant(svc.prix_defaut.toString());
                        }
                      }}
                        className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
                        <option value="">Services</option>
                        {services.filter(s => s.domaine === 'nettoyage').map(s => (
                          <option key={s.id} value={s.id}>🧹 {s.nom}</option>
                        ))}
                        {services.filter(s => s.domaine === '3d').map(s => (
                          <option key={s.id} value={s.id}>🐭 {s.nom}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Montant HT (MAD)</label>
                    <input type="number" step="0.01" value={montant} onChange={(e) => setMontant(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition">Annuler</button>
                <button onClick={saveDocument}
                  disabled={!selectedClient || !montant}
                  className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50">
                  Générer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
