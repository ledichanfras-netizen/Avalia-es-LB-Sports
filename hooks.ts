

import { useState, useEffect } from 'react';
// FIX: Import GeneralStrengthExercise to use enum members directly and ensure type safety.
import { Athlete, AssessmentData, AssessmentType, GeneralStrengthExercise } from './types';
import toast from 'react-hot-toast';

const MOCK_ATHLETES: Athlete[] = [
    {
      id: '1',
      name: 'Carlos Alexandre',
      dob: '1982-05-20',
      injuryHistory: 'Nenhuma lesão significativa reportada.',
      assessments: {
        bioimpedance: [
          { id: 'b1', date: '2023-10-15', weight: 84.0, fatPercentage: 18.5, muscleMass: 38.2, visceralFat: 8, hydration: 55 },
          { id: 'b2', date: '2024-01-20', weight: 83.5, fatPercentage: 17.2, muscleMass: 38.9, visceralFat: 7, hydration: 57 },
          { id: 'b3', date: '2024-04-25', weight: 83.3, fatPercentage: 16.8, muscleMass: 39.1, visceralFat: 7, hydration: 58, observations: 'Manter o foco na hidratação e continuar com o plano de treino para ganho de massa magra. Resultados excelentes.' },
        ],
        isometricStrength: [
           { id: 'is-2', date: '2024-01-20', quadricepsR: 35.5, quadricepsL: 36.0, hamstringsR: 19.0, hamstringsL: 21.0, observations: 'Força bem equilibrada, continuar o trabalho de manutenção.' },
           { id: 'is1', date: '2024-04-25', quadricepsR: 37.02, quadricepsL: 38.07, hamstringsR: 20.10, hamstringsL: 22.01, observations: 'Razão I/Q da perna direita um pouco elevada. Focar em exercícios de fortalecimento para isquiotibiais da perna direita para reequilibrar.' },
        ],
        generalStrength: [
          // FIX: Used the enum member for type safety, removing the 'as any' cast.
          { id: 'gs1', date: '2024-04-25', exercise: GeneralStrengthExercise.HALF_SQUAT, load: 120 },
          { id: 'gs2', date: '2024-01-20', exercise: GeneralStrengthExercise.HALF_SQUAT, load: 110 },
          { id: 'gs3', date: '2024-04-25', exercise: GeneralStrengthExercise.BENCH_PRESS, load: 80 },
          { id: 'gs4', date: '2024-01-20', exercise: GeneralStrengthExercise.BENCH_PRESS, load: 75 },
          { id: 'gs5', date: '2024-04-25', exercise: GeneralStrengthExercise.ROW, load: 70 },
        ],
        cmj: [
          { id: 'cmj1', date: '2024-04-25', height: 30.41, power: 3776, depth: 15.2, unilateralJumpR: 25.1, unilateralJumpL: 24.5, load: 0 },
        ],
        vo2max: [
          { id: 'v1', date: '2024-04-25', vo2max: 51.38, maxHeartRate: 162, thresholdHeartRate: 148, maxVentilation: 149.5, thresholdVentilation: 123.66, maxLoad: 16, thresholdLoad: 13, vam: 15.66, rec10s: -19, rec30s: -37, rec60s: -57, score: 81 },
        ]
      },
    },
    {
        id: '2',
        name: 'Manuela Silva',
        dob: '1995-11-10',
        injuryHistory: 'Entorse de tornozelo esquerdo em 2022.',
        assessments: {
            bioimpedance: [
                { id: 'm-b1', date: '2024-05-01', weight: 62.0, fatPercentage: 22.1, muscleMass: 28.5, visceralFat: 4, hydration: 54 },
            ],
            isometricStrength: [],
            generalStrength: [],
            cmj: [],
            vo2max: []
        }
    }
  ];

