import {
  ButtonHTMLAttributes,
  FC,
  MouseEventHandler,
  PropsWithChildren,
} from "react";
import styled from "styled-components";

export enum BUTTON_VARIANTS {
  PRIMARY = "primary",
  SUCCESS = "success",
  WARNING = "warning",
  DANGER = "danger",
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: BUTTON_VARIANTS;
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

const Button: FC<PropsWithChildren<Props>> = ({
  children,
  disabled,
  onClick,
  variant = BUTTON_VARIANTS.PRIMARY,
  ...restProps
}) => {
  const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    if (disabled) return;
    onClick && onClick(e);
  };

  return (
    <button disabled={disabled} onClick={handleClick} {...restProps}>
      {children}
    </button>
  );
};

const StyledButton = styled(Button)`
  background-color: var(
    --${(props) => (props.disabled ? "gray" : props.variant ?? "primary")}
  );
  border-radius: 6px;
  border: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
  color: var(
    ${(props) =>
      props.variant &&
      (props.variant === BUTTON_VARIANTS.SUCCESS ??
        props.variant === BUTTON_VARIANTS.WARNING)
        ? "--dark"
        : "--light"}
  );
  cursor: ${(props) => (props.disabled ? "default" : "pointer")};
  font-weight: 600;
  letter-spacing: 1px;
  opacity: ${(props) => (props.disabled ? "0.6" : "1")};
  outline: none;
  padding: 0.8rem;
  text-transform: uppercase;
  transition: 0.4s;

  &:not([disabled]):hover {
    opacity: 0.8;
  }

  &:active {
    box-shadow: none;
  }
`;

export default StyledButton;
