import { beginCell } from "@ton/core";

/**
 * Кодируем произвольный текстовый комментарий в payload (BOC base64)
 * для передачи в TonConnect / Tonkeeper deeplink.
 */
export function encodeCommentAsPayload(comment: string): string {
  const trimmed = comment?.trim() ?? "";

  if (!trimmed) throw new Error("Комментарий пустой");
  if (trimmed.length > 200)
    throw new Error("Комментарий слишком длинный (макс. 200 символов)");

  return beginCell()
      .storeUint(0, 32)
      .storeStringTail(trimmed)
      .endCell()
      .toBoc()
      .toString("base64");
}

