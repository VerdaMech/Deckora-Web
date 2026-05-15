import { useState, useCallback } from 'react';

export function useFormValidation({ initial = {}, validators = {} }) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const runValidator = useCallback((campo, valor) => {
    const fn = validators[campo];
    if (!fn) return '';
    const resultado = fn(valor);
    return resultado === true ? '' : (resultado || '');
  }, [validators]);

  const handleChange = useCallback((campo, valor) => {
    setValues((prev) => ({ ...prev, [campo]: valor }));
    if (touched[campo]) {
      setErrors((prev) => ({ ...prev, [campo]: runValidator(campo, valor) }));
    }
  }, [touched, runValidator]);

  const handleBlur = useCallback((campo) => {
    setTouched((prev) => ({ ...prev, [campo]: true }));
    setErrors((prev) => ({ ...prev, [campo]: runValidator(campo, values[campo]) }));
  }, [values, runValidator]);

  const validar = useCallback(() => {
    const nuevosTouched = {};
    const nuevosErrors = {};
    for (const campo of Object.keys(validators)) {
      nuevosTouched[campo] = true;
      nuevosErrors[campo] = runValidator(campo, values[campo]);
    }
    setTouched(nuevosTouched);
    setErrors(nuevosErrors);
    return !Object.values(nuevosErrors).some(Boolean);
  }, [validators, values, runValidator]);

  const esValido = !Object.values(errors).some(Boolean);

  const reset = useCallback(() => {
    setValues(initial);
    setErrors({});
    setTouched({});
  }, [initial]);

  return { values, errors, touched, handleChange, handleBlur, validar, esValido, setValues, reset };
}
