'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Client, Intervention, Document as Doc, Service, LigneDocument } from '@/lib/types';
import { formatCurrency, generateDocumentNumber, getStatusColor, getStatusLabel } from '@/lib/utils';
import { PDFDownloadLink } from '@react-pdf/renderer';
import InvoicePDF from '@/components/documents/InvoicePDF';
import QuotePDF from '@/components/documents/QuotePDF';
import DeliveryNotePDF from '@/components/documents/DeliveryNotePDF';
import {
  FileText, Plus, CreditCard, Truck, Download, X, Trash2
} from 'lucide-react';

const ligneVide = (): LigneDocument => ({ designation: '', quantite: 1, prix_unitaire: 0, montant: 0 });

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
  const [lignes, setLignes] = useState<LigneDocument[]>([ligneVide()]);

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

  const totalHT = lignes.reduce((s, l) => s + l.montant, 0);
  const totalTTC = totalHT * 1.2;

  function ajouterLigne() {
    setLignes(prev => [...prev, ligneVide()]);
  }

  function supprimerLigne(idx: number) {
    setLignes(prev => prev.filter((_, i) => i !== idx));
  }

  function majLigne(idx: number, champ: keyof LigneDocument, valeur: string) {
    setLignes(prev => {
      const next = [...prev];
      const ligne = { ...next[idx] };
      if (champ === 'designation') {
        ligne.designation = valeur;
      } else if (champ === 'quantite') {
        ligne.quantite = parseFloat(valeur) || 0;
      } else if (champ === 'prix_unitaire') {
        ligne.prix_unitaire = parseFloat(valeur) || 0;
      }
      ligne.montant = ligne.quantite * ligne.prix_unitaire;
      next[idx] = ligne;
      return next;
    });
  }

  async function saveDocument() {
    if (!selectedClient || lignes.length === 0 || !lignes[0].designation) return;

    const numero = generateDocumentNumber(docType);

    const { error } = await supabase.from('documents').insert([{
      client_id: selectedClient,
      intervention_id: selectedIntervention || null,
      type: docType,
      numero,
      date_emission: new Date().toISOString().split('T')[0],
      montant_ht: totalHT,
      montant_ttc: totalTTC,
      contenu: { lignes },
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
    setLignes([ligneVide()]);
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
      setLignes([{
        designation: last.type_prestation,
        quantite: 1,
        prix_unitaire: last.montant || 0,
        montant: last.montant || 0,
      }]);
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
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Documents</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => openModal('devis')}
            className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition">
            <FileText className="w-4 h-4" /> Devis
          </button>
          <button onClick={() => openModal('facture')}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
            <Plus className="w-4 h-4" /> Facture
          </button>
          <button onClick={() => openModal('bon_livraison')}
            className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition">
            <Truck className="w-4 h-4" /> BL
          </button>
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">Aucun document généré</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Numéro</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Client</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Date</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Montant</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Statut</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => {
                  const clientDoc = doc.client || clients.find(c => c.id === doc.client_id);
                  const labels: Record<string, string> = { devis: 'Devis', facture: 'Facture', bon_livraison: 'Bon Livraison' };
                  const icons: Record<string, any> = { devis: FileText, facture: CreditCard, bon_livraison: Truck };
                  const Icon = icons[doc.type] || FileText;

                  const docLignes = (doc.contenu?.lignes) || [{ designation: 'Prestation', quantite: 1, prix_unitaire: doc.montant_ht || 0, montant: doc.montant_ht || 0 }];

                  return (
                    <tr key={doc.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                          <span className="text-sm text-slate-900 dark:text-white">{labels[doc.type]}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">{doc.numero}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{clientDoc?.nom || '-'}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{new Date(doc.date_emission).toLocaleDateString('fr-FR')}</td>
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
                                  lignes={docLignes}
                                  numero={doc.numero}
                                  date={new Date(doc.date_emission).toLocaleDateString('fr-FR')}
                                />
                              ) : doc.type === 'devis' ? (
                                <QuotePDF
                                  client={clientDoc}
                                  lignes={docLignes}
                                  numero={doc.numero}
                                  date={new Date(doc.date_emission).toLocaleDateString('fr-FR')}
                                />
                              ) : (
                                <DeliveryNotePDF
                                  client={clientDoc}
                                  lignes={docLignes}
                                  numero={doc.numero}
                                  date={new Date(doc.date_emission).toLocaleDateString('fr-FR')}
                                />
                              )
                            }
                            fileName={`${doc.numero}.pdf`}
                          >
                            {({ loading: _loading }) => (
                              <button className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded transition" title="Télécharger PDF">
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
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Nouveau{docType === 'devis' ? ' Devis' : docType === 'facture' ? 'e Facture' : ' Bon de Livraison'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                <X className="w-5 h-5 text-slate-400 dark:text-slate-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
                <select value={docType} onChange={(e) => setDocType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
                  <option value="devis">Devis</option>
                  <option value="facture">Facture</option>
                  <option value="bon_livraison">Bon de Livraison</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Client</label>
                <select value={selectedClient} onChange={(e) => handleClientSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
                  <option value="">Sélectionner un client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.nom}</option>
                  ))}
                </select>
              </div>

              {selectedClient && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Intervention liée</label>
                    <select value={selectedIntervention} onChange={(e) => {
                      setSelectedIntervention(e.target.value);
                      const int = interventions.find(i => i.id === e.target.value);
                      if (int) { setLignes([{ designation: int.type_prestation, quantite: 1, prix_unitaire: int.montant || 0, montant: int.montant || 0 }]); }
                    }}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
                      <option value="">Sans intervention</option>
                      {interventions.filter(i => i.client_id === selectedClient).map((i) => (
                        <option key={i.id} value={i.id}>
                          {new Date(i.date_intervention).toLocaleDateString('fr-FR')} - {i.type_prestation}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ajouter depuis un service</label>
                    <select onChange={(e) => {
                      if (!e.target.value) return;
                      const svc = services.find(s => s.id === e.target.value);
                      if (svc) {
                        setLignes(prev => [...prev, {
                          designation: svc.nom,
                          quantite: 1,
                          prix_unitaire: svc.prix_defaut || 0,
                          montant: svc.prix_defaut || 0,
                        }]);
                      }
                      e.target.value = '';
                    }}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none mb-3">
                      <option value="">-- Choisir un service --</option>
                      {services.filter(s => s.domaine === 'nettoyage').length > 0 && (
                        <optgroup label="🧹 Nettoyage">
                          {services.filter(s => s.domaine === 'nettoyage').map(s => (
                            <option key={s.id} value={s.id}>{s.nom}{s.prix_defaut && s.prix_defaut > 0 ? ` (${s.prix_defaut} MAD)` : ''}</option>
                          ))}
                        </optgroup>
                      )}
                      {services.filter(s => s.domaine === '3d').length > 0 && (
                        <optgroup label="🐭 3D (Dératisation / Désinfection / Désinsectisation)">
                          {services.filter(s => s.domaine === '3d').map(s => (
                            <option key={s.id} value={s.id}>{s.nom}{s.prix_defaut && s.prix_defaut > 0 ? ` (${s.prix_defaut} MAD)` : ''}</option>
                          ))}
                        </optgroup>
                      )}
                    </select>

                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Lignes *</label>
                      <button type="button" onClick={ajouterLigne}
                        className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                        <Plus className="w-3.5 h-3.5" /> Ajouter une ligne
                      </button>
                    </div>
                    <div className="space-y-2">
                      {lignes.map((ligne, idx) => (
                        <div key={idx} className="flex items-start gap-2 p-2 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <input type="text" value={ligne.designation}
                              onChange={(e) => majLigne(idx, 'designation', e.target.value)}
                              className="w-full px-2 py-1.5 text-sm border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded focus:ring-1 focus:ring-emerald-500 outline-none mb-1"
                              placeholder="Désignation" />
                            <div className="flex gap-2">
                              <input type="number" value={ligne.quantite || ''}
                                onChange={(e) => majLigne(idx, 'quantite', e.target.value)}
                                className="w-20 px-2 py-1.5 text-sm border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded focus:ring-1 focus:ring-emerald-500 outline-none"
                                placeholder="Qté" min="1" />
                              <input type="number" value={ligne.prix_unitaire || ''}
                                onChange={(e) => majLigne(idx, 'prix_unitaire', e.target.value)}
                                className="flex-1 px-2 py-1.5 text-sm border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded focus:ring-1 focus:ring-emerald-500 outline-none"
                                placeholder="Prix unitaire" step="0.01" />
                              <div className="w-24 flex items-center justify-end text-sm font-medium text-slate-900 dark:text-white px-2">
                                {ligne.montant.toFixed(2)}
                              </div>
                            </div>
                          </div>
                          {lignes.length > 1 && (
                            <button type="button" onClick={() => supprimerLigne(idx)}
                              className="p-1 text-slate-400 hover:text-red-500 mt-1 shrink-0">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                    <div className="flex justify-end text-sm space-y-1">
                      <div className="w-48 space-y-1">
                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                          <span>Total HT</span>
                          <span className="font-medium text-slate-900 dark:text-white">{totalHT.toFixed(2)} MAD</span>
                        </div>
                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                          <span>TVA (20%)</span>
                          <span className="font-medium text-slate-900 dark:text-white">{(totalHT * 0.20).toFixed(2)} MAD</span>
                        </div>
                        <div className="flex justify-between text-base font-bold text-emerald-600 dark:text-emerald-400 border-t border-slate-200 dark:border-slate-700 pt-1">
                          <span>Total TTC</span>
                          <span>{totalTTC.toFixed(2)} MAD</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition">Annuler</button>
                <button onClick={saveDocument}
                  disabled={!selectedClient || lignes.length === 0 || !lignes[0].designation}
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
