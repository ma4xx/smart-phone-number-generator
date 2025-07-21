/**
 * 国家手机号码配置数据
 * 包含各国家的手机号码格式、前缀和生成规则
 */

class CountryData {
    static instance = null;
    
    constructor() {
        this.data = {
            'US': {
                name: 'United States',
                code: '+1',
                format: 'XXX-XXX-XXXX',
                mobilePrefixes: ['2', '3', '4', '5', '6', '7', '8', '9'],
                numberLength: 10,
                patterns: ['2015551234', '3125551234', '4155551234', '7135551234', '9175551234'],
                description: 'US mobile numbers are 10 digits long with area codes starting from 2-9'
            },
            'CN': {
                name: 'China',
                code: '+86',
                format: 'XXX XXXX XXXX',
                mobilePrefixes: ['13', '14', '15', '16', '17', '18', '19'],
                numberLength: 11,
                patterns: ['13812345678', '15912345678', '18612345678', '17712345678'],
                description: 'Chinese mobile numbers are 11 digits long starting with 1 followed by operator codes'
            },
            'GB': {
                name: 'United Kingdom',
                code: '+44',
                format: 'XXXX XXX XXXX',
                mobilePrefixes: ['7'],
                numberLength: 10,
                patterns: ['07700123456', '07800123456', '07900123456'],
                description: 'UK mobile numbers are 10 digits long starting with 07'
            },
            'DE': {
                name: 'Germany',
                code: '+49',
                format: 'XXX XXXXXXX',
                mobilePrefixes: ['15', '16', '17'],
                numberLength: 11,
                patterns: ['015112345678', '016012345678', '017012345678'],
                description: 'German mobile numbers start with 15, 16, or 17'
            },
            'FR': {
                name: 'France',
                code: '+33',
                format: 'X XX XX XX XX',
                mobilePrefixes: ['6', '7'],
                numberLength: 9,
                patterns: ['0612345678', '0712345678'],
                description: 'French mobile numbers are 9 digits long starting with 06 or 07'
            },
            'JP': {
                name: 'Japan',
                code: '+81',
                format: 'XX-XXXX-XXXX',
                mobilePrefixes: ['70', '80', '90'],
                numberLength: 10,
                patterns: ['08012345678', '09012345678', '07012345678'],
                description: 'Japanese mobile numbers start with 070, 080, or 090'
            },
            'KR': {
                name: 'South Korea',
                code: '+82',
                format: 'XX-XXXX-XXXX',
                mobilePrefixes: ['10', '11'],
                numberLength: 10,
                patterns: ['01012345678', '01112345678'],
                description: 'Korean mobile numbers start with 010 or 011'
            },
            'AU': {
                name: 'Australia',
                code: '+61',
                format: 'XXX XXX XXX',
                mobilePrefixes: ['4'],
                numberLength: 9,
                patterns: ['0412345678', '0512345678'],
                description: 'Australian mobile numbers are 9 digits long starting with 04'
            },
            'IN': {
                name: 'India',
                code: '+91',
                format: 'XXXXX XXXXX',
                mobilePrefixes: ['6', '7', '8', '9'],
                numberLength: 10,
                patterns: ['9876543210', '8765432109', '7654321098', '6543210987'],
                description: 'Indian mobile numbers are 10 digits long starting with 6, 7, 8, or 9'
            },
            'NL': {
                name: 'Netherlands',
                code: '+31',
                format: 'X XXXX XXXX',
                mobilePrefixes: ['6'],
                numberLength: 9,
                patterns: ['0612345678', '0687654321'],
                description: 'Dutch mobile numbers are 9 digits long starting with 06'
            },
            'UZ': {
                name: 'Uzbekistan',
                code: '+998',
                format: 'XX XXX XX XX',
                mobilePrefixes: ['9'],
                numberLength: 9,
                patterns: ['901234567', '971234567'],
                description: 'Uzbek mobile numbers are 9 digits long starting with 9'
            }
        };
    }

    /**
     * 获取所有国家数据
     */
    getAllCountries() {
        return this.data;
    }

    /**
     * 获取指定国家的数据
     */
    getCountry(countryCode) {
        return this.data[countryCode] || null;
    }

    /**
     * 获取国家列表
     */
    getCountryList() {
        return Object.keys(this.data).map(code => ({
            code,
            name: this.data[code].name,
            flag: this.getCountryFlag(code)
        }));
    }

    /**
     * 根据国家名称查找国家代码
     */
    findCountryByName(countryName) {
        const normalizedName = countryName.toLowerCase();
        
        for (const [code, country] of Object.entries(this.data)) {
            if (country.name.toLowerCase().includes(normalizedName) ||
                normalizedName.includes(country.name.toLowerCase())) {
                return code;
            }
        }
        
        // 检查常见别名
        const aliases = {
            'america': 'US',
            'usa': 'US',
            'united states': 'US',
            'china': 'CN',
            'chinese': 'CN',
            'uk': 'GB',
            'britain': 'GB',
            'england': 'GB',
            'germany': 'DE',
            'deutsch': 'DE',
            'france': 'FR',
            'french': 'FR',
            'japan': 'JP',
            'japanese': 'JP',
            'korea': 'KR',
            'korean': 'KR',
            'australia': 'AU',
            'australian': 'AU',
            'india': 'IN',
            'indian': 'IN',
            'netherlands': 'NL',
            'dutch': 'NL',
            'uzbekistan': 'UZ',
            'uzbek': 'UZ'
        };
        
        return aliases[normalizedName] || null;
    }

    /**
     * 获取国家旗帜emoji
     */
    getCountryFlag(countryCode) {
        const flags = {
            'US': '🇺🇸',
            'CN': '🇨🇳',
            'GB': '🇬🇧',
            'DE': '🇩🇪',
            'FR': '🇫🇷',
            'JP': '🇯🇵',
            'KR': '🇰🇷',
            'AU': '🇦🇺',
            'IN': '🇮🇳',
            'NL': '🇳🇱',
            'UZ': '🇺🇿'
        };
        
        return flags[countryCode] || '🌍';
    }

    /**
     * 验证国家代码是否支持
     */
    isSupported(countryCode) {
        return countryCode in this.data;
    }

    /**
     * 获取国家的手机号码格式说明
     */
    getFormatDescription(countryCode) {
        const country = this.getCountry(countryCode);
        return country ? country.description : null;
    }

    /**
     * 获取单例实例
     */
    static getInstance() {
        if (!CountryData.instance) {
            CountryData.instance = new CountryData();
        }
        return CountryData.instance;
    }

    /**
     * 静态方法：获取所有国家数据
     */
    static getAllCountries() {
        return CountryData.getInstance().getAllCountries();
    }

    /**
     * 静态方法：获取指定国家的数据
     */
    static getCountry(countryCode) {
        return CountryData.getInstance().getCountry(countryCode);
    }

    /**
     * 静态方法：根据国家名称查找国家代码
     */
    static findCountryByName(countryName) {
        return CountryData.getInstance().findCountryByName(countryName);
    }
}

// 导出类和实例
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CountryData;
} else {
    window.CountryData = CountryData;
}