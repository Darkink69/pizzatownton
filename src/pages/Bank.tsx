import { useState } from "react";
import { Link } from "react-router-dom";
import { bankStore } from "../store/BankStore";
import BankOrderModal from "./BankOrderModal";

function Bank() {
  const [pcoinAmount, setPcoinAmount] = useState("500");
  const [buying, setBuying] = useState(false);

  const handleBuy = async () => {
    const parsed = parseInt(pcoinAmount);
    if (Number.isNaN(parsed) || parsed < 100) {
      alert("Минимум — 100 PCoin");
      return;
    }

    try {
      setBuying(true);
      await bankStore.createOrder(parsed);
    } catch (e) {
      console.warn("Ошибка создания заказа:", e);
    } finally {
      setBuying(false);
    }
  };

  return (
      <div className="relative min-h-screen w-full overflow-hidden bg-[#FFBC6B] p-6">
        {/* Backdrop and Header */}
        <Link to="/ton-connect">
          <div className="absolute top-4 right-4 z-20">
            <img src="/icon_ton.png" alt="Ton" className="w-10 h-10" />
          </div>
        </Link>

        <div className="max-w-md mx-auto space-y-6 mt-12">
          <div className="bg-white shadow-lg p-6 rounded-xl border-2 border-amber-800 relative">
            <div className="text-xl font-bold text-center shantell text-amber-800 mb-4">
              Покупка PCoin
            </div>

            {/* TON → PCoin */}
            <div className="mb-4">
              <label className="block text-sm text-gray-700 shantell mb-1">
                Сколько PCoin вы хотите купить:
              </label>
              <input
                  value={pcoinAmount}
                  onChange={(e) => setPcoinAmount(e.target.value)}
                  className="w-full p-2 border-2 border-amber-800 rounded text-center font-bold"
                  type="number"
                  min="100"
                  step="100"
                  placeholder="500"
              />
            </div>

            <div className="text-sm text-gray-500 shantell text-center">
              Курс: 1 TON = 1000 PCoin
            </div>

            <button
                disabled={buying}
                onClick={handleBuy}
                className="mt-4 w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded transition"
            >
              {buying ? "Создание заказа..." : "Купить"}
            </button>
          </div>
        </div>

        {/* Модалка оплаты */}
        {bankStore.order && <BankOrderModal />}
      </div>
  );
}

export default Bank;