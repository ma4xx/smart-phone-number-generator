/**
 * 库加载管理器
 * 负责libphonenumber-js库的加载、重试和缓存
 */

class LibraryLoader {
    constructor(options = {}) {
        this.options = {
            cdnUrl: 'https://cdn.jsdelivr.net/npm/libphonenumber-js@1.10.51/bundle/libphonenumber-js.min.js',
            fallbackUrls: [
                'https://unpkg.com/libphonenumber-js@1.10.51/bundle/libphonenumber-js.min.js',
                'https://cdnjs.cloudflare.com/ajax/libs/libphonenumber-js/1.10.51/libphonenumber-js.min.js'
            ],
            timeout: 10000,
            maxRetries: 3,
            retryDelay: 1000,
            enableLocalStorage: true,
            ...options
        };

        this.libphonenumber = null;
        this.isLoaded = false;
        this.isLoading = false;
        this.loadPromise = null;
        this.loadAttempts = 0;
        this.lastError = null;
        
        // 性能监控
        this.loadStartTime = null;
        this.loadEndTime = null;
        
        // 事件监听器
        this.listeners = {
            load: [],
            error: [],
            retry: []
        };

        // 检查是否已经加载
        this.checkExistingLibrary();
    }

    /**
     * 检查是否已经存在库
     */
    checkExistingLibrary() {
        if (typeof window !== 'undefined' && window.libphonenumber) {
            this.libphonenumber = window.libphonenumber;
            this.isLoaded = true;
            this.emit('load', { source: 'existing' });
        }
    }

    /**
     * 加载库（主方法）
     */
    async load() {
        if (this.isLoaded) {
            return this.libphonenumber;
        }

        if (this.isLoading) {
            return this.loadPromise;
        }

        this.isLoading = true;
        this.loadStartTime = performance.now();
        
        this.loadPromise = this.attemptLoad();
        
        try {
            const result = await this.loadPromise;
            this.loadEndTime = performance.now();
            return result;
        } catch (error) {
            this.loadEndTime = performance.now();
            this.isLoading = false;
            throw error;
        }
    }

    /**
     * 尝试加载库（带重试）
     */
    async attemptLoad() {
        const urls = [this.options.cdnUrl, ...this.options.fallbackUrls];
        
        for (let attempt = 0; attempt < this.options.maxRetries; attempt++) {
            this.loadAttempts = attempt + 1;
            
            for (const url of urls) {
                try {
                    console.log(`📞 Attempting to load libphonenumber-js from: ${url} (attempt ${this.loadAttempts})`);
                    
                    const result = await this.loadFromUrl(url);
                    
                    this.isLoaded = true;
                    this.isLoading = false;
                    this.libphonenumber = result;
                    
                    console.log(`✅ libphonenumber-js loaded successfully from: ${url}`);
                    this.emit('load', { 
                        source: url, 
                        attempt: this.loadAttempts,
                        loadTime: this.getLoadTime()
                    });
                    
                    return result;
                } catch (error) {
                    console.warn(`❌ Failed to load from ${url}:`, error.message);
                    this.lastError = error;
                    
                    this.emit('retry', { 
                        url, 
                        attempt: this.loadAttempts, 
                        error: error.message 
                    });
                }
            }
            
            // 等待后重试
            if (attempt < this.options.maxRetries - 1) {
                await this.delay(this.options.retryDelay * (attempt + 1));
            }
        }
        
        // 所有尝试都失败
        this.isLoading = false;
        const error = new Error(`Failed to load libphonenumber-js after ${this.loadAttempts} attempts`);
        this.emit('error', { 
            attempts: this.loadAttempts, 
            lastError: this.lastError,
            loadTime: this.getLoadTime()
        });
        throw error;
    }

    /**
     * 从指定URL加载库
     */
    loadFromUrl(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.async = true;
            
            const timeoutId = setTimeout(() => {
                cleanup();
                reject(new Error(`Timeout loading from ${url}`));
            }, this.options.timeout);
            
            const cleanup = () => {
                clearTimeout(timeoutId);
                script.removeEventListener('load', onLoad);
                script.removeEventListener('error', onError);
                if (script.parentNode) {
                    script.parentNode.removeChild(script);
                }
            };
            
            const onLoad = () => {
                cleanup();
                if (window.libphonenumber) {
                    resolve(window.libphonenumber);
                } else {
                    reject(new Error('Library loaded but libphonenumber not found'));
                }
            };
            
            const onError = () => {
                cleanup();
                reject(new Error(`Script error loading from ${url}`));
            };
            
            script.addEventListener('load', onLoad);
            script.addEventListener('error', onError);
            
            document.head.appendChild(script);
        });
    }

    /**
     * 延迟函数
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 获取加载时间
     */
    getLoadTime() {
        if (this.loadStartTime && this.loadEndTime) {
            return this.loadEndTime - this.loadStartTime;
        }
        return null;
    }

    /**
     * 事件监听
     */
    on(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event].push(callback);
        }
    }

    /**
     * 移除事件监听
     */
    off(event, callback) {
        if (this.listeners[event]) {
            const index = this.listeners[event].indexOf(callback);
            if (index > -1) {
                this.listeners[event].splice(index, 1);
            }
        }
    }

    /**
     * 触发事件
     */
    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in ${event} listener:`, error);
                }
            });
        }
    }

    /**
     * 获取库实例
     */
    getLibrary() {
        return this.libphonenumber;
    }

    /**
     * 检查是否已加载
     */
    isLibraryLoaded() {
        return this.isLoaded;
    }

    /**
     * 获取加载状态
     */
    getStatus() {
        return {
            isLoaded: this.isLoaded,
            isLoading: this.isLoading,
            loadAttempts: this.loadAttempts,
            loadTime: this.getLoadTime(),
            lastError: this.lastError ? this.lastError.message : null
        };
    }

    /**
     * 重置加载器
     */
    reset() {
        this.libphonenumber = null;
        this.isLoaded = false;
        this.isLoading = false;
        this.loadPromise = null;
        this.loadAttempts = 0;
        this.lastError = null;
        this.loadStartTime = null;
        this.loadEndTime = null;
    }

    /**
     * 预加载（可选）
     */
    preload() {
        if (!this.isLoaded && !this.isLoading) {
            this.load().catch(error => {
                console.warn('Preload failed:', error.message);
            });
        }
    }

    /**
     * 获取性能指标
     */
    getMetrics() {
        return {
            loadTime: this.getLoadTime(),
            attempts: this.loadAttempts,
            success: this.isLoaded,
            error: this.lastError ? this.lastError.message : null
        };
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LibraryLoader;
} else {
    window.LibraryLoader = LibraryLoader;
}