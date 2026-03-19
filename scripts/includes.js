async function loadIncludes() {
  const nodes = document.querySelectorAll("[data-include]");
  const tasks = Array.from(nodes).map(async (node) => {
    const includePath = node.getAttribute("data-include");
    if (!includePath) return;

    try {
      const response = await fetch(includePath);
      if (!response.ok) {
        throw new Error("Failed to load include: " + includePath);
      }
      node.innerHTML = await response.text();
    } catch (error) {
      console.error(error);
    }
  });

  await Promise.all(tasks);
  hydrateNavLinks();
  markActiveNav();
  hydrateDynamicFooter();
}

function getSiteBasePath() {
  const marker = "/frozenlemon/";
  return window.location.pathname.includes(marker) ? marker : "/";
}

function buildAbsoluteRoute(route) {
  const base = getSiteBasePath();
  if (!route || route === "/") return base;
  return base + route.replace(/^\//, "");
}

function hydrateNavLinks() {
  document.querySelectorAll("[data-route]").forEach((link) => {
    const route = link.getAttribute("data-route");
    if (!route) return;
    link.setAttribute("href", buildAbsoluteRoute(route));
  });
}

function markActiveNav() {
  const pathname = window.location.pathname.replace(/\/index\.html$/, "/");
  document.querySelectorAll(".site-shell-nav a[data-route]").forEach((link) => {
    const route = link.getAttribute("data-route");
    if (!route) return;

    const absoluteRoute = buildAbsoluteRoute(route);
    const isRoot = absoluteRoute === getSiteBasePath();
    const isActive = isRoot
      ? pathname === absoluteRoute
      : pathname === absoluteRoute || pathname.startsWith(absoluteRoute);

    if (isActive) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    } else {
      link.classList.remove("active");
      link.removeAttribute("aria-current");
    }
  });
}

function hydrateDynamicFooter() {
  const year = String(new Date().getFullYear());
  document.querySelectorAll("[data-current-year]").forEach((el) => {
    el.textContent = year;
  });
}

document.addEventListener("DOMContentLoaded", loadIncludes);
