# Al Brooks 价格行为可视化学习资料

本仓库包含两份中文交易教育 PDF 与一个可视化学习网站。

## 打开网站

公网访问：

```text
https://liuchang2134.github.io/al-brooks-price-action-visual-site/
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

## 学习记录后端

网站使用 Supabase 保存匿名学习记录。部署或重建后端时：

1. 在 Supabase SQL Editor 运行 `supabase_learning_schema.sql`。
2. 在 Authentication 设置中开启 Anonymous Sign-Ins。
3. 前端只使用 Supabase URL 和 publishable key，不要把数据库密码或 service role key 放进网站代码。

## 声明

资料仅用于交易教育和图形识别训练，不构成任何真实投资建议。所有K线图均为原创合成教学图。
