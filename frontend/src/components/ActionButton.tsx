import React from "react";
import { Button } from "antd";
import type { ButtonProps } from "antd";

/**
 * Unified action button used across reservation pages.
 * Defaults:
 *  - type: primary
 *  - size: small (can be overridden)
 *  - allows passing danger / loading / disabled / onClick / style / className
 */
export const ActionButton: React.FC<ButtonProps> = ({
  type = "primary",
  size = "small",
  children,
  style,
  ...rest
}) => {
  return (
    <Button type={type} size={size} style={style} {...rest}>
      {children}
    </Button>
  );
};

export default ActionButton;
