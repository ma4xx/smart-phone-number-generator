/**
 * 国家手机号码模式配置
 * 分离配置数据，提高可维护性
 */

class CountryPatterns {
    constructor() {
        this.patterns = {
            // 美国手机号码模式
            'US': {
                countryCallingCode: '1',
                nationalPrefix: '',
                mobilePatterns: [
                    { prefix: '201', length: 10, carrier: 'Various' },
                    { prefix: '212', length: 10, carrier: 'Various' },
                    { prefix: '312', length: 10, carrier: 'Various' },
                    { prefix: '415', length: 10, carrier: 'Various' },
                    { prefix: '469', length: 10, carrier: 'Various' },
                    { prefix: '713', length: 10, carrier: 'Various' },
                    { prefix: '917', length: 10, carrier: 'Various' }
                ],
                validationRules: {
                    minLength: 10,
                    maxLength: 10,
                    format: /^[2-9]\d{2}[2-9]\d{2}\d{4}$/
                }
            },

            // 中国手机号码模式
            'CN': {
                countryCallingCode: '86',
                nationalPrefix: '0',
                mobilePatterns: [
                    { prefix: '138', length: 11, carrier: 'China Mobile' },
                    { prefix: '139', length: 11, carrier: 'China Mobile' },
                    { prefix: '150', length: 11, carrier: 'China Mobile' },
                    { prefix: '151', length: 11, carrier: 'China Mobile' },
                    { prefix: '152', length: 11, carrier: 'China Mobile' },
                    { prefix: '157', length: 11, carrier: 'China Mobile' },
                    { prefix: '158', length: 11, carrier: 'China Mobile' },
                    { prefix: '159', length: 11, carrier: 'China Mobile' },
                    { prefix: '182', length: 11, carrier: 'China Mobile' },
                    { prefix: '183', length: 11, carrier: 'China Mobile' },
                    { prefix: '184', length: 11, carrier: 'China Mobile' },
                    { prefix: '187', length: 11, carrier: 'China Mobile' },
                    { prefix: '188', length: 11, carrier: 'China Mobile' },
                    { prefix: '178', length: 11, carrier: 'China Mobile' },
                    { prefix: '130', length: 11, carrier: 'China Unicom' },
                    { prefix: '131', length: 11, carrier: 'China Unicom' },
                    { prefix: '132', length: 11, carrier: 'China Unicom' },
                    { prefix: '155', length: 11, carrier: 'China Unicom' },
                    { prefix: '156', length: 11, carrier: 'China Unicom' },
                    { prefix: '185', length: 11, carrier: 'China Unicom' },
                    { prefix: '186', length: 11, carrier: 'China Unicom' },
                    { prefix: '176', length: 11, carrier: 'China Unicom' },
                    { prefix: '133', length: 11, carrier: 'China Telecom' },
                    { prefix: '153', length: 11, carrier: 'China Telecom' },
                    { prefix: '180', length: 11, carrier: 'China Telecom' },
                    { prefix: '181', length: 11, carrier: 'China Telecom' },
                    { prefix: '189', length: 11, carrier: 'China Telecom' },
                    { prefix: '177', length: 11, carrier: 'China Telecom' }
                ],
                validationRules: {
                    minLength: 11,
                    maxLength: 11,
                    format: /^1[3-9]\d{9}$/
                }
            },

            // 英国手机号码模式
            'GB': {
                countryCallingCode: '44',
                nationalPrefix: '0',
                mobilePatterns: [
                    { prefix: '7400', length: 11, carrier: 'Various' },
                    { prefix: '7500', length: 11, carrier: 'Various' },
                    { prefix: '7600', length: 11, carrier: 'Various' },
                    { prefix: '7700', length: 11, carrier: 'Various' },
                    { prefix: '7800', length: 11, carrier: 'Various' },
                    { prefix: '7900', length: 11, carrier: 'Various' }
                ],
                validationRules: {
                    minLength: 11,
                    maxLength: 11,
                    format: /^7[4-9]\d{8}$/
                }
            },

            // 德国手机号码模式
            'DE': {
                countryCallingCode: '49',
                nationalPrefix: '0',
                mobilePatterns: [
                    { prefix: '151', length: 11, carrier: 'T-Mobile' },
                    { prefix: '152', length: 11, carrier: 'Vodafone' },
                    { prefix: '160', length: 11, carrier: 'T-Mobile' },
                    { prefix: '170', length: 11, carrier: 'T-Mobile' },
                    { prefix: '171', length: 11, carrier: 'Vodafone' },
                    { prefix: '172', length: 11, carrier: 'Vodafone' },
                    { prefix: '173', length: 11, carrier: 'Vodafone' },
                    { prefix: '174', length: 11, carrier: 'Vodafone' },
                    { prefix: '175', length: 11, carrier: 'T-Mobile' }
                ],
                validationRules: {
                    minLength: 11,
                    maxLength: 12,
                    format: /^1[5-7]\d{8,9}$/
                }
            },

            // 法国手机号码模式
            'FR': {
                countryCallingCode: '33',
                nationalPrefix: '0',
                mobilePatterns: [
                    { prefix: '6', length: 9, carrier: 'Various' },
                    { prefix: '7', length: 9, carrier: 'Various' }
                ],
                validationRules: {
                    minLength: 9,
                    maxLength: 9,
                    format: /^[67]\d{8}$/
                }
            },

            // 日本手机号码模式
            'JP': {
                countryCallingCode: '81',
                nationalPrefix: '0',
                mobilePatterns: [
                    { prefix: '70', length: 10, carrier: 'Various' },
                    { prefix: '80', length: 10, carrier: 'Various' },
                    { prefix: '90', length: 10, carrier: 'Various' }
                ],
                validationRules: {
                    minLength: 10,
                    maxLength: 10,
                    format: /^[789]0\d{8}$/
                }
            },

            // 韩国手机号码模式
            'KR': {
                countryCallingCode: '82',
                nationalPrefix: '0',
                mobilePatterns: [
                    { prefix: '10', length: 10, carrier: 'Various' },
                    { prefix: '11', length: 10, carrier: 'Various' }
                ],
                validationRules: {
                    minLength: 10,
                    maxLength: 11,
                    format: /^1[01]\d{8,9}$/
                }
            },

            // 澳大利亚手机号码模式
            'AU': {
                countryCallingCode: '61',
                nationalPrefix: '0',
                mobilePatterns: [
                    { prefix: '4', length: 9, carrier: 'Various' }
                ],
                validationRules: {
                    minLength: 9,
                    maxLength: 9,
                    format: /^4\d{8}$/
                }
            }
        };

        // 缓存常用模式
        this.cache = new Map();
        this.popularCountries = ['US', 'CN', 'GB', 'DE', 'FR'];
        this.preloadPopularPatterns();
    }

