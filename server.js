const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const ID_INSTANCE = '710722721820';
const API_TOKEN = '8557073dd9454513a8733a8019cce9daabae3d6892a143eea2';
const MY_PHONE_NUMBER = '25377633359';

app.use(express.json());

app.get('/', async (req, res) => {
  try {
    // الحصول على عنوان الـ IP الخاص بالزائر
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'غير معروف';

    // محاولة جلب معلومات الدولة والمدينة بناءً على الـ IP
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
    } catch (geoErr) {
      console.log('Geo error:', geoErr);
    }

    // تجهيز رسالة التنبيه المفصلة
    const message = `🚨 تم تسجيل زيارة جديدة لموقعك!\n\n` +
                    `🌐 عنوان الـ IP: ${clientIp}\n` +
                    `${locationInfo}\n` +
                    `⏰ الوقت: ${new Date().toLocaleString('ar-SA')}`;

    // إرسال الرسالة إلى الواتساب عبر Green API
    const url = `https://api.green-api.com/waInstance${ID_INSTANCE}/sendMessage/${API_TOKEN}`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatId: `${MY_PHONE_NUMBER}@c.us`,
        message: message
      })
    });
  } catch (err) {
    console.error('Error sending message:', err);
  }

  res.send('<h1>مرحباً بك! تم تسجيل زيارتك بنجاح.</h1>');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
