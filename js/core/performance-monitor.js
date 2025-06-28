/**
 * 性能监控器
 * 监控应用性能指标，提供优化建议
 */

class PerformanceMonitor {
    constructor(options = {}) {
        this.options = {
            enableMetrics: true,        // 是否启用性能指标收集
            enableReporting: true,      // 是否启用性能报告
            reportInterval: 60000,      // 报告间隔（毫秒）
            maxMetricsHistory: 1000,    // 最大指标历史记录数
            thresholds: {               // 性能阈值
                libraryLoadTime: 5000,  // 库加载时间阈值（毫秒）
                numberGeneration: 100,  // 号码生成时间阈值（毫秒）
                validation: 50,         // 验证时间阈值（毫秒）
                cacheHitRate: 80        // 缓存命中率阈值（%）
            },
            ...options
        };

        // 性能指标
        this.metrics = {
            libraryLoad: [],
            numberGeneration: [],
            validation: [],
            formatting: [],
            cacheOperations: [],
            errors: []
        };

        // 实时统计
        this.stats = {
            totalOperations: 0,
            totalErrors: 0,
            averageResponseTime: 0,
            peakResponseTime: 0,
            libraryLoadSuccess: 0,
            libraryLoadFailure: 0
        };

        // 性能标记
        this.marks = new Map();
        
        // 启动监控
        this.startMonitoring();
    }

