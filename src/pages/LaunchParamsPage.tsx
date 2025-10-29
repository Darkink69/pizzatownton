// import { retrieveLaunchParams } from "@telegram-apps/sdk-react";
// import { List } from "@telegram-apps/telegram-ui";
import { type FC } from "react";

// import { DisplayData } from "@/components/DisplayData/DisplayData.tsx";
import Footer from "../components/Footer";
import { Page } from "../components/Page";

export const Tasks: FC = () => {
  // const lp = useMemo(() => retrieveLaunchParams(), []);
  return (
    <Page>
      <>
        <div className="relative h-screen w-full flex flex-col items-center bg-purple-700 overflow-hidden">
          <div className="absolute bottom-0 m-2">
            <Footer />
          </div>
        </div>
      </>
    </Page>
  );
};
