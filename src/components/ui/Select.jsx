import { useId } from 'react';

/**
 * @param {{
 *   label?: string,
 *   helperText?: string,
 *   error?: string,
 *   required?: boolean,
 *   options?: Array<{ value: string, label: string }>,
 *   id?: string,
 *   className?: string,
 *   children?: React.ReactNode,
 * }} props
 */
export default function Select({
  label,
  helperText,
  error,
  required,
  options,
  id: idProp,
  className = '',
  children,
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
      <select
        id={id}
        required={required}
        className={`form-input form-select${error ? ' form-input--error' : ''} ${className}`}
        {...rest}
      >
        {options
          ? options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))
          : children}
      </select>
      {(helperText || error) && (
        <p className={`form-helper${error ? ' form-helper--error' : ''}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
}
