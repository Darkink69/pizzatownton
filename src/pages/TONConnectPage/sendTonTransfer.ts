import { useTonConnectUI } from "@tonconnect/ui-react";

/**
 * Преобразует TON в нанотоны (TON → nanoTON)
 */
function toNano(ton: string | number): string {
    const amount = typeof ton === "number" ? ton : Number(ton);
    return BigInt(Math.floor(amount * 1e9)).toString();
}

/**
 * Хук для отправки TON-платежа через TonConnect
 *
 * @returns Функция, которую можно вызвать для инициирования оплаты
 */
export function useTonTransfer() {
    const [tonConnectUI] = useTonConnectUI();

    /**
     * Отправка TON-платежа
     *
     * @param address Адрес получателя (например, из merchantAddr)
     * @param amountTon Сумма в TON (например, "1.25")
     * @param comment Комментарий (например, "ORD-XYZ123")
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
            validUntil: Math.floor(Date.now() / 1000) + 60 * 5, // 5 минут
            messages: [
                {
                    address,
                    amount: nanoAmount,
                    payload: comment ? `comment:${comment}` : undefined,
                },
            ],
        };

        console.log("📤 TonConnect → sendTransaction", tx);

        try {
            await tonConnectUI.sendTransaction(tx);
        } catch (err) {
            console.error("❌ Ошибка отправки оплаты через TonConnect", err);
            throw err;
        }
    };

    return send;
}