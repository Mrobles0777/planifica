
export enum Level {
  SALA_CUNA = 'Primer Nivel (Sala Cuna)',
  MEDIO = 'Segundo Nivel (Medio)',
  TRANSICION = 'Tercer Nivel (Transición)'
}

export enum PlanningSpan {
  DAILY = 'Día Único',
  WEEKLY = 'Plan Semanal',
  MONTHLY = 'Plan Mensual'
}

/** Subniveles administrativos para el perfil de cada niño/a. */
export enum ChildLevel {
  SC_MENOR = 'Sala Cuna Menor',
  SC_1 = 'SC+1',
  SC_2 = 'SC+2',
  M_1 = 'M-1',
  M_2 = 'M-2',
  M_MAYOR_1 = 'M+1',
  M_MAYOR_2 = 'M+2',
}

/** Agrupación de subniveles para el selector con optgroup. */
export const CHILD_LEVEL_GROUPS: { label: string; options: ChildLevel[] }[] = [
  {
    label: 'Sala Cuna Menor',
    options: [ChildLevel.SC_MENOR]
  },
  {
    label: 'Sala Cuna',
    options: [ChildLevel.SC_1, ChildLevel.SC_2]
  },
  {
    label: 'Medio Menor',
    options: [ChildLevel.M_1, ChildLevel.M_2]
  },
  {
    label: 'Medio Mayor',
    options: [ChildLevel.M_MAYOR_1, ChildLevel.M_MAYOR_2]
  },
];


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
  avatarUrl?: string;
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
  id: string;
  activityName: string;
  description: string;
  indicators: string[];
  materials: string[];
  groundingSources?: GroundingSource[];
  instructions: string;
  evaluation: string;
  level?: Level;
  nucleo?: string;
  objective?: string;
  methodology: Methodology;
  createdAt: string;
  span?: PlanningSpan;
  endDate?: string;
  experienceSummary?: string;
  experienceTable?: {
    day: string;
    activity: string;
    objectives: {
      text: string;
      ambito: string;
      nucleo: string;
    }[];
    description: string;
  }[];
}

export interface ObjectivePlan {
  objective: string;
  ambito?: string;
  nucleo?: string;
  focoObservacion: string[];
  inicio: string;
  desarrollo: string;
  cierre: string;
}

export interface Planning {
  titulo?: string;
  mes?: string;
  nivel?: string;
  equipo?: string;
  metodologia?: string;
  materiales?: string[];
  ambitoNucleo?: string;
  planes: ObjectivePlan[];
  totalPlanes?: number;
  mediacion: string;
  span?: PlanningSpan;
  startDate?: string;
  experienceSummary?: string;
  experienceTable?: {
    day: string;
    activity: string;
    objectives: {
      text: string;
      ambito: string;
      nucleo: string;
    }[];
    description: string;
  }[];
}



export interface Child {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  level: ChildLevel;
  vaccines?: string;
  allergies?: string;
  otherInfo?: string;
  createdAt: string;
}

export type AchievementLevel = 'None' | 'NT1' | 'NT2' | '1 EGB';

export interface EvaluationIndicator {
  id: string;
  text: string;
  evaluations: (AchievementLevel | null)[]; // Array of 3 evaluations as per HTML
  finalAchievement: AchievementLevel;
}

export interface EvaluationSession {
  id: string;
  establishment: string;
  rbd: string;
  level: string;
  year: string;
  childIds: string[]; // Linked to children from Listado Base
  indicators: EvaluationIndicator[];
  createdAt: string;
}
