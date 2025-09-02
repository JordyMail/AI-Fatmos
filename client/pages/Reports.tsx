import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft,
  FileText, 
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  BarChart3,
  Filter,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity
} from 'lucide-react';

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
  trend_change: number; // percentage change from previous period
}

export default function Reports() {
  const [userRole] = useState<'nakes' | 'supervisor' | 'admin'>('nakes'); // In real app, get from auth
  const [dateFrom, setDateFrom] = useState('2025-01-01');
  const [dateTo, setDateTo] = useState('2025-01-15');
  const [selectedUnit, setSelectedUnit] = useState('all');
  const [selectedRisk, setSelectedRisk] = useState('all');
  const [loading, setLoading] = useState(false);
  const [summaryStats, setSummaryStats] = useState<SummaryStats | null>(null);
  const [historyData, setHistoryData] = useState<HistoryRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null);

  // Mock data - in real app this would come from API
  useEffect(() => {
    loadData();
  }, [dateFrom, dateTo, selectedUnit, selectedRisk]);

  const loadData = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock summary stats
    setSummaryStats({
      total_sessions: 26,
      avg_total_score: 7.8,
      risk_distribution: {
        fit: 10,
        mild: 8,
        moderate: 5,
        severe: 3
      },
      trend_change: -12.5 // 12.5% decrease (improvement)
    });

    // Mock history data
    const mockData: HistoryRecord[] = [
      {
        session_id: 'sess-001',
        date: '2025-01-15T07:30:00',
        total_score: 12,
        risk: 'moderate',
        components: { fas: 2, psqi: 3, pa: 1, bp: 2, hr: 1, temp: 0, face: 3 },
        recommendation: 'Evaluasi shift dan beban kerja dengan supervisor',
        shift: 'Pagi',
        unit: 'ICU'
      },
      {
        session_id: 'sess-002',
        date: '2025-01-14T07:15:00',
        total_score: 6,
        risk: 'mild',
        components: { fas: 1, psqi: 2, pa: 0, bp: 1, hr: 1, temp: 0, face: 1 },
        recommendation: 'Istirahat aktif setiap 2 jam',
        shift: 'Pagi',
        unit: 'ICU'
      },
      {
        session_id: 'sess-003',
        date: '2025-01-13T19:45:00',
        total_score: 4,
        risk: 'fit',
        components: { fas: 0, psqi: 1, pa: 0, bp: 1, hr: 1, temp: 0, face: 1 },
        recommendation: 'Pertahankan pola kerja yang baik',
        shift: 'Malam',
        unit: 'ICU'
      },
      {
        session_id: 'sess-004',
        date: '2025-01-12T07:20:00',
        total_score: 16,
        risk: 'severe',
        components: { fas: 3, psqi: 3, pa: 2, bp: 3, hr: 2, temp: 1, face: 2 },
        recommendation: 'Segera lakukan skrining medis atau rujukan',
        shift: 'Pagi',
        unit: 'ICU'
      },
      {
        session_id: 'sess-005',
        date: '2025-01-11T15:30:00',
        total_score: 8,
        risk: 'mild',
        components: { fas: 1, psqi: 2, pa: 1, bp: 1, hr: 2, temp: 0, face: 1 },
        recommendation: 'Monitor kondisi pada check-out',
        shift: 'Siang',
        unit: 'ICU'
      }
    ];

    setHistoryData(mockData);
    setLoading(false);
  };

  const getRiskColor = (risk: string) => {
    const colors = {
      fit: 'bg-status-fit text-white',
      mild: 'bg-status-mild text-white',
      moderate: 'bg-status-moderate text-white',
      severe: 'bg-status-severe text-white'
    };
    return colors[risk as keyof typeof colors] || 'bg-gray-500 text-white';
  };

  const getRiskLabel = (risk: string) => {
    const labels = {
      fit: 'Fit',
      mild: 'Ringan',
      moderate: 'Moderat',
      severe: 'Berat'
    };
    return labels[risk as keyof typeof labels] || risk;
  };

  const exportData = async (format: 'csv' | 'pdf') => {
    // In real app, this would call the export API
    alert(`Mengekspor data dalam format ${format.toUpperCase()}...`);
  };

  const TrendChart = () => {
    // Mock trend data for the last 7 days
    const trendData = [
      { date: '09 Jan', score: 5 },
      { date: '10 Jan', score: 7 },
      { date: '11 Jan', score: 8 },
      { date: '12 Jan', score: 16 },
      { date: '13 Jan', score: 4 },
      { date: '14 Jan', score: 6 },
      { date: '15 Jan', score: 12 }
    ];

    return (
      <div className="space-y-4">
        <h3 className="font-semibold">Tren Skor 7 Hari Terakhir</h3>
        <div className="flex items-end space-x-2 h-32 bg-muted/20 p-4 rounded-lg">
          {trendData.map((day, index) => {
            const height = (day.score / 21) * 100;
            const color = day.score <= 5 ? 'bg-status-fit' : 
                         day.score <= 9 ? 'bg-status-mild' : 
                         day.score <= 14 ? 'bg-status-moderate' : 'bg-status-severe';
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className={`w-full ${color} rounded-t transition-all hover:opacity-80 cursor-pointer`}
                  style={{ height: `${height}%` }}
                  title={`${day.date}: ${day.score}/21`}
                />
                <div className="text-xs text-muted-foreground mt-2 text-center">
                  <div>{day.date}</div>
                  <div className="font-medium">{day.score}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const ComponentBreakdown = ({ components }: { components: HistoryRecord['components'] }) => {
    const items = [
      { key: 'fas', label: 'FAS', value: components.fas },
      { key: 'psqi', label: 'PSQI', value: components.psqi },
      { key: 'pa', label: 'PA', value: components.pa },
      { key: 'bp', label: 'BP', value: components.bp },
      { key: 'hr', label: 'HR', value: components.hr },
      { key: 'temp', label: 'Temp', value: components.temp },
      { key: 'face', label: 'Face', value: components.face }
    ];

    return (
      <div className="flex space-x-1">
        {items.map((item) => (
          <div key={item.key} className="text-center">
            <div className="text-xs font-medium text-muted-foreground">{item.label}</div>
            <div className={`text-sm font-bold px-1 py-0.5 rounded ${
              item.value === 0 ? 'bg-status-fit text-white' :
              item.value === 1 ? 'bg-status-mild text-white' :
              item.value === 2 ? 'bg-status-moderate text-white' :
              'bg-status-severe text-white'
            }`}>
              {item.value}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-blue-light via-background to-medical-green-light">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
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
                  <h1 className="text-lg font-bold text-foreground">Reports & History</h1>
                  <p className="text-sm text-muted-foreground">
                    Akses data historis dan laporan untuk pemantauan kondisi
                  </p>
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => exportData('csv')}>
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportData('pdf')}>
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        
        {/* Filters */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filter Data</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Dari Tanggal</label>
                <Input 
                  type="date" 
                  value={dateFrom} 
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Sampai Tanggal</label>
                <Input 
                  type="date" 
                  value={dateTo} 
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
              {(userRole === 'supervisor' || userRole === 'admin') && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Unit/Tim</label>
                  <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Unit</SelectItem>
                      <SelectItem value="icu">ICU</SelectItem>
                      <SelectItem value="er">Emergency Room</SelectItem>
                      <SelectItem value="ward">Ward</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium">Tingkat Risiko</label>
                <Select value={selectedRisk} onValueChange={setSelectedRisk}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Level</SelectItem>
                    <SelectItem value="fit">Fit</SelectItem>
                    <SelectItem value="mild">Ringan</SelectItem>
                    <SelectItem value="moderate">Moderat</SelectItem>
                    <SelectItem value="severe">Berat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Statistics */}
        {summaryStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Sesi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaryStats.total_sessions}</div>
                <div className="text-xs text-muted-foreground">Dalam periode terpilih</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Rata-rata Skor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaryStats.avg_total_score.toFixed(1)}/21</div>
                <div className="flex items-center space-x-1">
                  {summaryStats.trend_change < 0 ? (
                    <TrendingDown className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingUp className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-xs ${summaryStats.trend_change < 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {Math.abs(summaryStats.trend_change)}% vs periode sebelumnya
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Distribusi Risiko</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Fit: {summaryStats.risk_distribution.fit}</span>
                    <span>Ringan: {summaryStats.risk_distribution.mild}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Moderat: {summaryStats.risk_distribution.moderate}</span>
                    <span>Berat: {summaryStats.risk_distribution.severe}</span>
                  </div>
                  <div className="flex h-2 rounded overflow-hidden">
                    <div className="bg-status-fit" style={{width: `${(summaryStats.risk_distribution.fit/summaryStats.total_sessions)*100}%`}} />
                    <div className="bg-status-mild" style={{width: `${(summaryStats.risk_distribution.mild/summaryStats.total_sessions)*100}%`}} />
                    <div className="bg-status-moderate" style={{width: `${(summaryStats.risk_distribution.moderate/summaryStats.total_sessions)*100}%`}} />
                    <div className="bg-status-severe" style={{width: `${(summaryStats.risk_distribution.severe/summaryStats.total_sessions)*100}%`}} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Status Terbaru</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Badge className={getRiskColor(historyData[0]?.risk || 'fit')}>
                    {getRiskLabel(historyData[0]?.risk || 'fit')}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Skor: {historyData[0]?.total_score || 0}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {historyData[0] ? new Date(historyData[0].date).toLocaleDateString('id-ID') : 'Tidak ada data'}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts and Data */}
        <Tabs defaultValue="trend" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="trend">Grafik Tren</TabsTrigger>
            <TabsTrigger value="history">Riwayat Detail</TabsTrigger>
          </TabsList>

          <TabsContent value="trend" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Analisis Tren</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TrendChart />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Riwayat Detail</span>
                  </div>
                  <Badge variant="outline">{historyData.length} record</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal & Waktu</TableHead>
                        <TableHead>Skor Total</TableHead>
                        <TableHead>Risiko</TableHead>
                        <TableHead>Komponen</TableHead>
                        <TableHead>Shift</TableHead>
                        <TableHead>Rekomendasi</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            Loading data...
                          </TableCell>
                        </TableRow>
                      ) : historyData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            Tidak ada data dalam periode yang dipilih
                          </TableCell>
                        </TableRow>
                      ) : (
                        historyData.map((record) => (
                          <TableRow key={record.session_id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {new Date(record.date).toLocaleDateString('id-ID')}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {new Date(record.date).toLocaleTimeString('id-ID', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-bold text-lg">{record.total_score}/21</div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getRiskColor(record.risk)}>
                                {getRiskLabel(record.risk)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <ComponentBreakdown components={record.components} />
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{record.shift}</Badge>
                            </TableCell>
                            <TableCell className="max-w-xs">
                              <div className="text-sm truncate" title={record.recommendation}>
                                {record.recommendation}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setSelectedRecord(record)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Detail Modal (simplified as Alert for now) */}
        {selectedRecord && (
          <Alert>
            <Activity className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="font-semibold">Detail Sesi: {selectedRecord.session_id}</div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>Tanggal: {new Date(selectedRecord.date).toLocaleString('id-ID')}</div>
                  <div>Shift: {selectedRecord.shift}</div>
                  <div>Unit: {selectedRecord.unit}</div>
                  <div>Skor Total: {selectedRecord.total_score}/21</div>
                </div>
                <div className="pt-2">
                  <ComponentBreakdown components={selectedRecord.components} />
                </div>
                <div className="pt-2">
                  <strong>Rekomendasi:</strong> {selectedRecord.recommendation}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSelectedRecord(null)}
                  className="mt-2"
                >
                  Tutup
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </main>
    </div>
  );
}
