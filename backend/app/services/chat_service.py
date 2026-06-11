import json
import logging
import re
import urllib.error
import urllib.request
from dataclasses import dataclass

from app.config import get_settings
from app.dependencies import get_store
from app.models.store import Product

logger = logging.getLogger(__name__)

BRAND = {
    "name": "Swastik Makhana",
    "tagline": "Pure Fox Nuts from Bihar's Finest Farms",
    "description": (
        "Handpicked phool makhana from the sacred wetlands of Bihar — "
        "roasted to perfection, packed with care, delivered fresh to your home."
    ),
    "email": "hello@swastikmakhana.com",
    "phone": "+91 96677 10954",
    "whatsapp": "https://wa.me/919667710954",
    "address": "Makhana Farm, Darbhanga, Bihar 846004",
    "shop_url": "/makhana/plain-makhana",
}

FAQ = [
    ("Free shipping on orders above ₹499.", "shipping delivery free"),
    ("Use code SWASTIK10 for 10% off your first order.", "coupon discount offer code"),
    (
        "Makhana is low-calorie, high-protein, gluten-free fox nuts — "
        "great for fasting, snacking, and weight management.",
        "benefit health protein nutrition",
    ),
    (
        "We source GI-tagged makhana directly from Mithila wetlands in Bihar.",
        "gi tag origin bihar mithila source",
    ),
    (
        "Login with your mobile number via OTP to track orders and save addresses.",
        "login otp account sign in",
    ),
    (
        "Delivery is typically within 2–5 business days across major Indian cities.",
        "delivery time how long when arrive",
    ),
]

RECIPES = [
    "Makhana Kheer — roast makhana, simmer in cardamom milk with nuts (25 min).",
    "Spiced Makhana Chaat — toss with onion, tomato, chutney & lemon (10 min).",
    "Caramel Makhana — coat roasted makhana in golden caramel (15 min).",
]


@dataclass
class ScoredProduct:
    product: Product
    score: float


