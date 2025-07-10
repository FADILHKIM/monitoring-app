<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Data Sensor</title>
    <style>
        body { font-family: DejaVu Sans, Arial, Helvetica, sans-serif; font-size: 12px; color: #222; margin: 0; padding: 10px; }
        h1 { color: #2c3e50; text-align: center; margin-bottom: 0; }
        .subtitle { text-align: center; color: #555; margin-bottom: 20px; font-size: 13px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #bbb; padding: 5px 7px; text-align: center; font-size: 11px; }
        th { background: #2980b9; color: #fff; }
        tr:nth-child(even) { background: #f2f6fa; }
        .footer { margin-top: 25px; text-align: right; color: #888; font-size: 10px; }
        .stat { margin: 10px 0 0 0; font-size: 12px; color: #444; }
    </style>
</head>
<body>
    <h1>Laporan Data Sensor</h1>
    <div class="subtitle">
        Periode:
        @if(isset($startDate) && isset($endDate) && $startDate && $endDate)
            {{ $startDate }} s/d {{ $endDate }}
        @elseif(isset($startDate) && $startDate)
            Mulai {{ $startDate }}
        @elseif(isset($endDate) && $endDate)
            Hingga {{ $endDate }}
        @else
            Semua Data
        @endif
    </div>
    @if(isset($data) && count($data) > 0)
        <div class="stat">
            Total Data: <b>{{ count($data) }}</b>
            | Suhu Rata-rata: <b>{{ number_format(collect($data)->avg('temperature'), 2) }}</b>°C
            | Baterai Rata-rata: <b>{{ number_format(collect($data)->avg('battery_percentage'), 2) }}</b>%
        </div>
    @endif
    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Timestamp</th>
                <th>Arus Masuk (A)</th>
                <th>Arus Keluar (A)</th>
                <th>Tegangan Masuk (V)</th>
                <th>Tegangan Keluar (V)</th>
                <th>Suhu (°C)</th>
                <!-- Lux column removed -->
                <th>Baterai (%)</th>
            </tr>
        </thead>
        <tbody>
            @forelse($data as $i => $row)
                <tr>
                    <td>{{ $i+1 }}</td>
                    <td>{{ isset($row->timestamp) ? $row->timestamp : '-' }}</td>
                    <td>{{ number_format($row->current_in ?? 0, 3, ',', '.') }}</td>
                    <td>{{ number_format($row->current_out ?? 0, 3, ',', '.') }}</td>
                    <td>{{ number_format($row->voltage_in ?? 0, 3, ',', '.') }}</td>
                    <td>{{ number_format($row->voltage_out ?? 0, 3, ',', '.') }}</td>
                    <td>{{ number_format($row->temperature ?? 0, 2, ',', '.') }}</td>
                    <!-- Lux column removed -->
                    <td>{{ number_format($row->battery_percentage ?? 0, 2, ',', '.') }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="9">Tidak ada data ditemukan.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
    <div class="footer">
        Dicetak pada: {{ date('d/m/Y H:i:s') }}
    </div>
</body>
</html>