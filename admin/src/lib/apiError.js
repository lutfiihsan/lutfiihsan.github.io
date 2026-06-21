import { AuthError } from '@assets/api.js';
import { toast } from './toast';

/** Handle API errors; returns true if auth failed (caller should logout). */
export function handleApiError(err, onAuthFail) {
  if (err instanceof AuthError) {
    toast('Sesi berakhir. Silakan login ulang.', 'error');
    onAuthFail?.();
    return true;
  }
  toast(err.message || 'Terjadi kesalahan', 'error');
  return false;
}
