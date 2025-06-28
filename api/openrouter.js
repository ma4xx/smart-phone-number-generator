/**
 * Vercel Functions API端点 - OpenRouter AI集成
 * 处理AI驱动的手机号码生成请求
 */

export default async function handler(req, res) {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // 处理预检请求
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // 只允许POST请求
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { model, messages, max_tokens, temperature } = req.body;

        // 验证请求参数
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Invalid messages format' });
        }

        // 从环境变量获取API密钥
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            console.error('OpenRouter API key not configured');
            return res.status(500).json({ error: 'AI service not configured' });
        }

        // 调用OpenRouter API
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': process.env.VERCEL_URL || 'https://phonegenerator.vercel.app',
                'X-Title': 'Smart Phone Number Generator'
            },
            body: JSON.stringify({
                model: model || 'anthropic/claude-3-haiku',
                messages: messages,
                max_tokens: max_tokens || 1000,
                temperature: temperature || 0.7,
                stream: false
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenRouter API error:', response.status, errorText);
            return res.status(response.status).json({ 
                error: 'AI service error',
                details: errorText
            });
        }

        const data = await response.json();
        
        // 返回AI响应
        res.status(200).json(data);

    } catch (error) {
        console.error('API handler error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message
        });
    }
}

// 配置函数运行时
export const config = {
    runtime: 'nodejs',
    maxDuration: 30
};