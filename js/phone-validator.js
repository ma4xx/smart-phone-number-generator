/**
 * 手机号码验证和格式化模块
 * 使用libphonenumber-js库提供准确的号码处理
 */

// 由于我们在浏览器环境中，需要通过CDN加载libphonenumber-js
// 这个文件提供了备用的验证逻辑

class PhoneValidator {
    constructor(options = {}) {
        // 配置选项
        this.options = {
            enableCache: true,
            enablePerformanceMonitoring: true,
            cacheOptions: {},
            performanceOptions: {},
            ...options
        };

        // 核心组件
        this.libphonenumber = null;
        this.isLibraryLoaded = false;
        
        // 初始化架构组件
        this.initializeComponents();
        
        // 加载库
        this.libraryLoadPromise = this.loadLibrary();
    }

    /**
     * 初始化架构组件
     */
    initializeComponents() {
        // 初始化缓存管理器
        if (this.options.enableCache && typeof CacheManager !== 'undefined') {
            this.cacheManager = new CacheManager(this.options.cacheOptions);
        }

        // 初始化性能监控器
        if (this.options.enablePerformanceMonitoring && typeof PerformanceMonitor !== 'undefined') {
            this.performanceMonitor = new PerformanceMonitor(this.options.performanceOptions);
        }

        // 初始化库加载器
        if (typeof LibraryLoader !== 'undefined') {
            this.libraryLoader = new LibraryLoader();
        }

        // 初始化国家模式配置
        if (typeof CountryPatterns !== 'undefined') {
            this.countryPatterns = new CountryPatterns();
        }
    }

    /**
     * 加载libphonenumber-js库
     */
    async loadLibrary() {
        const measureId = this.performanceMonitor?.startMeasure('library_load', {
            method: this.libraryLoader ? 'LibraryLoader' : 'fallback'
        });

        try {
            let success = false;
            
            // 使用LibraryLoader加载（如果可用）
            if (this.libraryLoader) {
                success = await this.libraryLoader.loadLibrary();
                if (success) {
                    this.libphonenumber = window.libphonenumber;
                    this.isLibraryLoaded = true;
                }
            } else {
                // 回退到原有加载逻辑
                success = await this.fallbackLoadLibrary();
            }

            // 记录性能指标
            this.performanceMonitor?.endMeasure(measureId, {
                success,
                libraryAvailable: !!this.libphonenumber
            });

            return success;
        } catch (error) {
            this.performanceMonitor?.recordError('library_load', error);
            this.performanceMonitor?.endMeasure(measureId, {
                success: false,
                error: error.message
            });
            return false;
        }
    }

    /**
     * 回退库加载逻辑
     */
    async fallbackLoadLibrary() {
        return new Promise((resolve) => {
            try {
                // 检查是否已经加载
                if (window.libphonenumber) {
                    this.libphonenumber = window.libphonenumber;
                    this.isLibraryLoaded = true;
                    console.log('📞 libphonenumber-js already loaded');
                    resolve(true);
                    return;
                }

                // 尝试从CDN加载libphonenumber-js
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/libphonenumber-js@1.10.51/bundle/libphonenumber-js.min.js';
                script.onload = () => {
                    this.libphonenumber = window.libphonenumber;
                    this.isLibraryLoaded = true;
                    console.log('📞 libphonenumber-js loaded successfully');
                    resolve(true);
                };
                script.onerror = () => {
                    console.warn('Failed to load libphonenumber-js, using fallback validation');
                    this.isLibraryLoaded = false;
                    resolve(false);
                };
                document.head.appendChild(script);
            } catch (error) {
                console.warn('Error loading libphonenumber-js:', error);
                this.isLibraryLoaded = false;
                resolve(false);
            }
        });
    }

    /**
     * 等待库加载完成
     */
    async waitForLibrary() {
        await this.libraryLoadPromise;
        return this.isLibraryLoaded;
    }

    /**
     * 使用libphonenumber-js库生成有效的手机号码
     */
    generateWithLibphonenumber(countryCode, format = 'INTERNATIONAL', type = 'mobile') {
        try {
            // 定义各国家的手机号码模式
            const mobilePatterns = {
                'US': ['2015551234', '3125551234', '4155551234', '7135551234', '9175551234'],
                'CN': ['13812345678', '15912345678', '18612345678', '17712345678'],
                'GB': ['07700123456', '07800123456', '07900123456'],
                'DE': ['015112345678', '016012345678', '017012345678'],
                'FR': ['0612345678', '0712345678'],
                'JP': ['08012345678', '09012345678', '07012345678'],
                'KR': ['01012345678', '01112345678'],
                'AU': ['0412345678', '0512345678'],
                'IN': ['9876543210', '8765432109'],
                'NL': ['0612345678', '0687654321']
            };

            const patterns = mobilePatterns[countryCode];
            if (!patterns) {
                throw new Error(`No patterns available for country: ${countryCode}`);
            }

            // 随机选择一个基础模式
            const basePattern = patterns[Math.floor(Math.random() * patterns.length)];
            
            // 生成随机数字替换模式中的部分数字
            let generatedNumber = basePattern;
            
            // 替换后4位为随机数字
            const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            generatedNumber = generatedNumber.slice(0, -4) + randomSuffix;

            // 使用libphonenumber-js解析和验证号码
            const phoneNumber = this.libphonenumber.parsePhoneNumber(generatedNumber, countryCode);
            
            if (!phoneNumber.isValid()) {
                // 如果生成的号码无效，尝试其他模式
                for (let i = 0; i < 5; i++) {
                    const altPattern = patterns[Math.floor(Math.random() * patterns.length)];
                    const altSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
                    const altNumber = altPattern.slice(0, -4) + altSuffix;
                    
                    try {
                        const altPhoneNumber = this.libphonenumber.parsePhoneNumber(altNumber, countryCode);
                        if (altPhoneNumber.isValid()) {
                            return this.formatWithLibphonenumber(altPhoneNumber, format);
                        }
                    } catch (e) {
                        continue;
                    }
                }
                throw new Error('Unable to generate valid number after multiple attempts');
            }

            return this.formatWithLibphonenumber(phoneNumber, format);
            
        } catch (error) {
            console.warn('Error generating with libphonenumber-js:', error);
            // 回退到备用生成逻辑
            return this.generateFallbackNumber(countryCode, format);
        }
    }

