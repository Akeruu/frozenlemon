applyPreferredTheme();
document.addEventListener("site:includes-loaded", initThemeToggle);

document.addEventListener("DOMContentLoaded", async () => {
  ensureFavicon();
  initThemeToggle();
  await initDataDrivenContent();
  initBlogTagFilter();
  initSidebarTagQuickJump();
  initHomeSectionIndicator();
  await initArchivePage();
  initPodcastSection();
  initArticleEnhancements();
  optimizeImages();
  hardenExternalLinks();
  initScrollToTopButton();
  initImageModal();
  initRevealAnimations();
});

let contentCache = null;
const HIDDEN_MEME_TITLES = new Set([
  "波波票务",
  "荔湾嫌疑人",
  "秋菊打官司2",
  "猫猫赛博墓碑"
]);

function getVisibleMemes(items) {
  return items.filter((item) => !HIDDEN_MEME_TITLES.has(item.title));
}

function getSiteBasePath() {
  const path = window.location.pathname;
  const marker = "/frozenlemon/";
  return path.includes(marker) ? marker : "/";
}

function withBase(relativePath) {
  const base = getSiteBasePath();
  const normalized = relativePath.startsWith("/") ? relativePath.slice(1) : relativePath;
  return base + normalized;
}

function ensureFavicon() {
  const expectedHref = withBase("image/潜在意识Logo.webp");
  let icon = document.querySelector('link[rel="icon"]');
  if (!icon) {
    icon = document.createElement("link");
    icon.setAttribute("rel", "icon");
    document.head.appendChild(icon);
  }
  icon.setAttribute("type", "image/webp");
  icon.setAttribute("href", expectedHref);
}

async function loadContentData() {
  if (contentCache) return contentCache;
  const response = await fetch(withBase("data/content.json"));
  if (!response.ok) {
    throw new Error("Failed to load content.json");
  }
  contentCache = await response.json();
  return contentCache;
}

async function initDataDrivenContent() {
  const sources = document.querySelectorAll("[data-content-source]");
  if (!sources.length) return;

  try {
    const data = await loadContentData();
    sources.forEach((node) => {
      const source = node.getAttribute("data-content-source");
      if (source === "photos") {
        renderPhotoItems(node, data.photos || []);
      } else if (source === "memes") {
        renderMemeItems(node, getVisibleMemes(data.memes || []));
      } else if (source === "blogs") {
        renderBlogItems(node, data.blogs || []);
      }
    });
  } catch (error) {
    sources.forEach((node) => {
      node.innerHTML = '<p class="content-error">内容暂时无法加载，请稍后刷新重试。</p>';
    });
    console.error("Failed to initialize data-driven content:", error);
  }
}

function renderPhotoItems(container, items) {
  container.innerHTML = "";
  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "photo-item";
    card.innerHTML = `
      <img src="${withBase(item.image)}" alt="${escapeHtml(item.title)}" />
      <div class="photo-info">
        <span class="photo-title">${escapeHtml(item.title)}</span>
        <span class="date">${escapeHtml(item.date)}</span>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderMemeItems(container, items) {
  container.innerHTML = "";
  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "meme-item";
    card.innerHTML = `
      <img src="${withBase(item.image)}" alt="${escapeHtml(item.title)}" />
      <div class="meme-info">
        <span class="meme-title">${escapeHtml(item.title)}</span>
        <span class="date">${escapeHtml(item.date)}</span>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderBlogItems(section, items) {
  section.querySelectorAll(".blog-item").forEach((item) => item.remove());

  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "blog-item";
    const articleHref = withBase(item.href);
    card.innerHTML = `
      <a class="blog-cover-wrapper blog-cover-link" href="${articleHref}" aria-label="阅读文章：${escapeHtml(item.title)}">
        <img src="${withBase(item.cover)}" class="blog-cover" alt="${escapeHtml(item.title)}封面" />
      </a>
      <div class="blog-content">
        <h4>
          <a href="${articleHref}">${escapeHtml(item.title)}</a>
        </h4>
        <div class="blog-info">
          <div class="tags">
            ${item.tags
              .map(
                (tag) =>
                  `<button type="button" class="tag" data-card-filter="${escapeHtml(tag)}" aria-label="筛选标签：${escapeHtml(tag)}">${escapeHtml(tag)}</button>`
              )
              .join("")}
          </div>
          <span class="date">${escapeHtml(item.date)}</span>
        </div>
      </div>
    `;
    section.appendChild(card);
  });
}

