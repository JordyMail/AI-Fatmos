import { RequestHandler } from "express";

import { getLatestCheckIn } from "./checkinData";

interface CheckOutRequest {
  session_id: string;
  checkin_session_id?: string;
  biometrics: {
    sbp: number;
    dbp: number;
    bpm: number;
    temp: number;
    face_label: string;
  };
  fas_answers: number[]; // [1-5, 1-5, 1-5]
  psqi_answers: number[]; // [1-4, 1-4, 1-4, 1-4]
  pa_answer: number; // 0-3
  timestamp: string;
}

interface CheckOutResponse {
  status: "success" | "error";
  scores?: {
    fas: number;
    psqi: number;
    pa: number;
    bp: number;
    hr: number;
    temp: number;
    face: number;
  };
  total_score?: number;
  classification?: string;
  delta_from_checkin?: number;
  comparison?: {
    delta_total: number;
    delta_components: {
      fas: number;
      psqi: number;
      pa: number;
      bp: number;
      hr: number;
      temp: number;
      face: number;
    };
    risk_escalation: boolean;
    recommendations: string[];
  };
  message?: string;
}

// Mock check-in data - in real app this would be fetched from database
const getCheckInData = (checkinSessionId?: string) => {
  const latest = getLatestCheckIn();
  if (latest) return latest as any;
  return {
    session_id: checkinSessionId || 'sess-checkin-2025-01-15-user123',
    total_score: 6,
    classification: 'Mild Fatigue',
    scores: {
      fas: 1,
      psqi: 2,
      pa: 0,
      bp: 1,
      hr: 1,
      temp: 0,
      face: 1
    },
    biometrics: {
      sbp: 120,
      dbp: 80,
      bpm: 72,
      temp: 36.8,
      face_label: 'Neutral'
    }
  };
};

// AI-FatMoS scoring algorithms (same as questionnaire.ts)
const calculateFASScore = (answers: number[]): number => {
  const total = answers.reduce((sum, val) => sum + val, 0);
  if (total <= 5) return 0;
  if (total <= 8) return 1;
  if (total <= 11) return 2;
  return 3;
};

const calculatePSQIScore = (answers: number[]): number => {
  const total = answers.reduce((sum, val) => sum + val, 0);
  if (total <= 6) return 0;
  if (total <= 9) return 1;
  if (total <= 12) return 2;
  return 3;
};

const calculateBiometricScores = (biometrics: CheckOutRequest['biometrics']) => {
  // Blood Pressure scoring
  let bpScore = 0;
  if (biometrics.sbp >= 180 || biometrics.dbp >= 110 || biometrics.sbp < 80 || biometrics.dbp < 50) {
    bpScore = 3; // Critical
  } else if (biometrics.sbp >= 160 || biometrics.dbp >= 100 || biometrics.sbp < 90 || biometrics.dbp < 60) {
    bpScore = 2; // High concern
  } else if (biometrics.sbp >= 140 || biometrics.dbp >= 90 || biometrics.sbp < 95 || biometrics.dbp < 65) {
    bpScore = 1; // Monitor
  }

  // Heart Rate scoring
  let hrScore = 0;
  if (biometrics.bpm > 120 || biometrics.bpm < 40) {
    hrScore = 3;
  } else if (biometrics.bpm > 110 || biometrics.bpm < 50) {
    hrScore = 2;
  } else if (biometrics.bpm > 100 || biometrics.bpm < 60) {
    hrScore = 1;
  }

  // Temperature scoring
  let tempScore = 0;
  if (biometrics.temp > 38.5 || biometrics.temp < 35.5) {
    tempScore = 3;
  } else if (biometrics.temp > 38.0 || biometrics.temp < 36.0) {
    tempScore = 2;
  } else if (biometrics.temp > 37.5 || biometrics.temp < 36.5) {
    tempScore = 1;
  }

  // Face expression scoring
  let faceScore = 0;
  const faceLabel = biometrics.face_label.toLowerCase();
  if (faceLabel.includes('severe') || faceLabel.includes('exhausted')) {
    faceScore = 3;
  } else if (faceLabel.includes('moderate') || faceLabel.includes('tired')) {
    faceScore = 2;
  } else if (faceLabel.includes('mild') || faceLabel.includes('slight')) {
    faceScore = 1;
  }

  return { bp: bpScore, hr: hrScore, temp: tempScore, face: faceScore };
};

const getClassification = (totalScore: number): string => {
  if (totalScore <= 5) return "Fit";
  if (totalScore <= 9) return "Mild Fatigue";
  if (totalScore <= 14) return "Moderate Fatigue";
  return "Severe Fatigue";
};