    /**
     * 使用libphonenumber-js格式化号码
     */
    formatWithLibphonenumber(phoneNumber, format) {
        switch (format.toUpperCase()) {
            case 'E164':
                return phoneNumber.format('E.164');
            case 'NATIONAL':
                return phoneNumber.formatNational();
            case 'INTERNATIONAL':
            default:
                return phoneNumber.formatInternational();
        }
    }

    /**
     * 生成备用号码（当libphonenumber-js不可用时）
     */
    generateFallbackNumber(countryCode, format) {
        // 这里使用原有的备用生成逻辑
        const countryRules = this.getCountryRulesForFallback();
        const rules = countryRules[countryCode];
        
        if (!rules) {
            throw new Error(`Unsupported country code: ${countryCode}`);
        }

        const pattern = rules.mobilePatterns[Math.floor(Math.random() * rules.mobilePatterns.length)];
        let number = pattern.prefix;
        const remainingDigits = pattern.length - pattern.prefix.length;
        
        for (let i = 0; i < remainingDigits; i++) {
            number += Math.floor(Math.random() * 10).toString();
        }

        const fullNumber = `+${rules.countryCallingCode}${number}`;
        return this.formatPhoneNumber(fullNumber, format, countryCode);
    }

    /**
     * 获取备用生成逻辑的国家规则
     */
    getCountryRulesForFallback() {
        return {
            'US': {
                countryCallingCode: '1',
                mobilePatterns: [
                    { prefix: '201', length: 10 },
                    { prefix: '212', length: 10 },
                    { prefix: '312', length: 10 },
                    { prefix: '415', length: 10 },
                    { prefix: '713', length: 10 },
                    { prefix: '917', length: 10 }
                ]
            },
            'CN': {
                countryCallingCode: '86',
                mobilePatterns: [
                    { prefix: '138', length: 11 },
                    { prefix: '139', length: 11 },
                    { prefix: '159', length: 11 },
                    { prefix: '186', length: 11 },
                    { prefix: '177', length: 11 }
                ]
            },
            'GB': {
                countryCallingCode: '44',
                mobilePatterns: [
                    { prefix: '7700', length: 11 },
                    { prefix: '7800', length: 11 },
                    { prefix: '7900', length: 11 }
                ]
            },
            'DE': {
                countryCallingCode: '49',
                mobilePatterns: [
                    { prefix: '151', length: 11 },
                    { prefix: '160', length: 11 },
                    { prefix: '170', length: 11 }
                ]
            },
            'FR': {
                countryCallingCode: '33',
                mobilePatterns: [
                    { prefix: '6', length: 9 },
                    { prefix: '7', length: 9 }
                ]
            },
            'JP': {
                countryCallingCode: '81',
                mobilePatterns: [
                    { prefix: '80', length: 10 },
                    { prefix: '90', length: 10 },
                    { prefix: '70', length: 10 }
                ]
            },
            'KR': {
                countryCallingCode: '82',
                mobilePatterns: [
                    { prefix: '10', length: 10 }
                ]
            },
            'AU': {
                countryCallingCode: '61',
                mobilePatterns: [
                    { prefix: '4', length: 9 }
                ]
            }
        };
    }

    /**
     * 验证手机号码
     */
    isValidPhoneNumber(phoneNumber, countryCode = null) {
        // 检查缓存
        if (this.cacheManager) {
            const cachedResult = this.cacheManager.getCachedValidationResult(phoneNumber, countryCode);
            if (cachedResult !== null) {
                return cachedResult;
            }
        }
        
        // 开始性能监控
        const measureId = this.performanceMonitor?.startMeasure('validation', {
            phoneNumber: phoneNumber.substring(0, 5) + '***', // 隐私保护
            countryCode
        });
        
        let isValid = false;
        
        try {
            if (this.libphonenumber) {
                try {
                    const parsed = this.libphonenumber.parsePhoneNumber(phoneNumber, countryCode);
                    isValid = parsed.isValid();
                } catch (error) {
                    isValid = false;
                }
            } else {
                // 备用验证逻辑
                isValid = this.fallbackValidation(phoneNumber);
            }
            
            // 缓存验证结果
            if (this.cacheManager) {
                this.cacheManager.cacheValidationResult(phoneNumber, countryCode, isValid);
            }
            
            // 结束性能监控
            this.performanceMonitor?.endMeasure(measureId, {
                success: true,
                isValid,
                usedLibrary: !!this.libphonenumber
            });
            
            return isValid;
            
        } catch (error) {
            this.performanceMonitor?.recordError('validation', error);
            this.performanceMonitor?.endMeasure(measureId, {
                success: false,
                error: error.message
            });
            return false;
        }
    }

    /**
     * 格式化手机号码
     */
    formatPhoneNumber(phoneNumber, format = 'INTERNATIONAL', countryCode = null) {
        // 开始性能监控
        const measureId = this.performanceMonitor?.startMeasure('formatting', {
            format,
            countryCode
        });
        
        try {
            let formattedNumber;
            
            if (this.libphonenumber) {
                try {
                    const parsed = this.libphonenumber.parsePhoneNumber(phoneNumber, countryCode);
                    if (parsed.isValid()) {
                        switch (format) {
                            case 'INTERNATIONAL':
                                formattedNumber = parsed.formatInternational();
                                break;
                            case 'NATIONAL':
                                formattedNumber = parsed.formatNational();
                                break;
                            case 'E164':
                                formattedNumber = parsed.format('E.164');
                                break;
                            case 'URI':
                                formattedNumber = parsed.getURI();
                                break;
                            default:
                                formattedNumber = parsed.formatInternational();
                        }
                    } else {
                        formattedNumber = this.fallbackFormat(phoneNumber, format, countryCode);
                    }
                } catch (error) {
                    console.warn('Format error:', error);
                    formattedNumber = this.fallbackFormat(phoneNumber, format, countryCode);
                }
            } else {
                // 备用格式化逻辑
                formattedNumber = this.fallbackFormat(phoneNumber, format, countryCode);
            }
            
            // 结束性能监控
            this.performanceMonitor?.endMeasure(measureId, {
                success: true,
                usedLibrary: !!this.libphonenumber
            });
            
            return formattedNumber;
            
        } catch (error) {
            this.performanceMonitor?.recordError('formatting', error);
            this.performanceMonitor?.endMeasure(measureId, {
                success: false,
                error: error.message
            });
            return this.fallbackFormat(phoneNumber, format, countryCode);
        }
    }

