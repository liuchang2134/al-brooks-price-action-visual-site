import math
from dataclasses import dataclass
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from PIL import Image
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas

import generate_al_brooks_price_action_pdf as base


ROOT = Path(__file__).resolve().parent
OUT_DIR = ROOT / "output_al_brooks_opening_price_action"
PAGE_DIR = OUT_DIR / "pages"
CHART_DIR = OUT_DIR / "charts"
PDF_PATH = ROOT / "Al_Brooks开盘时段价格行为形态专题_完整详解高可读版.pdf"


@dataclass
class OpenPattern:
    no: int
    name: str
    grade: str
    cycle: str
    side: str
    family: str
    gap: str
    uses_range: bool
    uses_18_20: bool


A_PLUS = [
    "Trend From The Open Bull：多头趋势从开盘",
    "Trend From The Open Bear：空头趋势从开盘",
    "Bull Gap and Go：高开后强势延续",
    "Bear Gap and Go：低开后强势延续",
    "强开盘突破 + 连续跟随K线",
    "开盘突破后的第一次回踩",
    "开盘小回调趋势",
    "开盘紧密通道趋势",
    "开盘 Spike and Channel",
    "开盘突破点回踩成功",
    "开盘 H1 / L1 顺势入场",
    "开盘 H2 / L2 二次回调入场",
    "开盘 20 EMA 第一次顺势回踩",
    "开盘微型通道延续",
    "开盘区间强突破 + 跟随K线",
    "开盘强趋势中失败逆势突破",
    "开盘强突破后窄幅整理再延续",
    "开盘测量目标突破延续",
]
A = [
    "Opening Reversal at Prior Day High：前日高点开盘反转",
    "Opening Reversal at Prior Day Low：前日低点开盘反转",
    "Gap Fill Reversal：补缺口后反转",
    "Failed Gap and Go 后反转",
    "开盘楔形高潮反转",
    "开盘抛物线楔形反转",
    "开盘双顶反转，带强信号棒",
    "开盘双底反转，带强信号棒",
    "开盘微型双顶反转",
    "开盘微型双底反转",
    "开盘趋势线突破后测试极端点失败",
    "开盘 Major Trend Reversal 多头",
    "开盘 Major Trend Reversal 空头",
    "开盘 Final Flag 失败反转",
    "开盘趋势通道线过冲后反转",
    "开盘高潮后第二信号入场",
    "开盘反转后突破开盘价",
    "开盘反转后突破 EMA",
    "开盘回到前日收盘价后反转",
    "开盘在前日区间边缘失败突破",
    "开盘测试隔夜高点失败",
    "开盘测试隔夜低点失败",
]
B = [
    "18-20 根K线开盘区间向上突破",
    "18-20 根K线开盘区间向下突破",
    "开盘区间突破后回踩上沿",
    "开盘区间突破后回踩下沿",
    "开盘区间假突破后反向",
    "开盘区间顶部二次卖出",
    "开盘区间底部二次买入",
    "开盘区间中轴过滤",
    "开盘三角形突破",
    "开盘三角形假突破",
    "开盘扩张三角形",
    "开盘宽通道趋势",
    "开盘宽通道边缘反转",
    "开盘交易区间低买高卖",
    "开盘 Breakout Mode 等待方向",
    "开盘 Tight Trading Range 后突破",
    "开盘 Double Top Bear Flag",
    "开盘 Double Bottom Bull Flag",
    "开盘前高突破失败",
    "开盘前低跌破失败",
]
C = [
    "开盘第一根K线后立刻追单",
    "开盘大阳线后无回踩追多",
    "开盘大阴线后无回踩追空",
    "开盘强趋势中的第一次逆势反转",
    "开盘紧密通道中逆势交易",
    "开盘交易区间中部做突破",
    "开盘无跟随突破",
    "开盘 Doji 信号棒入场",
    "开盘大影线但收盘弱的信号棒",
    "开盘目标空间不足的入场",
]
D = [
    "开盘前 5 分钟无确认乱入场",
    "开盘区间中部频繁来回交易",
    "开盘只看缺口方向、不看跟随K线",
]


def infer_side(name, no, grade):
    lower = name.lower()
    if grade in ["C", "D"] or "等待" in name or "中轴过滤" in name:
        return "none"
    if any(k in lower for k in ["bear", "空头", "低开", "做空", "卖出", "双顶", "向下", "下沿", "前低跌破"]):
        return "short"
    if any(k in lower for k in ["bull", "多头", "高开", "做多", "买入", "双底", "向上", "上沿", "前高突破"]):
        return "long"
    return "short" if no % 4 == 0 else "long"


