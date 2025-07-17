const fetch = require('node-fetch');

// 务必替换为你的真实 API 密钥！！！
const apiKey = 'sk-yedywtzzchzvhurpxnsiuktermlgdaxnkpjlkjythnpnrlnc
';
const apiUrl = 'https://api.siliconflow.cn/v1/images/generations';

const requestBody = {
    prompt: prompt,
    n: 1,
    size: '1024x1024',
    model: 'kwai-kolors/kolors' // 添加模型名称
};

fetch(apiUrl, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(requestBody)
})
.then(response => {
  if (!response.ok) {
    throw new Error(`HTTP错误: ${response.status}`);
  }
  return response.json();
})
.then(data => {
  console.log('✅ 图像生成成功! URL:', data.images[0].url);
})
.catch(error => {
  console.error('❌ API调用失败:', error.message);
});