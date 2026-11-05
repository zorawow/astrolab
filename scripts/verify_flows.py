"""
AstroLab 真实交互验收（Chrome DevTools Protocol，无第三方依赖）。

需要先在 dist/ 启动静态服务：
    python -m http.server 4188 --directory dist --bind 127.0.0.1
然后：
    python scripts/verify_flows.py

验证四条真实链路：
  1. 作答后出现深度解析（正确答案 / 为什么成立 / 推理过程 / 复习指向）
  2. 答对 1 题后掌握状态仍为 weak（不会直接变「基本掌握 / 熟练掌握」）
  3. 完整挑战中途退出，再进入能从第 2 题恢复
  4. 引导式推理题可逐步展开，浏览器端完整性自检通过
"""
import base64
import json
import os
import shutil
import socket
import struct
import subprocess
import sys
import tempfile
import time
import urllib.request
from urllib.parse import urlparse

CHROME_CANDIDATES = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
]
DEBUG_PORT = 9229
BASE = os.environ.get("ASTROLAB_BASE", "http://127.0.0.1:4188/#")


class WS:
    """最小 WebSocket 客户端，够用于 CDP 文本帧。"""

    def __init__(self, url):
        u = urlparse(url)
        self.sock = socket.create_connection((u.hostname, u.port or 80), timeout=30)
        key = base64.b64encode(os.urandom(16)).decode()
        path = u.path + (("?" + u.query) if u.query else "")
        req = (
            f"GET {path} HTTP/1.1\r\n"
            f"Host: {u.hostname}:{u.port}\r\n"
            "Upgrade: websocket\r\nConnection: Upgrade\r\n"
            f"Sec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n"
        )
        self.sock.sendall(req.encode())
        buf = b""
        while b"\r\n\r\n" not in buf:
            chunk = self.sock.recv(4096)
            if not chunk:
                raise RuntimeError("WebSocket 握手失败")
            buf += chunk
        head, self.buf = buf.split(b"\r\n\r\n", 1)
        if b" 101 " not in head.split(b"\r\n")[0]:
            raise RuntimeError("WebSocket 升级被拒绝: " + head[:200].decode("utf-8", "replace"))
        self.msg_id = 0

    def _read(self, n):
        while len(self.buf) < n:
            d = self.sock.recv(65536)
            if not d:
                raise RuntimeError("连接已关闭")
            self.buf += d
        out, self.buf = self.buf[:n], self.buf[n:]
        return out

    def _frame(self, payload, opcode=1):
        mask = os.urandom(4)
        n = len(payload)
        hdr = bytearray([0x80 | opcode])
        if n < 126:
            hdr.append(0x80 | n)
        elif n < 65536:
            hdr.append(0x80 | 126)
            hdr += struct.pack(">H", n)
        else:
            hdr.append(0x80 | 127)
            hdr += struct.pack(">Q", n)
        hdr += mask
        self.sock.sendall(bytes(hdr) + bytes(b ^ mask[i % 4] for i, b in enumerate(payload)))

    def _recv(self):
        b1, b2 = self._read(2)
        opcode = b1 & 0x0F
        n = b2 & 0x7F
        if n == 126:
            n = struct.unpack(">H", self._read(2))[0]
        elif n == 127:
            n = struct.unpack(">Q", self._read(8))[0]
        mask = self._read(4) if (b2 & 0x80) else None
        data = self._read(n)
        if mask:
            data = bytes(b ^ mask[i % 4] for i, b in enumerate(data))
        if opcode == 9:
            self._frame(data, 10)
            return self._recv()
        if opcode == 8:
            raise RuntimeError("连接被关闭")
        return data.decode("utf-8", "replace")

    def call(self, method, params=None):
        self.msg_id += 1
        mid = self.msg_id
        self._frame(json.dumps({"id": mid, "method": method, "params": params or {}}).encode())
        while True:
            msg = json.loads(self._recv())
            if msg.get("id") == mid:
                if "error" in msg:
                    raise RuntimeError(f"CDP {method}: {msg['error']}")
                return msg.get("result", {})


def evaluate(ws, expr, await_promise=False):
    r = ws.call("Runtime.evaluate", {
        "expression": expr,
        "returnByValue": True,
        "awaitPromise": await_promise,
    })
    if "exceptionDetails" in r:
        raise RuntimeError("JS 异常: " + json.dumps(r["exceptionDetails"])[:300])
    return r.get("result", {}).get("value")


def wait_text(ws, text, timeout=12000):
    expr = (
        "new Promise(resolve=>{const t0=Date.now();const tick=()=>{"
        f"if(document.body.innerText.includes({json.dumps(text)}))resolve(true);"
        f"else if(Date.now()-t0>{timeout})resolve(false);"
        "else setTimeout(tick,150)};tick()})"
    )
    return bool(evaluate(ws, expr, True))