def make_patterns():
    out = []
    no = 1
    for grade, names, cycle in [
        ("A+", A_PLUS, "开盘前60-90分钟 / 强趋势优先"),
        ("A", A, "关键位测试 / 开盘确认反转"),
        ("B", B, "开盘区间 / 18-20根K线 / 突破模式"),
        ("C", C, "低质量开盘信号 / 过滤优先"),
        ("D", D, "开盘避坑 / 禁止提前交易"),
    ]:
        for name in names:
            side = infer_side(name, no, grade)
            lower = name.lower()
            family = "avoid" if grade in ["C", "D"] else "trend"
            if "反转" in name or "失败" in name or "reversal" in lower:
                family = "reversal"
            if "区间" in name or "range" in lower:
                family = "range"
            if "三角" in name:
                family = "triangle"
            if "突破" in name or "gap and go" in lower:
                family = "breakout"
            gap = "up" if any(k in lower for k in ["gap", "高开"]) and "bear" not in lower and "低开" not in name else "none"
            if any(k in lower for k in ["bear gap", "低开"]):
                gap = "down"
            uses_range = "区间" in name or no in range(41, 61)
            uses_18_20 = no in [41, 42] or "18-20" in name
            out.append(OpenPattern(no, name, grade, cycle, side, family, gap, uses_range, uses_18_20))
            no += 1
    return out


PATTERNS = make_patterns()


