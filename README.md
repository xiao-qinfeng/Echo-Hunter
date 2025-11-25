# Echo-Hunter (原 Cognitive Genome)

一个由 AI 驱动的认知基因组分析工具，用于捕捉、分析和可视化你的思维碎片。

## 🎯 项目简介

Echo-Hunter 是一个创新的思维分析应用，它通过连接多个 AI 提供商来深度分析你的思绪，识别认知模式，并以美观的可视化方式呈现思维结构。

### 核心功能

- 🔗 **多 AI 提供商支持**：Kimi、Gemini、OpenAI、DeepSeek、Claude、智谱、通义千问
- 🧠 **认知模式识别**：自动识别观察、悖论、感官三种思维模式
- 🎨 **交互式 3D 神经网络可视化**：使用 D3.js 构建的思维拓扑图
- 💾 **本地持久化**：所有思维和配置自动保存到浏览器
- 🌐 **双语支持**：中英文界面无缝切换
- 📊 **思维光谱分析**：雷达图展示思维特征分布
- 🎭 **风格指纹追踪**：识别个人思维风格的独特性

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式运行

```bash
npm run dev
```

在浏览器中打开 `http://localhost:5173/`（或显示的端口号）

### 构建生产版本

```bash
npm run build
```

## ⚙️ 配置

### 1. 配置 API 密钥

创建 `.env.local` 文件：

```bash
cp .env.example .env.local
```

编辑 `.env.local`，填入你的 API 密钥：

```env
# Moonshot AI (Kimi)
VITE_KIMI_API_KEY=sk-xxxxxx

# Google Gemini
VITE_GEMINI_API_KEY=your_gemini_key

# OpenAI
VITE_OPENAI_API_KEY=sk-xxxxxx

# DeepSeek
VITE_DEEPSEEK_API_KEY=sk-xxxxxx

# Anthropic Claude
VITE_CLAUDE_API_KEY=sk-ant-xxxxxx

# Zhipu (智谱清言)
VITE_ZHIPU_API_KEY=your_zhipu_key

# Alibaba Qwen
VITE_QWEN_API_KEY=sk-xxxxxx
```

### 2. 应用内配置

1. 点击右上角的 Settings 按钮
2. 选择 AI 提供商（系统会自动加载对应的环境变量密钥）
3. 选择或添加自定义模型
4. 点击 Save Connection
5. 刷新页面后配置自动恢复

## 🛠️ 技术栈

- **前端框架**：React 19.0 + TypeScript 5.9
- **构建工具**：Vite 7.2.5 (Rolldown)
- **样式**：Tailwind CSS 3.4
- **可视化**：D3.js 7.9 + Recharts 3.5
- **图标**：Lucide React 0.554
- **截图**：html2canvas 1.4

## 📁 项目结构

```
Echo-Hunter/
├── src/
│   ├── components/          # React 组件
│   │   ├── QuantumInput.tsx    # 输入框组件
│   │   ├── NeuroGarden.tsx     # 3D 思维可视化
│   │   ├── SpectraMap.tsx      # 雷达图分析
│   │   ├── CognitiveLog.tsx    # 思维日志
│   │   ├── ShareModal.tsx      # 分享模态框
│   │   ├── PhilosophyGuide.tsx # 使用指南
│   │   └── SystemStatus.tsx    # 系统状态
│   ├── services/
│   │   └── geminiService.ts    # AI 服务接口
│   ├── types.ts             # TypeScript 类型定义
│   ├── App.tsx              # 主应用组件
│   └── index.tsx            # 入口文件
├── public/                  # 静态资源
├── .env.local               # API 密钥配置（不提交）
├── index.html               # HTML 模板
├── package.json             # 依赖配置
├── tsconfig.json            # TypeScript 配置
├── vite.config.ts           # Vite 配置
└── tailwind.config.js       # Tailwind 配置
```

## 🧠 认知模式说明

应用识别三种认知模式：

### 1. OBSERVATION（观察/锚点）
- **特征**：客观细节、物理描述、事实记录
- **示例**：「天空是蓝色的，温度是25度」
- **颜色代码**：青色

### 2. PARADOX（悖论/思辨）
- **特征**：矛盾、反直觉、逻辑冲突
- **示例**：「最亮的时刻也是最黑暗的时刻」
- **颜色代码**：紫色

### 3. SENSORY（感官/解码）
- **特征**：感官体验（颜色、气味、触感）
- **示例**：「咖啡的香气像温暖的拥抱」
- **颜色代码**：玫瑰色

## 🔐 数据安全

- 🔑 API 密钥存储在 `.env.local`，不会被提交到 Git
- 💾 所有思维和配置保存在浏览器 localStorage
- 📤 数据导出为 JSON 格式，可随时备份
- 🔒 支持自动保存（每30秒）

## 📱 PWA 支持（Progressive Web App）

Cognitive Genome 现在支持 PWA，可以像原生应用一样安装在您的设备上！

### 安装方法

