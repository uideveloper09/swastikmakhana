import json
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

DATA_FILE = Path(__file__).resolve().parents[2] / "data" / "wishlists.json"


class WishlistService:
    def __init__(self) -> None:
        self._wishlists: dict[str, set[str]] = {}
        self._load()

    def _load(self) -> None:
        if not DATA_FILE.exists():
            return
        try:
            raw = json.loads(DATA_FILE.read_text(encoding="utf-8"))
            if isinstance(raw, dict):
                for phone, ids in raw.items():
                    if isinstance(phone, str) and isinstance(ids, list):
                        self._wishlists[phone] = {
                            pid for pid in ids if isinstance(pid, str) and pid
                        }
        except (json.JSONDecodeError, OSError) as exc:
            logger.warning("Could not load wishlists: %s", exc)

    def _save(self) -> None:
        DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
        payload = {
            phone: sorted(ids) for phone, ids in sorted(self._wishlists.items())
        }
        DATA_FILE.write_text(json.dumps(payload, indent=2), encoding="utf-8")

    def _ids_for(self, phone: str) -> set[str]:
        return self._wishlists.setdefault(phone, set())

    def get_product_ids(self, phone: str) -> list[str]:
        return sorted(self._ids_for(phone))

    def toggle(self, phone: str, product_id: str) -> tuple[bool, list[str]]:
        product_id = product_id.strip()
        if not product_id:
            raise ValueError("Invalid product")

        ids = self._ids_for(phone)
        if product_id in ids:
            ids.remove(product_id)
            liked = False
        else:
            ids.add(product_id)
            liked = True

        self._save()
        return liked, sorted(ids)

    def set_liked(self, phone: str, product_id: str, liked: bool) -> list[str]:
        product_id = product_id.strip()
        if not product_id:
            raise ValueError("Invalid product")

        ids = self._ids_for(phone)
        if liked:
            ids.add(product_id)
        else:
            ids.discard(product_id)

        self._save()
        return sorted(ids)

    def sync(self, phone: str, product_ids: list[str]) -> list[str]:
        ids = self._ids_for(phone)
        for product_id in product_ids:
            cleaned = product_id.strip()
            if cleaned:
                ids.add(cleaned)
        self._save()
        return sorted(ids)


_wishlist_service: WishlistService | None = None


def get_wishlist_service() -> WishlistService:
    global _wishlist_service
    if _wishlist_service is None:
        _wishlist_service = WishlistService()
    return _wishlist_service
