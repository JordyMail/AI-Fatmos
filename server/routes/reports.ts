import { RequestHandler } from "express";

interface HistoryRecord {
  session_id: string;
  date: string;
  total_score: number;
  risk: 'fit' | 'mild' | 'moderate' | 'severe';
  components: {
    fas: number;
    psqi: number;
    pa: number;
    bp: number;
    hr: number;
    temp: number;
    face: number;
  };
  recommendation: string;
  shift: string;
  unit: string;
  user_id?: string;
  biometrics?: {
    sbp: number;
    dbp: number;
    bpm: number;
    temp_c: number;
    face_label: string;
  };
  questionnaire_raw?: {
    fas_answers: number[];
    psqi_answers: number[];
    pa_answer: number;
  };
}

interface SummaryStats {
  total_sessions: number;
  avg_total_score: number;
  risk_distribution: {
    fit: number;
    mild: number;
    moderate: number;
    severe: number;
  };
  trend_change: number;
}

interface ReportsResponse {
  status: "success" | "error";
  summary?: SummaryStats;
  trend?: Array<{ date: string; score: number; components?: any }>;
  details?: HistoryRecord[];
  message?: string;
}

// Mock database - in real app this would be actual database queries
const generateMockData = (userId?: string, unitId?: string, from?: string, to?: string): HistoryRecord[] => {
  const mockData: HistoryRecord[] = [
    {
      session_id: 'sess-001',
      date: '2025-01-15T07:30:00',
      total_score: 12,
      risk: 'moderate',
      components: { fas: 2, psqi: 3, pa: 1, bp: 2, hr: 1, temp: 0, face: 3 },
      recommendation: 'Evaluasi shift dan beban kerja dengan supervisor',
      shift: 'Pagi',
      unit: 'ICU',
      user_id: 'user123',
      biometrics: { sbp: 145, dbp: 95, bpm: 85, temp_c: 37.2, face_label: 'Moderate Fatigue' },
      questionnaire_raw: { fas_answers: [3, 4, 2], psqi_answers: [3, 4, 3, 3], pa_answer: 1 }
    },
    {
      session_id: 'sess-002',
      date: '2025-01-14T07:15:00',
      total_score: 6,
      risk: 'mild',
      components: { fas: 1, psqi: 2, pa: 0, bp: 1, hr: 1, temp: 0, face: 1 },
      recommendation: 'Istirahat aktif setiap 2 jam',
      shift: 'Pagi',
      unit: 'ICU',
      user_id: 'user123',
      biometrics: { sbp: 125, dbp: 80, bpm: 75, temp_c: 36.8, face_label: 'Mild Fatigue' },
      questionnaire_raw: { fas_answers: [2, 2, 1], psqi_answers: [2, 3, 2, 2], pa_answer: 0 }
    },
    {
      session_id: 'sess-003',
      date: '2025-01-13T19:45:00',
      total_score: 4,
      risk: 'fit',
      components: { fas: 0, psqi: 1, pa: 0, bp: 1, hr: 1, temp: 0, face: 1 },
      recommendation: 'Pertahankan pola kerja yang baik',
      shift: 'Malam',
      unit: 'ICU',
      user_id: 'user123',
      biometrics: { sbp: 120, dbp: 75, bpm: 68, temp_c: 36.6, face_label: 'Neutral' },
      questionnaire_raw: { fas_answers: [1, 1, 1], psqi_answers: [1, 2, 1, 2], pa_answer: 0 }
    },
    {
      session_id: 'sess-004',
      date: '2025-01-12T07:20:00',
      total_score: 16,
      risk: 'severe',
      components: { fas: 3, psqi: 3, pa: 2, bp: 3, hr: 2, temp: 1, face: 2 },
      recommendation: 'Segera lakukan skrining medis atau rujukan',
      shift: 'Pagi',
      unit: 'ICU',
      user_id: 'user123',
      biometrics: { sbp: 165, dbp: 105, bpm: 110, temp_c: 38.1, face_label: 'Severe Fatigue' },
      questionnaire_raw: { fas_answers: [5, 5, 4], psqi_answers: [4, 4, 4, 3], pa_answer: 2 }
    },
    {
      session_id: 'sess-005',
      date: '2025-01-11T15:30:00',
      total_score: 8,
      risk: 'mild',
      components: { fas: 1, psqi: 2, pa: 1, bp: 1, hr: 2, temp: 0, face: 1 },
      recommendation: 'Monitor kondisi pada check-out',
      shift: 'Siang',
      unit: 'ICU',
      user_id: 'user123',
      biometrics: { sbp: 130, dbp: 85, bpm: 88, temp_c: 36.9, face_label: 'Mild Fatigue' },
      questionnaire_raw: { fas_answers: [2, 1, 2], psqi_answers: [2, 3, 2, 3], pa_answer: 1 }
    }
  ];

  // Filter by date range if provided
  let filteredData = mockData;
  if (from && to) {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    filteredData = mockData.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= fromDate && recordDate <= toDate;
    });
  }

  // Filter by unit if provided and not 'all'
  if (unitId && unitId !== 'all') {
    filteredData = filteredData.filter(record => 
      record.unit.toLowerCase() === unitId.toLowerCase()
    );
  }

  // Filter by user if provided
  if (userId) {
    filteredData = filteredData.filter(record => record.user_id === userId);
  }

  return filteredData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const calculateSummaryStats = (data: HistoryRecord[]): SummaryStats => {
  if (data.length === 0) {
    return {
      total_sessions: 0,
      avg_total_score: 0,
      risk_distribution: { fit: 0, mild: 0, moderate: 0, severe: 0 },
      trend_change: 0
    };
  }

  const totalScore = data.reduce((sum, record) => sum + record.total_score, 0);
  const avgScore = totalScore / data.length;

  const riskDistribution = data.reduce((acc, record) => {
    acc[record.risk]++;
    return acc;
  }, { fit: 0, mild: 0, moderate: 0, severe: 0 });

  // Calculate trend (mock - comparing to previous period)
  const recentAvg = data.slice(0, Math.floor(data.length / 2))
    .reduce((sum, record) => sum + record.total_score, 0) / Math.max(1, Math.floor(data.length / 2));
  const olderAvg = data.slice(Math.floor(data.length / 2))
    .reduce((sum, record) => sum + record.total_score, 0) / Math.max(1, data.length - Math.floor(data.length / 2));
  
  const trendChange = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;

  return {
    total_sessions: data.length,
    avg_total_score: Number(avgScore.toFixed(1)),
    risk_distribution: riskDistribution,
    trend_change: Number(trendChange.toFixed(1))
  };
};

