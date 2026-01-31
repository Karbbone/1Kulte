export enum CulturalPlaceType {
  ART = 'art',
  PATRIMOINE = 'patrimoine',
  MYTHE = 'mythe',
  MUSIQUE = 'musique',
}

export const CulturalPlaceTypeLabels: Record<CulturalPlaceType, string> = {
  [CulturalPlaceType.ART]: 'Art',
  [CulturalPlaceType.PATRIMOINE]: 'Patrimoine',
  [CulturalPlaceType.MYTHE]: 'Mythe',
  [CulturalPlaceType.MUSIQUE]: 'Musique',
};

export interface CulturalPlace {
  id: string;
  name: string;
  description?: string;
  postCode: string;
  city: string;
  latitude?: number;
  longitude?: number;
  type: CulturalPlaceType;
  createdAt: Date;
  updatedAt: Date;
}
