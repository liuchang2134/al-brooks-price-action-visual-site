# Al Brooks 价格行为可视化学习资料

本仓库包含两份中文交易教育 PDF 与一个可视化学习网站。

## 打开网站

公网访问：

```text
https://liuchang2134.github.io/al-brooks-price-action-visual-site/al_brooks_visual_site/
```

本地预览：

```powershell
python -m http.server 8877 --bind 127.0.0.1
```

然后打开：

```text
http://127.0.0.1:8877/al_brooks_visual_site/
```

## 内容

- `Al_Brooks价格行为学形态图谱_完整详解高可读版.pdf`
- `Al_Brooks开盘时段价格行为形态专题_完整详解高可读版.pdf`
- `al_brooks_visual_site/`：可视化学习网站
- `output_al_brooks_price_action_atlas/`：形态图谱页面图与高清K线图
- `output_al_brooks_opening_price_action/`：开盘专题页面图与高清K线图
- `supabase_learning_schema.sql`：学习进度、收藏、错题、逐K训练和复盘记录的 Supabase 表结构

PDF 公网下载资产：

```text
https://github.com/liuchang2134/al-brooks-price-action-visual-site/releases/tag/v1.0.0
```

## 网站能力

- 学习路径：基础术语、市场周期、趋势、突破、回调、反转、交易区间、开盘、避坑。
- 理论地图：把市场周期、Always In、信号棒、二次入场、MTR、区间、开盘和风险管理串成一套判断框架。
- 图表读法：用背景、位置、力度、信号、触发、交易管理六层检查法阅读当前K线图。
- 逐K训练：隐藏未来K线，训练趋势、区间、触发和等待判断。
- No Trade 专区：专门训练过滤区间中部、弱信号、无跟随和目标空间不足。
- 开盘决策树：按前5分钟、前15分钟、18-20根K线区间、突破确认和失败突破推进。
- 复盘系统：支持收藏、错题、学习进度、历史复盘记录和 `.txt` / `.md` 下载。
- 专注看图：隐藏侧栏和页面库，放大当前图表或说明页用于投屏和大屏学习。

## 图表生成

重生成 PDF、高清图和网站缩略图：

```powershell
$py = "C:\Users\xcmgusa\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
& $py .\generate_al_brooks_price_action_pdf.py
& $py .\generate_al_brooks_opening_price_action_pdf.py
& $py .\build_visual_site_assets.py
```

图表为原创合成 OHLC 教学图，包含实体、上下影线、重叠K线、假突破、回踩、连续K线、失败尝试、No Trade 过滤区、结构止损和第一目标区。它们不复制 Brooks 书籍、课程、网页或第三方图表截图。

## Codex Skills

本项目环境已额外安装多组 Codex skills，包括 Superpowers、Vercel Agent Skills、Anthropic Official Skills、MiniMax Skills、Context Engineering、Antfu Skills 和部分 Composio 工作流 skills。新装 skills 需要重启 Codex 后才会出现在可触发列表中。

## 学习记录后端

网站使用 Supabase 保存匿名学习记录。部署或重建后端时：

1. 在 Supabase SQL Editor 运行 `supabase_learning_schema.sql`。
2. 在 Authentication 设置中开启 Anonymous Sign-Ins。
3. 前端只使用 Supabase URL 和 publishable key，不要把数据库密码或 service role key 放进网站代码。

## 声明

资料仅用于交易教育和图形识别训练，不构成任何真实投资建议。所有K线图均为原创合成教学图。
