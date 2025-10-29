import { beginCell } from "@ton/core";

/**
 * Кодируем произвольный текстовый комментарий в payload (BOC base64)
 * для передачи в TonConnect / Tonkeeper deeplink.
 */
export function encodeCommentAsPayload(comment: string): string {
  return beginCell()
    .storeUint(0, 32) // op: 0 = текстовый комментарий
    .storeStringTail(comment)
    .endCell()
    .toBoc() // сериализуем cell в бинарный BOC
    .toString("base64"); // конвертируем в base64-строку для использования
}
