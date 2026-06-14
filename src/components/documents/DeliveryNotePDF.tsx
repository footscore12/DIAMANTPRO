'use client';

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Client, LigneDocument } from '@/lib/types';

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
  tableCol1: { width: '40%' },
  tableCol2: { width: '15%', textAlign: 'center' },
  tableCol3: { width: '20%', textAlign: 'right' },
  tableCol4: { width: '25%', textAlign: 'right' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', color: '#a0aec0', fontSize: 8, borderTop: '1 solid #e2e8f0', paddingTop: 10 },
  signature: { marginTop: 40, flexDirection: 'row', justifyContent: 'space-between' },
  signatureBox: { width: '40%' },
  signatureLine: { borderTop: '1 solid #000', marginTop: 30, width: '100%' },
});

interface DeliveryNotePDFProps {
  client: Client;
  lignes: LigneDocument[];
  numero: string;
  date: string;
}

export default function DeliveryNotePDF({ client, lignes, numero, date }: DeliveryNotePDFProps) {
  const total = lignes.reduce((s, l) => s + l.montant, 0);
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>DIAMANT PRO SERVICES</Text>
            <Text style={styles.companyInfo}>Nettoyage & Hygiène Professionnelle</Text>
            <Text style={styles.companyInfo}>ICE: 003387626000054 / RC 57207</Text>
            <Text style={styles.companyInfo}>IF: 60123351 &ndash; TP: 48108614 &ndash; CNSS: 5263199</Text>
            <Text style={styles.companyInfo}>Tél: 0608 24 24 34 &ndash; 0661 23 46 88</Text>
            <Text style={styles.companyInfo}>Email: diamantproservices@gmail.com</Text>
            <Text style={styles.companyInfo}>Adresse: Rue 644 N°22 Khiam 2 Agadir</Text>
          </View>
          <View>
            <Text style={styles.title}>BON DE LIVRAISON</Text>
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
            <Text style={styles.tableCol2}>Qté</Text>
            <Text style={styles.tableCol3}>Prix unitaire</Text>
            <Text style={styles.tableCol4}>Montant (MAD)</Text>
          </View>
          {lignes.map((ligne, idx) => (
            <View style={styles.tableRow} key={idx}>
              <Text style={styles.tableCol1}>{ligne.designation}</Text>
              <Text style={styles.tableCol2}>{ligne.quantite}</Text>
              <Text style={styles.tableCol3}>{ligne.prix_unitaire.toFixed(2)}</Text>
              <Text style={styles.tableCol4}>{ligne.montant.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        <View style={{ marginTop: 15 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, fontSize: 12, fontWeight: 'bold' }}>
            <Text style={{ width: 100 }}>Total:</Text>
            <Text style={{ width: 100, textAlign: 'right' }}>{total.toFixed(2)} MAD</Text>
          </View>
        </View>

        <View style={{ marginTop: 15 }}>
          <Text style={{ fontSize: 9, color: '#718096' }}>Date d&apos;émission: {date}</Text>
        </View>

        <View style={styles.signature}>
          <View style={styles.signatureBox}>
            <Text style={{ fontSize: 9 }}>Cachet et signature du client</Text>
            <View style={styles.signatureLine} />
          </View>
          <View style={styles.signatureBox}>
            <Text style={{ fontSize: 9 }}>Cachet et signature du prestataire</Text>
            <View style={styles.signatureLine} />
          </View>
        </View>

        <Text style={styles.footer}>
          DIAMANT PRO SERVICES - RC 57207 - IF 60123351 - TP 48108614 - CNSS 5263199
        </Text>
      </Page>
    </Document>
  );
}
