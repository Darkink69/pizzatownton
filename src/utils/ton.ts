import { beginCell } from "@ton/core";

/**
 * Преобразует TON в nanoTON (1 TON = 1_000_000_000 nano)
 */
export function tonToNano(ton: string | number): string {
  const amount = typeof ton === "string" ? parseFloat(ton) : ton;
  return BigInt(Math.floor((amount || 0) * 1e9)).toString();
}

/**
 * Кодирует текстовый комментарий в payload (BOC base64)
 * для передачи через TonConnect API-клиент в кошелёк
 */
export function encodeCommentAsPayload(comment: string): string {
  const trimmed = comment?.trim() ?? "";

  if (!trimmed) throw new Error("Комментарий пустой");
  if (trimmed.length > 200)
    throw new Error("Комментарий слишком длинный (макс. 200 символов)");

  return beginCell()
      .storeUint(0, 32)            // ОР-код: 0 = текстовый комментарий
      .storeStringTail(trimmed)    // Сам текст
      .endCell()
      .toBoc()
      .toString("base64");
}

/**
 * Генерирует ссылку `ton://transfer/...` для QR-оплаты через Tonkeeper / Telegram Wallet
 * @param address TON-адрес получателя
 * @param amount Сумма в TON
 * @param comment Комментарий (не обязателен)
 */
export function generateTonTransferLink(address: string, amount: number, comment?: string): string {
  const tonAmount = tonToNano(amount);
  const encodedComment = encodeURIComponent(comment?.trim() || "");
  return `ton://transfer/${address}?amount=${tonAmount}&text=${encodedComment}`;
}