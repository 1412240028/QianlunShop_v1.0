// =========================
// 🛒 QIANLUNSHOP - CART MODULE (COMPLETE FIXED VERSION)
// =========================

import { showToast } from "./ui.js";
import { Sanitizer } from "./security.js";

// =========================
// 🛒 Cart Class
// =========================
export class Cart {
  constructor() {
    this.key = "qianlunshop_cart";
    this.lockKey = "qianlunshop_cart_lock";
    this.maxItems = 50;
    this.maxQuantityPerItem = 99;
    this.items = this.load();
    this.listeners = new Map();
    this.lastModified = 0;
    this.saveTimeout = null;

    this.setupStorageSync();
  }

  // =========================
  // 🔄 MULTI-TAB SYNCHRONIZATION
  // =========================
  
  setupStorageSync() {
    window.addEventListener('storage', (e) => {
      if (e.key === this.key && e.newValue !== e.oldValue) {
        console.log("🔄 Cart synced from another tab");
        this.items = this.load();
        this.emit('cart-synced', { items: this.items });
      }
    });
  }

  // =========================
  // 🎧 EVENT SYSTEM
  // =========================
  
  on(event, callback) {
    if (typeof callback !== 'function') {
      console.error('❌ Callback must be a function');
      return () => {};
    }
    
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    
    return () => this.off(event, callback);
  }

