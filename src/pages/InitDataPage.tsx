import { type FC } from "react";
import { Page } from "../components/Page";
import { List, Placeholder } from "@telegram-apps/telegram-ui"; // Заменить на обычные компоненты
import { DisplayData } from "../components/DisplayData/DisplayData";

export const InitDataPage: FC = () => {
  // Демо-данные вместо реальных из Telegram
  const demoInitData = {
    raw: "demo_init_data",
    auth_date: new Date().toISOString(),
    hash: "demo_hash",
    query_id: "demo_query_id",
  };

  const demoUser = {
    id: 123456789,
    first_name: "Demo",
    last_name: "User",
    username: "demouser",
    language_code: "en",
  };

  const demoRows = Object.entries(demoInitData).map(([title, value]) => ({
    title,
    value: String(value),
  }));

  const userRows = Object.entries(demoUser).map(([title, value]) => ({
    title,
    value: String(value),
  }));

  return (
    <Page>
      <List>
        <DisplayData header="Init Data (Demo)" rows={demoRows} />
        <DisplayData header="User (Demo)" rows={userRows} />
        <Placeholder description="Это демо-режим, данные сгенерированы для примера">
          🎮
        </Placeholder>
      </List>
    </Page>
  );
};
