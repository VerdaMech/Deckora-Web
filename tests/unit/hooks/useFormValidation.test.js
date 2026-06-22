import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFormValidation } from '@/hooks/useFormValidation';

const requerido = (v) => (!v ? 'Requerido' : '');

describe('useFormValidation', () => {
  it('inicializa con los valores por defecto y sin errores', () => {
    const { result } = renderHook(() =>
      useFormValidation({ initial: { nombre: '' }, validators: { nombre: requerido } }),
    );
    expect(result.current.values.nombre).toBe('');
    expect(result.current.errors).toEqual({});
    expect(result.current.esValido).toBe(true);
  });

  it('handleChange actualiza el valor sin validar si el campo no fue tocado', () => {
    const { result } = renderHook(() =>
      useFormValidation({ initial: { nombre: '' }, validators: { nombre: requerido } }),
    );
    act(() => result.current.handleChange('nombre', 'Ana'));
    expect(result.current.values.nombre).toBe('Ana');
    expect(result.current.errors.nombre).toBeUndefined();
  });

  it('handleBlur marca touched y valida el campo', () => {
    const { result } = renderHook(() =>
      useFormValidation({ initial: { nombre: '' }, validators: { nombre: requerido } }),
    );
    act(() => result.current.handleBlur('nombre'));
    expect(result.current.touched.nombre).toBe(true);
    expect(result.current.errors.nombre).toBe('Requerido');
  });

  it('tras el blur, handleChange revalida en vivo', () => {
    const { result } = renderHook(() =>
      useFormValidation({ initial: { nombre: '' }, validators: { nombre: requerido } }),
    );
    act(() => result.current.handleBlur('nombre'));
    act(() => result.current.handleChange('nombre', 'Ana'));
    expect(result.current.errors.nombre).toBe('');
  });

  it('validar devuelve false y llena los errores cuando hay campos inválidos', () => {
    const { result } = renderHook(() =>
      useFormValidation({ initial: { nombre: '' }, validators: { nombre: requerido } }),
    );
    let ok;
    act(() => { ok = result.current.validar(); });
    expect(ok).toBe(false);
    expect(result.current.errors.nombre).toBe('Requerido');
  });

  it('validar devuelve true cuando todo es válido', () => {
    const { result } = renderHook(() =>
      useFormValidation({ initial: { nombre: 'Ana' }, validators: { nombre: requerido } }),
    );
    let ok;
    act(() => { ok = result.current.validar(); });
    expect(ok).toBe(true);
  });

  it('un validador que devuelve true se interpreta como sin error', () => {
    const { result } = renderHook(() =>
      useFormValidation({ initial: { x: 1 }, validators: { x: () => true } }),
    );
    act(() => result.current.handleBlur('x'));
    expect(result.current.errors.x).toBe('');
  });

  it('reset vuelve a los valores iniciales y limpia errores', () => {
    const { result } = renderHook(() =>
      useFormValidation({ initial: { nombre: '' }, validators: { nombre: requerido } }),
    );
    act(() => result.current.handleBlur('nombre'));
    act(() => result.current.reset());
    expect(result.current.values.nombre).toBe('');
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
  });
});
