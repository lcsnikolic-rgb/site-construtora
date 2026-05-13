export function serializeStringList(items: string[]) {
  return JSON.stringify(items.map((item) => item.trim()).filter(Boolean));
}

export function parseStringList(value: string | null | undefined) {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      const expanded: string[] = [];

      for (const item of parsed) {
        const text = String(item).trim();
        if (!text) continue;

        const variants = [text];
        if (text.startsWith('"') && text.endsWith('"')) {
          try {
            const unwrapped = JSON.parse(text);
            if (typeof unwrapped === "string" && unwrapped.trim()) {
              variants.push(unwrapped.trim());
            }
          } catch {
            // segue fluxo normal
          }
        }

        let consumedNested = false;
        for (const variant of variants) {
          if (variant.startsWith("[") && variant.endsWith("]")) {
            try {
              const nested = JSON.parse(variant);
              if (Array.isArray(nested)) {
                for (const nestedItem of nested) {
                  const nestedText = String(nestedItem).trim();
                  if (nestedText) expanded.push(nestedText);
                }
                consumedNested = true;
                break;
              }
            } catch {
              // segue fluxo normal
            }
          }
        }

        if (!consumedNested) {
          expanded.push(text);
        }
      }

      return expanded;
    }
  } catch {
    // fallback para dados antigos em texto corrido
  }

  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function serializeDifferentials(items: string[]) {
  return serializeStringList(items);
}

export function parseDifferentials(value: string | null | undefined) {
  return parseStringList(value);
}
