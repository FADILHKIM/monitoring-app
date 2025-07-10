<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Data Sensor</title>
    <style>
        body { font-family: DejaVu Sans, Arial, Helvetica, sans-serif; font-size: 12px; color: #222; }
        h1 { color: #2c3e50; text-align: center; margin-bottom: 0; }
        .subtitle { text-align: center; color: #555; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #bbb; padding: 6px 8px; text-align: center; }
        th { background: #2980b9; color: #fff; }
        tr:nth-child(even) { background: #f2f6fa; }
        .footer { margin-top: 30px; text-align: right; color: #888; font-size: 11px; }
    </style>
</head>
<body>
    <h1>Laporan Data Sensor</h1>
    <div class="subtitle">
        Periode:
        @if($startDate && $endDate)
            {{ $startDate }} s/d {{ $endDate }}
        @elseif($startDate)
            Mulai {{ $startDate }}
        @elseif($endDate)
            Hingga {{ $endDate }}
        @else
            Semua Data
        @endif
    </div>
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
                <th>Lux</th>
                <th>Baterai (%)</th>
            </tr>
        </thead>
        <tbody>
            @forelse($data as $i => $row)
                <tr>
                    <td>{{ $i+1 }}</td>
                    <td>{{ $row->timestamp }}</td>
                    <td>{{ number_format($row->current_in, 3, ',', '.') }}</td>
                    <td>{{ number_format($row->current_out, 3, ',', '.') }}</td>
                    <td>{{ number_format($row->voltage_in, 3, ',', '.') }}</td>
                    <td>{{ number_format($row->voltage_out, 3, ',', '.') }}</td>
                    <td>{{ number_format($row->temperature, 2, ',', '.') }}</td>
                    <td>{{ number_format($row->lux, 2, ',', '.') }}</td>
                    <td>{{ number_format($row->battery_percentage, 2, ',', '.') }}</td>
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
