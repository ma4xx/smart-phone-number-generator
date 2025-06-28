/**
 * 缓存管理器
 * 提供多层缓存机制，提升性能
 */

class CacheManager {
    constructor(options = {}) {
        this.options = {
            maxMemorySize: 1000,        // 内存缓存最大条目数
            maxLocalStorageSize: 500,   // localStorage最大条目数
            ttl: 30 * 60 * 1000,       // 缓存TTL (30分钟)
            enableLocalStorage: true,   // 是否启用localStorage
            enableMemoryCache: true,    // 是否启用内存缓存
            keyPrefix: 'phone_cache_', // localStorage键前缀
            ...options
        };

        // 内存缓存
        this.memoryCache = new Map();
        
        // 缓存统计
        this.stats = {
            memoryHits: 0,
            memoryMisses: 0,
            localStorageHits: 0,
            localStorageMisses: 0,
            sets: 0,
            evictions: 0
        };

        // 定期清理过期缓存
        this.startCleanupTimer();
    }

    /**
     * 生成缓存键
     */
    generateKey(type, ...params) {
        return `${type}:${params.join(':')}`;
    }

    /**
     * 设置缓存
     */
    set(key, value, ttl = null) {
        const expiry = Date.now() + (ttl || this.options.ttl);
        const cacheItem = {
            value,
            expiry,
            timestamp: Date.now()
        };

        // 内存缓存
        if (this.options.enableMemoryCache) {
            this.setMemoryCache(key, cacheItem);
        }

        // localStorage缓存
        if (this.options.enableLocalStorage && this.isLocalStorageAvailable()) {
            this.setLocalStorageCache(key, cacheItem);
        }

        this.stats.sets++;
    }

    /**
     * 获取缓存
     */
    get(key) {
        // 先检查内存缓存
        if (this.options.enableMemoryCache) {
            const memoryResult = this.getMemoryCache(key);
            if (memoryResult !== null) {
                this.stats.memoryHits++;
                return memoryResult;
            }
            this.stats.memoryMisses++;
        }

        // 再检查localStorage缓存
        if (this.options.enableLocalStorage && this.isLocalStorageAvailable()) {
            const localStorageResult = this.getLocalStorageCache(key);
            if (localStorageResult !== null) {
                this.stats.localStorageHits++;
                // 将数据提升到内存缓存
                if (this.options.enableMemoryCache) {
                    this.setMemoryCache(key, {
                        value: localStorageResult,
                        expiry: Date.now() + this.options.ttl,
                        timestamp: Date.now()
                    });
                }
                return localStorageResult;
            }
            this.stats.localStorageMisses++;
        }

        return null;
    }

    /**
     * 内存缓存设置
     */
    setMemoryCache(key, cacheItem) {
        // 检查容量限制
        if (this.memoryCache.size >= this.options.maxMemorySize) {
            this.evictLRU();
        }

        this.memoryCache.set(key, cacheItem);
    }

    /**
     * 内存缓存获取
     */
    getMemoryCache(key) {
        const item = this.memoryCache.get(key);
        if (!item) {
            return null;
        }

        // 检查是否过期
        if (Date.now() > item.expiry) {
            this.memoryCache.delete(key);
            return null;
        }

        // 更新访问时间（LRU）
        item.lastAccess = Date.now();
        this.memoryCache.delete(key);
        this.memoryCache.set(key, item);

        return item.value;
    }

    /**
     * localStorage缓存设置
     */
    setLocalStorageCache(key, cacheItem) {
        try {
            const storageKey = this.options.keyPrefix + key;
            const data = JSON.stringify(cacheItem);
            
            // 检查容量限制
            this.checkLocalStorageCapacity();
            
            localStorage.setItem(storageKey, data);
        } catch (error) {
            console.warn('Failed to set localStorage cache:', error);
        }
    }

    /**
     * localStorage缓存获取
     */
    getLocalStorageCache(key) {
        try {
            const storageKey = this.options.keyPrefix + key;
            const data = localStorage.getItem(storageKey);
            
            if (!data) {
                return null;
            }

            const item = JSON.parse(data);
            
            // 检查是否过期
            if (Date.now() > item.expiry) {
                localStorage.removeItem(storageKey);
                return null;
            }

            return item.value;
        } catch (error) {
            console.warn('Failed to get localStorage cache:', error);
            return null;
        }
    }

    /**
     * 检查localStorage容量
     */
    checkLocalStorageCapacity() {
        const keys = this.getLocalStorageKeys();
        if (keys.length >= this.options.maxLocalStorageSize) {
            // 删除最旧的条目
            const oldestKey = this.findOldestLocalStorageKey(keys);
            if (oldestKey) {
                localStorage.removeItem(oldestKey);
                this.stats.evictions++;
            }
        }
    }

