/**
 * Kahit Ano - Visual Catalog & Smart Reservation System
 * Reactive State Management & UI Handlers with Real Product Photography
 */

class KahitAnoApp {
  constructor() {
    this.STORAGE_KEYS = {
      CATALOG: 'kahit_ano_catalog_v1',
      RESERVATIONS: 'kahit_ano_reservations_v2',
      CART: 'kahit_ano_cart_v1'
    };

    // State
    this.catalog = [];
    this.reservations = [];
    this.cart = [];
    this.currentView = 'student'; // 'student' or 'admin'
    this.adminTab = 'reservations'; // 'reservations' or 'inventory'
    this.activeCategory = 'all';
    this.searchQuery = '';
    this.selectedProduct = null;
    this.selectedSize = null;
    this.selectedQty = 1;
    this.sizeGuideUnit = 'in'; // 'in' or 'cm'
    this.sizeGuideTab = 'tops'; // 'tops' or 'bottoms'
    this.adminSearch = '';
    this.adminStatusFilter = 'all';

    this.init();
  }

  init() {
    this.loadState();
    this.bindEvents();
    this.render();
  }

  // ==========================================
  // STATE MANAGEMENT & LOCAL STORAGE
  // ==========================================
  loadState() {
    const savedCatalog = localStorage.getItem(this.STORAGE_KEYS.CATALOG);
    if (savedCatalog) {
      try {
        this.catalog = JSON.parse(savedCatalog);
      } catch (e) {
        this.catalog = [...INITIAL_CATALOG];
      }
    } else {
      this.catalog = [...INITIAL_CATALOG];
      this.saveCatalog();
    }

    const savedReservations = localStorage.getItem(this.STORAGE_KEYS.RESERVATIONS);
    if (savedReservations) {
      try {
        this.reservations = JSON.parse(savedReservations);
      } catch (e) {
        this.reservations = [...INITIAL_RESERVATIONS];
      }
    } else {
      this.reservations = [...INITIAL_RESERVATIONS];
      this.saveReservations();
    }

    const savedCart = localStorage.getItem(this.STORAGE_KEYS.CART);
    if (savedCart) {
      try {
        this.cart = JSON.parse(savedCart);
      } catch (e) {
        this.cart = [];
      }
    } else {
      this.cart = [];
    }
  }

  saveCatalog() {
    localStorage.setItem(this.STORAGE_KEYS.CATALOG, JSON.stringify(this.catalog));
  }

  saveReservations() {
    localStorage.setItem(this.STORAGE_KEYS.RESERVATIONS, JSON.stringify(this.reservations));
  }

  saveCart() {
    localStorage.setItem(this.STORAGE_KEYS.CART, JSON.stringify(this.cart));
    this.updateCartBadge();
  }

  resetDemoData() {
    if (confirm('Are you sure you want to reset all inventory and reservations back to default University demo state?')) {
      this.catalog = JSON.parse(JSON.stringify(INITIAL_CATALOG));
      this.reservations = JSON.parse(JSON.stringify(INITIAL_RESERVATIONS));
      this.cart = [];
      this.saveCatalog();
      this.saveReservations();
      this.saveCart();
      this.showToast('University demo catalog and orders restored!', 'success');
      this.render();
    }
  }

  // ==========================================
  // INVENTORY HELPERS
  // ==========================================
  getTotalStock(product) {
    if (!product.sizes) return 0;
    return Object.values(product.sizes).reduce((acc, qty) => acc + qty, 0);
  }

  getStockStatus(product) {
    const total = this.getTotalStock(product);
    if (total <= 0) return { label: 'Pre-order Only', class: 'badge-stock-pre', type: 'preorder' };
    if (total <= 12) return { label: `Low Stock (${total} left)`, class: 'badge-stock-low', type: 'low' };
    return { label: `In Stock (${total} available)`, class: 'badge-stock-in', type: 'in' };
  }

  // ==========================================
  // CART OPERATIONS
  // ==========================================
  addToCart(productId, size, quantity = 1) {
    const product = this.catalog.find(p => p.id === productId);
    if (!product) return;

    const availableStock = product.sizes[size] !== undefined ? product.sizes[size] : 0;
    const existingIndex = this.cart.findIndex(item => item.productId === productId && item.size === size);

    let currentInCart = 0;
    if (existingIndex > -1) {
      currentInCart = this.cart[existingIndex].quantity;
    }

    if (availableStock > 0 && currentInCart + quantity > availableStock) {
      this.showToast(`Cannot reserve more than ${availableStock} units available in size ${size}.`, 'warning');
      return;
    }

    if (existingIndex > -1) {
      this.cart[existingIndex].quantity += quantity;
    } else {
      this.cart.push({
        id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        productId: product.id,
        productName: product.name,
        price: product.price,
        size: size,
        quantity: quantity,
        imageSrc: product.imageSrc
      });
    }

    this.saveCart();
    this.showToast(`Added ${quantity}x "${product.name}" (${size}) to reservation cart!`, 'success');
    this.renderCartDrawer();
  }

  updateCartQty(cartItemId, newQty) {
    const item = this.cart.find(i => i.id === cartItemId);
    if (!item) return;

    if (newQty <= 0) {
      this.removeCartItem(cartItemId);
      return;
    }

    const product = this.catalog.find(p => p.id === item.productId);
    if (product && product.sizes && product.sizes[item.size] > 0) {
      if (newQty > product.sizes[item.size]) {
        this.showToast(`Only ${product.sizes[item.size]} available in stock for size ${item.size}.`, 'warning');
        return;
      }
    }

    item.quantity = newQty;
    this.saveCart();
    this.renderCartDrawer();
  }

  removeCartItem(cartItemId) {
    this.cart = this.cart.filter(i => i.id !== cartItemId);
    this.saveCart();
    this.renderCartDrawer();
    this.showToast('Item removed from reservation cart.', 'info');
  }

  clearCart() {
    if (this.cart.length === 0) return;
    if (confirm('Clear all items from your reservation cart?')) {
      this.cart = [];
      this.saveCart();
      this.renderCartDrawer();
      this.showToast('Reservation cart cleared.', 'info');
    }
  }

