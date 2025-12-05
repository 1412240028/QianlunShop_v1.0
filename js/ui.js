// =========================
// 🖥️ QIANLUNSHOP - UI MODULE
// Toast notifications, animations, loading states
// =========================
import { CONFIG } from "./config.js";

// =========================
// 🍞 ENHANCED TOAST NOTIFICATION SYSTEM - QIANLUNSHOP
// Premium luxury-themed notifications with glassmorphism
// =========================

class LuxuryToastManager {
  constructor() {
    this.container = null;
    this.toasts = [];
    this.maxToasts = 3;
    this.init();
  }

  init() {
    // Create container if not exists
    if (!document.getElementById('luxury-toast-container')) {
      this.container = document.createElement('div');
      this.container.id = 'luxury-toast-container';
      this.container.style.cssText = `
        position: fixed;
        top: 90px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 12px;
        pointer-events: none;
        max-width: 420px;
      `;
      document.body.appendChild(this.container);
    } else {
      this.container = document.getElementById('luxury-toast-container');
    }

    // Inject styles
    this.injectStyles();
  }

  injectStyles() {
    if (document.getElementById('luxury-toast-styles')) return;

    const style = document.createElement('style');
    style.id = 'luxury-toast-styles';
    style.textContent = `
      /* Base Toast Styles */
      .luxury-toast {
        position: relative;
        display: flex;
        align-items: flex-start;
        gap: 14px;
        padding: 18px 22px;
        border-radius: 14px;
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        box-shadow:
          0 8px 32px rgba(0, 0, 0, 0.25),
          0 0 0 1px rgba(212, 175, 55, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
        pointer-events: auto;
        transform: translateX(450px);
        opacity: 0;
        transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        overflow: hidden;
        min-width: 320px;
        max-width: 420px;
      }

      .luxury-toast.show {
        transform: translateX(0);
        opacity: 1;
      }

      .luxury-toast.hide {
        transform: translateX(450px);
        opacity: 0;
      }

      /* Toast Types */
      .luxury-toast.success {
        background: linear-gradient(135deg,
          rgba(212, 175, 55, 0.15) 0%,
          rgba(16, 185, 129, 0.15) 100%);
        border: 1px solid rgba(212, 175, 55, 0.3);
      }

      .luxury-toast.error {
        background: linear-gradient(135deg,
          rgba(212, 175, 55, 0.15) 0%,
          rgba(239, 68, 68, 0.15) 100%);
        border: 1px solid rgba(239, 68, 68, 0.3);
      }

      .luxury-toast.warning {
        background: linear-gradient(135deg,
          rgba(212, 175, 55, 0.15) 0%,
          rgba(245, 158, 11, 0.15) 100%);
        border: 1px solid rgba(245, 158, 11, 0.3);
      }

      .luxury-toast.info {
        background: linear-gradient(135deg,
          rgba(212, 175, 55, 0.15) 0%,
          rgba(59, 130, 246, 0.15) 100%);
        border: 1px solid rgba(59, 130, 246, 0.3);
      }

      /* Toast Icon */
      .luxury-toast-icon {
        font-size: 26px;
        line-height: 1;
        flex-shrink: 0;
        filter: drop-shadow(0 2px 8px rgba(212, 175, 55, 0.3));
        animation: toastIconPop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      }

      @keyframes toastIconPop {
        0% { transform: scale(0) rotate(-180deg); opacity: 0; }
        50% { transform: scale(1.2) rotate(10deg); }
        100% { transform: scale(1) rotate(0deg); opacity: 1; }
      }

      /* Toast Content */
      .luxury-toast-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
      }

      .luxury-toast-title {
        font-family: 'Playfair Display', serif;
        font-size: 16px;
        font-weight: 600;
        color: #d4af37;
        letter-spacing: 0.5px;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        margin: 0;
        line-height: 1.3;
      }

      .luxury-toast-message {
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        color: #e8e8e8;
        line-height: 1.5;
        margin: 0;
        opacity: 0.95;
      }

      /* Close Button */
      .luxury-toast-close {
        position: absolute;
        top: 12px;
        right: 12px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(212, 175, 55, 0.3);
        color: #d4af37;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 18px;
        line-height: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        flex-shrink: 0;
        padding: 0;
      }

      .luxury-toast-close:hover {
        background: rgba(212, 175, 55, 0.2);
        border-color: #d4af37;
        transform: rotate(90deg) scale(1.1);
        box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
      }

      .luxury-toast-close:active {
        transform: rotate(90deg) scale(0.95);
      }

      /* Progress Bar */
      .luxury-toast-progress {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 3px;
        background: linear-gradient(90deg, #d4af37, #f4d03f);
        width: 100%;
        transform-origin: left;
        animation: toastProgress linear forwards;
        border-radius: 0 0 14px 14px;
        box-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
      }

      @keyframes toastProgress {
        from { transform: scaleX(1); }
        to { transform: scaleX(0); }
      }

      /* Mobile Responsive */
      @media (max-width: 768px) {
        #luxury-toast-container {
          top: 80px;
          right: 10px;
          left: 10px;
          max-width: none;
        }

        .luxury-toast {
          min-width: auto;
          max-width: none;
          padding: 16px 20px;
        }

        .luxury-toast-icon {
          font-size: 22px;
        }

        .luxury-toast-title {
          font-size: 15px;
        }

        .luxury-toast-message {
          font-size: 13px;
        }
      }

      /* Hover Effects */
      .luxury-toast:hover {
        transform: translateX(-4px);
        box-shadow:
          0 12px 40px rgba(0, 0, 0, 0.3),
          0 0 0 1px rgba(212, 175, 55, 0.4),
          inset 0 1px 0 rgba(255, 255, 255, 0.15);
      }

      .luxury-toast:hover .luxury-toast-progress {
        animation-play-state: paused;
      }

      /* Glow Effect for Success */
      .luxury-toast.success {
        box-shadow:
          0 8px 32px rgba(0, 0, 0, 0.25),
          0 0 0 1px rgba(212, 175, 55, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.1),
          0 0 20px rgba(16, 185, 129, 0.2);
      }

      /* Glow Effect for Error */
      .luxury-toast.error {
        box-shadow:
          0 8px 32px rgba(0, 0, 0, 0.25),
          0 0 0 1px rgba(239, 68, 68, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.1),
          0 0 20px rgba(239, 68, 68, 0.2);
      }

      /* Glow Effect for Warning */
      .luxury-toast.warning {
        box-shadow:
          0 8px 32px rgba(0, 0, 0, 0.25),
          0 0 0 1px rgba(245, 158, 11, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.1),
          0 0 20px rgba(245, 158, 11, 0.2);
      }
    `;
    document.head.appendChild(style);
  }

