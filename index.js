const express = require('express');
const bodyParser = require('body-parser');
const { GoogleAuth } = require('google-auth-library');
const axios = require('axios');

const app = express();
const port = 3001;

// Middleware
app.use(bodyParser.json());

// API Chat Endpoint
app.post('/api/chat', async (req, res) => {
  const userMessage = req.body.message;

  try {
    // Tạo access token tự động
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    const accessToken = await auth.getAccessToken();

    // Tạo ID phiên (session ID)
    const sessionId = `user-${Math.random().toString(36).substr(2, 9)}`;

    // Gửi yêu cầu tới Dialogflow
    const response = await axios.post(
      `https://dialogflow.googleapis.com/v2/projects/tdh-i9tp/agent/sessions/${sessionId}:detectIntent`,
      {
        queryInput: {
          text: {
            text: userMessage,
            languageCode: 'vi',
          },
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    const chatbotResponse = response.data.queryResult.fulfillmentText;

    // Trả kết quả về frontend
    res.json({ response: chatbotResponse });
  } catch (error) {
    console.error('Error with Dialogflow:', error);
    res.status(500).json({ error: 'Có lỗi xảy ra khi kết nối với chatbot.' });
  }
});

// Khởi chạy server
app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});
