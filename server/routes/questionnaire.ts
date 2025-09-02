import { RequestHandler } from "express";

interface QuestionnaireRequest {
  session_id: string;
  fas_answers: number[]; // [1-5, 1-5, 1-5]
  psqi_answers: number[]; // [1-4, 1-4, 1-4, 1-4]
  pa_answer: number; // 0-3
  duration_ms?: number;
  timestamp: string;
}

interface QuestionnaireResponse {
  status: "success" | "error";
  scores?: {
    fas: number; // 0-3
    psqi: number; // 0-3
    pa: number; // 0-3
  };
  total_score?: number; // 0-21
  classification?: string;
  message?: string;
  recommendations?: string[];
}

// AI-FatMoS scoring algorithms
const calculateFASScore = (answers: number[]): number => {
  const total = answers.reduce((sum, val) => sum + val, 0);
  // Total: 3-15 → AI: 0-3
  if (total <= 5) return 0;      // 3-5 = 0
  if (total <= 8) return 1;      // 6-8 = 1
  if (total <= 11) return 2;     // 9-11 = 2
  return 3;                      // 12-15 = 3
};

const calculatePSQIScore = (answers: number[]): number => {
  const total = answers.reduce((sum, val) => sum + val, 0);
  // Total: 4-16 → AI: 0-3
  if (total <= 6) return 0;      // 4-6 = 0
  if (total <= 9) return 1;      // 7-9 = 1
  if (total <= 12) return 2;     // 10-12 = 2
  return 3;                      // 13-16 = 3
};

const getClassification = (totalScore: number): string => {
  if (totalScore <= 5) return "Fit";          // 0-5
  if (totalScore <= 9) return "Mild Fatigue";     // 6-9
  if (totalScore <= 14) return "Moderate Fatigue"; // 10-14
  return "Severe Fatigue";                    // 15-21
};

const getRecommendations = (scores: any, totalScore: number): string[] => {
  const recommendations: string[] = [];
  
  if (totalScore >= 15) {
    recommendations.push("Segera lakukan skrining medis atau rujukan");
    recommendations.push("Pertimbangkan rotasi atau cuti");
    recommendations.push("Konsultasi dengan supervisor untuk penyesuaian beban kerja");
  } else if (totalScore >= 10) {
    recommendations.push("Evaluasi shift dan beban kerja dengan supervisor");
    recommendations.push("Ambil istirahat yang cukup");
    recommendations.push("Monitor kondisi lebih ketat");
  } else if (totalScore >= 6) {
    recommendations.push("Ambil istirahat aktif setiap 2 jam");
    recommendations.push("Pastikan hidrasi yang cukup");
    recommendations.push("Monitor kondisi pada check-out");
  } else {
    recommendations.push("Pertahankan pola kerja dan istirahat yang baik");
    recommendations.push("Terus pantau kondisi kesehatan");
  }

  // Specific recommendations based on component scores
  if (scores.fas >= 2) {
    recommendations.push("Perhatikan tanda-tanda kelelahan fisik dan mental");
  }
  if (scores.psqi >= 2) {
    recommendations.push("Tingkatkan kualitas tidur dengan sleep hygiene yang baik");
  }
  if (scores.pa >= 3) {
    recommendations.push("Kurangi aktivitas fisik berlebihan, ambil istirahat berkala");
  }

  return recommendations;
};

export const handleQuestionnaireSubmit: RequestHandler = (req, res) => {
  try {
    const data: QuestionnaireRequest = req.body;

    // Validation
    if (!data.session_id || !data.fas_answers || !data.psqi_answers || data.pa_answer === undefined) {
      return res.status(400).json({
        status: "error",
        message: "Missing required fields"
      } as QuestionnaireResponse);
    }

    // Validate FAS answers (3 questions, each 1-5)
    if (data.fas_answers.length !== 3 || data.fas_answers.some(ans => ans < 1 || ans > 5)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid FAS answers"
      } as QuestionnaireResponse);
    }

    // Validate PSQI answers (4 questions, each 1-4)
    if (data.psqi_answers.length !== 4 || data.psqi_answers.some(ans => ans < 1 || ans > 4)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid PSQI answers"
      } as QuestionnaireResponse);
    }

    // Validate PA answer (0-3)
    if (data.pa_answer < 0 || data.pa_answer > 3) {
      return res.status(400).json({
        status: "error",
        message: "Invalid Physical Activity answer"
      } as QuestionnaireResponse);
    }

    // Calculate scores using AI-FatMoS algorithms
    const scores = {
      fas: calculateFASScore(data.fas_answers),
      psqi: calculatePSQIScore(data.psqi_answers),
      pa: data.pa_answer // PA is already scored 0-3
    };

    // Calculate total score (FAS + PSQI + PA + future biometric scores)
    // For now, we only have questionnaire data (0-9), 
    // biometric scores (BP, HR, Temp, Face) will be added later for full 0-21 scale
    const currentTotal = scores.fas + scores.psqi + scores.pa;
    
    const classification = getClassification(currentTotal);
    const recommendations = getRecommendations(scores, currentTotal);

    // Here you would typically save to database
    console.log(`Questionnaire submitted for session: ${data.session_id}`, {
      scores,
      total: currentTotal,
      classification,
      duration: data.duration_ms ? `${Math.round(data.duration_ms / 1000)}s` : 'unknown'
    });

    // Return response
    const response: QuestionnaireResponse = {
      status: "success",
      scores,
      total_score: currentTotal,
      classification,
      recommendations
    };

    res.json(response);

  } catch (error) {
    console.error('Questionnaire submission error:', error);
    res.status(500).json({
      status: "error",
      message: "Internal server error"
    } as QuestionnaireResponse);
  }
};

export const handleQuestionnaireGet: RequestHandler = (req, res) => {
  // For future: retrieve questionnaire history
  res.json({ 
    status: "success", 
    message: "Questionnaire history endpoint - to be implemented" 
  });
};
