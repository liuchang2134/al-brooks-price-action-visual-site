(function () {
  const data = window.LEARNING_SITE_DATA || { pages: [] };
  const app = window.LEARNING_SITE_APP;
  const pages = data.pages || [];

  const SUPABASE_URL = "https://seumgrqucjdmnbobjyuc.supabase.co";
  const SUPABASE_KEY = "sb_publishable_Ti5p3939rI6qZ0R7vpO8Fg_maWnuYpI";

  const storageKeys = {
    progress: "ab_learning_progress_v1",
    bookmarks: "ab_learning_bookmarks_v1",
    mistakes: "ab_learning_mistakes_v1",
    attempts: "ab_learning_attempts_v1",
    journals: "ab_learning_journals_v1",
    checklist: "ab_pretrade_checklist_v1",
  };

  const els = {
    tabs: document.getElementById("studyTabs"),
    panel: document.getElementById("studyPanel"),
    readerStatus: document.getElementById("readerStatus"),
    checklist: document.getElementById("pretradeChecklist"),
  };

  const runtime = {
    client: null,
    user: null,
    mode: "loading",
    syncMessage: "正在连接学习数据库",
    activeTab: "starter",
    currentPage: null,
    progress: new Map(),
    bookmarks: new Map(),
    mistakes: [],
    attempts: [],
    journals: [],
    glossaryQuery: "",
    activeScenario: "trend-pullback",
    scenarioStep: 0,
    answered: null,
    treeNode: "start",
    reviewDraft: null,
  };

  const primaryTasks = [
    {
      id: "starter",
      label: "学习路径",
      eyebrow: "先学什么",
      description: "基础术语、市场周期、趋势、突破、回调、反转、区间、开盘、避坑。",
      outcome: "适合按阶段推进，不在 198 页里迷路。",
      cta: "查看路径",
    },
    {
      id: "bar",
      label: "逐K训练",
      eyebrow: "练判断",
      description: "隐藏未来K线，回答趋势、区间、触发还是等待。",
      outcome: "适合训练 Brooks 式 bar-by-bar 阅读。",
      cta: "开始逐K训练",
    },
    {
      id: "review",
      label: "复盘本",
      eyebrow: "沉淀记录",
      description: "自动带入当前页背景、触发、止损、目标和放弃条件。",
      outcome: "适合把资料页变成自己的复盘本。",
      cta: "生成复盘草稿",
    },
  ];

  const supportTools = [
    {
      id: "theory",
      label: "理论地图",
      description: "市场周期、Always In、触发、MTR、区间和风险。",
    },
    {
      id: "glossary",
      label: "术语词典",
      description: "Signal Bar、H2、MTR、Measured Move 等中英对照。",
    },
    {
      id: "noTrade",
      label: "No Trade",
      description: "区间中部、弱信号、无跟随和目标空间不足。",
    },
    {
      id: "openingTree",
      label: "开盘决策树",
      description: "前5分钟、前15分钟、18-20根K线和突破确认。",
    },
    {
      id: "chartClinic",
      label: "图表读法",
      description: "用六层检查法阅读当前K线图，避免只盯箭头。",
    },
    {
      id: "compare",
      label: "形态对比",
      description: "好的 H2 vs 差的 H2，强突破 vs 弱突破。",
    },
  ];

  const pathStages = [
    {
      id: "terms",
      title: "基础术语",
      section: "start-here",
      first: "先看信号棒、触发价、结构止损、第一目标区。",
      next: "再看 H1/H2、L1/L2、MTR、Final Flag。",
      drill: "练习把每张图先拆成背景、信号棒、触发、止损、目标。",
    },
    {
      id: "cycle",
      title: "市场周期",
      section: "atlas-front",
      first: "先区分趋势、交易区间、突破模式、高潮和转换阶段。",
      next: "再看同一个形态在趋势和区间里的优先级变化。",
      drill: "每看一页先写一句：现在是趋势、区间还是突破模式。",
    },
    {
      id: "trend",
      title: "趋势",
      section: "atlas-a-plus",
      first: "先学强趋势突破、第一次回踩、小回调趋势、微型通道。",
      next: "再看 EMA 回踩、突破点测试和测量缺口。",
      drill: "只标顺势触发价，不标提前入场。",
    },
    {
      id: "breakout",
      title: "突破",
      section: "atlas-a-plus",
      first: "先看强突破和跟随K线。",
      next: "再比较强突破、弱突破、无跟随突破。",
      drill: "给每个突破写一句：市场是否接受了这个价格区间。",
    },
    {
      id: "pullback",
      title: "回调",
      section: "atlas-a",
      first: "先学 H1/H2、L1/L2 和趋势中两段式回调。",
      next: "再看前突破点、EMA、前摆动点共振。",
      drill: "只在信号棒完成后看是否突破高点或低点触发。",
    },
    {
      id: "reversal",
      title: "反转",
      section: "atlas-a",
      first: "先学趋势线突破后测试极端点失败。",
      next: "再看 MTR、楔形高潮、Final Flag 失败和第二信号。",
      drill: "强趋势第一次逆势反转默认降级处理。",
    },
    {
      id: "range",
      title: "交易区间",
      section: "atlas-b",
      first: "先学区间边缘低买高卖和失败突破。",
      next: "再看三角形、扩张三角形、突破模式。",
      drill: "区间中部只训练等待，不训练追单。",
    },
    {
      id: "opening",
      title: "开盘",
      section: "morning-trend",
      first: "前 5 分钟只观察，前 15 分钟判断趋势从开盘或区间。",
      next: "18-20 根K线确认开盘区间，突破后看强收盘和跟随。",
      drill: "开盘突破必须区分突破尝试和突破确认。",
    },
    {
      id: "avoid",
      title: "避坑",
      section: "atlas-d",
      first: "先看 D 级和 No Trade 场景。",
      next: "再把 C 级弱信号当过滤训练，而不是找交易理由。",
      drill: "每次复盘至少记录一个不交易理由。",
    },
  ];

  const glossary = [
    {
      term: "Signal Bar",
      cn: "信号棒",
      diagram: "signal",
      meaning: "等待它完成后，才评估下一根是否突破高点或低点触发。",
      mistake: "新手常把信号棒收盘价当入场价，实际触发价在信号棒之外。",
    },
    {
      term: "Entry Trigger",
      cn: "入场触发价",
      diagram: "triggerBull",
      meaning: "多头在信号棒高点上方触发，空头在信号棒低点下方触发。",
      mistake: "未突破信号棒高低点就提前进场，等于把条件交易改成猜方向。",
    },
    {
      term: "H1 / H2",
      cn: "多头第一次 / 第二次回调入场",
      diagram: "h2",
      meaning: "趋势或回调背景下，第二次向上触发通常比第一次更清楚。",
      mistake: "忽略趋势强度和信号棒质量，只因看到 H2 名称就买。",
    },
    {
      term: "L1 / L2",
      cn: "空头第一次 / 第二次反弹入场",
      diagram: "l2",
      meaning: "下跌趋势里，反弹失败后跌破信号棒低点才算空头触发。",
      mistake: "把反弹中的小阴线当作已经成交，而不是等待低点下方触发。",
    },
    {
      term: "MTR",
      cn: "主要趋势反转",
      diagram: "mtr",
      meaning: "通常需要趋势线突破、测试极端点失败、强反向信号和跟随。",
      mistake: "强趋势第一次逆势K线就抄底摸顶，确认条件不够。",
    },
    {
      term: "Final Flag",
      cn: "最终旗形",
      diagram: "finalFlag",
      meaning: "趋势后段小整理失败，可能成为反转前最后一段延续尝试。",
      mistake: "看到整理就认定反转，忽略是否已经失败和是否有反向跟随。",
    },
    {
      term: "Micro Channel",
      cn: "微型通道",
      diagram: "micro",
      meaning: "连续K线低点或高点沿同一方向推进，说明短线趋势紧密。",
      mistake: "在紧密通道中做第一次逆势反转，通常需要降低预期或等待。",
    },
    {
      term: "Breakout Mode",
      cn: "突破模式",
      diagram: "breakoutMode",
      meaning: "多空都可能突破，重点是边界、强收盘和跟随，而不是预测方向。",
      mistake: "在三角形或区间中部强行预判方向。",
    },
    {
      term: "Measured Move",
      cn: "测量目标",
      diagram: "measured",
      meaning: "用区间高度、突破腿或缺口结构估算第一目标区。",
      mistake: "把测量目标当保证到达，而不是第一目标区参考。",
    },
    {
      term: "Breakout Point Test",
      cn: "突破点回踩",
      diagram: "breakoutTest",
      meaning: "突破后回踩不破突破点，再顺势触发。",
      mistake: "突破刚发生就追，没看市场是否接受突破价位。",
    },
    {
      term: "Opening Range",
      cn: "开盘区间",
      diagram: "openingRange",
      meaning: "开盘后形成的高低边界，18-20 根K线后更容易判断方向。",
      mistake: "前 5 分钟波动大就立刻认定全天方向。",
    },
    {
      term: "No Trade",
      cn: "等待 / 放弃",
      diagram: "noTrade",
      meaning: "当背景混乱、区间中部、无跟随或目标空间不足时主动不交易。",
      mistake: "把不交易看成错过机会，实际它是过滤能力的一部分。",
    },
    {
      term: "Always In",
      cn: "当前主导方向",
      diagram: "micro",
      meaning: "用连续收盘、突破接受度和回调深浅判断市场当前更偏多还是偏空。",
      mistake: "把 Always In 当成必须持仓，而不是判断主导力量的框架。",
    },
    {
      term: "Second Entry",
      cn: "二次入场",
      diagram: "h2",
      meaning: "第一次尝试失败后，第二次触发更能说明对手方力量不足。",
      mistake: "在没有趋势背景或结构边缘时，机械认为第二次一定更好。",
    },
    {
      term: "Failed Breakout",
      cn: "失败突破",
      diagram: "weakBreakout",
      meaning: "突破边界后没有跟随并快速回到区间内，才进入失败突破观察。",
      mistake: "突破刚发生就预测失败，而不是等无跟随和反向触发。",
    },
    {
      term: "Trend Channel Line",
      cn: "趋势通道线",
      diagram: "breakoutTest",
      meaning: "通道线帮助判断趋势是否加速、过冲、衰竭或进入转换。",
      mistake: "看到碰到通道线就立刻反转，忽略是否有确认K线。",
    },
    {
      term: "Opening Reversal",
      cn: "开盘反转",
      diagram: "openingConfirm",
      meaning: "开盘测试关键价位失败后，出现强反向信号和跟随。",
      mistake: "把开盘第一根反向K线当确认，忽略关键位和跟随。",
    },
    {
      term: "Gap Fill",
      cn: "缺口回补",
      diagram: "openingFake",
      meaning: "缺口方向没有被接受时，价格可能回到前日收盘或缺口区域。",
      mistake: "看到缺口就盲目追方向，没看开盘后是否接受缺口。",
    },
    {
      term: "Climax",
      cn: "高潮",
      diagram: "counterTrend",
      meaning: "连续加速K线或远离均线后，市场可能从趋势进入回调或转换。",
      mistake: "高潮后没有确认就直接反向交易。",
    },
    {
      term: "Trader's Equation",
      cn: "交易方程",
      diagram: "badRisk",
      meaning: "综合条件概率、风险、目标和仓位，而不是只看胜率。",
      mistake: "形态看起来好，但目标空间小于风险仍然交易。",
    },
  ];

  const noTradeSetups = [
    {
      id: "middle-range",
      title: "交易区间中部信号",
      pageId: "atlas-082",
      diagram: "noTrade",
      reason: "中部没有清晰支撑阻力，向上向下都容易被拉回。",
      waitFor: "等待到区间边缘，或等待强突破加跟随K线。",
      mistake: "看到单根信号棒就忘记位置。",
    },
    {
      id: "weak-breakout",
      title: "弱突破无跟随",
      pageId: "atlas-084",
      diagram: "weakBreakout",
      reason: "突破后马上重叠或被拉回，说明市场没有接受突破价位。",
      waitFor: "等待二次突破、回踩成功，或反向失败突破触发。",
      mistake: "把突破尝试当确认突破。",
    },
    {
      id: "first-countertrend",
      title: "强趋势第一次逆势反转",
      pageId: "atlas-088",
      diagram: "counterTrend",
      reason: "主趋势仍强，第一次反向信号常只是回调的一部分。",
      waitFor: "至少等待趋势线突破、测试极端点失败和第二信号。",
      mistake: "想买最低或卖最高。",
    },
    {
      id: "risk-too-large",
      title: "止损过远或目标空间不足",
      pageId: "atlas-112",
      diagram: "badRisk",
      reason: "结构止损太远或第一目标区太近，风险收益比不支持。",
      waitFor: "等待更靠近结构边缘的触发，或直接放弃。",
      mistake: "用固定仓位硬扛过大的结构风险。",
    },
    {
      id: "opening-chop",
      title: "开盘前 5 分钟无确认",
      pageId: "opening-071",
      diagram: "openingChop",
      reason: "开盘噪音大，第一根大K线不等于确认趋势。",
      waitFor: "等待前 15 分钟结构，或 18-20 根K线区间。",
      mistake: "因为开盘激动而提前入场。",
    },
  ];

  const comparisons = [
    {
      title: "好的 H2 vs 差的 H2",
      good: { label: "好的 H2", diagram: "h2", points: ["趋势清楚", "回调浅", "第二次触发", "目标空间够"] },
      bad: { label: "差的 H2", diagram: "badH2", points: ["区间中部", "K线重叠", "信号棒弱", "触发后无跟随"] },
      links: ["atlas-007", "atlas-072"],
    },
    {
      title: "强突破 vs 弱突破",
      good: { label: "强突破", diagram: "breakoutStrong", points: ["强收盘", "连续跟随", "回踩不深", "突破点被接受"] },
      bad: { label: "弱突破", diagram: "weakBreakout", points: ["影线多", "收盘一般", "立刻回区间", "没有跟随"] },
      links: ["atlas-001", "atlas-084"],
    },
    {
      title: "区间边缘反转 vs 区间中部追单",
      good: { label: "区间边缘", diagram: "rangeEdge", points: ["靠近边界", "有失败突破", "止损结构清楚", "目标到中轴或另一侧"] },
      bad: { label: "区间中部", diagram: "noTrade", points: ["上下空间都有限", "多空都容易失败", "止损不清楚", "常被来回打"] },
      links: ["atlas-052", "atlas-100"],
    },
    {
      title: "开盘确认突破 vs 开盘突破尝试",
      good: { label: "确认突破", diagram: "openingConfirm", points: ["强收盘", "跟随K线", "回踩边界不破", "测量目标明确"] },
      bad: { label: "突破尝试", diagram: "openingFake", points: ["只有一根大K线", "影线长", "无跟随", "很快回到开盘区间"] },
      links: ["opening-041", "opening-067"],
    },
  ];

  const theoryPillars = [
    {
      id: "cycle",
      title: "市场周期先于形态",
      diagram: "breakoutMode",
      link: "atlas-front",
      principle: "先判断趋势、交易区间、突破模式、高潮或转换阶段，再给形态定级。",
      practice: "每张图先写一句：现在更像趋势、区间还是突破模式。",
      warning: "同一个 H2 在强趋势里可能是顺势机会，在区间中部可能只是噪音。",
    },
    {
      id: "always-in",
      title: "Always In 与主导方向",
      diagram: "micro",
      link: "atlas-a-plus",
      principle: "用连续收盘、回调深浅、突破接受度判断市场当前更偏多还是偏空。",
      practice: "只在主导方向清楚时提高优先级，逆势第一反转默认降级。",
      warning: "不要把单根大K线当成全天方向，后续跟随才是接受度。",
    },
    {
      id: "signal-trigger",
      title: "信号棒与触发价分开",
      diagram: "triggerBull",
      link: "atlas-front",
      principle: "信号棒只是准备条件，突破信号棒高点或低点才是触发条件。",
      practice: "多头写出信号棒高点上方触发价，空头写出低点下方触发价。",
      warning: "把信号棒收盘价当入场，是最危险的学习误差。",
    },
    {
      id: "pullback-second",
      title: "二次入场优于第一次逆势尝试",
      diagram: "h2",
      link: "atlas-072",
      principle: "第一次反转常只是试探，二次信号更能说明对手方失败。",
      practice: "回调里观察 H1/H2、L1/L2、测试失败和跟随K线。",
      warning: "强趋势里第一根逆势信号通常不值得高估。",
    },
    {
      id: "mtr",
      title: "主要趋势反转需要过程",
      diagram: "mtr",
      link: "atlas-021",
      principle: "MTR 通常需要趋势线突破、测试极端点失败、强反向信号和跟随。",
      practice: "先找原趋势削弱，再找测试失败，最后才看触发。",
      warning: "只看到顶部或底部大影线就反转，容易变成摸顶抄底。",
    },
    {
      id: "range",
      title: "交易区间中部默认过滤",
      diagram: "noTrade",
      link: "atlas-081",
      principle: "区间中部目标空间小、方向随机性高，最适合训练等待。",
      practice: "把区间高低点、中轴和失败突破先画出来。",
      warning: "区间中部追突破，是新手最常见的过度交易来源。",
    },
    {
      id: "opening",
      title: "开盘先观察再确认",
      diagram: "openingRange",
      link: "morning-trend",
      principle: "前 5 分钟只观察，18-20 根K线后开盘区间更有结构意义。",
      practice: "突破必须写明是尝试还是确认，确认要看强收盘和跟随。",
      warning: "看到缺口就追，常忽略缺口是否被市场接受。",
    },
    {
      id: "risk",
      title: "结构止损决定交易是否值得",
      diagram: "badRisk",
      link: "atlas-098",
      principle: "止损必须放在结构之外，目标必须来自前高前低、区间边缘或测量目标。",
      practice: "先算止损距离和第一目标空间，再决定是否继续看入场。",
      warning: "目标空间小于风险时，形态再像也应降级或放弃。",
    },
  ];

  const chartReadLayers = [
    {
      title: "1. 背景",
      question: "市场周期是什么？",
      check: "趋势、区间、突破模式、高潮、转换阶段。",
      fail: "说不清背景时，不要直接谈形态。",
    },
    {
      title: "2. 位置",
      question: "价格在哪里？",
      check: "前高前低、EMA、开盘价、区间边缘、突破点、通道线。",
      fail: "区间中部和目标空间不足默认降级。",
    },
    {
      title: "3. 力度",
      question: "谁在控制？",
      check: "强收盘、连续跟随、回调深浅、影线和重叠程度。",
      fail: "只有单根大K线，不能当作确认。",
    },
    {
      title: "4. 信号",
      question: "信号棒是否合格？",
      check: "方向、收盘位置、实体大小、是否在结构位出现。",
      fail: "Doji、长影线但收盘差、重叠严重要过滤。",
    },
    {
      title: "5. 触发",
      question: "是否真的成交？",
      check: "多头突破信号棒高点，空头跌破信号棒低点。",
      fail: "未突破信号棒边界，不算入场。",
    },
    {
      title: "6. 交易管理",
      question: "止损和目标是否成立？",
      check: "结构止损、第一目标区、减仓或退出条件。",
      fail: "止损过远或目标太近时，不交易比交易更专业。",
    },
  ];

  const practiceLoops = [
    "读图前先写市场周期，不写形态名称。",
    "圈出信号棒，再画触发价，不在信号棒内部标入场。",
    "找第一目标区，而不是机械写固定 2R。",
    "给每张图至少写一个放弃条件。",
    "复盘时把错误归类为背景错、位置错、触发错或风险错。",
  ];

  const barScenarios = [
    {
      id: "trend-pullback",
      title: "强突破后的第一次回踩",
      sourceId: "atlas-002",
      diagram: "breakoutTest",
      questions: [
        {
          visible: 9,
          question: "现在更像趋势、区间还是突破模式？",
          choices: ["趋势", "交易区间", "突破模式"],
          answer: "趋势",
          explanation: "连续强收盘并且回调浅，先按趋势背景处理。",
        },
        {
          visible: 15,
          question: "这里是否已经可以多头成交？",
          choices: ["可以", "不可以，等待信号棒高点上方触发", "必须做空"],
          answer: "不可以，等待信号棒高点上方触发",
          explanation: "信号棒完成只是准备条件，下一根或后续K线突破信号棒高点才算触发。",
        },
        {
          visible: 21,
          question: "第一目标区更合理参考哪里？",
          choices: ["前高或测量目标", "固定 2R", "任意位置"],
          answer: "前高或测量目标",
          explanation: "目标应来自结构，例如前高、突破测量位或通道线，不机械固定。",
        },
      ],
    },
    {
      id: "range-middle",
      title: "交易区间中部过滤",
      sourceId: "atlas-082",
      diagram: "noTrade",
      questions: [
        {
          visible: 10,
          question: "此时最重要的判断是什么？",
          choices: ["区间中部，优先等待", "马上追突破", "只看阳线阴线"],
          answer: "区间中部，优先等待",
          explanation: "区间中部上下目标都近，结构止损和第一目标区都不理想。",
        },
        {
          visible: 16,
          question: "如果出现小突破但没有跟随，应该怎么处理？",
          choices: ["确认突破", "等待或放弃", "加仓追单"],
          answer: "等待或放弃",
          explanation: "没有强收盘和跟随，只能算突破尝试。",
        },
      ],
    },
    {
      id: "opening-range-break",
      title: "18-20 根K线开盘区间",
      sourceId: "opening-041",
      diagram: "openingRange",
      questions: [
        {
          visible: 8,
          question: "开盘前几根K线之后，最稳妥的动作是什么？",
          choices: ["先观察", "立刻预测全天方向", "只按缺口方向追"],
          answer: "先观察",
          explanation: "前 5 分钟波动大，先看是否趋势从开盘，还是形成开盘区间。",
        },
        {
          visible: 20,
          question: "突破开盘区间后，还需要看什么？",
          choices: ["强收盘和跟随K线", "只要碰到边界就算", "不需要止损"],
          answer: "强收盘和跟随K线",
          explanation: "开盘突破必须区分突破尝试与确认突破。",
        },
      ],
    },
  ];

  const decisionTree = {
    start: {
      title: "开盘前 5 分钟",
      text: "只观察，不急着给方向。先记录开盘价、缺口、前日高低点和第一组K线强弱。",
      choices: [
        { label: "连续强收盘，回调很浅", next: "trendOpen" },
        { label: "上下影线多，重叠明显", next: "rangeWatch" },
        { label: "高开或低开后快速朝缺口方向走", next: "gapGo" },
      ],
    },
    trendOpen: {
      title: "趋势从开盘候选",
      text: "如果第一组K线方向性强，后续浅回调不破关键价，优先找顺势触发。",
      choices: [
        { label: "第一次回踩出现信号棒", next: "pullbackTrigger" },
        { label: "开始出现深回调和重叠", next: "rangeWatch" },
      ],
    },
    gapGo: {
      title: "Gap-and-Go 候选",
      text: "缺口方向必须被市场接受。看强收盘、跟随K线和回踩是否守住开盘价或突破点。",
      choices: [
        { label: "有强跟随", next: "pullbackTrigger" },
        { label: "无跟随，快速回补缺口", next: "gapFail" },
      ],
    },
    rangeWatch: {
      title: "开盘区间观察",
      text: "前 15 分钟若多空重叠，继续框出 Opening Range。到 18-20 根K线后再看边界突破。",
      choices: [
        { label: "突破区间且强收盘", next: "breakoutConfirm" },
        { label: "突破后立刻回区间", next: "failedBreakout" },
        { label: "仍在中轴附近", next: "noTrade" },
      ],
    },
    pullbackTrigger: {
      title: "顺势回调触发",
      text: "多头等信号棒高点上方触发，空头等信号棒低点下方触发。止损放结构低点或高点之外。",
      choices: [
        { label: "目标空间足够", next: "tradePlan" },
        { label: "止损太远或目标太近", next: "noTrade" },
      ],
    },
    breakoutConfirm: {
      title: "确认突破",
      text: "确认突破需要强收盘和跟随K线。第一目标区可参考开盘区间等距测量、前日高低点或当日新高新低。",
      choices: [{ label: "生成交易前检查", next: "tradePlan" }],
    },
    failedBreakout: {
      title: "失败突破",
      text: "突破、无跟随、快速回到区间内，才考虑反向触发。不要在突破刚发生时预测失败。",
      choices: [
        { label: "反向信号完成并触发", next: "tradePlan" },
        { label: "仍然重叠混乱", next: "noTrade" },
      ],
    },
    gapFail: {
      title: "Failed Gap-and-Go",
      text: "缺口方向没有跟随并快速回补，等待反转信号完成和触发。第一目标区可参考开盘价、前日收盘价或缺口填补区。",
      choices: [{ label: "继续检查触发与目标", next: "tradePlan" }],
    },
    tradePlan: {
      title: "交易前检查",
      text: "只有当市场周期、触发、结构止损、第一目标区和风险收益比都清楚时，才进入计划。否则回到等待。",
      choices: [
        { label: "重新从开盘判断", next: "start" },
        { label: "进入复盘模板", action: "draftOpening" },
      ],
    },
    noTrade: {
      title: "No Trade",
      text: "区间中部、无跟随、止损过远、目标不足或波动混乱时，最好的动作是等待下一组更清晰的K线。",
      choices: [
        { label: "重新观察区间", next: "rangeWatch" },
        { label: "记录为错题", action: "mistakeOpening" },
      ],
    },
  };

  function init() {
    if (!els.tabs || !els.panel) return;
    hydrateLocal();
    bindEvents();
    renderTabs();
    renderStudyPanel();
    setCurrentPage(app?.getSelectedPage?.() || pages.find((item) => item.kind === "pattern") || null);
    connectStorage();
  }

  function bindEvents() {
    els.tabs.addEventListener("click", (event) => {
      const btn = event.target.closest("button[data-module]");
      if (!btn) return;
      openModule(btn.dataset.module, { scroll: true });
    });

    els.panel.addEventListener("click", handlePanelClick);
    els.panel.addEventListener("input", handlePanelInput);
    els.panel.addEventListener("submit", handlePanelSubmit);
    els.readerStatus?.addEventListener("click", handleReaderStatusClick);
    els.checklist?.addEventListener("change", handleChecklistChange);
    els.checklist?.addEventListener("click", handleChecklistClick);

    window.addEventListener("learning-site:page-selected", (event) => {
      setCurrentPage(event.detail.item);
    });
  }

  function openModule(module, options = {}) {
    runtime.activeTab = module || "starter";
    renderTabs();
    renderStudyPanel();
    if (options.scroll) {
      document.getElementById("studySystem")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function getRecommendedNextStep(page) {
    if (!page) return { label: "先选形态页", module: "starter" };
    if (page.course === "opening") return { label: "练开盘流程", module: "openingTree" };
    if (page.grade === "C" || page.grade === "D") return { label: "做 No Trade 训练", module: "noTrade" };
    if (/H1|H2|L1|L2|突破|回踩|趋势|区间/.test(page.title)) return { label: "看形态对比", module: "compare" };
    return { label: "练逐K判断", module: "bar" };
  }

  function renderTabs() {
    const current = runtime.currentPage;
    const learned = [...runtime.progress.values()].filter((item) => item.status === "mastered").length;
    const review = [...runtime.progress.values()].filter((item) => item.status === "review").length;
    const recommended = getRecommendedNextStep(current);
    const progressTotal = Math.max(1, pages.filter((item) => item.kind === "pattern").length);
    const progressPct = Math.min(100, Math.round(((learned + review * 0.5) / progressTotal) * 100));
    const currentTitle = current ? shortTitle(current.title) : "从基础术语开始";
    els.tabs.innerHTML = `<div class="learning-dashboard">
      <section class="continue-card">
        <div>
          <p class="panel-label">继续学习</p>
          <h3>${escapeHtml(currentTitle)}</h3>
          <p>${current ? `当前：${escapeHtml(current.grade)} / ${escapeHtml(current.cycle || "先判断市场周期")}` : "先按左侧课程路径完成基础术语和图例。"}</p>
        </div>
        <div class="continue-side">
          <span class="sync-pill ${runtime.mode}">${escapeHtml(runtime.syncMessage)}</span>
          <strong>${learned} 已学 / ${review} 复盘中</strong>
          <div class="progress-meter" aria-label="学习进度"><span style="width:${progressPct}%"></span></div>
          <div class="continue-actions">
            <button type="button" data-module="${escapeHtml(recommended.module)}">${escapeHtml(recommended.label)}</button>
            <button type="button" data-module="starter">路径</button>
          </div>
        </div>
      </section>
      <section class="core-task-list" aria-label="核心学习动作">
        ${primaryTasks
          .map(
            (task) => `<button type="button" class="task-card ${task.id === runtime.activeTab ? "active" : ""}" data-module="${task.id}">
              <span>${escapeHtml(task.eyebrow)}</span>
              <strong>${escapeHtml(task.label)}</strong>
              <small>${escapeHtml(task.description)}</small>
            </button>`
          )
          .join("")}
      </section>
      <section class="tool-strip" aria-label="学习工具">
        <span>学习工具</span>
        ${supportTools
          .map(
            (tool) => `<button type="button" class="${tool.id === runtime.activeTab ? "active" : ""}" data-module="${tool.id}" title="${escapeHtml(tool.description)}">
              ${escapeHtml(tool.label)}
            </button>`
          )
          .join("")}
      </section>
    </div>`;
  }

  function renderStudyPanel() {
    const renderers = {
      starter: renderStarter,
      path: renderStarter,
      theory: renderTheory,
      glossary: renderGlossary,
      chartClinic: renderChartClinic,
      bar: renderBarTraining,
      noTrade: renderNoTrade,
      openingTree: renderOpeningTree,
      compare: renderCompare,
      review: renderReview,
    };
    els.panel.innerHTML = `${renderCurrentPageActions()}${(renderers[runtime.activeTab] || renderStarter)()}`;
  }

  function renderCurrentPageActions() {
    const page = runtime.currentPage;
    if (!page) {
      return `<section class="current-page-workbench empty-current compact-current">
        <div>
          <p class="panel-label">当前页可以做什么？</p>
          <h3>先从左侧课程路径选择一页。</h3>
          <p>建议从“基础术语”开始，再进入趋势与突破。</p>
        </div>
      </section>`;
    }
    if (page.kind !== "pattern") {
      return `<section class="current-page-workbench intro-current compact-current">
        <div class="current-page-copy">
          <p class="panel-label">当前是说明页</p>
          <h3>${escapeHtml(shortTitle(page.title))}</h3>
          <p>先读规则、图例、入场触发和风险提醒，再进入形态训练。</p>
        </div>
        <div class="current-page-actions intro-actions">
          <button type="button" data-action="open-module" data-module="starter">看学习路径</button>
          <button type="button" data-action="open-module" data-module="glossary">查术语</button>
          <button type="button" data-action="go-page" data-page="atlas-001">进入第一个形态</button>
        </div>
      </section>`;
    }
    const progress = runtime.progress.get(page.id);
    const statusText = {
      not_started: "未开始",
      learning: "学习中",
      review: "复盘中",
      mastered: "已学",
      skipped: "No Trade",
    }[progress?.status || "not_started"];
    const recommended = getRecommendedNextStep(page);
    return `<section class="current-page-workbench compact-current">
      <div class="current-page-copy">
        <p class="panel-label">当前页下一步</p>
        <h3>${escapeHtml(shortTitle(page.title))}</h3>
        <p>${escapeHtml(page.grade)} / ${escapeHtml(page.cycle || "市场周期待判断")} / ${escapeHtml(statusText)}</p>
      </div>
      <div class="current-page-actions">
        <button type="button" data-action="quick-mastered">标记已学</button>
        <button type="button" data-action="quick-mistake">加入错题本</button>
        <button type="button" data-action="quick-draft">生成复盘</button>
        <button type="button" data-action="quick-next">${escapeHtml(recommended.label)}</button>
      </div>
      <p class="current-page-rule">固定顺序：市场周期 → 位置 → 信号棒 → 触发价 → 结构止损 → 第一目标区。</p>
    </section>`;
  }

  function renderStarter() {
    return `<div class="module-stack">
      <section class="study-card route-brief">
        <div class="module-toolbar compact-toolbar">
          <div>
            <p class="panel-label">推荐学习路线</p>
            <h3>左侧课程路径是主目录，这里只保留快速入口。</h3>
            <p>按阶段推进：先理解语言，再读图，再用逐K和复盘训练判断。</p>
          </div>
          <div class="toolbar-actions">
            <button type="button" data-action="open-module" data-module="theory">理论地图</button>
            <button type="button" data-action="open-module" data-module="glossary">术语词典</button>
          </div>
        </div>
        <ol class="route-pill-list">
          ${pathStages
            .map(
              (stage, index) => `<li>
                <strong>${index + 1}</strong>
                <span>${escapeHtml(stage.title)}</span>
                <button type="button" data-action="go-section" data-section="${stage.section}">进入</button>
              </li>`
            )
            .join("")}
        </ol>
      </section>
    </div>`;
  }

  function renderTheory() {
    return `<div class="module-stack">
      <section class="study-card guided-intro theory-intro">
        <div>
          <p class="panel-label">理论地图</p>
          <h3>把 198 页资料串成一套判断系统，而不是背 198 个名字。</h3>
          <ol>
            <li>先用市场周期决定形态优先级。</li>
            <li>再用信号棒、触发价和跟随确认是否真的成交。</li>
            <li>最后用结构止损和第一目标区决定值不值得做。</li>
          </ol>
        </div>
        <div class="guided-actions">
          <button type="button" data-action="open-module" data-module="chartClinic">看六层读图法</button>
          <button type="button" data-action="open-module" data-module="review">生成复盘模板</button>
        </div>
      </section>
      <section class="study-card theory-map">
        <div class="theory-map-head">
          <div>
            <p class="panel-label">Core Brooks Framework</p>
            <h3>先判背景，再等触发，再管理风险。</h3>
          </div>
          <p>下面每一格都是一个学习支点。点进去看对应资料页，再回到这里做复盘。</p>
        </div>
        <div class="theory-grid">
          ${theoryPillars
            .map(
              (pillar, index) => `<article class="theory-card">
                <div class="theory-card-top">
                  <span>${String(index + 1).padStart(2, "0")}</span>
                  <div class="mini-chart">${renderMiniSvg(pillar.diagram, { label: pillar.title })}</div>
                </div>
                <h4>${escapeHtml(pillar.title)}</h4>
                <p><strong>核心：</strong>${escapeHtml(pillar.principle)}</p>
                <p><strong>练法：</strong>${escapeHtml(pillar.practice)}</p>
                <div class="misread"><strong>容易误用</strong>${escapeHtml(pillar.warning)}</div>
                <button type="button" data-action="${pillar.link.startsWith("atlas") || pillar.link.startsWith("opening") ? "go-page" : "go-section"}" ${
                pillar.link.startsWith("atlas") || pillar.link.startsWith("opening") ? `data-page="${pillar.link}"` : `data-section="${pillar.link}"`
              }>打开对应内容</button>
              </article>`
            )
            .join("")}
        </div>
      </section>
      <section class="study-card practice-loop">
        <div>
          <p class="panel-label">每天 20 分钟训练循环</p>
          <h3>不用一次看完，按这个循环推进。</h3>
        </div>
        <ol>${practiceLoops.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>
      </section>
    </div>`;
  }

  function renderChartClinic() {
    const page = runtime.currentPage;
    const title = page ? shortTitle(page.title) : "先选择一张形态图";
    return `<div class="module-stack">
      <section class="study-card guided-intro">
        <div>
          <p class="panel-label">图表读法</p>
          <h3>当前页：${escapeHtml(title)}</h3>
          <ol>
            <li>不要先看箭头，先读背景和位置。</li>
            <li>把触发价、结构止损和第一目标区分开。</li>
            <li>任何一层说不清，就把形态降级或进入 No Trade。</li>
          </ol>
        </div>
        <div class="guided-actions">
          ${page ? `<button type="button" data-action="go-page" data-page="${page.id}">回到当前图</button>` : ""}
          <button type="button" data-action="open-module" data-module="noTrade">看 No Trade</button>
        </div>
      </section>
      <div class="chart-clinic-grid">
        ${chartReadLayers
          .map(
            (layer) => `<article class="study-card chart-layer">
              <h3>${escapeHtml(layer.title)}</h3>
              <strong>${escapeHtml(layer.question)}</strong>
              <p>${escapeHtml(layer.check)}</p>
              <div class="check-warning"><strong>降级条件</strong>${escapeHtml(layer.fail)}</div>
            </article>`
          )
          .join("")}
      </div>
      <section class="study-card chart-clinic-summary">
        <div>
          <p class="panel-label">当前页快速判读</p>
          <h3>${escapeHtml(title)}</h3>
          <p>${escapeHtml(page?.summary || "从页面库选择一个形态后，这里会自动带入当前图。")}</p>
        </div>
        ${
          page?.details
            ? `<dl>${Object.entries(page.details)
                .slice(0, 4)
                .map(([key, value]) => `<div><dt>${escapeHtml(key)}</dt><dd>${escapeHtml(value)}</dd></div>`)
                .join("")}</dl>`
            : ""
        }
      </section>
    </div>`;
  }

  function renderGlossary() {
    const query = runtime.glossaryQuery.trim().toLowerCase();
    const items = glossary.filter((item) => !query || `${item.term} ${item.cn} ${item.meaning}`.toLowerCase().includes(query));
    return `<div class="module-stack">
      <section class="study-card guided-intro">
        <div>
          <p class="panel-label">术语速查</p>
          <h3>看不懂缩写时，先在这里对齐语言。</h3>
          <ol>
            <li>先看英文术语和中文解释。</li>
            <li>再看小K线图确认它在图上长什么样。</li>
            <li>最后看“新手常误解”，避免把术语当入场指令。</li>
          </ol>
        </div>
      </section>
      <div class="module-toolbar">
        <div>
          <h3>术语词典</h3>
          <p>中英对照、小型原创K线示意图和新手常见误解。</p>
        </div>
        <input id="glossarySearch" type="search" placeholder="搜索 Signal Bar、H2、MTR..." value="${escapeHtml(runtime.glossaryQuery)}" />
      </div>
      <div class="glossary-grid">
        ${items
          .map(
            (item) => `<article class="study-card glossary-card">
              <div class="mini-chart">${renderMiniSvg(item.diagram, { label: item.term })}</div>
              <h3>${escapeHtml(item.term)} <span>${escapeHtml(item.cn)}</span></h3>
              <p>${escapeHtml(item.meaning)}</p>
              <div class="misread"><strong>新手常误解</strong>${escapeHtml(item.mistake)}</div>
            </article>`
          )
          .join("")}
      </div>
    </div>`;
  }

  function renderBarTraining() {
    const scenario = barScenarios.find((item) => item.id === runtime.activeScenario) || barScenarios[0];
    const question = scenario.questions[runtime.scenarioStep] || scenario.questions[0];
    const source = findPage(scenario.sourceId);
    const answered = runtime.answered;
    return `<div class="module-stack">
      <section class="study-card guided-intro training-intro">
        <div>
          <p class="panel-label">逐K训练怎么用</p>
          <h3>目标不是猜涨跌，是训练“现在该交易还是等待”。</h3>
          <ol>
            <li>只看已经出现的K线，未来K线会被隐藏。</li>
            <li>回答市场周期、信号棒和是否触发。</li>
            <li>看标准讲解，再进入下一根。</li>
          </ol>
        </div>
        <div class="guided-actions">
          <button type="button" data-action="reset-scenario">从本组第一题开始</button>
          ${source ? `<button type="button" data-action="go-page" data-page="${source.id}">查看原形态页</button>` : ""}
        </div>
      </section>
      <div class="bar-training">
      <aside class="scenario-list">
        ${barScenarios
          .map(
            (item) => `<button type="button" class="${item.id === scenario.id ? "active" : ""}" data-action="scenario" data-scenario="${
              item.id
            }">
              <strong>${escapeHtml(item.title)}</strong>
              <span>${escapeHtml(findPage(item.sourceId)?.title || "训练场景")}</span>
            </button>`
          )
          .join("")}
      </aside>
      <section class="study-card bar-workbench">
        <div class="bar-head">
          <div>
            <h3>${escapeHtml(scenario.title)}</h3>
            <p>隐藏未来K线，逐根判断市场周期、信号棒、触发和是否交易。</p>
          </div>
          ${source ? `<button type="button" data-action="go-page" data-page="${source.id}">打开资料页</button>` : ""}
        </div>
        <div class="large-mini-chart">${renderMiniSvg(scenario.diagram, { reveal: question.visible, label: "Bar-by-Bar" })}</div>
        <div class="question-box">
          <span>第 ${runtime.scenarioStep + 1} 题 / ${scenario.questions.length}</span>
          <h4>${escapeHtml(question.question)}</h4>
          <div class="answer-grid">
            ${question.choices
              .map((choice) => {
                const isAnswer = answered && choice === question.answer;
                const isWrong = answered && choice === answered.answer && choice !== question.answer;
                return `<button type="button" class="${isAnswer ? "correct" : ""} ${isWrong ? "wrong" : ""}" data-action="answer" data-answer="${escapeHtml(
                  choice
                )}">${escapeHtml(choice)}</button>`;
              })
              .join("")}
          </div>
          ${
            answered
              ? `<div class="answer-explain ${answered.correct ? "ok" : "warn"}">
                  <strong>${answered.correct ? "判断正确" : "需要复盘"}</strong>
                  <p>${escapeHtml(question.explanation)}</p>
                </div>
                <button type="button" data-action="next-question">${runtime.scenarioStep >= scenario.questions.length - 1 ? "重新开始" : "下一根 / 下一题"}</button>`
              : ""
          }
        </div>
      </section>
      </div>
    </div>`;
  }

  function renderNoTrade() {
    return `<div class="module-stack">
      <section class="study-card guided-intro">
        <div>
          <p class="panel-label">No Trade 怎么用</p>
          <h3>这里专门练“不做”，不是找隐藏买卖点。</h3>
          <ol>
            <li>先读“为什么不做”，判断低质量来自位置、背景还是风险收益。</li>
            <li>点“查看对应页”看完整K线图。</li>
            <li>把最容易犯的错误加入错题本，复盘时重点看。</li>
          </ol>
        </div>
      </section>
      <div class="module-toolbar">
        <div>
          <h3>No Trade 专区</h3>
          <p>训练“等待 / 放弃”。这里的目标不是找到交易，而是识别低质量位置。</p>
        </div>
        <button type="button" data-action="download-no-trade">下载 No Trade 清单</button>
      </div>
      <div class="module-grid no-trade-grid">
        ${noTradeSetups
          .map(
            (item) => `<article class="study-card no-trade-card">
              <div class="mini-chart">${renderMiniSvg(item.diagram, { label: "No Trade" })}</div>
              <h3>${escapeHtml(item.title)}</h3>
              <p><strong>为什么不做：</strong>${escapeHtml(item.reason)}</p>
              <p><strong>等待什么：</strong>${escapeHtml(item.waitFor)}</p>
              <p><strong>常见误判：</strong>${escapeHtml(item.mistake)}</p>
              <div class="card-actions">
                <button type="button" data-action="go-page" data-page="${item.pageId}">查看对应页</button>
                <button type="button" data-action="mistake" data-page="${item.pageId}" data-category="No Trade">加入错题本</button>
              </div>
            </article>`
          )
          .join("")}
      </div>
    </div>`;
  }

  function renderOpeningTree() {
    const node = decisionTree[runtime.treeNode] || decisionTree.start;
    return `<div class="module-stack">
      <section class="study-card guided-intro opening-intro">
        <div>
          <p class="panel-label">开盘流程怎么用</p>
          <h3>按时间走，不凭第一根K线决定全天方向。</h3>
          <ol>
            <li>前 5 分钟只观察开盘价、缺口和第一组K线。</li>
            <li>前 15 分钟判断趋势从开盘还是开盘区间。</li>
            <li>18-20 根K线后，只在确认突破或清晰失败突破时行动。</li>
          </ol>
        </div>
        <div class="guided-actions">
          <button type="button" data-action="tree" data-node="start">回到第一步</button>
          <button type="button" data-action="go-section" data-section="morning-trend">打开早盘策略</button>
        </div>
      </section>
      <div class="opening-tree-layout">
      <section class="study-card tree-card">
        <p class="panel-label">Opening Decision Tree</p>
        <h3>${escapeHtml(node.title)}</h3>
        <p>${escapeHtml(node.text)}</p>
        <div class="tree-choices">
          ${node.choices
            .map((choice) => {
              const attrs = choice.action
                ? `data-action="${choice.action}"`
                : `data-action="tree" data-node="${escapeHtml(choice.next)}"`;
              return `<button type="button" ${attrs}>${escapeHtml(choice.label)}</button>`;
            })
            .join("")}
        </div>
      </section>
      <section class="study-card tree-visual">
        <div class="large-mini-chart">${renderMiniSvg("openingDecision", { label: node.title })}</div>
        <ol class="tree-steps">
          <li>前 5 分钟只观察，记录开盘价和第一组K线强弱。</li>
          <li>前 15 分钟判断趋势从开盘、Gap-and-Go 或开盘区间。</li>
          <li>18-20 根K线后标出开盘区间高低点。</li>
          <li>突破必须看强收盘和跟随K线。</li>
          <li>目标空间不足、重叠太多、无跟随时进入 No Trade。</li>
        </ol>
      </section>
      </div>
    </div>`;
  }

  function renderCompare() {
    return `<div class="module-stack">
      <section class="study-card guided-intro">
        <div>
          <p class="panel-label">形态对比怎么用</p>
          <h3>不要只记名称，要比较“好形态”和“差形态”的背景差异。</h3>
          <ol>
            <li>先看左侧高质量条件。</li>
            <li>再看右侧为什么要降级或放弃。</li>
            <li>最后打开对应资料页，回到大图验证。</li>
          </ol>
        </div>
      </section>
      <div class="module-grid compare-grid">
      ${comparisons
        .map(
          (item) => `<article class="study-card compare-card">
            <h3>${escapeHtml(item.title)}</h3>
            <div class="compare-pair">
              ${renderCompareSide(item.good, "good")}
              ${renderCompareSide(item.bad, "bad")}
            </div>
            <div class="card-actions">
              ${item.links
                .map((pageId) => {
                  const page = findPage(pageId);
                  return page ? `<button type="button" data-action="go-page" data-page="${page.id}">${escapeHtml(shortTitle(page.title))}</button>` : "";
                })
                .join("")}
            </div>
          </article>`
        )
        .join("")}
      </div>
    </div>`;
  }

  function renderCompareSide(side, tone) {
    return `<section class="compare-side ${tone}">
      <div class="mini-chart">${renderMiniSvg(side.diagram, { label: side.label })}</div>
      <h4>${escapeHtml(side.label)}</h4>
      <ul>${side.points.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}</ul>
    </section>`;
  }

  function renderReview() {
    const draft = runtime.reviewDraft || draftFromPage(runtime.currentPage);
    return `<div class="review-layout">
      <section class="study-card review-form-card">
        <div class="module-toolbar compact-toolbar">
          <div>
            <p class="panel-label">我的复盘本</p>
            <h3>把当前形态变成自己的复盘记录。</h3>
            <p>先选一张形态页，再点“生成复盘”。表单会自动带入背景、触发、止损和目标，你只补结果和教训。</p>
          </div>
          <span class="sync-pill ${runtime.mode}">${escapeHtml(runtime.syncMessage)}</span>
        </div>
        <form id="reviewForm" class="review-form">
          ${renderInput("title", "标题", draft.title)}
          ${renderInput("market_cycle", "市场周期", draft.market_cycle)}
          ${renderTextarea("context_notes", "背景与位置", draft.context_notes)}
          ${renderTextarea("signal_bar", "信号棒与触发", draft.signal_bar)}
          ${renderTextarea("entry_trigger", "入场触发价", draft.entry_trigger)}
          ${renderTextarea("stop_logic", "结构止损", draft.stop_logic)}
          ${renderTextarea("target_logic", "第一目标区", draft.target_logic)}
          ${renderTextarea("no_trade_reason", "放弃条件 / No Trade 理由", draft.no_trade_reason)}
          ${renderTextarea("result_notes", "结果记录", draft.result_notes)}
          ${renderTextarea("lesson", "复盘结论", draft.lesson)}
          ${renderInput("tags", "标签，用逗号分隔", draft.tags)}
          <div class="form-actions">
            <button type="submit">保存复盘</button>
            <button type="button" data-action="download-current-md">下载当前 .md</button>
            <button type="button" data-action="download-current-txt">下载当前 .txt</button>
          </div>
        </form>
      </section>
      <section class="study-card journal-card">
        <div class="module-toolbar compact-toolbar">
          <div>
            <h3>历史复盘</h3>
            <p>${runtime.journals.length} 条记录</p>
          </div>
          <div class="toolbar-actions">
            <button type="button" data-action="download-all-md">全部 .md</button>
            <button type="button" data-action="download-all-txt">全部 .txt</button>
          </div>
        </div>
        <div class="journal-list">
          ${
            runtime.journals.length
              ? runtime.journals
                  .map(
                    (item) => `<article class="journal-item">
                      <strong>${escapeHtml(item.title)}</strong>
                      <span>${escapeHtml(formatDate(item.created_at))} / ${escapeHtml(item.market_cycle || "未标注周期")}</span>
                      <p>${escapeHtml(item.lesson || item.context_notes || "暂无结论")}</p>
                    </article>`
                  )
                  .join("")
              : `<div class="empty-mini">还没有复盘记录。选中一个形态页后，点“生成复盘草稿”会更快。</div>`
          }
        </div>
      </section>
    </div>`;
  }

  function renderInput(name, label, value) {
    return `<label><span>${escapeHtml(label)}</span><input name="${name}" value="${escapeHtml(value || "")}" /></label>`;
  }

  function renderTextarea(name, label, value) {
    return `<label><span>${escapeHtml(label)}</span><textarea name="${name}" rows="3">${escapeHtml(value || "")}</textarea></label>`;
  }

  function handlePanelClick(event) {
    const btn = event.target.closest("button[data-action]");
    if (!btn) return;
    const action = btn.dataset.action;
    if (action === "open-module") openModule(btn.dataset.module, { scroll: false });
    if (action === "go-section") app?.applySection?.(btn.dataset.section);
    if (action === "go-page") goToPage(btn.dataset.page);
    if (action === "scenario") {
      runtime.activeScenario = btn.dataset.scenario;
      runtime.scenarioStep = 0;
      runtime.answered = null;
      renderStudyPanel();
    }
    if (action === "reset-scenario") {
      runtime.scenarioStep = 0;
      runtime.answered = null;
      renderStudyPanel();
    }
    if (action === "answer") handleAnswer(btn.dataset.answer);
    if (action === "next-question") nextQuestion();
    if (action === "mistake") addMistakeFromPage(btn.dataset.page, btn.dataset.category || "错题");
    if (action === "tree") {
      runtime.treeNode = btn.dataset.node;
      renderStudyPanel();
    }
    if (action === "draftOpening") draftOpeningReview();
    if (action === "mistakeOpening") addOpeningMistake();
    if (action === "download-no-trade") downloadNoTradeList();
    if (action === "download-current-md") downloadCurrentReview("md");
    if (action === "download-current-txt") downloadCurrentReview("txt");
    if (action === "download-all-md") downloadAllJournals("md");
    if (action === "download-all-txt") downloadAllJournals("txt");
    if (action === "quick-bookmark" && runtime.currentPage) toggleBookmark(runtime.currentPage);
    if (action === "quick-mastered" && runtime.currentPage) saveProgress(runtime.currentPage, "mastered");
    if (action === "quick-mistake" && runtime.currentPage) addMistakeFromPage(runtime.currentPage.id, "当前页易错");
    if (action === "quick-draft" && runtime.currentPage) {
      runtime.reviewDraft = draftFromPage(runtime.currentPage);
      openModule("review", { scroll: false });
    }
    if (action === "quick-next" && runtime.currentPage) {
      const next = getRecommendedNextStep(runtime.currentPage);
      openModule(next.module, { scroll: false });
    }
  }

  function handlePanelInput(event) {
    if (event.target.id === "glossarySearch") {
      runtime.glossaryQuery = event.target.value;
      renderStudyPanel();
    }
  }

  function handlePanelSubmit(event) {
    if (event.target.id !== "reviewForm") return;
    event.preventDefault();
    const payload = collectReviewForm();
    saveJournal(payload);
  }

  function handleReaderStatusClick(event) {
    const btn = event.target.closest("button[data-reader-action]");
    if (!btn || !runtime.currentPage) return;
    const page = runtime.currentPage;
    const action = btn.dataset.readerAction;
    if (action === "bookmark") toggleBookmark(page);
    if (action === "mastered") saveProgress(page, "mastered");
    if (action === "review") saveProgress(page, "review");
    if (action === "skipped") saveProgress(page, "skipped");
    if (action === "mistake") addMistakeFromPage(page.id, "当前页易错");
    if (action === "draft") {
      runtime.reviewDraft = draftFromPage(page);
      openModule("review", { scroll: false });
      document.getElementById("studySystem")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function handleChecklistChange(event) {
    if (!runtime.currentPage || !event.target.matches("input[type='checkbox'][data-check-item]")) return;
    const store = readJson(storageKeys.checklist, {});
    const id = runtime.currentPage.id;
    store[id] = store[id] || {};
    store[id][event.target.dataset.checkItem] = event.target.checked;
    localStorage.setItem(storageKeys.checklist, JSON.stringify(store));
    renderPretradeChecklist();
  }

  function handleChecklistClick(event) {
    const btn = event.target.closest("button[data-check-action]");
    if (!btn || !runtime.currentPage) return;
    if (btn.dataset.checkAction === "draft") {
      runtime.reviewDraft = draftFromPage(runtime.currentPage);
      openModule("review", { scroll: false });
      document.getElementById("studySystem")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (btn.dataset.checkAction === "download") downloadChecklist(runtime.currentPage);
  }

  function setCurrentPage(page) {
    runtime.currentPage = page;
    if (page && page.kind === "pattern") {
      const existing = runtime.progress.get(page.id);
      if (!existing) saveProgress(page, "learning", 0, { silent: true });
      else touchProgress(page);
    }
    renderReaderStatus();
    renderPretradeChecklist();
    renderTabs();
    renderStudyPanel();
  }

  async function connectStorage() {
    if (!window.supabase?.createClient) {
      runtime.mode = "local";
      runtime.syncMessage = "本地保存，Supabase SDK 未载入";
      renderReaderStatus();
      renderStudyPanel();
      return;
    }

    try {
      runtime.client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          storageKey: "ab_learning_supabase_session",
        },
      });
      const sessionResult = await runtime.client.auth.getSession();
      let session = sessionResult.data?.session;
      if (!session) {
        const anonymous = await runtime.client.auth.signInAnonymously();
        if (anonymous.error) throw anonymous.error;
        session = anonymous.data?.session;
      }
      runtime.user = session?.user || null;
      if (!runtime.user) throw new Error("没有拿到匿名学习用户");
      await loadRemoteState();
      runtime.mode = "cloud";
      runtime.syncMessage = "云端保存已连接";
      if (runtime.currentPage?.kind === "pattern" && !runtime.progress.has(runtime.currentPage.id)) {
        await saveProgress(runtime.currentPage, "learning", 0, { silent: true });
      }
    } catch (error) {
      runtime.mode = "local";
      runtime.syncMessage = "本地保存，需开启 Anonymous Sign-Ins";
      console.warn("Learning database fallback:", error);
    }
    renderReaderStatus();
    renderPretradeChecklist();
    renderStudyPanel();
  }

  async function loadRemoteState() {
    const [progress, bookmarks, mistakes, attempts, journals] = await Promise.all([
      runtime.client.from("learning_progress").select("*").order("updated_at", { ascending: false }),
      runtime.client.from("bookmarks").select("*").order("updated_at", { ascending: false }),
      runtime.client.from("mistake_notes").select("*").order("updated_at", { ascending: false }),
      runtime.client.from("bar_by_bar_attempts").select("*").order("created_at", { ascending: false }).limit(200),
      runtime.client.from("review_journal").select("*").order("updated_at", { ascending: false }),
    ]);
    [progress, bookmarks, mistakes, attempts, journals].forEach((result) => {
      if (result.error) throw result.error;
    });
    runtime.progress = new Map((progress.data || []).map((item) => [item.item_id, item]));
    runtime.bookmarks = new Map((bookmarks.data || []).map((item) => [item.item_id, item]));
    runtime.mistakes = mistakes.data || [];
    runtime.attempts = attempts.data || [];
    runtime.journals = journals.data || [];
    persistLocal();
  }

  function hydrateLocal() {
    runtime.progress = new Map(readJson(storageKeys.progress, []).map((item) => [item.item_id, item]));
    runtime.bookmarks = new Map(readJson(storageKeys.bookmarks, []).map((item) => [item.item_id, item]));
    runtime.mistakes = readJson(storageKeys.mistakes, []);
    runtime.attempts = readJson(storageKeys.attempts, []);
    runtime.journals = readJson(storageKeys.journals, []);
  }

  function persistLocal() {
    localStorage.setItem(storageKeys.progress, JSON.stringify([...runtime.progress.values()]));
    localStorage.setItem(storageKeys.bookmarks, JSON.stringify([...runtime.bookmarks.values()]));
    localStorage.setItem(storageKeys.mistakes, JSON.stringify(runtime.mistakes));
    localStorage.setItem(storageKeys.attempts, JSON.stringify(runtime.attempts));
    localStorage.setItem(storageKeys.journals, JSON.stringify(runtime.journals));
  }

  async function saveProgress(page, status, confidence = 0, options = {}) {
    if (!page) return;
    const now = new Date().toISOString();
    const current = runtime.progress.get(page.id) || {};
    const item = {
      ...current,
      item_type: "page",
      item_id: page.id,
      status,
      confidence,
      last_seen_at: now,
      notes: current.notes || "",
      updated_at: now,
    };
    runtime.progress.set(page.id, item);
    persistLocal();
    if (!options.silent) {
      renderReaderStatus();
      renderTabs();
      renderStudyPanel();
    }

    if (runtime.mode === "cloud" && runtime.user) {
      const row = { ...item, owner_id: runtime.user.id };
      const { error } = await runtime.client.from("learning_progress").upsert(row, {
        onConflict: "owner_id,item_type,item_id",
      });
      if (error) {
        runtime.mode = "local";
        runtime.syncMessage = "云端保存失败，已改用本地";
        renderReaderStatus();
      }
    }
  }

  async function touchProgress(page) {
    const current = runtime.progress.get(page.id);
    if (!current) return;
    saveProgress(page, current.status || "learning", current.confidence || 0, { silent: true });
  }

  async function toggleBookmark(page) {
    if (runtime.bookmarks.has(page.id)) {
      runtime.bookmarks.delete(page.id);
      persistLocal();
      renderReaderStatus();
      renderTabs();
      renderStudyPanel();
      if (runtime.mode === "cloud" && runtime.user) {
        await runtime.client.from("bookmarks").delete().eq("owner_id", runtime.user.id).eq("item_type", "page").eq("item_id", page.id);
      }
      return;
    }
    const now = new Date().toISOString();
    const item = {
      item_type: "page",
      item_id: page.id,
      title: page.title,
      tags: [page.grade, page.courseLabel].filter(Boolean),
      note: page.summary || "",
      created_at: now,
      updated_at: now,
    };
    runtime.bookmarks.set(page.id, item);
    persistLocal();
    renderReaderStatus();
    renderTabs();
    renderStudyPanel();
    if (runtime.mode === "cloud" && runtime.user) {
      await runtime.client.from("bookmarks").upsert({ ...item, owner_id: runtime.user.id }, { onConflict: "owner_id,item_type,item_id" });
    }
  }

  async function addMistakeFromPage(pageId, category) {
    const page = findPage(pageId) || runtime.currentPage;
    if (!page) return;
    const item = {
      item_type: "page",
      item_id: page.id,
      title: page.title,
      category,
      reason: page.grade === "D" || page.grade === "C" ? "低优先级或过滤场景，需要训练等待。" : "需要复盘背景、触发、止损和目标。",
      correction: "下次先确认市场周期、信号棒质量、触发价、结构止损和第一目标区。",
      source_context: { grade: page.grade, cycle: page.cycle, summary: page.summary },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    runtime.mistakes.unshift(item);
    await saveProgress(page, "review");
    persistLocal();
    renderReaderStatus();
    renderStudyPanel();
    if (runtime.mode === "cloud" && runtime.user) {
      await runtime.client.from("mistake_notes").insert({ ...item, owner_id: runtime.user.id });
    }
  }

  function addOpeningMistake() {
    const page = findPage("opening-071");
    if (page) addMistakeFromPage(page.id, "开盘决策树");
  }

  async function handleAnswer(answer) {
    const scenario = barScenarios.find((item) => item.id === runtime.activeScenario) || barScenarios[0];
    const question = scenario.questions[runtime.scenarioStep];
    const correct = answer === question.answer;
    runtime.answered = { answer, correct };
    const attempt = {
      scenario_id: scenario.id,
      scenario_title: scenario.title,
      step_index: runtime.scenarioStep,
      question: question.question,
      answer,
      expected_answer: question.answer,
      is_correct: correct,
      explanation: question.explanation,
      metadata: { visible: question.visible },
      created_at: new Date().toISOString(),
    };
    runtime.attempts.unshift(attempt);
    persistLocal();
    renderStudyPanel();
    if (runtime.mode === "cloud" && runtime.user) {
      await runtime.client.from("bar_by_bar_attempts").insert({ ...attempt, owner_id: runtime.user.id });
    }
  }

  function nextQuestion() {
    const scenario = barScenarios.find((item) => item.id === runtime.activeScenario) || barScenarios[0];
    runtime.answered = null;
    runtime.scenarioStep = runtime.scenarioStep >= scenario.questions.length - 1 ? 0 : runtime.scenarioStep + 1;
    renderStudyPanel();
  }

  async function saveJournal(payload) {
    const now = new Date().toISOString();
    const item = {
      ...payload,
      body_md: buildJournalMarkdown(payload),
      tags: splitTags(payload.tags),
      created_at: now,
      updated_at: now,
    };
    runtime.journals.unshift(item);
    runtime.reviewDraft = null;
    persistLocal();
    renderStudyPanel();
    if (runtime.mode === "cloud" && runtime.user) {
      const { data: saved, error } = await runtime.client.from("review_journal").insert({ ...item, owner_id: runtime.user.id }).select().single();
      if (!error && saved) {
        runtime.journals[0] = saved;
        persistLocal();
        renderStudyPanel();
      }
    }
  }

  function renderReaderStatus() {
    if (!els.readerStatus) return;
    const page = runtime.currentPage;
    if (!page) {
      els.readerStatus.innerHTML = `<span class="sync-pill ${runtime.mode}">${escapeHtml(runtime.syncMessage)}</span>`;
      return;
    }
    const progress = runtime.progress.get(page.id);
    const status = progress?.status || "not_started";
    const bookmarked = runtime.bookmarks.has(page.id);
    const statusText = {
      not_started: "未开始",
      learning: "学习中",
      review: "复盘中",
      mastered: "已学",
      skipped: "已过滤",
    }[status];
    els.readerStatus.innerHTML = `<div class="reader-status-row">
      <span class="sync-pill ${runtime.mode}">${escapeHtml(runtime.syncMessage)}</span>
      <span class="status-chip">当前状态：${escapeHtml(statusText)}</span>
      <button type="button" class="${bookmarked ? "active" : ""}" data-reader-action="bookmark">${bookmarked ? "已收藏" : "收藏"}</button>
      <button type="button" class="${status === "mastered" ? "active" : ""}" data-reader-action="mastered">标记已学</button>
      <button type="button" class="${status === "review" ? "active" : ""}" data-reader-action="review">复盘中</button>
      <button type="button" class="${status === "skipped" ? "active" : ""}" data-reader-action="skipped">No Trade</button>
      <button type="button" data-reader-action="mistake">记为易错</button>
      <button type="button" data-reader-action="draft">生成复盘草稿</button>
    </div>`;
  }

  function renderPretradeChecklist() {
    if (!els.checklist) return;
    const page = runtime.currentPage;
    if (!page || page.kind !== "pattern") {
      els.checklist.innerHTML = "";
      return;
    }
    const all = readJson(storageKeys.checklist, {});
    const checked = all[page.id] || {};
    const items = [
      ["cycle", "市场周期清楚", "趋势、交易区间、突破模式或开盘区间已经先判断。"],
      ["strength", "趋势强度与背景清楚", "没有脱离背景单独使用形态名称。"],
      ["signal", "信号棒质量足够", "强收盘、影线、重叠和位置都已经检查。"],
      ["trigger", "等待触发", "多头等信号棒高点上方，空头等低点下方。"],
      ["stop", "结构止损明确", "止损在信号棒、回踩点、摆动点或失败点之外。"],
      ["target", "第一目标区明确", "目标来自前高前低、区间边缘、EMA、测量目标或通道线。"],
      ["space", "目标空间大于结构风险", "不是止损很远、目标很近的低质量位置。"],
      ["notrade", "放弃条件明确", "区间中部、弱信号、无跟随、逆强趋势第一反转时优先等待。"],
    ];
    const done = items.filter(([key]) => checked[key]).length;
    const caution =
      page.grade === "C" || page.grade === "D"
        ? `<div class="check-warning">这页是 ${page.grade} 级过滤训练，默认先问“为什么不做”，不要强行找入场。</div>`
        : "";
    els.checklist.innerHTML = `<details open>
      <summary>
        <span>交易前检查清单</span>
        <strong>${done}/${items.length}</strong>
      </summary>
      ${caution}
      <div class="check-grid">
        ${items
          .map(
            ([key, label, help]) => `<label class="${checked[key] ? "checked" : ""}">
              <input type="checkbox" data-check-item="${key}" ${checked[key] ? "checked" : ""} />
              <span><strong>${escapeHtml(label)}</strong><small>${escapeHtml(help)}</small></span>
            </label>`
          )
          .join("")}
      </div>
      <div class="check-actions">
        <button type="button" data-check-action="draft">生成复盘草稿</button>
        <button type="button" data-check-action="download">下载本页检查清单 .txt</button>
      </div>
    </details>`;
  }

  function draftFromPage(page) {
    if (!page) {
      return {
        title: "未命名复盘",
        market_cycle: "",
        context_notes: "",
        signal_bar: "",
        entry_trigger: "",
        stop_logic: "",
        target_logic: "",
        no_trade_reason: "",
        result_notes: "",
        lesson: "",
        tags: "",
      };
    }
    const details = page.details || {};
    return {
      title: `${page.title} 复盘`,
      market_cycle: page.cycle || "",
      context_notes: details["识别条件"] || details["开盘背景 / 识别条件"] || page.summary || "",
      signal_bar: details["入场逻辑"] || details["入场触发"] || "等待信号棒完成，确认触发价。",
      entry_trigger: "多头等信号棒高点上方触发，空头等信号棒低点下方触发。",
      stop_logic: details["止损与目标"] || details["止损"] || "止损放在结构低点或高点之外。",
      target_logic: details["止损与目标"] || details["第一目标区"] || "第一目标区参考前高前低、区间边缘、EMA 或测量目标。",
      no_trade_reason: details["放弃条件 / 常见错误"] || details["放弃条件 / 常见误判"] || "背景不清、无跟随、目标不足或区间中部时放弃。",
      result_notes: "",
      lesson: "",
      tags: [page.courseLabel, page.grade].filter(Boolean).join(", "),
    };
  }

  function draftOpeningReview() {
    runtime.reviewDraft = {
      title: "开盘决策树复盘",
      market_cycle: "开盘前 60-90 分钟",
      context_notes: "记录开盘价、缺口、前日高低点、前 5 分钟与前 15 分钟结构。",
      signal_bar: "区分突破尝试和突破确认，必须等待强收盘和跟随K线。",
      entry_trigger: "多头等待信号棒高点上方触发，空头等待信号棒低点下方触发。",
      stop_logic: "止损放在开盘回踩低点/高点、信号棒高点/低点或开盘区间另一侧之外。",
      target_logic: "第一目标区参考开盘区间等距测量、前日高低点、前日收盘价或缺口填补区。",
      no_trade_reason: "前 5 分钟无确认、区间中部、无跟随、目标空间不足或波动混乱。",
      result_notes: "",
      lesson: "",
      tags: "开盘, 决策树, No Trade",
    };
    openModule("review", { scroll: false });
  }

  function collectReviewForm() {
    const form = document.getElementById("reviewForm");
    const formData = new FormData(form);
    return Object.fromEntries(formData.entries());
  }

  function buildJournalMarkdown(payload) {
    return `# ${payload.title || "未命名复盘"}

