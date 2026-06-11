import re
html = open(r"C:\Users\uidev\Downloads\mithila-makhana.html", encoding="utf-8").read()
# strip base64 for readability
html = re.sub(r"data:image/[^\"]+", "IMG", html)
for cls in ["cn", "csub", "pn", "pd", "stag", "st", "ss", "wli"]:
    items = re.findall(rf'class="{cls}"[^>]*>([^<]+(?:<[^/][^>]*>[^<]*)*)', html)
    if items:
        print(f"=== {cls} ===")
        for i in items[:8]:
            print(re.sub(r"<[^>]+>", "", i).strip()[:120])
