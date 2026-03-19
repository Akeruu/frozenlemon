document.addEventListener("DOMContentLoaded", function () {
  // 处理 RSS 订阅
  const rssUrl = "https://www.ximalaya.com/album/72549254.xml";
  const podcastEpisodesContainer = document.querySelector(".podcast-episodes");

  fetch(rssUrl)
    .then((response) => response.text())
    .then((data) => {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data, "text/xml");
      const items = xmlDoc.querySelectorAll("item");

      items.forEach((item) => {
        const title = item.querySelector("title").textContent;
        const pubDate = item.querySelector("pubDate").textContent;
        const duration =
          item.getElementsByTagName("itunes:duration")[0].textContent;
        const enclosure = item.querySelector("enclosure").getAttribute("url");
        const descriptionHtml = item.querySelector("description").textContent;

        const descriptionElement = document.createElement("div");
        descriptionElement.innerHTML = descriptionHtml;
        const descriptionText =
          descriptionElement.textContent || descriptionElement.innerText || "";

        const episodeDiv = document.createElement("div");
        episodeDiv.classList.add("episode");

        const dateDurationDiv = document.createElement("div");
        dateDurationDiv.classList.add("date-duration");

        const dateElement = document.createElement("p");
        dateElement.classList.add("date");
        dateElement.textContent = new Date(pubDate).toLocaleDateString();

        const durationElement = document.createElement("p");
        durationElement.classList.add("duration");
        durationElement.textContent = duration;

        dateDurationDiv.appendChild(dateElement);
        dateDurationDiv.appendChild(durationElement);

        const titlePlayDiv = document.createElement("div");
        titlePlayDiv.classList.add("title-play");

        const titleElement = document.createElement("a");
        titleElement.classList.add("title");
        titleElement.href = enclosure;
        titleElement.textContent = title;

        const playButton = document.createElement("button");
        playButton.classList.add("play-button");
        playButton.innerHTML = "&#9658;"; // Play icon

        const descriptionContainer = document.createElement("div");
        descriptionContainer.classList.add("description-container");

        const descriptionParagraph = document.createElement("p");
        descriptionParagraph.classList.add("description");
        descriptionParagraph.textContent = descriptionText;

        const moreButton = document.createElement("span");
        moreButton.classList.add("more-button");
        moreButton.textContent = "更多"; // More button text

        moreButton.addEventListener("click", () => {
          descriptionParagraph.classList.toggle("expanded");
          moreButton.textContent = descriptionParagraph.classList.contains(
            "expanded"
          )
            ? "收起"
            : "更多"; // 切换按钮文本
        });

        const progressBarContainer = document.createElement("div");
        progressBarContainer.classList.add("progress-bar-container");

        const progressBar = document.createElement("div");
        progressBar.classList.add("progress-bar");

        const progress = document.createElement("div");
        progress.classList.add("progress");
        progressBar.appendChild(progress);

        progressBarContainer.appendChild(progressBar);

        titlePlayDiv.appendChild(playButton);
        titlePlayDiv.appendChild(titleElement);

        const audio = new Audio(enclosure);

        playButton.addEventListener("click", () => {
          if (playButton.classList.contains("playing")) {
            playButton.classList.remove("playing");
            playButton.innerHTML = "&#9658;"; // Play icon
            audio.pause();
          } else {
            playButton.classList.add("playing");
            playButton.innerHTML = "&#10074;&#10074;"; // Pause icon
            audio.play();
            progressBarContainer.style.display = "block"; // 显示进度条容器
            updateProgressBar();
          }
        });

        titleElement.addEventListener("click", (event) => {
          event.preventDefault();
          if (playButton.classList.contains("playing")) {
            playButton.classList.remove("playing");
            playButton.innerHTML = "&#9658;"; // Play icon
            audio.pause();
          } else {
            playButton.classList.add("playing");
            playButton.innerHTML = "&#10074;&#10074;"; // Pause icon
            audio.play();
            progressBarContainer.style.display = "block"; // 显示进度条容器
            updateProgressBar();
          }
        });

        progressBar.addEventListener("click", (e) => {
          const rect = progressBar.getBoundingClientRect();
          const offsetX = e.clientX - rect.left;
          const newTime = (offsetX / progressBar.offsetWidth) * audio.duration;
          audio.currentTime = newTime;
        });

        audio.addEventListener("timeupdate", () => {
          const progressPercentage = (audio.currentTime / audio.duration) * 100;
          progress.style.width = progressPercentage + "%";
        });

        audio.addEventListener("ended", () => {
          playButton.classList.remove("playing");
          playButton.innerHTML = "&#9658;"; // Play icon
          progressBarContainer.style.display = "none"; // 隐藏进度条容器
        });

        function updateProgressBar() {
          if (audio.currentTime > 0 && audio.duration) {
            progress.style.width =
              (audio.currentTime / audio.duration) * 100 + "%";
            if (!audio.paused) {
              requestAnimationFrame(updateProgressBar);
            }
          }
        }

        // 处理描述的显示和隐藏
        function checkDescriptionLines() {
          const lineHeight = parseFloat(
            window.getComputedStyle(descriptionParagraph).lineHeight
          );
          const maxHeight = 3 * lineHeight; // 两行的最大高度
          const actualHeight = descriptionParagraph.scrollHeight;

          if (actualHeight > maxHeight) {
            moreButton.style.display = "block"; // 显示“更多”按钮
            descriptionParagraph.classList.add("collapsed");
          } else {
            moreButton.style.display = "none"; // 隐藏“更多”按钮
          }
        }

        // 确保描述计算在 DOM 完全加载后进行
        setTimeout(checkDescriptionLines, 100); // 使用 setTimeout 确保计算在渲染后进行

        // 监听屏幕宽度变化以重新计算描述
        window.addEventListener("resize", checkDescriptionLines);

        descriptionContainer.appendChild(descriptionParagraph);
        descriptionContainer.appendChild(moreButton);

        episodeDiv.appendChild(dateDurationDiv);
        episodeDiv.appendChild(titlePlayDiv);
        episodeDiv.appendChild(descriptionContainer); // 使用新的描述容器
        episodeDiv.appendChild(progressBarContainer);

        podcastEpisodesContainer.appendChild(episodeDiv);
      });
    })
    .catch((error) => {
      console.error("Error fetching RSS feed:", error);
    });

  // Initialize Slick Slider
  $(document).ready(function () {
    // Initialize Slick Slider
    $(".slick-slider").slick({
      dots: true,
      arrows: true,
      autoplay: true,
      autoplaySpeed: 3000,
      infinite: true,
      slidesToShow: 1,
      slidesToScroll: 1,
    });
  });

  // 处理主题切换
  const themeToggle = document.getElementById("js-theme-toggle");

  // Check for saved theme preference
  if (localStorage.getItem("theme") === "dark") {
    document.documentElement.classList.add("dark-theme");
    themeToggle.checked = true;
  }

  themeToggle.addEventListener("change", function () {
    if (this.checked) {
      document.documentElement.classList.add("dark-theme");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark-theme");
      localStorage.setItem("theme", "light");
    }
  });
});
