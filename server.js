const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const ID_INSTANCE = '710722721820';
const API_TOKEN = '8557073dd9454513a8733a8019cce9daabae3d6892a143eea2';
const MY_PHONE_NUMBER = '25377633359';

app.use(express.json());

app.get('/', async (req, res) => {
  try {
    const url = `https://api.green-api.com/waInstance${ID_INSTANCE}/sendMessage/${API_TOKEN}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatId: `${MY_PHONE_NUMBER}@c.us`,
        message: 'مرحباً! تم زيارة موقعك وتوثيق الاتصال بنجاح.'
      })
    });
    const data = await response.json();
    console.log('API Response:', data);
  } catch (err) {
    console.error('Error sending message:', err);
  }

  res.send('<h1>الموقع يعمل وتم إرسال تنبيه الواتساب!</h1>');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