  getCartTotal() {
    return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  getCartCount() {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  updateCartBadge() {
    const badge = document.getElementById('nav-cart-badge');
    const count = this.getCartCount();
    if (badge) {
      badge.textContent = count;
      badge.className = `absolute -top-1.5 -right-1.5 bg-amber-500 text-slate-950 text-xs font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900 transition-all ${count > 0 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`;
    }
  }

  // ==========================================
  // CHECKOUT & RESERVATION SUBMISSION
  // ==========================================
  submitReservation(formData) {
    if (this.cart.length === 0) {
      this.showToast('Your reservation cart is empty!', 'warning');
      return;
    }

    // Deduct inventory
    this.cart.forEach(cartItem => {
      const product = this.catalog.find(p => p.id === cartItem.productId);
      if (product && product.sizes && product.sizes[cartItem.size] !== undefined) {
        product.sizes[cartItem.size] = Math.max(0, product.sizes[cartItem.size] - cartItem.quantity);
      }
    });
    this.saveCatalog();

    // Generate unique Reference Code: KA-YYYY-XXXXX
    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    const currentYear = new Date().getFullYear();
    const refCode = `KA-${currentYear}-${randomHex}`;

    const newReservation = {
      refCode: refCode,
      createdAt: new Date().toISOString(),
      studentName: formData.studentName.trim(),
      studentId: formData.studentId.trim().toUpperCase(),
      department: formData.department,
      yearLevel: formData.yearLevel,
      contact: formData.contact.trim(),
      pickupDate: formData.pickupDate,
      pickupSlot: formData.pickupSlot,
      items: [...this.cart],
      totalAmount: this.getCartTotal(),
      status: 'Pending',
      notes: formData.notes ? formData.notes.trim() : 'Standard Student Release'
    };

    this.reservations.unshift(newReservation);
    this.saveReservations();

    // Trigger celebration confetti
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    // Clear cart
    this.cart = [];
    this.saveCart();

    // Close drawers & open receipt
    this.closeDrawer('cart-drawer');
    this.closeModal('checkout-modal');
    this.showReceiptModal(newReservation);
    this.showToast('Reservation placed! Screenshot or print your official slip.', 'success');

    this.renderCatalog();
    if (this.currentView === 'admin') {
      this.renderAdminView();
    }
  }

  // ==========================================
  // ADMIN ACTIONS
  // ==========================================
  updateReservationStatus(refCode, newStatus) {
    const res = this.reservations.find(r => r.refCode === refCode);
    if (!res) return;

    const oldStatus = res.status;
    res.status = newStatus;
    this.saveReservations();
    this.renderAdminView();
    this.showToast(`Updated reservation ${refCode} to "${newStatus}".`, 'info');
  }

  updateStock(productId, size, change) {
    const product = this.catalog.find(p => p.id === productId);
    if (!product || !product.sizes || product.sizes[size] === undefined) return;

    product.sizes[size] = Math.max(0, product.sizes[size] + change);
    this.saveCatalog();
    this.renderAdminInventory();
    this.renderCatalog();
    this.showToast(`Updated stock for ${product.name} (${size}): ${product.sizes[size]} units`, 'success');
  }

  setStockDirect(productId, size, newQty) {
    const product = this.catalog.find(p => p.id === productId);
    if (!product || !product.sizes) return;

    const qty = Math.max(0, parseInt(newQty) || 0);
    product.sizes[size] = qty;
    this.saveCatalog();
    this.renderAdminInventory();
    this.renderCatalog();
    this.showToast(`Set stock for ${product.name} (${size}) to ${qty}`, 'success');
  }

  updatePrice(productId, newPrice) {
    const product = this.catalog.find(p => p.id === productId);
    if (!product) return;

    const price = Math.max(1, parseFloat(newPrice) || product.price);
    product.price = price;
    this.saveCatalog();
    this.renderAdminInventory();
    this.renderCatalog();
    this.showToast(`Updated price for ${product.name} to ₱${price.toFixed(2)}`, 'success');
  }

  addNewProduct(productData) {
    const newProduct = {
      id: `asu-${productData.category}-${Date.now()}`,
      name: productData.name,
      category: productData.category,
      dept: productData.dept || 'all',
      gender: productData.gender || 'Unisex',
      price: parseFloat(productData.price) || 350,
      description: productData.description || 'Official University Uniform Attire.',
      material: productData.material || 'Standard Poly-Cotton Fabric',
      imageSrc: productData.imageSrc || 'images/male_polo.jpg',
      sizes: {
        'XS': parseInt(productData.stockXS) || 10,
        'S': parseInt(productData.stockS) || 20,
        'M': parseInt(productData.stockM) || 30,
        'L': parseInt(productData.stockL) || 20,
        'XL': parseInt(productData.stockXL) || 10,
        '2XL': parseInt(productData.stock2XL) || 5,
        '3XL': parseInt(productData.stock3XL) || 0
      }
    };

    this.catalog.push(newProduct);
    this.saveCatalog();
    this.renderCatalog();
    this.renderAdminInventory();
    this.closeModal('add-product-modal');
    this.showToast(`Added new item "${newProduct.name}" to catalog!`, 'success');
  }

  exportReservationsCSV() {
    if (this.reservations.length === 0) {
      this.showToast('No reservations available to export.', 'warning');
      return;
    }

    const headers = ['Ref Code', 'Date Created', 'Student Name', 'Student ID', 'Department', 'Year Level', 'Contact Number', 'Pickup Date', 'Pickup Slot', 'Status', 'Total Amount', 'Item Details'];
    const rows = this.reservations.map(r => {
      const itemsDetail = r.items.map(i => `${i.productName} (${i.size}) x${i.quantity}`).join('; ');
      return [
        `"${r.refCode}"`,
        `"${new Date(r.createdAt).toLocaleString()}"`,
        `"${r.studentName.replace(/"/g, '""')}"`,
        `"${r.studentId}"`,
        `"${r.department}"`,
        `"${r.yearLevel}"`,
        `"${r.contact}"`,
        `"${r.pickupDate}"`,
        `"${r.pickupSlot}"`,
        `"${r.status}"`,
        `"${r.totalAmount}"`,
        `"${itemsDetail.replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Kahit_Ano_Reservations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.showToast('Downloaded reservations CSV masterlist.', 'success');
  }

  // ==========================================
  // RENDERING LOGIC
  // ==========================================
  render() {
    this.updateCartBadge();
    if (this.currentView === 'student') {
      document.getElementById('student-view-container').classList.remove('hidden');
      document.getElementById('admin-view-container').classList.add('hidden');
      this.renderCatalog();
    } else {
      document.getElementById('student-view-container').classList.add('hidden');
      document.getElementById('admin-view-container').classList.remove('hidden');
      this.renderAdminView();
    }
  }

  renderCatalog() {
    const grid = document.getElementById('catalog-grid');
    if (!grid) return;

    let items = this.catalog;

    // Filter by Category
    if (this.activeCategory !== 'all') {
      items = items.filter(item => item.category === this.activeCategory);
    }

    // Filter by Search Query
    if (this.searchQuery.trim() !== '') {
      const q = this.searchQuery.toLowerCase();
      items = items.filter(item => 
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        (item.material && item.material.toLowerCase().includes(q))
      );
    }

    const countLabel = document.getElementById('catalog-results-count');
    if (countLabel) {
      countLabel.textContent = `Showing ${items.length} apparel items`;
    }

    if (items.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full py-16 text-center bg-white rounded-3xl border border-dashed border-slate-300">
          <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          <h3 class="text-lg font-bold text-slate-700">No uniforms match your query</h3>
          <p class="text-slate-500 text-sm mt-1">Try searching for other apparel or resetting your category filter.</p>
          <button onclick="app.resetFilters()" class="mt-4 px-4 py-2 bg-blue-700 text-white rounded-xl text-sm font-semibold hover:bg-blue-800 transition">Reset Filters</button>
        </div>
      `;
      return;
    }

    grid.innerHTML = items.map(item => {
      const stockInfo = this.getStockStatus(item);

      return `
        <div class="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col card-hover">
          <!-- Real Photo Image Container -->
          <div class="product-img-wrapper h-64 relative group cursor-pointer" onclick="app.openProductQuickView('${item.id}')">
            <img 
              src="${item.imageSrc}" 
              alt="${item.name}" 
              class="w-full h-full object-cover object-center"
              loading="lazy"
              onerror="this.src='https://placehold.co/600x600/1e293b/ffffff?text=${encodeURIComponent(item.name)}'">
            
            <span class="absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-md shadow-sm ${stockInfo.class}">
              ${stockInfo.label}
            </span>
            <span class="absolute top-3 left-3 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-900/80 text-white backdrop-blur-md uppercase tracking-wider">
              ${item.category}
            </span>

            <!-- Hover Preview Overlay -->
            <div class="absolute inset-0 bg-slate-950/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span class="bg-white/95 text-slate-900 text-xs font-bold px-4 py-2 rounded-full shadow-xl flex items-center gap-1.5 backdrop-blur-sm">
                <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                Inspect & Size Guide
              </span>
            </div>
          </div>

          <!-- Card Content -->
          <div class="p-5 flex-1 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span class="font-medium text-slate-600">${item.gender} Edition</span>
                <span class="text-blue-700 font-semibold truncate max-w-[130px]">${item.material}</span>
              </div>
              <h3 class="font-bold text-slate-900 text-base line-clamp-1 hover:text-blue-700 cursor-pointer" onclick="app.openProductQuickView('${item.id}')">
                ${item.name}
              </h3>
              <p class="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                ${item.description}
              </p>

              <!-- Sizes Badges -->
              <div class="mt-3">
                <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Available Sizes:</span>
                  <button type="button" onclick="app.openSizeGuideModal()" class="text-blue-700 hover:underline capitalize font-semibold flex items-center gap-1">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Guide
                  </button>
                </div>
                <div class="flex flex-wrap gap-1">
                  ${Object.keys(item.sizes || {}).map(size => {
                    const qty = item.sizes[size];
                    const isOutOfStock = qty <= 0;
                    return `
                      <span class="px-2 py-0.5 text-xs font-semibold rounded-lg border ${
                        isOutOfStock 
                          ? 'bg-slate-50 text-slate-300 border-slate-200 line-through' 
                          : 'bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100 cursor-pointer'
                      }" title="${isOutOfStock ? 'Out of stock (Pre-order available)' : `${qty} left in stock`}">
                        ${size}
                      </span>
                    `;
                  }).join('')}
                </div>
              </div>
            </div>

            <!-- Price and Reserve Button -->
            <div class="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span class="text-[11px] text-slate-400 block uppercase font-medium">Campus Retail</span>
                <span class="text-xl font-black text-slate-900 font-display">₱${item.price.toFixed(2)}</span>
              </div>
              <button 
                onclick="app.openProductQuickView('${item.id}')"
                class="px-4 py-2 bg-blue-700 hover:bg-blue-800 active:scale-95 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow transition flex items-center gap-1.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                Select Size
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  openProductQuickView(productId, defaultSize = null) {
    const product = this.catalog.find(p => p.id === productId);
    if (!product) return;

    this.selectedProduct = product;
    if (defaultSize) {
      this.selectedSize = defaultSize;
    } else if (!this.selectedSize || product.sizes[this.selectedSize] === undefined) {
      const availableSizes = Object.entries(product.sizes || {}).find(([_, qty]) => qty > 0);
      this.selectedSize = availableSizes ? availableSizes[0] : Object.keys(product.sizes || {})[0] || 'M';
    }
    this.selectedQty = 1;

    const modal = document.getElementById('product-modal');
    const content = document.getElementById('product-modal-content');
    if (!modal || !content) return;

    const stockInfo = this.getStockStatus(product);

    content.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        <!-- Photo Container -->
        <div class="product-img-wrapper rounded-2xl h-80 md:h-full border border-slate-200 overflow-hidden relative shadow-inner">
          <img 
            src="${product.imageSrc}" 
            alt="${product.name}" 
            class="w-full h-full object-cover object-center"
            onerror="this.src='https://placehold.co/600x600/1e293b/ffffff?text=${encodeURIComponent(product.name)}'">
          <div class="absolute top-3 left-3">
            <span class="px-3 py-1 text-xs font-bold rounded-full backdrop-blur-md shadow-md ${stockInfo.class}">
              ${stockInfo.label}
            </span>
          </div>
        </div>

        <!-- Details & Selector -->
        <div class="flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span class="uppercase tracking-wider font-bold text-blue-700">${product.category} Apparel</span>
              <span>Official Issue</span>
            </div>
            <h2 class="text-xl font-black text-slate-900 mb-1.5 leading-snug">${product.name}</h2>
            <div class="text-2xl font-black text-blue-900 font-display mb-3">₱${product.price.toFixed(2)}</div>
            <p class="text-slate-600 text-xs md:text-sm leading-relaxed mb-4">${product.description}</p>
            
            <div class="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 mb-4 space-y-1">
              <div><strong class="text-slate-800">Fabric Composition:</strong> ${product.material}</div>
              <div><strong class="text-slate-800">Dress Code Standard:</strong> Certified Official University Standard Attire.</div>
            </div>

            <!-- Size Selector -->
            <div class="mb-4">
              <div class="flex items-center justify-between mb-2">
                <label class="text-xs font-bold text-slate-700 uppercase tracking-wider">Choose Apparel Size:</label>
                <button type="button" onclick="app.openSizeGuideModal()" class="text-xs text-blue-700 hover:text-blue-800 font-semibold underline flex items-center gap-1">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  Measurement Chart
                </button>
              </div>
              <div class="grid grid-cols-4 gap-2">
                ${Object.keys(product.sizes || {}).map(size => {
                  const qty = product.sizes[size];
                  const isSelected = size === this.selectedSize;
                  return `
                    <button 
                      type="button"
                      onclick="app.selectProductSize('${size}')"
                      class="px-2.5 py-2 text-center rounded-xl border transition-all ${
                        isSelected 
                          ? 'border-blue-700 bg-blue-700 text-white shadow-md ring-2 ring-blue-500/20' 
                          : (qty > 0 ? 'border-slate-200 bg-white text-slate-700 hover:border-blue-500' : 'border-slate-200 bg-slate-100 text-slate-400')
                      }">
                      <div class="text-sm font-bold">${size}</div>
                      <div class="text-[10px] ${isSelected ? 'text-blue-200' : (qty > 0 ? 'text-blue-600 font-medium' : 'text-slate-400')}">
                        ${qty > 0 ? `${qty} in stock` : 'Pre-order'}
                      </div>
                    </button>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Quantity Selector -->
            <div class="mb-5">
              <label class="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">Quantity:</label>
              <div class="flex items-center gap-3">
                <div class="flex items-center border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
                  <button type="button" onclick="app.adjustModalQty(-1)" class="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-100 active:bg-slate-200 text-lg font-bold transition">−</button>
                  <input type="text" readonly id="modal-qty-input" value="${this.selectedQty}" class="w-12 text-center text-sm font-bold text-slate-800 focus:outline-none bg-transparent">
                  <button type="button" onclick="app.adjustModalQty(1)" class="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-100 active:bg-slate-200 text-lg font-bold transition">+</button>
                </div>
                <span class="text-xs text-slate-500" id="modal-stock-indicator">
                  ${product.sizes[this.selectedSize] > 0 ? `Stock available: ${product.sizes[this.selectedSize]} units` : 'Will be queued as pre-order'}
                </span>
              </div>
            </div>
          </div>

          <!-- Bottom Action Buttons -->
          <div class="pt-4 border-t border-slate-100 flex items-center gap-3">
            <button 
              type="button" 
              onclick="app.closeModal('product-modal')" 
              class="w-1/3 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold rounded-xl text-xs transition">
              Close
            </button>
            <button 
              type="button" 
              onclick="app.confirmAddToCartFromModal()" 
              class="w-2/3 py-2.5 bg-blue-700 hover:bg-blue-800 active:scale-95 text-white font-bold rounded-xl text-xs shadow-md hover:shadow-lg transition flex items-center justify-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
              Add to Reservation Cart
            </button>
          </div>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
  }

  selectProductSize(size) {
    this.selectedSize = size;
    this.selectedQty = 1;
    this.openProductQuickView(this.selectedProduct.id, size);
  }

  adjustModalQty(delta) {
    if (!this.selectedProduct || !this.selectedSize) return;
    const max = this.selectedProduct.sizes[this.selectedSize] || 99;
    const nextQty = this.selectedQty + delta;
    if (nextQty >= 1 && (max === 0 || nextQty <= max)) {
      this.selectedQty = nextQty;
      const input = document.getElementById('modal-qty-input');
      if (input) input.value = this.selectedQty;
    } else if (max > 0 && nextQty > max) {
      this.showToast(`Only ${max} units currently available for size ${this.selectedSize}.`, 'warning');
    }
  }

  confirmAddToCartFromModal() {
    if (!this.selectedProduct || !this.selectedSize) return;
    this.addToCart(this.selectedProduct.id, this.selectedSize, this.selectedQty);
    this.closeModal('product-modal');
  }

  // ==========================================
  // CART DRAWER RENDERING
  // ==========================================
  openCartDrawer() {
    this.renderCartDrawer();
    const drawer = document.getElementById('cart-drawer');
    if (drawer) drawer.classList.remove('hidden');
  }

  closeDrawer(drawerId) {
    const drawer = document.getElementById(drawerId);
    if (drawer) drawer.classList.add('hidden');
  }

  renderCartDrawer() {
    const container = document.getElementById('cart-items-container');
    const footer = document.getElementById('cart-drawer-footer');
    if (!container) return;

    if (this.cart.length === 0) {
      container.innerHTML = `
        <div class="py-20 text-center px-4">
          <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
          </div>
          <h4 class="font-bold text-slate-800 text-base">Your Reservation Cart is Empty</h4>
          <p class="text-xs text-slate-500 mt-1 max-w-xs mx-auto">Browse the visual catalog, choose your sizes, and lock in your pickup batch before inventory runs out!</p>
          <button onclick="app.closeDrawer('cart-drawer')" class="mt-4 px-4 py-2 bg-blue-700 text-white rounded-xl text-xs font-semibold hover:bg-blue-800 transition">
            Explore Apparel Catalog
          </button>
        </div>
      `;
      if (footer) footer.classList.add('hidden');
      return;
    }

    if (footer) footer.classList.remove('hidden');

    container.innerHTML = this.cart.map(item => {
      const subtotal = item.price * item.quantity;
      return `
        <div class="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div class="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
            <img src="${item.imageSrc}" alt="${item.productName}" class="w-full h-full object-cover">
          </div>
          <div class="flex-1 min-w-0">
            <h5 class="text-xs font-bold text-slate-900 truncate">${item.productName}</h5>
            <div class="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
              <span class="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">Size: ${item.size}</span>
              <span>₱${item.price.toFixed(2)} each</span>
            </div>
            <!-- Qty Counter -->
            <div class="flex items-center justify-between mt-2">
              <div class="flex items-center border border-slate-200 rounded-lg bg-slate-50 overflow-hidden">
                <button onclick="app.updateCartQty('${item.id}', ${item.quantity - 1})" class="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-200 font-bold text-xs">−</button>
                <span class="w-7 text-center text-xs font-bold text-slate-800">${item.quantity}</span>
                <button onclick="app.updateCartQty('${item.id}', ${item.quantity + 1})" class="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-200 font-bold text-xs">+</button>
              </div>
              <div class="text-right">
                <span class="text-xs font-black text-slate-900">₱${subtotal.toFixed(2)}</span>
                <button onclick="app.removeCartItem('${item.id}')" class="block text-[10px] text-rose-600 hover:underline">Remove</button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    const totalEl = document.getElementById('cart-drawer-total');
    if (totalEl) totalEl.textContent = `₱${this.getCartTotal().toFixed(2)}`;
  }

  // ==========================================
  // CHECKOUT MODAL
  // ==========================================
  openCheckoutModal() {
    if (this.cart.length === 0) {
      this.showToast('Please add items to your cart before proceeding to checkout.', 'warning');
      return;
    }

    const modal = document.getElementById('checkout-modal');
    if (!modal) return;

    // Populate Course / Program dropdown
    const deptSelect = document.getElementById('checkout-dept');
    if (deptSelect) {
      deptSelect.innerHTML = `
        <option value="" disabled selected>-- Select Course / Program (e.g. BSIS, BSBA, BSEd) --</option>
        ${CAMPUS_DEPARTMENTS.map(d => `<option value="${d.name}">${d.code} - ${d.name}</option>`).join('')}
      `;
    }

    // Populate Time Slot dropdown
    const timeSelect = document.getElementById('checkout-timeslot');
    if (timeSelect) {
      timeSelect.innerHTML = `
        <option value="" disabled selected>-- Select Preferred Campus Pickup Batch Window --</option>
        ${CAMPUS_TIME_SLOTS.map(slot => `<option value="${slot}">${slot}</option>`).join('')}
      `;
    }

    // Set default pickup date
    const dateInput = document.getElementById('checkout-date');
    if (dateInput) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];
      dateInput.value = dateStr;
      dateInput.min = dateStr;
    }

    // Update order summary preview inside checkout
    const summaryContainer = document.getElementById('checkout-items-summary');
    if (summaryContainer) {
      summaryContainer.innerHTML = this.cart.map(item => `
        <div class="flex justify-between items-center text-xs py-1 border-b border-slate-100">
          <span class="text-slate-700 truncate max-w-[200px]">${item.quantity}x ${item.productName} (${item.size})</span>
          <span class="font-bold text-slate-800">₱${(item.price * item.quantity).toFixed(2)}</span>
        </div>
      `).join('') + `
        <div class="flex justify-between items-center text-sm font-black text-slate-900 pt-2">
          <span>Payable Amount at Cashier:</span>
          <span class="text-blue-700">₱${this.getCartTotal().toFixed(2)}</span>
        </div>
      `;
    }

    modal.classList.remove('hidden');
  }

  // ==========================================
  // CONFIRMATION & RECEIPT MODAL
  // ==========================================
  showReceiptModal(reservation) {
    const modal = document.getElementById('receipt-modal');
    const container = document.getElementById('printable-receipt-modal');
    if (!modal || !container) return;

    setTimeout(() => {
      this.generateVisualQR('receipt-qr-canvas', reservation.refCode, reservation.studentId, reservation.totalAmount);
    }, 100);

    container.innerHTML = `
      <div class="p-6 md:p-8 bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-xl mx-auto">
        <!-- Kahit Ano Receipt Header -->
        <div class="text-center pb-4 border-b-2 border-slate-900/10">
          <div class="flex items-center justify-center gap-3 mb-2">
            <img src="images/kahit-ano-logo.png" alt="Kahit Ano Logo" class="w-12 h-12 rounded-2xl object-cover border border-amber-400 shadow-sm bg-white">
            <div class="text-left">
              <h2 class="text-sm font-black text-slate-950 uppercase tracking-tight">Kahit Ano</h2>
              <p class="text-[10px] text-slate-500 font-medium">We Cover... Everything (Kahit Ano!)</p>
              <p class="text-[10px] text-amber-700 font-bold uppercase tracking-wider">Official Apparel Claim & Verification Slip</p>
            </div>
          </div>
          <div class="mt-3 inline-block px-4 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-mono font-bold text-amber-900">
            CONFIRMATION CODE: <span class="text-amber-700 tracking-wider">${reservation.refCode}</span>
          </div>
        </div>

        <!-- Student & Claim Details -->
        <div class="grid grid-cols-2 gap-3 py-4 text-xs border-b border-slate-100">
          <div>
            <span class="text-slate-400 block text-[10px] uppercase font-bold">Student Name</span>
            <span class="font-bold text-slate-900 text-sm">${reservation.studentName}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[10px] uppercase font-bold">University ID Number</span>
            <span class="font-mono font-bold text-slate-900 text-sm">${reservation.studentId}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[10px] uppercase font-bold">Academic Department</span>
            <span class="text-slate-700 font-medium">${reservation.department} (${reservation.yearLevel})</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[10px] uppercase font-bold">Contact Number</span>
            <span class="font-mono text-slate-700">${reservation.contact}</span>
          </div>
          <div class="col-span-2 p-3 bg-amber-50 rounded-2xl border border-amber-200">
            <div class="flex items-center gap-1.5 text-amber-900 font-bold text-xs mb-0.5">
              <svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              Scheduled Campus Release Window:
            </div>
            <div class="text-xs text-amber-950 font-semibold pl-5">
              ${new Date(reservation.pickupDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              <span class="block text-[11px] font-normal text-amber-800 mt-0.5">${reservation.pickupSlot}</span>
            </div>
          </div>
        </div>

        <!-- Itemized Table -->
        <div class="py-4 border-b border-slate-100">
          <table class="w-full text-xs">
            <thead>
              <tr class="text-slate-400 uppercase text-[10px] font-bold border-b border-slate-200 pb-1">
                <th class="text-left pb-1.5">Apparel Description</th>
                <th class="text-center pb-1.5">Size</th>
                <th class="text-center pb-1.5">Qty</th>
                <th class="text-right pb-1.5">Amount</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${reservation.items.map(item => `
                <tr>
                  <td class="py-2 text-slate-800 font-medium">${item.productName}</td>
                  <td class="py-2 text-center font-bold text-blue-700">${item.size}</td>
                  <td class="py-2 text-center text-slate-600">${item.quantity}</td>
                  <td class="py-2 text-right font-bold text-slate-800">₱${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr class="border-t-2 border-slate-200 text-sm font-black text-slate-900">
                <td colspan="3" class="pt-3 text-right">Total Amount Due:</td>
                <td class="pt-3 text-right font-display text-base text-blue-900">₱${reservation.totalAmount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- QR Code & Instructions -->
        <div class="py-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 mt-3">
          <div class="text-center sm:text-left flex-1">
            <h6 class="font-bold text-xs text-slate-800 uppercase tracking-wider mb-1">Campus Verification QR Code</h6>
            <p class="text-[11px] text-slate-500 leading-relaxed">
              Present this electronic QR slip at the University Property Window during your scheduled pickup window for instant verification and size inspection.
            </p>
            <div class="mt-2 text-[10px] text-blue-800 font-medium">
              Order Status: <span class="font-bold px-2.5 py-0.5 rounded-full bg-blue-100">${reservation.status}</span>
            </div>
          </div>
          <div class="flex-shrink-0 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
            <canvas id="receipt-qr-canvas" width="100" height="100" class="w-24 h-24"></canvas>
            <span class="text-[9px] font-mono text-slate-400 mt-1">${reservation.refCode}</span>
          </div>
        </div>

        <!-- Print Signatures (visible on print) -->
        <div class="hidden print:grid grid-cols-2 gap-8 pt-8 mt-6 text-center text-xs">
          <div class="border-t border-slate-400 pt-2">
            <p class="font-bold text-slate-800">${reservation.studentName}</p>
            <p class="text-[10px] text-slate-500">Student Signature over Printed Name</p>
          </div>
          <div class="border-t border-slate-400 pt-2">
            <p class="font-bold text-slate-800">University Supply Officer</p>
            <p class="text-[10px] text-slate-500">Authorized Release Officer</p>
          </div>
        </div>

        <!-- Actions -->
        <div class="mt-6 flex flex-col sm:flex-row items-center justify-end gap-3 no-print">
          <button 
            type="button" 
            onclick="window.print()" 
            class="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow transition flex items-center justify-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
            Print / Save Slip (PDF)
          </button>
          <button 
            type="button" 
            onclick="app.closeModal('receipt-modal')" 
            class="w-full sm:w-auto px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow transition">
            Done & Return to Catalog
          </button>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
  }

  // Draw functional QR code on HTML5 Canvas
  generateVisualQR(canvasId, refCode, studentId, amount) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = canvas.width;
    ctx.clearRect(0, 0, size, size);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    const drawFinder = (x, y, dim) => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x, y, dim, dim);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 4, y + 4, dim - 8, dim - 8);
      ctx.fillStyle = '#1d4ed8';
      ctx.fillRect(x + 8, y + 8, dim - 16, dim - 16);
    };

    drawFinder(6, 6, 26);
    drawFinder(size - 32, 6, 26);
    drawFinder(6, size - 32, 26);

    ctx.fillStyle = '#0f172a';
    let seed = 0;
    const combinedStr = refCode + studentId + amount;
    for (let i = 0; i < combinedStr.length; i++) {
      seed += combinedStr.charCodeAt(i) * (i + 1);
    }

    const pseudoRandom = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    const cellSize = 4;
    const cols = Math.floor(size / cellSize);

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < cols; r++) {
        const px = c * cellSize;
        const py = r * cellSize;
        if ((px < 36 && py < 36) || (px > size - 36 && py < 36) || (px < 36 && py > size - 36)) {
          continue;
        }
        if (pseudoRandom() > 0.6) {
          ctx.fillRect(px, py, cellSize - 0.5, cellSize - 0.5);
        }
      }
    }
  }

  // ==========================================
  // SIZE GUIDE MODAL
  // ==========================================
  openSizeGuideModal() {
    const modal = document.getElementById('size-guide-modal');
    if (!modal) return;
    this.renderSizeGuideTables();
    modal.classList.remove('hidden');
  }

  toggleSizeGuideUnit(unit) {
    this.sizeGuideUnit = unit;
    this.renderSizeGuideTables();
  }

  setSizeGuideTab(tab) {
    this.sizeGuideTab = tab;
    this.renderSizeGuideTables();
  }

  renderSizeGuideTables() {
    const container = document.getElementById('size-guide-table-container');
    const unitInBtn = document.getElementById('btn-unit-in');
    const unitCmBtn = document.getElementById('btn-unit-cm');
    const tabTopsBtn = document.getElementById('btn-guide-tops');
    const tabBottomsBtn = document.getElementById('btn-guide-bottoms');

    if (!container) return;

    if (unitInBtn && unitCmBtn) {
      if (this.sizeGuideUnit === 'in') {
        unitInBtn.className = 'px-3 py-1 text-xs font-bold rounded-lg bg-blue-700 text-white';
        unitCmBtn.className = 'px-3 py-1 text-xs font-bold rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200';
      } else {
        unitInBtn.className = 'px-3 py-1 text-xs font-bold rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200';
        unitCmBtn.className = 'px-3 py-1 text-xs font-bold rounded-lg bg-blue-700 text-white';
      }
    }

    if (tabTopsBtn && tabBottomsBtn) {
      if (this.sizeGuideTab === 'tops') {
        tabTopsBtn.className = 'pb-2 border-b-2 border-blue-700 text-slate-900 font-bold text-sm';
        tabBottomsBtn.className = 'pb-2 border-b-2 border-transparent text-slate-500 font-medium text-sm hover:text-slate-800';
      } else {
        tabTopsBtn.className = 'pb-2 border-b-2 border-transparent text-slate-500 font-medium text-sm hover:text-slate-800';
        tabBottomsBtn.className = 'pb-2 border-b-2 border-blue-700 text-slate-900 font-bold text-sm';
      }
    }

    const isInches = this.sizeGuideUnit === 'in';

    if (this.sizeGuideTab === 'tops') {
      container.innerHTML = `
        <table class="w-full text-xs text-left">
          <thead class="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
            <tr>
              <th class="py-2.5 px-3">Size Label</th>
              <th class="py-2.5 px-3">Chest / Bust (${isInches ? 'inches' : 'cm'})</th>
              <th class="py-2.5 px-3">Apparel Length (${isInches ? 'inches' : 'cm'})</th>
              <th class="py-2.5 px-3">Shoulder Span (inches)</th>
              <th class="py-2.5 px-3 text-center">Fit Calibration</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${SIZE_GUIDE_DATA.tops.map(row => `
              <tr class="hover:bg-slate-50 transition">
                <td class="py-2.5 px-3 font-bold text-blue-900 bg-blue-50/50">${row.size}</td>
                <td class="py-2.5 px-3 text-slate-700">${isInches ? row.chestIn : row.chestCm}</td>
                <td class="py-2.5 px-3 text-slate-700">${isInches ? row.lengthIn : row.lengthCm}</td>
                <td class="py-2.5 px-3 text-slate-700">${row.shoulderIn}</td>
                <td class="py-2.5 px-3 text-center">
                  <span class="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">True to Fit</span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else {
      container.innerHTML = `
        <table class="w-full text-xs text-left">
          <thead class="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
            <tr>
              <th class="py-2.5 px-3">Size Label</th>
              <th class="py-2.5 px-3">Waistline (${isInches ? 'inches' : 'cm'})</th>
              <th class="py-2.5 px-3">Hips Range (inches)</th>
              <th class="py-2.5 px-3">Outseam Length (${isInches ? 'inches' : 'cm'})</th>
              <th class="py-2.5 px-3 text-center">Fit Calibration</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${SIZE_GUIDE_DATA.bottoms.map(row => `
              <tr class="hover:bg-slate-50 transition">
                <td class="py-2.5 px-3 font-bold text-blue-900 bg-blue-50/50">${row.size}</td>
                <td class="py-2.5 px-3 text-slate-700">${isInches ? row.waistIn : row.waistCm}</td>
                <td class="py-2.5 px-3 text-slate-700">${row.hipsIn}</td>
                <td class="py-2.5 px-3 text-slate-700">${isInches ? row.lengthIn : row.lengthCm}</td>
                <td class="py-2.5 px-3 text-center">
                  <span class="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">True to Fit</span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }
  }

  // ==========================================
  // ADMIN DASHBOARD
  // ==========================================
  renderAdminView() {
    this.renderAdminKPIs();
    if (this.adminTab === 'reservations') {
      document.getElementById('admin-tab-reservations-btn').className = 'pb-3 border-b-2 border-blue-700 text-slate-900 font-bold text-sm flex items-center gap-2';
      document.getElementById('admin-tab-inventory-btn').className = 'pb-3 border-b-2 border-transparent text-slate-500 font-medium text-sm hover:text-slate-800 flex items-center gap-2';
      document.getElementById('admin-reservations-section').classList.remove('hidden');
      document.getElementById('admin-inventory-section').classList.add('hidden');
      this.renderAdminReservations();
    } else {
      document.getElementById('admin-tab-reservations-btn').className = 'pb-3 border-b-2 border-transparent text-slate-500 font-medium text-sm hover:text-slate-800 flex items-center gap-2';
      document.getElementById('admin-tab-inventory-btn').className = 'pb-3 border-b-2 border-blue-700 text-slate-900 font-bold text-sm flex items-center gap-2';
      document.getElementById('admin-reservations-section').classList.add('hidden');
      document.getElementById('admin-inventory-section').classList.remove('hidden');
      this.renderAdminInventory();
    }
  }

  renderAdminKPIs() {
    const totalReservations = this.reservations.length;
    const totalRevenue = this.reservations
      .filter(r => r.status !== 'Cancelled')
      .reduce((sum, r) => sum + r.totalAmount, 0);
    const pendingCount = this.reservations.filter(r => r.status === 'Pending').length;
    
    let lowStockCount = 0;
    this.catalog.forEach(item => {
      if (this.getTotalStock(item) <= 12) lowStockCount++;
    });

    const totalResEl = document.getElementById('admin-kpi-total-res');
    const revenueEl = document.getElementById('admin-kpi-revenue');
    const pendingEl = document.getElementById('admin-kpi-pending');
    const lowStockEl = document.getElementById('admin-kpi-low-stock');

    if (totalResEl) totalResEl.textContent = totalReservations;
    if (revenueEl) revenueEl.textContent = `₱${totalRevenue.toLocaleString()}`;
    if (pendingEl) pendingEl.textContent = pendingCount;
    if (lowStockEl) lowStockEl.textContent = lowStockCount;
  }

  renderAdminReservations() {
    const tbody = document.getElementById('admin-reservations-table-body');
    if (!tbody) return;

    let list = [...this.reservations];

    if (this.adminStatusFilter !== 'all') {
      list = list.filter(r => r.status === this.adminStatusFilter);
    }

    if (this.adminSearch.trim() !== '') {
      const q = this.adminSearch.toLowerCase();
      list = list.filter(r => 
        r.refCode.toLowerCase().includes(q) ||
        r.studentName.toLowerCase().includes(q) ||
        r.studentId.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q)
      );
    }

    if (list.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="py-12 text-center text-slate-400 text-sm">
            No student reservations found matching criteria.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = list.map(r => {
      let statusBadge = 'bg-amber-100 text-amber-800 border-amber-300';
      if (r.status === 'Ready for Pickup') statusBadge = 'bg-blue-100 text-blue-800 border-blue-300';
      if (r.status === 'Claimed') statusBadge = 'bg-emerald-100 text-emerald-800 border-emerald-300';
      if (r.status === 'Cancelled') statusBadge = 'bg-rose-100 text-rose-800 border-rose-300';

      const itemsSummary = r.items.map(i => `${i.productName} (${i.size}) x${i.quantity}`).join('<br>');

      return `
        <tr class="hover:bg-slate-50 transition border-b border-slate-100 text-xs">
          <td class="py-3 px-4 font-mono font-bold text-blue-900">
            ${r.refCode}
            <span class="block text-[10px] text-slate-400 font-normal font-sans">${new Date(r.createdAt).toLocaleDateString()}</span>
          </td>
          <td class="py-3 px-4">
            <div class="font-bold text-slate-900">${r.studentName}</div>
            <div class="text-[11px] text-slate-500 font-mono">${r.studentId}</div>
            <div class="text-[10px] text-slate-400">${r.department}</div>
          </td>
          <td class="py-3 px-4 text-slate-700 leading-snug">
            ${itemsSummary}
          </td>
          <td class="py-3 px-4 font-black text-slate-900">
            ₱${r.totalAmount.toFixed(2)}
          </td>
          <td class="py-3 px-4">
            <div class="font-semibold text-slate-800">${r.pickupDate}</div>
            <div class="text-[10px] text-slate-500 truncate max-w-[140px]">${r.pickupSlot}</div>
          </td>
          <td class="py-3 px-4">
            <span class="px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusBadge}">
              ${r.status}
            </span>
          </td>
          <td class="py-3 px-4 text-right space-x-1 whitespace-nowrap">
            <button 
              onclick="app.viewReservationReceipt('${r.refCode}')" 
              class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition"
              title="View & Print Official Slip">
              Slip
            </button>
            <select 
              onchange="app.updateReservationStatus('${r.refCode}', this.value)" 
              class="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-700">
              <option value="Pending" ${r.status === 'Pending' ? 'selected' : ''}>Pending</option>
              <option value="Ready for Pickup" ${r.status === 'Ready for Pickup' ? 'selected' : ''}>Ready</option>
              <option value="Claimed" ${r.status === 'Claimed' ? 'selected' : ''}>Claimed</option>
              <option value="Cancelled" ${r.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
          </td>
        </tr>
      `;
    }).join('');
  }

  viewReservationReceipt(refCode) {
    const res = this.reservations.find(r => r.refCode === refCode);
    if (res) {
      this.showReceiptModal(res);
    }
  }

  renderAdminInventory() {
    const tbody = document.getElementById('admin-inventory-table-body');
    if (!tbody) return;

    tbody.innerHTML = this.catalog.map(item => {
      const totalStock = this.getTotalStock(item);
      const stockInfo = this.getStockStatus(item);

      return `
        <tr class="hover:bg-slate-50 transition border-b border-slate-100 text-xs">
          <td class="py-3 px-4">
            <div class="flex items-center gap-3">
              <img src="${item.imageSrc}" class="w-10 h-10 rounded-lg object-cover border border-slate-200 flex-shrink-0">
              <div>
                <div class="font-bold text-slate-900">${item.name}</div>
                <div class="text-[11px] text-slate-400 capitalize">${item.category} • ${item.gender}</div>
              </div>
            </div>
          </td>
          <td class="py-3 px-4">
            <div class="flex items-center gap-1">
              <span class="text-slate-500 font-bold">₱</span>
              <input 
                type="number" 
                value="${item.price}" 
                step="5" 
                min="10" 
                onchange="app.updatePrice('${item.id}', this.value)" 
                class="w-20 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:ring-1 focus:ring-blue-700 focus:outline-none">
            </div>
          </td>
          <td class="py-3 px-4">
            <div class="flex flex-wrap gap-1.5 items-center">
              ${Object.keys(item.sizes || {}).map(size => {
                const qty = item.sizes[size];
                return `
                  <div class="flex items-center bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 gap-1">
                    <span class="font-bold text-slate-600 text-[11px]">${size}:</span>
                    <input 
                      type="number" 
                      value="${qty}" 
                      min="0" 
                      onchange="app.setStockDirect('${item.id}', '${size}', this.value)" 
                      class="w-12 text-center bg-white border border-slate-300 rounded font-mono text-xs font-bold text-blue-900 focus:outline-none">
                  </div>
                `;
              }).join('')}
            </div>
          </td>
          <td class="py-3 px-4">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${stockInfo.class}">
              ${totalStock} total units
            </span>
          </td>
          <td class="py-3 px-4 text-right">
            <button 
              onclick="app.quickAddStockPrompt('${item.id}')" 
              class="px-3 py-1 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg transition text-[11px]">
              + Restock
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  quickAddStockPrompt(productId) {
    const product = this.catalog.find(p => p.id === productId);
    if (!product) return;

    const size = prompt(`Which size do you want to restock for "${product.name}"? (XS, S, M, L, XL, 2XL, 3XL)`, 'M');
    if (!size || !product.sizes[size.toUpperCase()]) {
      if (size) alert('Invalid size choice.');
      return;
    }
    const qtyToAdd = parseInt(prompt(`Enter quantity to add to size ${size.toUpperCase()}:`, '10'));
    if (!isNaN(qtyToAdd) && qtyToAdd > 0) {
      this.updateStock(productId, size.toUpperCase(), qtyToAdd);
    }
  }

  // ==========================================
  // EVENT BINDINGS
  // ==========================================
  bindEvents() {
    const searchInput = document.getElementById('catalog-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.renderCatalog();
      });
    }

    const categoryButtons = document.querySelectorAll('[data-category-filter]');
    categoryButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        categoryButtons.forEach(b => {
          b.classList.remove('bg-blue-700', 'text-white', 'shadow-sm');
          b.classList.add('bg-white', 'text-slate-600', 'border-slate-200');
        });
        btn.classList.add('bg-blue-700', 'text-white', 'shadow-sm');
        btn.classList.remove('bg-white', 'text-slate-600', 'border-slate-200');

        this.activeCategory = btn.getAttribute('data-category-filter');
        this.renderCatalog();
      });
    });

    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
      checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = {
          studentName: document.getElementById('checkout-name').value,
          studentId: document.getElementById('checkout-id').value,
          department: document.getElementById('checkout-dept').value,
          yearLevel: document.getElementById('checkout-year').value,
          contact: document.getElementById('checkout-contact').value,
          pickupDate: document.getElementById('checkout-date').value,
          pickupSlot: document.getElementById('checkout-timeslot').value,
          notes: document.getElementById('checkout-notes') ? document.getElementById('checkout-notes').value : ''
        };

        if (!formData.department) {
          this.showToast('Please select your academic department.', 'warning');
          return;
        }
        if (!formData.pickupSlot) {
          this.showToast('Please select a preferred pickup time slot.', 'warning');
          return;
        }

        this.submitReservation(formData);
      });
    }

    const addProductForm = document.getElementById('add-product-form');
    if (addProductForm) {
      addProductForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = {
          name: document.getElementById('new-prod-name').value,
          category: document.getElementById('new-prod-category').value,
          gender: document.getElementById('new-prod-gender').value,
          price: document.getElementById('new-prod-price').value,
          material: document.getElementById('new-prod-material').value,
          description: document.getElementById('new-prod-desc').value,
          imageSrc: document.getElementById('new-prod-img').value || 'images/varsity_jacket.jpg',
          stockXS: document.getElementById('new-stock-xs').value,
          stockS: document.getElementById('new-stock-s').value,
          stockM: document.getElementById('new-stock-m').value,
          stockL: document.getElementById('new-stock-l').value,
          stockXL: document.getElementById('new-stock-xl').value,
          stock2XL: document.getElementById('new-stock-2xl').value,
          stock3XL: document.getElementById('new-stock-3xl').value
        };
        this.addNewProduct(data);
      });
    }

    const adminSearchInput = document.getElementById('admin-search-input');
    if (adminSearchInput) {
      adminSearchInput.addEventListener('input', (e) => {
        this.adminSearch = e.target.value;
        this.renderAdminReservations();
      });
    }

    const adminStatusSelect = document.getElementById('admin-status-select');
    if (adminStatusSelect) {
      adminStatusSelect.addEventListener('change', (e) => {
        this.adminStatusFilter = e.target.value;
        this.renderAdminReservations();
      });
    }
  }

  resetFilters() {
    this.searchQuery = '';
    this.activeCategory = 'all';
    const searchInput = document.getElementById('catalog-search-input');
    if (searchInput) searchInput.value = '';

    const categoryButtons = document.querySelectorAll('[data-category-filter]');
    categoryButtons.forEach(b => {
      if (b.getAttribute('data-category-filter') === 'all') {
        b.classList.add('bg-blue-700', 'text-white');
        b.classList.remove('bg-white', 'text-slate-600');
      } else {
        b.classList.remove('bg-blue-700', 'text-white');
        b.classList.add('bg-white', 'text-slate-600');
      }
    });

    this.renderCatalog();
  }

  switchPortalView(view) {
    this.currentView = view;
    const studentBtn = document.getElementById('portal-switch-student');
    const adminBtn = document.getElementById('portal-switch-admin');

    if (view === 'student') {
      if (studentBtn) studentBtn.className = 'px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-900 shadow-sm';
      if (adminBtn) adminBtn.className = 'px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white';
    } else {
      if (studentBtn) studentBtn.className = 'px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white';
      if (adminBtn) adminBtn.className = 'px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-900 shadow-sm';
    }

    this.render();
    this.showToast(`Switched to ${view === 'student' ? 'Student Catalog' : 'Admin Logistics Portal'}.`, 'info');
  }

  setAdminTab(tab) {
    this.adminTab = tab;
    this.renderAdminView();
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    let bgClass = 'bg-slate-900 text-white';
    let icon = `<svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;

    if (type === 'success') {
      bgClass = 'bg-blue-900 text-white border border-blue-700';
      icon = `<svg class="w-4 h-4 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`;
    } else if (type === 'warning') {
      bgClass = 'bg-amber-900 text-white border border-amber-700';
      icon = `<svg class="w-4 h-4 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`;
    }

    const toast = document.createElement('div');
    toast.className = `flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl text-xs font-semibold transform transition-all duration-300 translate-y-2 opacity-0 ${bgClass}`;
    toast.innerHTML = `${icon} <span>${message}</span>`;

    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    });

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 3500);
  }
}

let app;
window.addEventListener('DOMContentLoaded', () => {
  app = new KahitAnoApp();
});
