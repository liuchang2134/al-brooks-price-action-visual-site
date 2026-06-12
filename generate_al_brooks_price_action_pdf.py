import math
import os
import random
import textwrap
from dataclasses import dataclass
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.font_manager import FontProperties
from PIL import Image, ImageDraw, ImageFont
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parent
OUT_DIR = ROOT / "output_al_brooks_price_action_atlas"
PAGE_DIR = OUT_DIR / "pages"
CHART_DIR = OUT_DIR / "charts"
PDF_PATH = ROOT / "Al_Brooks价格行为学形态图谱_完整详解高可读版.pdf"

FONT_REG = Path("C:/Windows/Fonts/NotoSansSC-VF.ttf")
FONT_BOLD = Path("C:/Windows/Fonts/msyhbd.ttc")
if not FONT_REG.exists():
    FONT_REG = Path("C:/Windows/Fonts/msyh.ttc")
if not FONT_BOLD.exists():
    FONT_BOLD = FONT_REG

PAGE_W, PAGE_H = 6000, 3375
M = 150
HEADER_H = 265
CHART_X, CHART_Y, CHART_W, CHART_H = 150, 310, 5700, 2180
TEXT_Y = CHART_Y + CHART_H + 70
TEXT_H = PAGE_H - TEXT_Y - 115
COL_GAP = 36
COL_W = (PAGE_W - 2 * M - 3 * COL_GAP) // 4


def font(size, bold=False):
    return ImageFont.truetype(str(FONT_BOLD if bold else FONT_REG), size=size)


F_TITLE = font(92, True)
F_SUBTITLE = font(58, False)
F_H1 = font(72, True)
F_H2 = font(50, True)
F_BODY = font(46, False)
F_BODY_SMALL = font(44, False)
F_META = font(44, False)
F_LABEL = font(42, True)
F_FOOT = font(38, False)

MPL_FONT = FontProperties(fname=str(FONT_REG))
MPL_FONT_BOLD = FontProperties(fname=str(FONT_BOLD))

INK = "#17212b"
MUTED = "#667085"
GRID = "#dbe5f2"
BLUE = "#0b5bd3"
RED = "#c0261d"
GREEN = "#078052"
AMBER = "#8a5a00"
PURPLE = "#5b45c7"
PAPER = "#ffffff"
PANEL = "#f7f9fc"


@dataclass
class Pattern:
    no: int
    name: str
    grade: str
    cycle: str
    side: str
    family: str


A_PLUS = [
    "强趋势突破 + 连续跟随K线",
    "强突破后的第一次回踩",
    "Small Pullback Trend 小回调趋势",
    "紧密趋势通道中的顺势回调",
    "Spike and Channel 趋势中的通道回踩",
    "趋势中 H1 / L1 顺势入场",
    "趋势中 H2 / L2 二次回调入场",
    "20 EMA 回踩后的顺势恢复",
    "EMA Gap Bar 后的趋势延续",
    "微型通道 Micro Channel 延续",
    "突破点回踩成功 Breakout Point Test",
    "测量缺口 Measuring Gap 延续",
    "交易区间强突破 + 跟随K线",
    "强突破后的窄幅整理再延续",
    "趋势中两段式回调后顺势",
    "趋势中楔形旗形 Wedge Flag 顺势延续",
    "趋势中双底 / 双顶回调后顺势",
    "逆势突破失败后的顺势恢复",
    "强趋势中的外包信号棒顺势触发",
    "强趋势中突破前高 / 前低后回踩不破",
]

A = [
    "Major Trend Reversal：趋势线突破后测试成功",
    "高低点反转后的第二次入场",
    "Higher Low Major Trend Reversal",
    "Lower High Major Trend Reversal",
    "双底主要趋势反转，带强跟随",
    "双顶主要趋势反转，带强跟随",
    "楔形高潮反转，带确认K线",
    "抛物线楔形高潮反转",
    "Final Flag 失败后的反转",
    "趋势通道线过冲后的确认反转",
    "Exhaustion Gap 后确认反转",
    "Climactic Reversal 高潮反转后第二信号",
    "Micro Double Bottom 反转确认",
    "Micro Double Top 反转确认",
    "失败突破后的强反向突破",
    "交易区间边缘强信号棒反转",
    "双底高低点抬高后的买入",
    "双顶高点降低后的卖出",
    "先突破趋势线，再测试极端点失败",
    "两段式逆势反弹失败后的顺势空头",
    "两段式逆势回调失败后的顺势多头",
    "趋势中回踩到前突破点 + EMA 共振",
    "趋势中回踩到前摆动高低点",
    "强趋势中小型三角形突破延续",
    "强趋势中台阶式突破 Pullback Ladder",
    "趋势中小缺口不回补延续",
    "趋势中突破旗形上沿 / 下沿后跟随",
    "失败反转后再创新高 / 新低",
]

