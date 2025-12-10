export interface TopMarketIndicator {
  id: number;
  nom_indicateur: string;
  categorie: 'sentiment' | 'on_chain' | 'macro' | 'trends';
  valeur_numerique: number;
  valeur_texte: 'OUI' | 'NON';
  unite: string;
  source_api: string;
  delta_erreur_attendu: number;
  date_valeur: string;
  metadata: Record<string, any>;
  derniere_maj: string;
}

export interface TopMarketIndicatorDisplay {
  label: string;
  value: string;
  status: 'positive' | 'negative' | 'neutral';
  detail?: string;
  updatedAt: string;
}
