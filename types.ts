
export enum Level {
  SALA_CUNA = 'Primer Nivel (Sala Cuna)',
  MEDIO = 'Segundo Nivel (Medio)',
  TRANSICION = 'Tercer Nivel (Transición)'
}

export enum Methodology {
  STANDARD = 'Estándar (BCEP)',
  WALDORF = 'Inspiración Waldorf',
  MONTESSORI = 'Inspiración Montessori'
}

export interface User {
  firstName: string;
  lastName: string;
  email?: string;
  location: string;
  phone: string;
  password?: string;
  isGoogleUser?: boolean;
}

export interface Objective {
  id: number;
  text: string;
}

export interface Nucleo {
  name: string;
  ambito: string;
  objectives: {
    [key in Level]: Objective[];
  };
}

export interface GroundingSource {
  title: string;
  url: string;
}

export interface GeneratedAssessment {
  activityName: string;
  description: string;
  indicators: string[];
  materials: string[];
  groundingSources?: GroundingSource[];
  createdAt: string;
  level: Level;
  nucleo: string;
  objective: string;
  methodology: Methodology;
}

export interface ObjectivePlan {
  objective: string;
  focoObservacion: string[];
  inicio: string;
  desarrollo: string;
  cierre: string;
}

export interface Planning {
  nivel: string;
  equipo?: string;
  mes?: string;
  ambitoNucleo: string;
  planes: ObjectivePlan[];
  mediacion: string;
}
