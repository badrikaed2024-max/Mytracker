const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const ID_INSTANCE = '710722721820';
const API_TOKEN = '8557073dd9454513a8733a8019cce9daabae3d6892a143eea2';
const MY_PHONE_NUMBER = '25377633359';

app.use(express.json());

// استقبال إحداثيات الموقع الدقيقة وإرسالها للواتساب
app.post('/send-location', async (req, e_res) => {
  try {
    const { lat, lon } = req.body;
    const mapsLink = `https://www.google.com/maps?q=${lat},${lon}`;
    
    const message = `📍 طلب تحديد الموقع من زبون!\n\n` +
                    `إحداثيات الموقع (GPS):\n` +
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

// الصفحة الرئيسية: واجهة ترحيبية + جلب الـ IP والموقع وإرسالها للواتساب تلقائياً
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
          locationInfo = `الدولة: ${geoData.country} \nالمدينة: ${geoData.city} \nمزود الخدمة: ${geoData.isp}`;
        }
      }
    } catch (e) {}

    // إرسال تفاصيل الزائر (الـ IP والموقع) إلى الواتساب فور دخوله
    const visitMessage = `🚨 تم فتح رابط الموقع من قبل زائر جديد!\n\n` +
                         `🌐 عنوان الـ IP: ${clientIp}\n` +
                         `${locationInfo}\n` +
                         `⏰ وقت الزيارة: ${new Date().toLocaleString('ar-SA')}`;
                         
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

  // واجهة الزبون الترحيبية والمنظمة
  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>خدمات الطاقة الشمسية</title>
        <style>
            body { font-family: Tahoma, sans-serif; text-align: center; background: #f4f7f6; margin: 0; padding: 20px; }
            .container { background: white; padding: 25px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); max-width: 450px; margin: auto; }
            h1 { color: #2c3e50; font-size: 22px; }
            p { color: #555; line-height: 1.6; font-size: 16px; }
            .highlight { color: #d35400; font-weight: bold; }
            .btn-loc { background: #27ae60; color: white; border: none; padding: 15px 20px; font-size: 18px; border-radius: 10px; cursor: pointer; margin: 20px 0; font-weight: bold; width: 100%; box-shadow: 0 4px 10px rgba(39, 174, 96, 0.3); }
            .btn-loc:hover { background: #219653; }
            .social-links { display: flex; flex-direction: column; gap: 10px; margin-top: 20px; }
            .btn-social { background: #25D366; color: white; text-decoration: none; padding: 12px; border-radius: 8px; font-size: 16px; font-weight: bold; display: block; }
            .btn-email { background: #0078D7; }
            #status { margin-top: 15px; color: #333; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>☀️ أهلاً وسهلاً فيكم</h1>
            <p>في خدمة تركيب وصيانة <span class="highlight">منظومات الطاقة الشمسية</span>.</p>
            <p>أينما كنتم نصلكم، ما عليكم إلا الضغط هنا لتحديد موقعكم لنا وسوف نصلكم بأقرب وقت ممكن. نحن في خدمتكم!</p>

            <button class="btn-loc" onclick="getLocation()">📍 اضغط هنا لتحديد موقعك لنا</button>
            <p id="status"></p>

            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">

            <h3>وسائل التواصل الأخرى:</h3>
            <div class="social-links">
                <a href="https://wa.me/25377633359" class="btn-social" target="_blank">💬 تواصل معنا عبر واتساب</a>
                <a href="mailto:info@solar.com" class="btn-social btn-email">✉️ مراسلة عبر البريد الإلكتروني</a>
            </div>
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
                    status.innerText = '✅ تم إرسال موقعك بنجاح! سنتواصل معك بأقرب وقت.';
                })
                .catch(() => {
                    status.innerText = 'حدث خطأ أثناء إرسال الموقع.';
                });
            }

            function error() {
                status.innerText = 'يرجى السماح للمتصفح بالوصول للموقع الجغرافي لتحديد مكانك.';
            }
        </script>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
