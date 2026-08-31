# Frozen Lemon

速冻柠檬个人站点。页面由 Vite 构建，列表内容统一由 `data/content.json` 驱动。

## 本地开发

```bash
npm install
npm run dev
```

- 开发地址：`http://127.0.0.1:5173/frozenlemon/`
- 生产预览：先运行 `npm run build`，再运行 `npm run preview`

## 构建

```bash
npm run build
```

- 构建产物：`dist/`
- Vite 为资源生成 hash 文件名，并生成 gzip 压缩文件
- 构建脚本会复制内容数据、公共片段和媒体资源

## 目录结构

- `data/content.json`：照片、涂鸦、博客和播客列表
- `blog/<slug>/index.html`：文章正文，每篇文章只有一个规范页面
- `image/`：照片
- `image/meme/`：涂鸦
- `image/blog/`：文章封面
- `components/`：公共导航和页脚
- `styles/`：全站、列表和文章样式
- `scripts/`：内容渲染与交互

## 更新照片或涂鸦

把 WebP 图片放入对应目录，再在 `data/content.json` 的对应数组中添加一项。网站会按照 `date` 自动倒序排列，新内容始终显示在前面；同一天的内容保持 JSON 中的先后顺序。支持字段：

- `photos[]`：`title` `date` `image`
- `memes[]`：`title` `date` `image`
- `blogs[]`：`title` `date` `cover` `href` `excerpt` `tags`
- `podcasts[]`：`title` `date` `duration` `description` `enclosure`

## 新增文章

1. 将封面放入 `image/blog/`
2. 复制一个现有的 `blog/<slug>/index.html` 作为文章模板
3. 在 `data/content.json` 的 `blogs` 中登记文章（页面会按日期自动排序）
4. 在 `vite.config.mjs` 的 `rollupOptions.input` 登记页面入口
5. 在 `sitemap.xml` 添加正式网址

完成后运行：

```bash
npm run dev
npm run build
```

首页、影像、涂鸦、博客和归档会自动读取 `content.json`。文章页自动生成面包屑、阅读进度和目录；图片预览支持键盘方向键切换。