def synthetic_opening_ohlc(p):
    rng = np.random.default_rng(23000 + p.no * 37)
    n = int(rng.integers(44, 64))
    prior_close = 100.0
    if p.gap == "up":
        open_price = prior_close + rng.uniform(2.2, 4.2)
    elif p.gap == "down":
        open_price = prior_close - rng.uniform(2.2, 4.2)
    else:
        open_price = prior_close + rng.normal(0, 0.7)

    sign = -1 if p.side == "short" else 1
    if p.side == "none":
        sign = 1 if p.no % 2 else -1

    returns = rng.normal(0, 0.36, n)
    returns[:5] += sign * rng.uniform(0.10, 0.26)
    if p.family in ["range", "triangle"] or p.grade in ["C", "D"]:
        returns = rng.normal(0, 0.62 if p.grade in ["C", "D"] else 0.48, n)
    elif p.family == "reversal":
        first, second = int(n * 0.30), int(n * 0.50)
        returns[:first] += -sign * rng.uniform(0.23, 0.42)
        returns[first:second] += rng.normal(0, 0.22, second - first)
        returns[second:] += sign * rng.uniform(0.24, 0.40)
    else:
        returns += sign * rng.uniform(0.18, 0.32)
        for j in range(7, n, int(rng.integers(8, 12))):
            returns[j:j + 2] += -sign * rng.uniform(0.26, 0.58)

    closes = np.zeros(n)
    closes[0] = open_price + returns[0]
    for i in range(1, n):
        if p.family in ["range", "triangle"] or p.grade in ["C", "D"]:
            closes[i] = closes[i - 1] + returns[i] + (open_price - closes[i - 1]) * 0.12
        else:
            closes[i] = closes[i - 1] + returns[i]

    if p.family == "triangle":
        amp = np.linspace(4.3, 0.9, n)
        closes = open_price + np.sin(np.linspace(0, 7.5 * math.pi, n)) * amp * 0.36 + rng.normal(0, 0.32, n)

    opens = np.r_[open_price, closes[:-1] + rng.normal(0, 0.26, n - 1)]
    body = np.abs(closes - opens)
    wick = rng.uniform(0.28, 1.10, n) + body * rng.uniform(0.12, 0.42, n)
    highs = np.maximum(opens, closes) + wick * rng.uniform(0.70, 1.55, n)
    lows = np.minimum(opens, closes) - wick * rng.uniform(0.70, 1.55, n)

    # Make the first bars look like an open: bigger, messier, and emotionally tempting.
    for i in range(min(6, n)):
        highs[i] += rng.uniform(0.9, 2.4)
        lows[i] -= rng.uniform(0.9, 2.4)
        if i % 2:
            closes[i] = opens[i] + rng.normal(0, 0.18)
    for j in rng.choice(np.arange(6, n - 5), size=max(3, n // 12), replace=False):
        if rng.random() < 0.5:
            highs[j] += rng.uniform(1.0, 2.4)
        else:
            lows[j] -= rng.uniform(1.0, 2.4)

    atr = float(np.mean(highs[:20] - lows[:20]))
    sig = min(max(int(n * 0.64), 16), n - 7)
    if p.grade not in ["C", "D"] and p.side in ["long", "short"]:
        if p.side == "long":
            opens[sig] = closes[sig - 1] - 0.18 * atr
            closes[sig] = opens[sig] + 0.66 * atr
            lows[sig] = min(opens[sig], closes[sig]) - 0.72 * atr
            highs[sig] = max(opens[sig], closes[sig]) + 0.20 * atr
            trigger = highs[sig] + 0.16 * atr
            for k in range(sig + 1, min(n, sig + 5)):
                opens[k] = max(closes[k - 1] - rng.uniform(0.05, 0.24) * atr, trigger - 0.25 * atr)
                closes[k] = opens[k] + rng.uniform(0.24, 0.75) * atr
                highs[k] = max(highs[k], closes[k] + rng.uniform(0.22, 0.55) * atr)
        else:
            opens[sig] = closes[sig - 1] + 0.18 * atr
            closes[sig] = opens[sig] - 0.66 * atr
            highs[sig] = max(opens[sig], closes[sig]) + 0.72 * atr
            lows[sig] = min(opens[sig], closes[sig]) - 0.20 * atr
            trigger = lows[sig] - 0.16 * atr
            for k in range(sig + 1, min(n, sig + 5)):
                opens[k] = min(closes[k - 1] + rng.uniform(0.05, 0.24) * atr, trigger + 0.25 * atr)
                closes[k] = opens[k] - rng.uniform(0.24, 0.75) * atr
                lows[k] = min(lows[k], closes[k] - rng.uniform(0.22, 0.55) * atr)
    else:
        mid = np.median(closes)
        closes[sig:sig + 4] = mid + rng.normal(0, 0.42, min(4, n - sig))
    return opens, highs, lows, closes, sig, prior_close, open_price


def plot_opening_chart(p):
    o, h, l, c, sig, prior_close, open_price = synthetic_opening_ohlc(p)
    n = len(c)
    x = np.arange(n)
    fig = plt.figure(figsize=(19.0, 7.27), dpi=300)
    ax = fig.add_axes([0.055, 0.115, 0.90, 0.78])
    ax.set_facecolor("#fbfdff")
    fig.patch.set_facecolor("#ffffff")
    ax.grid(True, color=base.GRID, linewidth=1.05, alpha=0.92)
    ax.set_axisbelow(True)

    or_end = min(20, n - 1)
    or_high = float(np.max(h[:or_end]))
    or_low = float(np.min(l[:or_end]))
    if p.uses_18_20:
        ax.axvspan(-0.5, or_end - 0.5, color="#dbeafe", alpha=0.28)

    width = 0.72
    for i in range(n):
        color = base.GREEN if c[i] >= o[i] else base.RED
        ax.vlines(x[i], l[i], h[i], color=color, linewidth=2.25, alpha=0.98)
        bottom = min(o[i], c[i])
        height = abs(c[i] - o[i])
        if height < 0.05:
            ax.hlines(c[i], x[i] - width / 2, x[i] + width / 2, color=color, linewidth=3.4)
        else:
            ax.add_patch(plt.Rectangle((x[i] - width / 2, bottom), width, height, facecolor=color, edgecolor=color, linewidth=1.35))

    ema = base.ema(c)
    ax.plot(x, ema, color="#d89000", linewidth=3.0, label="20 EMA / VWAP参考")
    atr = float(np.mean(h - l))
    y_min, y_max = float(min(l.min(), prior_close) - 2.0 * atr), float(max(h.max(), prior_close) + 2.25 * atr)
    vol_height = (h - l) / max(float(np.max(h - l)), 1e-6) * (y_max - y_min) * 0.105
    ax.bar(x, vol_height, bottom=y_min, width=0.72, color=[base.GREEN if c[i] >= o[i] else base.RED for i in range(n)], alpha=0.16, linewidth=0, zorder=0)
    ax.axhline(c[-1], color="#334155", linestyle=(0, (2, 5)), linewidth=1.45, alpha=0.55)
    if p.uses_18_20:
        ax.text(1, y_max - 0.80 * atr, "18-20根开盘观察区间", fontproperties=base.MPL_FONT_BOLD, fontsize=13, color=base.BLUE)
    ax.axhline(open_price, color="#111827", linestyle=(0, (7, 5)), linewidth=2.5)
    ax.text(max(1, n - 14), open_price + 0.26 * atr, "Open / 开盘价", fontproperties=base.MPL_FONT_BOLD, fontsize=13, color="#111827")

    if p.gap in ["up", "down"] or "前日" in p.name or "缺口" in p.name:
        ax.axhline(prior_close, color=base.PURPLE, linestyle=(0, (5, 5)), linewidth=2.3)
        ax.text(1, prior_close + 0.28 * atr, "Prior Close / 前日收盘", fontproperties=base.MPL_FONT_BOLD, fontsize=12.5, color=base.PURPLE)
        ax.annotate("Gap / 缺口", xy=(1.5, (prior_close + open_price) / 2), xytext=(5, (prior_close + open_price) / 2 + (0.8 if p.gap != "down" else -0.8) * atr),
                    fontproperties=base.MPL_FONT_BOLD, fontsize=13, color=base.AMBER,
                    arrowprops=dict(arrowstyle="->", color=base.AMBER, lw=2.1),
                    bbox=dict(boxstyle="round,pad=0.34", fc="white", ec=base.AMBER, lw=1.5, alpha=0.96))

    if p.uses_range or p.uses_18_20:
        ax.axhline(or_high, color="#526071", linestyle="--", linewidth=2.2)
        ax.axhline(or_low, color="#526071", linestyle="--", linewidth=2.2)
        ax.text(1, or_high + 0.20 * atr, "Opening Range High", fontproperties=base.MPL_FONT_BOLD, fontsize=12.5, color="#36475b")
        ax.text(1, or_low - 0.60 * atr, "Opening Range Low", fontproperties=base.MPL_FONT_BOLD, fontsize=12.5, color="#36475b")

    def label(text, xy, xytext, color=base.BLUE):
        ax.annotate(text, xy=xy, xytext=xytext, fontproperties=base.MPL_FONT_BOLD, fontsize=15, color=color,
                    arrowprops=dict(arrowstyle="->", lw=2.65, color=color, shrinkA=4, shrinkB=3),
                    bbox=dict(boxstyle="round,pad=0.38", fc="white", ec=color, lw=1.9, alpha=0.985))

    if p.grade not in ["C", "D"] and p.side in ["long", "short"]:
        if p.side == "long":
            entry = h[sig] + 0.18 * atr
            stop = min(l[max(0, sig - 4):sig + 1].min(), or_low if p.uses_range else l[sig]) - 0.22 * atr
            target = max(h[:sig].max(), open_price) + 0.85 * atr
            trigger_idx = min(n - 1, sig + 1)
            ax.axhline(entry, color=base.BLUE, linestyle=(0, (8, 5)), linewidth=2.6)
            ax.axhline(stop, color=base.RED, linestyle=(0, (5, 4)), linewidth=2.2)
            ax.axhspan(target - 0.30 * atr, target + 0.30 * atr, color=base.GREEN, alpha=0.18)
            ax.scatter([trigger_idx], [entry], s=250, marker="^", color=base.BLUE, edgecolors="white", linewidths=2.0, zorder=7)
            label("Entry Trigger / 入场触发价\n高点上方触发，不提前", (trigger_idx, entry), (min(n - 24, sig + 2), entry + 2.15 * atr), base.BLUE)
            label("Structure Stop / 结构止损", (sig, stop), (max(1, sig - 18), stop - 1.35 * atr), base.RED)
            label("First Target Zone / 第一目标区", (min(n - 1, sig + 8), target), (min(n - 23, sig + 10), target - 1.20 * atr), base.GREEN)
        else:
            entry = l[sig] - 0.18 * atr
            stop = max(h[max(0, sig - 4):sig + 1].max(), or_high if p.uses_range else h[sig]) + 0.22 * atr
            target = min(l[:sig].min(), open_price) - 0.85 * atr
            trigger_idx = min(n - 1, sig + 1)
            ax.axhline(entry, color=base.BLUE, linestyle=(0, (8, 5)), linewidth=2.6)
            ax.axhline(stop, color=base.RED, linestyle=(0, (5, 4)), linewidth=2.2)
            ax.axhspan(target - 0.30 * atr, target + 0.30 * atr, color=base.GREEN, alpha=0.18)
            ax.scatter([trigger_idx], [entry], s=250, marker="v", color=base.BLUE, edgecolors="white", linewidths=2.0, zorder=7)
            label("Entry Trigger / 入场触发价\n低点下方触发，不提前", (trigger_idx, entry), (min(n - 24, sig + 2), entry - 2.20 * atr), base.BLUE)
            label("Structure Stop / 结构止损", (sig, stop), (max(1, sig - 18), stop + 1.25 * atr), base.RED)
            label("First Target Zone / 第一目标区", (min(n - 1, sig + 8), target), (min(n - 23, sig + 10), target + 1.20 * atr), base.GREEN)
        label("确认条件：强收盘 + 跟随K线", (min(n - 1, sig + 3), c[min(n - 1, sig + 3)]), (max(1, sig - 20), c[min(n - 1, sig + 3)] + (2.15 if p.side == "long" else -2.15) * atr), base.AMBER)
    else:
        mid = (or_high + or_low) / 2 if p.uses_range else float(np.median(c))
        ax.axhspan(mid - 1.18 * atr, mid + 1.18 * atr, color="#f4c7c3", alpha=0.26)
        label("No Trade / 等待确认\n开盘混乱或无跟随", (sig, mid), (max(2, sig - 16), mid + 2.15 * atr), base.RED)
        label("先观察强收盘与跟随", (min(n - 1, sig + 6), c[min(n - 1, sig + 6)]), (min(n - 19, sig + 3), mid - 2.35 * atr), base.BLUE)

    ax.set_xlim(-1, n)
    ax.set_ylim(y_min, y_max)
    for spine in ax.spines.values():
        spine.set_color("#b8c5d8")
        spine.set_linewidth(1.2)
    ax.set_title(f"{p.no:03d}  {p.name}", fontproperties=base.MPL_FONT_BOLD, fontsize=27, loc="left", color=base.INK, pad=16)
    ax.set_ylabel("价格 / Price", fontproperties=base.MPL_FONT_BOLD, fontsize=16, color="#26364d")
    ax.tick_params(axis="both", labelsize=14, colors="#26364d")
    ax.set_xticks(np.linspace(0, n - 1, 8, dtype=int))
    ax.set_xlabel("合成开盘K线序列：原创教学示意，不代表任何真实品种", fontproperties=base.MPL_FONT_BOLD, fontsize=14, color="#3f4f66")
    ax.legend(prop=base.MPL_FONT_BOLD, loc="upper left", frameon=True, facecolor="white", framealpha=0.98)
    out = CHART_DIR / f"opening_chart_{p.no:03d}.jpg"
    fig.savefig(out, dpi=300, facecolor="white")
    plt.close(fig)
    return out


def open_explanations(p):
    if p.gap == "up":
        bg = "高开缺口背景，重点看开盘后是否继续被买盘接受，而不是只看缺口方向。"
    elif p.gap == "down":
        bg = "低开缺口背景，重点看开盘后是否继续被卖盘接受，而不是看到低开就追空。"
    elif "前日高点" in p.name or "前日低点" in p.name:
        bg = "开盘测试前日关键高低点，常见快速试探、失败突破和反向跟随。"
    elif p.uses_range:
        bg = "震荡或开盘区间背景，前18-20根K线用于观察边界与多空接受度。"
    else:
        bg = "平开或轻微缺口后的开盘前60-90分钟，先判断趋势从开盘还是进入区间。"

    identify = f"开盘背景：{bg} 识别条件：前几根K线是否连续收在高位/低位、影线是否反复、回踩是否浅、突破后是否有跟随。"
    if p.side == "long":
        entry = "入场触发：等待信号棒完成；只有后续K线突破信号棒高点上方虚线才算多头触发。开盘突破类还要有强收盘和跟随K线。"
        stop = "止损：放在开盘回踩低点、信号棒低点、开盘区间另一侧或突破失败点下方；第一目标区参考开盘测量目标、前日高点、缺口填补区或当日新高。"
    elif p.side == "short":
        entry = "入场触发：等待信号棒完成；只有后续K线跌破信号棒低点下方虚线才算空头触发。开盘突破类还要有强收盘和跟随K线。"
        stop = "止损：放在开盘反弹高点、信号棒高点、开盘区间另一侧或突破失败点上方；第一目标区参考开盘测量目标、前日低点、缺口填补区或当日新低。"
    else:
        entry = "入场触发：本页不强行标入场；先等待开盘区间边界被有效突破，或出现强收盘、跟随K线和清晰二次信号。"
        stop = "止损与目标：若后续条件改善，止损仍必须依托开盘区间边缘、信号棒另一侧或失败突破点；目标空间不足时放弃。"
    abandon = "放弃条件：K线重叠太多、突破无跟随、快速回到区间、进入区间中轴、止损过大、目标空间不足或前5分钟波动过度混乱。常见误判：把第一根大K线当成必然趋势。"
    reminder = "实盘提醒：开盘条件胜率不是固定胜率；缺口、开盘价、开盘区间、跟随K线、止损距离与目标空间必须一起评估。"
    return identify, entry, stop, abandon, reminder


def draw_open_pattern_page(p, chart_path):
    img, d = base.page_base()
    d.text((base.M, 72), f"{p.no:03d}  {p.name}", font=base.F_H1, fill=base.INK)
    bx = base.PAGE_W - base.M - 980
    base.rounded_rect(d, (bx, 66, base.PAGE_W - base.M, 152), radius=28, fill=base.grade_color(p.grade))
    d.text((bx + 35, 84), f"条件胜率 / 实战优先级：{p.grade}", font=base.F_META, fill="white")
    d.text((base.M, 185), f"适用市场周期：{p.cycle}", font=base.F_META, fill=base.MUTED)
    d.text((base.PAGE_W - base.M - 1600, 185), "开盘专题：原创合成K线教学图；非投资建议", font=base.F_META, fill="#8a4b00")
    chart = Image.open(chart_path).convert("RGB").resize((base.CHART_W, base.CHART_H), Image.Resampling.LANCZOS)
    img.paste(chart, (base.CHART_X, base.CHART_Y))
    d.rectangle((base.CHART_X, base.CHART_Y, base.CHART_X + base.CHART_W, base.CHART_Y + base.CHART_H), outline="#c9d3e2", width=4)
    heads = ["开盘背景 / 识别条件", "入场触发", "止损与第一目标区", "放弃条件 / 常见误判"]
    texts = open_explanations(p)
    for i in range(4):
        x = base.M + i * (base.COL_W + base.COL_GAP)
        y = base.TEXT_Y
        base.rounded_rect(d, (x, y, x + base.COL_W, base.PAGE_H - 100), radius=22, fill=base.PANEL, outline="#d8e0ec", width=2)
        d.text((x + 28, y + 24), heads[i], font=base.F_LABEL, fill=base.INK)
        base.wrapped(d, texts[i], (x + 28, y + 92), base.F_BODY_SMALL, fill="#111827", width_px=base.COL_W - 56, line_spacing=8, max_lines=8)
    d.text((base.M, base.PAGE_H - 76), "实盘提醒：" + texts[4], font=base.F_FOOT, fill="#5f3b00")
    out = PAGE_DIR / f"opening_page_{p.no + 6:03d}.jpg"
    img.save(out, quality=92, subsampling=1)
    return out


def front_pages():
    pages = []
    pages.append(base.draw_text_page(1, "Al Brooks 开盘时段价格行为形态专题：完整详解高可读版", [
        ("开盘前60-90分钟核心形态", "聚焦美股、期货或指数开盘后的趋势从开盘、Gap-and-Go、开盘反转、开盘区间突破、失败突破与开盘陷阱。", base.BLUE),
        ("按条件胜率与实战优先级排序", "从强趋势从开盘、强缺口延续和确认突破，到开盘区间、低质量信号与避坑场景逐级排列。", base.GREEN),
        ("原创合成K线教学图", "所有图片均为程序生成的合成开盘K线，不复制任何书籍、课程、网页或第三方图表截图。", base.AMBER),
    ], subtitle="副标题：开盘前 60-90 分钟核心形态，按条件胜率与实战优先级排序"))
    pages[-1] = PAGE_DIR / pages[-1].name
    pages.append(base.draw_text_page(2, "开盘时段框架", [
        ("前5分钟", "波动最大、情绪最重，第一根大K线常有诱惑性；除非有强背景和后续跟随，否则不急于定方向。", base.RED),
        ("前15分钟", "开始形成初始高低点和可能的开盘价测试；观察连续强收盘、影线、重叠与是否快速回到开盘价。", base.BLUE),
        ("前30分钟", "常形成开盘区间或趋势通道雏形，适合区分 Trend From The Open、Gap-and-Go、交易区间开盘。", base.GREEN),
        ("前60-90分钟", "多数开盘主题会显形：趋势延续、开盘反转、区间突破、失败突破或进入日内震荡。", base.AMBER),
    ]))
    pages[-1] = PAGE_DIR / pages[-1].name
    pages.append(base.draw_text_page(3, "18-20 根K线开盘区间说明", [
        ("观察而非预测", "开盘后约18-20根K线可能形成初始开盘区间。区间未有效突破前，方向判断要保守。", base.BLUE),
        ("Opening Range High / Low", "区间高低点是开盘交易的边界。突破边界只是尝试，强收盘和跟随K线才提高确认质量。", base.GREEN),
        ("突破后的回踩", "高质量突破常在回踩区间边缘时不重新进入区间，并出现顺势信号棒或小回调趋势。", base.AMBER),
        ("中轴过滤", "区间中部目标空间小、方向随机性高，常是低质量追单和频繁止损的来源。", base.RED),
    ]))
    pages[-1] = PAGE_DIR / pages[-1].name
    pages.append(base.draw_text_page(4, "图例页", [
        ("Open / Prior Close / Gap", "黑色虚线为开盘价，紫色虚线为前日收盘价；两者之间的距离表示缺口及方向。", base.PURPLE),
        ("Opening Range", "灰色虚线标记 Opening Range High 与 Opening Range Low；18-20根观察区间用浅蓝背景。", base.BLUE),
        ("EMA或VWAP参考", "橙色线作为开盘均值参考，帮助观察回踩、偏离、恢复和趋势强弱。", base.AMBER),
        ("突破触发与No Trade", "蓝色虚线为触发价；红色过滤区表示无确认、无跟随或区间中部，优先等待。", base.RED),
    ]))
    pages[-1] = PAGE_DIR / pages[-1].name
    pages.append(base.draw_text_page(5, "入场标注规则", [
        ("多头触发", "多头必须等待信号棒完成，并在后续K线突破信号棒高点上方才触发。不能把箭头画在信号棒内部或收盘价。", base.BLUE),
        ("空头触发", "空头必须等待信号棒完成，并在后续K线跌破信号棒低点下方才触发。未跌破不算成交。", base.RED),
        ("开盘突破确认", "开盘突破必须区分突破尝试与确认突破；只有强收盘和跟随K线，才可称为确认。", base.GREEN),
        ("等待是规则", "开盘第一根K线后的冲动追单不是计划。低质量背景中，No Trade 是主动防守。", base.AMBER),
    ]))
    pages[-1] = PAGE_DIR / pages[-1].name
    pages.append(base.draw_text_page(6, "风险提醒", [
        ("开盘波动更大", "开盘止损常更宽，滑点和假突破更多。仓位、止损距离与目标空间必须重新校准。", base.RED),
        ("缺口不是方向保证", "Gap-and-Go 需要开盘后接受度、强收盘和跟随；只看缺口方向容易追在陷阱里。", base.AMBER),
        ("区间中部少交易", "开盘区间中部目标空间不足，容易上下扫损；优先等待边界、二次信号或确认突破。", base.BLUE),
        ("教学用途声明", "本资料不提供真实投资建议，不推荐任何真实品种、方向、仓位或买卖时机。", base.GREEN),
    ]))
    pages[-1] = PAGE_DIR / pages[-1].name
    return pages


def make_pdf(page_paths):
    page_size = (base.PAGE_W / 300 * 72, base.PAGE_H / 300 * 72)
    c = canvas.Canvas(str(PDF_PATH), pagesize=page_size)
    for p in page_paths:
        c.drawImage(ImageReader(str(p)), 0, 0, width=page_size[0], height=page_size[1])
        c.showPage()
    c.save()


def main():
    OUT_DIR.mkdir(exist_ok=True)
    PAGE_DIR.mkdir(exist_ok=True)
    CHART_DIR.mkdir(exist_ok=True)
    old_base_page_dir = base.PAGE_DIR
    base.PAGE_DIR = PAGE_DIR
    page_paths = front_pages()
    base.PAGE_DIR = old_base_page_dir
    for p in PATTERNS:
        chart = plot_opening_chart(p)
        page_paths.append(draw_open_pattern_page(p, chart))
    make_pdf(page_paths)
    print(f"PDF written: {PDF_PATH}")
    print(f"Pages: {len(page_paths)}")


if __name__ == "__main__":
    main()