  off(event, callback) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) callbacks.splice(index, 1);
    }
  }

  emit(event, data) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(cb => {
        try {
          cb(data);
        } catch (error) {
          console.error(`❌ Error in ${event} listener:`, error);
        }
      });
    }
  }

  // =========================
  // 🔒 ATOMIC OPERATIONS
  // =========================
  
  async acquireLock(timeout = 3000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const lock = localStorage.getItem(this.lockKey);
      
      if (!lock || Date.now() - parseInt(lock) > 5000) {
        localStorage.setItem(this.lockKey, Date.now().toString());
        return true;
      }
      
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    console.warn('⚠️ Could not acquire lock, forcing...');
    localStorage.setItem(this.lockKey, Date.now().toString());
    return true;
  }

  releaseLock() {
    localStorage.removeItem(this.lockKey);
  }

  // =========================
  // 💾 LOAD & SAVE
  // =========================
  
  load() {
    try {
      const data = localStorage.getItem(this.key);
      if (!data) return [];

      const parsed = JSON.parse(data);
      
      if (!Array.isArray(parsed)) {
        console.warn("⚠️ Invalid cart data format, resetting...");
        localStorage.removeItem(this.key);
        return [];
      }

      const validItems = parsed.filter(item => this.validateItem(item));
      
      if (validItems.length !== parsed.length) {
        console.warn(`⚠️ Removed ${parsed.length - validItems.length} invalid items`);
        this.items = validItems;
        this.save();
      }

      console.log(`✅ Loaded ${validItems.length} valid items`);
      return validItems;

    } catch (err) {
      console.error("❌ Failed to load cart:", err);
      localStorage.removeItem(this.key);
      return [];
    }
  }

  save() {
    clearTimeout(this.saveTimeout);
    
    this.saveTimeout = setTimeout(() => {
      this._performSave();
    }, 100);
  }

  _performSave() {
    try {
      const validItems = this.items.filter(i => this.validateItem(i));
      const dataToSave = JSON.stringify(validItems);
      
      if (dataToSave.length > 5000000) {
        throw new Error("Cart data too large");
      }

      localStorage.setItem(this.key, dataToSave);
      this.lastModified = Date.now();
      console.log("💾 Cart saved:", validItems.length, "items");
      
      return true;

    } catch (err) {
      if (err.name === 'QuotaExceededError') {
        console.error("❌ Storage quota exceeded!");
        this.emit('storage-error', { 
          type: 'quota', 
          message: 'Keranjang penuh! Hapus beberapa item.' 
        });
        showToast('❌ Storage penuh! Hapus beberapa item.', 'error');
      } else {
        console.error("❌ Failed to save cart:", err);
        this.emit('storage-error', { 
          type: 'general', 
          message: 'Gagal menyimpan keranjang.' 
        });
        showToast('❌ Gagal menyimpan keranjang', 'error');
      }
      return false;
    }
  }

  // =========================
  // 🛍️ CRUD OPERATIONS
  // =========================
  
  async add(product) {
    try {
      if (!this.validateProduct(product)) {
        console.error("❌ Invalid product:", product);
        this.emit('error', { type: 'invalid-product', product });
        showToast('❌ Data produk tidak valid', 'error');
        return false;
      }

      await this.acquireLock();
      this.items = this.load();

      if (this.items.length >= this.maxItems) {
        console.error(`❌ Cart full (max ${this.maxItems} items)`);
        this.emit('error', { type: 'cart-full', maxItems: this.maxItems });
        this.releaseLock();
        showToast(`⚠️ Keranjang penuh (max ${this.maxItems} item)`, 'warning');
        return false;
      }

      const existing = this.items.find(i => i.id === product.id);
      const qty = Math.max(1, Math.min(this.maxQuantityPerItem, Number(product.quantity ?? 1)));

      if (existing) {
        const newQuantity = Math.min(
          this.maxQuantityPerItem,
          existing.quantity + qty
        );
        
        if (newQuantity === existing.quantity) {
          console.warn(`⚠️ Cannot add more (max ${this.maxQuantityPerItem})`);
          this.emit('error', { 
            type: 'max-quantity', 
            productId: product.id,
            maxQuantity: this.maxQuantityPerItem 
          });
          this.releaseLock();
          showToast(`⚠️ Maksimal ${this.maxQuantityPerItem} per produk`, 'warning');
          return false;
        }

        existing.quantity = newQuantity;
        existing.updatedAt = Date.now();
        
      } else {
        this.items.push({
          id: product.id,
          name: this.sanitize(product.name),
          price: product.price,
          image: this.sanitize(product.image || ""),
          category: this.sanitize(product.category || "general"),
          quantity: qty,
          addedAt: Date.now(),
          updatedAt: Date.now()
        });
      }

      this.save();
      this.releaseLock();
      
      this.emit('item-added', { 
        product, 
        quantity: qty, 
        cart: this.getSummary() 
      });
      
      return true;

    } catch (error) {
      console.error("❌ Error adding to cart:", error);
      this.releaseLock();
      this.emit('error', { type: 'add-failed', error });
      showToast('❌ Gagal menambahkan produk', 'error');
      return false;
    }
  }

  async remove(id) {
    try {
      await this.acquireLock();
      
      const removedItem = this.items.find(i => i.id === id);
      
      if (!removedItem) {
        console.warn(`⚠️ Item ${id} not found in cart`);
        this.releaseLock();
        showToast('⚠️ Produk tidak ditemukan', 'warning');
        return false;
      }

      this.items = this.items.filter(i => i.id !== id);
      this.save();
      this.releaseLock();
      
      this.emit('item-removed', { 
        id, 
        item: removedItem, 
        cart: this.getSummary() 
      });
      
      showToast(`🗑️ "${removedItem.name}" dihapus`, 'success');
      
      return true;

    } catch (error) {
      console.error("❌ Error removing from cart:", error);
      this.releaseLock();
      this.emit('error', { type: 'remove-failed', error });
      showToast('❌ Gagal menghapus produk', 'error');
      return false;
    }
  }

  async update(id, quantity) {
    let lockAcquired = false;
    
    try {
      lockAcquired = await this.acquireLock(10000);
      
      if (!lockAcquired) {
        throw new Error('Failed to acquire lock');
      }
      
      this.items = this.load();
      const item = this.items.find(i => i.id === id);
      
      if (!item) {
        console.warn('Item not found:', id);
        showToast('⚠️ Produk tidak ditemukan', 'warning');
        return false;
      }
      
      const newQty = Math.max(1, Math.min(this.maxQuantityPerItem, parseInt(quantity, 10)));
      
      if (newQty === item.quantity) {
        return true;
      }
      
      item.quantity = newQty;
      item.updatedAt = Date.now();
      
      this.save();
      this.emit('item-updated', { id, quantity: newQty, cart: this.getSummary() });
      
      return true;
      
    } catch (error) {
      console.error('Update failed:', error);
      this.emit('error', { type: 'update-failed', error, id, quantity });
      showToast('❌ Gagal memperbarui jumlah', 'error');
      return false;
      
    } finally {
      if (lockAcquired) {
        this.releaseLock();
      }
    }
  }

  async clear() {
    try {
      await this.acquireLock();
      
      const itemCount = this.items.length;
      this.items = [];
      this.save();
      this.releaseLock();
      
      this.emit('cart-cleared', { itemCount });
      showToast(`🗑️ ${itemCount} produk dihapus dari keranjang`, 'success');
      
      console.log("🗑️ Cart cleared");
      
    } catch (error) {
      console.error("❌ Error clearing cart:", error);
      this.releaseLock();
      this.emit('error', { type: 'clear-failed', error });
      showToast('❌ Gagal mengosongkan keranjang', 'error');
    }
  }

  // =========================
  // 📊 GETTERS
  // =========================
  
  getItemCount() {
    return this.items.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
  }

  getTotal() {
    return this.items.reduce((sum, i) => {
      const price = Number(i.price) || 0;
      const qty = Number(i.quantity) || 0;
      return sum + price * qty;
    }, 0);
  }

  getItems() {
    return this.items.map(item => ({...item}));
  }

  getItem(id) {
    const item = this.items.find(i => i.id === id);
    return item ? {...item} : null;
  }

  getSummary() {
    return {
      count: this.getItemCount(),
      total: this.getTotal(),
      itemsCount: this.items.length,
      items: this.getItems(),
      isEmpty: this.items.length === 0,
      timestamp: Date.now()
    };
  }

  // =========================
  // ✅ VALIDATION
  // =========================
  
  validateProduct(product) {
    if (!product || typeof product !== 'object') return false;
    
    const required = ['id', 'name', 'price', 'image'];
    for (const field of required) {
      if (!(field in product)) return false;
    }
    
    if (typeof product.id !== 'string') return false;
    if (typeof product.name !== 'string') return false;
    if (typeof product.price !== 'number') return false;
    
    if (product.id.length === 0 || product.id.length > 100) return false;
    if (product.name.length === 0 || product.name.length > 500) return false;
    if (product.price < 0 || !isFinite(product.price)) return false;
    
    const sqlPattern = /['";\$]/;
    if (sqlPattern.test(product.id)) return false;
    
    const xssPattern = /<script|javascript:|onerror=/i;
    if (xssPattern.test(product.name)) return false;
    
    return true;
  }

  validateItem(item) {
    return this.validateProduct(item) &&
      typeof item.quantity === 'number' &&
      item.quantity > 0 &&
      item.quantity <= this.maxQuantityPerItem &&
      Number.isInteger(item.quantity);
  }

  sanitize(str) {
    if (typeof str !== 'string') return '';
    
    return str
      .trim()
      .replace(/[<>]/g, '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .substring(0, 500);
  }
}

// =========================
// 🛒 CART PAGE INITIALIZATION - FIXED VERSION
// =========================
export function initCartPage() {
  console.log("🛒 Initializing cart page...");

  const cartContainer = document.querySelector('.cart-container');
  if (!cartContainer) {
    console.log("ℹ️ Not on cart page");
    return;
  }

  // ✅ Prevent multiple initializations
  if (cartContainer.dataset.initialized === 'true') {
    console.log("ℹ️ Cart page already initialized");
    return;
  }
  cartContainer.dataset.initialized = 'true';

  const cart = new Cart();

  // ✅ FIXED: Render complete cart structure
  function updateCartDisplay() {
    console.log("🔄 Updating cart display...");
    
    // Clear loading state
    const loadingDiv = cartContainer.querySelector('.cart-loading');
    if (loadingDiv) {
      loadingDiv.remove();
    }

    const items = cart.getItems();
    console.log("📦 Cart items:", items);

    // ✅ Sanitize user data to prevent XSS
    const sanitizedItems = items.map(item => ({
      ...item,
      name: Sanitizer.sanitizeInput(item.name),
      image: Sanitizer.sanitizeInput(item.image),
      id: Sanitizer.sanitizeInput(item.id)
    }));

    // ✅ Clear entire container first
    cartContainer.innerHTML = '';

    // ✅ Show empty state if no items (no header for empty cart)
    if (sanitizedItems.length === 0) {
      const emptyCart = document.createElement('div');
      emptyCart.className = 'empty-cart';
      emptyCart.id = 'emptyCart';
      emptyCart.innerHTML = `
        <div class="empty-cart-icon">🛒</div>
        <h3>Keranjang Kosong</h3>
        <p>Belum ada produk dalam keranjang Anda</p>
        <a href="products.html" class="btn btn-primary">🛍️ Mulai Belanja</a>
      `;
      cartContainer.appendChild(emptyCart);
      return;
    }

    // ✅ Create cart header (only for filled cart)
    const cartHeader = document.createElement('div');
    cartHeader.className = 'cart-header';
    cartHeader.innerHTML = `
      <h2>🛒 Keranjang Belanja</h2>
      <p>Kelola produk yang ingin Anda beli</p>
    `;
    cartContainer.appendChild(cartHeader);

    // ✅ Create cart items section
    const cartItemsSection = document.createElement('div');
    cartItemsSection.id = 'cartItems';
    cartItemsSection.innerHTML = sanitizedItems.map(item => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" onerror="this.src='../assets/sample1.jpg'">
        <div class="cart-info">
          <h3>${item.name}</h3>
          <p class="item-price">Rp ${item.price.toLocaleString('id-ID')}</p>
        </div>
        <div class="cart-actions">
          <button class="decrease" data-id="${item.id}" aria-label="Kurangi">-</button>
          <input type="number" class="quantity-input" value="${item.quantity}" readonly>
          <button class="increase" data-id="${item.id}" aria-label="Tambah">+</button>
        </div>
        <div class="item-total-section">
          <div class="item-total">Rp ${(item.price * item.quantity).toLocaleString('id-ID')}</div>
          <button class="remove-item" data-id="${item.id}">🗑️ Hapus</button>
        </div>
      </div>
    `).join('');
    cartContainer.appendChild(cartItemsSection);

    // ✅ Create cart summary
    const cartSummary = document.createElement('div');
    cartSummary.id = 'cartSummary';
    cartSummary.className = 'cart-summary';
    
    const summary = cart.getSummary();
    
    cartSummary.innerHTML = `
      <h3>Ringkasan Belanja</h3>
      <div class="summary-details">
        <div class="summary-row">
          <span>Subtotal</span>
          <span id="cartTotal">Rp ${summary.total.toLocaleString('id-ID')}</span>
        </div>
        <div class="summary-row">
          <span>Total Item</span>
          <span id="cartCount">${summary.count}</span>
        </div>
      </div>
      <div class="promo-section">
        <label for="promoCode">Kode Promo</label>
        <div class="promo-input-group">
          <input type="text" id="promoCode" placeholder="Masukkan kode promo">
          <button class="btn-promo" id="applyPromo">Terapkan</button>
        </div>
      </div>
      <div class="checkout-actions">
        <a href="checkout.html" class="btn btn-checkout">💳 Lanjut ke Checkout</a>
        <a href="products.html" class="btn btn-secondary">🛍️ Lanjut Belanja</a>
        <button class="btn btn-outline" id="clearCart">🗑️ Kosongkan Keranjang</button>
      </div>
      <div class="security-info">
        <p>🔒 Transaksi Anda aman dan terenkripsi</p>
      </div>
    `;
    cartContainer.appendChild(cartSummary);

    console.log("✅ Cart display updated");
  }

  // ✅ FIXED: Event delegation untuk dynamic elements
  cartContainer.addEventListener('click', async (e) => {
    const target = e.target;

    // Quantity increase
    if (target.classList.contains('increase')) {
      e.preventDefault();
      const id = target.dataset.id;
      const item = cart.getItem(id);
      if (item) {
        await cart.update(id, item.quantity + 1);
        updateCartDisplay();
      }
    }

    // Quantity decrease
    if (target.classList.contains('decrease')) {
      e.preventDefault();
      const id = target.dataset.id;
      const item = cart.getItem(id);
      if (item && item.quantity > 1) {
        await cart.update(id, item.quantity - 1);
        updateCartDisplay();
      }
    }

    // Remove item
    if (target.classList.contains('remove-item')) {
      e.preventDefault();
      const id = target.dataset.id;
      const item = cart.getItem(id);
      
      if (item && confirm(`Hapus "${item.name}" dari keranjang?`)) {
        await cart.remove(id);
        updateCartDisplay();
      }
    }

    // Clear cart
    if (target.id === 'clearCart') {
      e.preventDefault();
      if (confirm('Apakah Anda yakin ingin mengosongkan keranjang?')) {
        await cart.clear();
        updateCartDisplay();
      }
    }

    // Apply promo
    if (target.id === 'applyPromo') {
      e.preventDefault();
      const promoInput = document.getElementById('promoCode');
      if (promoInput && promoInput.value) {
        showToast('🎉 Fitur promo akan segera hadir!', 'info');
      }
    }
  });

  // ✅ Initial display
  updateCartDisplay();

  // ✅ Listen to cart events
  cart.on('item-added', () => updateCartDisplay());
  cart.on('item-removed', () => updateCartDisplay());
  cart.on('item-updated', () => updateCartDisplay());
  cart.on('cart-cleared', () => updateCartDisplay());
  cart.on('cart-synced', () => updateCartDisplay());

  console.log("✅ Cart page initialized successfully");
}

export default Cart;