- 市场周期：${payload.market_cycle || ""}
- 标签：${payload.tags || ""}

## 背景与位置
${payload.context_notes || ""}

## 信号棒与触发
${payload.signal_bar || ""}

## 入场触发价
${payload.entry_trigger || ""}

## 结构止损
${payload.stop_logic || ""}

## 第一目标区
${payload.target_logic || ""}

## 放弃条件 / No Trade 理由
${payload.no_trade_reason || ""}

## 结果记录
${payload.result_notes || ""}

## 复盘结论
${payload.lesson || ""}
`;
  }

  function formatJournalTxt(payload) {
    return buildJournalMarkdown(payload)
      .replace(/^# /gm, "")
      .replace(/^## /gm, "\n")
      .replace(/^- /gm, "");
  }

  function downloadCurrentReview(type) {
    const payload = collectReviewForm();
    const content = type === "md" ? buildJournalMarkdown(payload) : formatJournalTxt(payload);
    downloadText(safeFileName(payload.title || "review") + `.${type}`, content);
  }

  function downloadAllJournals(type) {
    const payloads = runtime.journals.length ? runtime.journals : [collectReviewForm()];
    const content = payloads
      .map((item) => (type === "md" ? item.body_md || buildJournalMarkdown(item) : formatJournalTxt(item)))
      .join(type === "md" ? "\n\n---\n\n" : "\n\n====================\n\n");
    downloadText(`al-brooks-review-history.${type}`, content);
  }

  function downloadNoTradeList() {
    const content = noTradeSetups
      .map((item) => `${item.title}\n为什么不做：${item.reason}\n等待什么：${item.waitFor}\n常见误判：${item.mistake}`)
      .join("\n\n");
    downloadText("al-brooks-no-trade-checklist.txt", content);
  }

  function downloadChecklist(page) {
    const all = readJson(storageKeys.checklist, {});
    const checked = all[page.id] || {};
    const lines = [
      `交易前检查清单：${page.title}`,
      `条件胜率 / 实战优先级：${page.grade}`,
      `市场周期：${page.cycle || ""}`,
      "",
      `市场周期清楚：${checked.cycle ? "是" : "否"}`,
      `趋势强度与背景清楚：${checked.strength ? "是" : "否"}`,
      `信号棒质量足够：${checked.signal ? "是" : "否"}`,
      `等待触发：${checked.trigger ? "是" : "否"}`,
      `结构止损明确：${checked.stop ? "是" : "否"}`,
      `第一目标区明确：${checked.target ? "是" : "否"}`,
      `目标空间大于结构风险：${checked.space ? "是" : "否"}`,
      `放弃条件明确：${checked.notrade ? "是" : "否"}`,
    ];
    downloadText(`${safeFileName(page.title)}-checklist.txt`, lines.join("\n"));
  }

  function goToPage(pageId) {
    app?.selectPage?.(pageId, true);
    document.querySelector(".reader")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function findPage(id) {
    return pages.find((page) => page.id === id);
  }

  function shortTitle(title) {
    return String(title).replace(/^\d+\s*/, "").slice(0, 18);
  }

  function splitTags(value) {
    if (Array.isArray(value)) return value;
    return String(value || "")
      .split(/[,，]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function renderMiniSvg(mode, options = {}) {
    const width = options.large ? 640 : 420;
    const height = options.large ? 300 : 210;
    const pad = 24;
    const count = 34;
    const bars = buildCandles(mode, count);
    const reveal = Number.isFinite(options.reveal) ? Math.max(1, Math.min(count, options.reveal)) : count;
    const visibleBars = bars.slice(0, reveal);
    const min = Math.min(...bars.map((bar) => bar.low));
    const max = Math.max(...bars.map((bar) => bar.high));
    const plotW = width - pad * 2;
    const plotH = height - pad * 2;
    const step = plotW / count;
    const scaleY = (value) => pad + ((max - value) / Math.max(1, max - min)) * plotH;
    const candleW = Math.max(4, step * 0.58);
    const ema = movingAverage(bars.map((bar) => bar.close), 8);
    const candleSvg = visibleBars
      .map((bar, i) => {
        const x = pad + i * step + step / 2;
        const openY = scaleY(bar.open);
        const closeY = scaleY(bar.close);
        const highY = scaleY(bar.high);
        const lowY = scaleY(bar.low);
        const up = bar.close >= bar.open;
        const bodyY = Math.min(openY, closeY);
        const bodyH = Math.max(3, Math.abs(closeY - openY));
        const color = up ? "#12805c" : "#b42318";
        return `<line x1="${x.toFixed(1)}" y1="${highY.toFixed(1)}" x2="${x.toFixed(1)}" y2="${lowY.toFixed(
          1
        )}" stroke="${color}" stroke-width="1.5"/><rect x="${(x - candleW / 2).toFixed(1)}" y="${bodyY.toFixed(1)}" width="${candleW.toFixed(
          1
        )}" height="${bodyH.toFixed(1)}" rx="1.4" fill="${color}"/>`;
      })
      .join("");
    const emaPath = visibleBars
      .map((_, i) => `${i === 0 ? "M" : "L"} ${(pad + i * step + step / 2).toFixed(1)} ${scaleY(ema[i]).toFixed(1)}`)
      .join(" ");
    const overlays = renderMiniOverlays(mode, { width, height, pad, step, count, reveal, scaleY, bars, options });
    const futureMask =
      reveal < count
        ? `<rect x="${(pad + reveal * step).toFixed(1)}" y="${pad}" width="${(width - pad - (pad + reveal * step)).toFixed(
            1
          )}" height="${plotH}" rx="8" fill="#f8fbff" opacity="0.96"/><text x="${(pad + reveal * step + 18).toFixed(
            1
          )}" y="${height / 2}" fill="#637083" font-size="14" font-weight="800">未来K线隐藏</text>`
        : "";
    return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(options.label || mode)} K线示意图">
      <rect x="0" y="0" width="${width}" height="${height}" rx="10" fill="#ffffff"/>
      <g opacity="0.55">
        ${gridLines(width, height, pad)}
      </g>
      <path d="${emaPath}" fill="none" stroke="#f0a51f" stroke-width="2" opacity="0.9"/>
      ${overlays.before}
      ${candleSvg}
      ${overlays.after}
      ${futureMask}
      <text x="${pad}" y="${height - 8}" fill="#44546a" font-size="12" font-weight="800">${escapeHtml(options.label || labelForMode(mode))}</text>
    </svg>`;
  }

  function renderMiniOverlays(mode, ctx) {
    const { width, height, pad, step, count, reveal, scaleY, bars } = ctx;
    const before = [];
    const after = [];
    const lastIndex = Math.min(reveal - 1, bars.length - 1);
    const last = bars[Math.max(0, lastIndex)];
    const xAt = (index) => pad + index * step + step / 2;
    const yHigh = scaleY(last.high + 0.3);
    const yLow = scaleY(last.low - 0.3);
    if (["rangeEdge", "noTrade", "openingRange", "breakoutMode", "openingChop"].includes(mode)) {
      const hi = scaleY(Math.max(...bars.slice(3, 20).map((bar) => bar.high)));
      const lo = scaleY(Math.min(...bars.slice(3, 20).map((bar) => bar.low)));
      before.push(`<rect x="${pad + 18}" y="${hi}" width="${width - pad * 2 - 36}" height="${lo - hi}" fill="#e8f0ff" opacity="0.36"/>`);
      after.push(`<line x1="${pad}" y1="${hi}" x2="${width - pad}" y2="${hi}" stroke="#1f65d6" stroke-dasharray="6 5" stroke-width="2"/>`);
      after.push(`<line x1="${pad}" y1="${lo}" x2="${width - pad}" y2="${lo}" stroke="#1f65d6" stroke-dasharray="6 5" stroke-width="2"/>`);
    }
    if (["triggerBull", "signal", "h2", "breakoutTest", "breakoutStrong", "openingConfirm"].includes(mode)) {
      after.push(`<line x1="${Math.max(pad, xAt(lastIndex - 1))}" y1="${yHigh}" x2="${width - pad}" y2="${yHigh}" stroke="#1f65d6" stroke-dasharray="7 5" stroke-width="2"/>`);
      after.push(`<text x="${Math.min(width - 158, xAt(lastIndex + 1))}" y="${Math.max(18, yHigh - 7)}" fill="#0b367f" font-size="12" font-weight="900">Entry Trigger</text>`);
    }
    if (["l2", "weakBreakout", "openingFake"].includes(mode)) {
      after.push(`<line x1="${Math.max(pad, xAt(lastIndex - 2))}" y1="${yLow}" x2="${width - pad}" y2="${yLow}" stroke="#b42318" stroke-dasharray="7 5" stroke-width="2"/>`);
      after.push(`<text x="${Math.min(width - 150, xAt(lastIndex))}" y="${Math.min(height - 26, yLow + 18)}" fill="#9f1d15" font-size="12" font-weight="900">Trigger?</text>`);
    }
    if (["noTrade", "badH2", "badRisk", "middle"].includes(mode)) {
      after.push(`<rect x="${pad + step * 10}" y="${pad + 24}" width="${step * 12}" height="${height - pad * 2 - 48}" rx="8" fill="#fff1f0" stroke="#f3b2ac" stroke-width="2"/>`);
      after.push(`<text x="${pad + step * 11}" y="${pad + 46}" fill="#b42318" font-size="13" font-weight="900">No Trade</text>`);
    }
    if (["openingRange", "openingDecision", "openingConfirm", "openingFake", "openingChop"].includes(mode)) {
      after.push(`<line x1="${xAt(0)}" y1="${pad}" x2="${xAt(0)}" y2="${height - pad}" stroke="#142033" stroke-width="2"/>`);
      after.push(`<text x="${xAt(0) + 8}" y="${pad + 15}" fill="#142033" font-size="12" font-weight="900">Open</text>`);
      after.push(`<rect x="${pad}" y="${pad}" width="${step * 20}" height="${height - pad * 2}" fill="#f4f8ff" opacity="0.48"/>`);
    }
    if (["measured", "breakoutStrong", "openingConfirm"].includes(mode)) {
      const targetY = scaleY(Math.max(...bars.map((bar) => bar.high)) - 0.8);
      after.push(`<line x1="${pad + step * 22}" y1="${targetY}" x2="${width - pad}" y2="${targetY}" stroke="#13845b" stroke-dasharray="4 4" stroke-width="2"/>`);
      after.push(`<text x="${width - 150}" y="${targetY - 7}" fill="#0b6b49" font-size="12" font-weight="900">First Target Zone</text>`);
    }
    return { before: before.join(""), after: after.join("") };
  }

  function buildCandles(mode, count) {
    const random = seededRandom(hashString(mode));
    let price = mode.includes("bear") || mode === "l2" ? 65 : 45;
    const bars = [];
    for (let i = 0; i < count; i += 1) {
      let drift = 0;
      if (["triggerBull", "signal", "h2", "micro", "breakoutTest", "breakoutStrong", "measured", "openingConfirm"].includes(mode)) {
        drift = i < 8 ? 0.7 : i < 15 ? -0.25 : i < 22 ? 0.15 : 0.75;
      } else if (["l2", "weakBreakout"].includes(mode)) {
        drift = i < 8 ? -0.65 : i < 15 ? 0.25 : i < 23 ? -0.12 : -0.72;
      } else if (["mtr", "finalFlag", "counterTrend"].includes(mode)) {
        drift = i < 16 ? -0.55 : i < 22 ? 0.05 : 0.72;
      } else if (["openingRange", "openingDecision", "openingChop"].includes(mode)) {
        drift = i < 5 ? 0.55 : i < 20 ? (i % 2 ? -0.32 : 0.34) : 0.22;
      } else if (["openingFake", "badH2", "badRisk", "noTrade", "breakoutMode", "rangeEdge"].includes(mode)) {
        drift = i % 2 ? -0.36 : 0.34;
      } else {
        drift = i % 3 === 0 ? 0.45 : -0.2;
      }
      if (mode === "openingFake" && i > 20 && i < 25) drift = 0.95;
      if (mode === "openingFake" && i >= 25) drift = -0.9;
      if (mode === "weakBreakout" && i > 20 && i < 24) drift = -0.95;
      if (mode === "weakBreakout" && i >= 24) drift = 0.58;
      const open = price + (random() - 0.5) * 0.8;
      const close = open + drift + (random() - 0.5) * 1.25;
      const high = Math.max(open, close) + 0.35 + random() * 1.3;
      const low = Math.min(open, close) - 0.35 - random() * 1.3;
      bars.push({ open, close, high, low });
      price = close + (random() - 0.5) * 0.55;
    }
    return bars;
  }

  function movingAverage(values, len) {
    return values.map((_, index) => {
      const start = Math.max(0, index - len + 1);
      const subset = values.slice(start, index + 1);
      return subset.reduce((sum, value) => sum + value, 0) / subset.length;
    });
  }

  function gridLines(width, height, pad) {
    const lines = [];
    for (let i = 1; i < 4; i += 1) {
      const y = pad + ((height - pad * 2) / 4) * i;
      lines.push(`<line x1="${pad}" y1="${y}" x2="${width - pad}" y2="${y}" stroke="#dbe4f0" stroke-width="1"/>`);
    }
    for (let i = 1; i < 6; i += 1) {
      const x = pad + ((width - pad * 2) / 6) * i;
      lines.push(`<line x1="${x}" y1="${pad}" x2="${x}" y2="${height - pad}" stroke="#edf2f8" stroke-width="1"/>`);
    }
    return lines.join("");
  }

  function labelForMode(mode) {
    return {
      signal: "Signal Bar",
      triggerBull: "Entry Trigger",
      h2: "H2 Pullback",
      l2: "L2 Pullback",
      mtr: "MTR",
      finalFlag: "Final Flag",
      micro: "Micro Channel",
      breakoutMode: "Breakout Mode",
      measured: "Measured Move",
      breakoutTest: "Breakout Point Test",
      openingRange: "Opening Range",
      noTrade: "No Trade",
    }[mode] || "Price Action";
  }

  function readJson(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  }

  function downloadText(filename, content) {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function safeFileName(value) {
    return String(value || "review")
      .replace(/[\\/:*?"<>|]+/g, "-")
      .replace(/\s+/g, "-")
      .slice(0, 80);
  }

  function formatDate(value) {
    if (!value) return "";
    return new Date(value).toLocaleString("zh-CN", { hour12: false });
  }

  function seededRandom(seed) {
    let value = seed % 2147483647;
    if (value <= 0) value += 2147483646;
    return function () {
      value = (value * 16807) % 2147483647;
      return (value - 1) / 2147483646;
    };
  }

  function hashString(value) {
    return String(value)
      .split("")
      .reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 2166136261);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  init();
})();
