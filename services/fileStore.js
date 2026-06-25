/**
 * Module-level store for pending File objects.
 * Unlike sessionStorage, File objects survive Next.js client-side navigation
 * (router.push) because JS modules stay cached between page transitions.
 * These are cleared after the upload completes or if the user abandons.
 */

let _pendingFiles = [];

export const setPendingFiles = (files) => {
  _pendingFiles = Array.from(files);
};

export const getPendingFiles = () => _pendingFiles;

export const clearPendingFiles = () => {
  _pendingFiles = [];
};

export const hasPendingFiles = () => _pendingFiles.length > 0;