    /**
     * 获取手机号码信息
     */
    getPhoneNumberInfo(phoneNumber, countryCode = null) {
        if (this.libphonenumber) {
            try {
                const parsed = this.libphonenumber.parsePhoneNumber(phoneNumber, countryCode);
                if (parsed.isValid()) {
                    return {
                        isValid: true,
                        country: parsed.country,
                        countryCallingCode: parsed.countryCallingCode,
                        nationalNumber: parsed.nationalNumber,
                        type: parsed.getType(),
                        isPossible: parsed.isPossible(),
                        formatted: {
                            international: parsed.formatInternational(),
                            national: parsed.formatNational(),
                            e164: parsed.format('E.164'),
                            uri: parsed.getURI()
                        }
                    };
                }
            } catch (error) {
                console.warn('Parse error:', error);
            }
        }
        
        return {
            isValid: this.fallbackValidation(phoneNumber),
            country: countryCode,
            error: 'libphonenumber-js not available'
        };
    }

    /**
     * 生成指定国家的有效手机号码
     */
    async generateValidPhoneNumber(countryCode, options = {}) {
        const { format = 'INTERNATIONAL', type = 'mobile' } = options;
        
        // 注意：对于随机号码生成，我们不使用缓存来避免重复
        // 缓存主要用于验证结果和模式数据
        
        // 开始性能监控
        const measureId = this.performanceMonitor?.startMeasure('number_generation', {
            countryCode,
            format,
            type
        });
        
        try {
            // 等待libphonenumber-js库加载完成
            await this.waitForLibrary();
        
        // 如果libphonenumber-js库可用，优先使用它来生成和验证号码
        if (this.libphonenumber && this.isLibraryLoaded) {
            return this.generateWithLibphonenumber(countryCode, format, type);
        }
        
        // 备用生成逻辑：国家特定的号码生成规则
        const countryRules = {
            'US': {
                countryCallingCode: '1',
                mobilePatterns: [
                    { prefix: '201', length: 10 },
                    { prefix: '202', length: 10 },
                    { prefix: '203', length: 10 },
                    { prefix: '212', length: 10 },
                    { prefix: '213', length: 10 },
                    { prefix: '214', length: 10 },
                    { prefix: '215', length: 10 },
                    { prefix: '216', length: 10 },
                    { prefix: '217', length: 10 },
                    { prefix: '218', length: 10 },
                    { prefix: '219', length: 10 },
                    { prefix: '224', length: 10 },
                    { prefix: '225', length: 10 },
                    { prefix: '228', length: 10 },
                    { prefix: '229', length: 10 },
                    { prefix: '231', length: 10 },
                    { prefix: '234', length: 10 },
                    { prefix: '239', length: 10 },
                    { prefix: '240', length: 10 },
                    { prefix: '248', length: 10 },
                    { prefix: '251', length: 10 },
                    { prefix: '252', length: 10 },
                    { prefix: '253', length: 10 },
                    { prefix: '254', length: 10 },
                    { prefix: '256', length: 10 },
                    { prefix: '260', length: 10 },
                    { prefix: '262', length: 10 },
                    { prefix: '267', length: 10 },
                    { prefix: '269', length: 10 },
                    { prefix: '270', length: 10 },
                    { prefix: '272', length: 10 },
                    { prefix: '274', length: 10 },
                    { prefix: '276', length: 10 },
                    { prefix: '281', length: 10 },
                    { prefix: '283', length: 10 },
                    { prefix: '301', length: 10 },
                    { prefix: '302', length: 10 },
                    { prefix: '303', length: 10 },
                    { prefix: '304', length: 10 },
                    { prefix: '305', length: 10 },
                    { prefix: '307', length: 10 },
                    { prefix: '308', length: 10 },
                    { prefix: '309', length: 10 },
                    { prefix: '310', length: 10 },
                    { prefix: '312', length: 10 },
                    { prefix: '313', length: 10 },
                    { prefix: '314', length: 10 },
                    { prefix: '315', length: 10 },
                    { prefix: '316', length: 10 },
                    { prefix: '317', length: 10 },
                    { prefix: '318', length: 10 },
                    { prefix: '319', length: 10 },
                    { prefix: '320', length: 10 },
                    { prefix: '321', length: 10 },
                    { prefix: '323', length: 10 },
                    { prefix: '325', length: 10 },
                    { prefix: '330', length: 10 },
                    { prefix: '331', length: 10 },
                    { prefix: '334', length: 10 },
                    { prefix: '336', length: 10 },
                    { prefix: '337', length: 10 },
                    { prefix: '339', length: 10 },
                    { prefix: '346', length: 10 },
                    { prefix: '347', length: 10 },
                    { prefix: '351', length: 10 },
                    { prefix: '352', length: 10 },
                    { prefix: '360', length: 10 },
                    { prefix: '361', length: 10 },
                    { prefix: '364', length: 10 },
                    { prefix: '380', length: 10 },
                    { prefix: '385', length: 10 },
                    { prefix: '386', length: 10 },
                    { prefix: '401', length: 10 },
                    { prefix: '402', length: 10 },
                    { prefix: '404', length: 10 },
                    { prefix: '405', length: 10 },
                    { prefix: '406', length: 10 },
                    { prefix: '407', length: 10 },
                    { prefix: '408', length: 10 },
                    { prefix: '409', length: 10 },
                    { prefix: '410', length: 10 },
                    { prefix: '412', length: 10 },
                    { prefix: '413', length: 10 },
                    { prefix: '414', length: 10 },
                    { prefix: '415', length: 10 },
                    { prefix: '417', length: 10 },
                    { prefix: '419', length: 10 },
                    { prefix: '423', length: 10 },
                    { prefix: '424', length: 10 },
                    { prefix: '425', length: 10 },
                    { prefix: '430', length: 10 },
                    { prefix: '432', length: 10 },
                    { prefix: '434', length: 10 },
                    { prefix: '435', length: 10 },
                    { prefix: '440', length: 10 },
                    { prefix: '442', length: 10 },
                    { prefix: '443', length: 10 },
                    { prefix: '445', length: 10 },
                    { prefix: '447', length: 10 },
                    { prefix: '458', length: 10 },
                    { prefix: '463', length: 10 },
                    { prefix: '464', length: 10 },
                    { prefix: '469', length: 10 },
                    { prefix: '470', length: 10 },
                    { prefix: '475', length: 10 },
                    { prefix: '478', length: 10 },
                    { prefix: '479', length: 10 },
                    { prefix: '480', length: 10 },
                    { prefix: '484', length: 10 },
                    { prefix: '501', length: 10 },
                    { prefix: '502', length: 10 },
                    { prefix: '503', length: 10 },
                    { prefix: '504', length: 10 },
                    { prefix: '505', length: 10 },
                    { prefix: '507', length: 10 },
                    { prefix: '508', length: 10 },
                    { prefix: '509', length: 10 },
                    { prefix: '510', length: 10 },
                    { prefix: '512', length: 10 },
                    { prefix: '513', length: 10 },
                    { prefix: '515', length: 10 },
                    { prefix: '516', length: 10 },
                    { prefix: '517', length: 10 },
                    { prefix: '518', length: 10 },
                    { prefix: '520', length: 10 },
                    { prefix: '530', length: 10 },
                    { prefix: '531', length: 10 },
                    { prefix: '534', length: 10 },
                    { prefix: '539', length: 10 },
                    { prefix: '540', length: 10 },
                    { prefix: '541', length: 10 },
                    { prefix: '551', length: 10 },
                    { prefix: '559', length: 10 },
                    { prefix: '561', length: 10 },
                    { prefix: '562', length: 10 },
                    { prefix: '563', length: 10 },
                    { prefix: '564', length: 10 },
                    { prefix: '567', length: 10 },
                    { prefix: '570', length: 10 },
                    { prefix: '571', length: 10 },
                    { prefix: '573', length: 10 },
                    { prefix: '574', length: 10 },
                    { prefix: '575', length: 10 },
                    { prefix: '580', length: 10 },
                    { prefix: '585', length: 10 },
                    { prefix: '586', length: 10 },
                    { prefix: '601', length: 10 },
                    { prefix: '602', length: 10 },
                    { prefix: '603', length: 10 },
                    { prefix: '605', length: 10 },
                    { prefix: '606', length: 10 },
                    { prefix: '607', length: 10 },
                    { prefix: '608', length: 10 },
                    { prefix: '609', length: 10 },
                    { prefix: '610', length: 10 },
                    { prefix: '612', length: 10 },
                    { prefix: '614', length: 10 },
                    { prefix: '615', length: 10 },
                    { prefix: '616', length: 10 },
                    { prefix: '617', length: 10 },
                    { prefix: '618', length: 10 },
                    { prefix: '619', length: 10 },
                    { prefix: '620', length: 10 },
                    { prefix: '623', length: 10 },
                    { prefix: '626', length: 10 },
                    { prefix: '628', length: 10 },
                    { prefix: '629', length: 10 },
                    { prefix: '630', length: 10 },
                    { prefix: '631', length: 10 },
                    { prefix: '636', length: 10 },
                    { prefix: '641', length: 10 },
                    { prefix: '646', length: 10 },
                    { prefix: '650', length: 10 },
                    { prefix: '651', length: 10 },
                    { prefix: '657', length: 10 },
                    { prefix: '660', length: 10 },
                    { prefix: '661', length: 10 },
                    { prefix: '662', length: 10 },
                    { prefix: '667', length: 10 },
                    { prefix: '669', length: 10 },
                    { prefix: '678', length: 10 },
                    { prefix: '681', length: 10 },
                    { prefix: '682', length: 10 },
                    { prefix: '689', length: 10 },
                    { prefix: '701', length: 10 },
                    { prefix: '702', length: 10 },
                    { prefix: '703', length: 10 },
                    { prefix: '704', length: 10 },
                    { prefix: '706', length: 10 },
                    { prefix: '707', length: 10 },
                    { prefix: '708', length: 10 },
                    { prefix: '712', length: 10 },
                    { prefix: '713', length: 10 },
                    { prefix: '714', length: 10 },
                    { prefix: '715', length: 10 },
                    { prefix: '716', length: 10 },
                    { prefix: '717', length: 10 },
                    { prefix: '718', length: 10 },
                    { prefix: '719', length: 10 },
                    { prefix: '720', length: 10 },
                    { prefix: '724', length: 10 },
                    { prefix: '725', length: 10 },
                    { prefix: '727', length: 10 },
                    { prefix: '731', length: 10 },
                    { prefix: '732', length: 10 },
                    { prefix: '734', length: 10 },
                    { prefix: '737', length: 10 },
                    { prefix: '740', length: 10 },
                    { prefix: '743', length: 10 },
                    { prefix: '747', length: 10 },
                    { prefix: '754', length: 10 },
                    { prefix: '757', length: 10 },
                    { prefix: '760', length: 10 },
                    { prefix: '762', length: 10 },
                    { prefix: '763', length: 10 },
                    { prefix: '765', length: 10 },
                    { prefix: '769', length: 10 },
                    { prefix: '770', length: 10 },
                    { prefix: '772', length: 10 },
                    { prefix: '773', length: 10 },
                    { prefix: '774', length: 10 },
                    { prefix: '775', length: 10 },
                    { prefix: '779', length: 10 },
                    { prefix: '781', length: 10 },
                    { prefix: '785', length: 10 },
                    { prefix: '786', length: 10 },
                    { prefix: '801', length: 10 },
                    { prefix: '802', length: 10 },
                    { prefix: '803', length: 10 },
                    { prefix: '804', length: 10 },
                    { prefix: '805', length: 10 },
                    { prefix: '806', length: 10 },
                    { prefix: '808', length: 10 },
                    { prefix: '810', length: 10 },
                    { prefix: '812', length: 10 },
                    { prefix: '813', length: 10 },
                    { prefix: '814', length: 10 },
                    { prefix: '815', length: 10 },
                    { prefix: '816', length: 10 },
                    { prefix: '817', length: 10 },
                    { prefix: '818', length: 10 },
                    { prefix: '828', length: 10 },
                    { prefix: '830', length: 10 },
                    { prefix: '831', length: 10 },
                    { prefix: '832', length: 10 },
                    { prefix: '843', length: 10 },
                    { prefix: '845', length: 10 },
                    { prefix: '847', length: 10 },
                    { prefix: '848', length: 10 },
                    { prefix: '850', length: 10 },
                    { prefix: '854', length: 10 },
                    { prefix: '856', length: 10 },
                    { prefix: '857', length: 10 },
                    { prefix: '858', length: 10 },
                    { prefix: '859', length: 10 },
                    { prefix: '860', length: 10 },
                    { prefix: '862', length: 10 },
                    { prefix: '863', length: 10 },
                    { prefix: '864', length: 10 },
                    { prefix: '865', length: 10 },
                    { prefix: '870', length: 10 },
                    { prefix: '872', length: 10 },
                    { prefix: '878', length: 10 },
                    { prefix: '901', length: 10 },
                    { prefix: '903', length: 10 },
                    { prefix: '904', length: 10 },
                    { prefix: '906', length: 10 },
                    { prefix: '907', length: 10 },
                    { prefix: '908', length: 10 },
                    { prefix: '909', length: 10 },
                    { prefix: '910', length: 10 },
                    { prefix: '912', length: 10 },
                    { prefix: '913', length: 10 },
                    { prefix: '914', length: 10 },
                    { prefix: '915', length: 10 },
                    { prefix: '916', length: 10 },
                    { prefix: '917', length: 10 },
                    { prefix: '918', length: 10 },
                    { prefix: '919', length: 10 },
                    { prefix: '920', length: 10 },
                    { prefix: '925', length: 10 },
                    { prefix: '928', length: 10 },
                    { prefix: '929', length: 10 },
                    { prefix: '930', length: 10 },
                    { prefix: '931', length: 10 },
                    { prefix: '934', length: 10 },
                    { prefix: '936', length: 10 },
                    { prefix: '937', length: 10 },
                    { prefix: '940', length: 10 },
                    { prefix: '941', length: 10 },
                    { prefix: '947', length: 10 },
                    { prefix: '949', length: 10 },
                    { prefix: '951', length: 10 },
                    { prefix: '952', length: 10 },
                    { prefix: '954', length: 10 },
                    { prefix: '956', length: 10 },
                    { prefix: '959', length: 10 },
                    { prefix: '970', length: 10 },
                    { prefix: '971', length: 10 },
                    { prefix: '972', length: 10 },
                    { prefix: '973', length: 10 },
                    { prefix: '978', length: 10 },
                    { prefix: '979', length: 10 },
                    { prefix: '980', length: 10 },
                    { prefix: '984', length: 10 },
                    { prefix: '985', length: 10 },
                    { prefix: '989', length: 10 }
                ]
            },
            'CN': {
                countryCallingCode: '86',
                mobilePatterns: [
                    // 中国移动
                    { prefix: '134', length: 11 }, { prefix: '135', length: 11 }, { prefix: '136', length: 11 },
                    { prefix: '137', length: 11 }, { prefix: '138', length: 11 }, { prefix: '139', length: 11 },
                    { prefix: '147', length: 11 }, { prefix: '150', length: 11 }, { prefix: '151', length: 11 },
                    { prefix: '152', length: 11 }, { prefix: '157', length: 11 }, { prefix: '158', length: 11 },
                    { prefix: '159', length: 11 }, { prefix: '172', length: 11 }, { prefix: '178', length: 11 },
                    { prefix: '182', length: 11 }, { prefix: '183', length: 11 }, { prefix: '184', length: 11 },
                    { prefix: '187', length: 11 }, { prefix: '188', length: 11 }, { prefix: '195', length: 11 },
                    { prefix: '197', length: 11 }, { prefix: '198', length: 11 },
                    // 中国联通
                    { prefix: '130', length: 11 }, { prefix: '131', length: 11 }, { prefix: '132', length: 11 },
                    { prefix: '145', length: 11 }, { prefix: '155', length: 11 }, { prefix: '156', length: 11 },
                    { prefix: '166', length: 11 }, { prefix: '171', length: 11 }, { prefix: '175', length: 11 },
                    { prefix: '176', length: 11 }, { prefix: '185', length: 11 }, { prefix: '186', length: 11 },
                    // 中国电信
                    { prefix: '133', length: 11 }, { prefix: '149', length: 11 }, { prefix: '153', length: 11 },
                    { prefix: '173', length: 11 }, { prefix: '177', length: 11 }, { prefix: '180', length: 11 },
                    { prefix: '181', length: 11 }, { prefix: '189', length: 11 }, { prefix: '191', length: 11 },
                    { prefix: '193', length: 11 }, { prefix: '199', length: 11 }
                ]
            },
            'GB': {
                countryCallingCode: '44',
                mobilePatterns: [
                    // 英国手机号码以07开头，总长度11位
                    { prefix: '7410', length: 10 }, { prefix: '7411', length: 10 }, { prefix: '7412', length: 10 },
                    { prefix: '7413', length: 10 }, { prefix: '7414', length: 10 }, { prefix: '7415', length: 10 },
                    { prefix: '7416', length: 10 }, { prefix: '7417', length: 10 }, { prefix: '7418', length: 10 },
                    { prefix: '7419', length: 10 }, { prefix: '7771', length: 10 }, { prefix: '7772', length: 10 },
                    { prefix: '7773', length: 10 }, { prefix: '7774', length: 10 }, { prefix: '7775', length: 10 },
                    { prefix: '7776', length: 10 }, { prefix: '7778', length: 10 }, { prefix: '7779', length: 10 },
                    { prefix: '7971', length: 10 }, { prefix: '7972', length: 10 }, { prefix: '7973', length: 10 },
                    { prefix: '7974', length: 10 }, { prefix: '7975', length: 10 }, { prefix: '7976', length: 10 },
                    { prefix: '7977', length: 10 }, { prefix: '7978', length: 10 }, { prefix: '7979', length: 10 }
                ]
            },
            'DE': {
                countryCallingCode: '49',
                mobilePatterns: [
                    // 德国手机号码以15、16、17开头，总长度11位
                    { prefix: '150', length: 11 }, { prefix: '151', length: 11 }, { prefix: '152', length: 11 },
                    { prefix: '155', length: 11 }, { prefix: '156', length: 11 }, { prefix: '157', length: 11 },
                    { prefix: '159', length: 11 }, { prefix: '160', length: 11 }, { prefix: '162', length: 11 },
                    { prefix: '163', length: 11 }, { prefix: '170', length: 11 }, { prefix: '171', length: 11 },
                    { prefix: '172', length: 11 }, { prefix: '173', length: 11 }, { prefix: '174', length: 11 },
                    { prefix: '175', length: 11 }, { prefix: '176', length: 11 }, { prefix: '177', length: 11 },
                    { prefix: '178', length: 11 }, { prefix: '179', length: 11 }
                ]
            },
            'FR': {
                countryCallingCode: '33',
                mobilePatterns: [
                    // 法国手机号码以06或07开头，总长度10位（不含国家代码）
                    { prefix: '60', length: 9 }, { prefix: '61', length: 9 }, { prefix: '62', length: 9 },
                    { prefix: '63', length: 9 }, { prefix: '64', length: 9 }, { prefix: '65', length: 9 },
                    { prefix: '66', length: 9 }, { prefix: '67', length: 9 }, { prefix: '68', length: 9 },
                    { prefix: '69', length: 9 }, { prefix: '70', length: 9 }, { prefix: '71', length: 9 },
                    { prefix: '72', length: 9 }, { prefix: '73', length: 9 }, { prefix: '74', length: 9 },
                    { prefix: '75', length: 9 }, { prefix: '76', length: 9 }, { prefix: '77', length: 9 },
                    { prefix: '78', length: 9 }, { prefix: '79', length: 9 }
                ]
            },
            'JP': {
                countryCallingCode: '81',
                mobilePatterns: [
                    // 日本手机号码以070、080、090开头，总长度11位（不含国家代码）
                    { prefix: '70', length: 10 }, { prefix: '80', length: 10 }, { prefix: '90', length: 10 }
                ]
            },
            'KR': {
                countryCallingCode: '82',
                mobilePatterns: [
                    // 韩国手机号码以010开头，总长度11位（不含国家代码）
                    { prefix: '10', length: 10 }
                ]
            },
            'AU': {
                countryCallingCode: '61',
                mobilePatterns: [
                    { prefix: '4', length: 9 }
                ]
            },
            'IN': {
                countryCallingCode: '91',
                mobilePatterns: [
                    { prefix: '6', length: 10 },
                    { prefix: '7', length: 10 },
                    { prefix: '8', length: 10 },
                    { prefix: '9', length: 10 }
                ]
            },
            'NL': {
                countryCallingCode: '31',
                mobilePatterns: [
                    { prefix: '6', length: 9 }
                ]
            },
            'UZ': {
                countryCallingCode: '998',
                mobilePatterns: [
                    { prefix: '9', length: 9 }
                ]
            }
        };

        const rules = countryRules[countryCode];
        if (!rules) {
            throw new Error(`Unsupported country code: ${countryCode}`);
        }

        // 随机选择一个模式
        const pattern = rules.mobilePatterns[Math.floor(Math.random() * rules.mobilePatterns.length)];
        
        // 生成号码
        let number = pattern.prefix;
        const remainingDigits = pattern.length - pattern.prefix.length;
        
        for (let i = 0; i < remainingDigits; i++) {
            number += Math.floor(Math.random() * 10).toString();
        }

        // 格式化号码
        const fullNumber = `+${rules.countryCallingCode}${number}`;
        const formattedNumber = this.formatPhoneNumber(fullNumber, format, countryCode);
        
        // 不缓存生成的号码，确保每次都是随机的
        
        // 结束性能监控
        this.performanceMonitor?.endMeasure(measureId, {
            success: true,
            generatedNumber: formattedNumber,
            usedLibrary: this.libphonenumber && this.isLibraryLoaded
        });
        
        return formattedNumber;
        
        } catch (error) {
            // 记录错误并结束性能监控
            this.performanceMonitor?.recordError('number_generation', error);
            this.performanceMonitor?.endMeasure(measureId, {
                success: false,
                error: error.message
            });
            throw error;
        }
    }

