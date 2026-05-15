import { useId } from 'react';

/**
 * @param {{
 *   label?: string,
 *   helperText?: string,
 *   error?: string,
 *   required?: boolean,
 *   rows?: number,
 *   id?: string,
 *   className?: string,
 * }} props
 */
export default function Textarea({
  label,
  helperText,
  error,
  required,
  rows = 4,
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
      <textarea
        id={id}
        rows={rows}
        required={required}
        className={`form-input form-textarea${error ? ' form-input--error' : ''} ${className}`}
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
