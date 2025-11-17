
import { useState, useEffect } from 'react';
import { Athlete, AssessmentData, AssessmentType, Bioimpedance, Cmj, GeneralStrength, GeneralStrengthExercise, IsometricStrength, Vo2max } from './types';
import toast from 'react-hot-toast';

// Base URL for the API. In a Vercel environment, serverless functions are typically under /api
const API_BASE_URL = '/api';

// --- REAL BACKEND API (Currently Inactive) ---
// This section contains functions that will make network requests to a backend.
// These endpoints need to be created in the backend (e.g., using Vercel Serverless Functions)
// which will then connect to the Vercel cloud database.
// NOTE: This is commented out to use the mock API below while the backend is under development.
/*
const api_real = {
    async getAthletes(): Promise<Athlete[]> {
        const response = await fetch(`${API_BASE_URL}/athletes`);
        if (!response.ok) throw new Error("Falha ao buscar atletas do servidor.");
        return response.json();
    },

    async addAthlete(athleteData: Omit<Athlete, 'id' | 'assessments'>): Promise<Athlete> {
        const response = await fetch(`${API_BASE_URL}/athletes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(athleteData),
        });
        if (!response.ok) throw new Error("Falha ao adicionar atleta.");
        return response.json();
    },

    async updateAthlete(updatedAthlete: Athlete): Promise<Athlete> {
        const response = await fetch(`${API_BASE_URL}/athletes/${updatedAthlete.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedAthlete),
        });
        if (!response.ok) throw new Error("Falha ao atualizar atleta.");
        return response.json();
    },
    
    async deleteAthlete(athleteId: string): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/athletes/${athleteId}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error("Falha ao excluir atleta.");
    },

    async addAssessment(athleteId: string, type: AssessmentType, data: Omit<AssessmentData, 'id'>): Promise<AssessmentData> {
        const response = await fetch(`${API_BASE_URL}/athletes/${athleteId}/${type}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error(`Falha ao adicionar avaliação de ${type}.`);
        return response.json();
    },

    async updateAssessment(athleteId: string, type: AssessmentType, updatedData: AssessmentData): Promise<AssessmentData> {
        const response = await fetch(`${API_BASE_URL}/athletes/${athleteId}/${type}/${updatedData.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData),
        });
        if (!response.ok) throw new Error(`Falha ao atualizar avaliação de ${type}.`);
        return response.json();
    },

    async deleteAssessment(athleteId: string, type: AssessmentType, assessmentId: string): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/athletes/${athleteId}/${type}/${assessmentId}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error(`Falha ao excluir avaliação de ${type}.`);
    }
};
*/

// --- MOCK BACKEND API (For Development) ---
// This mock API simulates a real backend. It uses an in-memory database.
// This allows for frontend development and testing without a live backend server.
// When your backend is ready, switch the `api` export to `api_real`.

const MOCK_ATHLETES: Athlete[] = [
  {
    id: 'a1b2c3d4',
    name: 'João da Silva',
    dob: '1995-05-15',
    injuryHistory: 'Entorse de tornozelo em 2022.',
    assessments: {
      bioimpedance: [
        { id: 'b1', date: '2024-01-15T00:00:00.000Z', weight: 78, fatPercentage: 12, muscleMass: 66, visceralFat: 4, hydration: 62, observations: 'Melhora na composição corporal.' },
        { id: 'b2', date: '2023-10-01T00:00:00.000Z', weight: 80, fatPercentage: 15, muscleMass: 65, visceralFat: 5, hydration: 60, observations: 'Primeira avaliação.' }
      ],
      isometricStrength: [
        { id: 'i1', date: '2024-02-01T00:00:00.000Z', quadricepsR: 75, quadricepsL: 76, hamstringsR: 45, hamstringsL: 44, observations: 'Aumento de força bilateral.' },
        { id: 'i2', date: '2023-10-01T00:00:00.000Z', quadricepsR: 70, quadricepsL: 72, hamstringsR: 40, hamstringsL: 41, observations: 'Leve assimetria em quadríceps.' },
      ],
      generalStrength: [
        { id: 'g1', date: '2024-01-15T00:00:00.000Z', exercise: GeneralStrengthExercise.HALF_SQUAT, load: 110 },
        { id: 'g2', date: '2023-10-01T00:00:00.000Z', exercise: GeneralStrengthExercise.HALF_SQUAT, load: 100 },
        { id: 'g3', date: '2024-01-15T00:00:00.000Z', exercise: GeneralStrengthExercise.BENCH_PRESS, load: 85 },
        { id: 'g4', date: '2023-10-01T00:00:00.000Z', exercise: GeneralStrengthExercise.BENCH_PRESS, load: 80 },
      ],
      cmj: [
        { id: 'c1', date: '2024-01-20T00:00:00.000Z', height: 42.5, power: 4200, depth: 21, unilateralJumpL: 25, unilateralJumpR: 26 },
        { id: 'c2', date: '2023-10-01T00:00:00.000Z', height: 40, power: 4000, depth: 20 },
      ],
      vo2max: [
         { id: 'v1', date: '2023-11-20T00:00:00.000Z', vo2max: 52.5, maxHeartRate: 195, thresholdHeartRate: 175, maxVentilation: 150.1, thresholdVentilation: 120.5, maxLoad: 18, thresholdLoad: 15.5, vam: 18.2, rec10s: 30, rec30s: 50, rec60s: 70, score: 85, observations: 'Excelente performance no teste.' },
      ],
    },
  },
  {
    id: 'e5f6g7h8',
    name: 'Maria Oliveira',
    dob: '1998-09-20',
    injuryHistory: 'Sem histórico de lesões graves.',
    assessments: {
      bioimpedance: [
          { id: 'b3', date: '2024-03-01T00:00:00.000Z', weight: 60, fatPercentage: 22, muscleMass: 45, visceralFat: 3, hydration: 58 }
      ],
      isometricStrength: [],
      generalStrength: [],
      cmj: [],
      vo2max: [],
    },
  },
];