    /**
     * 备用验证逻辑
     */
    fallbackValidation(phoneNumber) {
        // 移除所有非数字字符（除了+号）
        const cleaned = phoneNumber.replace(/[^\d+]/g, '');
        
        // 基本验证规则
        if (cleaned.startsWith('+')) {
            // 国际格式：+开头，总长度7-15位
            return cleaned.length >= 8 && cleaned.length <= 16;
        } else {
            // 国内格式：7-15位数字
            return cleaned.length >= 7 && cleaned.length <= 15;
        }
    }

    /**
     * 备用格式化逻辑
     */
    fallbackFormat(phoneNumber, format, countryCode) {
        const cleaned = phoneNumber.replace(/[^\d+]/g, '');
        
        if (format === 'E164') {
            return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
        }
        
        // 根据国家和格式进行格式化
        if (format === 'NATIONAL') {
            return this.formatNational(cleaned, countryCode);
        } else if (format === 'INTERNATIONAL') {
            return this.formatInternational(cleaned, countryCode);
        }
        
        return phoneNumber;
    }

    /**
     * 国内格式化
     */
    formatNational(phoneNumber, countryCode) {
        const cleaned = phoneNumber.replace(/[^\d+]/g, '');
        let nationalNumber = cleaned;
        
        // 移除国家代码前缀
        if (cleaned.startsWith('+')) {
            const countryCallingCodes = {
                'US': '1', 'CN': '86', 'GB': '44', 'DE': '49', 'FR': '33',
                'JP': '81', 'KR': '82', 'AU': '61', 'IN': '91', 'NL': '31', 'UZ': '998'
            };
            const callingCode = countryCallingCodes[countryCode];
            if (callingCode && cleaned.startsWith(`+${callingCode}`)) {
                nationalNumber = cleaned.substring(callingCode.length + 1);
            }
        }
        
        // 根据国家格式化
        switch (countryCode) {
            case 'US':
                if (nationalNumber.length === 10) {
                    return `(${nationalNumber.slice(0, 3)}) ${nationalNumber.slice(3, 6)}-${nationalNumber.slice(6)}`;
                }
                break;
            case 'CN':
                if (nationalNumber.length === 11) {
                    return `${nationalNumber.slice(0, 3)} ${nationalNumber.slice(3, 7)} ${nationalNumber.slice(7)}`;
                }
                break;
            case 'GB':
                if (nationalNumber.length === 10) {
                    return `0${nationalNumber.slice(0, 4)} ${nationalNumber.slice(4, 7)} ${nationalNumber.slice(7)}`;
                }
                break;
            case 'DE':
                if (nationalNumber.length === 11) {
                    return `0${nationalNumber.slice(0, 3)} ${nationalNumber.slice(3, 6)} ${nationalNumber.slice(6)}`;
                }
                break;
            case 'FR':
                if (nationalNumber.length === 9) {
                    return `0${nationalNumber.slice(0, 1)} ${nationalNumber.slice(1, 3)} ${nationalNumber.slice(3, 5)} ${nationalNumber.slice(5, 7)} ${nationalNumber.slice(7)}`;
                }
                break;
            case 'JP':
                if (nationalNumber.length === 10) {
                    return `0${nationalNumber.slice(0, 2)}-${nationalNumber.slice(2, 6)}-${nationalNumber.slice(6)}`;
                }
                break;
            case 'KR':
                if (nationalNumber.length === 10) {
                    return `0${nationalNumber.slice(0, 2)}-${nationalNumber.slice(2, 6)}-${nationalNumber.slice(6)}`;
                }
                break;
            case 'AU':
                if (nationalNumber.length === 9) {
                    return `0${nationalNumber.slice(0, 3)} ${nationalNumber.slice(3, 6)} ${nationalNumber.slice(6)}`;
                }
                break;
            case 'IN':
                if (nationalNumber.length === 10) {
                    return `${nationalNumber.slice(0, 5)} ${nationalNumber.slice(5)}`;
                }
                break;
            case 'NL':
                if (nationalNumber.length === 9) {
                    return `0${nationalNumber.slice(0, 1)} ${nationalNumber.slice(1, 4)} ${nationalNumber.slice(4, 6)} ${nationalNumber.slice(6)}`;
                }
                break;
            case 'UZ':
                if (nationalNumber.length === 9) {
                    return `${nationalNumber.slice(0, 2)} ${nationalNumber.slice(2, 5)} ${nationalNumber.slice(5, 7)} ${nationalNumber.slice(7)}`;
                }
                break;
        }
        
        return nationalNumber;
    }

