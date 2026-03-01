// ===============================
// INIT MAP
// ===============================
var map = L.map('map').setView([-7.9666, 113.8021], 14); // pusat Bondowoso

// Tile Layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);

// ===============================
// Ambil elemen audio alarm
// ===============================
var alarmAudio = document.getElementById('alarmAudio');

// ===============================
// Array marker agar bisa dihapus
// ===============================
var markers = [];

// ===============================
// Tambahkan div status laporan
// ===============================
var statusDiv = document.createElement('div');
statusDiv.id = 'statusLaporan';
statusDiv.style.fontWeight = 'bold';
statusDiv.style.color = '#00ff00';
statusDiv.style.marginTop = '10px';
statusDiv.innerText = 'Status laporan akan muncul di sini';
document.querySelector('.form-container').appendChild(statusDiv);

// ===============================
// Inisialisasi Firebase
// ===============================
const firebaseConfig = {
    apiKey: "API_KEY",
    authDomain: "PROJECT_ID.firebaseapp.com",
    databaseURL: "https://PROJECT_ID-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "PROJECT_ID",
    storageBucket: "PROJECT_ID.appspot.com",
    messagingSenderId: "SENDER_ID",
    appId: "APP_ID"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ===============================
// Event Submit Form
// ===============================
document.getElementById('laporForm').addEventListener('submit', function(e){
    e.preventDefault(); // cegah reload

    // Ambil nilai input
    var nama = document.getElementById('nama').value;
    var rt = document.getElementById('rt').value;
    var rw = document.getElementById('rw').value;
    var dusun = document.getElementById('dusun').value;
    var desa = document.getElementById('desa').value;
    var kondisi = document.getElementById('kondisi').value;
    var keterangan = document.getElementById('keterangan').value;

    // Cek GPS
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(function(position){
            var lat = position.coords.latitude;
            var lon = position.coords.longitude;

            // Hapus marker lama
            markers.forEach(m => map.removeLayer(m));
            markers = [];

            // Tentukan warna marker
            var color = 'blue';
            if(kondisi === 'Banjir') color = 'aqua';
            else if(kondisi === 'Kebakaran') color = 'red';
            else if(kondisi === 'Kecelakaan') color = 'orange';
            else if(kondisi === 'Pencurian') color = 'green';
            else if(kondisi === 'Longsor') color = 'brown';
            else color = 'purple';

            // Tambah marker baru
            var marker = L.circleMarker([lat, lon], {
                radius: 10,
                fillColor: color,
                color: '#fff',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.9
            }).addTo(map)
            .bindPopup(`
                <b>${kondisi}</b><br>
                <b>Nama Pelapor:</b> ${nama}<br>
                <b>RT/RW:</b> ${rt}/${rw}<br>
                <b>Dusun:</b> ${dusun}<br>
                <b>Desa:</b> ${desa}<br>
                <b>Keterangan:</b> ${keterangan}<br>
                <b>Status:</b> <span id="popupStatus">Laporan berhasil dikirim</span>
            `).openPopup();

            markers.push(marker);

            // Zoom ke marker
            map.setView([lat, lon], 16);

            // Alarm dengan auto stop 60 detik
            if(['Banjir','Kebakaran','Kecelakaan'].includes(kondisi)){
                alarmAudio.play().catch(err => console.log("Audio gagal diputar:", err));
                setTimeout(() => {
                    alarmAudio.pause();
                    alarmAudio.currentTime = 0;
                }, 60000); // 60 detik
            }

            // Reset form
            document.getElementById('laporForm').reset();

            // ===== Simpan status ke Firebase =====
            var laporanRef = db.ref('laporan').push();
            laporanRef.set({
                nama, rt, rw, dusun, desa, kondisi, keterangan, lat, lon,
                status: "Laporan berhasil dikirim",
                timestamp: Date.now()
            });

            // ===== Pantau perubahan status realtime =====
            laporanRef.on('value', snapshot => {
                var data = snapshot.val();
                if(data && data.status){
                    statusDiv.innerText = data.status;
                    var popupStatusEl = document.getElementById('popupStatus');
                    if(popupStatusEl) popupStatusEl.innerText = data.status;
                }
            });

        }, function(error){
            alert('Gagal mendapatkan lokasi GPS. Pastikan lokasi diaktifkan.');
        });
    } else {
        alert('Geolocation tidak didukung di browser ini.');
    }
});
