import {
  cloneElement,
  useState,
  ChangeEvent,
  ReactElement,
  forwardRef,
} from 'react';
import {
  InputContainer,
  Input,
  PrefixContainer,
  SuffixContainer,
} from './style';

import { Size } from '../../../styled';
import {
  AiOutlineEye as ShowPasswordIcon,
  AiOutlineEyeInvisible as HidePasswordIcon,
} from 'react-icons/ai';
import { getFieldType, getInputMode } from './util';
import {
  defaultInputProps,
  defaultInputPropsFactory,
  GenericInputProps,
} from '../InputProps';

export type TextFieldType = 'text' | 'password' | 'email' | 'number';

export interface TextFieldProps {
  type?: TextFieldType;
  placeholder?: string;
  size?: Size;
  prefix?: string;
  suffix?: string;
  icon?: ReactElement;
}

export type GenericTextFieldProps = GenericInputProps<HTMLInputElement> &
  TextFieldProps;

const defaultsApplier =
  defaultInputPropsFactory<GenericTextFieldProps>(defaultInputProps);

export const GenericTextField = forwardRef<
  HTMLInputElement,
  GenericTextFieldProps
>((props, ref) => {
  const {
    onChange,
    onBlur = () => {},
    onFocus = () => {},
    name,
    disabled,
    required,
    readOnly,
    hasError,
    placeholder,
    icon,
    type = 'text',
    prefix,
    suffix,
    value,
  } = defaultsApplier(props);

  const [showPassword, setShowPassword] = useState(false);

  const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (type === 'number' && !isNaN(parseInt(event.target.value))) {
      // try to parse first
      onChange(parseInt(event.target.value));
      return;
    }
    onChange(event.target.value);
  };

  return (
    <InputContainer>
      {prefix && <PrefixContainer>{prefix}</PrefixContainer>}
      {icon && cloneElement(icon, { size: 22, className: 'icon' })}
      <Input
        autoCapitalize="off"
        autoComplete={type === 'password' ? 'new-password' : 'off'}
        hasError={hasError}
        hasIcon={!!icon}
        hasPrefix={!!prefix}
        hasSuffix={!!suffix}
        isPassword={type === 'password'}
        id={name}
        name={name}
        required={required}
        onChange={handleOnChange}
        onBlur={onBlur}
        onFocus={onFocus}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        role="presentation"
        inputMode={getInputMode(type)}
        type={getFieldType(type, showPassword)}
        ref={ref}
        value={value as string}
      />
      {type === 'password' &&
        (showPassword ? (
          <HidePasswordIcon
            className="password-icon"
            onClick={() => {
              setShowPassword(false);
            }}
            size="22"
          />
        ) : (
          <ShowPasswordIcon
            className="password-icon"
            onClick={() => {
              setShowPassword(true);
            }}
            size="22"
          />
        ))}
      {suffix && <SuffixContainer>{suffix}</SuffixContainer>}
    </InputContainer>
  );
});