    /**
     * 国际格式化
     */
    formatInternational(phoneNumber, countryCode) {
        const cleaned = phoneNumber.replace(/[^\d+]/g, '');
        
        if (!cleaned.startsWith('+')) {
            const countryCallingCodes = {
                'US': '1', 'CN': '86', 'GB': '44', 'DE': '49', 'FR': '33',
                'JP': '81', 'KR': '82', 'AU': '61', 'IN': '91', 'NL': '31', 'UZ': '998'
            };
            const callingCode = countryCallingCodes[countryCode];
            if (callingCode) {
                return `+${callingCode} ${cleaned}`;
            }
        }
        
        // 已经是国际格式，添加空格分隔
        const match = cleaned.match(/^\+(\d{1,3})(\d+)$/);
        if (match) {
            const [, countryCode, number] = match;
            return `+${countryCode} ${number}`;
        }
        
        return cleaned;
    }

    /**
     * 获取支持的国家列表
     */
    getSupportedCountries() {
        return [
            { code: 'US', name: 'United States', callingCode: '+1' },
            { code: 'CN', name: 'China', callingCode: '+86' },
            { code: 'GB', name: 'United Kingdom', callingCode: '+44' },
            { code: 'DE', name: 'Germany', callingCode: '+49' },
            { code: 'FR', name: 'France', callingCode: '+33' },
            { code: 'JP', name: 'Japan', callingCode: '+81' },
            { code: 'KR', name: 'South Korea', callingCode: '+82' },
            { code: 'AU', name: 'Australia', callingCode: '+61' }
        ];
    }

