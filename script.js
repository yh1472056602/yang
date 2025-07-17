// Custom cursor elements
const customCursor = document.getElementById('customCursor');
const customCursorDot = document.getElementById('customCursorDot');
const body = document.body;

// Elements that will trigger different cursor states
const userInput = document.getElementById('userInput');
const generateBtn = document.getElementById('generateBtn');
const imageDisplay = document.getElementById('imageDisplay');
const chatHistory = document.getElementById('chatHistory');

// Track cursor position
let mouseX = 0;
let mouseY = 0;
let cursorX = 0;
let cursorY = 0;
let isGenerating = false;

// SiliconFlow API configuration
let SILICONFLOW_API_KEY = 'sk-yedywtzzchzvhurpxnsiuktermlgdaxnkpjlkjythnpnrlnc'; // 更新为提供的API密钥
const SILICONFLOW_API_URL = 'https://api.siliconflow.cn/v1/images/generations'; // 正确的API端点
const USE_MOCK_API = false; // 禁用本地模拟模式，使用真实API

// Update cursor position with smooth animation
function updateCursorPosition() {
    const deltaX = mouseX - cursorX;
    const deltaY = mouseY - cursorY;
    
    cursorX += deltaX * 0.2;
    cursorY += deltaY * 0.2;
    
    customCursor.style.left = `${cursorX}px`;
    customCursor.style.top = `${cursorY}px`;
    
    customCursorDot.style.left = `${mouseX}px`;
    customCursorDot.style.top = `${mouseY}px`;
    
    requestAnimationFrame(updateCursorPosition);
}

// Initialize cursor animation
updateCursorPosition();

// Track mouse movement
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// Handle different cursor states
userInput.addEventListener('mouseenter', () => {
    body.classList.remove('cursor-default', 'cursor-button', 'cursor-loading');
});

userInput.addEventListener('focus', () => {
    body.classList.add('cursor-input');
    body.classList.remove('cursor-default', 'cursor-button', 'cursor-loading');
});

userInput.addEventListener('blur', () => {
    body.classList.remove('cursor-input');
    body.classList.add('cursor-default');
});

generateBtn.addEventListener('mouseenter', () => {
    body.classList.add('cursor-button');
    body.classList.remove('cursor-default', 'cursor-input', 'cursor-loading');
});

generateBtn.addEventListener('mouseleave', () => {
    if (!isGenerating) {
        body.classList.remove('cursor-button');
        body.classList.add('cursor-default');
    }
});

// Handle image generation with SiliconFlow API
generateBtn.addEventListener('click', () => {
    const userPrompt = userInput.value.trim();
    
    if (!userPrompt) {
        userInput.focus();
        return;
    }
    
    // Show loading cursor
    isGenerating = true;
    body.classList.add('cursor-loading');
    body.classList.remove('cursor-default', 'cursor-input', 'cursor-button');
    
    // Add user message to chat
    addMessage('user', userPrompt);
    
    // Add AI processing message
        addMessage('ai', '正在基于以下描述创建图片: "' + userPrompt + '"');
        
    // Call SiliconFlow API to generate image
    generateImageWithAPI(userPrompt);
});