function getPreferredTheme() {
  let storedTheme = null;
  try {
    storedTheme = localStorage.getItem("theme");
  } catch (error) {
    console.warn("Theme preference is unavailable:", error);
  }

  if (storedTheme === "dark" || storedTheme === "light") {
    return storedTheme;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyPreferredTheme() {
  const theme = getPreferredTheme();
  document.documentElement.classList.toggle("dark-theme", theme === "dark");
  document.documentElement.style.colorScheme = theme;
  return theme;
}

function applyTheme(theme) {
  const isDark = theme === "dark";
  document.documentElement.classList.toggle("dark-theme", isDark);
  document.documentElement.style.colorScheme = theme;
  document
    .querySelectorAll("[data-theme-toggle]")
    .forEach((toggle) => (toggle.checked = isDark));

  try {
    localStorage.setItem("theme", theme);
  } catch (error) {
    console.warn("Theme preference could not be saved:", error);
  }
}

function initThemeToggle() {
  const theme = applyPreferredTheme();
  document.querySelectorAll("[data-theme-toggle]").forEach((themeToggle) => {
    themeToggle.checked = theme === "dark";
    if (themeToggle.dataset.themeBound === "true") return;

    themeToggle.dataset.themeBound = "true";
    themeToggle.addEventListener("change", () => {
      applyTheme(themeToggle.checked ? "dark" : "light");
    });
  });
}

function optimizeImages() {
  const images = Array.from(document.querySelectorAll("main img"));
  images.forEach((img, index) => {
    const highPriority = index < 2;
    img.loading = highPriority ? "eager" : "lazy";
    img.decoding = "async";
    img.setAttribute("fetchpriority", highPriority ? "high" : "low");
  });
}

function hardenExternalLinks() {
  document.querySelectorAll('a[target="_blank"]').forEach((link) => {
    const rel = new Set((link.getAttribute("rel") || "").split(/\s+/).filter(Boolean));
    rel.add("noopener");
    rel.add("noreferrer");
    link.setAttribute("rel", Array.from(rel).join(" "));
  });
}

function initSidebarTagQuickJump() {
  const sidebarTags = document.querySelectorAll(".tags-part .tag[data-filter-tag]");
  const blogSection = document.querySelector(".blogs-section");
  if (!sidebarTags.length || !blogSection) return;

  sidebarTags.forEach((tag) => {
    tag.addEventListener("click", (event) => {
      event.preventDefault();
      const filterTag = tag.getAttribute("data-filter-tag") || "all";
      if (typeof window.applyBlogFilter === "function") {
        window.applyBlogFilter(filterTag);
      }
      blogSection.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function initHomeSectionIndicator() {
  const side = document.querySelector(".side");
  const links = Array.from(document.querySelectorAll("[data-section-link]"));
  if (!side || !links.length) return;

  const sections = ["podcast", "photos", "meme", "blogs"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  if (!sections.length) return;

  let lastSectionId = "";
  const syncActive = (sectionId) => {
    if (sectionId === lastSectionId) return;
    lastSectionId = sectionId;
    side.classList.remove(
      "section-podcast",
      "section-photos",
      "section-meme",
      "section-blogs"
    );
    side.classList.add(`section-${sectionId}`);

    links.forEach((link) => {
      const isActive = link.getAttribute("data-section-link") === sectionId;
      link.classList.toggle("is-current", isActive);
    });
  };

  let ticking = false;
  const detectCurrentSection = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const markerLine = window.innerHeight * 0.32;
      let current = sections[0];
      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= markerLine) current = section;
      }
      if (current?.id) syncActive(current.id);
      ticking = false;
    });
  };

  window.addEventListener("scroll", detectCurrentSection, { passive: true });
  window.addEventListener("resize", detectCurrentSection);
  detectCurrentSection();
}

function initScrollToTopButton() {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "scroll-to-top";
  button.setAttribute("aria-label", "回到顶部");
  button.textContent = "↑";
  document.body.appendChild(button);

  const toggleVisibility = () => {
    button.classList.toggle("visible", window.scrollY > 360);
  };

  button.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.addEventListener("scroll", toggleVisibility, { passive: true });
  toggleVisibility();
}

function initImageModal() {
  const images = Array.from(
    document.querySelectorAll(
      ".photo-item img, .meme-item img, .article-main .blog-cover, .article-main .blog-main-cover"
    )
  );
  if (!images.length) return;

  const modal = document.createElement("div");
  modal.className = "image-modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-label", "图片预览");
  modal.setAttribute("aria-hidden", "true");
  modal.innerHTML = `
    <button type="button" class="image-modal-nav prev" aria-label="上一张">‹</button>
    <button type="button" class="image-modal-nav next" aria-label="下一张">›</button>
    <button type="button" class="image-modal-close" aria-label="关闭预览">×</button>
    <img class="image-modal-content" alt="" />
    <p class="image-modal-caption"></p>
  `;
  document.body.appendChild(modal);

  const modalImage = modal.querySelector(".image-modal-content");
  const modalCaption = modal.querySelector(".image-modal-caption");
  const closeButton = modal.querySelector(".image-modal-close");
  const prevButton = modal.querySelector(".image-modal-nav.prev");
  const nextButton = modal.querySelector(".image-modal-nav.next");
  let currentIndex = 0;
  let previouslyFocused = null;

  const renderByIndex = (index) => {
    const safeIndex = (index + images.length) % images.length;
    currentIndex = safeIndex;
    const img = images[safeIndex];
    modalImage.src = img.currentSrc || img.src;
    modalImage.alt = img.alt || "图片预览";
    modalCaption.textContent = img.alt || `${safeIndex + 1} / ${images.length}`;
  };

  const closeModal = () => {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    previouslyFocused?.focus();
  };

  images.forEach((img, index) => {
    img.style.cursor = "zoom-in";
    img.tabIndex = 0;
    img.setAttribute("role", "button");
    img.setAttribute("aria-label", `预览图片：${img.alt || index + 1}`);

    const openModal = () => {
      previouslyFocused = document.activeElement;
      renderByIndex(index);
      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
      closeButton.focus();
    };

    img.addEventListener("click", openModal);
    img.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openModal();
      }
    });
  });

  prevButton.addEventListener("click", () => renderByIndex(currentIndex - 1));
  nextButton.addEventListener("click", () => renderByIndex(currentIndex + 1));
  closeButton.addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener("keydown", (event) => {
    if (!modal.classList.contains("open")) return;
    if (event.key === "Escape") {
      closeModal();
    } else if (event.key === "ArrowLeft") {
      renderByIndex(currentIndex - 1);
    } else if (event.key === "ArrowRight") {
      renderByIndex(currentIndex + 1);
    }
  });
}