  show(message, type = 'success', duration = 4000, title = null) {
    // Remove oldest if max reached
    if (this.toasts.length >= this.maxToasts) {
      const oldest = this.toasts.shift();
      this.remove(oldest.element, true);
    }

    const toast = this.createToast(message, type, duration, title);
    const toastObj = { element: toast, timeout: null };
    this.toasts.push(toastObj);

    // Trigger show animation
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // Auto-remove after duration
    if (duration > 0) {
      toastObj.timeout = setTimeout(() => {
        this.remove(toast);
      }, duration);
    }

    return toast;
  }

  createToast(message, type, duration, title) {
    const icons = {
      success: '✨',
      error: '⚠️',
      warning: '🔔',
      info: 'ℹ️'
    };
  
    const titles = {
      success: title || 'Berhasil!',
      error: title || 'Terjadi Kesalahan',
      warning: title || 'Perhatian',
      info: title || 'Informasi'
    };
  
    const toast = document.createElement('div');
    toast.className = `luxury-toast ${type}`;
  
    toast.innerHTML = `
      <div class="luxury-toast-icon">${icons[type] || '✨'}</div>
      <div class="luxury-toast-content">
        <h4 class="luxury-toast-title">${titles[type]}</h4>
        <p class="luxury-toast-message">${message}</p>
      </div>
      <button class="luxury-toast-close" aria-label="Close">×</button>
    `;
  
    // Close button handler
    const closeBtn = toast.querySelector('.luxury-toast-close');
    closeBtn.addEventListener('click', () => this.remove(toast));
  
    this.container.appendChild(toast);
  
    return toast;
  }

