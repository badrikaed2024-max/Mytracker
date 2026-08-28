const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const ID_INSTANCE = '710722721820';
const API_TOKEN = '8557073dd9454513a8733a8019cce9daabae3d6892a143eea2';
const MY_PHONE_NUMBER = '25377633359';

app.use(express.json());

// استقبال إحداثيات الموقع عند ضغط الزائر على زر الإرسال
app.post('/send-location', async (req, e_res) => {
  try {
    const { lat, lon } = req.body;
    const mapsLink = `https://www.google.com/maps?q=${lat},${lon}`;
    
    const message = `📍 طلب موقع جديد لتوصيل الطلب!\n\n` +
                    `إحداثيات العميل:\n` +
                    `خط العرض: ${lat}\n` +
                    `خط الطول: ${lon}\n\n` +
                    `🗺️ افتح الموقع مباشرة على خريطة جوجل:\n${mapsLink}`;

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

// الصفحة الرئيسية التي تظهر للزائر مع زر لتحديد الموقع
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>تحديد موقع التوصيل</title>
        <style>
            body { font-family: Tahoma, sans-serif; text-align: center; padding: 50px; background: #f4f4f9; }
            .box { background: white; padding: 30px; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0,0,0,0.1); display: inline-block; }
            button { background: #25D366; color: white; border: none; padding: 15px 25px; font-size: 18px; border-radius: 5px; cursor: pointer; margin-top: 20px; }
            button:hover { background: #1ebd59; }
            #status { margin-top: 15px; color: #555; }
        </style>
    </head>
    <body>
        <div class="box">
            <h2>مرحباً بك لطلب التوصيل 📦</h2>
            <p>انقر على الزر أدناه لتحديد موقعك الحالي بدقة عبر الجي بي إس لكي نتمكن من توصيل الطلب إليك:</p>
            <button onclick="getLocation()">تحديد موقعي وإرساله للتوصيل</button>
            <p id="status"></p>
        </div>

        <script>
            function getLocation() {
                const status = document.getElementById('status');
                if (!navigator.geolocation) {
                    status.innerText = 'متصفحك لا يدعم خاصية تحديد الموقع.';
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
                    document.getElementById('status.innerText' || 'status').innerHTML = '✅ تم إرسال موقعك بنجاح! سيتم التواصل معك لتوصيل الطلب.';
                })
                .catch(() => {
                    document.getElementById('status').innerText = 'حدث خطأ أثناء إرسال الموقع.';
                });
            }

            function error() {
                document.getElementById('status').innerText = 'تعذر تحديد الموقع. يرجى السماح للمتصفح بالوصول للموقع الجغرافي.';
            }
        </script>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
