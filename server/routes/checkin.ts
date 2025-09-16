import { RequestHandler } from "express";
import { CheckInBiometrics, CheckInRecord, setLatestCheckIn } from "./checkinData";

const calculateBiometricScores = (biometrics: CheckInBiometrics) => {
  let bpScore = 0;
  if (biometrics.sbp >= 180 || biometrics.dbp >= 110 || biometrics.sbp < 80 || biometrics.dbp < 50) {
    bpScore = 3;
  } else if (biometrics.sbp >= 160 || biometrics.dbp >= 100 || biometrics.sbp < 90 || biometrics.dbp < 60) {
    bpScore = 2;
  } else if (biometrics.sbp >= 140 || biometrics.dbp >= 90 || biometrics.sbp < 95 || biometrics.dbp < 65) {
    bpScore = 1;
  }

  let hrScore = 0;
  if (biometrics.bpm > 120 || biometrics.bpm < 40) {
    hrScore = 3;
  } else if (biometrics.bpm > 110 || biometrics.bpm < 50) {
    hrScore = 2;
  } else if (biometrics.bpm > 100 || biometrics.bpm < 60) {
    hrScore = 1;
  }

  let tempScore = 0;
  if (biometrics.temp > 38.5 || biometrics.temp < 35.5) {
    tempScore = 3;
  } else if (biometrics.temp > 38.0 || biometrics.temp < 36.0) {
    tempScore = 2;
  } else if (biometrics.temp > 37.5 || biometrics.temp < 36.5) {
    tempScore = 1;
  }

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

export const handleCheckInSubmit: RequestHandler = (req, res) => {
  try {
    const { session_id, biometrics, timestamp } = req.body as {
      session_id: string;
      biometrics: CheckInBiometrics;
      timestamp: string;
    };

    if (!session_id || !biometrics || !timestamp) {
      return res.status(400).json({ status: 'error', message: 'Missing required fields' });
    }

    const { sbp, dbp, bpm, temp, face_label } = biometrics;
    const isNumber = (v: any) => typeof v === 'number' && !isNaN(v);

    if (!isNumber(sbp) || !isNumber(dbp) || !isNumber(bpm) || !isNumber(temp) || typeof face_label !== 'string') {
      return res.status(400).json({ status: 'error', message: 'Invalid biometrics' });
    }

    const biometricScores = calculateBiometricScores(biometrics);

    const scores = {
      fas: 0,
      psqi: 0,
      pa: 0,
      bp: biometricScores.bp,
      hr: biometricScores.hr,
      temp: biometricScores.temp,
      face: biometricScores.face
    };

    const total = Object.values(scores).reduce((s, v) => s + v, 0);
    const classification = getClassification(total);

    const record: CheckInRecord = {
      session_id,
      timestamp,
      biometrics,
      scores,
      total_score: total,
      classification
    };

    setLatestCheckIn(record);

    res.json({ status: 'success', checkin: record });
  } catch (e) {
    console.error('Check-in submit error:', e);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
