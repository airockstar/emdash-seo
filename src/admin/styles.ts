import { colors, fontFamily, radius, shadow } from "./tokens.js";

export const globalStyles = `
  .seo-plugin * { box-sizing: border-box; }
  .seo-plugin { font-family: ${fontFamily}; font-size: 0.875rem; color: ${colors.textPrimary}; }

  .seo-input {
    display: block; width: 100%; padding: 0.5rem 0.75rem;
    font-size: 0.875rem; line-height: 1.5; color: ${colors.textPrimary};
    background: ${colors.bgPrimary}; border: 1px solid ${colors.borderDefault}; border-radius: ${radius.md};
    transition: border-color 150ms, box-shadow 150ms; outline: none;
  }
  .seo-input::placeholder { color: ${colors.textTertiary}; }
  .seo-input:hover { border-color: #d1d5db; }
  .seo-input:focus { border-color: ${colors.borderFocus}; box-shadow: ${shadow.ring}; }

  .seo-textarea { min-height: 80px; resize: vertical; }

  .seo-btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 0.375rem;
    padding: 0.4375rem 0.875rem; font-size: 0.8125rem; font-weight: 500;
    border-radius: ${radius.md}; border: 1px solid transparent; cursor: pointer;
    transition: all 150ms; outline: none; white-space: nowrap; user-select: none;
  }
  .seo-btn:focus-visible { box-shadow: ${shadow.ring}; }
  .seo-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .seo-btn-primary { background: ${colors.accent}; color: ${colors.textInverse}; }
  .seo-btn-primary:hover:not(:disabled) { background: ${colors.accentHover}; }
  .seo-btn-secondary { background: ${colors.bgPrimary}; color: ${colors.textBody}; border-color: ${colors.borderDefault}; }
  .seo-btn-secondary:hover:not(:disabled) { background: ${colors.bgSecondary}; border-color: #d1d5db; }
  .seo-btn-danger { background: ${colors.bgPrimary}; color: ${colors.error}; border-color: ${colors.borderDefault}; }
  .seo-btn-danger:hover:not(:disabled) { background: ${colors.errorBg}; border-color: ${colors.errorBorder}; }
  .seo-btn-sm { padding: 0.25rem 0.625rem; font-size: 0.75rem; }

  .seo-table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 0.8125rem; }
  .seo-table th {
    text-align: left; padding: 0.625rem 0.75rem; font-weight: 500; font-size: 0.75rem;
    color: ${colors.textSecondary}; text-transform: uppercase; letter-spacing: 0.05em;
    border-bottom: 1px solid ${colors.borderDefault}; background: ${colors.bgSecondary}; white-space: nowrap;
  }
  .seo-table td { padding: 0.625rem 0.75rem; border-bottom: 1px solid ${colors.borderSubtle}; color: ${colors.textBody}; }
  .seo-table tbody tr { transition: background-color 150ms; }
  .seo-table tbody tr:hover { background: ${colors.bgSecondary}; }

  .seo-label { display: block; font-size: 0.8125rem; font-weight: 500; color: ${colors.textBody}; margin-bottom: 0.375rem; }

  .seo-card { background: ${colors.bgPrimary}; border: 1px solid ${colors.borderDefault}; border-radius: ${radius.lg}; overflow: hidden; }
  .seo-card-body { padding: 1rem; }

  .seo-empty { display: flex; flex-direction: column; align-items: center; padding: 3rem 1.5rem; text-align: center; color: ${colors.textTertiary}; }

  .seo-fade-in { animation: seo-fade 200ms ease-out; }
  @keyframes seo-fade { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

  .seo-badge {
    display: inline-flex; align-items: center; padding: 0.125rem 0.5rem;
    font-size: 0.75rem; font-weight: 500; border-radius: ${radius.full};
  }
  .seo-badge-success { background: ${colors.successBg}; color: ${colors.successText}; }
  .seo-badge-warning { background: ${colors.warningBg}; color: ${colors.warningText}; }
  .seo-badge-error { background: ${colors.errorBg}; color: ${colors.errorText}; }

  .seo-skeleton {
    background: linear-gradient(90deg, ${colors.bgTertiary} 25%, ${colors.borderDefault} 50%, ${colors.bgTertiary} 75%);
    background-size: 200% 100%; animation: seo-shimmer 1.5s infinite; border-radius: ${radius.sm};
  }
  @keyframes seo-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

  @media (max-width: 768px) {
    .seo-table-wrap { display: block; overflow-x: auto; -webkit-overflow-scrolling: touch; }
  }
`;