B = [
    "宽趋势通道中的回调交易",
    "宽趋势通道边缘反转",
    "交易区间低买高卖",
    "交易区间边缘失败突破",
    "交易区间顶部二次卖出",
    "交易区间底部二次买入",
    "交易区间中假突破后回到区间",
    "交易区间突破后回踩边缘",
    "三角形突破确认",
    "三角形假突破后反向",
    "扩张三角形边缘反转",
    "Broad Channel 中的二次入场",
    "Breakout Mode 中等待确认突破",
    "Tight Trading Range 后强突破",
    "Double Top Bear Flag",
    "Double Bottom Bull Flag",
    "下降通道中的楔形反转",
    "上升通道中的楔形反转",
    "Lower High 入场做空",
    "Higher Low 入场做多",
    "Failed H2 多头失败后做空",
    "Failed L2 空头失败后做多",
    "信号棒后小幅回踩再触发",
    "二次入场优于第一次信号",
    "大阴线后反弹失败继续空头",
    "大阳线后回调失败继续多头",
    "强收盘K线后的下一根确认",
    "内包K线突破确认",
    "外包K线突破确认",
    "旗形整理后的顺势突破",
    "Pullback to Moving Average 但背景一般",
    "前高前低附近的二次测试",
]

C = [
    "交易区间中部突破尝试",
    "交易区间中部信号棒",
    "单根大K线追入",
    "弱突破无跟随",
    "突破后立刻重回区间",
    "Doji 信号棒入场",
    "大影线但收盘一般的信号棒",
    "强趋势中的第一次逆势反转",
    "紧密通道中的逆势交易",
    "强突破后立刻反向做空 / 做多",
    "远离EMA后追趋势末端",
    "高潮后没有确认就反转",
    "交易区间顶部追多",
    "交易区间底部追空",
    "窄幅震荡中频繁做突破",
    "多空重叠严重的任何信号",
    "无明确支撑阻力的反转信号",
    "止损过远的大信号棒",
    "目标空间不足的信号",
    "入场位置接近区间中轴",
]

D = [
    "只因看到阳线就追多",
    "只因看到阴线就追空",
    "强趋势中摸顶 / 抄底",
    "未突破信号棒就提前入场",
    "信号棒很弱但强行画箭头",
    "没有跟随K线的突破",
    "连续重叠K线中的频繁交易",
    "震荡区间中间的双向假信号",
    "低波动死水行情中的突破幻想",
    "新闻前后无确认信号乱入场",
    "只看形态不看市场周期",
    "目标空间小于风险仍然交易",
]


def infer_side(name, no, grade):
    lower = name.lower()
    if grade in ["C", "D"] or "等待" in name or "breakout mode" in lower:
        return "none"
    short_keys = ["空头", "卖出", "做空", "阴线", "双顶", "lower high", "下降", "l2", "下沿", "前低"]
    long_keys = ["多头", "买入", "做多", "阳线", "双底", "higher low", "上升", "h2", "上沿", "前高"]
    if any(k in lower for k in short_keys):
        return "short"
    if any(k in lower for k in long_keys):
        return "long"
    if no % 5 == 0:
        return "short"
    return "long"


def family_for(name, grade):
    lower = name.lower()
    if grade in ["C", "D"]:
        return "avoid"
    if "交易区间" in name:
        return "range"
    if "三角" in name:
        return "triangle"
    if "反转" in name or "失败" in name or "高潮" in name or "wedge" in lower:
        return "reversal"
    if "突破" in name:
        return "breakout"
    return "trend"


def build_patterns():
    items = []
    no = 1
    for grade, names, cycle in [
        ("A+", A_PLUS, "强趋势 / 强突破 / 清晰回踩"),
        ("A", A, "趋势转换 / 确认反转 / 优质顺势"),
        ("B", B, "交易区间 / 宽通道 / 需确认"),
        ("C", C, "弱背景 / 过滤优先 / 小仓或观望"),
        ("D", D, "避坑 / 禁止强行交易"),
    ]:
        for name in names:
            side = infer_side(name, no, grade)
            items.append(Pattern(no, name, grade, cycle, side, family_for(name, grade)))
            no += 1
    return items


PATTERNS = build_patterns()


def wrapped(draw, text, xy, fnt, fill=INK, width_px=1000, line_spacing=10, max_lines=None):
    x, y = xy
    lines = []
    for para in text.split("\n"):
        line = ""
        for ch in para:
            test = line + ch
            if draw.textbbox((0, 0), test, font=fnt)[2] <= width_px:
                line = test
            else:
                if line:
                    lines.append(line)
                line = ch
        if line:
            lines.append(line)
    if max_lines:
        lines = lines[:max_lines]
        if len(lines) == max_lines and draw.textbbox((0, 0), lines[-1] + "…", font=fnt)[2] <= width_px:
            lines[-1] += "…"
    for ln in lines:
        draw.text((x, y), ln, font=fnt, fill=fill)
        y += fnt.size + line_spacing
    return y


def rounded_rect(draw, box, radius=22, fill=None, outline=None, width=3):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def page_base():
    img = Image.new("RGB", (PAGE_W, PAGE_H), PAPER)
    d = ImageDraw.Draw(img)
    d.rectangle((0, 0, PAGE_W, 20), fill=BLUE)
    d.rectangle((0, PAGE_H - 18, PAGE_W, PAGE_H), fill="#dfe7f3")
    return img, d


