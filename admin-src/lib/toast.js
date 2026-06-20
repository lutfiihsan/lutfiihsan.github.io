export function toast(message, type = 'success') {
  if (typeof Swal === 'undefined') return;
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon: type === 'error' ? 'error' : 'success',
    title: message,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: '#13132a',
    color: '#e2e8f0',
  });
}