#### Android 设备
1. 在 Chrome 或 Edge 浏览器中打开应用
2. 点击地址栏右侧的「安装应用」或「添加到主屏幕」按钮
3. 确认安装，应用将出现在主屏幕上

#### iOS 设备
1. 在 Safari 中打开应用
2. 点击分享按钮（方框带向上箭头）
3. 选择「添加到主屏幕」
4. 确认添加

#### 桌面端
**Chrome/Edge:**
1. 点击地址栏右侧的安装图标
2. 选择「安装」

**Safari (macOS):**
1. 点击地址栏右侧的分享按钮
2. 选择「添加到程序坞」

### PWA 优势

- 📲 **类原生体验**：全屏运行，无浏览器地址栏
- ⚡ **快速启动**：缓存资源，离线可用
- 🔋 **资源优化**：比浏览器标签页更省电
- 🎯 **独立运行**：像原生应用一样切换
- 💾 **数据持久化**：localStorage 数据自动保存（思维数据、API 配置等）
- 🔄 **自动更新**：应用更新时自动同步

### Service Worker 缓存策略

PWA 使用以下缓存策略确保最佳性能：

- **App Shell**: 所有 JS、CSS、HTML 文件被缓存，实现秒开
- **Google Fonts**: 字体文件长期缓存（365天）
- **思维数据**: 存储在 localStorage，自动持久化
- **实时更新**: 应用更新时 service worker 自动更新

### 离线支持

- ✅ 应用界面可离线访问
- ✅ 已缓存的字体和样式可用
- ✅ localStorage 中的思维数据完全可用
- ⚠️ AI 分析功能需要网络连接

### 数据同步建议

由于思维数据存储在 localStorage：

1. **定期导出**：建议定期导出 JSON 备份（Settings > Export Data）
2. **多端同步**：在不同设备使用时，需要手动导出/导入数据
3. **清理缓存**：如需清理浏览器数据，请先导出备份
4. **PWA 与浏览器**：PWA 和浏览器标签页共享同一 localStorage 数据

### 卸载 PWA

**Android:** 长按图标 > 卸载
**iOS:** 长按图标 > 删除书签
**桌面:** 右键图标 > 卸载/移除

## 🌟 使用技巧

1. **添加自定义模型**：在 Settings 中输入模型名称并点击 + 号
2. **导出思维数据**：点击 Settings 中的 Export Data
3. **切换视图模式**：使用顶部的 Topography/Archive 切换按钮
4. **查看系统状态**：点击左上角的 DNA 图标
5. **全屏神经花园**：点击 NeuroGarden 右上角的 fullscreen 图标

## 🚀 高级功能

### 自定义模型支持

在 Settings 中添加自定义模型（如 `kimi-k2-thinking`）：

```typescript
// 在 .env.local 中添加
VITE_DEFAULT_MODEL=kimi-k2-thinking
```

### 自定义 API 地址

在 Settings 中修改 Base URL 以使用代理或自定义端点：

```env
# 示例：使用 OpenAI 兼容的代理
VITE_OPENAI_API_KEY=your_key
# 然后设置 Base URL: https://your-proxy.com/v1
```

## 🐛 故障排除

### 问题：找不到 root 元素
**解决**：确保 `index.html` 中有 `<div id="root"></div>`

### 问题：process is not defined
**解决**：使用 `import.meta.env` 替代 `process.env`

### 问题：API 请求 404
**解决**：检查 Base URL 格式是否正确（参考配置章节）

### 问题：TypeScript 类型错误
**解决**：确保所有枚举类型正确导入，import type 用于类型

### 问题：端口被占用
**解决**：Vite 会自动使用下一个可用端口（5174、5175等）

## 📄 许可证

MIT License - 自由使用、修改和分发

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 🙏 致谢

- 灵感来源于 Douglas Hofstadter 的思维理论
- 使用 Claude Code 辅助开发
- 感谢各大 AI 提供商的 API 支持

## 🤝 参与贡献

欢迎提交 Issue 和 Pull Request！

- 📫 **提交 Issue**: 发现 Bug 或有功能建议？欢迎 [提交 Issue](https://github.com/xiao-qinfeng/Echo-Hunter/issues)
- 💡 **功能建议**: 有好的想法？我们很乐意听听你的想法
- 🐛 **Bug 报告**: 遇到问题？请详细描述，我们会尽快修复
- 🔧 **代码贡献**: 欢迎 Fork 项目并提交 PR

## 🌐 关于作者

- 🐙 **GitHub Profile**: [@xiao-qinfeng](https://github.com/xiao-qinfeng)
- 💼 **项目主页**: [Echo-Hunter GitHub](https://github.com/xiao-qinfeng/Echo-Hunter)
- 📧 **联系邮箱**: xiaoqf776@163.com

欢迎通过 GitHub Issues 或邮件与我联系！

---

**版本**：1.0.0
**最后更新**：2025年11月26日
**作者**：xiaoqinfeng