const MOCK_DB = {
    athletes: JSON.parse(JSON.stringify(MOCK_ATHLETES)),
};

const mockApi = {
    async getAthletes(): Promise<Athlete[]> {
        return new Promise(resolve => setTimeout(() => resolve(JSON.parse(JSON.stringify(MOCK_DB.athletes))), 300));
    },

    async addAthlete(athleteData: Omit<Athlete, 'id' | 'assessments'>): Promise<Athlete> {
        return new Promise(resolve => {
            setTimeout(() => {
                const newAthlete: Athlete = {
                    ...athleteData,
                    id: `mock_${Date.now()}`,
                    assessments: {
                        bioimpedance: [],
                        isometricStrength: [],
                        generalStrength: [],
                        cmj: [],
                        vo2max: [],
                    },
                };
                MOCK_DB.athletes.push(newAthlete);
                resolve(JSON.parse(JSON.stringify(newAthlete)));
            }, 300);
        });
    },

    async updateAthlete(updatedAthlete: Athlete): Promise<Athlete> {
         return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = MOCK_DB.athletes.findIndex(a => a.id === updatedAthlete.id);
                if (index > -1) {
                    MOCK_DB.athletes[index] = { ...MOCK_DB.athletes[index], ...updatedAthlete };
                    resolve(JSON.parse(JSON.stringify(MOCK_DB.athletes[index])));
                } else {
                    reject(new Error("Atleta não encontrado."));
                }
            }, 300);
        });
    },
    
    async deleteAthlete(athleteId: string): Promise<void> {
        return new Promise(resolve => {
            setTimeout(() => {
                MOCK_DB.athletes = MOCK_DB.athletes.filter(a => a.id !== athleteId);
                resolve();
            }, 300);
        });
    },

    async addAssessment(athleteId: string, type: AssessmentType, data: Omit<AssessmentData, 'id'>): Promise<AssessmentData> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const athlete = MOCK_DB.athletes.find(a => a.id === athleteId);
                if (athlete) {
                    // FIX: Add type assertion because TypeScript cannot correctly infer the type when spreading a union type.
                    const newAssessment = { ...data, id: `mock_asm_${Date.now()}` } as AssessmentData;
                    (athlete.assessments[type] as AssessmentData[]).unshift(newAssessment);
                    resolve(JSON.parse(JSON.stringify(newAssessment)));
                } else {
                    reject(new Error("Atleta não encontrado."));
                }
            }, 300);
        });
    },

    async updateAssessment(athleteId: string, type: AssessmentType, updatedData: AssessmentData): Promise<AssessmentData> {
         return new Promise((resolve, reject) => {
            setTimeout(() => {
                const athlete = MOCK_DB.athletes.find(a => a.id === athleteId);
                if (athlete) {
                    const assessmentList = athlete.assessments[type] as AssessmentData[];
                    const index = assessmentList.findIndex(a => a.id === updatedData.id);
                    if (index > -1) {
                        assessmentList[index] = updatedData;
                        resolve(JSON.parse(JSON.stringify(updatedData)));
                    } else {
                        reject(new Error("Avaliação não encontrada."));
                    }
                } else {
                    reject(new Error("Atleta não encontrado."));
                }
            }, 300);
        });
    },

    async deleteAssessment(athleteId: string, type: AssessmentType, assessmentId: string): Promise<void> {
         return new Promise((resolve, reject) => {
            setTimeout(() => {
                const athlete = MOCK_DB.athletes.find(a => a.id === athleteId);
                if (athlete) {
                    const assessments = athlete.assessments[type] as AssessmentData[];
                    athlete.assessments[type] = assessments.filter(a => a.id !== assessmentId) as any;
                    resolve();
                } else {
                     reject(new Error("Atleta não encontrado."));
                }
            }, 300);
        });
    }
};

