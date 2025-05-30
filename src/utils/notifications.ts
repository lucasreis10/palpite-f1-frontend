// Utilitário para mostrar notificações toast
export const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
  // Verificar se já existe um toast ativo
  const existingToast = document.getElementById('global-toast');
  if (existingToast) {
    existingToast.remove();
  }

  // Definir cores baseadas no tipo
  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  // Definir ícones baseados no tipo
  const icons = {
    success: '✅',
    error: '❌', 
    warning: '⚠️',
    info: 'ℹ️'
  };

  // Criar elemento do toast
  const toast = document.createElement('div');
  toast.id = 'global-toast';
  toast.className = `fixed top-4 right-4 z-50 p-4 rounded-lg border shadow-lg transition-all duration-300 transform translate-x-full ${colors[type]}`;
  toast.style.maxWidth = '400px';
  
  toast.innerHTML = `
    <div class="flex items-start gap-3">
      <span class="text-xl flex-shrink-0">${icons[type]}</span>
      <p class="text-sm font-medium flex-1">${message}</p>
      <button onclick="this.closest('#global-toast').remove()" class="text-lg opacity-70 hover:opacity-100 flex-shrink-0">&times;</button>
    </div>
  `;

  // Adicionar ao DOM
  document.body.appendChild(toast);

  // Animar entrada
  setTimeout(() => {
    toast.style.transform = 'translateX(0)';
  }, 10);

  // Auto remover após 5 segundos
  setTimeout(() => {
    toast.style.transform = 'translateX(full)';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 300);
  }, 5000);
};

// Tipos específicos de notificação
export const showSuccessToast = (message: string) => showToast(message, 'success');
export const showErrorToast = (message: string) => showToast(message, 'error');
export const showWarningToast = (message: string) => showToast(message, 'warning');
export const showInfoToast = (message: string) => showToast(message, 'info'); 