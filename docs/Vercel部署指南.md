# 📚 Vercel部署指南

## 🚀 快速部署

### 方法一：一键部署（推荐）

1. **Fork项目到您的GitHub**
   - 将项目代码上传到您的GitHub仓库

2. **连接Vercel**
   - 访问 [vercel.com](https://vercel.com)
   - 使用GitHub账号登录
   - 点击 "New Project"
   - 选择您的GitHub仓库

3. **配置环境变量**
   ```bash
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   NODE_ENV=production
   PROJECT_NAME=Smart Phone Number Generator
   ```

4. **部署**
   - 点击 "Deploy" 按钮
   - 等待部署完成（通常1-2分钟）

### 方法二：命令行部署

1. **安装Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **登录Vercel**
   ```bash
   vercel login
   ```

3. **部署项目**
   ```bash
   # 在项目根目录执行
   vercel --prod
   ```

## 🔧 环境变量配置

### 必需的环境变量

| 变量名 | 说明 | 获取方式 |
|--------|------|----------|
| `OPENROUTER_API_KEY` | OpenRouter API密钥 | [获取密钥](https://openrouter.ai/keys) |

### 可选的环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `NODE_ENV` | 运行环境 | `production` |
| `PROJECT_NAME` | 项目名称 | `Smart Phone Number Generator` |
| `KOFI_USERNAME` | Ko-fi用户名 | - |
| `ALLOWED_ORIGINS` | 允许的CORS来源 | `*` |

### 在Vercel中设置环境变量

1. 进入项目仪表板
2. 点击 "Settings" 标签
3. 选择 "Environment Variables"
4. 添加所需的环境变量
5. 重新部署项目

## 📁 项目结构说明

```
├── api/                    # Vercel Functions
│   ├── ai-proxy.js        # AI代理端点
│   └── openrouter.js      # OpenRouter API端点
├── js/                    # 前端JavaScript
├── css/                   # 样式文件
├── index.html             # 主页面
├── vercel.json           # Vercel配置
└── package.json          # 项目配置
```

## 🔍 部署验证

### 检查部署状态

1. **访问主页面**
   - 确保页面正常加载
   - 检查所有功能按钮可用

2. **测试API端点**
   ```bash
   # 测试OpenRouter端点
   curl https://your-project.vercel.app/api/openrouter
   
   # 测试AI代理端点
   curl -X POST https://your-project.vercel.app/api/ai-proxy \
     -H "Content-Type: application/json" \
     -d '{"prompt":"生成5个中国手机号"}'
   ```

3. **测试AI功能**
   - 在AI输入框中输入："生成10个中国手机号"
   - 确保能正确解析并生成号码

## 🛠️ 常见问题

### Q: 部署后AI功能不工作？
**A:** 检查以下项目：
- 确保设置了 `OPENROUTER_API_KEY` 环境变量
- 检查API密钥是否有效
- 查看Vercel Functions日志

### Q: 如何查看部署日志？
**A:** 
1. 进入Vercel项目仪表板
2. 点击 "Functions" 标签
3. 选择具体的函数查看日志

### Q: 如何更新部署？
**A:** 
- **GitHub集成**：推送代码到main分支自动部署
- **手动部署**：运行 `vercel --prod` 命令

### Q: 域名配置
**A:** 
1. 在Vercel项目设置中点击 "Domains"
2. 添加您的自定义域名
3. 按照提示配置DNS记录

## 🔒 安全建议

1. **API密钥安全**
   - 不要在代码中硬编码API密钥
   - 使用Vercel环境变量存储敏感信息

2. **CORS配置**
   - 在生产环境中限制 `ALLOWED_ORIGINS`
   - 避免使用通配符 `*`

3. **访问控制**
   - 考虑添加访问频率限制
   - 监控API使用情况

## 📊 监控和维护

### Vercel Analytics
- 启用Vercel Analytics监控访问量
- 查看性能指标和错误率

### OpenRouter使用监控
- 定期检查API使用量
- 设置使用限制和警报

### 日志监控
- 定期查看Functions日志
- 监控错误和异常情况

## 🎯 优化建议

1. **性能优化**
   - 启用Vercel Edge Functions（如需要）
   - 配置适当的缓存策略

2. **成本控制**
   - 监控Vercel Functions调用次数
   - 设置OpenRouter API使用限制

3. **用户体验**
   - 配置自定义域名
   - 启用HTTPS（Vercel自动提供）

---

## 🆘 需要帮助？

- **Vercel文档**: [vercel.com/docs](https://vercel.com/docs)
- **OpenRouter文档**: [openrouter.ai/docs](https://openrouter.ai/docs)
- **项目Issues**: 在GitHub仓库中提交问题

**祝您部署顺利！** 🎉