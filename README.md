# New-Site

速冻柠檬个人站点（静态站，已接入渐进式工程化改造）。

## 本地开发

```bash
npm install
npm run dev
```

- 开发地址：`http://127.0.0.1:5173/frozenlemon/`
- 预览构建：`npm run preview`

## 构建与发布

```bash
npm run build
```

- 构建产物目录：`dist/`
- Vite 会为打包资源生成 hash 文件名（更友好的缓存策略）
- 构建脚本会同步复制运行时所需的内容数据、公共片段、文章与媒体资源
- 同时生成 gzip 压缩资源（`*.gz`）

## 当前结构（渐进迁移）

- 运行中的页面：根目录 + `blog/` `photo/` `meme/` `podcast/` `about me/`
- 公共片段：`components/`（头部导航、页脚）
- 片段加载器：`scripts/includes.js`
- 新结构骨架：`src/components/`、`src/pages/`
- 无后缀路由：`/podcast/` `/photo/` `/meme/` `/blog/` `/about/` `/archive/`

## SEO 基础文件

- `robots.txt`
- `sitemap.xml`

## 内容更新工作流（推荐）

你后续更新时，优先只改这个文件：

- `data/content.json`

支持字段：

- `photos[]`：`title` `date` `image`
- `memes[]`：`title` `date` `image`
- `blogs[]`：`title` `date` `cover` `href` `tags`

改完后：

```bash
npm run dev
```

访问：

- 首页：`/`
- 时间线归档：`/archive/`

说明：

- 首页、影像、涂鸦、博客列表和归档页会自动读取 `content.json` 渲染。
- 文章页支持阅读进度条和目录锚点。
- 图片预览支持左右切换（键盘方向键也可用）。
