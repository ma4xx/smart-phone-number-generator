/**
 * 智能随机手机号码生成器 - 主应用文件
 * 功能：AI驱动的手机号码生成，支持多国家和格式
 */

class PhoneNumberGenerator {
    constructor() {
        this.apiKey = null; // 将从环境变量或配置中获取
        this.apiEndpoint = '/api/openrouter'; // Vercel Functions端点
        
        // 初始化优化后的手机号码验证器
        this.phoneValidator = new PhoneValidator({
            enableCache: true,
            enablePerformanceMonitoring: true,
            cacheOptions: {
                maxMemorySize: 500,
                maxLocalStorageSize: 200,
                ttl: 20 * 60 * 1000 // 20分钟
            },
            performanceOptions: {
                enableMetrics: true,
                enableReporting: true,
                reportInterval: 120000, // 2分钟报告间隔
                thresholds: {
                    libraryLoadTime: 3000,
                    numberGeneration: 50,
                    validation: 30
                }
            }
        });
        
        this.init();
    }

    /**
     * 初始化应用
     */
    init() {
        this.bindEvents();
        this.loadCountryData();
        console.log('📱 Phone Number Generator initialized');
        
        // 暴露实例到全局作用域
        window.phoneValidator = this.phoneValidator;
        window.phoneGenerator = this;
        
        // 初始化导航栏功能
        this.initNavigation();
    }
    
    initNavigation() {
        // 移动端菜单切换
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (mobileMenuButton && mobileMenu) {
            mobileMenuButton.addEventListener('click', () => {
                const isHidden = mobileMenu.classList.contains('hidden');
                if (isHidden) {
                    mobileMenu.classList.remove('hidden');
                    mobileMenuButton.setAttribute('aria-expanded', 'true');
                } else {
                    mobileMenu.classList.add('hidden');
                    mobileMenuButton.setAttribute('aria-expanded', 'false');
                }
            });
        }
        
        // 多语言选择器
        const languageSelector = document.getElementById('language-selector');
        if (languageSelector) {
            languageSelector.addEventListener('change', (e) => {
                const selectedLanguage = e.target.value;
                this.changeLanguage(selectedLanguage);
            });
        }
        
        // 点击外部关闭移动端菜单
        document.addEventListener('click', (e) => {
            if (mobileMenu && !mobileMenu.contains(e.target) && !mobileMenuButton.contains(e.target)) {
                mobileMenu.classList.add('hidden');
                mobileMenuButton.setAttribute('aria-expanded', 'false');
            }
        });
    }
    
