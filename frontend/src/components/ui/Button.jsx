import React from 'react';

/**
 * Primary / secondary / ghost button.
 *
 * @param {{ variant?: 'primary'|'secondary'|'ghost', size?: 'sm'|'md', disabled?: boolean, className?: string } & React.ButtonHTMLAttributes} props
 */
export function Button({
  variant  = 'primary',
  size     = 'md',
  disabled = false,
  className = '',
  children,
  ...rest
}) {
  const base =
    'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ' +
    'disabled:opacity-40 disabled:cursor-not-allowed select-none';

  const variants = {
    primary:
      'bg-[var(--color-primary)] text-[var(--color-on-primary)] ' +
      'hover:opacity-90 active:opacity-80',
    secondary:
      'bg-[var(--color-surface-container)] text-[var(--color-on-surface)] ' +
      'border border-[var(--color-outline-variant)] hover:bg-[var(--color-surface-container-high)] active:opacity-80',
    ghost:
      'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container)] active:opacity-80',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
  };

  return (
    <button
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

/**
 * Round icon-only button.
 *
 * @param {{ size?: 'sm'|'md'|'lg', variant?: 'ghost'|'primary', active?: boolean, label: string, className?: string } & React.ButtonHTMLAttributes} props
 */
export function IconButton({
  size     = 'md',
  variant  = 'ghost',
  active   = false,
  label,
  className = '',
  children,
  ...rest
}) {
  const base =
    'inline-flex items-center justify-center rounded-full transition-colors ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ' +
    'disabled:opacity-40 disabled:cursor-not-allowed';

  const variants = {
    ghost:
      `text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container)] active:opacity-80 ${
        active ? 'bg-[var(--color-surface-container)] text-[var(--color-primary)]' : ''}`,
    primary:
      'bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:opacity-90 active:opacity-80',
  };

  const sizes = { sm: 'w-7 h-7', md: 'w-9 h-9', lg: 'w-11 h-11' };

  return (
    <button
      aria-label={label}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

/**
 * Small status / info badge.
 *
 * @param {{ color?: 'default'|'primary'|'success'|'warning'|'error', className?: string }} props
 */
export function Badge({ color = 'default', className = '', children }) {
  const colors = {
    default: 'bg-[var(--color-surface-container-high)] text-[var(--color-on-surface-variant)]',
    primary: 'bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]',
    success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    error:   'bg-[var(--color-error-container)] text-[var(--color-on-error-container)]',
  };

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${colors[color]} ${className}`}>
      {children}
    </span>
  );
}