  remove(toastElement, instant = false) {
    const index = this.toasts.findIndex(t => t.element === toastElement);

    if (index > -1) {
      const toastObj = this.toasts[index];
      clearTimeout(toastObj.timeout);
      this.toasts.splice(index, 1);

      if (instant) {
        toastElement.remove();
      } else {
        toastElement.classList.remove('show');
        toastElement.classList.add('hide');

        setTimeout(() => {
          if (toastElement.parentNode) {
            toastElement.remove();
          }
        }, 400);
      }
    }
  }

  clear() {
    this.toasts.forEach(t => {
      clearTimeout(t.timeout);
      t.element.remove();
    });
    this.toasts = [];
  }

  // Shorthand methods
  success(message, duration = 4000, title = null) {
    return this.show(message, 'success', duration, title);
  }

  error(message, duration = 5000, title = null) {
    return this.show(message, 'error', duration, title);
  }

  warning(message, duration = 4500, title = null) {
    return this.show(message, 'warning', duration, title);
  }

  info(message, duration = 4000, title = null) {
    return this.show(message, 'info', duration, title);
  }
}

// =========================
// 🚀 INITIALIZE & EXPORT
// =========================

// Create singleton instance
const luxuryToast = new LuxuryToastManager();

// Export for ES6 modules
export function showToast(message, type = 'success', duration = 4000, title = null) {
  return luxuryToast.show(message, type, duration, title);
}

export { luxuryToast as toastManager, LuxuryToastManager };

// Make globally available (for non-module environments)
if (typeof window !== 'undefined') {
  window.luxuryToast = luxuryToast;
  window.showToast = showToast;
}

console.log('✨ Luxury Toast System loaded');

// =========================
// 🛒 Update Navbar Cart Count
// =========================
export function updateCartCount(cart) {
  const countElements = document.querySelectorAll(".cart-count");
  if (countElements.length === 0) return;

  const count = cart.getItemCount();
  const summary = cart.getSummary();

  countElements.forEach(el => {
    el.textContent = count;
    el.classList.toggle('empty', count === 0);

    // Add animation for cart updates
    if (count > 0) {
      el.classList.add('pulse');
      setTimeout(() => el.classList.remove('pulse'), 500);
    }
  });

  console.log("📊 Cart count updated:", count, "items");

  // Emit cart update event
  cart.emit('cart-updated', { summary });
}

// =========================
// ✨ Product Fly Animation
// =========================
export function flyToCart(imgEl) {
  const cartIcon = document.querySelector("#cartIcon") || document.querySelector(".cart-icon");
  if (!cartIcon || !imgEl) return;

  const imgClone = imgEl.cloneNode(true);
  const rect = imgEl.getBoundingClientRect();
  const cartRect = cartIcon.getBoundingClientRect();

  imgClone.style.position = "fixed";
  imgClone.style.top = `${rect.top}px`;
  imgClone.style.left = `${rect.left}px`;
  imgClone.style.width = `${rect.width}px`;
  imgClone.style.height = `${rect.height}px`;
  imgClone.style.transition = "all 0.8s cubic-bezier(0.55, 0.06, 0.68, 0.19)";
  imgClone.style.zIndex = "9999";
  imgClone.style.borderRadius = "10px";
  imgClone.style.pointerEvents = "none";
  imgClone.style.objectFit = "cover";
  document.body.appendChild(imgClone);

  setTimeout(() => {
    imgClone.style.top = `${cartRect.top + 10}px`;
    imgClone.style.left = `${cartRect.left + 10}px`;
    imgClone.style.width = "30px";
    imgClone.style.height = "30px";
    imgClone.style.opacity = "0.3";
  }, 10);

  setTimeout(() => {
    imgClone.remove();
    cartIcon.classList.add("bounce");
    setTimeout(() => cartIcon.classList.remove("bounce"), 500);
  }, 900);
}

