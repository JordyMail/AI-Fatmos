import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Heart, Thermometer, Clock, Shield, BarChart3 } from 'lucide-react';

export default function Index() {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-blue-light via-background to-medical-green-light">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-medical-blue text-white p-2 rounded-lg">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">AI-FatMoS</h1>
                <p className="text-sm text-muted-foreground">Sistem Pemantauan Kelelahan Tenaga Kesehatan</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-mono font-bold text-foreground">{formatTime(currentTime)}</div>
              <div className="text-sm text-muted-foreground">{formatDate(currentTime)}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Selamat Datang di Sistem Pemantauan Kelelahan
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Pantau kesejahteraan dan tingkat kelelahan Anda dengan teknologi AI yang canggih. 
              Sistem ini membantu menjaga kesehatan tenaga medis untuk pelayanan optimal.
            </p>
          </div>

          {/* Main Action Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Check-in Card */}
            <Card className="hover:shadow-lg transition-shadow border-medical-green/20">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto bg-medical-green text-white p-3 rounded-full w-fit mb-3">
                  <Clock className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl text-medical-green">Check-in</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Mulai shift kerja Anda dan lakukan pemantauan kesehatan awal
                </p>
                <Link to="/checkin">
                  <Button 
                    size="lg" 
                    className="w-full bg-medical-green hover:bg-medical-green/90 text-white"
                  >
                    Mulai Check-in
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Check-out Card */}
            <Card className="hover:shadow-lg transition-shadow border-medical-orange/20">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto bg-medical-orange text-white p-3 rounded-full w-fit mb-3">
                  <Shield className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl text-medical-orange">Check-out</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Selesaikan shift kerja dan evaluasi kondisi kesehatan Anda
                </p>
                <Link to="/checkout">
                  <Button 
                    size="lg" 
                    className="w-full bg-medical-orange hover:bg-medical-orange/90 text-white"
                  >
                    Mulai Check-out
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Monitoring Components */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-medical-blue" />
                <span>Parameter yang Dipantau</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-medical-blue-light/10 rounded-lg">
                  <Heart className="h-8 w-8 text-medical-red" />
                  <div>
                    <div className="font-semibold">Biometrik</div>
                    <div className="text-sm text-muted-foreground">Tekanan darah & nadi</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-medical-orange-light/10 rounded-lg">
                  <Thermometer className="h-8 w-8 text-medical-orange" />
                  <div>
                    <div className="font-semibold">Suhu Tubuh</div>
                    <div className="text-sm text-muted-foreground">Kamera termal</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-medical-green-light/10 rounded-lg">
                  <Activity className="h-8 w-8 text-medical-green" />
                  <div>
                    <div className="font-semibold">Ekspresi Wajah</div>
                    <div className="text-sm text-muted-foreground">Analisis AI</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-medical-blue-light/10 rounded-lg">
                  <BarChart3 className="h-8 w-8 text-medical-blue" />
                  <div>
                    <div className="font-semibold">Kuesioner</div>
                    <div className="text-sm text-muted-foreground">FAS, PSQI & aktivitas</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Level Indicators */}
          <Card>
            <CardHeader>
              <CardTitle>Klasifikasi Tingkat Risiko</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center">
                  <Badge className="bg-status-fit text-white mb-2 px-3 py-1">
                    Fit (0-5)
                  </Badge>
                  <div className="text-sm text-muted-foreground">Kondisi optimal</div>
                </div>
                <div className="text-center">
                  <Badge className="bg-status-mild text-white mb-2 px-3 py-1">
                    Ringan (6-9)
                  </Badge>
                  <div className="text-sm text-muted-foreground">Perlu perhatian</div>
                </div>
                <div className="text-center">
                  <Badge className="bg-status-moderate text-white mb-2 px-3 py-1">
                    Moderat (10-14)
                  </Badge>
                  <div className="text-sm text-muted-foreground">Butuh evaluasi</div>
                </div>
                <div className="text-center">
                  <Badge className="bg-status-severe text-white mb-2 px-3 py-1">
                    Parah (15-21)
                  </Badge>
                  <div className="text-sm text-muted-foreground">Perlu tindakan</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Access */}
          <div className="mt-8 text-center">
            <div className="space-x-4">
              <Link to="/dashboard">
                <Button variant="outline" className="border-medical-blue text-medical-blue hover:bg-medical-blue hover:text-white">
                  Dashboard Pribadi
                </Button>
              </Link>
              <Link to="/reports">
                <Button variant="outline" className="border-medical-green text-medical-green hover:bg-medical-green hover:text-white">
                  Laporan & Riwayat
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/90 backdrop-blur-sm border-t mt-8">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2024 AI-FatMoS - Sistem Pemantauan Kelelahan Tenaga Kesehatan</p>
            <p className="mt-1">Data Anda aman dan dienkripsi untuk penggunaan internal</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