function initBlogTagFilter() {
  const blogSection = document.querySelector(".blogs-section");
  if (!blogSection) return;

  let blogItems = Array.from(blogSection.querySelectorAll(".blog-item"));
  if (!blogItems.length) return;

  const allTags = new Set();
  blogItems.forEach((item) => {
    const tags = Array.from(item.querySelectorAll(".blog-info .tag")).map((tag) =>
      tag.textContent.trim()
    );
    item.dataset.tags = tags.join("|");
    tags.forEach((tag) => allTags.add(tag));
  });

  if (!allTags.size) return;

  const toolbar = document.createElement("div");
  toolbar.className = "blog-filter-bar";
  toolbar.innerHTML = `<span class="filter-title">按标签筛选：</span>`;

  const createButton = (label, value) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "filter-chip";
    button.textContent = label;
    button.dataset.filterValue = value;
    return button;
  };

  toolbar.appendChild(createButton("全部", "all"));
  Array.from(allTags)
    .sort((a, b) => a.localeCompare(b, "zh-CN"))
    .forEach((tag) => toolbar.appendChild(createButton(tag, tag)));

  const title = blogSection.querySelector(".section-title");
  if (title) title.insertAdjacentElement("afterend", toolbar);

  const applyFilter = (value) => {
    blogItems.forEach((item) => {
      const tags = (item.dataset.tags || "").split("|").filter(Boolean);
      const isVisible = value === "all" || tags.includes(value);
      item.classList.toggle("content-hidden", !isVisible);
    });
    toolbar.querySelectorAll(".filter-chip").forEach((chip) => {
      chip.classList.toggle("active", chip.dataset.filterValue === value);
    });
  };

  toolbar.addEventListener("click", (event) => {
    const target = event.target.closest(".filter-chip");
    if (!target) return;
    applyFilter(target.dataset.filterValue || "all");
  });

  blogSection.addEventListener("click", (event) => {
    const tag = event.target.closest("[data-card-filter]");
    if (!tag) return;
    applyFilter(tag.dataset.cardFilter || "all");
    toolbar.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  window.applyBlogFilter = (value) => {
    blogItems = Array.from(blogSection.querySelectorAll(".blog-item"));
    blogItems.forEach((item) => {
      const tags = Array.from(item.querySelectorAll(".blog-info .tag")).map(
        (tag) => tag.textContent.trim()
      );
      item.dataset.tags = tags.join("|");
    });
    applyFilter(value);
  };
  applyFilter("all");
}

function initRevealAnimations() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!("IntersectionObserver" in window)) return;

  const revealTargets = document.querySelectorAll(
    ".blog-item, .photo-item, .meme-item, .episode"
  );
  if (!revealTargets.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.04, rootMargin: "0px 0px -4% 0px" }
  );

  revealTargets.forEach((el) => {
    el.classList.add("reveal-item");
    observer.observe(el);
  });
}

