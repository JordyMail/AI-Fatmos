export interface CheckInBiometrics {
  sbp: number;
  dbp: number;
  bpm: number;
  temp: number;
  face_label: string;
}

export interface CheckInScores {
  fas: number; // questionnaire not yet answered at check-in
  psqi: number;
  pa: number;
  bp: number;
  hr: number;
  temp: number;
  face: number;
}

export interface CheckInRecord {
  session_id: string;
  timestamp: string;
  biometrics: CheckInBiometrics;
  scores: CheckInScores;
  total_score: number;
  classification: string;
}

let latestCheckIn: CheckInRecord | null = null;

export const setLatestCheckIn = (record: CheckInRecord) => {
  latestCheckIn = record;
};

export const getLatestCheckIn = (): CheckInRecord | null => {
  return latestCheckIn;
};
