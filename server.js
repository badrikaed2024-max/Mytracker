const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const ID_INSTANCE = '710722721820';
const API_TOKEN = '8557073dd9454513a8733a8019cce9daabae3d6892a143eea2';
const MY_PHONE_NUMBER = '25377633359';

app.use(express.json());

// استقبال إحداثيات الموقع الجغرافي عند ضغط العميل
app.post('/send-location', async (req, e_res) => {
  try {
    const { lat, lon } = req.body;
    const mapsLink = `https://www.google.com/maps?q=${lat},${lon}`;
    
    const message = `📍 طلب توصيل أو معاينة جديد!\n\n` +
                    `إحداثيات موقع العميل (GPS):\n` +
                    `خط العرض: ${lat}\n` +
                    `خط الطول: ${lon}\n\n` +
                    `🗺️ افتح موقع العميل مباشرة على خريطة جوجل:\n${mapsLink}`;

    const url = `https://api.green-api.com/waInstance${ID_INSTANCE}/sendMessage/${API_TOKEN}`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatId: `${MY_PHONE_NUMBER}@c.us`,
        message: message
      })
    });

    e_res.json({ success: true });
  } catch (err) {
    console.error('Error:', err);
    e_res.status(500).json({ success: false });
  }
});

// الصفحة الرئيسية: معرض أعمال الطاقة الشمسية + تتبع الزائر + زر تحديد الموقع
app.get('/', async (req, res) => {
  try {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'غير معروف';
    let locationInfo = 'الموقع الجغرافي: غير محدد';
    try {
      const ipClean = clientIp.split(',')[0].trim();
      if (ipClean && ipClean !== '127.0.0.1' && ipClean !== '::1') {
        const geoRes = await fetch(`http://ip-api.com/json/${ipClean}`);
        const geoData = await geoRes.json();
        if (geoData.status === 'success') {
          locationInfo = `الدولة: ${geoData.country} | المدينة: ${geoData.city}`;
        }
      }
    } catch (e) {}

    // إرسال تنبيه بالزيارة إلى واتساب
    const visitMessage = `🚨 تم فتح موقعك من قبل زائر!\n🌐 IP: ${clientIp}\n📍 ${locationInfo}\n⏰ ${new Date().toLocaleString('ar-SA')}`;
    const url = `https://api.green-api.com/waInstance${ID_INSTANCE}/sendMessage/${API_TOKEN}`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatId: `${MY_PHONE_NUMBER}@c.us`,
        message: visitMessage
      })
    });
  } catch (err) {
    console.error('Visit notification error:', err);
  }

  // تصميم صفحة الويب للعميل (معرض الطاقة الشمسية)
  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>مهندس بدري - طاقة شمسية</title>
        <style>
            body { font-family: Tahoma, sans-serif; text-align: center; background: #f9f9f9; margin: 0; padding: 20px; }
            h1 { color: #2c3e50; }
            .gallery { display: flex; flex-direction: column; align-items: center; gap: 20px; margin-top: 20px; }
            img, video { width: 100%; max-width: 400px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
            .btn-loc { background: #25D366; color: white; border: none; padding: 15px 25px; font-size: 18px; border-radius: 8px; cursor: pointer; margin-top: 30px; font-weight: bold; }
            .btn-loc:hover { background: #1ebd59; }
            #status { margin-top: 15px; color: #333; font-weight: bold; }
        </style>
    </head>
    <body>
        <h1>☀️ عروض وأعمال الطاقة الشمسية</h1>
        <p>نقدم أفضل حلول وأنظمة الطاقة الشمسية والهجينة</p>

        <div class="gallery">
            <!-- يمكنك وضع صورك وفيديوهاتك هنا -->
            <img src="https://images.unsplash.com/photo-1509391365330-174367454fb2" alt="طاقة شمسية">
            <p>تركيب منظومات شمسية متكاملة</p>
        </div>

        <div style="margin-top: 40px; padding: 20px; background: white; border-radius: 10px; display: inline-block; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <h3>📍 هل تريد طلب خدمة أو توصيل؟</h3>
            <p>اضغط على الزر أدناه لتحديد موقعك بدقة وإرساله لنا عبر خرائط جوجل:</p>
            <button class="btn-loc" onclick="getLocation()">تحديد موقعي وإرساله لطلب الخدمة</button>
            <p id="status"></p>
        </div>

        <script>
            function getLocation() {
                const status = document.getElementById('status');
                if (!navigator.geolocation) {
                    status.innerText = 'متصفحك لا يدعم تحديد الموقع.';
                    return;
                }
                status.innerText = 'جاري تحديد موقعك بدقة...';
                navigator.geolocation.getCurrentPosition(success, error, { enableHighAccuracy: true });
            }

            function success(position) {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                
                fetch('/send-location', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ lat: lat, lon: lon })
                })
                .then(res => res.json())
                .then(data => {
                    status.innerText = '✅ تم إرسال موقعك بنجاح! سنتواصل معك فوراً.';
                })
                .catch(() => {
                    status.innerText = 'حدث خطأ أثناء الإرسال.';
                });
            }

            function error() {
                status.innerText = 'يرجى السماح للمتصفح بالوصول للموقع الجغرافي.';
            }
        </script>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