async function initPodcastSection() {
  const container = document.querySelector(".podcast-episodes");
  if (!container) return;

  const rssUrl = "https://www.ximalaya.com/album/72549254.xml";
  await renderPodcastFallback(container);

  try {
    const xml = await fetchWithTimeout(rssUrl, 5000);
    const items = parsePodcastItems(xml).slice(0, 40);

    if (!items.length) {
      return;
    }
    if (container.dataset.playbackStarted !== "true") {
      renderPlayablePodcastItems(container, items);
    }
  } catch (error) {
    console.warn("Podcast RSS unavailable; keeping local content:", error);
  }
}

function renderPlayablePodcastItems(container, items) {
  container.innerHTML = "";
  delete container.dataset.playbackStarted;

  let activeAudio = null;
  let activeButton = null;
  let activeProgressContainer = null;
  const renderedEpisodes = [];

  const resetActivePlayer = () => {
    if (activeButton) {
      activeButton.classList.remove("playing", "loading");
      activeButton.innerHTML = "&#9658;";
      activeButton.setAttribute("aria-label", "播放或暂停音频");
      activeButton.setAttribute("aria-pressed", "false");
    }
    if (activeProgressContainer) {
      activeProgressContainer.style.display = "none";
    }
  };

  items.forEach((item) => {
    const { episodeDiv, audio, playButton, progressBarContainer } =
      createEpisodeNode(item);
    let isLoading = false;

    const togglePlay = async () => {
      if (isLoading) return;
      container.dataset.playbackStarted = "true";
      if (activeAudio && activeAudio !== audio) {
        activeAudio.pause();
        resetActivePlayer();
      }

      if (audio.paused) {
        isLoading = true;
        activeAudio = audio;
        activeButton = playButton;
        activeProgressContainer = progressBarContainer;
        playButton.classList.add("loading");
        playButton.innerHTML = "…";
        playButton.setAttribute("aria-label", "正在加载音频");
        progressBarContainer.style.display = "block";
        try {
          await audio.play();
          isLoading = false;
          playButton.classList.remove("loading");
          playButton.classList.add("playing");
          playButton.innerHTML = "&#10074;&#10074;";
          playButton.setAttribute("aria-label", "暂停音频");
          playButton.setAttribute("aria-pressed", "true");
        } catch (error) {
          isLoading = false;
          playButton.classList.remove("loading");
          resetActivePlayer();
          playButton.setAttribute("aria-label", "播放失败，请稍后重试");
          activeAudio = null;
          activeButton = null;
          activeProgressContainer = null;
          console.warn("Podcast audio could not start:", error);
        }
      } else {
        audio.pause();
        resetActivePlayer();
        activeAudio = null;
        activeButton = null;
        activeProgressContainer = null;
      }
    };

    playButton.addEventListener("click", togglePlay);
    episodeDiv.querySelector(".title").addEventListener("click", (event) => {
      event.preventDefault();
      togglePlay();
    });

    audio.addEventListener("ended", () => {
      resetActivePlayer();
      activeAudio = null;
      activeButton = null;
      activeProgressContainer = null;
    });

    renderedEpisodes.push(episodeDiv);
    container.appendChild(episodeDiv);
  });

  const isPodcastDetailPage = window.location.pathname.includes("/podcast/");
  initPodcastExpandCollapse(
    container,
    renderedEpisodes,
    isPodcastDetailPage ? 10 : 3
  );
}

