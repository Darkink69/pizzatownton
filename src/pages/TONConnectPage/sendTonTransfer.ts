import { useTonConnectUI } from "@tonconnect/ui-react";
import { beginCell } from "@ton/core";

/**
 * Преобразует TON в nanoTON
 */
function toNano(ton: string | number): string {
    const amount = typeof ton === "number" ? ton : Number(ton);
    return BigInt(Math.floor(amount * 1e9)).toString();
}

/**
 * Преобразует текстовый комментарий в BOC (base64) payload для TON
 */
function encodeCommentAsPayload(comment: string): string {
    return beginCell()
        .storeUint(0, 32)
        .storeStringTail(comment)
        .endCell()
        .toBoc()
        .toString("base64");
}

/**
 * Хук для отправки TON-платежей через TonConnect
 */
export function useTonTransfer() {
    const [tonConnectUI] = useTonConnectUI();

    /**
     * Отправка TON
     */
    const send = async ({
                            address,
                            amountTon,
                            comment,
                        }: {
        address: string;
        amountTon: string | number;
        comment?: string;
    }) => {
        if (!address) throw new Error("Не указан адрес получателя");
        if (!amountTon) throw new Error("Не указана сумма TON");

        const nanoAmount = toNano(amountTon);

        const tx = {
            validUntil: Math.floor(Date.now() / 1000) + 5 * 60,
            messages: [
                {
                    address,
                    amount: nanoAmount,
                    payload: comment ? encodeCommentAsPayload(comment) : undefined,
                },
            ],
        };

        console.log("📤 TonConnect → sendTransaction", tx);

        try {
            await tonConnectUI.sendTransaction(tx);
        } catch (err) {
            console.error("❌ Ошибка отправки TonConnect-платежа:", err);
            throw err;
        }
    };

    return send;
}