class ChatService:
    def reply(self, message: str, history: list[dict[str, str]], page_context: str | None) -> tuple[str, list[str]]:
        cleaned = message.strip()
        if not cleaned:
            return "Please type your question and I'll help you right away.", self._default_suggestions()

        if self._openai_enabled():
            try:
                ai_reply = self._openai_reply(cleaned, history, page_context)
                if ai_reply:
                    return ai_reply, self._suggestions_for(cleaned)
            except Exception as exc:
                logger.warning("OpenAI chat fallback: %s", exc)

        return self._rule_reply(cleaned, page_context)

    def _openai_enabled(self) -> bool:
        settings = get_settings()
        return bool(settings.openai_api_key.strip())

    def _build_catalog_context(self, page_context: str | None) -> str:
        store = get_store()
        lines = [
            f"Brand: {BRAND['name']} — {BRAND['tagline']}",
            BRAND["description"],
            f"Contact: {BRAND['phone']}, {BRAND['email']}, WhatsApp {BRAND['whatsapp']}",
            f"Address: {BRAND['address']}",
            "Policies: Free shipping above ₹499. Coupon SWASTIK10 for 10% off first order.",
            "Products:",
        ]

        products = sorted(store.products.values(), key=lambda p: (-p.rating_count, -p.discount_pct))[:14]
        for p in products:
            stock = "in stock" if p.in_stock else "out of stock"
            lines.append(
                f"- {p.name} ({p.brand}) | {p.pack_size} | ₹{p.sale_price:.0f} "
                f"(MRP ₹{p.mrp:.0f}, {p.discount_pct}% off) | {p.flavour} | "
                f"rating {p.rating}/5 | {stock} | /p/{p.slug}"
            )

        if page_context:
            product = store.products_by_slug.get(page_context)
            if product:
                lines.append(
                    f"Current page product: {product.name} — {product.description} — /p/{product.slug}"
                )

        lines.extend(["Recipes:", *RECIPES])
        return "\n".join(lines)

    def _openai_reply(self, message: str, history: list[dict[str, str]], page_context: str | None) -> str | None:
        settings = get_settings()
        system = (
            "You are Swastik AI, a friendly product support assistant for Swastik Makhana, "
            "an Indian e-commerce store selling premium fox nuts (makhana) from Bihar. "
            "Answer ONLY about Swastik Makhana products, orders, shipping, health benefits, recipes, "
            "and store policies. Keep replies concise (2–4 short paragraphs max). "
            "Use ₹ for prices. When recommending products, include the path like /p/product-slug. "
            "If asked about unrelated topics, politely redirect to makhana shopping help.\n\n"
            f"Store knowledge:\n{self._build_catalog_context(page_context)}"
        )

        messages = [{"role": "system", "content": system}]
        for item in history[-8:]:
            messages.append({"role": item["role"], "content": item["content"][:800]})
        messages.append({"role": "user", "content": message})

        payload = json.dumps(
            {
                "model": settings.openai_model,
                "messages": messages,
                "temperature": 0.4,
                "max_tokens": 450,
            }
        ).encode("utf-8")

        req = urllib.request.Request(
            "https://api.openai.com/v1/chat/completions",
            data=payload,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {settings.openai_api_key}",
            },
            method="POST",
        )

        try:
            with urllib.request.urlopen(req, timeout=25) as res:
                data = json.loads(res.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            body = exc.read().decode("utf-8", errors="ignore")
            logger.warning("OpenAI HTTP %s: %s", exc.code, body[:300])
            return None

        choices = data.get("choices") or []
        if not choices:
            return None
        content = choices[0].get("message", {}).get("content", "").strip()
        return content or None

    def _rule_reply(self, message: str, page_context: str | None) -> tuple[str, list[str]]:
        text = message.lower()
        tokens = set(re.findall(r"[a-z0-9]+", text))

        if self._matches(text, tokens, {"hi", "hello", "hey", "namaste", "hii", "good morning", "good evening"}):
            return (
                f"Namaste! I'm Swastik AI — your makhana shopping assistant. "
                f"I can help with products, prices, health benefits, recipes, shipping, and orders. "
                f"What would you like to know?",
                self._default_suggestions(),
            )

        if self._matches(text, tokens, {"benefit", "healthy", "health", "nutrition", "protein", "calorie", "diet", "weight"}):
            return (
                "Makhana (fox nuts) is a powerhouse snack:\n"
                "• Low calorie & fat-free — guilt-free snacking\n"
                "• High protein & fibre — keeps you full longer\n"
                "• Gluten-free & easy to digest — great for fasting\n"
                "• Rich in calcium, magnesium & antioxidants\n"
                "• GI-tagged Swastik makhana from Bihar's Mithila wetlands\n\n"
                "Browse our range: " + BRAND["shop_url"],
                ["Show bestsellers", "Roasted flavours", "Recipes"],
            )

        if self._matches(text, tokens, {"recipe", "cook", "kheer", "chaat", "caramel"}):
            body = "Here are easy ways to enjoy makhana:\n" + "\n".join(f"• {r}" for r in RECIPES)
            return body + f"\n\nShop ingredients: {BRAND['shop_url']}", ["Show products", "Health benefits"]

        if self._matches(text, tokens, {"ship", "delivery", "deliver", "free shipping", "courier"}):
            return (
                "Shipping & delivery:\n"
                "• Free shipping on orders above ₹499\n"
                "• Delivery in 2–5 business days to most cities\n"
                "• Fresh, hygienically packed makhana\n"
                "• Track orders after OTP login from the header\n\n"
                f"Need help? WhatsApp us: {BRAND['whatsapp']}",
                ["Track my order", "Return policy", "Contact support"],
            )

        if self._matches(text, tokens, {"return", "refund", "exchange", "cancel"}):
            return (
                "Return & refund policy:\n"
                "• Unopened products can be returned within 7 days of delivery\n"
                "• Refunds processed within 5–7 business days\n"
                "• For damaged/wrong items, contact us within 48 hours with photos\n\n"
                f"Reach us: {BRAND['phone']} or {BRAND['email']}",
                ["Contact support", "Shipping info"],
            )

        if self._matches(text, tokens, {"order", "track", "login", "otp", "account", "sign"}):
            return (
                "Orders & account:\n"
                "• Click **Login / Sign Up** in the header\n"
                "• Enter your 10-digit mobile number and verify OTP\n"
                "• Once logged in, you can track orders and save addresses\n"
                "• Add items to cart and checkout when ready\n\n"
                "Your cart is saved locally until checkout.",
                ["Show bestsellers", "Shipping info", "Contact support"],
            )

        if self._matches(text, tokens, {"contact", "phone", "email", "whatsapp", "call", "support", "help"}):
            return (
                f"We're happy to help!\n"
                f"• Phone: {BRAND['phone']}\n"
                f"• Email: {BRAND['email']}\n"
                f"• WhatsApp: {BRAND['whatsapp']}\n"
                f"• Address: {BRAND['address']}\n\n"
                "Ask me anything about our makhana products too!",
                ["Show bestsellers", "Shipping info", "Health benefits"],
            )

        if self._matches(text, tokens, {"coupon", "discount", "offer", "code", "swastik10"}):
            return (
                "Current offers:\n"
                "• **SWASTIK10** — 10% off your first order\n"
                "• Free shipping on orders above ₹499\n"
                "• Check product cards for up to 49% off MRP\n\n"
                f"Start shopping: {BRAND['shop_url']}",
                ["Show bestsellers", "Roasted flavours"],
            )

        if self._matches(text, tokens, {"about", "swastik", "brand", "story", "mithila", "bihar", "gi", "what is makhana", "makhana"}):
            if "what is" in text or text.strip() in {"makhana", "what is makhana"}:
                return (
                    "Makhana (phool makhana / fox nuts) are popped seeds of the lotus plant, "
                    "traditionally harvested from wetlands in Bihar. They're crunchy, neutral in taste, "
                    "and perfect roasted, in kheer, or as a healthy snack.\n\n"
                    f"{BRAND['name']} brings GI-tagged premium grade makhana direct from Mithila farmers — "
                    "zero artificial additives, full traceability.",
                    ["Show products", "Health benefits", "Recipes"],
                )
            return (
                f"About {BRAND['name']}:\n"
                f"{BRAND['description']}\n\n"
                "• Direct from Mithila · GI Tagged\n"
                "• 200+ farming families supported\n"
                "• Zero preservatives, colours, or MSG\n\n"
                f"Explore: {BRAND['shop_url']}",
                ["Show bestsellers", "Health benefits", "Contact support"],
            )

        if page_context and self._matches(text, tokens, {"this", "current", "page", "price", "stock"}):
            product = get_store().products_by_slug.get(page_context)
            if product:
                return self._format_product_detail(product), ["Add to cart help", "Similar products", "Shipping info"]

        if self._matches(text, tokens, {"bestseller", "popular", "best", "top", "recommend", "suggest"}):
            products = self._top_products(5)
            return self._format_product_list("Our most loved makhana picks:", products), ["Roasted flavours", "Health benefits"]

        if self._matches(text, tokens, {"roasted", "flavour", "flavor", "spicy", "peri", "masala", "salted"}):
            products = self._search_products(text, flavour_only=True)[:5]
            if products:
                return self._format_product_list("Flavoured roasted makhana:", products), ["Show all products", "Recipes"]
            return self._format_product_list("Popular roasted options:", self._top_products(4)), ["Show all products"]

        if self._matches(text, tokens, {"price", "cost", "cheap", "expensive", "rupee", "₹", "how much"}):
            products = self._search_products(text)[:5] or self._top_products(4)
            return self._format_product_list("Here are prices for matching products:", products), ["Show bestsellers", "Offers"]

        matched = self._search_products(text)
        if matched:
            if len(matched) == 1:
                return self._format_product_detail(matched[0]), ["Similar products", "Shipping info", "Recipes"]
            return self._format_product_list("I found these products for you:", matched[:5]), ["Show bestsellers", "Health benefits"]

        for snippet, keywords in FAQ:
            kw_tokens = set(keywords.split())
            if tokens & kw_tokens:
                return snippet + f"\n\nBrowse: {BRAND['shop_url']}", self._suggestions_for(message)

        return (
            "I'm here to help with Swastik Makhana — products, prices, health benefits, "
            "recipes, shipping, orders, and contact info. Could you rephrase or pick a suggestion below?",
            self._default_suggestions(),
        )

    @staticmethod
    def _matches(text: str, tokens: set[str], keywords: set[str]) -> bool:
        for kw in keywords:
            if " " in kw:
                if kw in text:
                    return True
            elif kw in tokens or kw in text:
                return True
        return False

    def _top_products(self, limit: int) -> list[Product]:
        store = get_store()
        return sorted(
            store.products.values(),
            key=lambda p: (-p.rating_count, -p.discount_pct),
        )[:limit]

    def _search_products(self, query: str, flavour_only: bool = False) -> list[Product]:
        store = get_store()
        q = query.lower()
        tokens = set(re.findall(r"[a-z0-9]+", q))
        scored: list[ScoredProduct] = []

        for product in store.products.values():
            if flavour_only and product.flavour == "natural":
                continue

            hay = " ".join(
                [
                    product.name,
                    product.brand,
                    product.description,
                    product.flavour,
                    product.pack_size,
                    product.slug.replace("-", " "),
                ]
            ).lower()
            hay_tokens = set(re.findall(r"[a-z0-9]+", hay))

            score = 0.0
            if product.slug in q or q in product.slug:
                score += 8
            for token in tokens:
                if len(token) < 3:
                    continue
                if token in hay:
                    score += 2
                if token in hay_tokens:
                    score += 1

            if score > 0:
                score += product.rating * 0.1 + min(product.rating_count / 5000, 2)
                scored.append(ScoredProduct(product, score))

        scored.sort(key=lambda s: -s.score)
        return [s.product for s in scored]

    @staticmethod
    def _format_product_detail(product: Product) -> str:
        stock = "In stock" if product.in_stock else "Out of stock — tap Notify on product page"
        return (
            f"**{product.name}** ({product.brand})\n"
            f"{product.description}\n"
            f"• Pack: {product.pack_size}\n"
            f"• Price: ₹{product.sale_price:.0f} (MRP ₹{product.mrp:.0f}, {product.discount_pct}% off)\n"
            f"• Flavour: {product.flavour}\n"
            f"• Rating: {product.rating}/5 ({product.rating_count:,} reviews)\n"
            f"• Status: {stock}\n"
            f"View: /p/{product.slug}"
        )

    def _format_product_list(self, heading: str, products: list[Product]) -> str:
        lines = [heading, ""]
        for p in products:
            lines.append(
                f"• **{p.name}** ({p.brand}) — ₹{p.sale_price:.0f} "
                f"({p.discount_pct}% off) — /p/{p.slug}"
            )
        lines.append(f"\nShop all: {BRAND['shop_url']}")
        return "\n".join(lines)

    @staticmethod
    def _default_suggestions() -> list[str]:
        return ["Show bestsellers", "Health benefits", "Shipping & delivery", "Track my order", "Contact support"]

    def _suggestions_for(self, message: str) -> list[str]:
        text = message.lower()
        if any(w in text for w in ("ship", "deliver")):
            return ["Track my order", "Return policy", "Contact support"]
        if any(w in text for w in ("price", "product", "buy")):
            return ["Show bestsellers", "Roasted flavours", "Offers"]
        return self._default_suggestions()


_chat_service: ChatService | None = None


def get_chat_service() -> ChatService:
    global _chat_service
    if _chat_service is None:
        _chat_service = ChatService()
    return _chat_service