async function renderPodcastFallback(container) {
  try {
    const data = await loadContentData();
    const fallbackItems = data.podcasts || [];
    if (!fallbackItems.length) {
      container.innerHTML =
        '<p class="podcast-loading">播客加载失败，请稍后重试。</p>';
      return;
    }

    const playableItems = fallbackItems
      .filter((item) => item.enclosure)
      .map((item) => ({
        title: item.title,
        pubDate: item.date,
        duration: item.duration || "",
        enclosure: item.enclosure,
        descriptionText: item.description || ""
      }));

    if (playableItems.length) {
      renderPlayablePodcastItems(container, playableItems);
      return;
    }

    container.innerHTML = "";
    const renderedEpisodes = [];
    fallbackItems.forEach((item) => {
      const card = document.createElement("article");
      card.className = "episode fallback";
      card.innerHTML = `
        <div class="date-duration">
          <p class="date">${escapeHtml(item.date || "")}</p>
          <p class="duration">${escapeHtml(item.duration || "")}</p>
        </div>
        <div class="title-play">
          <a class="play-button fallback-listen" href="${escapeHtml(item.link || withBase("podcast/"))}" target="_blank" rel="noopener noreferrer" aria-label="前往收听：${escapeHtml(item.title)}">&#9658;</a>
          <a class="title" href="${escapeHtml(item.link || withBase("podcast/"))}" target="_blank" rel="noopener noreferrer">
            ${escapeHtml(item.title)}
          </a>
        </div>
        <p class="description">${escapeHtml(item.description || "前往收听完整节目内容。")}</p>
      `;
      renderedEpisodes.push(card);
      container.appendChild(card);
    });

    const isPodcastDetailPage = window.location.pathname.includes("/podcast/");
    initPodcastExpandCollapse(
      container,
      renderedEpisodes,
      isPodcastDetailPage ? 10 : 3
    );
  } catch (error) {
    container.innerHTML =
      '<p class="podcast-loading">播客加载失败，请稍后重试。</p>';
    console.error("Podcast fallback failed:", error);
  }
}

