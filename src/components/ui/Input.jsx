import { useId } from 'react';

/**
 * @param {{
 *   label?: string,
 *   helperText?: string,
 *   error?: string,
 *   required?: boolean,
 *   type?: string,
 *   id?: string,
 *   className?: string,
 * }} props
 */
export default function Input({
  label,
  helperText,
  error,
  required,
  type = 'text',
  id: idProp,
  className = '',
  ...rest
}) {
  const generatedId = useId();
  const id = idProp ?? generatedId;

  return (
    <div className="form-field">
      {label && (
        <label className="form-label" htmlFor={id}>
          {label}
          {required && <span className="form-required">*</span>}
        </label>
      )}
      <input
        id={id}
        type={type}
        required={required}
        className={`form-input${error ? ' form-input--error' : ''} ${className}`}
        {...rest}
      />
      {(helperText || error) && (
        <p className={`form-helper${error ? ' form-helper--error' : ''}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
}