    /**
     * 生成指定国家的有效手机号码
     * @param {string} countryCode - 国家代码 (如 'US', 'CN')
     * @param {number} count - 生成数量
     * @returns {Array} 生成的手机号码数组
     */
    async generateValidNumbers(countryCode, count = 1) {
        // 等待libphonenumber-js库加载完成
        await this.waitForLibrary();
        
        const numbers = [];
        const patterns = this.getCountryPatterns(countryCode);
        
        for (let i = 0; i < count; i++) {
            let attempts = 0;
            let validNumber = null;
            
            while (attempts < 10 && !validNumber) {
                const pattern = patterns[Math.floor(Math.random() * patterns.length)];
                const candidate = this.generateFromPattern(pattern);
                
                if (this.validatePhoneNumber(candidate, countryCode)) {
                    validNumber = candidate;
                }
                attempts++;
            }
            
            if (validNumber) {
                numbers.push(validNumber);
            } else {
                // 如果无法生成有效号码，使用备用方法
                try {
                    const fallbackNumber = this.generateFallbackNumber(countryCode, 'INTERNATIONAL');
                    if (fallbackNumber) {
                        numbers.push(fallbackNumber);
                    }
                } catch (error) {
                    console.warn(`Failed to generate fallback number for ${countryCode}:`, error);
                }
            }
        }
        
        return numbers;
    }

