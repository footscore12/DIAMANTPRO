export function generateDocumentNumber(type: string): string {
  const year = new Date().getFullYear();
  const prefix = type === 'facture' ? 'FACT' : type === 'devis' ? 'DEV' : 'BL';
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `${prefix}-${year}-${random}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'MAD',
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
}

export function isUpcoming(date: string | null): boolean {
  if (!date) return false;
  const visitDate = new Date(date);
  const today = new Date();
  const diff = visitDate.getTime() - today.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days >= 0 && days <= 7;
}

export function daysUntil(date: string | null): number {
  if (!date) return Infinity;
  const visitDate = new Date(date);
  const today = new Date();
  const diff = visitDate.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getStatusColor(statut: string): string {
  switch (statut) {
    case 'planifiee': return 'bg-blue-100 text-blue-800';
    case 'effectuee': return 'bg-green-100 text-green-800';
    case 'annulee': return 'bg-red-100 text-red-800';
    case 'brouillon': return 'bg-gray-100 text-gray-800';
    case 'envoye': return 'bg-yellow-100 text-yellow-800';
    case 'paye': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

export function getStatusLabel(statut: string): string {
  const labels: Record<string, string> = {
    planifiee: 'Planifiée',
    effectuee: 'Effectuée',
    annulee: 'Annulée',
    brouillon: 'Brouillon',
    envoye: 'Envoyé',
    paye: 'Payé',
  };
  return labels[statut] || statut;
}
