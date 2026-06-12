(function () {
  const data = window.LEARNING_SITE_DATA;
  const allPages = data.pages;

  const state = {
    course: "all",
    grade: "all",
    section: "all",
    query: "",
    selectedId: null,
  };

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

  const morningStrategies = [
    {
      id: "morning-trend",
      label: "趋势从开盘 / Gap-and-Go",
      shortLabel: "趋势从开盘",
      range: [1, 18],
      grade: "A+",
      description: "强开盘、缺口接受、第一次回踩、小回调趋势和突破点回踩。",
    },
    {
      id: "morning-reversal",
      label: "开盘反转与缺口回补",
      shortLabel: "开盘反转",
      range: [19, 40],
      grade: "A",
      description: "前日高低点、缺口回补、趋势线突破后测试失败和第二信号。",
    },
    {
      id: "morning-range",
      label: "18-20 根K线开盘区间",
      shortLabel: "18-20 根区间",
      range: [41, 48],
      grade: "B",
      description: "观察区间高低点、边缘回踩、假突破和中轴过滤。",
    },
    {
      id: "morning-breakout",
      label: "突破模式与失败突破",
      shortLabel: "突破模式",
      range: [49, 60],
      grade: "B",
      description: "三角形、宽通道、Breakout Mode、前高前低突破失败。",
    },
    {
      id: "morning-filter",
      label: "低概率开盘过滤",
      shortLabel: "低概率过滤",
      range: [61, 70],
      grade: "C",
      description: "第一根K线追单、无回踩追单、Doji 信号和目标空间不足。",
    },
    {
      id: "morning-no-trade",
      label: "No Trade 开盘陷阱",
      shortLabel: "No Trade",
      range: [71, 73],
      grade: "D",
      description: "前 5 分钟无确认、区间中部来回交易、只看缺口方向。",
    },
  ].map((strategy) => ({ course: "morning", kind: "pattern", ...strategy }));

  const directoryGroups = [
    {
      label: "全部资料",
      options: [{ id: "all", label: "全部页面", description: "查看两份资料和早盘策略入口。" }],
    },
    {
      label: "形态图谱",
      options: [
        { id: "atlas-all", label: "全部形态图谱", course: "atlas", description: "完整价格行为形态图谱。" },
        { id: "atlas-a-plus", label: "A+ 强顺势与强突破类", course: "atlas", grade: "A+", description: "顺强趋势、强突破后回踩和连续跟随。" },
        { id: "atlas-a", label: "A 高质量顺势与确认反转", course: "atlas", grade: "A", description: "确认后的反转和高质量顺势延续。" },
        { id: "atlas-b", label: "B 依赖背景的可交易形态", course: "atlas", grade: "B", description: "需要严格过滤的区间、通道和突破模式。" },
        { id: "atlas-c", label: "C 低到中等概率过滤", course: "atlas", grade: "C", description: "交易区间中部、弱突破和目标空间不足。" },
        { id: "atlas-d", label: "D 避坑与禁止强行交易", course: "atlas", grade: "D", description: "主要用于识别不该交易的场景。" },
        { id: "atlas-front", label: "图谱说明页", course: "atlas", grade: "说明", kind: "front", description: "封面、图例、等级、入场规则和风险提醒。" },
      ],
    },
    {
      label: "开盘专题",
      options: [
        { id: "opening-all", label: "全部开盘专题", course: "opening", description: "开盘前 60-90 分钟完整专题。" },
        { id: "opening-a-plus", label: "A+ 开盘最高优先级", course: "opening", grade: "A+", description: "趋势从开盘、Gap-and-Go 和强开盘突破。" },
        { id: "opening-a", label: "A 高质量开盘反转", course: "opening", grade: "A", description: "关键价位测试失败后的确认反转。" },
        { id: "opening-b", label: "B 开盘区间与突破模式", course: "opening", grade: "B", description: "18-20 根K线区间、三角形、宽通道和失败突破。" },
        { id: "opening-c", label: "C 开盘低概率形态", course: "opening", grade: "C", description: "追单、弱信号、无跟随和目标不足。" },
        { id: "opening-d", label: "D 开盘避坑形态", course: "opening", grade: "D", description: "等待确认，避免开盘情绪化交易。" },
        { id: "opening-front", label: "开盘说明页", course: "opening", grade: "说明", kind: "front", description: "开盘框架、18-20 根K线区间、图例和风险提醒。" },
      ],
    },
    {
      label: "早盘策略",
      options: [
        { id: "morning-all", label: "全部早盘策略", course: "morning", kind: "pattern", description: "把开盘专题中的 73 个形态按交易策略重组。" },
        { id: "morning-a-plus", label: "A+ 趋势从开盘策略", course: "morning", grade: "A+", range: [1, 18], description: "早盘最高优先级的顺势与突破策略。" },
        { id: "morning-a", label: "A 开盘反转策略", course: "morning", grade: "A", range: [19, 40], description: "关键位测试失败后的确认反转策略。" },
        { id: "morning-b", label: "B 区间与突破模式策略", course: "morning", grade: "B", range: [41, 60], description: "开盘区间、三角形和失败突破策略。" },
        { id: "morning-c", label: "C 低概率过滤策略", course: "morning", grade: "C", range: [61, 70], description: "降低追单和弱信号误用。" },
        { id: "morning-d", label: "D No Trade 开盘陷阱", course: "morning", grade: "D", range: [71, 73], description: "只用于避坑和等待确认。" },
        ...morningStrategies,
      ],
    },
  ];

  const sections = directoryGroups.flatMap((group) => group.options);
  const sectionById = sections.reduce((acc, section) => {
    acc[section.id] = section;
    return acc;
  }, {});

  const gradeSubsections = {
    all: ["all", "atlas-all", "opening-all", "morning-all"],
    "A+": ["atlas-a-plus", "opening-a-plus", "morning-a-plus", "morning-trend"],
    A: ["atlas-a", "opening-a", "morning-a", "morning-reversal"],
    B: ["atlas-b", "opening-b", "morning-b", "morning-range", "morning-breakout"],
    C: ["atlas-c", "opening-c", "morning-c", "morning-filter"],
    D: ["atlas-d", "opening-d", "morning-d", "morning-no-trade"],
    说明: ["atlas-front", "opening-front"],
  };

  const courseLabels = {
    all: "全部页面",
    atlas: "形态图谱",
    opening: "开盘专题",
    morning: "早盘策略",
  };

  const els = {
    atlasPdf: document.getElementById("atlasPdf"),
    openingPdf: document.getElementById("openingPdf"),
    courseFilters: document.getElementById("courseFilters"),
    directorySelect: document.getElementById("directorySelect"),
    directoryHint: document.getElementById("directoryHint"),
    gradeFilters: document.getElementById("gradeFilters"),
    morningQuickFilters: document.getElementById("morningQuickFilters"),
    strategyBoard: document.getElementById("strategyBoard"),
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
    buildDirectorySelect();
    buildMorningQuickFilters();
    buildStrategyBoard();
    bindEvents();
    const initial = allPages.find((item) => item.course === "atlas" && item.kind === "pattern") || allPages[0];
    state.selectedId = initial.id;
    render();
  }

  function buildDirectorySelect() {
    els.directorySelect.innerHTML = directoryGroups
      .map((group) => {
        const options = group.options
          .map((section) => {
            const count = countSection(section);
            return `<option value="${section.id}">${escapeHtml(section.label)} (${count})</option>`;
          })
          .join("");
        return `<optgroup label="${escapeHtml(group.label)}">${options}</optgroup>`;
      })
      .join("");
  }

  function buildMorningQuickFilters() {
    els.morningQuickFilters.innerHTML = morningStrategies
      .map((strategy) => {
        const count = countSection(strategy);
        return `<button type="button" data-section="${strategy.id}">
          <span>${escapeHtml(strategy.shortLabel)}</span>
          <strong>${strategy.grade}</strong>
          <em>${count}</em>
        </button>`;
      })
      .join("");
  }

  function buildStrategyBoard() {
    els.strategyBoard.innerHTML = morningStrategies
      .map((strategy) => {
        const count = countSection(strategy);
        const color = gradeColors[strategy.grade] || "#637083";
        return `<button type="button" class="strategy-card" data-section="${strategy.id}">
          <span class="strategy-grade" style="background:${color}">${strategy.grade}</span>
          <strong>${escapeHtml(strategy.label)}</strong>
          <small>${escapeHtml(strategy.description)}</small>
          <em>${count} 个形态</em>
        </button>`;
      })
      .join("");
  }

  function buildGradeFilters() {
    els.gradeFilters.innerHTML = gradeOrder
      .map((grade) => {
        const count = countGrade(grade);
        if (!count && grade !== "all") return "";
        const dot = grade === "all" ? "All" : grade;
        const bg = grade === "all" ? "#142033" : gradeColors[grade];
        const children = (gradeSubsections[grade] || [])
          .map((sectionId) => sectionById[sectionId])
          .filter(Boolean)
          .filter((section) => countSection(section) > 0)
          .map((section) => {
            const active = section.id === state.section ? " active" : "";
            return `<button type="button" class="subfilter-button${active}" data-section="${section.id}">
              <span>${escapeHtml(section.label)}</span>
              <em>${countSection(section)}</em>
            </button>`;
          })
          .join("");
        const open = grade === state.grade || (gradeSubsections[grade] || []).includes(state.section) || grade === "all";
        const gradeActive = state.section === "all" && grade === state.grade ? " active" : "";
        return `<details class="grade-folder" ${open ? "open" : ""}>
          <summary class="grade-summary">
            <span><span class="grade-dot" style="background:${bg}">${dot}</span>${gradeLabels[grade]}</span>
            <strong>${count}</strong>
          </summary>
          <div class="grade-sublist">
            <button type="button" class="grade-main-button${gradeActive}" data-grade="${grade}">
              <span>只看 ${gradeLabels[grade]}</span>
              <em>${count}</em>
            </button>
            ${children}
          </div>
        </details>`;
      })
      .join("");
  }

  function bindEvents() {
    els.courseFilters.addEventListener("click", (event) => {
      const btn = event.target.closest("button[data-course]");
      if (!btn) return;
      syncQuery();
      const course = btn.dataset.course;
      state.course = course;
      state.grade = "all";
      state.section = deriveSectionFromCourseAndGrade(course, "all");
      state.selectedId = null;
      render();
    });

    els.directorySelect.addEventListener("change", (event) => {
      syncQuery();
      applySection(event.target.value);
    });

    els.gradeFilters.addEventListener("click", (event) => {
      const sectionBtn = event.target.closest("button[data-section]");
      if (sectionBtn) {
        syncQuery();
        applySection(sectionBtn.dataset.section);
        return;
      }

      const gradeBtn = event.target.closest("button[data-grade]");
      if (!gradeBtn) return;
      syncQuery();
      state.grade = gradeBtn.dataset.grade;
      state.section = deriveSectionFromCourseAndGrade(state.course, state.grade);
      state.selectedId = null;
      render();
    });

    els.morningQuickFilters.addEventListener("click", (event) => {
      const btn = event.target.closest("button[data-section]");
      if (!btn) return;
      syncQuery();
      applySection(btn.dataset.section);
    });

    els.strategyBoard.addEventListener("click", (event) => {
      const btn = event.target.closest("button[data-section]");
      if (!btn) return;
      syncQuery();
      applySection(btn.dataset.section);
      document.querySelector(".reader").scrollIntoView({ behavior: "smooth", block: "start" });
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
      if (event.target.matches("input, select, textarea")) return;
      if (event.key === "ArrowLeft") moveSelection(-1);
      if (event.key === "ArrowRight") moveSelection(1);
    });
  }

  function applySection(sectionId) {
    const section = sectionById[sectionId] || sectionById.all;
    state.section = section.id;
    state.course = section.course === "morning" ? "morning" : section.course || "all";
    state.grade = section.grade || "all";
    state.selectedId = null;
    render();
  }

  function deriveSectionFromCourseAndGrade(course, grade) {
    if (course === "all" && grade === "all") return "all";
    if (course === "atlas") {
      if (grade === "all") return "atlas-all";
      if (grade === "说明") return "atlas-front";
      return `atlas-${slugGrade(grade)}`;
    }
    if (course === "opening") {
      if (grade === "all") return "opening-all";
      if (grade === "说明") return "opening-front";
      return `opening-${slugGrade(grade)}`;
    }
    if (course === "morning") {
      if (grade === "all" || grade === "说明") return "morning-all";
      return `morning-${slugGrade(grade)}`;
    }
    return "all";
  }

  function slugGrade(grade) {
    return {
      "A+": "a-plus",
      A: "a",
      B: "b",
      C: "c",
      D: "d",
    }[grade] || "all";
  }

  function syncQuery() {
    state.query = els.searchInput.value.trim().toLowerCase();
  }

  function resetAllFilters(event) {
    if (event) event.preventDefault();
    state.course = "all";
    state.grade = "all";
    state.section = "all";
    state.query = "";
    state.selectedId = null;
    els.searchInput.value = "";
    render();
  }

  function filteredPages() {
    const section = sectionById[state.section] || sectionById.all;
    return allPages.filter((item) => {
      const courseOk = matchesCourse(item, state.course);
      const gradeOk = state.grade === "all" || item.grade === state.grade;
      const sectionOk = matchesSection(item, section);
      const detailText = item.details ? Object.values(item.details).join(" ") : "";
      const strategy = findMorningStrategy(item);
      const queryOk =
        !state.query ||
        `${item.title} ${displayCourseLabel(item)} ${item.grade} ${item.cycle} ${item.summary} ${
          strategy ? strategy.label : ""
        } ${detailText}`
          .toLowerCase()
          .includes(state.query);
      return courseOk && gradeOk && sectionOk && queryOk;
    });
  }

  function matchesCourse(item, course) {
    if (course === "all") return true;
    if (course === "morning") return isMorningPage(item);
    return item.course === course;
  }

  function matchesSection(item, section) {
    if (!section || section.id === "all") return true;
    if (section.course === "morning") {
      if (!isMorningPage(item)) return false;
    } else if (section.course && item.course !== section.course) {
      return false;
    }
    if (section.kind && item.kind !== section.kind) return false;
    if (section.grade && item.grade !== section.grade) return false;
    if (section.range) {
      const number = getPatternNumber(item);
      return number !== null && number >= section.range[0] && number <= section.range[1];
    }
    return true;
  }

  function isMorningPage(item) {
    return item.course === "opening" && item.kind === "pattern";
  }

  function getPatternNumber(item) {
    const match = item.id.match(/^(?:atlas|opening)-(\d+)$/);
    return match ? Number(match[1]) : null;
  }

  function findMorningStrategy(item) {
    if (!isMorningPage(item)) return null;
    const number = getPatternNumber(item);
    return morningStrategies.find((strategy) => number >= strategy.range[0] && number <= strategy.range[1]) || null;
  }

  function countSection(section) {
    return allPages.filter((item) => matchesSection(item, section)).length;
  }

  function countGrade(grade) {
    return allPages.filter((item) => matchesCourse(item, state.course) && (grade === "all" || item.grade === grade)).length;
  }

  function render() {
    buildGradeFilters();

    document.querySelectorAll("#courseFilters button").forEach((button) => {
      button.classList.toggle("active", button.dataset.course === state.course);
    });
    document.querySelectorAll("#gradeFilters button[data-grade]").forEach((button) => {
      button.classList.toggle("active", state.section === "all" && button.dataset.grade === state.grade);
    });
    document.querySelectorAll("button[data-section]").forEach((button) => {
      button.classList.toggle("active", button.dataset.section === state.section);
    });

    els.directorySelect.value = state.section;
    const section = sectionById[state.section] || sectionById.all;
    els.directoryHint.textContent = section.description || "按课程、等级或早盘策略快速定位。";

    const pages = filteredPages();
    if (!state.selectedId || !pages.some((item) => item.id === state.selectedId)) {
      state.selectedId = pages[0]?.id || null;
    }

    renderSummary(pages, section);
    renderCards(pages);
    if (state.selectedId) {
      selectPage(state.selectedId, false);
    } else {
      renderEmptyReader();
    }
  }

  function renderSummary(pages, section) {
    const sectionLabel = section && section.id !== "all" ? section.label : courseLabels[state.course];
    const gradeText = state.grade === "all" || section.id !== "all" ? "" : ` / ${gradeLabels[state.grade]}`;
    els.resultTitle.textContent = `${sectionLabel}${gradeText}`;
    els.resultCount.textContent = `${pages.length} 个页面`;
  }

  function renderCards(pages) {
    if (!pages.length) {
      els.cardGrid.innerHTML = `<div class="empty">没有找到匹配页面。换一个关键词、目录或等级筛选试试。</div>`;
      return;
    }

    els.cardGrid.innerHTML = pages
      .map((item) => {
        const active = item.id === state.selectedId ? " active" : "";
        const gradeColor = gradeColors[item.grade] || "#637083";
        const strategy = findMorningStrategy(item);
        const strategyChip = strategy ? `<span class="chip strategy-chip">${escapeHtml(strategy.shortLabel)}</span>` : "";
        return `<article class="page-card${active}" data-id="${item.id}" tabindex="0">
          <div class="thumb"><img src="${item.thumb}" alt="${escapeHtml(item.title)} 缩略图" loading="lazy" /></div>
          <div class="card-body">
            <h3 class="card-title">${escapeHtml(item.title)}</h3>
            <div class="chips">
              <span class="chip">${escapeHtml(displayCourseLabel(item))}</span>
              ${strategyChip}
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

    const strategy = findMorningStrategy(item);
    const metaParts = [
      displayCourseLabel(item),
      strategy ? strategy.shortLabel : null,
      `第 ${item.page} 页`,
      `条件胜率 / 实战优先级：${item.grade}`,
    ].filter(Boolean);
    els.readerMeta.textContent = metaParts.join(" / ");
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
          ["主题", displayCourseLabel(item)],
          ["市场周期", item.cycle || "说明页"],
          ["页面类型", item.kind === "pattern" ? "形态页" : "说明页"],
          ["教学提醒", item.summary],
        ];
    const enhancedEntries = strategy ? [["早盘策略", `${strategy.label}：${strategy.description}`], ...noteEntries] : noteEntries;
    els.readerNotes.innerHTML = enhancedEntries
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

  function displayCourseLabel(item) {
    if (isMorningPage(item) && (state.course === "morning" || String(state.section).startsWith("morning"))) {
      return "早盘策略";
    }
    return item.courseLabel;
  }

  function moveSelection(delta) {
    const pages = filteredPages();
    if (!pages.length) return;
    const currentIndex = pages.findIndex((item) => item.id === state.selectedId);
    const safeIndex = currentIndex === -1 ? 0 : currentIndex;
    const nextIndex = Math.min(Math.max(safeIndex + delta, 0), pages.length - 1);
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