const generateRecommendations = (
  scores: any, 
  totalScore: number, 
  comparison: any
): string[] => {
  const recommendations: string[] = [];
  
  // Based on final score
  if (totalScore >= 15) {
    recommendations.push("Segera lakukan skrining medis atau rujukan");
    recommendations.push("Pertimbangkan rotasi atau cuti sebelum shift berikutnya");
  } else if (totalScore >= 10) {
    recommendations.push("Evaluasi shift dan beban kerja dengan supervisor");
    recommendations.push("Istirahat yang cukup sebelum shift berikutnya");
  } else if (totalScore >= 6) {
    recommendations.push("Pastikan istirahat yang cukup");
    recommendations.push("Monitor kondisi lebih ketat");
  }

  // Based on change from check-in
  if (comparison.delta_total >= 6) {
    recommendations.push("Kelelahan meningkat signifikan selama shift");
    recommendations.push("Pertimbangkan penyesuaian jadwal atau beban kerja");
  } else if (comparison.delta_total >= 3) {
    recommendations.push("Kelelahan meningkat selama shift");
    recommendations.push("Disarankan istirahat yang cukup");
  } else if (comparison.delta_total <= -2) {
    recommendations.push("Kondisi membaik selama shift");
    recommendations.push("Pertahankan pola kerja yang baik");
  }

  // Specific component recommendations
  if (scores.bp >= 2) {
    recommendations.push("Tekanan darah perlu perhatian - konsultasi medis jika berlanjut");
  }
  if (scores.hr >= 2) {
    recommendations.push("Denyut nadi abnormal - istirahat dan hidrasi yang cukup");
  }
  if (scores.temp >= 2) {
    recommendations.push("Suhu tubuh abnormal - monitor kesehatan dan istirahat");
  }
  if (scores.face >= 2) {
    recommendations.push("Tanda kelelahan pada ekspresi wajah - istirahat segera");
  }

  // Default recommendation if no specific issues
  if (recommendations.length === 0) {
    recommendations.push("Kondisi stabil, selamat beristirahat");
    recommendations.push("Pertahankan pola hidup sehat");
  }

  return recommendations;
};

export const handleCheckOut: RequestHandler = (req, res) => {
  try {
    const data: CheckOutRequest = req.body;

    // Validation
    if (!data.session_id || !data.biometrics || !data.fas_answers || !data.psqi_answers || data.pa_answer === undefined) {
      return res.status(400).json({
        status: "error",
        message: "Missing required fields"
      } as CheckOutResponse);
    }

    // Validate FAS answers
    if (data.fas_answers.length !== 3 || data.fas_answers.some(ans => ans < 1 || ans > 5)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid FAS answers"
      } as CheckOutResponse);
    }

    // Validate PSQI answers
    if (data.psqi_answers.length !== 4 || data.psqi_answers.some(ans => ans < 1 || ans > 4)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid PSQI answers"
      } as CheckOutResponse);
    }

    // Get check-in data for comparison
    const checkInData = getCheckInData(data.checkin_session_id);

    // Calculate check-out scores
    const fasScore = calculateFASScore(data.fas_answers);
    const psqiScore = calculatePSQIScore(data.psqi_answers);
    const paScore = data.pa_answer; // Already scored 0-3
    const biometricScores = calculateBiometricScores(data.biometrics);

    const scores = {
      fas: fasScore,
      psqi: psqiScore,
      pa: paScore,
      bp: biometricScores.bp,
      hr: biometricScores.hr,
      temp: biometricScores.temp,
      face: biometricScores.face
    };

    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    const classification = getClassification(totalScore);
    const deltaTotal = totalScore - checkInData.total_score;

    // Calculate component deltas
    const deltaComponents = {
      fas: scores.fas - checkInData.scores.fas,
      psqi: scores.psqi - checkInData.scores.psqi,
      pa: scores.pa - checkInData.scores.pa,
      bp: scores.bp - checkInData.scores.bp,
      hr: scores.hr - checkInData.scores.hr,
      temp: scores.temp - checkInData.scores.temp,
      face: scores.face - checkInData.scores.face
    };

    // Determine if there's risk escalation
    const riskEscalation = deltaTotal >= 3 || 
                          Object.values(scores).some(score => score >= 3) ||
                          (classification === 'Severe Fatigue');

    const comparison = {
      delta_total: deltaTotal,
      delta_components: deltaComponents,
      risk_escalation: riskEscalation,
      recommendations: generateRecommendations(scores, totalScore, { delta_total: deltaTotal })
    };

    // Log for debugging/analytics
    console.log(`Check-out processed for session: ${data.session_id}`, {
      scores,
      total: totalScore,
      classification,
      delta: deltaTotal,
      escalation: riskEscalation
    });

    // In real app, here you would:
    // 1. Save check-out data to database
    // 2. Send notifications if risk escalation
    // 3. Update user's daily summary
    // 4. Trigger alerts if needed

    if (riskEscalation) {
      console.log(`⚠️ Risk escalation detected for session ${data.session_id} - notifying supervisor`);
      // Implement notification logic here
    }

    const response: CheckOutResponse = {
      status: "success",
      scores,
      total_score: totalScore,
      classification,
      delta_from_checkin: deltaTotal,
      comparison
    };

    res.json(response);

  } catch (error) {
    console.error('Check-out processing error:', error);
    res.status(500).json({
      status: "error",
      message: "Internal server error"
    } as CheckOutResponse);
  }
};

export const handleGetCheckInData: RequestHandler = (req, res) => {
  try {
    const { user_id, date } = req.query as Record<string, string>;
    
    const latest = getLatestCheckIn();
    const checkInData = latest || getCheckInData();

    res.json({
      status: "success",
      checkin_data: checkInData
    });

  } catch (error) {
    console.error('Get check-in data error:', error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch check-in data"
    });
  }
};