    /**
     * 批量验证手机号码
     * @param {Array} phoneNumbers - 手机号码数组
     * @returns {Array} 验证结果数组
     */
    validateBatch(phoneNumbers) {
        return phoneNumbers.map(number => {
            const info = this.getPhoneNumberInfo(number);
            return {
                number: number,
                isValid: info.isValid,
                info: info
            };
        });
    }

    /**
     * 获取手机号码的详细信息
     * @param {string} phoneNumber - 手机号码
     * @returns {Object} 详细信息对象
     */
    getPhoneNumberInfo(phoneNumber) {
        if (!phoneNumber) {
            return {
                isValid: false,
                error: 'Empty phone number'
            };
        }

        try {
            if (this.libphonenumber) {
                const parsed = this.libphonenumber.parsePhoneNumber(phoneNumber);
                
                if (parsed) {
                    return {
                        isValid: parsed.isValid(),
                        country: parsed.country,
                        countryCallingCode: parsed.countryCallingCode,
                        nationalNumber: parsed.nationalNumber,
                        type: parsed.getType(),
                        formatted: {
                            international: parsed.formatInternational(),
                            national: parsed.formatNational(),
                            e164: parsed.format('E.164'),
                            uri: parsed.getURI()
                        },
                        possibleCountries: this.libphonenumber.getCountries(phoneNumber),
                        timeZones: parsed.getTimeZones ? parsed.getTimeZones() : null
                    };
                }
            }
            
            // 备用验证逻辑
            return this.getFallbackInfo(phoneNumber);
            
        } catch (error) {
            console.warn('Phone number parsing error:', error);
            return this.getFallbackInfo(phoneNumber);
        }
    }

