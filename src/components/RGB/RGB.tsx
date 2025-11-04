import type { RGB as RGBType } from "@telegram-apps/sdk-react";
import type { FC, JSX } from "react";

import "./RGB.css";
import { classNames } from "../../css/classnames";
import { bem } from "../../css/bem";

const [b, e] = bem("rgb");

export type RGBProps = JSX.IntrinsicElements["div"] & {
  color: RGBType;
};

export const RGB: FC<RGBProps> = ({ color, className, ...rest }) => (
  <span {...rest} className={classNames(b(), className)}>
    <i className={e("icon")} style={{ backgroundColor: color }} />
    {color}
  </span>
);
