import React from "react";
import block from "bem-jsx";

const B = block("ActionButton", ["disabled"]);

const ActionButton = ({ className, children, onClick, disabled }) => (
  <B
    className={className}
    onClick={disabled ? undefined : onClick}
    disabled={disabled}
  >
    <B.Content as="span">{children}</B.Content>
  </B>
);

export default ActionButton;
