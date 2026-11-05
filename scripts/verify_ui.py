"""
AstroLab 无头浏览器渲染验收。
先在 dist/ 启动静态服务：python -m http.server 4188 --directory dist --bind 127.0.0.1
可用 ASTROLAB_BASE 环境变量改地址。

用真实 Chrome 执行 JS 后 dump DOM，逐页检查关键内容是否渲染、
是否卡在加载门、是否出现 React 运行时错误。

    python scripts/verify_ui.py
"""
import os
import shutil
import subprocess
import sys
import tempfile

CHROME_CANDIDATES = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
]
BASE = os.environ.get("ASTROLAB_BASE", "http://127.0.0.1:4188/#")

# (hash 路由, 必须出现的文本片段)
ROUTES = [
    ("/", ["今日学习", "知识点覆盖", "模块掌握概览", "每日知识"]),
    ("/courses", ["系统课程", "知识点练习覆盖", "精讲", "逐知识点深度课"]),
    ("/courses/cu-h-10", ["第十宫", "一句话理解", "深入学习", "实际应用", "随堂小题"]),
    ("/wiki/h-10", ["当前掌握状态", "练这个点", "快速回顾", "常见误解"]),
    ("/modules", ["模块掌握概览", "掌握状态是怎么判定的", "全站知识点练习覆盖"]),
    ("/modules/houses", ["十二宫轮盘", "完整掌握挑战", "推荐下一步", "第十宫"]),
    ("/quiz", ["完整掌握挑战", "快速练习", "引导式推理", "概念对比辨析"]),
    ("/quiz/guided", ["引导推理", "第 1 步", "给点提示"]),
    ("/quiz/challenge/houses", ["完整掌握挑战", "知识点覆盖", "退出（进度已自动保存）"]),
    ("/wrongbook", ["错题本", "按知识点归档", "需加强知识点"]),
    ("/profile", ["我的学习档案", "各模块掌握状态", "运行内容与数据完整性自检"]),
    ("/selftest", ["内容与数据完整性自检", "全部检查通过", "PASS", "模块覆盖"]),
]

BAD_SNIPPETS = [
    "正在唤醒星图",
    "Minified React error",
    "Unexpected Application Error",
    "Uncaught TypeError",
]


def find_chrome():
    for p in CHROME_CANDIDATES:
        if shutil.which(p) or __import__("os").path.exists(p):
            return p
    return None


def main():
    chrome = find_chrome()
    if not chrome:
        print("❌ 找不到 Chrome / Edge，无法执行无头验证")
        return 1

    print(f"浏览器：{chrome}\n服务：{BASE}\n")
    failed = []
    for route, needles in ROUTES:
        profile = tempfile.mkdtemp(prefix="astrolab-verify-")
        cmd = [
            chrome,
            "--headless=new",
            "--disable-gpu",
            "--no-sandbox",
            "--disable-dev-shm-usage",
            "--no-first-run",
            "--no-default-browser-check",
            f"--user-data-dir={profile}",
            "--virtual-time-budget=9000",
            "--dump-dom",
            BASE + route,
        ]
        try:
            r = subprocess.run(
                cmd, capture_output=True, text=True, timeout=120,
                encoding="utf-8", errors="replace",
            )
            dom = r.stdout or ""
        except subprocess.TimeoutExpired:
            failed.append((route, "浏览器超时"))
            print(f"❌ {route:34s} 浏览器超时")
            continue

        missing = [n for n in needles if n not in dom]
        bad = [b for b in BAD_SNIPPETS if b in dom]
        ok = not missing and not bad and len(dom) > 5000
        if not ok:
            reasons = []
            if len(dom) <= 5000:
                reasons.append(f"DOM 过短 {len(dom)}")
            if missing:
                reasons.append("缺少：" + " / ".join(missing))
            if bad:
                reasons.append("异常：" + " / ".join(bad))
            failed.append((route, "; ".join(reasons)))
            print(f"❌ {route:34s} DOM {len(dom):6d}  {'; '.join(reasons)}")
        else:
            print(f"✅ {route:34s} DOM {len(dom):6d}  关键内容齐全")

        shutil.rmtree(profile, ignore_errors=True)

    print()
    if failed:
        print(f"结果：{len(failed)}/{len(ROUTES)} 个页面未通过")
        for route, reason in failed:
            print(f"  · {route}: {reason}")
        return 1
    print(f"结果：{len(ROUTES)}/{len(ROUTES)} 个页面全部通过")
    return 0


if __name__ == "__main__":
    sys.exit(main())
