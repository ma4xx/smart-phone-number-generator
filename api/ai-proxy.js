/**
 * Vercel Functions API端点 - AI驱动的手机号码生成助手
 * 处理用户自然语言输入，提取国家和数量信息
 */

export default async function handler(req, res) {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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
        const { prompt } = req.body;

        // 验证请求参数
        if (!prompt || typeof prompt !== 'string') {
            return res.status(400).json({ error: 'Invalid prompt format' });
        }

        // 从环境变量获取API密钥
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            console.error('OpenRouter API key not configured');
            return res.status(500).json({ error: 'AI service not configured' });
        }

        // Prompt工程 - 指导AI模型理解用户请求并提取信息
        const messages = [
            {
                role: "system",
                content: `You are a phone number generation assistant. Extract the "country" and "quantity" from the user's request.
If the user does not specify a quantity, default to 50.
If the user does not specify a country, return "unknown".
Return the result in JSON format only, without any extra text or conversation.
Examples:
User request: Please generate 10 US phone numbers.
Output: {"country": "United States", "quantity": 10}

User request: Get me some German phone numbers.
Output: {"country": "Germany", "quantity": 50}

User request: Generate 20.
Output: {"country": "unknown", "quantity": 20}

User request: 我需要5个中国手机号
Output: {"country": "China", "quantity": 5}

User request: 生成100个美国号码
Output: {"country": "United States", "quantity": 100}`
            },
            {
                role: "user",
                content: prompt // 用户实际输入
            }
        ];

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
                model: 'mistralai/mistral-small-3.2-24b-instruct', // 使用Mistral AI模型
                messages: messages,
                max_tokens: 200, // 限制token数量，因为只需要简单的JSON响应
                temperature: 0.1, // 低温度确保一致性
                stream: false
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenRouter API error:', response.status, errorText);
            return res.status(500).json({ 
                error: 'AI service error',
                success: false
            });
        }

        const data = await response.json();
        
        // 提取AI生成的文本内容
        const aiResponse = data.choices?.[0]?.message?.content;
        if (!aiResponse) {
            return res.status(500).json({ 
                error: 'Invalid AI response',
                success: false
            });
        }

        try {
            // 尝试解析AI响应为JSON
            const parsedResult = JSON.parse(aiResponse.trim());
            
            // 验证解析结果的格式
            if (typeof parsedResult.country !== 'string' || typeof parsedResult.quantity !== 'number') {
                throw new Error('Invalid response format');
            }

            // 返回成功解析的结果
            res.status(200).json({
                success: true,
                country: parsedResult.country,
                quantity: parsedResult.quantity,
                originalPrompt: prompt
            });

        } catch (parseError) {
            console.error('Failed to parse AI response:', parseError, 'Response:', aiResponse);
            
            // 解析失败，返回错误信息
            res.status(200).json({
                success: false,
                error: 'Could not recognize country or quantity, please try selecting manually.',
                originalPrompt: prompt,
                aiResponse: aiResponse
            });
        }

    } catch (error) {
        console.error('API handler error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            success: false,
            message: error.message
        });
    }
}

// 配置函数运行时
export const config = {
    runtime: 'nodejs',
    maxDuration: 10 // 较短的超时时间，因为这是简单的文本处理
};