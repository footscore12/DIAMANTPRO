'use client';

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Client } from '@/lib/types';

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30, borderBottom: '2 solid #059669', paddingBottom: 15 },
  companyName: { fontSize: 18, fontWeight: 'bold', color: '#059669' },
  companyInfo: { fontSize: 9, color: '#4a5568', marginTop: 2 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#1a202c' },
  row: { flexDirection: 'row', marginBottom: 4 },
  label: { width: 120, color: '#718096' },
  value: { flex: 1, color: '#1a202c' },
  table: { marginTop: 20, marginBottom: 20, border: '1 solid #e2e8f0', borderRadius: 4 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#059669', color: '#fff', padding: 8 },
  tableRow: { flexDirection: 'row', borderBottom: '1 solid #e2e8f0', padding: 8 },
  tableCol1: { width: '60%' },
  tableCol2: { width: '20%', textAlign: 'right' },
  tableCol3: { width: '20%', textAlign: 'right' },
  total: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, fontSize: 12, fontWeight: 'bold' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', color: '#a0aec0', fontSize: 8, borderTop: '1 solid #e2e8f0', paddingTop: 10 },
  validity: { marginTop: 20, padding: 10, backgroundColor: '#f0fff4', borderRadius: 4, border: '1 solid #c6f6d5' },
});

interface QuotePDFProps {
  client: Client;
  prestation: string;
  montant: number;
  numero: string;
  date: string;
}

export default function QuotePDF({ client, prestation, montant, numero, date }: QuotePDFProps) {
  const montantHT = montant;
  const tva = montantHT * 0.20;
  const montantTTC = montantHT + tva;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>DIAMANT PRO SERVICES</Text>
            <Text style={styles.companyInfo}>Nettoyage & Hygiène Professionnelle</Text>
            <Text style={styles.companyInfo}>ICE: XX-XXXXXXX-XX</Text>
            <Text style={styles.companyInfo}>Tél: +212 6 XX XX XX XX</Text>
            <Text style={styles.companyInfo}>Email: contact@diamantpro.ma</Text>
          </View>
          <View>
            <Text style={styles.title}>DEVIS</Text>
            <Text style={{ fontSize: 12, textAlign: 'right', color: '#059669' }}>{numero}</Text>
          </View>
        </View>

        <View style={{ backgroundColor: '#f7fafc', padding: 12, borderRadius: 4, marginBottom: 15 }}>
          <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 6, color: '#059669' }}>CLIENT</Text>
          <View style={styles.row}><Text style={styles.label}>Raison sociale:</Text><Text style={styles.value}>{client.nom}</Text></View>
          {client.adresse && <View style={styles.row}><Text style={styles.label}>Adresse:</Text><Text style={styles.value}>{client.adresse}</Text></View>}
          {client.ville && <View style={styles.row}><Text style={styles.label}>Ville:</Text><Text style={styles.value}>{client.ville}</Text></View>}
          {client.ice && <View style={styles.row}><Text style={styles.label}>ICE:</Text><Text style={styles.value}>{client.ice}</Text></View>}
          {client.telephone && <View style={styles.row}><Text style={styles.label}>Téléphone:</Text><Text style={styles.value}>{client.telephone}</Text></View>}
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCol1}>Désignation</Text>
            <Text style={styles.tableCol2}>Quantité</Text>
            <Text style={styles.tableCol3}>Prix (MAD)</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCol1}>{prestation}</Text>
            <Text style={styles.tableCol2}>1</Text>
            <Text style={styles.tableCol3}>{montantHT.toFixed(2)}</Text>
          </View>
        </View>

        <View style={{ marginTop: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 4 }}>
            <Text style={{ width: 100 }}>Total HT:</Text>
            <Text style={{ width: 100, textAlign: 'right' }}>{montantHT.toFixed(2)} MAD</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 4 }}>
            <Text style={{ width: 100 }}>TVA (20%):</Text>
            <Text style={{ width: 100, textAlign: 'right' }}>{tva.toFixed(2)} MAD</Text>
          </View>
          <View style={styles.total}>
            <Text style={{ width: 100 }}>Total TTC:</Text>
            <Text style={{ width: 100, textAlign: 'right' }}>{montantTTC.toFixed(2)} MAD</Text>
          </View>
        </View>

        <View style={styles.validity}>
          <Text style={{ fontSize: 9, color: '#276749' }}>Ce devis est valable 30 jours à compter de la date d&apos;émission.</Text>
          <Text style={{ fontSize: 9, color: '#276749', marginTop: 2 }}>Date d&apos;émission: {date}</Text>
        </View>

        <Text style={styles.footer}>
          DIAMANT PRO SERVICES - RC: XXXXX - IF: XXXXX - Patente: XXXXX - Banque: XXX XXXX XXXX XXXX XXXX
        </Text>
      </Page>
    </Document>
  );
}
