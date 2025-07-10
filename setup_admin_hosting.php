<?php

/**
 * Script Setup Admin untuk cPanel Hosting
 * Upload file ini ke document root, akses via browser, lalu hapus setelah selesai
 * URL: https://yourdomain.com/setup_admin_hosting.php
 */

// =====================================================
// KONFIGURASI DATABASE CPANEL
// UPDATE sesuai dengan informasi hosting Anda
// =====================================================

$host = 'localhost';
$dbname = 'username_monitoring_iot';      // Format: cpanelusername_databasename
$username = 'username_monitoring_user';   // Format: cpanelusername_dbusername  
$password = 'your_strong_db_password';    // Password database yang kuat

// =====================================================
// KONFIGURASI ADMIN USER
// Ganti dengan kredensial admin yang diinginkan
// =====================================================

$admin_email = 'admin@monitoring.com';
$admin_password = 'Admin123!@#';          // GANTI dengan password yang sangat kuat!
$admin_name = 'Administrator Sistem';

// =====================================================
// TAMPILAN HTML UNTUK BROWSER
// =====================================================
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Setup Admin - IoT Monitoring System</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
        .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .status { padding: 15px; margin: 10px 0; border-radius: 5px; }
        .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .warning { background: #fff3cd; color: #856404; border: 1px solid #ffeaa7; }
        .info { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
        .credential { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Setup Admin - IoT Monitoring System</h1>
            <p>Konfigurasi database dan admin user untuk hosting cPanel</p>
        </div>

<?php
// =====================================================
// PROSES SETUP DATABASE
// =====================================================

try {
    // Koneksi ke database
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo '<div class="status success">✅ <strong>Berhasil terhubung ke database hosting!</strong></div>';
    
    // Hash password dengan bcrypt (kompatibel dengan Laravel)
    $hashedPassword = password_hash($admin_password, PASSWORD_DEFAULT);
    
    // Update atau insert admin user
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE email = ?");
    $stmt->execute([$admin_email]);
    $userExists = $stmt->fetchColumn() > 0;
    
    if ($userExists) {
        // Update existing user
        $stmt = $pdo->prepare("UPDATE users SET password = ?, name = ?, role = 'admin', status = 'active' WHERE email = ?");
        $result = $stmt->execute([$hashedPassword, $admin_name, $admin_email]);
        echo '<div class="status success">✅ <strong>Password admin berhasil diperbarui!</strong></div>';
    } else {
        // Insert new admin user
        $stmt = $pdo->prepare("INSERT INTO users (name, email, password, role, status, created_at, updated_at) VALUES (?, ?, ?, 'admin', 'active', NOW(), NOW())");
        $result = $stmt->execute([$admin_name, $admin_email, $hashedPassword]);
        echo '<div class="status success">✅ <strong>Admin user berhasil dibuat!</strong></div>';
    }
    
    // Tampilkan kredensial login
    echo '<div class="credential">';
    echo '<h3>� Kredensial Login Admin</h3>';
    echo '<p><strong>Email:</strong> ' . htmlspecialchars($admin_email) . '</p>';
    echo '<p><strong>Password:</strong> ' . htmlspecialchars($admin_password) . '</p>';
    echo '<div class="status warning">⚠️ <strong>PENTING:</strong> Segera ganti password setelah login pertama!</div>';
    echo '</div>';
    
    // Verifikasi user admin
    $stmt = $pdo->prepare("SELECT id, name, email, role, status, created_at FROM users WHERE email = ?");
    $stmt->execute([$admin_email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        echo '<h3>📊 Informasi User Admin</h3>';
        echo '<table>';
        echo '<tr><th>Field</th><th>Value</th></tr>';
        echo '<tr><td>ID</td><td>' . $user['id'] . '</td></tr>';
        echo '<tr><td>Name</td><td>' . htmlspecialchars($user['name']) . '</td></tr>';
        echo '<tr><td>Email</td><td>' . htmlspecialchars($user['email']) . '</td></tr>';
        echo '<tr><td>Role</td><td>' . $user['role'] . '</td></tr>';
        echo '<tr><td>Status</td><td>' . $user['status'] . '</td></tr>';
        echo '<tr><td>Created</td><td>' . $user['created_at'] . '</td></tr>';
        echo '</table>';
    }
    
    // Verifikasi struktur database
    echo '<h3>🔍 Verifikasi Database</h3>';
    echo '<table>';
    echo '<tr><th>Tabel</th><th>Jumlah Records</th><th>Status</th></tr>';
    
    $tables = ['users', 'user_preferences', 'sensor_data', 'logs', 'system_logs', 'permissions', 'roles'];
    $allTablesOk = true;
    
    foreach ($tables as $table) {
        try {
            $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM $table");
            $stmt->execute();
            $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
            echo '<tr><td>' . $table . '</td><td>' . $count . '</td><td>✅ OK</td></tr>';
        } catch (Exception $e) {
            echo '<tr><td>' . $table . '</td><td>-</td><td>❌ Error</td></tr>';
            $allTablesOk = false;
        }
    }
    echo '</table>';
    
    if ($allTablesOk) {
        echo '<div class="status success">✅ <strong>Semua tabel database berhasil diverifikasi!</strong></div>';
    } else {
        echo '<div class="status error">❌ <strong>Beberapa tabel tidak ditemukan. Pastikan file SQL sudah di-import dengan benar.</strong></div>';
    }
    
    // Tampilkan langkah selanjutnya
    echo '<div class="status info">';
    echo '<h3>� Setup Berhasil!</h3>';
    echo '<p><strong>Langkah selanjutnya:</strong></p>';
    echo '<ol>';
    echo '<li>Akses website: <strong>' . (isset($_SERVER['HTTPS']) ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'] . '/login</strong></li>';
    echo '<li>Login dengan kredensial di atas</li>';
    echo '<li>Ganti password admin melalui menu pengaturan</li>';
    echo '<li><strong>HAPUS file ini (setup_admin_hosting.php) untuk keamanan!</strong></li>';
    echo '</ol>';
    echo '</div>';
    
} catch (PDOException $e) {
    echo '<div class="status error">';
    echo '<h3>❌ Error Koneksi Database</h3>';
    echo '<p><strong>Pesan Error:</strong> ' . htmlspecialchars($e->getMessage()) . '</p>';
    echo '<h4>� Troubleshooting:</h4>';
    echo '<ol>';
    echo '<li>Pastikan konfigurasi database sudah benar (host, database, username, password)</li>';
    echo '<li>Pastikan file SQL sudah di-import ke database</li>';
    echo '<li>Pastikan user database memiliki permission yang cukup</li>';
    echo '<li>Cek dengan hosting provider jika masalah masih berlanjut</li>';
    echo '</ol>';
    echo '<h4>📋 Informasi Konfigurasi:</h4>';
    echo '<p><strong>Host:</strong> ' . htmlspecialchars($host) . '</p>';
    echo '<p><strong>Database:</strong> ' . htmlspecialchars($dbname) . '</p>';
    echo '<p><strong>Username:</strong> ' . htmlspecialchars($username) . '</p>';
    echo '</div>';
}

?>
        <div class="footer">
            <p><strong>IoT Monitoring System</strong> - Setup Admin untuk cPanel Hosting</p>
            <p><em>Hapus file ini setelah setup selesai untuk keamanan!</em></p>
        </div>
    </div>
</body>
</html>
