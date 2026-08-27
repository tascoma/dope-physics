import { useEffect, useState } from "react";
import { getCartridges, type CartridgeOut } from "../api/client";

export function useCartridges() {
  const [cartridges, setCartridges] = useState<CartridgeOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getCartridges()
      .then((data) => {
        if (!cancelled) setCartridges(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { cartridges, loading, error };
}