    /**
     * 开始性能测量
     */
    startMeasure(operation, details = {}) {
        if (!this.options.enableMetrics) return null;

        const measureId = `${operation}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const startTime = performance.now();
        
        this.marks.set(measureId, {
            operation,
            startTime,
            details,
            timestamp: Date.now()
        });

        return measureId;
    }

    /**
     * 结束性能测量
     */
    endMeasure(measureId, result = {}) {
        if (!measureId || !this.marks.has(measureId)) return;

        const mark = this.marks.get(measureId);
        const endTime = performance.now();
        const duration = endTime - mark.startTime;

        const metric = {
            operation: mark.operation,
            duration,
            timestamp: mark.timestamp,
            details: mark.details,
            result,
            success: !result.error
        };

        // 记录到相应的指标数组
        this.recordMetric(metric);
        
        // 更新统计
        this.updateStats(metric);
        
        // 检查性能阈值
        this.checkThresholds(metric);
        
        // 清理标记
        this.marks.delete(measureId);

        return metric;
    }

    /**
     * 记录指标
     */
    recordMetric(metric) {
        const category = this.getMetricCategory(metric.operation);
        
        if (this.metrics[category]) {
            this.metrics[category].push(metric);
            
            // 限制历史记录数量
            if (this.metrics[category].length > this.options.maxMetricsHistory) {
                this.metrics[category].shift();
            }
        }
    }

    /**
     * 获取指标分类
     */
    getMetricCategory(operation) {
        const categoryMap = {
            'library_load': 'libraryLoad',
            'number_generation': 'numberGeneration',
            'validation': 'validation',
            'formatting': 'formatting',
            'cache_get': 'cacheOperations',
            'cache_set': 'cacheOperations'
        };
        
        return categoryMap[operation] || 'errors';
    }

    /**
     * 更新统计信息
     */
    updateStats(metric) {
        this.stats.totalOperations++;
        
        if (!metric.success) {
            this.stats.totalErrors++;
        }

        // 更新响应时间统计
        if (metric.duration > this.stats.peakResponseTime) {
            this.stats.peakResponseTime = metric.duration;
        }

        // 计算平均响应时间
        const totalDuration = this.getAllMetrics()
            .reduce((sum, m) => sum + m.duration, 0);
        this.stats.averageResponseTime = totalDuration / this.stats.totalOperations;

        // 库加载统计
        if (metric.operation === 'library_load') {
            if (metric.success) {
                this.stats.libraryLoadSuccess++;
            } else {
                this.stats.libraryLoadFailure++;
            }
        }
    }

    /**
     * 检查性能阈值
     */
    checkThresholds(metric) {
        const thresholds = this.options.thresholds;
        const warnings = [];

        switch (metric.operation) {
            case 'library_load':
                if (metric.duration > thresholds.libraryLoadTime) {
                    warnings.push(`Library load time (${metric.duration.toFixed(2)}ms) exceeds threshold (${thresholds.libraryLoadTime}ms)`);
                }
                break;
            
            case 'number_generation':
                if (metric.duration > thresholds.numberGeneration) {
                    warnings.push(`Number generation time (${metric.duration.toFixed(2)}ms) exceeds threshold (${thresholds.numberGeneration}ms)`);
                }
                break;
            
            case 'validation':
                if (metric.duration > thresholds.validation) {
                    warnings.push(`Validation time (${metric.duration.toFixed(2)}ms) exceeds threshold (${thresholds.validation}ms)`);
                }
                break;
        }

        if (warnings.length > 0) {
            this.reportPerformanceWarning(warnings, metric);
        }
    }

    /**
     * 报告性能警告
     */
    reportPerformanceWarning(warnings, metric) {
        if (this.options.enableReporting) {
            console.warn('Performance Warning:', {
                warnings,
                metric,
                suggestions: this.getOptimizationSuggestions(metric)
            });
        }
    }

    /**
     * 获取优化建议
     */
    getOptimizationSuggestions(metric) {
        const suggestions = [];

        switch (metric.operation) {
            case 'library_load':
                suggestions.push('Consider using local library files');
                suggestions.push('Implement library preloading');
                suggestions.push('Check network connectivity');
                break;
            
            case 'number_generation':
                suggestions.push('Enable caching for generated numbers');
                suggestions.push('Optimize country pattern data');
                suggestions.push('Consider batch generation');
                break;
            
            case 'validation':
                suggestions.push('Cache validation results');
                suggestions.push('Use more efficient validation patterns');
                suggestions.push('Implement client-side validation');
                break;
        }

        return suggestions;
    }

    /**
     * 记录错误
     */
    recordError(operation, error, details = {}) {
        const errorMetric = {
            operation,
            error: error.message || error,
            stack: error.stack,
            timestamp: Date.now(),
            details,
            success: false
        };

        this.metrics.errors.push(errorMetric);
        this.stats.totalErrors++;

        if (this.options.enableReporting) {
            console.error('Performance Monitor - Error recorded:', errorMetric);
        }
    }

    /**
     * 获取所有指标
     */
    getAllMetrics() {
        return Object.values(this.metrics).flat();
    }

    /**
     * 获取指标摘要
     */
    getMetricsSummary(timeRange = 3600000) { // 默认1小时
        const now = Date.now();
        const cutoff = now - timeRange;
        
        const recentMetrics = this.getAllMetrics()
            .filter(metric => metric.timestamp > cutoff);

        const summary = {
            totalOperations: recentMetrics.length,
            successRate: this.calculateSuccessRate(recentMetrics),
            averageResponseTime: this.calculateAverageResponseTime(recentMetrics),
            operationBreakdown: this.getOperationBreakdown(recentMetrics),
            errorBreakdown: this.getErrorBreakdown(recentMetrics),
            performanceGrade: this.calculatePerformanceGrade(recentMetrics)
        };

        return summary;
    }

    /**
     * 计算成功率
     */
    calculateSuccessRate(metrics) {
        if (metrics.length === 0) return 100;
        
        const successCount = metrics.filter(m => m.success).length;
        return ((successCount / metrics.length) * 100).toFixed(2);
    }

    /**
     * 计算平均响应时间
     */
    calculateAverageResponseTime(metrics) {
        if (metrics.length === 0) return 0;
        
        const totalDuration = metrics.reduce((sum, m) => sum + (m.duration || 0), 0);
        return (totalDuration / metrics.length).toFixed(2);
    }

    /**
     * 获取操作分解
     */
    getOperationBreakdown(metrics) {
        const breakdown = {};
        
        metrics.forEach(metric => {
            if (!breakdown[metric.operation]) {
                breakdown[metric.operation] = {
                    count: 0,
                    totalDuration: 0,
                    errors: 0
                };
            }
            
            breakdown[metric.operation].count++;
            breakdown[metric.operation].totalDuration += metric.duration || 0;
            
            if (!metric.success) {
                breakdown[metric.operation].errors++;
            }
        });

        // 计算平均时间
        Object.keys(breakdown).forEach(operation => {
            const data = breakdown[operation];
            data.averageDuration = (data.totalDuration / data.count).toFixed(2);
            data.errorRate = ((data.errors / data.count) * 100).toFixed(2);
        });

        return breakdown;
    }

    /**
     * 获取错误分解
     */
    getErrorBreakdown(metrics) {
        const errors = metrics.filter(m => !m.success);
        const breakdown = {};
        
        errors.forEach(error => {
            const errorType = error.error || 'Unknown';
            breakdown[errorType] = (breakdown[errorType] || 0) + 1;
        });
        
        return breakdown;
    }

    /**
     * 计算性能等级
     */
    calculatePerformanceGrade(metrics) {
        if (metrics.length === 0) return 'A';
        
        const successRate = parseFloat(this.calculateSuccessRate(metrics));
        const avgResponseTime = parseFloat(this.calculateAverageResponseTime(metrics));
        
        let score = 100;
        
        // 成功率影响
        if (successRate < 95) score -= 20;
        else if (successRate < 98) score -= 10;
        
        // 响应时间影响
        if (avgResponseTime > 200) score -= 30;
        else if (avgResponseTime > 100) score -= 15;
        else if (avgResponseTime > 50) score -= 5;
        
        // 错误率影响
        const errorRate = 100 - successRate;
        score -= errorRate * 2;
        
        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'F';
    }

    /**
     * 生成性能报告
     */
    generateReport(timeRange = 3600000) {
        const summary = this.getMetricsSummary(timeRange);
        const stats = this.getOverallStats();
        
        const report = {
            timestamp: new Date().toISOString(),
            timeRange: `${timeRange / 60000} minutes`,
            summary,
            overallStats: stats,
            recommendations: this.getRecommendations(summary)
        };
        
        if (this.options.enableReporting) {
            console.log('Performance Report:', report);
        }
        
        return report;
    }

    /**
     * 获取整体统计
     */
    getOverallStats() {
        return {
            ...this.stats,
            libraryLoadSuccessRate: this.stats.libraryLoadSuccess > 0 
                ? ((this.stats.libraryLoadSuccess / (this.stats.libraryLoadSuccess + this.stats.libraryLoadFailure)) * 100).toFixed(2)
                : 0,
            errorRate: this.stats.totalOperations > 0
                ? ((this.stats.totalErrors / this.stats.totalOperations) * 100).toFixed(2)
                : 0
        };
    }

    /**
     * 获取优化建议
     */
    getRecommendations(summary) {
        const recommendations = [];
        
        if (parseFloat(summary.successRate) < 95) {
            recommendations.push('Improve error handling and retry mechanisms');
        }
        
        if (parseFloat(summary.averageResponseTime) > 100) {
            recommendations.push('Optimize performance bottlenecks');
            recommendations.push('Consider implementing more aggressive caching');
        }
        
        if (summary.performanceGrade === 'D' || summary.performanceGrade === 'F') {
            recommendations.push('Critical performance issues detected - immediate attention required');
        }
        
        return recommendations;
    }

    /**
     * 启动监控
     */
    startMonitoring() {
        if (this.options.enableReporting) {
            // 定期生成报告
            setInterval(() => {
                this.generateReport();
            }, this.options.reportInterval);
        }
    }

    /**
     * 清理旧数据
     */
    cleanup(maxAge = 24 * 60 * 60 * 1000) { // 默认24小时
        const cutoff = Date.now() - maxAge;
        
        Object.keys(this.metrics).forEach(category => {
            this.metrics[category] = this.metrics[category]
                .filter(metric => metric.timestamp > cutoff);
        });
    }

    /**
     * 重置所有指标
     */
    reset() {
        this.metrics = {
            libraryLoad: [],
            numberGeneration: [],
            validation: [],
            formatting: [],
            cacheOperations: [],
            errors: []
        };
        
        this.stats = {
            totalOperations: 0,
            totalErrors: 0,
            averageResponseTime: 0,
            peakResponseTime: 0,
            libraryLoadSuccess: 0,
            libraryLoadFailure: 0
        };
        
        this.marks.clear();
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceMonitor;
} else {
    window.PerformanceMonitor = PerformanceMonitor;
}