    /**
     * 预加载热门国家模式到缓存
     */
    preloadPopularPatterns() {
        this.popularCountries.forEach(country => {
            if (this.patterns[country]) {
                this.cache.set(country, this.patterns[country]);
            }
        });
    }

    /**
     * 获取国家模式（带缓存）
     */
    getCountryPattern(countryCode) {
        // 先检查缓存
        if (this.cache.has(countryCode)) {
            return this.cache.get(countryCode);
        }

        // 从配置中获取
        const pattern = this.patterns[countryCode];
        if (pattern) {
            // 添加到缓存
            this.cache.set(countryCode, pattern);
            return pattern;
        }

        return null;
    }

    /**
     * 获取所有支持的国家
     */
    getSupportedCountries() {
        return Object.keys(this.patterns).map(code => ({
            code,
            name: this.getCountryName(code),
            callingCode: `+${this.patterns[code].countryCallingCode}`
        }));
    }

    /**
     * 获取国家名称
     */
    getCountryName(countryCode) {
        const names = {
            'US': 'United States',
            'CN': 'China',
            'GB': 'United Kingdom',
            'DE': 'Germany',
            'FR': 'France',
            'JP': 'Japan',
            'KR': 'South Korea',
            'AU': 'Australia'
        };
        return names[countryCode] || countryCode;
    }

    /**
     * 验证国家代码是否支持
     */
    isCountrySupported(countryCode) {
        return countryCode in this.patterns;
    }

    /**
     * 获取随机模式（性能优化）
     */
    getRandomPattern(countryCode) {
        const pattern = this.getCountryPattern(countryCode);
        if (!pattern || !pattern.mobilePatterns.length) {
            return null;
        }

        const patterns = pattern.mobilePatterns;
        return patterns[Math.floor(Math.random() * patterns.length)];
    }

    /**
     * 清理缓存
     */
    clearCache() {
        this.cache.clear();
        this.preloadPopularPatterns();
    }

    /**
     * 获取缓存统计
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}

// 导出单例实例
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CountryPatterns;
} else {
    window.CountryPatterns = CountryPatterns;
}