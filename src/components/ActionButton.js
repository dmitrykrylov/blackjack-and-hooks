import React from "react";
import block from "bem-jsx";

const B = block("ActionButton", ["disabled"]);

const ActionButton = ({ className, children, onClick, disabled }) => (
  <B
    as="button"
    className={className}
    onClick={disabled ? undefined : onClick}
    disabled={disabled}
    data-testid={children}
  >
    <B.Content as="span">{children}</B.Content>
  </B>
);

export default ActionButton;
