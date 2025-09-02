import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Heart, 
  Thermometer, 
  BarChart3,
  TrendingUp,
  Calendar,
  AlertTriangle
} from 'lucide-react';

export default function Dashboard() {
  // Mock data - in real app this would come from API
  const todayScore = {
    total: 8,
    components: {
      fas: 2,
      psqi: 1,
      activity: 0,
      bloodPressure: 1,
      heartRate: 1,
      temperature: 0,
      facial: 3
    },
    classification: 'mild'
  };

  const weeklyTrend = [
    { day: 'Sen', score: 5 },
    { day: 'Sel', score: 7 },
    { day: 'Rab', score: 6 },
    { day: 'Kam', score: 9 },
    { day: 'Jum', score: 8 },
    { day: 'Sab', score: 4 },
    { day: 'Min', score: 3 }
  ];

  const getClassificationInfo = (classification: string) => {
    const config = {
      fit: { label: 'Fit (0-5)', color: 'bg-status-fit', description: 'Kondisi optimal' },
      mild: { label: 'Ringan (6-9)', color: 'bg-status-mild', description: 'Perlu perhatian' },
      moderate: { label: 'Moderat (10-14)', color: 'bg-status-moderate', description: 'Butuh evaluasi' },
      severe: { label: 'Parah (15-21)', color: 'bg-status-severe', description: 'Perlu tindakan' }
    };
    return config[classification as keyof typeof config] || config.fit;
  };

  const classificationInfo = getClassificationInfo(todayScore.classification);

  return (
    <DashboardLayout userRole="nakes" userName="Dr. Sarah Wijaya">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Dashboard Pribadi</h1>
          <p className="text-muted-foreground">Pantau kondisi kesehatan dan tingkat kelelahan Anda</p>
        </div>

        {/* Today's Score */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-medical-blue" />
                <span>Skor Hari Ini</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-3xl font-bold text-foreground">{todayScore.total}/21</div>
                  <Badge className={`${classificationInfo.color} text-white mt-1`}>
                    {classificationInfo.label}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Status</div>
                  <div className="font-medium">{classificationInfo.description}</div>
                </div>
              </div>
              
              <Progress value={(todayScore.total / 21) * 100} className="mb-4" />
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span>FAS (Kelelahan):</span>
                  <span className="font-medium">{todayScore.components.fas}/3</span>
                </div>
                <div className="flex justify-between">
                  <span>PSQI (Tidur):</span>
                  <span className="font-medium">{todayScore.components.psqi}/3</span>
                </div>
                <div className="flex justify-between">
                  <span>Aktivitas Fisik:</span>
                  <span className="font-medium">{todayScore.components.activity}/3</span>
                </div>
                <div className="flex justify-between">
                  <span>Tekanan Darah:</span>
                  <span className="font-medium">{todayScore.components.bloodPressure}/3</span>
                </div>
                <div className="flex justify-between">
                  <span>Denyut Nadi:</span>
                  <span className="font-medium">{todayScore.components.heartRate}/3</span>
                </div>
                <div className="flex justify-between">
                  <span>Suhu Tubuh:</span>
                  <span className="font-medium">{todayScore.components.temperature}/3</span>
                </div>
                <div className="flex justify-between col-span-2">
                  <span>Ekspresi Wajah:</span>
                  <span className="font-medium">{todayScore.components.facial}/3</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-medical-orange" />
                <span>Rekomendasi</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-medical-orange-light/10 rounded-lg">
                <div className="font-medium text-sm mb-1">Istirahat Aktif</div>
                <div className="text-xs text-muted-foreground">
                  Ambil istirahat 15 menit setiap 2 jam
                </div>
              </div>
              <div className="p-3 bg-medical-blue-light/10 rounded-lg">
                <div className="font-medium text-sm mb-1">Monitor Ekspresi</div>
                <div className="text-xs text-muted-foreground">
                  Skor ekspresi wajah tinggi, perhatikan tanda kelelahan
                </div>
              </div>
              <div className="p-3 bg-medical-green-light/10 rounded-lg">
                <div className="font-medium text-sm mb-1">Evaluasi Shift</div>
                <div className="text-xs text-muted-foreground">
                  Diskusikan beban kerja dengan supervisor
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-medical-green" />
              <span>Tren Mingguan</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end space-x-4 h-32">
              {weeklyTrend.map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-medical-blue rounded-t"
                    style={{ height: `${(day.score / 21) * 100}%` }}
                  />
                  <div className="text-xs text-muted-foreground mt-2">{day.day}</div>
                  <div className="text-xs font-medium">{day.score}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Measurements */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-base">
                <Heart className="h-4 w-4 text-medical-red" />
                <span>Biometrik Terakhir</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tekanan Darah:</span>
                <span className="font-medium">120/80 mmHg</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Denyut Nadi:</span>
                <span className="font-medium">72 bpm</span>
              </div>
              <div className="text-xs text-muted-foreground">Check-in hari ini, 08:30</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-base">
                <Thermometer className="h-4 w-4 text-medical-orange" />
                <span>Suhu Tubuh</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-2xl font-bold">36.8°C</div>
              <div className="text-xs text-muted-foreground">Normal</div>
              <div className="text-xs text-muted-foreground">Check-in hari ini, 08:30</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-base">
                <Calendar className="h-4 w-4 text-medical-green" />
                <span>Shift Hari Ini</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">
                <div className="font-medium">Shift Pagi</div>
                <div className="text-muted-foreground">07:00 - 15:00</div>
              </div>
              <div className="text-xs text-muted-foreground">Unit: ICU Lantai 3</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
