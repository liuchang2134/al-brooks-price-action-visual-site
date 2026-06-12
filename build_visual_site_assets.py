import json
import os
from pathlib import Path

from PIL import Image

import generate_al_brooks_opening_price_action_pdf as opening
import generate_al_brooks_price_action_pdf as atlas


ROOT = Path(__file__).resolve().parent
SITE = ROOT / "al_brooks_visual_site"
THUMBS = SITE / "thumbs"
DATA_JS = SITE / "app-data.js"


ATLAS_PAGES = ROOT / "output_al_brooks_price_action_atlas" / "pages"
OPENING_PAGES = ROOT / "output_al_brooks_opening_price_action" / "pages"


ATLAS_FRONT = [
    "封面：按条件胜率与实战优先级排序",
    "如何阅读本图谱",
    "图例说明",
    "胜率等级说明",
    "市场周期说明",
    "入场规则页",
    "风险与误用提醒",
]

OPENING_FRONT = [
    "封面：开盘前60-90分钟核心形态",
    "开盘时段框架",
    "18-20根K线开盘区间说明",
    "图例页",
    "入场标注规则",
    "风险提醒",
]


def rel(path):
    return os.path.relpath(path, SITE).replace("\\", "/")


def short(text, limit=118):
    text = " ".join(str(text).split())
    return text if len(text) <= limit else text[: limit - 1] + "…"


def make_thumb(src, dest):
    dest.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(src) as im:
        im = im.convert("RGB")
        im.thumbnail((880, 495), Image.Resampling.LANCZOS)
        canvas = Image.new("RGB", (880, 495), "#edf2f8")
        x = (880 - im.width) // 2
        y = (495 - im.height) // 2
        canvas.paste(im, (x, y))
        canvas.save(dest, quality=78, optimize=True)


def add_front_pages(items, course, course_label, source_dir, names):
    for index, title in enumerate(names, 1):
        src = source_dir / f"page_{index:03d}.jpg"
        thumb = THUMBS / f"{course}_{index:03d}.jpg"
        make_thumb(src, thumb)
        items.append(
            {
                "id": f"{course}-front-{index:03d}",
                "course": course,
                "courseLabel": course_label,
                "kind": "front",
                "page": index,
                "title": title,
                "grade": "说明",
                "cycle": "前言 / 使用说明 / 风险声明",
                "summary": "先阅读说明页，理解图例、触发规则、结构止损、第一目标区和风险声明。",
                "full": rel(src),
                "thumb": rel(thumb),
            }
        )


def add_atlas_patterns(items):
    for pattern in atlas.PATTERNS:
        page_no = pattern.no + 7
        page_src = ATLAS_PAGES / f"page_{page_no:03d}.jpg"
        chart_src = ROOT / "output_al_brooks_price_action_atlas" / "charts" / f"chart_{pattern.no:03d}.jpg"
        thumb = THUMBS / f"atlas_{page_no:03d}.jpg"
        make_thumb(chart_src if chart_src.exists() else page_src, thumb)
        details = atlas.explanations(pattern)
        items.append(
            {
                "id": f"atlas-{pattern.no:03d}",
                "course": "atlas",
                "courseLabel": "形态图谱",
                "kind": "pattern",
                "page": page_no,
                "patternNo": pattern.no,
                "title": f"{pattern.no:03d} {pattern.name}",
                "grade": pattern.grade,
                "cycle": pattern.cycle,
                "summary": short(details[0]),
                "details": {
                    "识别条件": details[0],
                    "入场逻辑": details[1],
                    "止损与目标": details[2],
                    "放弃条件 / 常见错误": details[3],
                    "实盘提醒": details[4],
                },
                "full": rel(chart_src if chart_src.exists() else page_src),
                "pageImage": rel(page_src),
                "thumb": rel(thumb),
            }
        )


def add_opening_patterns(items):
    for pattern in opening.PATTERNS:
        page_no = pattern.no + 6
        page_src = OPENING_PAGES / f"opening_page_{page_no:03d}.jpg"
        chart_src = ROOT / "output_al_brooks_opening_price_action" / "charts" / f"opening_chart_{pattern.no:03d}.jpg"
        thumb = THUMBS / f"opening_{page_no:03d}.jpg"
        make_thumb(chart_src if chart_src.exists() else page_src, thumb)
        details = opening.open_explanations(pattern)
        items.append(
            {
                "id": f"opening-{pattern.no:03d}",
                "course": "opening",
                "courseLabel": "开盘专题",
                "kind": "pattern",
                "page": page_no,
                "patternNo": pattern.no,
                "title": f"{pattern.no:03d} {pattern.name}",
                "grade": pattern.grade,
                "cycle": pattern.cycle,
                "summary": short(details[0]),
                "details": {
                    "开盘背景 / 识别条件": details[0],
                    "入场触发": details[1],
                    "止损与第一目标区": details[2],
                    "放弃条件 / 常见误判": details[3],
                    "实盘提醒": details[4],
                },
                "full": rel(chart_src if chart_src.exists() else page_src),
                "pageImage": rel(page_src),
                "thumb": rel(thumb),
            }
        )


def main():
    SITE.mkdir(exist_ok=True)
    THUMBS.mkdir(exist_ok=True)
    items = []
    add_front_pages(items, "atlas", "形态图谱", ATLAS_PAGES, ATLAS_FRONT)
    add_atlas_patterns(items)
    add_front_pages(items, "opening", "开盘专题", OPENING_PAGES, OPENING_FRONT)
    add_opening_patterns(items)

    payload = {
        "pdfs": {
            "atlas": rel(ROOT / "Al_Brooks价格行为学形态图谱_完整详解高可读版.pdf"),
            "opening": rel(ROOT / "Al_Brooks开盘时段价格行为形态专题_完整详解高可读版.pdf"),
        },
        "pages": items,
    }
    DATA_JS.write_text(
        "window.LEARNING_SITE_DATA = "
        + json.dumps(payload, ensure_ascii=False, indent=2)
        + ";\n",
        encoding="utf-8",
    )
    print(f"Wrote {DATA_JS}")
    print(f"Pages: {len(items)}")
    print(f"Thumbnails: {len(list(THUMBS.glob('*.jpg')))}")


if __name__ == "__main__":
    main()