// =========================
// ⏳ Loading State Manager
// =========================
export const loadingState = {
  show(elementId, text = 'Loading...') {
    const el = document.getElementById(elementId);
    if (!el) return;

    el.innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
        <p>${text}</p>
      </div>
    `;
    el.disabled = true;
    el.classList.add('loading-state');
  },

  hide(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;

    el.disabled = false;
    el.classList.remove('loading-state');
  },

  // Show loading on button
  showButton(buttonElement, text = 'Loading...') {
    if (!buttonElement) return;
    
    buttonElement.dataset.originalText = buttonElement.innerHTML;
    buttonElement.innerHTML = `
      <span class="button-spinner"></span>
      <span>${text}</span>
    `;
    buttonElement.disabled = true;
  },

  // Hide loading on button
  hideButton(buttonElement) {
    if (!buttonElement) return;
    
    buttonElement.innerHTML = buttonElement.dataset.originalText || 'Submit';
    buttonElement.disabled = false;
  }
};

// Backward compatibility
export const LoadingState = loadingState;

// =========================
// ❌ Error Display Manager
// =========================
export const errorDisplay = {
  show(elementId, message, type = 'error') {
    const el = document.getElementById(elementId);
    if (!el) return;

    el.innerHTML = `
      <div class="error-display ${type}">
        <div class="error-icon">${type === 'error' ? '❌' : '⚠️'}</div>
        <p>${message}</p>
        <button class="error-close" onclick="this.parentElement.style.display='none'">×</button>
      </div>
    `;
    el.style.display = 'block';
  },

  hide(elementId) {
    const el = document.getElementById(elementId);
    if (el) {
      el.style.display = 'none';
    }
  },

  // Show inline error on form field
  showField(fieldElement, message) {
    if (!fieldElement) return;

    // Remove existing error
    const existingError = fieldElement.parentElement.querySelector('.field-error');
    if (existingError) {
      existingError.remove();
    }

    // Add error class to field
    fieldElement.classList.add('error');

    // Create error message
    const errorMsg = document.createElement('div');
    errorMsg.className = 'field-error';
    errorMsg.textContent = message;
    fieldElement.parentElement.appendChild(errorMsg);
  },

  // Hide inline error on form field
  hideField(fieldElement) {
    if (!fieldElement) return;

    fieldElement.classList.remove('error');
    const errorMsg = fieldElement.parentElement.querySelector('.field-error');
    if (errorMsg) {
      errorMsg.remove();
    }
  }
};

// Backward compatibility
export const ErrorDisplay = errorDisplay;



// =========================
// 🎬 Animation Helpers
// =========================
export const Animation = {
  /**
   * Fade in element
   */
  fadeIn(element, duration = 300) {
    if (!element) return;

    element.style.opacity = '0';
    element.style.display = 'block';

    let start = null;
    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      
      element.style.opacity = Math.min(progress / duration, 1);
      
      if (progress < duration) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  },

  /**
   * Fade out element
   */
  fadeOut(element, duration = 300) {
    if (!element) return;

    let start = null;
    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      
      element.style.opacity = 1 - Math.min(progress / duration, 1);
      
      if (progress < duration) {
        requestAnimationFrame(animate);
      } else {
        element.style.display = 'none';
      }
    };

    requestAnimationFrame(animate);
  },

  /**
   * Slide down element
   */
  slideDown(element, duration = 300) {
    if (!element) return;

    element.style.height = '0px';
    element.style.overflow = 'hidden';
    element.style.display = 'block';

    const height = element.scrollHeight;
    let start = null;

    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      
      element.style.height = Math.min((progress / duration) * height, height) + 'px';
      
      if (progress < duration) {
        requestAnimationFrame(animate);
      } else {
        element.style.height = '';
        element.style.overflow = '';
      }
    };

    requestAnimationFrame(animate);
  },

  /**
   * Slide up element
   */
  slideUp(element, duration = 300) {
    if (!element) return;

    const height = element.scrollHeight;
    element.style.height = height + 'px';
    element.style.overflow = 'hidden';

    let start = null;
    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      
      element.style.height = height - Math.min((progress / duration) * height, height) + 'px';
      
      if (progress < duration) {
        requestAnimationFrame(animate);
      } else {
        element.style.display = 'none';
        element.style.height = '';
        element.style.overflow = '';
      }
    };

    requestAnimationFrame(animate);
  }
};

// =========================
// 🎨 Modal Manager
// =========================
export const Modal = {
  /**
   * Show modal
   */
  show(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.add('show');
    document.body.style.overflow = 'hidden';

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.hide(modalId);
      }
    });
  },

  /**
   * Hide modal
   */
  hide(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.remove('show');
    document.body.style.overflow = '';
  },

  /**
   * Create dynamic modal
   */
  create(content, options = {}) {
    const modalId = 'dynamic-modal-' + Date.now();
    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'modal';

    modal.innerHTML = `
      <div class="modal-content">
        <button class="modal-close" onclick="document.getElementById('${modalId}').remove()">×</button>
        ${options.title ? `<h2 class="modal-title">${options.title}</h2>` : ''}
        <div class="modal-body">
          ${content}
        </div>
        ${options.footer ? `<div class="modal-footer">${options.footer}</div>` : ''}
      </div>
    `;

    document.body.appendChild(modal);

    setTimeout(() => this.show(modalId), 10);

    return modalId;
  },

  /**
   * Show confirmation modal
   */
  confirm(message, title = 'Konfirmasi') {
    return new Promise((resolve) => {
      const modalId = 'confirm-modal-' + Date.now();
      const modal = document.createElement('div');
      modal.id = modalId;
      modal.className = 'modal';

      modal.innerHTML = `
        <div class="modal-content confirm-modal">
          <div class="modal-header">
            <h2 class="modal-title">${title}</h2>
          </div>
          <div class="modal-body">
            <p class="confirm-message">${message}</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary cancel-btn">Batal</button>
            <button class="btn btn-primary confirm-btn">OK</button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      const confirmBtn = modal.querySelector('.confirm-btn');
      const cancelBtn = modal.querySelector('.cancel-btn');

      const closeModal = (result) => {
        this.hide(modalId);
        setTimeout(() => {
          modal.remove();
          resolve(result);
        }, 300); // Wait for hide animation
      };

      confirmBtn.addEventListener('click', () => closeModal(true));
      cancelBtn.addEventListener('click', () => closeModal(false));

      // Close on backdrop click
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal(false);
        }
      });

      // Show modal
      setTimeout(() => this.show(modalId), 10);
    });
  }
};

// =========================
// 📊 Progress Bar
// =========================
export const ProgressBar = {
  /**
   * Show progress bar
   */
  show(elementId, progress = 0) {
    const el = document.getElementById(elementId);
    if (!el) return;

    el.innerHTML = `
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${progress}%"></div>
        <span class="progress-text">${progress}%</span>
      </div>
    `;
  },

  /**
   * Update progress
   */
  update(elementId, progress) {
    const el = document.getElementById(elementId);
    if (!el) return;

    const fill = el.querySelector('.progress-fill');
    const text = el.querySelector('.progress-text');

    if (fill) fill.style.width = progress + '%';
    if (text) text.textContent = progress + '%';
  }
};

// =========================
// 🔔 Notification Badge
// =========================
export const Badge = {
  /**
   * Update badge count
   */
  update(elementId, count) {
    const el = document.getElementById(elementId);
    if (!el) return;

    if (count > 0) {
      el.textContent = count > 99 ? '99+' : count;
      el.classList.remove('empty');
      el.classList.add('pulse');
      setTimeout(() => el.classList.remove('pulse'), 500);
    } else {
      el.textContent = '0';
      el.classList.add('empty');
    }
  }
};

console.log('✅ UI module loaded');