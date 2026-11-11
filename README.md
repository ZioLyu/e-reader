# e-reader（Vue3 + Tauri + Rust）

这是一个基于 **Vue 3 + Vite + Tauri + Rust** 的 Windows 桌面 e-reader 项目。

## 一、运行环境要求

请在新电脑上先准备下面这些环境。

### 1. Node.js

建议安装 **Node.js 20 LTS**。

最低要求：
- Node.js 18+

可用命令检查版本：

```powershell
node -v
npm -v
```

如果 `node -v` 显示低于 18，建议先升级 Node。

### 2. Rust

需要安装 Rust Stable Toolchain。

检查命令：

```powershell
rustc --version
cargo --version
```

如果没有安装 Rust，可以使用 `rustup` 安装并切换到 stable：

```powershell

Invoke-WebRequest https://static.rust-lang.org/rustup/rustup-init.exe -OutFile rustup-init.exe

rustup default stable
```

### 3. Windows WebView2 Runtime

Tauri 桌面端依赖 WebView2。

通常 Windows 11 已自带；如果没有，建议安装：

```powershell
winget install Microsoft.EdgeWebView2Runtime
```

### 4. Visual C++ Build Tools

Rust 编译 Windows 桌面程序时，通常还需要 C++ 编译工具。

如果后面编译报错，再安装：

```powershell
winget install Microsoft.VisualStudio.2022.BuildTools
```

安装时勾选：
- Desktop development with C++
- Windows 10/11 SDK

---

## 二、项目依赖

本项目前端依赖：

- `vue`
- `vite`
- `@vitejs/plugin-vue`
- `typescript`
- `vue-tsc`
- `@tauri-apps/api`
- `@tauri-apps/cli`

Rust 端依赖：

- `tauri`
- `tauri-build`
- `tauri-plugin-dialog`
- `serde`
- `serde_json`

---

## 三、首次安装步骤

假设项目目录是：

```powershell
D:\e-reader
```

### 1. 进入项目目录

```powershell
cd "D:\read"
```

### 2. 安装前端依赖

```powershell
npm install
```

### 3. 如果之前装过旧依赖，建议先清理再装

如果 `node_modules` 或 `package-lock.json` 之前已经生成过，但环境升级过，可以执行：

```powershell
rmdir /s /q node_modules
del package-lock.json
npm install
```

---

## 四、启动方式

本项目建议使用 **两个终端窗口** 启动。

### 方式 A：先启动前端，再启动桌面端

#### 窗口 1：启动前端开发服务

```powershell
cd "D:\read"
npm run dev
```

如果启动成功，你会看到类似：

```text
VITE v4.x.x ready in ...
Local: http://localhost:5173/
```

#### 窗口 2：启动 Tauri 桌面端

```powershell
cd "D:\read"
npm run tauri:dev
```

如果环境和配置正常，会弹出桌面阅读器窗口。

---

## 五、如何使用阅读器

启动成功后：

1. 点击 **打开 TXT**
2. 选择本地 `.txt` 小说文件
3. 程序会尝试自动识别章节标题
4. 左侧会显示目录
5. 点击章节即可切换阅读

---

## 六、常见问题

### 1. `npm run dev` 启动失败

先检查 Node 版本：

```powershell
node -v
```

建议至少是 Node 18，最好是 Node 20。

如果版本太低，请升级 Node 后重新执行：

```powershell
npm install
npm run dev
```

---

### 2. `npm install` 报依赖冲突

通常是旧的 `package-lock.json` 或 `node_modules` 引起的。

先清理再装：

```powershell
rmdir /s /q node_modules
del package-lock.json
npm install
```

---

### 3. `npm run tauri:dev` 一直等待前端

请确认：

- `npm run dev` 的窗口没有关闭
- 前端端口是 `5173`
- 另一个窗口里再执行 `npm run tauri:dev`

建议按顺序执行：

```powershell
# 窗口 1
cd "D:\read"
npm run dev

# 窗口 2
cd "D:\read"
npm run tauri:dev
```

---

### 4. 打开 TXT 后出现乱码

这通常是 TXT 文件编码问题。

建议优先使用：
- UTF-8
- GB18030
- UTF-16

如果还是乱码，可以把文件发给开发者进一步适配编码识别。

---

## 七、项目结构

```text
e-reader/
├── src/
│   ├── App.vue                 # 编排层：组合组件与组合式逻辑，处理拖拽打开
│   ├── main.ts                 # 入口
│   ├── styles.css              # 全局样式
│   ├── components/             # 展示组件（只负责渲染与事件）
│   │   ├── AppSidebar.vue      # 左侧书架与章节目录
│   │   ├── ReaderToolbar.vue   # 工具栏：打开 TXT / 自动滚动 / 关闭书籍
│   │   ├── ReaderCanvas.vue    # 正文阅读区与上一章/下一章
│   │   └── DropOverlay.vue     # 拖拽文件遮罩
│   ├── composables/            # 组合式逻辑（状态与副作用）
│   │   ├── useBookFile.ts      # 打开、校验、解码、解析章节
│   │   ├── useReadingPosition.ts  # 阅读进度持久化（localStorage）
│   │   └── useAutoScroll.ts    # 自动滚动引擎
│   └── utils/                  # 纯函数与共享类型（可直接单测）
│       ├── chapterParser.ts    # 章节识别与正文截取
│       ├── textDecoder.ts      # TXT 编码探测（BOM / UTF-8 / GB18030）
│       ├── file.ts             # 文件校验与书籍指纹
│       └── types.ts            # 共享类型
├── tests/                      # 单元测试（vitest）
├── src-tauri/                  # Tauri（Rust）桌面壳
├── vite.config.ts              # 前端构建 / 开发配置
├── vitest.config.ts            # 测试配置
└── tsconfig*.json              # TypeScript 工程配置
```

分层约定：`components` 只做展示与事件上抛，`composables` 管状态与副作用，`utils` 保持纯函数、可直接被单元测试覆盖。

---

## 八、开发脚本

```powershell
npm run dev
```

启动前端开发服务。

```powershell
npm run tauri:dev
```

启动桌面端开发模式。

```powershell
npm run build
```

构建前端产物。

```powershell
npm run test
```

运行单元测试（vitest），覆盖章节识别与正文截取逻辑。

---

## 九、推荐的新电脑启动流程

如果你在一台新电脑上第一次跑这个项目，建议按这个顺序：

1. 安装 Node.js 20
2. 安装 Rust stable
3. 安装 WebView2 Runtime
4. 安装 Visual C++ Build Tools（如有需要）
5. 进入项目目录
6. 执行 `npm install`
7. 执行 `npm run dev`
8. 另开窗口执行 `npm run tauri:dev`

---

## 十、项目定位

当前项目是一个 **e-reader 骨架**，后续可以继续完善：

- 最近阅读
- 阅读进度保存
- 字体大小调节
- 夜间模式
- 书签
- 拖拽打开 TXT
- 本地书架管理

---

