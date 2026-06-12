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
      options: [
        { id: "all", label: "全部页面", description: "查看两份资料和早盘策略入口。" },
        { id: "start-here", label: "先读规则与图例", kind: "front", description: "把图例、入场触发、结构止损和风险提醒先看完。" },
      ],
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

  const learningPath = [
    { section: "start-here", label: "先读规则", note: "图例、触发价、止损、风险声明" },
    { section: "atlas-a-plus", label: "先学顺势", note: "强趋势、强突破、第一次回踩" },
    { section: "atlas-a", label: "再学反转", note: "趋势线突破、测试失败、第二信号" },
    { section: "morning-trend", label: "进入早盘", note: "趋势从开盘、Gap-and-Go、开盘回踩" },
    { section: "morning-no-trade", label: "最后避坑", note: "开盘乱入场、区间中部、无跟随" },
  ];

  const curriculumGroups = [
    {
      title: "开始前先看",
      subtitle: "规则、图例、风险",
      items: ["start-here", "atlas-front", "opening-front"],
    },
    {
      title: "形态图谱主线",
      subtitle: "从顺势到避坑",
      items: ["atlas-a-plus", "atlas-a", "atlas-b", "atlas-c", "atlas-d"],
    },
    {
      title: "开盘专题",
      subtitle: "前 60-90 分钟",
      items: ["opening-a-plus", "opening-a", "opening-b", "opening-c", "opening-d"],
    },
    {
      title: "早盘策略",
      subtitle: "按实战流程复盘",
      items: ["morning-trend", "morning-reversal", "morning-range", "morning-breakout", "morning-filter", "morning-no-trade"],
    },
  ];

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
    learningPath: document.getElementById("learningPath"),
    curriculumNav: document.getElementById("curriculumNav"),
    activeCrumb: document.getElementById("activeCrumb"),
    courseFilters: document.getElementById("courseFilters"),
    directorySelect: document.getElementById("directorySelect"),
    directoryHint: document.getElementById("directoryHint"),
    gradeFilters: document.getElementById("gradeFilters"),
    strategyBoard: document.getElementById("strategyBoard"),
    searchInput: document.getElementById("searchInput"),
    resetFilters: document.getElementById("resetFilters"),
    cardGrid: document.getElementById("cardGrid"),
    resultTitle: document.getElementById("resultTitle"),
    resultCount: document.getElementById("resultCount"),
    readerMeta: document.getElementById("readerMeta"),
    readerTitle: document.getElementById("readerTitle"),
    readerImage: document.getElementById("readerImage"),
    readerTextPage: document.getElementById("readerTextPage"),
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
    buildLearningPath();
    buildCurriculumNav();
    buildStrategyBoard();
    bindEvents();
    applySection("start-here", { renderNow: false });
    const initial = filteredPages()[0] || allPages[0];
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

  function buildLearningPath() {
    els.learningPath.innerHTML = learningPath
      .map((step, index) => {
        const section = sectionById[step.section];
        return `<button type="button" class="path-step" data-section="${step.section}">
          <span class="path-index">${index + 1}</span>
          <span class="path-copy">
            <strong>${escapeHtml(step.label)}</strong>
            <small>${escapeHtml(step.note)}</small>
          </span>
          <em>${countSection(section)}</em>
        </button>`;
      })
      .join("");
  }

  function buildCurriculumNav() {
    els.curriculumNav.innerHTML = curriculumGroups
      .map((group, groupIndex) => {
        const items = group.items
          .map((sectionId) => sectionById[sectionId])
          .filter(Boolean)
          .map((section) => {
            const count = countSection(section);
            return `<button type="button" class="curriculum-item" data-section="${section.id}">
              <span>
                <strong>${escapeHtml(humanLabel(section))}</strong>
                <small>${escapeHtml(section.description || "")}</small>
              </span>
              <em>${count}</em>
            </button>`;
          })
          .join("");
        return `<details class="curriculum-group" ${groupIndex < 2 ? "open" : ""}>
          <summary>
            <span>
              <strong>${escapeHtml(group.title)}</strong>
              <small>${escapeHtml(group.subtitle)}</small>
            </span>
          </summary>
          <div class="curriculum-items">${items}</div>
        </details>`;
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
    els.learningPath.addEventListener("click", (event) => {
      const btn = event.target.closest("button[data-section]");
      if (!btn) return;
      syncQuery();
      applySection(btn.dataset.section, { focusReader: true });
    });

    els.curriculumNav.addEventListener("click", (event) => {
      const btn = event.target.closest("button[data-section]");
      if (!btn) return;
      syncQuery();
      applySection(btn.dataset.section, { focusReader: true });
    });

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
      focusReader();
    });

    els.directorySelect.addEventListener("change", (event) => {
      syncQuery();
      applySection(event.target.value, { focusReader: true });
    });

    els.gradeFilters.addEventListener("click", (event) => {
      const sectionBtn = event.target.closest("button[data-section]");
      if (sectionBtn) {
        syncQuery();
        applySection(sectionBtn.dataset.section, { focusReader: true });
        return;
      }

      const gradeBtn = event.target.closest("button[data-grade]");
      if (!gradeBtn) return;
      syncQuery();
      state.grade = gradeBtn.dataset.grade;
      state.section = deriveSectionFromCourseAndGrade(state.course, state.grade);
      state.selectedId = null;
      render();
      focusReader();
    });

    els.strategyBoard.addEventListener("click", (event) => {
      const btn = event.target.closest("button[data-section]");
      if (!btn) return;
      syncQuery();
      applySection(btn.dataset.section, { focusReader: true });
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

  function applySection(sectionId, options = {}) {
    const section = sectionById[sectionId] || sectionById.all;
    state.section = section.id;
    state.course = section.course === "morning" ? "morning" : section.course || "all";
    state.grade = section.grade || "all";
    state.selectedId = null;
    if (options.renderNow !== false) {
      render();
      if (options.focusReader) focusReader();
    }
  }

  function focusReader() {
    requestAnimationFrame(() => {
      const reader = document.querySelector(".reader");
      if (!reader) return;
      const stickyOffset = 92;
      const top = reader.getBoundingClientRect().top + window.scrollY - stickyOffset;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    });
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
    state.query = "";
    els.searchInput.value = "";
    applySection("start-here", { renderNow: false });
    render();
    focusReader();
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
    els.activeCrumb.textContent = humanLabel(section);
    const activeCurriculumItem = els.curriculumNav.querySelector(`button[data-section="${CSS.escape(state.section)}"]`);
    if (activeCurriculumItem) {
      activeCurriculumItem.closest("details")?.setAttribute("open", "");
    }

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
    const sectionLabel = section && section.id !== "all" ? humanLabel(section) : courseLabels[state.course];
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
          ${renderCardPreview(item)}
          <div class="card-body">
            <h3 class="card-title">${escapeHtml(item.title)}</h3>
            <p class="card-summary">${escapeHtml(cardSummary(item))}</p>
            <div class="chips">
              <span class="chip">${escapeHtml(displayCourseLabel(item))}</span>
              ${strategyChip}
              <span class="chip" style="color:${gradeColor}">${item.grade}</span>
              <span class="chip">第 ${item.page} 页</span>
            </div>
            <span class="card-open-hint">点击后在上方大图阅读</span>
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

  function renderCardPreview(item) {
    if (item.kind === "front") {
      const bullets = frontPreviewBullets(item);
      return `<div class="thumb readable-thumb">
        <span class="preview-kicker">${escapeHtml(displayCourseLabel(item))} / 说明页</span>
        <strong>${escapeHtml(shortReadableTitle(item.title))}</strong>
        <ul>
          ${bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}
        </ul>
      </div>`;
    }

    const previewSrc = item.full || item.thumb;
    return `<div class="thumb chart-thumb">
      <img src="${previewSrc}" alt="${escapeHtml(item.title)} K线预览" loading="lazy" />
      <span class="thumb-badge">高清K线预览</span>
    </div>`;
  }

  function cardSummary(item) {
    if (item.kind === "front") {
      return item.summary || "说明页用于先理解图例、触发规则、结构止损和风险声明。";
    }
    const detail = item.details ? item.details["识别条件"] || item.details["开盘背景 / 识别条件"] : "";
    return trimText(detail || item.summary || "点击后在阅读器里查看大图和完整说明。", 92);
  }

  function frontPreviewBullets(item) {
    const title = item.title;
    if (title.includes("图例")) return ["触发线", "结构止损", "第一目标区"];
    if (title.includes("胜率")) return ["条件胜率", "背景过滤", "实战优先级"];
    if (title.includes("市场周期")) return ["趋势", "交易区间", "突破模式"];
    if (title.includes("入场")) return ["信号棒完成", "突破触发", "未触发不成交"];
    if (title.includes("风险")) return ["教学用途", "不是建议", "先看风险收益"];
    if (title.includes("开盘")) return ["前5分钟", "18-20根K线", "等待确认"];
    return ["先读规则", "再看图谱", "最后复盘"];
  }

  function shortReadableTitle(title) {
    return String(title).replace(/^封面：/, "").replace(/^0?\d+\s*/, "");
  }

  function trimText(text, maxLength) {
    const clean = String(text).replace(/\s+/g, " ").trim();
    return clean.length > maxLength ? `${clean.slice(0, maxLength)}...` : clean;
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
    renderReaderVisual(item);

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

    window.dispatchEvent(
      new CustomEvent("learning-site:page-selected", {
        detail: {
          item,
          strategy,
          state: { ...state },
        },
      })
    );

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

  function renderReaderVisual(item) {
    if (item.kind === "front") {
      els.readerImage.hidden = true;
      els.readerImage.removeAttribute("src");
      els.readerTextPage.hidden = false;
      els.readerTextPage.innerHTML = renderFrontReader(item);
      els.openImageBtn.href = item.full;
      els.openImageBtn.textContent = "打开原始页图";
      els.openPageBtn.href = item.full;
      els.openPageBtn.style.display = "none";
      return;
    }

    els.readerTextPage.hidden = true;
    els.readerTextPage.innerHTML = "";
    els.readerImage.hidden = false;
    els.readerImage.src = item.full;
    els.readerImage.alt = item.title;
    els.openImageBtn.href = item.full;
    els.openImageBtn.textContent = "打开高清K线";
    els.openPageBtn.href = item.pageImage || item.full;
    els.openPageBtn.style.display = "";
  }

  function renderFrontReader(item) {
    const content = frontReaderContent(item);
    return `<article class="front-reader">
      <div class="front-reader-hero">
        <span>${escapeHtml(content.eyebrow)}</span>
        <h4>${escapeHtml(content.title || shortReadableTitle(item.title))}</h4>
        <p>${escapeHtml(content.lead)}</p>
      </div>
      <div class="front-reader-grid">
        ${content.cards
          .map(
            (card) => `<section class="front-reader-card">
              <span>${escapeHtml(card.label)}</span>
              <strong>${escapeHtml(card.title)}</strong>
              <p>${escapeHtml(card.body)}</p>
              <ul>${card.points.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}</ul>
            </section>`
          )
          .join("")}
      </div>
      <p class="front-reader-reminder">${escapeHtml(content.reminder)}</p>
    </article>`;
  }

  function frontReaderContent(item) {
    const commonReminder = "教学用途：条件胜率不是固定胜率，必须结合市场周期、趋势强度、K线背景、触发、止损、目标和风险收益比。";
    const contentById = {
      "atlas-front-001": {
        eyebrow: "形态图谱 / 封面",
        title: "按条件胜率与实战优先级排序",
        lead: "这份图谱的核心不是背形态，而是先判断背景，再等待触发。顺强趋势、强突破后回踩和有跟随的信号优先。",
        cards: [
          { label: "阅读顺序", title: "先背景，再形态", body: "形态只在正确市场周期里有教学意义。", points: ["先看趋势或区间", "再看信号棒质量", "最后看目标空间"] },
          { label: "概率表述", title: "只讲条件概率", body: "任何形态都不能脱离背景谈固定胜率。", points: ["条件胜率", "实战优先级", "背景过滤"] },
          { label: "图表来源", title: "原创合成K线", body: "所有图是教学示意，不复制第三方图表。", points: ["保留重叠和假突破", "不画完美模式", "不作为交易建议"] },
        ],
        reminder: commonReminder,
      },
      "atlas-front-002": {
        eyebrow: "形态图谱 / 使用方法",
        title: "如何阅读本图谱",
        lead: "每一页都按识别条件、入场逻辑、止损与目标、放弃条件来读。重点是等待成交触发，而不是看到形态就进。",
        cards: [
          { label: "Signal Bar", title: "信号棒必须先完成", body: "多头看信号棒高点，空头看信号棒低点。", points: ["收盘前不提前判定", "弱信号棒要过滤", "Doji 不宜硬做"] },
          { label: "Entry Trigger", title: "突破触发才算入场", body: "多头必须突破信号棒高点，空头必须跌破信号棒低点。", points: ["未突破不成交", "触发价不是收盘价", "不要把箭头画在棒内"] },
          { label: "Exit Logic", title: "先定义结构止损", body: "止损放在结构之外，目标看前高前低、区间边缘、EMA 或测量目标。", points: ["结构止损", "第一目标区", "目标空间要够"] },
        ],
        reminder: "读图时先问：现在是趋势、区间还是突破模式？再问：这个信号有没有真正触发？",
      },
      "atlas-front-003": {
        eyebrow: "形态图谱 / 图例",
        title: "图例说明",
        lead: "图例的目的是把触发、止损、目标和过滤区分清楚。箭头只表示可能的触发边界，不表示保证成交或保证到达目标。",
        cards: [
          { label: "触发线", title: "Entry Trigger / 入场触发价", body: "虚线表示等待突破的价格。", points: ["多头在高点上方", "空头在低点下方", "未突破就是等待"] },
          { label: "风险线", title: "结构止损", body: "止损必须依附结构，而不是固定比例。", points: ["信号棒低点/高点", "摆动点之外", "失败突破点之外"] },
          { label: "过滤区", title: "No Trade / 等待", body: "低质量背景不强行标入场。", points: ["区间中部", "无跟随突破", "目标空间不足"] },
        ],
        reminder: "最常见误用：把图例箭头当成即时买卖点，而不是等待触发价。",
      },
      "atlas-front-004": {
        eyebrow: "形态图谱 / 等级",
        title: "胜率等级说明",
        lead: "A+ 到 D 表示实战优先级和条件概率，不表示固定胜率。等级越高，对背景和跟随确认的要求越明确。",
        cards: [
          { label: "A+ / A", title: "优先学习", body: "强趋势、强突破、清晰回踩、有跟随。", points: ["顺势优先", "连续K线确认", "回踩不深"] },
          { label: "B / C", title: "必须过滤", body: "可交易或可观察，但对位置和目标空间更敏感。", points: ["看区间边缘", "避免中部追单", "降低预期"] },
          { label: "D", title: "主要用于避坑", body: "训练不交易比强行交易更重要。", points: ["弱信号棒", "无跟随", "逆强趋势第一反转"] },
        ],
        reminder: commonReminder,
      },
      "atlas-front-005": {
        eyebrow: "形态图谱 / 市场周期",
        title: "市场周期说明",
        lead: "同一个形态在趋势、交易区间、突破模式里的含义完全不同。先判断周期，再决定要顺势、低买高卖，还是等待。",
        cards: [
          { label: "Trend", title: "趋势环境", body: "优先顺势，回调和突破点测试更有价值。", points: ["小回调趋势", "紧密通道", "EMA 支撑/压力"] },
          { label: "Range", title: "交易区间", body: "区间中部信号质量差，边缘才有结构。", points: ["低买高卖", "中部过滤", "假突破常见"] },
          { label: "Transition", title: "转换阶段", body: "突破模式和高潮后要等确认。", points: ["强收盘", "跟随K线", "二次信号"] },
        ],
        reminder: "新手最容易把区间中部当趋势开始，或把强趋势里的第一根逆势棒当反转。",
      },
      "atlas-front-006": {
        eyebrow: "形态图谱 / 入场规则",
        title: "入场标注规则",
        lead: "所有入场都必须等信号棒完成后触发。提前在信号棒内部、收盘价或主观猜测位置标入场，都会误导学习。",
        cards: [
          { label: "多头", title: "高点上方触发", body: "下一根或后续K线突破信号棒高点才算触发。", points: ["不在棒内买", "不在收盘价买", "未突破不成交"] },
          { label: "空头", title: "低点下方触发", body: "下一根或后续K线跌破信号棒低点才算触发。", points: ["不提前卖", "不追无确认突破", "弱信号过滤"] },
          { label: "开盘", title: "突破要有确认", body: "开盘突破尤其需要强收盘和跟随K线。", points: ["突破尝试", "突破确认", "失败突破快速回区间"] },
        ],
        reminder: "最重要的一句：没有突破信号棒高点或低点，就没有成交。",
      },
      "atlas-front-007": {
        eyebrow: "形态图谱 / 风险",
        title: "风险与误用提醒",
        lead: "本网站是交易教育资料，不提供真实投资建议。价格行为训练的重点是识别条件、过滤低质量机会和控制风险。",
        cards: [
          { label: "风险", title: "先算止损和目标", body: "如果止损过远或目标空间不足，形态再像也不值得做。", points: ["结构止损", "第一目标区", "风险收益比"] },
          { label: "误用", title: "不要只看单根K线", body: "单根大阳线或大阴线不能代表趋势必然延续。", points: ["看跟随", "看位置", "看市场周期"] },
          { label: "纪律", title: "No Trade 是训练重点", body: "很多场景最好的决策是等待。", points: ["区间中部", "新闻前后", "混乱重叠"] },
        ],
        reminder: commonReminder,
      },
      "opening-front-001": {
        eyebrow: "开盘专题 / 封面",
        title: "开盘前 60-90 分钟核心形态",
        lead: "开盘波动大、假突破多，先观察方向性和跟随，再决定是趋势从开盘、开盘区间，还是反转失败。",
        cards: [
          { label: "前5分钟", title: "先观察", body: "不要把第一根大K线当成确定趋势。", points: ["看缺口接受", "看实体与影线", "不急着追"] },
          { label: "前15分钟", title: "初步分类", body: "判断趋势从开盘还是交易区间开盘。", points: ["连续收高/低", "回调深浅", "是否重叠"] },
          { label: "60-90分钟", title: "等待结构", body: "用开盘区间、EMA、前日价位和跟随确认。", points: ["强收盘", "跟随K线", "失败突破"] },
        ],
        reminder: "开盘专题尤其强调：兴奋不是信号，确认才是信号。",
      },
      "opening-front-002": {
        eyebrow: "开盘专题 / 框架",
        title: "开盘时段框架",
        lead: "开盘不是一个瞬间，而是一段信息逐步清晰的过程。越早的信号越需要谨慎，越靠近结构边界越有参考价值。",
        cards: [
          { label: "5分钟", title: "波动和噪音最大", body: "主要观察缺口方向、第一组K线强弱和是否有跟随。", points: ["不预测", "不乱入", "看收盘位置"] },
          { label: "15-30分钟", title: "方向开始显形", body: "趋势从开盘通常回调浅，区间开盘通常重叠多。", points: ["趋势强度", "回踩质量", "是否围绕开盘价"] },
          { label: "60-90分钟", title: "结构更可靠", body: "开盘区间、前日高低点、VWAP/EMA 和测量目标更有意义。", points: ["边缘交易", "突破确认", "失败突破反向"] },
        ],
        reminder: "不要把时间越早误以为机会越好；开盘越乱，越要等。",
      },
      "opening-front-003": {
        eyebrow: "开盘专题 / 18-20根K线",
        title: "18-20 根K线开盘区间说明",
        lead: "开盘后约 18-20 根K线可能形成可观察区间。突破这个区间后，方向判断通常比第一根K线可靠。",
        cards: [
          { label: "观察区", title: "先画区间高低点", body: "用浅色区域标出开盘观察区，不急着判断方向。", points: ["Opening Range High", "Opening Range Low", "中轴过滤"] },
          { label: "突破", title: "区分尝试和确认", body: "强收盘加跟随K线才更接近确认突破。", points: ["突破尝试", "强收盘", "跟随K线"] },
          { label: "失败", title: "快速回区间要小心", body: "无跟随、重回区间，常变成反向机会或 No Trade。", points: ["假突破", "反向触发", "目标空间"] },
        ],
        reminder: "18-20 根K线不是机械规则，而是帮助你等市场给出更多信息。",
      },
      "opening-front-004": {
        eyebrow: "开盘专题 / 图例",
        title: "图例页",
        lead: "开盘图必须标出开盘价、前日收盘价、缺口、开盘区间高低点和突破确认。缺口方向本身不是交易理由。",
        cards: [
          { label: "Open", title: "开盘价与缺口", body: "涉及缺口时同时标出前日收盘价。", points: ["Open / 开盘价", "Prior Close", "Gap 方向"] },
          { label: "Range", title: "开盘区间", body: "区间高低点是早盘最重要的参考边界。", points: ["OR High", "OR Low", "中轴少交易"] },
          { label: "Breakout", title: "突破确认", body: "突破必须看强收盘和跟随，不把第一根突破尝试当结论。", points: ["触发线", "跟随K线", "失败突破"] },
        ],
        reminder: "开盘看到缺口就追，是最常见的误判之一。",
      },
      "opening-front-005": {
        eyebrow: "开盘专题 / 入场",
        title: "入场标注规则",
        lead: "开盘入场仍然遵守信号棒和触发价规则，只是过滤更严格。突破类必须区分突破尝试和突破确认。",
        cards: [
          { label: "多头", title: "信号棒高点上方", body: "等待下一根或后续K线突破信号棒高点。", points: ["不提前", "要跟随", "看回踩低点"] },
          { label: "空头", title: "信号棒低点下方", body: "等待下一根或后续K线跌破信号棒低点。", points: ["不猜顶部", "要确认", "看反弹高点"] },
          { label: "过滤", title: "开盘更要等待", body: "重叠太多、无跟随、目标不足时不交易。", points: ["No Trade", "等待二次信号", "避免中部突破"] },
        ],
        reminder: "开盘第一根K线结束，不等于趋势已经确定。",
      },
      "opening-front-006": {
        eyebrow: "开盘专题 / 风险",
        title: "风险提醒",
        lead: "开盘时段波动更大，止损更宽，假突破更多。学习重点是确认和过滤，而不是提高下单频率。",
        cards: [
          { label: "波动", title: "止损可能更宽", body: "如果结构止损过远，就降低仓位或放弃。", points: ["开盘回踩高低点", "区间另一侧", "失败突破点之外"] },
          { label: "假突破", title: "无跟随就警惕", body: "突破后立刻回到区间内，不要继续按突破思路硬做。", points: ["强收盘", "跟随K线", "快速回区间"] },
          { label: "纪律", title: "慢一点反而更清楚", body: "前 5 分钟更多是观察，不是证明自己反应快。", points: ["等结构", "等确认", "等目标空间"] },
        ],
        reminder: "开盘交易最容易输在提前入场，而不是看不懂形态。",
      },
    };

    return (
      contentById[item.id] || {
        eyebrow: `${displayCourseLabel(item)} / 说明页`,
        title: shortReadableTitle(item.title),
        lead: item.summary || "先理解规则、图例和风险，再进入形态学习。",
        cards: [
          { label: "先学", title: "规则与背景", body: "先判断市场周期和趋势强度。", points: ["趋势", "交易区间", "突破模式"] },
          { label: "再看", title: "触发与结构", body: "确认信号棒和入场触发价。", points: ["信号棒", "触发价", "结构止损"] },
          { label: "最后", title: "过滤与复盘", body: "目标空间不足或无跟随时放弃。", points: ["No Trade", "第一目标区", "常见误判"] },
        ],
        reminder: commonReminder,
      }
    );
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
    els.readerImage.hidden = false;
    els.readerTextPage.hidden = true;
    els.readerTextPage.innerHTML = "";
    els.openImageBtn.href = "#";
    els.openPageBtn.href = "#";
    els.readerNotes.innerHTML = "";
    els.prevBtn.disabled = true;
    els.nextBtn.disabled = true;
  }

  function humanLabel(section) {
    const labels = {
      all: "全部资料",
      "start-here": "先读规则与图例",
      "atlas-all": "形态图谱全部",
      "atlas-a-plus": "强趋势与突破",
      "atlas-a": "确认后的反转",
      "atlas-b": "区间与背景交易",
      "atlas-c": "低概率过滤",
      "atlas-d": "避坑清单",
      "atlas-front": "图谱使用说明",
      "opening-all": "开盘专题全部",
      "opening-a-plus": "开盘强趋势",
      "opening-a": "开盘确认反转",
      "opening-b": "开盘区间与突破",
      "opening-c": "开盘低概率过滤",
      "opening-d": "开盘避坑",
      "opening-front": "开盘阅读框架",
      "morning-all": "早盘策略全部",
      "morning-a-plus": "趋势从开盘策略",
      "morning-a": "开盘反转策略",
      "morning-b": "区间与突破策略",
      "morning-c": "低概率过滤策略",
      "morning-d": "No Trade 开盘陷阱",
      "morning-trend": "趋势从开盘",
      "morning-reversal": "开盘反转",
      "morning-range": "18-20 根K线区间",
      "morning-breakout": "突破模式",
      "morning-filter": "低概率过滤",
      "morning-no-trade": "No Trade 开盘陷阱",
    };
    return labels[section?.id] || section?.label || "全部资料";
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  window.LEARNING_SITE_APP = {
    pages: allPages,
    getState: () => ({ ...state }),
    getSelectedPage: () => allPages.find((page) => page.id === state.selectedId) || null,
    selectPage: (id, scrollReader = true) => selectPage(id, scrollReader),
    applySection: (sectionId) => applySection(sectionId, { focusReader: true }),
    filteredPages: () => filteredPages(),
  };

  init();
})();
