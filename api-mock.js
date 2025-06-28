/**
 * 本地开发环境的AI API模拟服务
 * 用于在没有Vercel Functions的情况下测试AI功能
 */

class MockAIService {
    constructor() {
        this.countryMappings = {
            // 中文映射
            '中国': 'China',
            '美国': 'United States', 
            '英国': 'United Kingdom',
            '德国': 'Germany',
            '法国': 'France',
            '日本': 'Japan',
            '韩国': 'South Korea',
            '加拿大': 'Canada',
            '澳大利亚': 'Australia',
            
            // 英文映射
            'china': 'China',
            'chinese': 'China',
            'us': 'United States',
            'usa': 'United States',
            'america': 'United States',
            'united states': 'United States',
            'uk': 'United Kingdom',
            'britain': 'United Kingdom',
            'england': 'United Kingdom',
            'united kingdom': 'United Kingdom',
            'germany': 'Germany',
            'german': 'Germany',
            'deutschland': 'Germany',
            'france': 'France',
            'french': 'France',
            'japan': 'Japan',
            'japanese': 'Japan',
            'korea': 'South Korea',
            'korean': 'South Korea',
            'canada': 'Canada',
            'canadian': 'Canada',
            'australia': 'Australia',
            'australian': 'Australia'
        };
    }

    /**
     * 模拟AI解析用户输入
     */
    parseUserInput(prompt) {
        const normalizedPrompt = prompt.toLowerCase();
        
        // 提取数量
        let quantity = 50; // 默认值
        const numberMatches = prompt.match(/\d+/);
        if (numberMatches) {
            quantity = parseInt(numberMatches[0]);
            quantity = Math.min(quantity, 50); // 限制最大50
        }
        
        // 提取国家
        let country = 'unknown';
        for (const [key, value] of Object.entries(this.countryMappings)) {
            if (normalizedPrompt.includes(key)) {
                country = value;
                break;
            }
        }
        
        // 模拟API响应格式
        return {
            success: true,
            country: country,
            quantity: quantity,
            originalPrompt: prompt
        };
    }
}

// 创建全局实例
window.mockAIService = new MockAIService();

// 拦截fetch请求到/api/ai-proxy
const originalFetch = window.fetch;
window.fetch = function(url, options) {
    // 检查是否是AI代理请求
    if (url === '/api/ai-proxy' && options && options.method === 'POST') {
        console.log('🤖 使用本地AI模拟服务');
        
        return new Promise((resolve) => {
            try {
                const body = JSON.parse(options.body);
                const result = window.mockAIService.parseUserInput(body.prompt);
                
                // 模拟网络延迟
                setTimeout(() => {
                    resolve({
                        ok: true,
                        status: 200,
                        json: () => Promise.resolve(result)
                    });
                }, 500); // 500ms延迟模拟真实API
                
            } catch (error) {
                console.error('Mock AI service error:', error);
                resolve({
                    ok: false,
                    status: 500,
                    json: () => Promise.resolve({
                        success: false,
                        error: 'Mock AI service error'
                    })
                });
            }
        });
    }
    
    // 其他请求使用原始fetch
    return originalFetch.apply(this, arguments);
};

console.log('🚀 本地AI模拟服务已启动');
console.log('📝 支持的测试输入示例：');
console.log('   - "生成10个中国手机号"');
console.log('   - "Generate 5 US phone numbers"');
console.log('   - "我需要20个德国号码"');
console.log('   - "Create some UK numbers"');