    /**
     * 备用信息获取方法
     * @param {string} phoneNumber - 手机号码
     * @returns {Object} 基本信息对象
     */
    getFallbackInfo(phoneNumber) {
        const cleaned = phoneNumber.replace(/\D/g, '');
        const isValid = this.validatePhoneNumberFallback(phoneNumber);
        
        // 基于号码前缀推断国家
        let country = null;
        let countryCallingCode = null;
        
        if (cleaned.startsWith('1') && cleaned.length === 11) {
            country = 'US';
            countryCallingCode = '1';
        } else if (cleaned.startsWith('86') && cleaned.length === 13) {
            country = 'CN';
            countryCallingCode = '86';
        } else if (cleaned.startsWith('44') && cleaned.length >= 12) {
            country = 'GB';
            countryCallingCode = '44';
        } else if (cleaned.startsWith('81') && cleaned.length >= 12) {
            country = 'JP';
            countryCallingCode = '81';
        } else if (cleaned.startsWith('49') && cleaned.length >= 12) {
            country = 'DE';
            countryCallingCode = '49';
        }
        
        return {
            isValid: isValid,
            country: country,
            countryCallingCode: countryCallingCode,
            nationalNumber: country ? cleaned.substring(countryCallingCode.length) : cleaned,
            type: 'mobile',
            formatted: {
                international: phoneNumber.startsWith('+') ? phoneNumber : '+' + cleaned,
                national: phoneNumber,
                e164: '+' + cleaned,
                uri: 'tel:' + phoneNumber
            },
            possibleCountries: country ? [country] : [],
            timeZones: null,
            fallback: true
        };
    }

    /**
     * 生成测试用的手机号码
     */
    async generateTestNumbers(countryCode, count = 5, format = 'INTERNATIONAL') {
        // 等待libphonenumber-js库加载完成
        await this.waitForLibrary();
        
        const numbers = [];
        
        for (let i = 0; i < count; i++) {
            try {
                const number = await this.generateValidPhoneNumber(countryCode, { format });
                if (number) {
                    numbers.push(number);
                }
            } catch (error) {
                console.warn(`Failed to generate number ${i + 1}:`, error);
                // 如果生成失败，尝试使用备用方法
                try {
                    const fallbackNumber = this.generateFallbackNumber(countryCode, format);
                    if (fallbackNumber) {
                        numbers.push(fallbackNumber);
                    }
                } catch (fallbackError) {
                    console.warn(`Fallback generation also failed for number ${i + 1}:`, fallbackError);
                }
            }
        }
        
        return numbers;
    }

    /**
     * 备用号码生成方法
     */
    generateFallbackNumber(countryCode, format) {
        const countryRules = {
            'US': { code: '+1', pattern: '##########', example: '+1 234 567 8900' },
            'CN': { code: '+86', pattern: '1##########', example: '+86 138 0013 8000' },
            'GB': { code: '+44', pattern: '7#########', example: '+44 7400 123456' },
            'DE': { code: '+49', pattern: '15#########', example: '+49 151 23456789' },
            'FR': { code: '+33', pattern: '6########', example: '+33 6 12 34 56 78' },
            'JP': { code: '+81', pattern: '90########', example: '+81 90 1234 5678' },
            'KR': { code: '+82', pattern: '10########', example: '+82 10 1234 5678' },
            'AU': { code: '+61', pattern: '4########', example: '+61 412 345 678' },
            'IN': { code: '+91', pattern: '9#########', example: '+91 98765 43210' },
            'NL': { code: '+31', pattern: '6########', example: '+31 6 12345678' },
            'UZ': { code: '+998', pattern: '9########', example: '+998 90 123 45 67' }
        };

        const rule = countryRules[countryCode];
        if (!rule) {
            throw new Error(`Unsupported country code: ${countryCode}`);
        }

        // 生成随机数字替换#
        let number = rule.code;
        for (let char of rule.pattern) {
            if (char === '#') {
                number += Math.floor(Math.random() * 10);
            } else {
                number += char;
            }
        }

        return this.formatPhoneNumber(number, format, countryCode) || number;
    }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PhoneValidator;
} else {
    window.PhoneValidator = PhoneValidator;
}