async function initArchivePage() {
  const timeline = document.querySelector("[data-archive-timeline]");
  const topicSelect = document.getElementById("archive-topic");
  if (!timeline || !topicSelect) return;

  try {
    const data = await loadContentData();
    const blogs = (data.blogs || []).map((blog) => ({
      title: blog.title,
      date: blog.date,
      dateObj: new Date(blog.date),
      href: blog.href,
      tags: [...(blog.tags || []), "文章"],
      type: "文章"
    }));
    const photos = (data.photos || []).map((photo) => ({
      title: photo.title,
      date: photo.date,
      dateObj: new Date(photo.date),
      href: "photo/",
      tags: ["影像", "照片"],
      type: "影像"
    }));
    const memes = getVisibleMemes(data.memes || []).map((meme) => ({
      title: meme.title,
      date: meme.date,
      dateObj: new Date(meme.date),
      href: "meme/",
      tags: ["涂鸦", "Meme"],
      type: "涂鸦"
    }));
    const podcasts = (data.podcasts || []).map((podcast) => ({
      title: podcast.title,
      date: podcast.date,
      dateObj: new Date(podcast.date),
      href: "podcast/",
      tags: ["播客", "节目更新"],
      type: "播客"
    }));

    const allEntries = [...blogs, ...photos, ...memes, ...podcasts];

    const allTags = Array.from(
      new Set(allEntries.flatMap((entry) => entry.tags || []))
    ).sort((a, b) => a.localeCompare(b, "zh-CN"));

    allTags.forEach((tag) => {
      const option = document.createElement("option");
      option.value = tag;
      option.textContent = tag;
      topicSelect.appendChild(option);
    });

    const render = (topic = "all") => {
      const filtered = allEntries
        .filter((entry) => topic === "all" || (entry.tags || []).includes(topic))
        .sort((a, b) => b.dateObj - a.dateObj);

      const grouped = new Map();
      filtered.forEach((entry) => {
        const key = `${entry.date.slice(0, 7)}`;
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key).push(entry);
      });

      timeline.innerHTML = "";
      grouped.forEach((items, month) => {
        const block = document.createElement("section");
        block.className = "timeline-month";
        block.innerHTML = `
          <h2>${escapeHtml(month)}</h2>
          <ul>
            ${items
              .map(
                (item) => `
              <li>
                <span class="timeline-type">${escapeHtml(item.type)}</span>
                <a href="${withBase(item.href)}">${escapeHtml(item.title)}</a>
                <span class="timeline-date">${escapeHtml(item.date)}</span>
                <span class="timeline-tags">${(item.tags || [])
                  .map((tag) => `#${escapeHtml(tag)}`)
                  .join(" ")}</span>
              </li>
            `
              )
              .join("")}
          </ul>
        `;
        timeline.appendChild(block);
      });

      if (!grouped.size) {
        timeline.innerHTML = '<p class="archive-empty">暂无符合条件的内容。</p>';
      }
    };

    topicSelect.addEventListener("change", () => render(topicSelect.value));
    render("all");
  } catch (error) {
    timeline.innerHTML = '<p class="archive-empty">归档数据加载失败。</p>';
    console.error("Failed to render archive timeline:", error);
  }
}

function initPodcastExpandCollapse(container, episodes, initialVisibleCount) {
  if (episodes.length <= initialVisibleCount) return;

  let expanded = false;
  const toggleButton = document.createElement("button");
  toggleButton.type = "button";
  toggleButton.className = "podcast-toggle-button";

  const renderVisibility = () => {
    episodes.forEach((episode, index) => {
      const shouldShow = expanded || index < initialVisibleCount;
      episode.classList.toggle("content-hidden", !shouldShow);
    });
    toggleButton.textContent = expanded ? "收起历史节目" : "加载更多节目";
  };

  toggleButton.addEventListener("click", () => {
    expanded = !expanded;
    renderVisibility();
  });

  container.appendChild(toggleButton);
  renderVisibility();
}

