/**
 * US Phone Number Generator
 * 专门用于生成美国手机号码的JavaScript模块
 */

class USPhoneGenerator {
    constructor() {
        this.performanceMonitor = window.PerformanceMonitor ? new window.PerformanceMonitor() : null;
        this.phoneValidator = null;
        this.init();
    }

    /**
     * 初始化生成器
     */
    async init() {
        try {
            // 初始化手机号码验证器
            this.phoneValidator = new PhoneValidator();
            await this.phoneValidator.waitForLibrary();
            
            // 绑定事件监听器
            this.bindEventListeners();
            
            // 初始化移动端菜单
            this.initMobileMenu();
            
            console.log('US Phone Generator initialized successfully');
        } catch (error) {
            console.error('Failed to initialize US Phone Generator:', error);
        }
    }

    /**
     * 绑定事件监听器
     */
    bindEventListeners() {
        // 生成按钮
        const generateBtn = document.getElementById('generate-us-btn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateUSPhoneNumbers());
        }

        // 复制所有按钮
        const copyAllBtn = document.getElementById('copy-all-us-btn');
        if (copyAllBtn) {
            copyAllBtn.addEventListener('click', () => this.copyAllNumbers());
        }

        // 导出按钮
        const exportBtn = document.getElementById('export-us-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportNumbers());
        }

        // 清除按钮
        const clearBtn = document.getElementById('clear-us-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearResults());
        }

        // 数量输入框限制
        const numberCountInput = document.getElementById('count-input');
        if (numberCountInput) {
            numberCountInput.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                if (value > 50) {
                    e.target.value = 50;
                    this.showToast('Maximum 50 numbers allowed', 'error');
                }
                if (value < 1) e.target.value = 1;
            });
        }
    }

    /**
     * 初始化移动端菜单
     */
    initMobileMenu() {
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
    }

    /**
     * 美国区号数据
     */
    getUSAreaCodes() {
        return {
            '212': { city: 'New York', state: 'NY', region: 'Northeast' },
            '213': { city: 'Los Angeles', state: 'CA', region: 'West' },
            '312': { city: 'Chicago', state: 'IL', region: 'Midwest' },
            '415': { city: 'San Francisco', state: 'CA', region: 'West' },
            '617': { city: 'Boston', state: 'MA', region: 'Northeast' },
            '713': { city: 'Houston', state: 'TX', region: 'South' },
            '202': { city: 'Washington', state: 'DC', region: 'Northeast' },
            '305': { city: 'Miami', state: 'FL', region: 'South' },
            '404': { city: 'Atlanta', state: 'GA', region: 'South' },
            '206': { city: 'Seattle', state: 'WA', region: 'West' },
            '214': { city: 'Dallas', state: 'TX', region: 'South' },
            '215': { city: 'Philadelphia', state: 'PA', region: 'Northeast' },
            '216': { city: 'Cleveland', state: 'OH', region: 'Midwest' },
            '303': { city: 'Denver', state: 'CO', region: 'West' },
            '313': { city: 'Detroit', state: 'MI', region: 'Midwest' },
            '314': { city: 'St. Louis', state: 'MO', region: 'Midwest' },
            '407': { city: 'Orlando', state: 'FL', region: 'South' },
            '480': { city: 'Phoenix', state: 'AZ', region: 'West' },
            '503': { city: 'Portland', state: 'OR', region: 'West' },
            '512': { city: 'Austin', state: 'TX', region: 'South' },
            '602': { city: 'Phoenix', state: 'AZ', region: 'West' },
            '702': { city: 'Las Vegas', state: 'NV', region: 'West' },
            '801': { city: 'Salt Lake City', state: 'UT', region: 'West' },
            '901': { city: 'Memphis', state: 'TN', region: 'South' },
            '917': { city: 'New York', state: 'NY', region: 'Northeast', type: 'Mobile' },
            '201': { city: 'Jersey City', state: 'NJ', region: 'Northeast' },
            '203': { city: 'New Haven', state: 'CT', region: 'Northeast' },
            '218': { city: 'Duluth', state: 'MN', region: 'Midwest' },
            '219': { city: 'Gary', state: 'IN', region: 'Midwest' },
            '224': { city: 'Evanston', state: 'IL', region: 'Midwest' },
            '225': { city: 'Baton Rouge', state: 'LA', region: 'South' },
            '228': { city: 'Biloxi', state: 'MS', region: 'South' },
            '229': { city: 'Albany', state: 'GA', region: 'South' },
            '231': { city: 'Muskegon', state: 'MI', region: 'Midwest' },
            '234': { city: 'Akron', state: 'OH', region: 'Midwest' },
            '239': { city: 'Fort Myers', state: 'FL', region: 'South' },
            '240': { city: 'Rockville', state: 'MD', region: 'Northeast' },
            '248': { city: 'Troy', state: 'MI', region: 'Midwest' },
            '251': { city: 'Mobile', state: 'AL', region: 'South' },
            '252': { city: 'Greenville', state: 'NC', region: 'South' },
            '253': { city: 'Tacoma', state: 'WA', region: 'West' },
            '254': { city: 'Killeen', state: 'TX', region: 'South' },
            '256': { city: 'Huntsville', state: 'AL', region: 'South' },
            '260': { city: 'Fort Wayne', state: 'IN', region: 'Midwest' },
            '262': { city: 'Kenosha', state: 'WI', region: 'Midwest' },
            '267': { city: 'Philadelphia', state: 'PA', region: 'Northeast' },
            '269': { city: 'Kalamazoo', state: 'MI', region: 'Midwest' },
            '270': { city: 'Bowling Green', state: 'KY', region: 'South' },
            '272': { city: 'Scranton', state: 'PA', region: 'Northeast' },
            '274': { city: 'Green Bay', state: 'WI', region: 'Midwest' },
            '276': { city: 'Bristol', state: 'VA', region: 'South' },
            '281': { city: 'Houston', state: 'TX', region: 'South' },
            '283': { city: 'Cincinnati', state: 'OH', region: 'Midwest' }
        };
    }

    /**
     * 生成美国手机号码
     */
    async generateUSPhoneNumbers() {
        const measureId = this.performanceMonitor?.startMeasure('us_phone_generation');
        
        try {
            // 显示加载状态
            this.setLoadingState(true);
            
            // 获取用户输入
            const areaCode = document.getElementById('area-code-select')?.value || '';
            const count = parseInt(document.getElementById('count-input')?.value || '5');
            const format = document.querySelector('input[name="format"]:checked')?.value || 'standard';
            
            // 生成号码
            const phoneNumbers = [];
            const areaCodes = this.getUSAreaCodes();
            const areaCodeKeys = Object.keys(areaCodes);
            
            for (let i = 0; i < count; i++) {
                let selectedAreaCode = areaCode;
                
                // 如果没有指定区号，随机选择一个
                if (!selectedAreaCode) {
                    selectedAreaCode = areaCodeKeys[Math.floor(Math.random() * areaCodeKeys.length)];
                }
                
                // 生成7位本地号码（避免以0或1开头）
                const centralOfficeCode = this.generateValidCentralOfficeCode();
                const subscriberNumber = this.generateSubscriberNumber();
                
                // 组合完整号码
                const fullNumber = `+1${selectedAreaCode}${centralOfficeCode}${subscriberNumber}`;
                
                // 格式化号码
                const formattedNumber = this.formatUSPhoneNumber(fullNumber, format);
                
                // 获取区号信息
                const areaCodeInfo = areaCodes[selectedAreaCode];
                
                phoneNumbers.push({
                    number: formattedNumber,
                    areaCode: selectedAreaCode,
                    location: areaCodeInfo ? `${areaCodeInfo.city}, ${areaCodeInfo.state}` : 'Unknown',
                    region: areaCodeInfo?.region || 'Unknown',
                    raw: fullNumber
                });
            }
            
            // 显示结果
            this.displayResults(phoneNumbers);
            
            // 显示操作按钮
            this.showActionButtons();
            
            this.performanceMonitor?.endMeasure(measureId, {
                success: true,
                count: phoneNumbers.length
            });
            
        } catch (error) {
            console.error('Error generating US phone numbers:', error);
            this.showError('Failed to generate phone numbers. Please try again.');
            
            this.performanceMonitor?.recordError('us_phone_generation', error);
            this.performanceMonitor?.endMeasure(measureId, {
                success: false,
                error: error.message
            });
        } finally {
            this.setLoadingState(false);
        }
    }

    /**
     * 生成有效的中心局代码（避免以0或1开头）
     */
    generateValidCentralOfficeCode() {
        const firstDigit = Math.floor(Math.random() * 8) + 2; // 2-9
        const secondDigit = Math.floor(Math.random() * 10); // 0-9
        const thirdDigit = Math.floor(Math.random() * 10); // 0-9
        return `${firstDigit}${secondDigit}${thirdDigit}`;
    }

    /**
     * 生成用户号码（4位）
     */
    generateSubscriberNumber() {
        return Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    }

    /**
     * 格式化美国手机号码
     */
    formatUSPhoneNumber(phoneNumber, format) {
        // 提取号码部分（去掉+1）
        const number = phoneNumber.replace('+1', '');
        const areaCode = number.substring(0, 3);
        const centralOffice = number.substring(3, 6);
        const subscriber = number.substring(6, 10);
        
        switch (format) {
            case 'formatted':
                return `+1 (${areaCode}) ${centralOffice}-${subscriber}`;
            case 'dots':
                return `+1.${areaCode}.${centralOffice}.${subscriber}`;
            case 'national':
                return `(${areaCode}) ${centralOffice}-${subscriber}`;
            case 'standard':
            default:
                return phoneNumber; // +1XXXXXXXXXX
        }
    }

    /**
     * 显示生成结果
     */
    displayResults(phoneNumbers) {
        const container = document.getElementById('us-results-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        phoneNumbers.forEach((phoneData, index) => {
            const resultItem = this.createResultItem(phoneData, index + 1);
            container.appendChild(resultItem);
        });
        
        // 保存结果供后续使用
        this.lastGeneratedNumbers = phoneNumbers;
    }

    /**
     * 创建结果项元素
     */
    createResultItem(phoneData, index) {
        const div = document.createElement('div');
        div.className = 'bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow duration-200';
        
        div.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex-1">
                    <div class="flex items-center">
                        <span class="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded mr-3">${index}</span>
                        <span class="font-mono text-sm font-medium text-gray-900">${phoneData.number}</span>
                    </div>
                    <div class="mt-1 text-xs text-gray-500">
                        <span class="inline-flex items-center">
                            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                            ${phoneData.location}
                        </span>
                        <span class="ml-3 inline-flex items-center">
                            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3"></path>
                            </svg>
                            ${phoneData.region}
                        </span>
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    <button onclick="usPhoneGenerator.copyNumber('${phoneData.number}')" 
                        class="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                        title="Copy number">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                        </svg>
                    </button>
                    <button onclick="usPhoneGenerator.validateNumber('${phoneData.raw}')" 
                        class="p-1 text-gray-400 hover:text-green-600 transition-colors duration-200"
                        title="Validate number">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        
        return div;
    }

    /**
     * 复制单个号码
     */
    async copyNumber(number) {
        try {
            await navigator.clipboard.writeText(number);
            this.showToast('Number copied to clipboard!', 'success');
        } catch (error) {
            console.error('Failed to copy number:', error);
            this.showToast('Failed to copy number', 'error');
        }
    }

    /**
     * 验证号码
     */
    async validateNumber(number) {
        if (!this.phoneValidator) {
            this.showToast('Phone validator not available', 'error');
            return;
        }
        
        try {
            const isValid = this.phoneValidator.isValidPhoneNumber(number, 'US');
            const message = isValid ? 'Valid US phone number ✓' : 'Invalid phone number ✗';
            const type = isValid ? 'success' : 'error';
            this.showToast(message, type);
        } catch (error) {
            console.error('Validation error:', error);
            this.showToast('Validation failed', 'error');
        }
    }

    /**
     * 复制所有号码
     */
    async copyAllNumbers() {
        if (!this.lastGeneratedNumbers || this.lastGeneratedNumbers.length === 0) {
            this.showToast('No numbers to copy', 'error');
            return;
        }
        
        try {
            const numbersText = this.lastGeneratedNumbers
                .map(phoneData => phoneData.number)
                .join('\n');
            
            await navigator.clipboard.writeText(numbersText);
            this.showToast(`${this.lastGeneratedNumbers.length} numbers copied to clipboard!`, 'success');
        } catch (error) {
            console.error('Failed to copy numbers:', error);
            this.showToast('Failed to copy numbers', 'error');
        }
    }

    /**
     * 导出号码
     */
    exportNumbers() {
        if (!this.lastGeneratedNumbers || this.lastGeneratedNumbers.length === 0) {
            this.showToast('No numbers to export', 'error');
            return;
        }
        
        try {
            // 创建CSV内容
            const csvContent = [
                'Number,Area Code,Location,Region,Raw Number',
                ...this.lastGeneratedNumbers.map(phoneData => 
                    `"${phoneData.number}","${phoneData.areaCode}","${phoneData.location}","${phoneData.region}","${phoneData.raw}"`
                )
            ].join('\n');
            
            // 创建并下载文件
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', `us-phone-numbers-${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showToast('Numbers exported successfully!', 'success');
        } catch (error) {
            console.error('Export failed:', error);
            this.showToast('Export failed', 'error');
        }
    }

    /**
     * 清除结果
     */
    clearResults() {
        const container = document.getElementById('us-results-container');
        if (!container) return;
        
        container.innerHTML = `
            <div class="text-center text-gray-500 py-8">
                <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                </svg>
                <p>Click "Generate US Phone Numbers" to start</p>
            </div>
        `;
        
        // 隐藏操作按钮
        this.hideActionButtons();
        
        // 清除保存的结果
        this.lastGeneratedNumbers = [];
        
        this.showToast('Results cleared', 'info');
    }

    /**
     * 显示操作按钮
     */
    showActionButtons() {
        const copyAllBtn = document.getElementById('copy-all-us-btn');
        const exportBtn = document.getElementById('export-us-btn');
        const clearBtn = document.getElementById('clear-us-btn');
        
        if (copyAllBtn) copyAllBtn.classList.remove('hidden');
        if (exportBtn) exportBtn.classList.remove('hidden');
        if (clearBtn) clearBtn.classList.remove('hidden');
    }

    /**
     * 隐藏操作按钮
     */
    hideActionButtons() {
        const copyAllBtn = document.getElementById('copy-all-us-btn');
        const exportBtn = document.getElementById('export-us-btn');
        const clearBtn = document.getElementById('clear-us-btn');
        
        if (copyAllBtn) copyAllBtn.classList.add('hidden');
        if (exportBtn) exportBtn.classList.add('hidden');
        if (clearBtn) clearBtn.classList.add('hidden');
    }

    /**
     * 设置加载状态
     */
    setLoadingState(isLoading) {
        const generateBtn = document.getElementById('generate-us-btn');
        const generateText = document.getElementById('generate-us-text');
        const loadingSpinner = document.getElementById('loading-us-spinner');
        
        if (generateBtn && generateText && loadingSpinner) {
            if (isLoading) {
                generateBtn.disabled = true;
                generateBtn.classList.add('opacity-75', 'cursor-not-allowed');
                generateText.textContent = 'Generating...';
                loadingSpinner.classList.remove('hidden');
            } else {
                generateBtn.disabled = false;
                generateBtn.classList.remove('opacity-75', 'cursor-not-allowed');
                generateText.textContent = '🇺🇸 Generate US Phone Numbers';
                loadingSpinner.classList.add('hidden');
            }
        }
    }

    /**
     * 显示错误信息
     */
    showError(message) {
        const container = document.getElementById('us-results-container');
        if (!container) return;
        
        container.innerHTML = `
            <div class="text-center text-red-600 py-8">
                <svg class="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
                <p>${message}</p>
            </div>
        `;
    }

    /**
     * 显示提示信息
     */
    showToast(message, type = 'info') {
        // 创建toast元素
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-md shadow-lg text-white text-sm font-medium transition-all duration-300 transform translate-x-full`;
        
        // 设置颜色
        switch (type) {
            case 'success':
                toast.classList.add('bg-green-500');
                break;
            case 'error':
                toast.classList.add('bg-red-500');
                break;
            default:
                toast.classList.add('bg-blue-500');
        }
        
        toast.textContent = message;
        document.body.appendChild(toast);
        
        // 显示动画
        setTimeout(() => {
            toast.classList.remove('translate-x-full');
        }, 100);
        
        // 自动隐藏
        setTimeout(() => {
            toast.classList.add('translate-x-full');
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
}

// 全局实例
let usPhoneGenerator;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    usPhoneGenerator = new USPhoneGenerator();
});

// 导出供其他脚本使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = USPhoneGenerator;
}