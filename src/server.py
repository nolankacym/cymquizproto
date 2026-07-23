#!/usr/bin/env python3
"""
Cymbiotika Quiz — static server + CSV collector.

Serves the quiz files AND accepts JSON submissions, appending each one to a
CSV on disk:
  POST /api/submit   -> responses.csv   (one row per completed quiz)
  POST /api/feedback -> feedback.csv     (one row per feedback submission)

Run:  python3 server.py [port]      (default 8124)
"""
import csv
import json
import os
import sys
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

BASE = os.path.dirname(os.path.abspath(__file__))
RESP_CSV = os.path.join(BASE, "responses.csv")
FB_CSV = os.path.join(BASE, "feedback.csv")
_lock = threading.Lock()

# Fixed, human-readable schemas (mirror data.js question ids).
RESP_FIELDS = [
    "submission_id", "timestamp", "name",
    "focus", "wishlist", "feeling", "barriers", "experience",
    "routine_now", "flags", "commitment", "begin", "mindset",
    # One column per deep-dive topic (filled only when that branch was shown).
    "dd_energy", "dd_gut", "dd_stress", "dd_beauty", "dd_other",
]
FB_FIELDS = ["submission_id", "timestamp", "name", "rating", "ease", "comment"]


def append_row(path, fields, row):
    """Append one dict as a CSV row, writing the header if the file is new."""
    with _lock:
        new_file = not os.path.exists(path) or os.path.getsize(path) == 0
        with open(path, "a", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=fields)
            if new_file:
                w.writeheader()
            # Only keep known fields; join lists with "; ".
            clean = {}
            for k in fields:
                v = row.get(k, "")
                if isinstance(v, (list, tuple)):
                    v = "; ".join(str(x) for x in v)
                clean[k] = v
            w.writerow(clean)


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE, **kwargs)

    def _json_body(self):
        length = int(self.headers.get("Content-Length", 0))
        raw = self.rfile.read(length) if length else b"{}"
        return json.loads(raw.decode("utf-8"))

    def _send_json(self, code, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        try:
            if self.path.rstrip("/") == "/api/submit":
                data = self._json_body()
                append_row(RESP_CSV, RESP_FIELDS, data)
                self._send_json(200, {"ok": True, "file": "responses.csv"})
            elif self.path.rstrip("/") == "/api/feedback":
                data = self._json_body()
                append_row(FB_CSV, FB_FIELDS, data)
                self._send_json(200, {"ok": True, "file": "feedback.csv"})
            else:
                self._send_json(404, {"ok": False, "error": "unknown endpoint"})
        except Exception as e:  # noqa: BLE001 — surface any error to the client
            self._send_json(500, {"ok": False, "error": str(e)})

    def end_headers(self):
        # Avoid stale JSX/CSS during development.
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, fmt, *args):
        sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8124
    server = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    print(f"Cymbiotika quiz server on http://127.0.0.1:{port}")
    print(f"  responses -> {RESP_CSV}")
    print(f"  feedback  -> {FB_CSV}")
    server.serve_forever()
