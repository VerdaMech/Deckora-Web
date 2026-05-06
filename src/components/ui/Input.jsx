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
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;
  const describeBy = error ? errorId : helperText ? helperId : undefined;

  return (
    <div className="form-field">
      {label && (
        <label className="form-label" htmlFor={id}>
          {label}
          {required && <span className="form-required" aria-hidden="true">*</span>}
        </label>
      )}
      <input
        id={id}
        type={type}
        required={required}
        className={`form-input${error ? ' form-input--error' : ''} ${className}`}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describeBy}
        {...rest}
      />
      {error && (
        <p id={errorId} className="form-helper form-helper--error" role="alert" aria-live="polite">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p id={helperId} className="form-helper">{helperText}</p>
      )}
    </div>
  );
}
