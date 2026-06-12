(function () {
  const state = {
    course: "all",
    grade: "all",
    query: "",
    selectedId: null,
  };

  const data = window.LEARNING_SITE_DATA;
  const allPages = data.pages;
  const gradeOrder = ["all", "A+", "A", "B", "C", "D", "说明"];
  const gradeLabels = {
    all: "全部等级",
    "A+": "A+ 高条件胜率",
    A: "A 较高条件胜率",
    B: "B 中等条件胜率",
    C: "C 低到中等概率",
    D: "D 避坑",
    说明: "说明页",
  };
  const gradeColors = {
    "A+": "#13845b",
    A: "#1f65d6",
    B: "#8a6500",
    C: "#aa4c00",
    D: "#b42318",
    说明: "#637083",
  };

  const els = {
    atlasPdf: document.getElementById("atlasPdf"),
    openingPdf: document.getElementById("openingPdf"),
    courseFilters: document.getElementById("courseFilters"),
    gradeFilters: document.getElementById("gradeFilters"),
    searchInput: document.getElementById("searchInput"),
    resetFilters: document.getElementById("resetFilters"),
    cardGrid: document.getElementById("cardGrid"),
    resultTitle: document.getElementById("resultTitle"),
    resultCount: document.getElementById("resultCount"),
    readerMeta: document.getElementById("readerMeta"),
    readerTitle: document.getElementById("readerTitle"),
    readerImage: document.getElementById("readerImage"),
    readerNotes: document.getElementById("readerNotes"),
    openImageBtn: document.getElementById("openImageBtn"),
    openPageBtn: document.getElementById("openPageBtn"),
    prevBtn: document.getElementById("prevBtn"),
    nextBtn: document.getElementById("nextBtn"),
    metricPages: document.getElementById("metricPages"),
    metricPatterns: document.getElementById("metricPatterns"),
  };

  function init() {
    els.atlasPdf.href = data.pdfs.atlas;
    els.openingPdf.href = data.pdfs.opening;
    els.metricPages.textContent = allPages.length;
    els.metricPatterns.textContent = allPages.filter((item) => item.kind === "pattern").length;
    buildGradeFilters();
    bindEvents();
    const initial = allPages.find((item) => item.course === "atlas" && item.kind === "pattern") || allPages[0];
    state.selectedId = initial.id;
    render();
  }

  function buildGradeFilters() {
    const counts = gradeOrder.reduce((acc, grade) => {
      acc[grade] = grade === "all" ? allPages.length : allPages.filter((item) => item.grade === grade).length;
      return acc;
    }, {});

    els.gradeFilters.innerHTML = gradeOrder
      .filter((grade) => counts[grade] > 0)
      .map((grade) => {
        const active = grade === state.grade ? " active" : "";
        const dot = grade === "all" ? "All" : grade;
        const bg = grade === "all" ? "#142033" : gradeColors[grade];
        return `<button type="button" class="${active}" data-grade="${grade}">
          <span><span class="grade-dot" style="background:${bg}">${dot}</span> ${gradeLabels[grade]}</span>
          <span>${counts[grade]}</span>
        </button>`;
      })
      .join("");
  }

  function bindEvents() {
    els.courseFilters.addEventListener("click", (event) => {
      const btn = event.target.closest("button[data-course]");
      if (!btn) return;
      syncQuery();
      state.course = btn.dataset.course;
      state.selectedId = null;
      render();
    });

    els.gradeFilters.addEventListener("click", (event) => {
      const btn = event.target.closest("button[data-grade]");
      if (!btn) return;
      syncQuery();
      state.grade = btn.dataset.grade;
      state.selectedId = null;
      render();
    });

    els.searchInput.addEventListener("input", (event) => {
      state.query = event.target.value.trim().toLowerCase();
      state.selectedId = null;
      render();
    });

    window.resetLearningFilters = resetAllFilters;
    els.resetFilters.addEventListener("click", resetAllFilters);

    els.cardGrid.addEventListener("click", (event) => {
      const card = event.target.closest(".page-card");
      if (!card) return;
      selectPage(card.dataset.id, true);
    });

    els.prevBtn.addEventListener("click", () => moveSelection(-1));
    els.nextBtn.addEventListener("click", () => moveSelection(1));

    document.addEventListener("keydown", (event) => {
      if (event.target.matches("input")) return;
      if (event.key === "ArrowLeft") moveSelection(-1);
      if (event.key === "ArrowRight") moveSelection(1);
    });
  }

  function syncQuery() {
    state.query = els.searchInput.value.trim().toLowerCase();
  }

  function resetAllFilters() {
    state.course = "all";
    state.grade = "all";
    state.query = "";
    state.selectedId = null;
    els.searchInput.value = "";
    render();
  }

  function filteredPages() {
    return allPages.filter((item) => {
      const courseOk = state.course === "all" || item.course === state.course;
      const gradeOk = state.grade === "all" || item.grade === state.grade;
      const detailText = item.details ? Object.values(item.details).join(" ") : "";
      const queryOk =
        !state.query ||
        `${item.title} ${item.courseLabel} ${item.grade} ${item.cycle} ${item.summary} ${detailText}`
          .toLowerCase()
          .includes(state.query);
      return courseOk && gradeOk && queryOk;
    });
  }

  function render() {
    document.querySelectorAll("#courseFilters button").forEach((button) => {
      button.classList.toggle("active", button.dataset.course === state.course);
    });
    document.querySelectorAll("#gradeFilters button").forEach((button) => {
      button.classList.toggle("active", button.dataset.grade === state.grade);
    });

    const pages = filteredPages();
    if (!state.selectedId || !pages.some((item) => item.id === state.selectedId)) {
      state.selectedId = pages[0]?.id || null;
    }

    renderSummary(pages);
    renderCards(pages);
    if (state.selectedId) {
      selectPage(state.selectedId, false);
    } else {
      renderEmptyReader();
    }
  }

  function renderSummary(pages) {
    const courseText =
      state.course === "atlas" ? "形态图谱" : state.course === "opening" ? "开盘专题" : "全部页面";
    const gradeText = state.grade === "all" ? "" : ` · ${gradeLabels[state.grade]}`;
    els.resultTitle.textContent = `${courseText}${gradeText}`;
    els.resultCount.textContent = `${pages.length} 个页面`;
  }

  function renderCards(pages) {
    if (!pages.length) {
      els.cardGrid.innerHTML = `<div class="empty">没有找到匹配页面。换一个关键词或等级筛选试试。</div>`;
      return;
    }

    els.cardGrid.innerHTML = pages
      .map((item) => {
        const active = item.id === state.selectedId ? " active" : "";
        const gradeColor = gradeColors[item.grade] || "#637083";
        return `<article class="page-card${active}" data-id="${item.id}" tabindex="0">
          <div class="thumb"><img src="${item.thumb}" alt="${escapeHtml(item.title)} 缩略图" loading="lazy" /></div>
          <div class="card-body">
            <h3 class="card-title">${escapeHtml(item.title)}</h3>
            <div class="chips">
              <span class="chip">${item.courseLabel}</span>
              <span class="chip" style="color:${gradeColor}">${item.grade}</span>
              <span class="chip">第 ${item.page} 页</span>
            </div>
          </div>
        </article>`;
      })
      .join("");

    document.querySelectorAll(".page-card").forEach((card) => {
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          selectPage(card.dataset.id, true);
        }
      });
    });
  }

  function selectPage(id, scrollReader) {
    const item = allPages.find((page) => page.id === id);
    if (!item) return;
    state.selectedId = id;

    document.querySelectorAll(".page-card").forEach((card) => {
      card.classList.toggle("active", card.dataset.id === id);
    });

    els.readerMeta.textContent = `${item.courseLabel} · 第 ${item.page} 页 · 条件胜率 / 实战优先级：${item.grade}`;
    els.readerTitle.textContent = item.title;
    els.readerImage.src = item.full;
    els.readerImage.alt = item.title;
    els.openImageBtn.href = item.full;
    els.openImageBtn.textContent = item.kind === "pattern" ? "打开高清K线" : "打开整页图";
    els.openPageBtn.href = item.pageImage || item.full;
    els.openPageBtn.style.display = item.kind === "pattern" ? "" : "none";

    const noteEntries = item.details
      ? Object.entries(item.details)
      : [
          ["主题", item.courseLabel],
          ["市场周期", item.cycle || "说明页"],
          ["页面类型", item.kind === "pattern" ? "形态页" : "说明页"],
          ["教学提醒", item.summary],
        ];
    els.readerNotes.innerHTML = noteEntries
      .map(([label, value]) => `<div class="note"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`)
      .join("");

    const pages = filteredPages();
    const index = pages.findIndex((page) => page.id === id);
    els.prevBtn.disabled = index <= 0;
    els.nextBtn.disabled = index === -1 || index >= pages.length - 1;

    if (scrollReader) {
      document.querySelector(".reader").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function moveSelection(delta) {
    const pages = filteredPages();
    if (!pages.length) return;
    const currentIndex = pages.findIndex((item) => item.id === state.selectedId);
    const nextIndex = Math.min(Math.max(currentIndex + delta, 0), pages.length - 1);
    selectPage(pages[nextIndex].id, true);
  }

  function renderEmptyReader() {
    els.readerMeta.textContent = "没有匹配页面";
    els.readerTitle.textContent = "请调整筛选条件";
    els.readerImage.removeAttribute("src");
    els.openImageBtn.href = "#";
    els.openPageBtn.href = "#";
    els.readerNotes.innerHTML = "";
    els.prevBtn.disabled = true;
    els.nextBtn.disabled = true;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  init();
})();