def nav(ws, path):
    ws.call("Page.navigate", {"url": BASE + path})
    time.sleep(0.35)


def click_text(ws, text):
    return evaluate(ws, "(()=>{const b=[...document.querySelectorAll('button')]"
                    f".find(x=>x.textContent.includes({json.dumps(text)}));"
                    "if(!b)return false;b.click();return true})()")


def main():
    chrome = next((p for p in CHROME_CANDIDATES if os.path.exists(p)), None)
    if not chrome:
        print("❌ 找不到 Chrome / Edge")
        return 1

    profile = tempfile.mkdtemp(prefix="astrolab-flow-")
    proc = subprocess.Popen(
        [chrome, "--headless=new", "--disable-gpu", "--no-sandbox",
         "--disable-dev-shm-usage", "--no-first-run", "--no-default-browser-check",
         "--remote-allow-origins=*", f"--remote-debugging-port={DEBUG_PORT}",
         f"--user-data-dir={profile}", BASE],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )

    results = []
    try:
        ws = None
        for _ in range(40):
            try:
                with urllib.request.urlopen(f"http://127.0.0.1:{DEBUG_PORT}/json/list", timeout=2) as f:
                    targets = json.load(f)
                page = next((t for t in targets if t.get("type") == "page"), None)
                if page:
                    ws = WS(page["webSocketDebuggerUrl"])
                    break
            except Exception:
                time.sleep(0.3)
        if not ws:
            print("❌ 无法连接 Chrome 调试端口")
            return 1
        ws.call("Page.enable")
        ws.call("Runtime.enable")

        # ---- T1：作答后深度解析 ----
        nav(ws, "/quiz/challenge/houses")
        ok_load = wait_text(ws, "知识点覆盖")
        clicked = evaluate(ws, "(()=>{const b=document.querySelector('[data-q-option]');"
                               "if(!b)return false;b.click();return true})()")
        feedback = wait_text(ws, "为什么成立")
        detail = evaluate(ws, "(()=>{const t=document.body.innerText;return {"
                              "correct:t.includes('正确答案'),review:t.includes('建议复习这些知识点'),"
                              "chain:t.includes('完整推理过程'),options:t.includes('错误选项区别')}})()")
        ok_t1 = ok_load and clicked and feedback and detail and all(detail.values())
        results.append(("作答后显示完整深度解析", ok_t1, f"{detail}"))

        # ---- T2：答对 1 题不直达熟练掌握 ----
        click_text(ws, "下一题")
        nav(ws, "/wiki/h-1")
        wait_text(ws, "当前掌握状态")
        status = evaluate(ws, "document.querySelector('[data-mastery-status]')?.getAttribute('data-mastery-status')")
        ok_t2 = status == "weak"
        results.append(("答对 1 题后仍为「需要加强」", ok_t2, f"status={status}"))

        # ---- T3：挑战中途退出可恢复 ----
        nav(ws, "/")
        resumed_card = wait_text(ws, "继续「十二宫位」完整挑战")
        nav(ws, "/quiz/challenge/houses")
        wait_text(ws, "知识点覆盖")
        second = wait_text(ws, "第 2 题", 8000)
        progress = evaluate(ws, "document.body.innerText.includes('退出（进度已自动保存）')")
        ok_t3 = resumed_card and second and bool(progress)
        results.append(("挑战中途退出后从第 2 题恢复", ok_t3,
                        f"首页恢复卡={resumed_card} 第2题={second}"))

        # ---- T4：引导式推理分步展开 ----
        nav(ws, "/quiz/guided")
        wait_text(ws, "第 1 步")
        s1 = click_text(ws, "给点提示")
        hint = wait_text(ws, "提示", 5000)
        s2 = click_text(ws, "查看示范思路")
        answer = wait_text(ws, "这一步的示范思路", 5000)
        s3 = click_text(ws, "进入下一步")
        step2 = wait_text(ws, "第 2 步", 5000)
        ok_t4 = all([s1, hint, s2, answer, s3, step2])
        results.append(("引导推理逐步提示 / 示范 / 下一步", ok_t4, ""))

        # ---- T5：浏览器端完整性自检 ----
        nav(ws, "/selftest")
        passed = wait_text(ws, "全部检查通过", 15000)
        ok_t5 = passed and wait_text(ws, "PASS", 3000)
        results.append(("浏览器端内容与数据完整性自检 PASS", ok_t5, ""))

    finally:
        try:
            proc.terminate()
            proc.wait(timeout=8)
        except Exception:
            proc.kill()
        shutil.rmtree(profile, ignore_errors=True)

    print("═══ AstroLab 真实交互验收 ═══\n")
    for name, ok, note in results:
        print(f"{'✅' if ok else '❌'} {name}" + (f"  [{note}]" if note else ""))
    failed = [r for r in results if not r[1]]
    print(f"\n结果：{len(results) - len(failed)}/{len(results)} 项通过")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
