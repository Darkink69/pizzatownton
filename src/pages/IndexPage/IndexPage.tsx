import { observer } from "mobx-react-lite";
import store from "../../store/store";
import { useEffect, type FC } from "react";
import { Page } from "../../components/Page";
import Home from "../Home";

export const IndexPage: FC = observer(() => {
  useEffect(() => {
    // Просто проверяем, что данные загружены
    if (!store.floorsLoaded) {
      // Инициализируем демо-данные если нужно
      const mockFloorsData = {
        success: true,
        data: {
          userFloorList: [
            {
              floorId: 1,
              name: "Basement",
              owned: true,
              level: 1,
              incomePerHour: 100,
              purchaseCost: null,
              upgradeAmount: 500,
              upgradeCurrency: "pcoin",
              staff: [],
            },
            {
              floorId: 2,
              name: "Floor 1",
              owned: true,
              level: 2,
              incomePerHour: 250,
              purchaseCost: 1000,
              upgradeAmount: 1000,
              upgradeCurrency: "pcoin",
              staff: [],
            },
            {
              floorId: 3,
              name: "Floor 2",
              owned: false,
              level: 0,
              incomePerHour: 500,
              purchaseCost: 5000,
              upgradeAmount: 2500,
              upgradeCurrency: "pcoin",
              staff: [],
            },
          ],
          pdollarAmount: store.pdollar,
          pizzaAmount: store.pizza,
          user: {
            pcoin: store.pcoin,
            pdollar: store.pdollar,
            pizza: store.pizza,
          },
        },
      };
      store.setFloorsData(mockFloorsData);
    }
  }, []);

  return (
    <Page back={false}>
      <div className="bg-gray-800 min-h-screen">
        <Home />
      </div>
    </Page>
  );
});