// Use the mock API for development
const api = mockApi;

export const useAthletes = () => {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAthletes = async () => {
        setLoading(true);
        try {
            const data = await api.getAthletes();
            setAthletes(data);
        } catch (err) {
            console.error(err);
            toast.error("Falha ao carregar dados do servidor. O backend está funcionando?");
            setAthletes([]); // Set to empty array on failure to prevent crashes
        } finally {
            setLoading(false);
        }
    };

    fetchAthletes();
  }, []);

  const addAthlete = async (athleteData: Omit<Athlete, 'id' | 'assessments'>) => {
    try {
        const newAthlete = await api.addAthlete(athleteData);
        setAthletes(prev => [...prev, newAthlete].sort((a,b) => a.name.localeCompare(b.name)));
        toast.success(`${athleteData.name} adicionado(a) com sucesso!`);
    } catch (error) {
        console.error(error);
        toast.error((error as Error).message || "Falha ao adicionar atleta.");
    }
  };

  const updateAthlete = async (updatedAthlete: Athlete) => {
    try {
        const savedAthlete = await api.updateAthlete(updatedAthlete);
        setAthletes(prev => prev.map(a => a.id === savedAthlete.id ? savedAthlete : a));
        toast.success(`${updatedAthlete.name} atualizado(a) com sucesso!`);
    } catch (error) {
        console.error(error);
        toast.error((error as Error).message || "Falha ao atualizar atleta.");
    }
  };
  
  const deleteAthlete = async (athleteId: string) => {
    try {
        await api.deleteAthlete(athleteId);
        setAthletes(prev => prev.filter(a => a.id !== athleteId));
        toast.success("Atleta excluído com sucesso.");
    } catch (error) {
        console.error(error);
        toast.error((error as Error).message || "Falha ao excluir atleta.");
    }
  };

  const addAssessment = async (athleteId: string, type: AssessmentType, data: Omit<AssessmentData, 'id'>) => {
    try {
        const newAssessment = await api.addAssessment(athleteId, type, data);
        setAthletes(prev => prev.map(athlete => {
          if (athlete.id === athleteId) {
            const updatedAssessments = {
              ...athlete.assessments,
              [type]: [...athlete.assessments[type], newAssessment].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
            };
            return { ...athlete, assessments: updatedAssessments };
          }
          return athlete;
        }));
        toast.success(`Nova avaliação de ${type} adicionada.`);
    } catch (error) {
        console.error(error);
        toast.error((error as Error).message || `Falha ao adicionar avaliação de ${type}.`);
    }
  };

  const updateAssessment = async (athleteId: string, type: AssessmentType, updatedData: AssessmentData) => {
    try {
        const savedAssessment = await api.updateAssessment(athleteId, type, updatedData);
        setAthletes(prev => prev.map(athlete => {
            if (athlete.id === athleteId) {
                const updatedAssessmentsList = athlete.assessments[type]
                    .map(asm => asm.id === savedAssessment.id ? savedAssessment : asm)
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                return {
                    ...athlete,
                    assessments: {
                        ...athlete.assessments,
                        [type]: updatedAssessmentsList
                    }
                };
            }
            return athlete;
        }));
        toast.success(`Avaliação de ${type} atualizada.`);
    } catch (error) {
        console.error(error);
        toast.error((error as Error).message || `Falha ao atualizar avaliação de ${type}.`);
    }
  };

  const deleteAssessment = async (athleteId: string, type: AssessmentType, assessmentId: string) => {
    try {
        await api.deleteAssessment(athleteId, type, assessmentId);
        setAthletes(prev => prev.map(athlete => {
            if (athlete.id === athleteId) {
                const updatedAssessmentsList = athlete.assessments[type].filter(asm => asm.id !== assessmentId);
                return {
                    ...athlete,
                    assessments: {
                        ...athlete.assessments,
                        [type]: updatedAssessmentsList
                    }
                };
            }
            return athlete;
        }));
        toast.success(`Avaliação de ${type} excluída com sucesso.`);
    } catch (error) {
        console.error(error);
        toast.error((error as Error).message || `Falha ao excluir avaliação de ${type}.`);
    }
  };


  return { athletes, loading, addAthlete, updateAthlete, deleteAthlete, addAssessment, updateAssessment, deleteAssessment };
};
