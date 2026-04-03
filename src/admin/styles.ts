export const globalStyles = `
  .seo-plugin * { box-sizing: border-box; }
  .seo-plugin { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; font-size: 0.875rem; color: #111827; }

  .seo-input {
    display: block; width: 100%; padding: 0.5rem 0.75rem;
    font-size: 0.875rem; line-height: 1.5; color: #111827;
    background: #fff; border: 1px solid #e5e7eb; border-radius: 0.375rem;
    transition: border-color 150ms, box-shadow 150ms; outline: none;
  }
  .seo-input::placeholder { color: #9ca3af; }
  .seo-input:hover { border-color: #d1d5db; }
  .seo-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }

  .seo-textarea { min-height: 80px; resize: vertical; }

  .seo-btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 0.375rem;
    padding: 0.4375rem 0.875rem; font-size: 0.8125rem; font-weight: 500;
    border-radius: 0.375rem; border: 1px solid transparent; cursor: pointer;
    transition: all 150ms; outline: none; white-space: nowrap; user-select: none;
  }
  .seo-btn:focus-visible { box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
  .seo-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .seo-btn-primary { background: #6366f1; color: #fff; }
  .seo-btn-primary:hover:not(:disabled) { background: #4f46e5; }
  .seo-btn-secondary { background: #fff; color: #374151; border-color: #e5e7eb; }
  .seo-btn-secondary:hover:not(:disabled) { background: #f9fafb; border-color: #d1d5db; }
  .seo-btn-danger { background: #fff; color: #dc2626; border-color: #e5e7eb; }
  .seo-btn-danger:hover:not(:disabled) { background: #fef2f2; border-color: #fecaca; }
  .seo-btn-sm { padding: 0.25rem 0.625rem; font-size: 0.75rem; }

  .seo-table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 0.8125rem; }
  .seo-table th {
    text-align: left; padding: 0.625rem 0.75rem; font-weight: 500; font-size: 0.75rem;
    color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;
    border-bottom: 1px solid #e5e7eb; background: #f9fafb; white-space: nowrap;
  }
  .seo-table td { padding: 0.625rem 0.75rem; border-bottom: 1px solid #f3f4f6; color: #374151; }
  .seo-table tbody tr { transition: background-color 150ms; }
  .seo-table tbody tr:hover { background: #f9fafb; }

  .seo-label { display: block; font-size: 0.8125rem; font-weight: 500; color: #374151; margin-bottom: 0.375rem; }

  .seo-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 0.5rem; overflow: hidden; }
  .seo-card-body { padding: 1rem; }

  .seo-empty { display: flex; flex-direction: column; align-items: center; padding: 3rem 1.5rem; text-align: center; color: #9ca3af; }

  .seo-fade-in { animation: seo-fade 200ms ease-out; }
  @keyframes seo-fade { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

  .seo-badge {
    display: inline-flex; align-items: center; padding: 0.125rem 0.5rem;
    font-size: 0.75rem; font-weight: 500; border-radius: 9999px;
  }
  .seo-badge-success { background: #ecfdf5; color: #065f46; }
  .seo-badge-warning { background: #fffbeb; color: #92400e; }
  .seo-badge-error { background: #fef2f2; color: #991b1b; }

  .seo-skeleton {
    background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
    background-size: 200% 100%; animation: seo-shimmer 1.5s infinite; border-radius: 0.25rem;
  }
  @keyframes seo-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

  @media (max-width: 768px) {
    .seo-table-wrap { display: block; overflow-x: auto; -webkit-overflow-scrolling: touch; }
  }
`;