    /**
     * 获取localStorage中的缓存键
     */
    getLocalStorageKeys() {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.options.keyPrefix)) {
                keys.push(key);
            }
        }
        return keys;
    }

    /**
     * 找到最旧的localStorage条目
     */
    findOldestLocalStorageKey(keys) {
        let oldestKey = null;
        let oldestTime = Date.now();

        keys.forEach(key => {
            try {
                const data = localStorage.getItem(key);
                if (data) {
                    const item = JSON.parse(data);
                    if (item.timestamp < oldestTime) {
                        oldestTime = item.timestamp;
                        oldestKey = key;
                    }
                }
            } catch (error) {
                // 损坏的数据，标记为删除
                oldestKey = key;
            }
        });

        return oldestKey;
    }

    /**
     * LRU淘汰
     */
    evictLRU() {
        let oldestKey = null;
        let oldestTime = Date.now();

        for (const [key, item] of this.memoryCache) {
            const accessTime = item.lastAccess || item.timestamp;
            if (accessTime < oldestTime) {
                oldestTime = accessTime;
                oldestKey = key;
            }
        }

        if (oldestKey) {
            this.memoryCache.delete(oldestKey);
            this.stats.evictions++;
        }
    }

    /**
     * 删除缓存
     */
    delete(key) {
        // 删除内存缓存
        this.memoryCache.delete(key);
        
        // 删除localStorage缓存
        if (this.isLocalStorageAvailable()) {
            const storageKey = this.options.keyPrefix + key;
            localStorage.removeItem(storageKey);
        }
    }

    /**
     * 清空所有缓存
     */
    clear() {
        // 清空内存缓存
        this.memoryCache.clear();
        
        // 清空localStorage缓存
        if (this.isLocalStorageAvailable()) {
            const keys = this.getLocalStorageKeys();
            keys.forEach(key => localStorage.removeItem(key));
        }

        // 重置统计
        this.resetStats();
    }

    /**
     * 清理过期缓存
     */
    cleanup() {
        const now = Date.now();
        
        // 清理内存缓存
        for (const [key, item] of this.memoryCache) {
            if (now > item.expiry) {
                this.memoryCache.delete(key);
            }
        }

        // 清理localStorage缓存
        if (this.isLocalStorageAvailable()) {
            const keys = this.getLocalStorageKeys();
            keys.forEach(key => {
                try {
                    const data = localStorage.getItem(key);
                    if (data) {
                        const item = JSON.parse(data);
                        if (now > item.expiry) {
                            localStorage.removeItem(key);
                        }
                    }
                } catch (error) {
                    // 删除损坏的数据
                    localStorage.removeItem(key);
                }
            });
        }
    }

    /**
     * 启动清理定时器
     */
    startCleanupTimer() {
        // 每5分钟清理一次过期缓存
        setInterval(() => {
            this.cleanup();
        }, 5 * 60 * 1000);
    }

    /**
     * 检查localStorage是否可用
     */
    isLocalStorageAvailable() {
        try {
            const test = '__cache_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * 获取缓存统计
     */
    getStats() {
        const memorySize = this.memoryCache.size;
        const localStorageSize = this.getLocalStorageKeys().length;
        const hitRate = this.calculateHitRate();

        return {
            ...this.stats,
            memorySize,
            localStorageSize,
            hitRate,
            maxMemorySize: this.options.maxMemorySize,
            maxLocalStorageSize: this.options.maxLocalStorageSize
        };
    }

    /**
     * 计算命中率
     */
    calculateHitRate() {
        const totalHits = this.stats.memoryHits + this.stats.localStorageHits;
        const totalRequests = totalHits + this.stats.memoryMisses + this.stats.localStorageMisses;
        
        return totalRequests > 0 ? (totalHits / totalRequests * 100).toFixed(2) : 0;
    }

    /**
     * 重置统计
     */
    resetStats() {
        this.stats = {
            memoryHits: 0,
            memoryMisses: 0,
            localStorageHits: 0,
            localStorageMisses: 0,
            sets: 0,
            evictions: 0
        };
    }

    /**
     * 缓存号码生成结果
     */
    cacheGeneratedNumber(countryCode, format, number) {
        const key = this.generateKey('generated', countryCode, format);
        this.set(key, number, 10 * 60 * 1000); // 10分钟TTL
    }

    /**
     * 获取缓存的号码
     */
    getCachedNumber(countryCode, format) {
        const key = this.generateKey('generated', countryCode, format);
        return this.get(key);
    }

    /**
     * 缓存验证结果
     */
    cacheValidationResult(phoneNumber, countryCode, isValid) {
        const key = this.generateKey('validation', phoneNumber, countryCode || 'auto');
        this.set(key, isValid, 60 * 60 * 1000); // 1小时TTL
    }

    /**
     * 获取缓存的验证结果
     */
    getCachedValidationResult(phoneNumber, countryCode) {
        const key = this.generateKey('validation', phoneNumber, countryCode || 'auto');
        return this.get(key);
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CacheManager;
} else {
    window.CacheManager = CacheManager;
}