async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error("Request failed with status " + response.status);
    }
    return await response.text();
  } finally {
    clearTimeout(timeoutId);
  }
}

function parsePodcastItems(xmlString) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");
  const rawItems = xmlDoc.querySelectorAll("item");

  return Array.from(rawItems)
    .map((item) => {
      const title = item.querySelector("title")?.textContent?.trim();
      const pubDate = item.querySelector("pubDate")?.textContent?.trim();
      const duration =
        item.getElementsByTagName("itunes:duration")[0]?.textContent?.trim() || "";
      const enclosure = item.querySelector("enclosure")?.getAttribute("url");
      const descriptionHtml =
        item.querySelector("description")?.textContent?.trim() || "";

      const descriptionElement = document.createElement("div");
      descriptionElement.innerHTML = descriptionHtml;
      const descriptionText =
        descriptionElement.textContent || descriptionElement.innerText || "";

      if (!title || !enclosure) return null;

      return {
        title,
        pubDate,
        duration,
        enclosure,
        descriptionText,
      };
    })
    .filter(Boolean);
}

function createEpisodeNode(item) {
  const episodeDiv = document.createElement("div");
  episodeDiv.classList.add("episode");

  const dateDurationDiv = document.createElement("div");
  dateDurationDiv.classList.add("date-duration");

  const dateElement = document.createElement("p");
  dateElement.classList.add("date");
  dateElement.textContent = item.pubDate
    ? new Date(item.pubDate).toLocaleDateString("zh-CN")
    : "";

  const durationElement = document.createElement("p");
  durationElement.classList.add("duration");
  durationElement.textContent = item.duration;

  dateDurationDiv.appendChild(dateElement);
  dateDurationDiv.appendChild(durationElement);

  const titlePlayDiv = document.createElement("div");
  titlePlayDiv.classList.add("title-play");

  const titleElement = document.createElement("a");
  titleElement.classList.add("title");
  titleElement.href = item.enclosure;
  titleElement.textContent = item.title;

  const playButton = document.createElement("button");
  playButton.classList.add("play-button");
  playButton.type = "button";
  playButton.setAttribute("aria-label", "播放或暂停音频");
  playButton.setAttribute("aria-pressed", "false");
  playButton.innerHTML = "&#9658;";

  titlePlayDiv.appendChild(playButton);
  titlePlayDiv.appendChild(titleElement);

  const descriptionContainer = document.createElement("div");
  descriptionContainer.classList.add("description-container");

  const descriptionParagraph = document.createElement("p");
  descriptionParagraph.classList.add("description");
  descriptionParagraph.textContent = item.descriptionText;

  const moreButton = document.createElement("button");
  moreButton.classList.add("more-button");
  moreButton.type = "button";
  moreButton.textContent = "更多";

  moreButton.addEventListener("click", () => {
    const expanded = descriptionParagraph.classList.toggle("expanded");
    moreButton.textContent = expanded ? "收起" : "更多";
  });

  descriptionContainer.appendChild(descriptionParagraph);
  descriptionContainer.appendChild(moreButton);

  const progressBarContainer = document.createElement("div");
  progressBarContainer.classList.add("progress-bar-container");

  const progressBar = document.createElement("div");
  progressBar.classList.add("progress-bar");

  const progress = document.createElement("div");
  progress.classList.add("progress");
  progressBar.appendChild(progress);
  progressBarContainer.appendChild(progressBar);

  const audio = new Audio(item.enclosure);
  audio.preload = "none";

  progressBar.addEventListener("click", (event) => {
    if (!audio.duration) return;
    const rect = progressBar.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    audio.currentTime = (offsetX / progressBar.offsetWidth) * audio.duration;
  });

  audio.addEventListener("timeupdate", () => {
    if (!audio.duration) return;
    progress.style.width = (audio.currentTime / audio.duration) * 100 + "%";
  });

  const checkDescriptionLines = () => {
    const lineHeight = parseFloat(
      window.getComputedStyle(descriptionParagraph).lineHeight
    );
    if (!lineHeight) return;
    const maxHeight = 2 * lineHeight;
    const actualHeight = descriptionParagraph.scrollHeight;
    moreButton.style.display = actualHeight > maxHeight ? "block" : "none";
  };

  let resizeTimer;
  const debouncedCheck = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(checkDescriptionLines, 150);
  };

  setTimeout(checkDescriptionLines, 100);
  window.addEventListener("resize", debouncedCheck);

  episodeDiv.appendChild(dateDurationDiv);
  episodeDiv.appendChild(titlePlayDiv);
  episodeDiv.appendChild(descriptionContainer);
  episodeDiv.appendChild(progressBarContainer);

  return { episodeDiv, audio, playButton, progressBarContainer };
}

