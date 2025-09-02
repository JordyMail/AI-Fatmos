import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  Heart, 
  Thermometer, 
  Camera,
  FileText,
  Shield,
  AlertTriangle
} from 'lucide-react';

export default function CheckIn() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'consent' | 'preparation' | 'measurement'>('consent');
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [preparationTime, setPreparationTime] = useState(300); // 5 minutes in seconds
  const [isPreparationActive, setIsPreparationActive] = useState(false);

  const handleConsentAccept = () => {
    if (consentAccepted) {
      setStep('preparation');
      setIsPreparationActive(true);
      // Start countdown timer
      const timer = setInterval(() => {
        setPreparationTime(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setStep('measurement');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const handleConsentReject = () => {
    navigate('/', { replace: true });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (step === 'consent') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-medical-blue-light via-background to-medical-green-light">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-sm border-b shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-3">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Kembali
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="bg-medical-green text-white p-2 rounded-lg">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground">Check-in - Persetujuan</h1>
                  <p className="text-sm text-muted-foreground">Langkah 1 dari 3</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Progress */}
        <div className="container mx-auto px-4 py-4">
          <Progress value={33} className="max-w-2xl mx-auto" />
        </div>

        {/* Consent Form */}
        <main className="container mx-auto px-4 pb-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto bg-medical-blue text-white p-3 rounded-full w-fit mb-3">
                  <Shield className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl">Persetujuan Pemantauan Kesehatan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Sistem ini akan memantau parameter kesehatan Anda untuk tujuan pemantauan kelelahan dan kesejahteraan kerja.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Parameter yang Akan Dipantau:</h3>
                  
                  <div className="grid gap-4">
                    <div className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                      <Heart className="h-5 w-5 text-medical-red mt-0.5" />
                      <div>
                        <div className="font-medium">Data Biometrik</div>
                        <div className="text-sm text-muted-foreground">
                          Tekanan darah dan denyut nadi melalui sensor otomatis
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                      <Thermometer className="h-5 w-5 text-medical-orange mt-0.5" />
                      <div>
                        <div className="font-medium">Suhu Tubuh</div>
                        <div className="text-sm text-muted-foreground">
                          Pengukuran suhu non-kontak menggunakan kamera termal
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                      <Camera className="h-5 w-5 text-medical-blue mt-0.5" />
                      <div>
                        <div className="font-medium">Analisis Ekspresi Wajah</div>
                        <div className="text-sm text-muted-foreground">
                          Deteksi tingkat kelelahan melalui analisis ekspresi dengan AI
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                      <FileText className="h-5 w-5 text-medical-green mt-0.5" />
                      <div>
                        <div className="font-medium">Kuesioner Singkat</div>
                        <div className="text-sm text-muted-foreground">
                          Evaluasi kelelahan (FAS), kualitas tidur (PSQI), dan aktivitas fisik
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <h3 className="font-semibold">Ketentuan Penggunaan Data:</h3>
                  <ul className="space-y-1 text-muted-foreground ml-4">
                    <li>• Data hanya digunakan untuk keperluan internal pemantauan kesehatan kerja</li>
                    <li>• Semua data dienkripsi dan disimpan dengan aman</li>
                    <li>• Data tidak akan dibagikan kepada pihak ketiga tanpa persetujuan</li>
                    <li>• Anda dapat mengakses dan melihat data pribadi Anda kapan saja</li>
                    <li>• Sistem ini bertujuan untuk meningkatkan kesejahteraan dan keselamatan kerja</li>
                  </ul>
                </div>

                <div className="flex items-center space-x-2 p-4 bg-medical-blue-light/10 rounded-lg">
                  <Checkbox 
                    id="consent" 
                    checked={consentAccepted}
                    onCheckedChange={(checked) => setConsentAccepted(checked as boolean)}
                  />
                  <label htmlFor="consent" className="text-sm font-medium cursor-pointer">
                    Saya memahami dan menyetujui pemantauan parameter kesehatan seperti yang dijelaskan di atas
                  </label>
                </div>

                <div className="flex space-x-3">
                  <Button 
                    variant="outline" 
                    onClick={handleConsentReject}
                    className="flex-1"
                  >
                    Tolak
                  </Button>
                  <Button 
                    onClick={handleConsentAccept}
                    disabled={!consentAccepted}
                    className="flex-1 bg-medical-green hover:bg-medical-green/90"
                  >
                    Setuju & Lanjutkan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (step === 'preparation') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-medical-blue-light via-background to-medical-green-light">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-sm border-b shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-3">
                <div className="bg-medical-orange text-white p-2 rounded-lg">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground">Check-in - Persiapan</h1>
                  <p className="text-sm text-muted-foreground">Langkah 2 dari 3</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Progress */}
        <div className="container mx-auto px-4 py-4">
          <Progress value={66} className="max-w-2xl mx-auto" />
        </div>

        {/* Preparation */}
        <main className="container mx-auto px-4 pb-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto bg-medical-orange text-white p-4 rounded-full w-fit mb-3">
                  <div className="text-3xl font-bold">{formatTime(preparationTime)}</div>
                </div>
                <CardTitle className="text-xl">Persiapan Pengukuran</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    Silakan duduk dengan tenang selama 5 menit untuk memastikan hasil pengukuran tekanan darah yang akurat.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <h3 className="font-semibold">Instruksi Persiapan:</h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-medical-green mt-0.5" />
                      <div className="text-sm">
                        Duduk dengan nyaman di kursi yang tersedia
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-medical-green mt-0.5" />
                      <div className="text-sm">
                        Letakkan kedua kaki rata di lantai
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-medical-green mt-0.5" />
                      <div className="text-sm">
                        Relakskan lengan dan bahu Anda
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-medical-green mt-0.5" />
                      <div className="text-sm">
                        Bernapas dengan normal dan tenang
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-medical-green mt-0.5" />
                      <div className="text-sm">
                        Hindari berbicara selama periode persiapan
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-muted-foreground">
                    Sistem akan otomatis melanjutkan ke tahap pengukuran setelah waktu persiapan selesai
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Measurement step
  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-blue-light via-background to-medical-green-light">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-3">
              <div className="bg-medical-blue text-white p-2 rounded-lg">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Check-in - Pengukuran</h1>
                <p className="text-sm text-muted-foreground">Langkah 3 dari 3</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="container mx-auto px-4 py-4">
        <Progress value={100} className="max-w-2xl mx-auto" />
      </div>

      {/* Measurement Interface */}
      <main className="container mx-auto px-4 pb-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto bg-medical-blue text-white p-3 rounded-full w-fit mb-3">
                <Activity className="h-8 w-8" />
              </div>
              <CardTitle className="text-xl">Pengukuran Data Biometrik</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Activity className="h-4 w-4" />
                <AlertDescription>
                  Sistem sedang melakukan pengukuran otomatis. Tetap tenang dan ikuti instruksi pada layar.
                </AlertDescription>
              </Alert>

              <div className="text-center">
                <Link to="/questionnaire">
                  <Button size="lg" className="bg-medical-blue hover:bg-medical-blue/90">
                    Lanjut ke Kuesioner
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
