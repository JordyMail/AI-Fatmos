import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft,
  ArrowRight,
  CheckCircle, 
  Clock,
  Activity,
  Heart,
  Thermometer,
  Camera,
  FileText,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  ShieldCheck,
  Loader2,
  Home
} from 'lucide-react';

interface BiometricData {
  sbp: number | null;
  dbp: number | null;
  bpm: number | null;
  temp: number | null;
  face_label: string | null;
}

interface QuestionnaireData {
  fas_answers: (number | null)[];
  psqi_answers: (number | null)[];
  pa_answer: number | null;
}

interface CheckInData {
  session_id: string;
  total_score: number;
  classification: string;
  biometrics: BiometricData;
  components: {
    fas: number;
    psqi: number;
    pa: number;
    bp: number;
    hr: number;
    temp: number;
    face: number;
  };
}

interface ComparisonData {
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
}

type Step = 'biometric' | 'questionnaire' | 'processing' | 'results';

export default function CheckOut() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>('biometric');
  const [biometricData, setBiometricData] = useState<BiometricData>({
    sbp: null,
    dbp: null,
    bpm: null,
    temp: null,
    face_label: null
  });
  const [questionnaireData, setQuestionnaireData] = useState<QuestionnaireData>({
    fas_answers: [null, null, null],
    psqi_answers: [null, null, null, null],
    pa_answer: null
  });
  const [checkInData, setCheckInData] = useState<CheckInData | null>(null);
  const [checkOutResults, setCheckOutResults] = useState<any>(null);
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState(new Date());

  // Load check-in data on mount
  useEffect(() => {
    loadCheckInData();
  }, []);

  const loadCheckInData = async () => {
    // Mock check-in data - in real app would fetch from API
    const mockCheckInData: CheckInData = {
      session_id: 'sess-checkin-2025-01-15-user123',
      total_score: 6,
      classification: 'Mild Fatigue',
      biometrics: {
        sbp: 120,
        dbp: 80,
        bpm: 72,
        temp: 36.8,
        face_label: 'Neutral'
      },
      components: {
        fas: 1,
        psqi: 2,
        pa: 0,
        bp: 1,
        hr: 1,
        temp: 0,
        face: 1
      }
    };
    setCheckInData(mockCheckInData);
  };

  const getStepNumber = () => {
    const steps = { biometric: 1, questionnaire: 2, processing: 3, results: 4 };
    return steps[currentStep];
  };

  const getProgressPercentage = () => {
    return (getStepNumber() / 4) * 100;
  };

  const simulateBiometricMeasurement = async () => {
    // Simulate measurement process
    setBiometricData({
      sbp: 135,
      dbp: 85,
      bpm: 88,
      temp: 37.1,
      face_label: 'Moderate Fatigue'
    });
  };

  const isQuestionnaireComplete = () => {
    return questionnaireData.fas_answers.every(a => a !== null) &&
           questionnaireData.psqi_answers.every(a => a !== null) &&
           questionnaireData.pa_answer !== null;
  };

  const handleNext = () => {
    if (currentStep === 'biometric') {
      setCurrentStep('questionnaire');
    } else if (currentStep === 'questionnaire' && isQuestionnaireComplete()) {
      setCurrentStep('processing');
      processCheckOut();
    }
  };

  const processCheckOut = async () => {
    setIsSubmitting(true);
    
    try {
      // Prepare payload
      const payload = {
        session_id: `sess-checkout-${new Date().toISOString().split('T')[0]}-user123`,
        checkin_session_id: checkInData?.session_id,
        biometrics: biometricData,
        fas_answers: questionnaireData.fas_answers,
        psqi_answers: questionnaireData.psqi_answers,
        pa_answer: questionnaireData.pa_answer,
        timestamp: new Date().toISOString()
      };

      // Call backend API
      const response = await fetch('/api/v1/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      setCheckOutResults(result);
      setComparisonData(result.comparison);
      setCurrentStep('results');

    } catch (error) {
      console.error('Check-out processing error:', error);
      alert('Terjadi kesalahan saat memproses data. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const likertOptions = [
    { value: 1, label: 'Tidak pernah' },
    { value: 2, label: 'Jarang' },
    { value: 3, label: 'Kadang-kadang' },
    { value: 4, label: 'Sering' },
    { value: 5, label: 'Selalu' }
  ];

  const LikertScale = ({ 
    value, 
    onChange, 
    options = likertOptions 
  }: { 
    value: number | null; 
    onChange: (value: number) => void;
    options?: { value: number; label: string }[];
  }) => (
    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
            value === option.value
              ? 'border-medical-orange bg-medical-orange text-white'
              : 'border-border bg-background hover:border-medical-orange/50'
          }`}
        >
          <div className="text-center">
            <div className="font-bold text-lg mb-1">{option.value}</div>
            <div className="text-xs leading-tight">{option.label}</div>
          </div>
        </button>
      ))}
    </div>
  );

  const getRiskColor = (risk: string) => {
    const colors = {
      'Fit': 'bg-status-fit text-white',
      'Mild Fatigue': 'bg-status-mild text-white',
      'Moderate Fatigue': 'bg-status-moderate text-white',
      'Severe Fatigue': 'bg-status-severe text-white'
    };
    return colors[risk as keyof typeof colors] || 'bg-gray-500 text-white';
  };

  const getChangeIcon = (delta: number) => {
    if (delta > 0) return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (delta < 0) return <TrendingDown className="h-4 w-4 text-green-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getChangeColor = (delta: number) => {
    if (delta > 0) return 'text-red-500';
    if (delta < 0) return 'text-green-500';
    return 'text-gray-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-orange-light via-background to-medical-red-light">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Kembali
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="bg-medical-orange text-white p-2 rounded-lg">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground">Check-out</h1>
                  <p className="text-sm text-muted-foreground">
                    Langkah {getStepNumber()} dari 4 - Evaluasi akhir shift
                  </p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="text-medical-orange border-medical-orange">
                <Clock className="h-3 w-3 mr-1" />
                ±1 menit
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="container mx-auto px-4 py-4">
        <Progress value={getProgressPercentage()} className="max-w-2xl mx-auto" />
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-8">
        <div className="max-w-2xl mx-auto">
          
          {/* Biometric Measurement Step */}
          {currentStep === 'biometric' && (
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto bg-medical-orange text-white p-3 rounded-full w-fit mb-3">
                  <Activity className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl">Pengukuran Biometrik Akhir Shift</CardTitle>
                <p className="text-muted-foreground">
                  Sistem akan mengukur kondisi biometrik Anda setelah menyelesaikan shift
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <Heart className="h-4 w-4" />
                  <AlertDescription>
                    Duduk dengan tenang dan relaks. Pengukuran akan dibandingkan dengan data check-in untuk mendeteksi perubahan kondisi.
                  </AlertDescription>
                </Alert>

                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Heart className="h-6 w-6 text-medical-red" />
                      <div>
                        <div className="font-medium">Tekanan Darah & Nadi</div>
                        <div className="text-sm text-muted-foreground">Otomatis melalui sensor</div>
                      </div>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Thermometer className="h-6 w-6 text-medical-orange" />
                      <div>
                        <div className="font-medium">Suhu Tubuh</div>
                        <div className="text-sm text-muted-foreground">Kamera termal non-kontak</div>
                      </div>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Camera className="h-6 w-6 text-medical-blue" />
                      <div>
                        <div className="font-medium">Analisis Ekspresi Wajah</div>
                        <div className="text-sm text-muted-foreground">AI detection untuk kelelahan</div>
                      </div>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                </div>

                {/* Check-in Comparison Preview */}
                {checkInData && (
                  <Card className="bg-medical-blue-light/10">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Data Check-in Hari Ini</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Tekanan Darah:</span>
                        <span className="font-medium">{checkInData.biometrics.sbp}/{checkInData.biometrics.dbp} mmHg</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Denyut Nadi:</span>
                        <span className="font-medium">{checkInData.biometrics.bpm} bpm</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Suhu:</span>
                        <span className="font-medium">{checkInData.biometrics.temp}°C</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Skor Total:</span>
                        <Badge className={getRiskColor(checkInData.classification)}>
                          {checkInData.total_score}/21 - {checkInData.classification}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Button 
                  onClick={() => {
                    simulateBiometricMeasurement();
                    handleNext();
                  }}
                  className="w-full bg-medical-orange hover:bg-medical-orange/90"
                  size="lg"
                >
                  Mulai Pengukuran
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Questionnaire Step */}
          {currentStep === 'questionnaire' && (
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto bg-medical-orange text-white p-3 rounded-full w-fit mb-3">
                  <FileText className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl">Kuesioner Akhir Shift</CardTitle>
                <p className="text-muted-foreground">
                  Evaluasi kondisi Anda setelah menyelesaikan shift kerja
                </p>
              </CardHeader>
              <CardContent className="space-y-8">
                
                {/* FAS Questions */}
                <div className="space-y-6">
                  <h3 className="font-semibold text-lg border-b pb-2">Fatigue Assessment Scale (FAS)</h3>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">1. Saya merasa fisik saya lelah (energi terkuras)</h4>
                    <LikertScale 
                      value={questionnaireData.fas_answers[0]} 
                      onChange={(value) => setQuestionnaireData(prev => ({
                        ...prev,
                        fas_answers: [value, prev.fas_answers[1], prev.fas_answers[2]]
                      }))}
                    />
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">2. Saya merasa kesulitan memulai aktivitas</h4>
                    <LikertScale 
                      value={questionnaireData.fas_answers[1]} 
                      onChange={(value) => setQuestionnaireData(prev => ({
                        ...prev,
                        fas_answers: [prev.fas_answers[0], value, prev.fas_answers[2]]
                      }))}
                    />
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">3. Saya mengalami masalah konsentrasi atau berpikir</h4>
                    <LikertScale 
                      value={questionnaireData.fas_answers[2]} 
                      onChange={(value) => setQuestionnaireData(prev => ({
                        ...prev,
                        fas_answers: [prev.fas_answers[0], prev.fas_answers[1], value]
                      }))}
                    />
                  </div>
                </div>

                {/* PSQI Questions */}
                <div className="space-y-6">
                  <h3 className="font-semibold text-lg border-b pb-2">Sleep Quality Assessment</h3>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">1. Bagaimana kualitas tidur malam sebelumnya?</h4>
                    <LikertScale 
                      value={questionnaireData.psqi_answers[0]} 
                      onChange={(value) => setQuestionnaireData(prev => ({
                        ...prev,
                        psqi_answers: [value, prev.psqi_answers[1], prev.psqi_answers[2], prev.psqi_answers[3]]
                      }))}
                      options={[
                        { value: 1, label: 'Sangat baik' },
                        { value: 2, label: 'Baik' },
                        { value: 3, label: 'Buruk' },
                        { value: 4, label: 'Sangat buruk' }
                      ]}
                    />
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">2. Apakah Anda merasa segar saat memulai shift?</h4>
                    <LikertScale 
                      value={questionnaireData.psqi_answers[1]} 
                      onChange={(value) => setQuestionnaireData(prev => ({
                        ...prev,
                        psqi_answers: [prev.psqi_answers[0], value, prev.psqi_answers[2], prev.psqi_answers[3]]
                      }))}
                      options={[
                        { value: 1, label: 'Sangat segar' },
                        { value: 2, label: 'Segar' },
                        { value: 3, label: 'Agak lelah' },
                        { value: 4, label: 'Sangat lelah' }
                      ]}
                    />
                  </div>
                </div>

                {/* Physical Activity */}
                <div className="space-y-6">
                  <h3 className="font-semibold text-lg border-b pb-2">Aktivitas Fisik Selama Shift</h3>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Berapa lama Anda beraktivitas fisik tanpa jeda selama shift ini?</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { value: 0, label: '< 2 jam', description: 'Aktivitas ringan' },
                        { value: 1, label: '2-4 jam', description: 'Aktivitas sedang' },
                        { value: 2, label: '4-6 jam', description: 'Aktivitas berat' },
                        { value: 3, label: '> 6 jam', description: 'Aktivitas sangat berat' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setQuestionnaireData(prev => ({
                            ...prev,
                            pa_answer: option.value
                          }))}
                          className={`p-4 rounded-lg border-2 transition-all text-left ${
                            questionnaireData.pa_answer === option.value
                              ? 'border-medical-orange bg-medical-orange text-white'
                              : 'border-border bg-background hover:border-medical-orange/50'
                          }`}
                        >
                          <div className="font-semibold text-lg mb-1">{option.label}</div>
                          <div className="text-sm opacity-80">{option.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-6 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentStep('biometric')}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Kembali
                  </Button>

                  <Button 
                    onClick={handleNext}
                    disabled={!isQuestionnaireComplete()}
                    className="bg-medical-orange hover:bg-medical-orange/90"
                  >
                    Proses Data
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>

                {!isQuestionnaireComplete() && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Mohon jawab semua pertanyaan sebelum melanjutkan.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Processing Step */}
          {currentStep === 'processing' && (
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto bg-medical-blue text-white p-3 rounded-full w-fit mb-3">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
                <CardTitle className="text-xl">Memproses Data Check-out</CardTitle>
                <p className="text-muted-foreground">
                  AI-FatMoS sedang menganalisis data dan membandingkan dengan check-in...
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Menganalisis data biometrik</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Menghitung skor kuesioner</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                    <span className="text-sm">Membandingkan dengan data check-in</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-muted-foreground">Menghasilkan rekomendasi</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results Step */}
          {currentStep === 'results' && checkOutResults && comparisonData && (
            <div className="space-y-6">
              {/* Main Results */}
              <Card>
                <CardHeader className="text-center">
                  <div className={`mx-auto text-white p-3 rounded-full w-fit mb-3 ${
                    comparisonData.risk_escalation ? 'bg-medical-red' : 'bg-medical-orange'
                  }`}>
                    {comparisonData.risk_escalation ? 
                      <AlertTriangle className="h-8 w-8" /> : 
                      <CheckCircle className="h-8 w-8" />
                    }
                  </div>
                  <CardTitle className="text-xl">Hasil Check-out</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Score Comparison */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="bg-medical-blue-light/10">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Check-in (Awal Shift)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center">
                          <div className="text-3xl font-bold mb-2">{checkInData?.total_score}/21</div>
                          <Badge className={getRiskColor(checkInData?.classification || '')}>
                            {checkInData?.classification}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-medical-orange-light/10">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Check-out (Akhir Shift)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center">
                          <div className="text-3xl font-bold mb-2">{checkOutResults.total_score}/21</div>
                          <Badge className={getRiskColor(checkOutResults.classification)}>
                            {checkOutResults.classification}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Change Summary */}
                  <Alert className={comparisonData.risk_escalation ? 'border-red-200 bg-red-50' : 'border-orange-200 bg-orange-50'}>
                    <div className="flex items-center space-x-2">
                      {getChangeIcon(comparisonData.delta_total)}
                      <AlertDescription className={getChangeColor(comparisonData.delta_total)}>
                        <strong>Perubahan Skor: {comparisonData.delta_total > 0 ? '+' : ''}{comparisonData.delta_total} poin</strong>
                        {comparisonData.risk_escalation && (
                          <div className="mt-1 text-red-600">
                            ⚠️ Eskalasi risiko terdeteksi - supervisor akan dinotifikasi
                          </div>
                        )}
                      </AlertDescription>
                    </div>
                  </Alert>

                  {/* Component Breakdown */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Perubahan per Komponen</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {Object.entries(comparisonData.delta_components).map(([key, delta]) => {
                          const labels = {
                            fas: 'FAS',
                            psqi: 'PSQI',
                            pa: 'Aktivitas',
                            bp: 'Tekanan Darah',
                            hr: 'Nadi',
                            temp: 'Suhu',
                            face: 'Ekspresi'
                          };
                          
                          return (
                            <div key={key} className="flex items-center justify-between p-2 rounded bg-muted/30">
                              <span>{labels[key as keyof typeof labels]}:</span>
                              <div className="flex items-center space-x-1">
                                {getChangeIcon(delta)}
                                <span className={getChangeColor(delta)}>
                                  {delta > 0 ? '+' : ''}{delta}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recommendations */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Rekomendasi</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {comparisonData.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link to="/dashboard" className="flex-1">
                      <Button variant="outline" className="w-full">
                        <Activity className="h-4 w-4 mr-2" />
                        Lihat Dashboard
                      </Button>
                    </Link>
                    <Link to="/reports" className="flex-1">
                      <Button variant="outline" className="w-full">
                        <FileText className="h-4 w-4 mr-2" />
                        Riwayat Lengkap
                      </Button>
                    </Link>
                    <Link to="/" className="flex-1">
                      <Button className="w-full bg-medical-green hover:bg-medical-green/90">
                        <Home className="h-4 w-4 mr-2" />
                        Selesai
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
