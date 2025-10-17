import { Link, useLocation } from "react-router-dom";
import store from "../store/store";

const Footer = () => {
  const location = useLocation();
  const imgUrl = store.imgUrl;

  const footerButtons = [
    {
      id: 1,
      baseName: "b_home",
      alt: "Home",
      to: "/",
    },
    {
      id: 2,
      baseName: "b_tasks",
      alt: "Tasks",
      to: "/tasks",
    },
    {
      id: 3,
      baseName: "b_friends",
      alt: "Friends",
      to: "/friends",
    },
    {
      id: 4,
      baseName: "b_bank",
      alt: "Bank",
      to: "/bank",
    },
  ];

  const getImageSrc = (baseName: string, to: string) => {
    const isActive = location.pathname === to;
    return isActive
      ? `${imgUrl}${baseName}_active.png`
      : `${imgUrl}${baseName}.png`;
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 w-full md:w-1/2">
        <div className="flex justify-between items-center py-3">
          {footerButtons.map((button) => (
            <Link
              key={button.id}
              to={button.to}
              className="flex-1 flex justify-center items-center hover:opacity-80 transition-opacity"
            >
              <img
                src={getImageSrc(button.baseName, button.to)}
                alt={button.alt}
                className="h-12 w-auto object-contain md:h-14 lg:h-16"
              />
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