export const handleHistoryGet: RequestHandler = (req, res) => {
  try {
    const { user_id, from, to, risk_level, shift, unit_id } = req.query as Record<string, string>;

    // In real app, get user from authentication
    const currentUserId = user_id || 'user123';

    // Generate mock data
    let data = generateMockData(currentUserId, unit_id, from, to);

    // Additional filtering
    if (risk_level && risk_level !== 'all') {
      data = data.filter(record => record.risk === risk_level);
    }

    if (shift && shift !== 'all') {
      data = data.filter(record => record.shift.toLowerCase() === shift.toLowerCase());
    }

    const summary = calculateSummaryStats(data);

    // Generate trend data (last 7 records for trend chart)
    const trendData = data.slice(0, 7).reverse().map(record => ({
      date: new Date(record.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
      score: record.total_score,
      components: record.components
    }));

    const response: ReportsResponse = {
      status: "success",
      summary,
      trend: trendData,
      details: data
    };

    res.json(response);

  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({
      status: "error",
      message: "Internal server error"
    } as ReportsResponse);
  }
};

export const handleReportsGet: RequestHandler = (req, res) => {
  try {
    const { unit_id, from, to, risk_level, shift } = req.query as Record<string, string>;

    // For management reports - aggregate data across units
    let data = generateMockData(undefined, unit_id, from, to);

    // Additional filtering
    if (risk_level && risk_level !== 'all') {
      data = data.filter(record => record.risk === risk_level);
    }

    if (shift && shift !== 'all') {
      data = data.filter(record => record.shift.toLowerCase() === shift.toLowerCase());
    }

    const summary = calculateSummaryStats(data);

    // Generate unit-level aggregation
    const unitStats = data.reduce((acc: Record<string, any>, record) => {
      if (!acc[record.unit]) {
        acc[record.unit] = {
          unit: record.unit,
          total_sessions: 0,
          avg_score: 0,
          risk_distribution: { fit: 0, mild: 0, moderate: 0, severe: 0 }
        };
      }
      
      acc[record.unit].total_sessions++;
      acc[record.unit].risk_distribution[record.risk]++;
      
      return acc;
    }, {});

    // Calculate averages for units
    Object.values(unitStats).forEach((unit: any) => {
      const unitData = data.filter(record => record.unit === unit.unit);
      unit.avg_score = unitData.reduce((sum, record) => sum + record.total_score, 0) / unitData.length;
    });

    const response: ReportsResponse = {
      status: "success",
      summary,
      details: data,
      // @ts-ignore - adding unit_stats for management view
      unit_stats: Object.values(unitStats)
    };

    res.json(response);

  } catch (error) {
    console.error('Reports fetch error:', error);
    res.status(500).json({
      status: "error",
      message: "Internal server error"
    } as ReportsResponse);
  }
};

export const handleExportData: RequestHandler = (req, res) => {
  try {
    const { format, user_id, from, to, unit_id } = req.query as Record<string, string>;

    if (!format || !['csv', 'pdf'].includes(format)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid format. Use 'csv' or 'pdf'"
      });
    }

    // Generate data for export
    const data = generateMockData(user_id, unit_id, from, to);

    if (format === 'csv') {
      // Generate CSV
      const csvHeader = 'Date,Session ID,Total Score,Risk Level,FAS,PSQI,PA,BP,HR,Temp,Face,Shift,Unit,Recommendation\n';
      const csvData = data.map(record => 
        `${record.date},${record.session_id},${record.total_score},${record.risk},` +
        `${record.components.fas},${record.components.psqi},${record.components.pa},` +
        `${record.components.bp},${record.components.hr},${record.components.temp},` +
        `${record.components.face},${record.shift},${record.unit},"${record.recommendation}"`
      ).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="ai-fatmos-report-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvHeader + csvData);

    } else if (format === 'pdf') {
      // Mock PDF generation - in real app would use a PDF library
      res.status(200).json({
        status: "success",
        message: "PDF export functionality would be implemented here",
        data: {
          total_records: data.length,
          export_date: new Date().toISOString(),
          format: "pdf"
        }
      });
    }

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      status: "error",
      message: "Export failed"
    });
  }
};

export const handleSessionDetail: RequestHandler = (req, res) => {
  try {
    const { session_id } = req.params;

    // Find session in mock data
    const allData = generateMockData();
    const session = allData.find(record => record.session_id === session_id);

    if (!session) {
      return res.status(404).json({
        status: "error",
        message: "Session not found"
      });
    }

    // Return detailed session information
    res.json({
      status: "success",
      session: {
        ...session,
        timeline: [
          { step: "Check-in", timestamp: session.date, status: "completed" },
          { step: "Biometric Measurement", timestamp: new Date(new Date(session.date).getTime() + 5*60000).toISOString(), status: "completed" },
          { step: "Questionnaire", timestamp: new Date(new Date(session.date).getTime() + 10*60000).toISOString(), status: "completed" },
          { step: "AI Processing", timestamp: new Date(new Date(session.date).getTime() + 12*60000).toISOString(), status: "completed" },
          { step: "Results & Recommendations", timestamp: new Date(new Date(session.date).getTime() + 13*60000).toISOString(), status: "completed" }
        ]
      }
    });

  } catch (error) {
    console.error('Session detail error:', error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch session details"
    });
  }
};