def synthetic_ohlc(pattern: Pattern):
    rng = np.random.default_rng(9000 + pattern.no * 31)
    n = int(rng.integers(58, 82))
    base = 100.0 + rng.normal(0, 0.6)
    family = pattern.family
    side = pattern.side
    grade = pattern.grade
    sign = -1 if side == "short" else 1
    if side == "none":
        sign = 1 if pattern.no % 2 else -1

    returns = rng.normal(0, 0.26, n)
    if family in ["trend", "breakout"]:
        cut1, cut2, cut3 = int(n * 0.28), int(n * 0.48), int(n * 0.62)
        returns[:cut1] += sign * rng.uniform(0.04, 0.13)
        returns[cut1:cut2] += sign * rng.uniform(0.24, 0.38)
        returns[cut2:cut3] += -sign * rng.uniform(0.06, 0.13)
        returns[cut3:] += sign * rng.uniform(0.16, 0.28)
        for j in range(9, n, int(rng.integers(8, 13))):
            returns[j:j + 2] += -sign * rng.uniform(0.28, 0.55)
    elif family == "reversal":
        cut1, cut2 = int(n * 0.42), int(n * 0.58)
        returns[:cut1] += -sign * rng.uniform(0.13, 0.25)
        returns[cut1:cut2] += rng.normal(0, 0.15, cut2 - cut1)
        returns[cut2:] += sign * rng.uniform(0.17, 0.31)
    elif family == "triangle":
        returns = rng.normal(0, 0.34, n)
    elif family in ["range", "avoid"]:
        returns = rng.normal(0, 0.55 if grade == "D" else 0.42, n)

    closes = np.zeros(n)
    closes[0] = base + returns[0]
    center = base
    for i in range(1, n):
        if family in ["range", "avoid"]:
            mean_revert = (center - closes[i - 1]) * (0.12 if grade != "D" else 0.08)
            closes[i] = closes[i - 1] + returns[i] + mean_revert
        elif family == "triangle":
            amp = np.interp(i, [0, n - 1], [2.8, 0.7])
            closes[i] = center + math.sin(i * 0.92) * amp + rng.normal(0, 0.28)
        else:
            closes[i] = closes[i - 1] + returns[i]

    opens = np.r_[closes[0] - rng.normal(0, 0.35), closes[:-1] + rng.normal(0, 0.22, n - 1)]
    body = np.abs(closes - opens)
    wick_base = rng.uniform(0.22, 0.95, n) + body * rng.uniform(0.15, 0.45, n)
    highs = np.maximum(opens, closes) + wick_base * rng.uniform(0.65, 1.45, n)
    lows = np.minimum(opens, closes) - wick_base * rng.uniform(0.65, 1.45, n)

    # Make the chart feel traded, not drawn: pause bars, tails, failed probes, and overlap.
    candidate = np.arange(5, n - 5)
    for j in rng.choice(candidate, size=max(5, n // 10), replace=False):
        closes[j] = opens[j] + rng.normal(0, 0.12)
        highs[j] = max(highs[j], max(opens[j], closes[j]) + rng.uniform(0.8, 2.0))
        lows[j] = min(lows[j], min(opens[j], closes[j]) - rng.uniform(0.8, 2.0))
    for j in rng.choice(candidate, size=max(3, n // 16), replace=False):
        if rng.random() < 0.5:
            highs[j] += rng.uniform(1.2, 2.8)
            closes[j] -= rng.uniform(0.1, 0.45)
        else:
            lows[j] -= rng.uniform(1.2, 2.8)
            closes[j] += rng.uniform(0.1, 0.45)

    sig = min(max(int(n * (0.68 if grade in ["A+", "A"] else 0.62)), 20), n - 8)
    atr = float(np.mean(highs - lows))
    if side == "long" and grade not in ["C", "D"]:
        for k in range(max(1, sig - 5), sig):
            closes[k] -= rng.uniform(0.10, 0.32) * atr
            lows[k] -= rng.uniform(0.10, 0.35) * atr
        opens[sig] = closes[sig - 1] - 0.18 * atr
        closes[sig] = opens[sig] + 0.62 * atr
        lows[sig] = min(opens[sig], closes[sig]) - 0.85 * atr
        highs[sig] = max(opens[sig], closes[sig]) + 0.18 * atr
        trigger = highs[sig] + 0.18 * atr
        for k in range(sig + 1, min(n, sig + 6)):
            opens[k] = max(closes[k - 1] - rng.uniform(0.05, 0.28) * atr, trigger - 0.25 * atr)
            closes[k] = opens[k] + rng.uniform(0.28, 0.78) * atr
            highs[k] = max(highs[k], closes[k] + rng.uniform(0.18, 0.55) * atr)
            lows[k] = min(lows[k], opens[k] - rng.uniform(0.10, 0.40) * atr)
        if grade == "A+" and family in ["trend", "breakout"]:
            for k in range(sig + 6, n):
                opens[k] = max(closes[k - 1] - rng.uniform(0.05, 0.32) * atr, trigger - 0.55 * atr)
                closes[k] = opens[k] + rng.normal(0.16 * atr, 0.28 * atr)
                if k % 7 in [4, 5]:
                    closes[k] -= rng.uniform(0.25, 0.48) * atr
                highs[k] = max(highs[k], max(opens[k], closes[k]) + rng.uniform(0.14, 0.42) * atr)
                lows[k] = max(min(lows[k], min(opens[k], closes[k]) - rng.uniform(0.10, 0.35) * atr), trigger - 0.95 * atr)
    elif side == "short" and grade not in ["C", "D"]:
        for k in range(max(1, sig - 5), sig):
            closes[k] += rng.uniform(0.10, 0.32) * atr
            highs[k] += rng.uniform(0.10, 0.35) * atr
        opens[sig] = closes[sig - 1] + 0.18 * atr
        closes[sig] = opens[sig] - 0.62 * atr
        highs[sig] = max(opens[sig], closes[sig]) + 0.85 * atr
        lows[sig] = min(opens[sig], closes[sig]) - 0.18 * atr
        trigger = lows[sig] - 0.18 * atr
        for k in range(sig + 1, min(n, sig + 6)):
            opens[k] = min(closes[k - 1] + rng.uniform(0.05, 0.28) * atr, trigger + 0.25 * atr)
            closes[k] = opens[k] - rng.uniform(0.28, 0.78) * atr
            lows[k] = min(lows[k], closes[k] - rng.uniform(0.18, 0.55) * atr)
            highs[k] = max(highs[k], opens[k] + rng.uniform(0.10, 0.40) * atr)
        if grade == "A+" and family in ["trend", "breakout"]:
            for k in range(sig + 6, n):
                opens[k] = min(closes[k - 1] + rng.uniform(0.05, 0.32) * atr, trigger + 0.55 * atr)
                closes[k] = opens[k] - rng.normal(0.16 * atr, 0.28 * atr)
                if k % 7 in [4, 5]:
                    closes[k] += rng.uniform(0.25, 0.48) * atr
                lows[k] = min(lows[k], min(opens[k], closes[k]) - rng.uniform(0.14, 0.42) * atr)
                highs[k] = min(max(highs[k], max(opens[k], closes[k]) + rng.uniform(0.10, 0.35) * atr), trigger + 0.95 * atr)
    else:
        sig = min(max(int(n * 0.60), 18), n - 8)
        mid = np.median(closes)
        highs[sig] = max(highs[sig], mid + rng.uniform(1.1, 2.4) * atr)
        lows[sig + 1] = min(lows[sig + 1], mid - rng.uniform(1.1, 2.4) * atr)
        closes[sig:sig + 4] = mid + rng.normal(0, 0.45, min(4, n - sig))

    return opens, highs, lows, closes, sig


def ema(values, period=20):
    alpha = 2 / (period + 1)
    out = np.zeros_like(values)
    out[0] = values[0]
    for i in range(1, len(values)):
        out[i] = alpha * values[i] + (1 - alpha) * out[i - 1]
    return out


def plot_chart(pattern: Pattern):
    o, h, l, c, sig = synthetic_ohlc(pattern)
    n = len(c)
    x = np.arange(n)
    fig = plt.figure(figsize=(19.0, 7.27), dpi=300)
    ax = fig.add_axes([0.055, 0.115, 0.90, 0.78])
    ax.set_facecolor("#fbfdff")
    fig.patch.set_facecolor("#ffffff")
    ax.grid(True, color=GRID, linewidth=1.05, alpha=0.92)
    ax.set_axisbelow(True)

    width = 0.72
    for i in range(n):
        color = GREEN if c[i] >= o[i] else RED
        ax.vlines(x[i], l[i], h[i], color=color, linewidth=2.25, alpha=0.98)
        bottom = min(o[i], c[i])
        height = abs(c[i] - o[i])
        if height < 0.05:
            ax.hlines(c[i], x[i] - width / 2, x[i] + width / 2, color=color, linewidth=3.4)
        else:
            ax.add_patch(
                plt.Rectangle((x[i] - width / 2, bottom), width, height, facecolor=color, edgecolor=color, linewidth=1.35)
            )

    e = ema(c)
    ax.plot(x, e, color="#d89000", linewidth=3.0, label="20 EMA")
    atr = float(np.mean(h - l))
    side = pattern.side
    grade = pattern.grade
    y_min, y_max = float(min(l) - 2.0 * atr), float(max(h) + 2.25 * atr)
    vol_height = (h - l) / max(float(np.max(h - l)), 1e-6) * (y_max - y_min) * 0.105
    ax.bar(x, vol_height, bottom=y_min, width=0.72, color=["#078052" if c[i] >= o[i] else "#c0261d" for i in range(n)], alpha=0.16, linewidth=0, zorder=0)
    ax.axhline(c[-1], color="#334155", linestyle=(0, (2, 5)), linewidth=1.45, alpha=0.55)

    def label(text, xy, xytext, color=BLUE, ha="left"):
        ax.annotate(
            text,
            xy=xy,
            xytext=xytext,
            textcoords="data",
            fontsize=15.0,
            fontproperties=MPL_FONT_BOLD,
            color=color,
            ha=ha,
            arrowprops=dict(arrowstyle="->", lw=2.65, color=color, shrinkA=4, shrinkB=3),
            bbox=dict(boxstyle="round,pad=0.38", fc="white", ec=color, lw=1.9, alpha=0.985),
        )

    if grade not in ["C", "D"] and side in ["long", "short"]:
        if side == "long":
            entry = h[sig] + 0.18 * atr
            stop = min(l[max(0, sig - 4):sig + 1]) - 0.22 * atr
            target = max(h[max(0, sig - 18):sig]) + 0.65 * atr
            trigger_idx = min(n - 1, sig + 1)
            ax.axhline(entry, color=BLUE, linestyle=(0, (8, 5)), linewidth=2.6)
            ax.axhline(stop, color=RED, linestyle=(0, (5, 4)), linewidth=2.2)
            ax.axhspan(target - 0.30 * atr, target + 0.30 * atr, color=GREEN, alpha=0.18)
            ax.scatter([sig], [h[sig] + 0.12 * atr], s=170, marker="o", color=AMBER, edgecolors="white", linewidths=1.8, zorder=6)
            ax.scatter([trigger_idx], [entry], s=250, marker="^", color=BLUE, edgecolors="white", linewidths=2.0, zorder=7)
            label("Signal Bar / 信号棒", (sig, h[sig]), (max(1, sig - 17), h[sig] + 1.9 * atr), AMBER)
            label("Entry Trigger / 入场触发价\n突破信号棒高点后才成交", (trigger_idx, entry), (min(n - 24, sig + 2), entry + 2.20 * atr), BLUE)
            label("Structure Stop / 结构止损", (sig, stop), (max(1, sig - 20), stop - 1.45 * atr), RED)
            label("First Target Zone / 第一目标区", (min(n - 1, sig + 10), target), (min(n - 23, sig + 11), target - 1.20 * atr), GREEN)
        else:
            entry = l[sig] - 0.18 * atr
            stop = max(h[max(0, sig - 4):sig + 1]) + 0.22 * atr
            target = min(l[max(0, sig - 18):sig]) - 0.65 * atr
            trigger_idx = min(n - 1, sig + 1)
            ax.axhline(entry, color=BLUE, linestyle=(0, (8, 5)), linewidth=2.6)
            ax.axhline(stop, color=RED, linestyle=(0, (5, 4)), linewidth=2.2)
            ax.axhspan(target - 0.30 * atr, target + 0.30 * atr, color=GREEN, alpha=0.18)
            ax.scatter([sig], [l[sig] - 0.12 * atr], s=170, marker="o", color=AMBER, edgecolors="white", linewidths=1.8, zorder=6)
            ax.scatter([trigger_idx], [entry], s=250, marker="v", color=BLUE, edgecolors="white", linewidths=2.0, zorder=7)
            label("Signal Bar / 信号棒", (sig, l[sig]), (max(1, sig - 17), l[sig] - 1.9 * atr), AMBER)
            label("Entry Trigger / 入场触发价\n跌破信号棒低点后才成交", (trigger_idx, entry), (min(n - 24, sig + 2), entry - 2.30 * atr), BLUE)
            label("Structure Stop / 结构止损", (sig, stop), (max(1, sig - 20), stop + 1.35 * atr), RED)
            label("First Target Zone / 第一目标区", (min(n - 1, sig + 10), target), (min(n - 23, sig + 11), target + 1.20 * atr), GREEN)
        # contextual lines: breakout point or channel.
        ax.axvspan(max(0, sig - 10), max(0, sig - 6), color="#dce7f5", alpha=0.30)
        ax.text(max(0, sig - 10), y_max - 0.75 * atr, "Context / 背景区", fontproperties=MPL_FONT_BOLD, fontsize=12, color="#394b61")
    else:
        mid = float(np.median(c))
        ax.axhspan(mid - 1.25 * atr, mid + 1.25 * atr, color="#f4c7c3", alpha=0.26)
        ax.axhline(mid, color=PURPLE, linestyle=(0, (7, 5)), linewidth=2.1)
        label("No Trade / 过滤区\n缺少清晰背景或跟随", (sig, mid), (max(2, sig - 18), mid + 2.35 * atr), RED)
        label("Wait / 等待确认\n突破 + 强收盘 + 跟随", (min(n - 1, sig + 8), c[min(n - 1, sig + 8)]), (min(n - 20, sig + 4), mid - 2.65 * atr), BLUE)
        if pattern.no == 104:
            ax.axhline(h[sig] + 0.18 * atr, color=BLUE, linestyle=(0, (8, 5)), linewidth=2.6)
            label("未触发：不能提前入场", (sig, h[sig]), (max(1, sig - 16), h[sig] + 2.4 * atr), RED)

    if pattern.family in ["trend", "breakout", "reversal"]:
        if side == "short":
            ax.plot([4, n - 5], [h[4] + 0.7 * atr, h[-5] + 0.25 * atr], color="#526071", linewidth=2.0, linestyle="--")
        else:
            ax.plot([4, n - 5], [l[4] - 0.5 * atr, l[-5] - 0.25 * atr], color="#526071", linewidth=2.0, linestyle="--")
    if pattern.family in ["range", "triangle", "avoid"]:
        ax.axhline(np.percentile(h, 84), color="#526071", linewidth=2.0, linestyle="--")
        ax.axhline(np.percentile(l, 16), color="#526071", linewidth=2.0, linestyle="--")

    ax.set_xlim(-1, n)
    ax.set_ylim(y_min, y_max)
    for spine in ax.spines.values():
        spine.set_color("#b8c5d8")
        spine.set_linewidth(1.2)
    ax.set_title(f"{pattern.no:03d}  {pattern.name}", fontproperties=MPL_FONT_BOLD, fontsize=27, loc="left", color=INK, pad=16)
    ax.set_ylabel("价格 / Price", fontproperties=MPL_FONT_BOLD, fontsize=16, color="#26364d")
    ax.tick_params(axis="both", labelsize=14, colors="#26364d")
    ax.set_xticks(np.linspace(0, n - 1, 8, dtype=int))
    ax.set_xlabel("合成K线序列：原创教学示意，不代表任何真实品种", fontproperties=MPL_FONT_BOLD, fontsize=14, color="#3f4f66")
    ax.legend(prop=MPL_FONT_BOLD, loc="upper left", frameon=True, facecolor="white", framealpha=0.98, fontsize=13)
    out = CHART_DIR / f"chart_{pattern.no:03d}.jpg"
    fig.savefig(out, dpi=300, facecolor="white")
    plt.close(fig)
    return out


def grade_color(grade):
    return {"A+": "#0d7c59", "A": "#2374ab", "B": "#7a5c00", "C": "#a34a00", "D": "#b42318"}[grade]


def explanations(pattern: Pattern):
    name = pattern.name
    side = pattern.side
    grade = pattern.grade
    if grade in ["A+", "A"]:
        why = "概率来自背景：强趋势、突破后有跟随、回踩不深，交易方向与主导力量一致。"
    elif grade == "B":
        why = "可交易性来自结构边缘或二次确认，但背景常有重叠，目标需更保守。"
    elif grade == "C":
        why = "信号质量不足或位置尴尬，更多用于训练过滤能力，而不是主动寻找入场。"
    else:
        why = "此类场景常把新手吸进低质量位置，教学重点是识别并避免。"

    if side == "long":
        entry = "等待信号棒完成；只有后续K线突破信号棒高点上方的虚线触发价，才算多头成交。强收盘与跟随K线优先。"
        stop = "止损放在信号棒低点、回踩低点或最近结构摆动低点下方；第一目标区参考前高、突破测量位或通道上沿。"
    elif side == "short":
        entry = "等待信号棒完成；只有后续K线跌破信号棒低点下方的虚线触发价，才算空头成交。弱反弹后再转弱更好。"
        stop = "止损放在信号棒高点、反弹高点或最近结构摆动高点上方；第一目标区参考前低、区间下沿或通道下轨。"
    else:
        entry = "本页不强行给入场箭头；先观察是否出现强收盘、跟随K线、突破后回踩成功或清晰二次信号。未触发边界不算成交。"
        stop = "若后续条件改善，止损仍必须依托结构高低点；目标需先确认到区间边缘、EMA、前高前低或突破测量位有足够空间。"

    if pattern.family == "range":
        context = f"{name}通常出现在多空反复拉扯后的区间边缘或中部。识别重点是高低点边界、重叠K线、假突破和回到区间的速度。{why}"
    elif pattern.family == "reversal":
        context = f"{name}不是看到反向K线就进场，而是先看到原趋势削弱、趋势线被突破、极端点测试失败，随后有确认或第二信号。{why}"
    elif pattern.family == "breakout":
        context = f"{name}要求突破K线收盘强、突破后至少有跟随或回踩不破突破点。单根大K线本身不够，关键是后续接受度。{why}"
    elif pattern.family == "avoid":
        context = f"{name}的核心特征是位置差、背景乱或风险收益不成立。识别时先问：是否在区间中部、是否无跟随、是否目标太近。{why}"
    else:
        context = f"{name}依赖趋势方向清楚、回调浅、K线重叠有限，并且信号棒顺着主趋势触发。{why}"

    abandon = "放弃条件：信号棒太弱、触发后无跟随、进入交易区间中部、目标空间小于结构风险，或市场周期已经从趋势转为震荡。常见误判：只看名称，不看背景与触发。"
    reminder = "实盘提醒：条件胜率不是固定胜率；市场周期、趋势强度、K线背景、成交触发、止损距离、目标位置和风险收益比必须一起评估。"
    return context, entry, stop, abandon, reminder


def draw_pattern_page(pattern: Pattern, chart_path: Path):
    img, d = page_base()
    d.text((M, 72), f"{pattern.no:03d}  {pattern.name}", font=F_H1, fill=INK)
    badge = f"条件胜率 / 实战优先级：{pattern.grade}"
    bx = PAGE_W - M - 980
    rounded_rect(d, (bx, 66, PAGE_W - M, 152), radius=28, fill=grade_color(pattern.grade))
    d.text((bx + 35, 84), badge, font=F_META, fill="white")
    d.text((M, 185), f"适用市场周期：{pattern.cycle}", font=F_META, fill=MUTED)
    d.text((PAGE_W - M - 1560, 185), "原创合成K线教学图；非投资建议", font=F_META, fill="#8a4b00")

    chart = Image.open(chart_path).convert("RGB").resize((CHART_W, CHART_H), Image.Resampling.LANCZOS)
    img.paste(chart, (CHART_X, CHART_Y))
    d.rectangle((CHART_X, CHART_Y, CHART_X + CHART_W, CHART_Y + CHART_H), outline="#c9d3e2", width=4)

    heads = ["识别条件", "入场逻辑", "止损与目标", "放弃条件 / 常见错误"]
    texts = explanations(pattern)
    for i in range(4):
        x = M + i * (COL_W + COL_GAP)
        y = TEXT_Y
        rounded_rect(d, (x, y, x + COL_W, PAGE_H - 100), radius=22, fill=PANEL, outline="#d8e0ec", width=2)
        d.text((x + 28, y + 24), heads[i], font=F_LABEL, fill=INK)
        wrapped(d, texts[i], (x + 28, y + 92), F_BODY_SMALL, fill="#111827", width_px=COL_W - 56, line_spacing=8, max_lines=8)
    d.text((M, PAGE_H - 76), "实盘提醒：" + texts[4], font=F_FOOT, fill="#5f3b00")
    out = PAGE_DIR / f"page_{pattern.no + 7:03d}.jpg"
    img.save(out, quality=92, subsampling=1)
    return out


def draw_text_page(page_no, title, sections, subtitle=None):
    img, d = page_base()
    d.text((M, 120), title, font=F_TITLE if page_no == 1 else F_H1, fill=INK)
    if subtitle:
        d.text((M, 240), subtitle, font=F_SUBTITLE, fill=MUTED)
    d.text((PAGE_W - M - 520, 110), f"前言 {page_no}/7", font=F_META, fill=MUTED)
    y = 420 if subtitle else 330
    for heading, body, accent in sections:
        rounded_rect(d, (M, y, PAGE_W - M, y + 345), radius=30, fill="#ffffff", outline="#d8e0ec", width=3)
        d.rectangle((M, y, M + 20, y + 345), fill=accent)
        d.text((M + 60, y + 36), heading, font=F_H2, fill=INK)
        wrapped(d, body, (M + 60, y + 112), F_BODY, fill="#263442", width_px=PAGE_W - 2 * M - 120, line_spacing=12, max_lines=4)
        y += 405
    d.text((M, PAGE_H - 90), "声明：本资料仅用于交易教育与图形识别训练，不构成任何真实投资建议。", font=F_META, fill="#8a4b00")
    out = PAGE_DIR / f"page_{page_no:03d}.jpg"
    img.save(out, quality=94, subsampling=1)
    return out


def front_pages():
    pages = []
    pages.append(
        draw_text_page(
            1,
            "Al Brooks 价格行为学形态图谱：完整详解高可读版",
            [
                ("按条件胜率与实战优先级排序", "从强顺势、强突破、确认反转、区间边缘，到低质量信号和避坑场景逐级排列。排序不是固定胜率排名，而是教学上的背景优先级。", BLUE),
                ("原创合成K线教学图", "全部图形由程序生成的合成OHLC数据绘制，保留重叠、假突破、回踩、犹豫K线和失败尝试；不复制书籍、课程、网页或第三方图表。", GREEN),
                ("不是交易建议", "任何形态都必须结合市场周期、趋势强度、K线背景、成交触发、止损距离、目标位置和风险收益比。", RED),
            ],
            subtitle="副标题：按条件胜率与实战优先级排序",
        )
    )
    pages.append(
        draw_text_page(
            2,
            "如何阅读本图谱",
            [
                ("信号棒", "信号棒是潜在入场的参考K线，不等于已经成交。它必须出现在合适背景中，并等待下一根或后续K线突破其高点或低点。", BLUE),
                ("入场触发价", "多头触发在信号棒高点上方；空头触发在信号棒低点下方。未突破信号棒高点或低点，不算入场。", GREEN),
                ("结构止损与第一目标区", "止损依托信号棒、回踩低点、反弹高点、摆动点或失败突破点；目标参考前高前低、区间边缘、EMA、通道线或测量目标。", AMBER),
                ("失效条件", "若触发后没有跟随、重新回到交易区间、目标空间不足或背景已经改变，应减仓、退出或放弃。", RED),
            ],
        )
    )
    pages.append(
        draw_text_page(
            3,
            "图例说明",
            [
                ("Entry Trigger / 入场触发价", "蓝色虚线或箭头表示等待成交的位置。多头只在信号棒高点上方触发；空头只在信号棒低点下方触发。", BLUE),
                ("Structure Stop / 结构止损", "红色虚线表示依托结构的止损位置，可能在信号棒另一侧、回踩低点、反弹高点或失败突破点外侧。", RED),
                ("First Target Zone / 第一目标区", "绿色区域表示优先观察的减仓或退出区，不表示保证到达；它通常来自前高前低、区间边缘、EMA、通道线或测量目标。", GREEN),
                ("No Trade / 等待区", "红色半透明区或过滤区表示背景混乱、信号弱、目标空间不足或未确认突破；此时重点是等待，而不是预测。", PURPLE),
            ],
        )
    )
    pages.append(
        draw_text_page(
            4,
            "胜率等级说明",
            [
                ("A+：高条件胜率", "通常需要强趋势、强突破、连续跟随、清晰回踩与顺势交易。仍需结构止损和可接受的风险收益比。", GREEN),
                ("A：较高条件胜率", "需要良好背景与清晰信号，适合顺势或确认后的反转。第二次入场通常优于第一次逆势反转。", BLUE),
                ("B：中等条件胜率", "可以交易，但必须严格过滤背景，目标更保守，尤其要避开交易区间中部和重叠严重区域。", AMBER),
                ("C / D：过滤与避坑", "C 多用于经验交易者的小仓观察或教学过滤；D 主要提醒不要交易，等待更清晰的二次信号或背景改善。", RED),
            ],
        )
    )
    pages.append(
        draw_text_page(
            5,
            "市场周期说明",
            [
                ("趋势与趋势通道", "趋势中高低点沿一个方向推进；紧密通道回调浅，宽通道回调深，交易计划必须随通道质量调整。", BLUE),
                ("交易区间", "区间中多空反复失败，边缘比中部更重要。低买高卖需要信号和空间，区间中部多数信号应过滤。", AMBER),
                ("突破模式", "突破前常见收缩、三角形、窄幅整理或突破模式。只有强收盘和跟随K线，才可视为确认突破。", GREEN),
                ("高潮与转换阶段", "高潮可能继续趋势，也可能反转；没有确认前，逆势第一信号通常风险较高。", RED),
            ],
        )
    )
    pages.append(
        draw_text_page(
            6,
            "入场规则页",
            [
                ("多头入场规则", "多头不能标在信号棒内部，也不能标在信号棒收盘价。必须等待信号棒完成后，后续K线突破信号棒高点上方触发。", BLUE),
                ("空头入场规则", "空头不能标在信号棒内部，也不能标在信号棒收盘价。必须等待信号棒完成后，后续K线跌破信号棒低点下方触发。", RED),
                ("突破尝试 vs 突破确认", "突破尝试只是越过边界；确认突破还需要强收盘、突破后接受度和跟随K线。开盘或区间突破尤其要区分。", GREEN),
                ("没有触发就没有交易", "未突破信号棒高点或低点，不算成交。低质量背景中，等待、放弃和 No Trade 是完整交易计划的一部分。", AMBER),
            ],
        )
    )
    pages.append(
        draw_text_page(
            7,
            "风险与误用提醒",
            [
                ("条件胜率不是固定胜率", "价格行为形态的成功率取决于市场周期、趋势强度、K线背景、成交触发、止损距离、目标位置和风险收益比。", RED),
                ("背景比单个形态重要", "同一个形态在强趋势、宽通道、交易区间中部和新闻前后会有完全不同的含义。不能脱离背景单独使用。", BLUE),
                ("不要机械套用目标", "第一目标区不是固定2R；它应来自前高、前低、开盘区间、交易区间边缘、突破测量目标、EMA、通道线或最近摆动点。", GREEN),
                ("教学用途声明", "本资料用于训练观察、标注与风险意识，不推荐任何真实交易品种、方向、仓位或买卖时机。", AMBER),
            ],
        )
    )
    return pages


def make_pdf(page_paths):
    page_size = (PAGE_W / 300 * 72, PAGE_H / 300 * 72)
    c = canvas.Canvas(str(PDF_PATH), pagesize=page_size)
    for p in page_paths:
        c.drawImage(ImageReader(str(p)), 0, 0, width=page_size[0], height=page_size[1])
        c.showPage()
    c.save()


def main():
    OUT_DIR.mkdir(exist_ok=True)
    PAGE_DIR.mkdir(exist_ok=True)
    CHART_DIR.mkdir(exist_ok=True)
    random.seed(7)
    np.random.seed(7)
    page_paths = front_pages()
    for pat in PATTERNS:
        chart = plot_chart(pat)
        page_paths.append(draw_pattern_page(pat, chart))
    make_pdf(page_paths)
    print(f"PDF written: {PDF_PATH}")
    print(f"Pages: {len(page_paths)}")
    print(f"Page JPGs: {PAGE_DIR}")


if __name__ == "__main__":
    main()