// Add message to chat history
function addMessage(sender, text) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    
    const senderSpan = document.createElement('span');
    senderSpan.classList.add('sender');
    senderSpan.textContent = sender === 'user' ? '你: ' : 'AI: ';
    
    const contentSpan = document.createElement('span');
    contentSpan.classList.add('content');
    contentSpan.textContent = text;
    
    messageDiv.appendChild(senderSpan);
    messageDiv.appendChild(contentSpan);
    
    chatHistory.appendChild(messageDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

// Generate image using SiliconFlow API
async function generateImageWithAPI(prompt) {
    try {
        console.log('正在调用API，提示词:', prompt);
        
        if (USE_MOCK_API) {
            console.log('使用本地模拟API响应');
            // 等待1.5秒模拟API调用延迟
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // 模拟API响应 - 生成随机图像URL或使用预设的示例图像
            const mockImageUrls = [
                'https://images.unsplash.com/photo-1677466923692-9fd32f0e5e6b?q=80&w=1024',
                'https://images.unsplash.com/photo-1680167037790-a59bb0eeaef3?q=80&w=1024',
                'https://images.unsplash.com/photo-1674255909399-9ccb748b0c48?q=80&w=1024',
                'https://images.unsplash.com/photo-1673938644402-e5753f071bcd?q=80&w=1024'
            ];
            
            // 随机选择一个图像URL
            const randomIndex = Math.floor(Math.random() * mockImageUrls.length);
            const mockImageUrl = mockImageUrls[randomIndex];
            
            // 显示模拟生成的图像
            displayGeneratedImage(mockImageUrl, prompt);
            addMessage('ai', '图片生成成功！（本地模拟模式）');
            return;
        }
        
        // 以下是实际API调用代码
        console.log('使用API端点:', SILICONFLOW_API_URL);
        console.log('API密钥前五位:', SILICONFLOW_API_KEY.substring(0, 5) + '...');
        
        const requestBody = {
            model: "Kwai-Kolors/Kolors",
            prompt: prompt,
            image_size: "1024x1024",
            batch_size: 1,
            num_inference_steps: 20,
            guidance_scale: 7.5
        };
        
        console.log('请求体:', JSON.stringify(requestBody));
        
        const response = await fetch(SILICONFLOW_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SILICONFLOW_API_KEY}`
            },
            body: JSON.stringify(requestBody)
        });

        console.log('API响应状态:', response.status, response.statusText);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API错误响应:', errorText);
            throw new Error(`API 请求失败: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('API响应数据:', data);
        
        // 处理SiliconFlow API的响应格式
        // 优先检查images数组，然后检查data数组
        let imageUrl = null;
        
        if (data.images && data.images.length > 0 && data.images[0].url) {
            imageUrl = data.images[0].url;
            console.log('从images数组获取URL:', imageUrl);
        } else if (data.data && data.data.length > 0 && data.data[0].url) {
            imageUrl = data.data[0].url;
            console.log('从data数组获取URL:', imageUrl);
        } else {
            console.error('无法从响应中找到图片URL:', data);
            throw new Error('API 返回格式不符合预期');
        }
        
        displayGeneratedImage(imageUrl, prompt);
        addMessage('ai', '图片生成成功！你觉得怎么样？');
    } catch (error) {
        console.error('生成图片时出错:', error);
        addMessage('ai', `生成图片时出错: ${error.message}`);
        
        // Display fallback image (gradient)
        displayFallbackImage(prompt);
    } finally {
        // Reset cursor state
        isGenerating = false;
        body.classList.remove('cursor-loading');
        body.classList.add('cursor-default');
    }
}

// Display the generated image from API
function displayGeneratedImage(imageUrl, prompt) {
    // Clear any previous images
    while (imageDisplay.firstChild) {
        imageDisplay.removeChild(imageDisplay.firstChild);
    }
    
    // Create image element
    const imageElement = document.createElement('img');
    imageElement.classList.add('generated-image');
    imageElement.src = imageUrl;
    imageElement.alt = prompt;
    
    // Add loading state
    imageElement.classList.add('loading');
    
    // Handle image load
    imageElement.onload = () => {
        imageElement.classList.remove('loading');
        
        // Add a text overlay with the prompt
        const promptOverlay = document.createElement('div');
        promptOverlay.classList.add('prompt-overlay');
        promptOverlay.textContent = `"${prompt}"`;
        
        const imageContainer = document.createElement('div');
        imageContainer.classList.add('image-container');
        imageContainer.appendChild(imageElement);
        imageContainer.appendChild(promptOverlay);
        
        imageDisplay.appendChild(imageContainer);
    };
    
    // Handle image error
    imageElement.onerror = () => {
        displayFallbackImage(prompt);
    };
    
    // Add image to display
    imageDisplay.appendChild(imageElement);
}

// Display a fallback image (gradient) when API fails
function displayFallbackImage(prompt) {
    // Clear any previous images
    while (imageDisplay.firstChild) {
        imageDisplay.removeChild(imageDisplay.firstChild);
    }
    
    // Create a simulated image with gradient background
    const imageElement = document.createElement('div');
    imageElement.classList.add('generated-image');
    
    // Generate a random gradient background as a placeholder
    const hue1 = Math.floor(Math.random() * 360);
    const hue2 = (hue1 + 180) % 360;
    
    imageElement.style.background = `linear-gradient(45deg, 
        hsl(${hue1}, 70%, 50%), 
        hsl(${hue2}, 70%, 50%))`;
    
    // Add a text overlay with the prompt
    const promptOverlay = document.createElement('div');
    promptOverlay.classList.add('prompt-overlay');
    promptOverlay.textContent = `"${prompt}"`;
    
    imageElement.appendChild(promptOverlay);
    imageDisplay.appendChild(imageElement);
}

// Add CSS styles for the chat and image elements
const style = document.createElement('style');
style.textContent = `
.message {
    margin-bottom: 12px;
    padding: 8px 12px;
    border-radius: 8px;
    max-width: 80%;
}

.message.user {
    background-color: rgba(52, 152, 219, 0.2);
    align-self: flex-end;
    margin-left: auto;
}

.message.ai {
    background-color: rgba(26, 188, 156, 0.2);
    align-self: flex-start;
}

.sender {
    font-weight: bold;
    margin-right: 5px;
}

.chat-history {
    display: flex;
    flex-direction: column;
}

.generated-image {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    object-fit: contain;
}

.image-container {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    overflow: hidden;
}

.generated-image.loading {
    opacity: 0.7;
    animation: pulse 1.5s infinite;
}

.prompt-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 10px;
    font-size: 14px;
    text-align: center;
}

.api-settings {
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: rgba(0, 0, 0, 0.7);
    border-radius: 50%;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    cursor: none;
    z-index: 10;
    font-size: 16px;
    transition: transform 0.2s;
}

.api-settings:hover {
    transform: rotate(45deg);
}
`;

document.head.appendChild(style);

// Add API settings button to the container
const settingsButton = document.createElement('div');
settingsButton.classList.add('api-settings');
settingsButton.innerHTML = '⚙️';
settingsButton.title = '设置 API 密钥';
document.querySelector('.container').appendChild(settingsButton);

// Handle API settings
settingsButton.addEventListener('click', () => {
    const currentKey = localStorage.getItem('siliconflow_api_key') || SILICONFLOW_API_KEY;
    const newKey = prompt('请输入你的 SiliconFlow API 密钥:', currentKey);
    
    if (newKey && newKey.trim() !== '') {
        localStorage.setItem('siliconflow_api_key', newKey.trim());
        SILICONFLOW_API_KEY = newKey.trim();
        alert('API 密钥已保存');
    }
});

// Load saved API key on page load
document.addEventListener('DOMContentLoaded', () => {
    const savedKey = localStorage.getItem('siliconflow_api_key');
    if (savedKey) {
        SILICONFLOW_API_KEY = savedKey;
    }
});

// Ensure cursor returns to default when leaving interactive elements
document.querySelectorAll('*').forEach(element => {
    if (element !== userInput && element !== generateBtn) {
        element.addEventListener('mouseenter', () => {
            if (!isGenerating && !userInput.matches(':focus')) {
                body.classList.remove('cursor-input', 'cursor-button', 'cursor-loading');
                body.classList.add('cursor-default');
            }
        });
    }
}); 