// --- BACKEND API ---
// This section communicates with a backend API, using a "load all/save all" pattern
// with the endpoints '/api/ler' and '/api/salvar' as requested.
const api = {
    async loadAthletes(): Promise<Athlete[]> {
        try {
            const response = await fetch('/api/ler'); // Endpoint from user prompt
            if (response.ok) {
                const data = await response.json();
                if (data && data.length > 0) return data;
            }
            console.warn('API call to /api/ler failed or returned no data. Falling back to mock data.');
            return JSON.parse(JSON.stringify(MOCK_ATHLETES));
        } catch (error) {
            console.error('Network error fetching from /api/ler, falling back to mock data.', error);
            return JSON.parse(JSON.stringify(MOCK_ATHLETES));
        }
    },

    async saveAthletes(athletes: Athlete[]): Promise<void> {
        try {
            const response = await fetch('/api/salvar', { // Endpoint from user prompt
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(athletes),
            });
            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`Server error: ${response.status} ${errorBody}`);
            }
        } catch (error) {
            console.error(`API call to /api/salvar failed: ${error}.`);
            throw error;
        }
    }
};

export const useAthletes = () => {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.loadAthletes().then(data => {
      setAthletes(data);
    }).catch(err => {
        console.error(err);
        toast.error("Falha ao carregar os dados dos atletas.");
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const performOptimisticUpdate = async (updatedAthletes: Athlete[], successMessage: string, errorMessage: string) => {
    const originalAthletes = athletes;
    setAthletes(updatedAthletes);
    try {
        await api.saveAthletes(updatedAthletes);
        toast.success(successMessage);
    } catch (error) {
        toast.error(errorMessage);
        // Revert state on failure to keep UI in sync with the backend
        setAthletes(originalAthletes);
    }
  };

  const addAthlete = async (athleteData: Omit<Athlete, 'id' | 'assessments'>) => {
    const newAthlete: Athlete = {
        ...athleteData,
        id: `athlete-${Date.now()}`,
        assessments: { bioimpedance: [], isometricStrength: [], generalStrength: [], cmj: [], vo2max: [] },
    };
    const newAthletes = [...athletes, newAthlete];
    await performOptimisticUpdate(
        newAthletes,
        `${athleteData.name} adicionado(a) com sucesso!`,
        "Falha ao salvar atleta. Revertendo alterações."
    );
  };

  const updateAthlete = async (updatedAthlete: Athlete) => {
    const newAthletes = athletes.map(a => a.id === updatedAthlete.id ? updatedAthlete : a);
    await performOptimisticUpdate(
        newAthletes,
        `${updatedAthlete.name} atualizado(a) com sucesso!`,
        "Falha ao atualizar atleta. Revertendo alterações."
    );
  };
  
  const deleteAthlete = async (athleteId: string) => {
    const newAthletes = athletes.filter(a => a.id !== athleteId);
    await performOptimisticUpdate(
        newAthletes,
        "Atleta excluído com sucesso.",
        "Falha ao excluir atleta. Revertendo alterações."
    );
  };

  const addAssessment = async (athleteId: string, type: AssessmentType, data: Omit<AssessmentData, 'id'>) => {
    const newAssessment = { ...data, id: `assessment-${Date.now()}` } as AssessmentData;
    const newAthletes = athletes.map(athlete => {
      if (athlete.id === athleteId) {
        const updatedAssessments = {
          ...athlete.assessments,
          [type]: [...athlete.assessments[type], newAssessment].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        };
        return { ...athlete, assessments: updatedAssessments };
      }
      return athlete;
    });
    await performOptimisticUpdate(
        newAthletes,
        `Nova avaliação de ${type} adicionada.`,
        `Falha ao adicionar avaliação de ${type}. Revertendo.`
    );
  };

  const updateAssessment = async (athleteId: string, type: AssessmentType, updatedData: AssessmentData) => {
    const newAthletes = athletes.map(athlete => {
        if (athlete.id === athleteId) {
            const updatedAssessmentsList = athlete.assessments[type]
                .map(asm => asm.id === updatedData.id ? updatedData : asm)
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
    });
    await performOptimisticUpdate(
        newAthletes,
        `Avaliação de ${type} atualizada.`,
        `Falha ao atualizar avaliação de ${type}. Revertendo.`
    );
  };

  const deleteAssessment = async (athleteId: string, type: AssessmentType, assessmentId: string) => {
    const newAthletes = athletes.map(athlete => {
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
    });
    await performOptimisticUpdate(
        newAthletes,
        `Avaliação de ${type} excluída com sucesso.`,
        `Falha ao excluir avaliação de ${type}. Revertendo.`
    );
  };


  return { athletes, loading, addAthlete, updateAthlete, deleteAthlete, addAssessment, updateAssessment, deleteAssessment };
};
