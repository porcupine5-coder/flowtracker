import { useState } from "react";
import { createPortal } from "react-dom";
import { RingLoader } from "./RingLoader";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting?: boolean;
}

const CONFIRMATION_TEXT = "DELETE";

export function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
}: DeleteConfirmationDialogProps) {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (inputValue !== CONFIRMATION_TEXT) {
      setError(`Please type "${CONFIRMATION_TEXT}" in all caps to confirm`);
      return;
    }

    try {
      await onConfirm();
      // Reset state on success
      setInputValue("");
      setError("");
    } catch {
      setError("Failed to delete logs. Please try again.");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (error) setError("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue === CONFIRMATION_TEXT && !isDeleting) {
      void handleConfirm();
    }
    if (e.key === "Escape") {
      onClose();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-[10000]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
    >
      <div className="bg-[var(--surface)] w-full sm:rounded-2xl sm:max-w-md shadow-2xl grid grid-rows-[auto_minmax(0,1fr)_auto] rounded-t-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border)] bg-[var(--surface)]">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h2
              id="delete-dialog-title"
              className="text-base font-semibold text-[var(--text)]"
            >
              Clear All Logs
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              This action cannot be undone
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-1.5 rounded-lg hover:bg-[var(--border)] transition-colors text-[var(--text-muted)] disabled:opacity-50"
            aria-label="Close dialog"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-4 space-y-4 overflow-y-auto">
          <div
            id="delete-dialog-description"
            className="space-y-3"
          >
            <p className="text-sm text-[var(--text)] leading-relaxed">
              This action will <strong className="font-semibold text-red-500">permanently delete all logs</strong> and cannot be undone.
            </p>
            
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
              <p className="text-xs text-red-400 font-medium">
                The following data will be permanently deleted:
              </p>
              <ul className="mt-2 space-y-1 text-xs text-red-300">
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-red-400" />
                  All daily logs (symptoms, mood, flow, notes)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-red-400" />
                  All cycle history and predictions
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-red-400" />
                  All recommendation interactions
                </li>
              </ul>
            </div>

            <p className="text-xs text-[var(--text-muted)]">
              Your account settings and theme preferences will be preserved.
            </p>
          </div>

          {/* Confirmation Input */}
          <div className="space-y-2">
            <label
              htmlFor="confirmation-input"
              className="block text-sm font-medium text-[var(--text)]"
            >
              Type <span className="font-mono font-bold text-red-500">DELETE</span> to confirm:
            </label>
            <input
              id="confirmation-input"
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={isDeleting}
              placeholder="Type DELETE in all caps"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              className={`w-full px-3 py-2.5 bg-[var(--bg)] border rounded-xl text-sm text-[var(--text)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all font-mono ${
                error
                  ? "border-red-500 focus:border-red-500"
                  : "border-[var(--border)] focus:border-red-500"
              } disabled:opacity-50`}
              aria-invalid={!!error}
              aria-describedby={error ? "confirmation-error" : undefined}
            />
            {error && (
              <p
                id="confirmation-error"
                className="text-xs text-red-400 flex items-center gap-1.5"
                role="alert"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </p>
            )}
          </div>

          {/* Loading State */}
          {isDeleting && (
            <div
              className="flex items-center gap-3 text-sm text-[var(--text-muted)] py-2"
              role="status"
              aria-live="polite"
            >
              <RingLoader size={20} label="Deleting" />
              <span>Permanently deleting all logs...</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 border-t border-[var(--border)] bg-[var(--surface)]">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 py-2.5 border border-[var(--border)] rounded-xl text-sm font-medium text-[var(--text-muted)] hover:bg-[var(--border)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={() => { void handleConfirm(); }}
            disabled={inputValue !== CONFIRMATION_TEXT || isDeleting}
            className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            aria-disabled={inputValue !== CONFIRMATION_TEXT || isDeleting}
          >
            {isDeleting ? (
              <>
                <RingLoader size={16} label="Deleting" />
                <span>Deleting...</span>
              </>
            ) : (
              "Permanently Delete"
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