function initArticleEnhancements() {
  const main = document.querySelector("main");
  const article = main?.querySelector("article");
  if (!main || !article) return;
  if (main.hasAttribute("data-no-toc")) return;
  if (window.location.pathname.includes("/about/")) return;

  initArticleBreadcrumb(main, article);
  initReadingProgress(article);
  initArticleToc(main, article);
}

function initArticleBreadcrumb(main, article) {
  if (main.querySelector(".article-breadcrumb")) return;

  const title = main.querySelector("h1")?.textContent?.trim() || "文章正文";
  const breadcrumb = document.createElement("nav");
  breadcrumb.className = "article-breadcrumb";
  breadcrumb.setAttribute("aria-label", "面包屑导航");
  breadcrumb.innerHTML = `
    <a href="${withBase("blog/")}">博客</a>
    <span aria-hidden="true">/</span>
    <span aria-current="page">${escapeHtml(title)}</span>
  `;
  main.prepend(breadcrumb);

  const backLink = document.createElement("a");
  backLink.className = "article-back-link";
  backLink.href = withBase("blog/");
  backLink.textContent = "← 返回博客列表";
  article.insertAdjacentElement("afterend", backLink);
}

function initReadingProgress(article) {
  const bar = document.createElement("div");
  bar.className = "reading-progress";
  bar.innerHTML = '<span class="reading-progress-inner"></span>';
  document.body.appendChild(bar);

  const inner = bar.querySelector(".reading-progress-inner");
  const updateProgress = () => {
    const rect = article.getBoundingClientRect();
    const total = rect.height + window.innerHeight;
    const completed = window.innerHeight - rect.top;
    const ratio = Math.max(0, Math.min(1, completed / total));
    inner.style.width = `${Math.round(ratio * 100)}%`;
  };

  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
  updateProgress();
}

function initArticleToc(main, article) {
  let headings = Array.from(article.querySelectorAll("h2, h3"));

  if (!headings.length) {
    const start = document.createElement("span");
    start.id = "section-start";
    const end = document.createElement("span");
    end.id = "section-end";
    article.prepend(start);
    article.appendChild(end);
    headings = [start, end];
    start.dataset.title = "开头";
    end.dataset.title = "结尾";
  }

  const toc = document.createElement("nav");
  toc.className = "article-toc";
  toc.setAttribute("aria-label", "文章目录");
  const list = document.createElement("ul");

  headings.forEach((heading, index) => {
    if (!heading.id) {
      heading.id = `section-${index + 1}`;
    }
    const title =
      heading.dataset.title ||
      heading.textContent?.trim() ||
      `章节 ${index + 1}`;

    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = `#${heading.id}`;
    link.textContent = title;
    item.appendChild(link);
    list.appendChild(item);
  });

  toc.innerHTML = "<h3>目录</h3>";
  toc.appendChild(list);
  const contentWrap = document.createElement("div");
  contentWrap.className = "article-content";
  Array.from(main.children).forEach((child) => {
    contentWrap.appendChild(child);
  });

  main.innerHTML = "";
  main.classList.add("article-main");
  main.appendChild(contentWrap);
  main.appendChild(toc);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