    changeLanguage(language) {
        // 这里可以实现多语言切换逻辑
        console.log('切换语言到:', language);
        // 可以根据需要实现具体的多语言功能
        // 例如：更新页面文本、保存用户偏好等
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        const generateBtn = document.getElementById('generate-btn');
        const copyAllBtn = document.getElementById('copy-all-btn');
        const aiInput = document.getElementById('ai-input');
        const exportBtn = document.getElementById('export-btn');
        const exportDropdown = document.getElementById('export-dropdown');
        const exportCsvBtn = document.getElementById('export-csv');
        const exportTxtBtn = document.getElementById('export-txt');
        const clearBtn = document.getElementById('clear-btn');

        generateBtn.addEventListener('click', () => this.handleGenerate());
        copyAllBtn.addEventListener('click', () => this.copyAllNumbers());
        
        // 导出按钮下拉菜单
        exportBtn.addEventListener('click', () => this.toggleExportDropdown());
        exportCsvBtn.addEventListener('click', () => this.exportToCSV());
        exportTxtBtn.addEventListener('click', () => this.exportToTXT());
        
        // 清除按钮
        clearBtn.addEventListener('click', () => this.clearResults());
        
        // 点击外部关闭下拉菜单
        document.addEventListener('click', (e) => {
            if (!exportBtn.contains(e.target) && !exportDropdown.contains(e.target)) {
                exportDropdown.classList.add('hidden');
                exportBtn.setAttribute('aria-expanded', 'false');
            }
        });
        
        // AI输入框回车键支持
        aiInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.handleGenerate();
            }
        });
        
        // 数量输入框验证
        const countInput = document.getElementById('count');
        const countWarning = document.getElementById('count-warning');
        
        countInput.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            if (value > 50) {
                countWarning.classList.remove('hidden');
            } else {
                countWarning.classList.add('hidden');
            }
        });
        
        countInput.addEventListener('blur', (e) => {
            const value = parseInt(e.target.value);
            if (value > 50) {
                e.target.value = 50;
                countWarning.classList.remove('hidden');
                setTimeout(() => {
                    countWarning.classList.add('hidden');
                }, 3000); // 3秒后隐藏警告
            }
        });
        
        // 键盘输入时也检查
        countInput.addEventListener('keyup', (e) => {
            const value = parseInt(e.target.value);
            if (value > 50) {
                countWarning.classList.remove('hidden');
            } else {
                countWarning.classList.add('hidden');
            }
        });
    }

    /**
     * 加载国家数据
     */
    loadCountryData() {
        // 国家代码和格式映射
        this.countryData = {
            'US': {
                name: 'United States',
                code: '+1',
                format: 'XXX-XXX-XXXX',
                mobilePrefix: ['2', '3', '4', '5', '6', '7', '8', '9']
            },
            'CN': {
                name: 'China',
                code: '+86',
                format: 'XXX XXXX XXXX',
                mobilePrefix: ['13', '14', '15', '16', '17', '18', '19']
            },
            'GB': {
                name: 'United Kingdom',
                code: '+44',
                format: 'XXXX XXX XXXX',
                mobilePrefix: ['7']
            },
            'DE': {
                name: 'Germany',
                code: '+49',
                format: 'XXX XXXXXXX',
                mobilePrefix: ['15', '16', '17']
            },
            'FR': {
                name: 'France',
                code: '+33',
                format: 'X XX XX XX XX',
                mobilePrefix: ['6', '7']
            },
            'JP': {
                name: 'Japan',
                code: '+81',
                format: 'XX-XXXX-XXXX',
                mobilePrefix: ['70', '80', '90']
            },
            'KR': {
                name: 'South Korea',
                code: '+82',
                format: 'XX-XXXX-XXXX',
                mobilePrefix: ['10', '11']
            },
            'AU': {
                name: 'Australia',
                code: '+61',
                format: 'XXX XXX XXX',
                mobilePrefix: ['4']
            },
            'IN': {
                name: 'India',
                code: '+91',
                format: 'XXXXX XXXXX',
                mobilePrefix: ['6', '7', '8', '9']
            },
            'NL': {
                name: 'Netherlands',
                code: '+31',
                format: 'X XXXX XXXX',
                mobilePrefix: ['6']
            },
            'UZ': {
                name: 'Uzbekistan',
                code: '+998',
                format: 'XX XXX XX XX',
                mobilePrefix: ['9']
            }
        };
    }

    /**
     * 处理生成请求
     */
    async handleGenerate() {
        const aiInput = document.getElementById('ai-input').value.trim();
        const country = document.getElementById('country').value;
        let count = parseInt(document.getElementById('count').value);
        const format = document.querySelector('input[name="format"]:checked').value;
        
        // 验证数量限制
        if (count > 50) {
            count = 50;
            document.getElementById('count').value = 50;
            const countWarning = document.getElementById('count-warning');
            countWarning.classList.remove('hidden');
            setTimeout(() => {
                countWarning.classList.add('hidden');
            }, 3000);
        }

        // 显示加载状态
        this.setLoadingState(true);

        try {
            let phoneNumbers;
            
            if (aiInput) {
                // 使用AI生成
                phoneNumbers = await this.generateWithAI(aiInput, country, count, format);
            } else {
                // 使用传统算法生成
                phoneNumbers = await this.generateTraditional(country, count, format);
            }

            this.displayResults(phoneNumbers);
        } catch (error) {
            console.error('Generation error:', error);
            this.showError('Failed to generate phone numbers. Please try again.');
        } finally {
            this.setLoadingState(false);
        }
    }

    /**
     * 使用AI生成手机号码
     */
    async generateWithAI(prompt, country, count, format) {
        try {
            // 首先使用AI解析用户输入，提取国家和数量信息
            const aiParseResult = await this.parseUserInput(prompt);
            
            // 如果AI成功解析了国家信息，更新选择
            if (aiParseResult.success) {
                if (aiParseResult.country !== 'unknown') {
                    const detectedCountry = this.findCountryCode(aiParseResult.country);
                    if (detectedCountry) {
                        country = detectedCountry;
                        // 更新前端显示
                        document.getElementById('country').value = country;
                    }
                }
                
                // 如果AI解析了数量，更新数量
                if (aiParseResult.quantity && aiParseResult.quantity !== count) {
                    count = Math.min(aiParseResult.quantity, 50); // 限制最大50个
                    document.getElementById('count').value = count;
                }
                
                // 显示AI解析结果给用户
                this.showAIParseResult(aiParseResult);
            } else {
                // AI解析失败，显示错误信息但继续使用传统生成
                this.showAIParseError(aiParseResult.error);
            }
            
            // 使用解析后的参数生成手机号码
            return await this.generateTraditional(country, count, format);
            
        } catch (error) {
            console.error('AI generation failed:', error);
            // 回退到传统生成
            return await this.generateTraditional(country, count, format);
        }
    }

    /**
     * 传统算法生成手机号码
     */
    async generateTraditional(country, count, format) {
        try {
            // 使用PhoneValidator生成更准确的号码
            return await this.phoneValidator.generateTestNumbers(country, count, format.toUpperCase());
        } catch (error) {
            console.warn('PhoneValidator failed, using fallback:', error);
            
            // 备用生成逻辑
            const countryInfo = this.countryData[country];
            if (!countryInfo) {
                throw new Error(`Unsupported country: ${country}`);
            }

            const phoneNumbers = [];
            
            for (let i = 0; i < count; i++) {
                const phoneNumber = this.generateSingleNumber(countryInfo, format);
                phoneNumbers.push(phoneNumber);
            }

            return phoneNumbers;
        }
    }

    /**
     * 生成单个手机号码
     */
    generateSingleNumber(countryInfo, format) {
        const { code, mobilePrefix } = countryInfo;
        
        // 随机选择一个移动号码前缀
        const prefix = mobilePrefix[Math.floor(Math.random() * mobilePrefix.length)];
        
        // 根据国家生成号码
        let number;
        switch (countryInfo.name) {
            case 'United States':
                // 美国格式: +1 XXX XXX XXXX
                const areaCode = this.generateDigits(3, ['2', '3', '4', '5', '6', '7', '8', '9']);
                const exchange = this.generateDigits(3, ['2', '3', '4', '5', '6', '7', '8', '9']);
                const subscriber = this.generateDigits(4);
                number = `${areaCode}${exchange}${subscriber}`;
                break;
                
            case 'China':
                // 中国格式: +86 1XX XXXX XXXX
                const suffix = this.generateDigits(9);
                number = `${prefix}${suffix}`;
                break;
                
            case 'United Kingdom':
                // 英国格式: +44 7XXX XXX XXX
                const ukSuffix = this.generateDigits(9);
                number = `${prefix}${ukSuffix}`;
                break;
                
            default:
                // 通用格式
                const genericSuffix = this.generateDigits(8);
                number = `${prefix}${genericSuffix}`;
        }

        // 格式化号码
        return this.formatPhoneNumber(number, countryInfo.code, format);
    }

    /**
     * 生成指定位数的随机数字
     */
    generateDigits(length, firstDigitOptions = null) {
        let result = '';
        
        for (let i = 0; i < length; i++) {
            if (i === 0 && firstDigitOptions) {
                result += firstDigitOptions[Math.floor(Math.random() * firstDigitOptions.length)];
            } else {
                result += Math.floor(Math.random() * 10).toString();
            }
        }
        
        return result;
    }

    /**
     * 格式化手机号码
     */
    formatPhoneNumber(number, countryCode, format) {
        switch (format) {
            case 'international':
                return this.formatInternational(number, countryCode);
            case 'national':
                return this.formatNational(number, countryCode);
            case 'e164':
                return `${countryCode}${number}`;
            default:
                return number;
        }
    }

    /**
     * 国际格式化
     */
    formatInternational(number, countryCode) {
        // 简单的国际格式化，可以根据需要扩展
        if (countryCode === '+1') {
            // 美国格式: +1 (XXX) XXX-XXXX
            return `${countryCode} (${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`;
        } else if (countryCode === '+86') {
            // 中国格式: +86 XXX XXXX XXXX
            return `${countryCode} ${number.slice(0, 3)} ${number.slice(3, 7)} ${number.slice(7)}`;
        } else {
            // 通用格式
            return `${countryCode} ${number}`;
        }
    }

    /**
     * 国内格式化
     */
    formatNational(number, countryCode) {
        if (countryCode === '+1') {
            // 美国格式: (XXX) XXX-XXXX
            return `(${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`;
        } else if (countryCode === '+86') {
            // 中国格式: XXX XXXX XXXX
            return `${number.slice(0, 3)} ${number.slice(3, 7)} ${number.slice(7)}`;
        } else {
            // 通用格式
            return number;
        }
    }

    /**
     * 验证手机号码格式
     */
    isValidPhoneNumber(phoneNumber) {
        // 使用PhoneValidator进行验证
        return this.phoneValidator.isValidPhoneNumber(phoneNumber);
    }

    /**
     * 显示生成结果
     */
    displayResults(phoneNumbers) {
        const resultsSection = document.getElementById('results');
        const resultsContainer = document.getElementById('results-container');
        
        // 清空之前的结果
        resultsContainer.innerHTML = '';
        
        // 创建结果项
        phoneNumbers.forEach((phoneNumber, index) => {
            const resultItem = this.createResultItem(phoneNumber, index);
            resultsContainer.appendChild(resultItem);
        });
        
        // 显示结果区域
        resultsSection.classList.remove('hidden');
        
        // 添加滚动指示器（如果结果超过5个）
        this.addScrollIndicator(phoneNumbers.length);
        
        // 滚动到结果区域
        resultsSection.scrollIntoView({ behavior: 'smooth' });
        
        // 如果结果超过5个，滚动到顶部
        if (phoneNumbers.length > 5) {
            setTimeout(() => {
                resultsContainer.scrollTop = 0;
            }, 100);
        }
    }

    /**
     * 创建结果项元素
     */
    createResultItem(phoneNumber, index) {
        const div = document.createElement('div');
        div.className = 'flex items-center justify-between p-3 bg-gray-50 rounded-md';
        
        div.innerHTML = `
            <div class="flex items-center">
                <span class="text-sm text-gray-500 mr-3">${index + 1}.</span>
                <span class="font-mono text-lg text-gray-900">${phoneNumber}</span>
            </div>
            <button class="copy-btn inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500" data-phone="${phoneNumber}">
                Copy
            </button>
        `;
        
        // 绑定复制按钮事件
        const copyBtn = div.querySelector('.copy-btn');
        copyBtn.addEventListener('click', () => this.copyToClipboard(phoneNumber, copyBtn));
        
        return div;
    }

    /**
     * 复制到剪贴板
     */
    async copyToClipboard(text, button) {
        try {
            await navigator.clipboard.writeText(text);
            
            // 显示复制成功反馈
            const originalText = button.textContent;
            button.textContent = 'Copied!';
            button.classList.add('text-green-600');
            
            setTimeout(() => {
                button.textContent = originalText;
                button.classList.remove('text-green-600');
            }, 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
            this.showError('Failed to copy to clipboard');
        }
    }

    /**
     * 复制所有号码
     */
    async copyAllNumbers() {
        const phoneNumbers = Array.from(document.querySelectorAll('.copy-btn'))
            .map(btn => btn.dataset.phone)
            .join('\n');
        
        if (phoneNumbers) {
            await this.copyToClipboard(phoneNumbers, document.getElementById('copy-all-btn'));
        }
    }

    /**
     * 切换导出下拉菜单
     */
    toggleExportDropdown() {
        const exportDropdown = document.getElementById('export-dropdown');
        const exportBtn = document.getElementById('export-btn');
        
        const isHidden = exportDropdown.classList.contains('hidden');
        
        if (isHidden) {
            exportDropdown.classList.remove('hidden');
            exportBtn.setAttribute('aria-expanded', 'true');
        } else {
            exportDropdown.classList.add('hidden');
            exportBtn.setAttribute('aria-expanded', 'false');
        }
    }

    /**
     * 导出为CSV格式
     */
    exportToCSV() {
        const phoneNumbers = Array.from(document.querySelectorAll('.copy-btn'))
            .map(btn => btn.dataset.phone);
        
        if (phoneNumbers.length === 0) {
            this.showError('No phone numbers to export');
            return;
        }
        
        // 创建CSV内容
        const csvContent = 'Phone Number\n' + phoneNumbers.join('\n');
        
        // 下载文件
        this.downloadFile(csvContent, 'phone-numbers.csv', 'text/csv');
        
        // 关闭下拉菜单
        document.getElementById('export-dropdown').classList.add('hidden');
        document.getElementById('export-btn').setAttribute('aria-expanded', 'false');
    }

    /**
     * 导出为TXT格式
     */
    exportToTXT() {
        const phoneNumbers = Array.from(document.querySelectorAll('.copy-btn'))
            .map(btn => btn.dataset.phone);
        
        if (phoneNumbers.length === 0) {
            this.showError('No phone numbers to export');
            return;
        }
        
        // 创建TXT内容
        const txtContent = phoneNumbers.join('\n');
        
        // 下载文件
        this.downloadFile(txtContent, 'phone-numbers.txt', 'text/plain');
        
        // 关闭下拉菜单
        document.getElementById('export-dropdown').classList.add('hidden');
        document.getElementById('export-btn').setAttribute('aria-expanded', 'false');
    }

    /**
     * 清除所有结果
     */
    clearResults() {
        const resultsSection = document.getElementById('results');
        const resultsContainer = document.getElementById('results-container');
        
        // 清空结果容器
        resultsContainer.innerHTML = '';
        
        // 隐藏结果区域
        resultsSection.classList.add('hidden');
        
        // 移除滚动指示器
        const scrollIndicator = document.querySelector('.scroll-indicator');
        if (scrollIndicator) {
            scrollIndicator.remove();
        }
    }

    /**
     * 下载文件
     */
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // 释放URL对象
        URL.revokeObjectURL(url);
    }

    /**
     * 设置加载状态
     */
    setLoadingState(isLoading) {
        const generateBtn = document.getElementById('generate-btn');
        const generateText = document.getElementById('generate-text');
        const loadingSpinner = document.getElementById('loading-spinner');
        
        if (isLoading) {
            generateBtn.disabled = true;
            generateBtn.classList.add('opacity-75', 'cursor-not-allowed');
            generateText.textContent = 'Generating...';
            loadingSpinner.classList.remove('hidden');
        } else {
            generateBtn.disabled = false;
            generateBtn.classList.remove('opacity-75', 'cursor-not-allowed');
            generateText.textContent = 'Generate Phone Numbers';
            loadingSpinner.classList.add('hidden');
        }
    }

    /**
     * 显示错误信息
     */
    showError(message) {
        // 创建错误提示
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50';
        errorDiv.innerHTML = `
            <div class="flex items-center">
                <span>${message}</span>
                <button class="ml-4 text-red-700 hover:text-red-900" onclick="this.parentElement.parentElement.remove()">
                    ×
                </button>
            </div>
        `;
        
        document.body.appendChild(errorDiv);
        
        // 自动移除错误提示
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 5000);
    }

    /**
     * 添加滚动指示器
     */
    addScrollIndicator(totalCount) {
        const resultsContainer = document.getElementById('results-container');
        
        // 移除之前的滚动指示器
        const existingIndicator = document.querySelector('.scroll-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }
        
        // 如果结果数量超过5个，添加滚动指示器
        if (totalCount > 5) {
            const indicator = document.createElement('div');
            indicator.className = 'scroll-indicator';
            indicator.innerHTML = `
                <div class="text-xs text-gray-500 text-center py-2 bg-gray-50 border-t border-gray-200">
                    <span class="inline-flex items-center">
                        <svg class="w-4 h-4 mr-1 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                        </svg>
                        Scroll to view all ${totalCount} numbers
                        <svg class="w-4 h-4 ml-1 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                        </svg>
                    </span>
                </div>
            `;
            
            // 插入到results-container后面
            resultsContainer.parentNode.insertBefore(indicator, resultsContainer.nextSibling);
            
            // 添加滚动事件监听，当滚动到底部时隐藏指示器
            resultsContainer.addEventListener('scroll', () => {
                const isScrolledToBottom = resultsContainer.scrollHeight - resultsContainer.scrollTop <= resultsContainer.clientHeight + 10;
                if (isScrolledToBottom) {
                    indicator.style.opacity = '0.3';
                } else {
                    indicator.style.opacity = '1';
                }
            });
            
            // 添加移动端触摸滚动优化
            this.optimizeMobileScrolling(resultsContainer);
        }
    }
    
    /**
     * 优化移动端滚动体验
     */
    optimizeMobileScrolling(container) {
        // 检测是否为移动设备
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
            // 添加触摸滚动样式
            container.style.webkitOverflowScrolling = 'touch';
            container.style.overscrollBehavior = 'contain';
            
            // 添加触摸事件监听
            let startY = 0;
            let isScrolling = false;
            
            container.addEventListener('touchstart', (e) => {
                startY = e.touches[0].clientY;
                isScrolling = false;
            }, { passive: true });
            
            container.addEventListener('touchmove', (e) => {
                if (!isScrolling) {
                    const currentY = e.touches[0].clientY;
                    const deltaY = Math.abs(currentY - startY);
                    
                    if (deltaY > 10) {
                        isScrolling = true;
                    }
                }
            }, { passive: true });
        }
    }

    /**
     * 显示性能监控面板
     */
    showPerformancePanel() {
        if (!this.phoneValidator.performanceMonitor) {
            this.showError('Performance monitoring is not enabled');
            return;
        }

        const stats = this.phoneValidator.performanceMonitor.getStats();
        const summary = this.phoneValidator.performanceMonitor.getMetricsSummary();
        const cacheStats = this.phoneValidator.cacheManager?.getStats();

        const panelHTML = `
            <div id="performance-panel" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-y-auto">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-2xl font-bold">Performance Monitor</h2>
                        <button onclick="document.getElementById('performance-panel').remove()" 
                                class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        <div class="bg-blue-50 p-4 rounded-lg">
                            <h3 class="font-semibold text-blue-800">Overall Performance</h3>
                            <p class="text-2xl font-bold text-blue-600">${summary.performanceGrade}</p>
                            <p class="text-sm text-blue-600">Grade</p>
                        </div>
                        
                        <div class="bg-green-50 p-4 rounded-lg">
                            <h3 class="font-semibold text-green-800">Success Rate</h3>
                            <p class="text-2xl font-bold text-green-600">${summary.successRate}%</p>
                            <p class="text-sm text-green-600">Operations</p>
                        </div>
                        
                        <div class="bg-yellow-50 p-4 rounded-lg">
                            <h3 class="font-semibold text-yellow-800">Avg Response Time</h3>
                            <p class="text-2xl font-bold text-yellow-600">${summary.averageResponseTime}ms</p>
                            <p class="text-sm text-yellow-600">Per Operation</p>
                        </div>
                    </div>
                    
                    ${cacheStats ? `
                    <div class="mb-6">
                        <h3 class="text-lg font-semibold mb-3">Cache Performance</h3>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div class="bg-purple-50 p-3 rounded">
                                <p class="text-sm text-purple-600">Hit Rate</p>
                                <p class="text-xl font-bold text-purple-800">${cacheStats.hitRate}%</p>
                            </div>
                            <div class="bg-purple-50 p-3 rounded">
                                <p class="text-sm text-purple-600">Memory Cache</p>
                                <p class="text-xl font-bold text-purple-800">${cacheStats.memorySize}/${cacheStats.maxMemorySize}</p>
                            </div>
                            <div class="bg-purple-50 p-3 rounded">
                                <p class="text-sm text-purple-600">Local Storage</p>
                                <p class="text-xl font-bold text-purple-800">${cacheStats.localStorageSize}/${cacheStats.maxLocalStorageSize}</p>
                            </div>
                            <div class="bg-purple-50 p-3 rounded">
                                <p class="text-sm text-purple-600">Total Hits</p>
                                <p class="text-xl font-bold text-purple-800">${cacheStats.memoryHits + cacheStats.localStorageHits}</p>
                            </div>
                        </div>
                    </div>
                    ` : ''}
                    
                    <div class="mb-6">
                        <h3 class="text-lg font-semibold mb-3">Operation Breakdown</h3>
                        <div class="overflow-x-auto">
                            <table class="min-w-full bg-white border border-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-4 py-2 text-left">Operation</th>
                                        <th class="px-4 py-2 text-left">Count</th>
                                        <th class="px-4 py-2 text-left">Avg Time (ms)</th>
                                        <th class="px-4 py-2 text-left">Error Rate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${Object.entries(summary.operationBreakdown).map(([op, data]) => `
                                        <tr class="border-t">
                                            <td class="px-4 py-2">${op}</td>
                                            <td class="px-4 py-2">${data.count}</td>
                                            <td class="px-4 py-2">${data.averageDuration}</td>
                                            <td class="px-4 py-2">${data.errorRate}%</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div class="flex gap-2">
                        <button onclick="window.phoneGenerator.generatePerformanceReport()" 
                                class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                            Generate Report
                        </button>
                        <button onclick="window.phoneGenerator.clearPerformanceData()" 
                                class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                            Clear Data
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', panelHTML);
    }

    /**
     * 使用AI解析用户输入
     */
    async parseUserInput(prompt) {
        try {
            const response = await fetch('/api/ai-proxy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: prompt
                })
            });

            if (!response.ok) {
                throw new Error(`AI proxy request failed: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('AI parsing failed:', error);
            return {
                success: false,
                error: 'Could not connect to AI service, please try selecting manually.'
            };
        }
    }

    /**
     * 根据国家名称查找国家代码
     */
    findCountryCode(countryName) {
        const normalizedName = countryName.toLowerCase();
        
        // 直接匹配
        for (const [code, data] of Object.entries(this.countryData)) {
            if (data.name.toLowerCase() === normalizedName) {
                return code;
            }
        }
        
        // 模糊匹配
        const countryMappings = {
            'us': 'US',
            'usa': 'US',
            'america': 'US',
            'united states': 'US',
            'china': 'CN',
            'chinese': 'CN',
            'uk': 'GB',
            'britain': 'GB',
            'england': 'GB',
            'united kingdom': 'GB',
            'germany': 'DE',
            'german': 'DE',
            'deutschland': 'DE',
            'france': 'FR',
            'french': 'FR'
        };
        
        return countryMappings[normalizedName] || null;
    }

    /**
     * 显示AI解析结果
     */
    showAIParseResult(result) {
        const messageDiv = this.createMessageDiv('success');
        let message = 'AI successfully understood your request: ';
        
        if (result.country !== 'unknown') {
            message += `Country: ${result.country}, `;
        }
        message += `Quantity: ${result.quantity}`;
        
        messageDiv.textContent = message;
        this.showTemporaryMessage(messageDiv, 3000);
    }

    /**
     * 显示AI解析错误
     */
    showAIParseError(error) {
        const messageDiv = this.createMessageDiv('error');
        messageDiv.textContent = error || 'Could not understand your request, using current settings.';
        this.showTemporaryMessage(messageDiv, 4000);
    }

    /**
     * 创建消息div
     */
    createMessageDiv(type) {
        const div = document.createElement('div');
        div.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-sm ${
            type === 'success' 
                ? 'bg-green-100 border border-green-400 text-green-700'
                : 'bg-yellow-100 border border-yellow-400 text-yellow-700'
        }`;
        return div;
    }

    /**
     * 显示临时消息
     */
    showTemporaryMessage(messageDiv, duration) {
        document.body.appendChild(messageDiv);
        
        // 添加淡入动画
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateX(100%)';
        
        setTimeout(() => {
            messageDiv.style.transition = 'all 0.3s ease-in-out';
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateX(0)';
        }, 10);
        
        // 自动移除
        setTimeout(() => {
            messageDiv.style.opacity = '0';
            messageDiv.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 300);
        }, duration);
    }

    /**
     * 生成性能报告
     */
    generatePerformanceReport() {
        if (!this.phoneValidator.performanceMonitor) return;
        
        const report = this.phoneValidator.performanceMonitor.generateReport();
        console.log('Performance Report:', report);
        
        // 下载报告为JSON文件
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `performance-report-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    /**
     * 清理性能数据
     */
    clearPerformanceData() {
        if (this.phoneValidator.performanceMonitor) {
            this.phoneValidator.performanceMonitor.reset();
        }
        if (this.phoneValidator.cacheManager) {
            this.phoneValidator.cacheManager.clear();
        }
        
        // 关闭面板
        const panel = document.getElementById('performance-panel');
        if (panel) {
            panel.remove();
        }
        
        console.log('Performance data cleared');
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化验证器
    window.phoneValidator = new PhoneValidator();
    
    // 初始化生成器
    window.phoneGenerator = new PhoneNumberGenerator();
    
    console.log('📱 Phone Number Generator initialized');
});

// 添加性能监控快捷键 (Ctrl+Shift+P)
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        if (window.phoneGenerator) {
            window.phoneGenerator.showPerformancePanel();
        }
    }
});

// FAQ折叠功能
document.addEventListener('DOMContentLoaded', function() {
    // 初始化FAQ折叠功能
    const faqToggles = document.querySelectorAll('.faq-toggle');
    
    faqToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const content = document.getElementById(targetId);
            const arrow = this.querySelector('svg');
            
            if (content.classList.contains('hidden')) {
                // 展开
                content.classList.remove('hidden');
                arrow.style.transform = 'rotate(180deg)';
            } else {
                // 收起
                content.classList.add('hidden');
                arrow.style.transform = 'rotate(0deg)';
            }
        });
    });
});

// 导出类供测试使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PhoneNumberGenerator;
}