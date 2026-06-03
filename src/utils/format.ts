export function fcfa(val: number | string | null | undefined): string {
  const n = parseFloat(String(val ?? 0));
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(isNaN(n) ? 0 : n)) + " FCFA";
}

export function pct(val: number | string | null | undefined): string {
  const n = parseFloat(String(val ?? 0));
  return (isNaN(n) ? 0 : n * 100).toFixed(2) + " %";
}

export const MOIS = [
  "Janvier","Février","Mars","Avril","Mai","Juin",
  "Juillet","Août","Septembre","Octobre","Novembre","Décembre",
];

export function moisLabel(mois: number, annee: number): string {
  return `${MOIS[(mois || 1) - 1]} ${annee}`;
}

export function statutBadgeClass(statut: string): string {
  const map: Record<string, string> = {
    CLOTURE: "badge-gray",
    VALIDE: "badge-green",
    BROUILLON: "badge-yellow",
  };
  return map[statut] ?? "badge-gray";
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("fr-FR");
}
