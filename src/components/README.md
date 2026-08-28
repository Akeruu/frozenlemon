# Components (渐进迁移目录)

本目录用于逐步迁移站点为组件化结构，不一次性重构。

当前阶段：
- 运行中的可复用片段在 `components/`（用于兼容现有静态页面）。
- 后续新增页面优先把头部、导航、卡片等放入 `src/components/`，再通过构建接入。

建议下一步：
1. 将 `components/subpage-header.html` 迁移为 `src/components/site-header.html`
2. 将内容卡片（如 blog/photo/meme item）拆为组件模板
3. 引入简单数据文件（JSON）驱动列表渲染，减少手写重复 HTML
