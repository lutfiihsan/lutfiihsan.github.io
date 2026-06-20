import { useEffect } from 'react';

export default function SidePanel({
  open,
  title,
  subtitle,
  onClose,
  children,
  footer,
  wide = false,
}) {
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div
        className="sidepanel-backdrop open"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`sidepanel open${wide ? ' sidepanel-wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="sidepanel-header">
          <div className="sidepanel-header-text">
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button type="button" className="btn-close" onClick={onClose} aria-label="Tutup">
            <i className="fas fa-times" />
          </button>
        </div>
        <div className="sidepanel-body">{children}</div>
        {footer && <div className="sidepanel-footer">{footer}</div>}
      </aside>
    </>
  );
}
