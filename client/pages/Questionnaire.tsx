import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  ArrowLeft, 
  ArrowRight,
  CheckCircle, 
  Clock,
  FileText,
  Loader2,
  AlertTriangle
} from 'lucide-react';

interface FASAnswers {
  q1: number | null; // Saya merasa fisik saya lelah
  q2: number | null; // Saya merasa kesulitan memulai aktivitas  
  q3: number | null; // Saya mengalami masalah konsentrasi
}

interface PSQIAnswers {
  q1: number | null; // Berapa jam total tidur semalam
  q2: number | null; // Bagaimana kualitas tidur Anda
  q3: number | null; // Apakah Anda sering terbangun di malam hari
  q4: number | null; // Seberapa segar badan Anda saat bangun
}

type PhysicalActivityAnswer = number | null;

type Step = 'fas' | 'psqi' | 'physical' | 'review';

export default function Questionnaire() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>('fas');
  const [fasAnswers, setFasAnswers] = useState<FASAnswers>({
    q1: null,
    q2: null,
    q3: null
  });
  const [psqiAnswers, setPsqiAnswers] = useState<PSQIAnswers>({
    q1: null,
    q2: null,
    q3: null,
    q4: null
  });
  const [physicalActivityAnswer, setPhysicalActivityAnswer] = useState<PhysicalActivityAnswer>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState(new Date());

  // Auto-save to localStorage
  useEffect(() => {
    const data = {
      fasAnswers,
      psqiAnswers,
      physicalActivityAnswer,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('fatmos_questionnaire_draft', JSON.stringify(data));
  }, [fasAnswers, psqiAnswers, physicalActivityAnswer]);

  // Load draft on mount
  useEffect(() => {
    const saved = localStorage.getItem('fatmos_questionnaire_draft');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        // Only load if less than 1 hour old
        if (new Date().getTime() - new Date(data.timestamp).getTime() < 3600000) {
          setFasAnswers(data.fasAnswers || fasAnswers);
          setPsqiAnswers(data.psqiAnswers || psqiAnswers);
          setPhysicalActivityAnswer(data.physicalActivityAnswer);
        }
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, []);

  const getStepNumber = () => {
    const steps = { fas: 1, psqi: 2, physical: 3, review: 4 };
    return steps[currentStep];
  };

  const getProgressPercentage = () => {
    return (getStepNumber() / 4) * 100;
  };

  const isFASComplete = () => {
    return fasAnswers.q1 !== null && fasAnswers.q2 !== null && fasAnswers.q3 !== null;
  };

  const isPSQIComplete = () => {
    return psqiAnswers.q1 !== null && psqiAnswers.q2 !== null && 
           psqiAnswers.q3 !== null && psqiAnswers.q4 !== null;
  };

  const isPhysicalComplete = () => {
    return physicalActivityAnswer !== null;
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'fas': return isFASComplete();
      case 'psqi': return isPSQIComplete();
      case 'physical': return isPhysicalComplete();
      case 'review': return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (!canProceed()) return;
    
    const stepOrder: Step[] = ['fas', 'psqi', 'physical', 'review'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    const stepOrder: Step[] = ['fas', 'psqi', 'physical', 'review'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Calculate session duration
      const endTime = new Date();
      const durationMs = endTime.getTime() - startTime.getTime();
      
      const payload = {
        session_id: `${new Date().toISOString().split('T')[0]}-${startTime.getHours()}-${startTime.getMinutes()}-${startTime.getSeconds()}-usr123`,
        fas_answers: [fasAnswers.q1!, fasAnswers.q2!, fasAnswers.q3!],
        psqi_answers: [psqiAnswers.q1!, psqiAnswers.q2!, psqiAnswers.q3!, psqiAnswers.q4!],
        pa_answer: physicalActivityAnswer!,
        duration_ms: durationMs,
        timestamp: new Date().toISOString()
      };

      // Submit to backend API
      const response = await fetch('/api/v1/questionnaires', {
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
      console.log('Questionnaire submitted successfully:', result);
      
      // Clear saved draft
      localStorage.removeItem('fatmos_questionnaire_draft');
      
      // Navigate to results or dashboard
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Submission error:', error);
      alert('Terjadi kesalahan saat mengirim data. Silakan coba lagi.');
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
              ? 'border-medical-blue bg-medical-blue text-white'
              : 'border-border bg-background hover:border-medical-blue/50'
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-blue-light via-background to-medical-green-light">
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
                <div className="bg-medical-blue text-white p-2 rounded-lg">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground">Daily Fatigue Assessment</h1>
                  <p className="text-sm text-muted-foreground">
                    Langkah {getStepNumber()} dari 4 - Estimasi waktu: &lt; 1 menit
                  </p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="text-medical-blue border-medical-blue">
                <Clock className="h-3 w-3 mr-1" />
                {Math.floor((new Date().getTime() - startTime.getTime()) / 1000)}s
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
          <Card>
            <CardHeader>
              <CardTitle className="text-center">
                {currentStep === 'fas' && 'Fatigue Assessment Scale (FAS)'}
                {currentStep === 'psqi' && 'Pittsburgh Sleep Quality Index (PSQI)'}
                {currentStep === 'physical' && 'Physical Activity Assessment'}
                {currentStep === 'review' && 'Review & Submit'}
              </CardTitle>
              <p className="text-center text-muted-foreground">
                {currentStep === 'fas' && 'Mohon jawab pertanyaan berikut tentang tingkat kelelahan Anda'}
                {currentStep === 'psqi' && 'Evaluasi kualitas tidur dalam 24 jam terakhir'}
                {currentStep === 'physical' && 'Durasi aktivitas fisik dalam 24 jam terakhir'}
                {currentStep === 'review' && 'Periksa jawaban Anda sebelum mengirim'}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* FAS Section */}
              {currentStep === 'fas' && (
                <div className="space-y-8">
                  {/* Question 1 */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">1. Saya merasa fisik saya lelah (energi terkuras)</h3>
                    <LikertScale 
                      value={fasAnswers.q1} 
                      onChange={(value) => setFasAnswers(prev => ({ ...prev, q1: value }))}
                    />
                  </div>

                  {/* Question 2 */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">2. Saya merasa kesulitan memulai aktivitas</h3>
                    <LikertScale 
                      value={fasAnswers.q2} 
                      onChange={(value) => setFasAnswers(prev => ({ ...prev, q2: value }))}
                    />
                  </div>

                  {/* Question 3 */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">3. Saya mengalami masalah konsentrasi atau berpikir</h3>
                    <LikertScale 
                      value={fasAnswers.q3} 
                      onChange={(value) => setFasAnswers(prev => ({ ...prev, q3: value }))}
                    />
                  </div>
                </div>
              )}

              {/* PSQI Section */}
              {currentStep === 'psqi' && (
                <div className="space-y-8">
                  {/* Question 1 */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">1. Berapa jam total tidur semalam?</h3>
                    <LikertScale 
                      value={psqiAnswers.q1} 
                      onChange={(value) => setPsqiAnswers(prev => ({ ...prev, q1: value }))}
                      options={[
                        { value: 1, label: '> 7 jam' },
                        { value: 2, label: '6-7 jam' },
                        { value: 3, label: '5-6 jam' },
                        { value: 4, label: '< 5 jam' }
                      ]}
                    />
                  </div>

                  {/* Question 2 */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">2. Bagaimana kualitas tidur Anda?</h3>
                    <LikertScale 
                      value={psqiAnswers.q2} 
                      onChange={(value) => setPsqiAnswers(prev => ({ ...prev, q2: value }))}
                      options={[
                        { value: 1, label: 'Sangat baik' },
                        { value: 2, label: 'Baik' },
                        { value: 3, label: 'Buruk' },
                        { value: 4, label: 'Sangat buruk' }
                      ]}
                    />
                  </div>

                  {/* Question 3 */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">3. Apakah Anda sering terbangun di malam hari?</h3>
                    <LikertScale 
                      value={psqiAnswers.q3} 
                      onChange={(value) => setPsqiAnswers(prev => ({ ...prev, q3: value }))}
                      options={[
                        { value: 1, label: 'Tidak pernah' },
                        { value: 2, label: '1-2 kali' },
                        { value: 3, label: '3-4 kali' },
                        { value: 4, label: '> 4 kali' }
                      ]}
                    />
                  </div>

                  {/* Question 4 */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">4. Seberapa segar badan Anda saat bangun?</h3>
                    <LikertScale 
                      value={psqiAnswers.q4} 
                      onChange={(value) => setPsqiAnswers(prev => ({ ...prev, q4: value }))}
                      options={[
                        { value: 1, label: 'Sangat segar' },
                        { value: 2, label: 'Segar' },
                        { value: 3, label: 'Agak lelah' },
                        { value: 4, label: 'Sangat lelah' }
                      ]}
                    />
                  </div>
                </div>
              )}

              {/* Physical Activity Section */}
              {currentStep === 'physical' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">
                      Dalam 24 jam terakhir, berapa lama Anda beraktivitas fisik tanpa jeda?
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Termasuk berdiri lama, berjalan, mengangkat, atau aktivitas fisik lainnya
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { value: 0, label: '< 30 menit', description: 'Aktivitas ringan' },
                        { value: 1, label: '30-60 menit', description: 'Aktivitas sedang' },
                        { value: 2, label: '1-2 jam', description: 'Aktivitas berat' },
                        { value: 3, label: '> 4 jam', description: 'Aktivitas sangat berat' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setPhysicalActivityAnswer(option.value)}
                          className={`p-4 rounded-lg border-2 transition-all text-left ${
                            physicalActivityAnswer === option.value
                              ? 'border-medical-blue bg-medical-blue text-white'
                              : 'border-border bg-background hover:border-medical-blue/50'
                          }`}
                        >
                          <div className="font-semibold text-lg mb-1">{option.label}</div>
                          <div className="text-sm opacity-80">{option.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Review Section */}
              {currentStep === 'review' && (
                <div className="space-y-6">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Periksa kembali jawaban Anda sebelum mengirim. Data ini akan digunakan untuk analisis AI-FatMoS.
                    </AlertDescription>
                  </Alert>

                  <div className="grid gap-6">
                    {/* FAS Summary */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Fatigue Assessment (FAS)</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Kelelahan fisik:</span>
                          <Badge variant="outline">{likertOptions.find(o => o.value === fasAnswers.q1)?.label}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Kesulitan memulai aktivitas:</span>
                          <Badge variant="outline">{likertOptions.find(o => o.value === fasAnswers.q2)?.label}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Masalah konsentrasi:</span>
                          <Badge variant="outline">{likertOptions.find(o => o.value === fasAnswers.q3)?.label}</Badge>
                        </div>
                      </CardContent>
                    </Card>

                    {/* PSQI Summary */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Sleep Quality (PSQI)</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Durasi tidur:</span>
                          <Badge variant="outline">
                            {psqiAnswers.q1 === 1 && '> 7 jam'}
                            {psqiAnswers.q1 === 2 && '6-7 jam'}
                            {psqiAnswers.q1 === 3 && '5-6 jam'}
                            {psqiAnswers.q1 === 4 && '< 5 jam'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Kualitas tidur:</span>
                          <Badge variant="outline">
                            {psqiAnswers.q2 === 1 && 'Sangat baik'}
                            {psqiAnswers.q2 === 2 && 'Baik'}
                            {psqiAnswers.q2 === 3 && 'Buruk'}
                            {psqiAnswers.q2 === 4 && 'Sangat buruk'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Terbangun malam:</span>
                          <Badge variant="outline">
                            {psqiAnswers.q3 === 1 && 'Tidak pernah'}
                            {psqiAnswers.q3 === 2 && '1-2 kali'}
                            {psqiAnswers.q3 === 3 && '3-4 kali'}
                            {psqiAnswers.q3 === 4 && '> 4 kali'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Kesegaran bangun:</span>
                          <Badge variant="outline">
                            {psqiAnswers.q4 === 1 && 'Sangat segar'}
                            {psqiAnswers.q4 === 2 && 'Segar'}
                            {psqiAnswers.q4 === 3 && 'Agak lelah'}
                            {psqiAnswers.q4 === 4 && 'Sangat lelah'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Physical Activity Summary */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Physical Activity</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm">
                        <div className="flex justify-between">
                          <span>Durasi aktivitas fisik:</span>
                          <Badge variant="outline">
                            {physicalActivityAnswer === 0 && '< 30 menit'}
                            {physicalActivityAnswer === 1 && '30-60 menit'}
                            {physicalActivityAnswer === 2 && '1-2 jam'}
                            {physicalActivityAnswer === 3 && '> 4 jam'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between pt-6 border-t">
                <Button 
                  variant="outline" 
                  onClick={handlePrevious}
                  disabled={currentStep === 'fas'}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Sebelumnya
                </Button>

                {currentStep !== 'review' ? (
                  <Button 
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className="bg-medical-blue hover:bg-medical-blue/90"
                  >
                    Selanjutnya
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-medical-green hover:bg-medical-green/90"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Kirim Data
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Validation Alert */}
              {!canProceed() && currentStep !== 'review' && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Mohon jawab semua pertanyaan sebelum melanjutkan ke tahap berikutnya.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
