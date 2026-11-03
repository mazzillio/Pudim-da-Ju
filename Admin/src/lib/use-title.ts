import { useEffect } from "react";

import { config } from "@/config";

export function useTitle(title: string) {
  useEffect(() => {
    document.title = `${title} · ${config.storeName}`;
  }, [title]);
}
