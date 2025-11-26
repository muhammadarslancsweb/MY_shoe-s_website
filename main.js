/*
    WoolTech front-end JavaScript

    Overview & responsibilities:
    - Holds in-memory product catalog in `productData` and page-level `products`/`filteredProducts`
    - Manages cart state in `cart` and persists it to localStorage (key: 'wooltech-cart')
    - Handles rendering of products and cart items into the DOM
    - Adds event listeners for filtering, sorting and search on the products page
    - Provides checkout flow validation and simulated order completion
    - Exposes a handful of functions onto `window` so they can be called from inline onclick attributes

    Data flow (high-level):
    productData -> products (app state) -> filteredProducts (view state) -> renderProducts() -> DOM
    User actions (add/remove/update) update `cart` -> saveCart() -> update DOM & localStorage

    Notes:
    - Keep DOM manipulation minimal and declarative where possible (rendering templates)
    - Small helper utilities at the bottom (debounce, scroll helpers, toggles)
*/

// Global variables
let cart = JSON.parse(localStorage.getItem('wooltech-cart')) || [];
let products = [];
let filteredProducts = [];

// Product data
const productData = [
    {
        id: 'urban-wool-runner',
        name: 'Urban Wool Runner',
        price: 149,
        category: 'running',
        colors: ['white', 'oat', 'grey'],
        image: 'resources/product-1.jpg',
        description: 'Premium merino wool meets urban sophistication. Perfect for daily wear with natural breathability and comfort.',
        features: ['Merino Wool Upper', 'Moisture Wicking', 'Odor Resistant', 'Lightweight Design']
    },
    {
        id: 'oat-wool-classic',
        name: 'Oat Wool Classic',
        price: 159,
        category: 'casual',
        colors: ['oat', 'grey', 'black'],
        image: 'resources/product-2.jpg',
        description: 'Timeless design with natural comfort. The perfect blend of classic style and modern functionality.',
        features: ['Classic Silhouette', 'Premium Materials', 'All-Day Comfort', 'Versatile Style']
    },
    {
        id: 'mist-grey-minimal',
        name: 'Mist Grey Minimal',
        price: 139,
        category: 'casual',
        colors: ['grey', 'white', 'black'],
        image: 'resources/product-3.jpg',
        description: 'Clean aesthetics with superior comfort. Minimalist design meets maximum functionality.',
        features: ['Minimal Design', 'Superior Comfort', 'Clean Aesthetics', 'Modern Style']
    },
    {
        id: 'charcoal-high-top',
        name: 'Charcoal High-Top',
        price: 179,
        category: 'casual',
        colors: ['black', 'grey'],
        image: 'resources/product-4.jpg',
        description: 'Sophisticated high-top design with premium merino wool construction and leather accents.',
        features: ['High-Top Design', 'Leather Accents', 'Premium Construction', 'Urban Style']
    },
    {
        id: 'sage-green-walker',
        name: 'Sage Green Walker',
        price: 149,
        category: 'casual',
        colors: ['sage', 'white'],
        image: 'resources/product-5.jpg',
        description: 'Minimalist design with sustainable construction. Perfect for the eco-conscious urbanite.',
        features: ['Sustainable Materials', 'Eco-Friendly', 'Comfortable Fit', 'Natural Colors']
    },
    {
        id: 'cream-slip-on',
        name: 'Cream Slip-On',
        price: 129,
        category: 'casual',
        colors: ['white', 'oat'],
        image: 'resources/product-6.jpg',
        description: 'Effortless style with sock-like comfort. The perfect easy-wear sneaker for any occasion.',
        features: ['Slip-On Design', 'Sock-Like Fit', 'Easy Wear', 'Comfortable Design']
    },
    {
        id: 'navy-running-shoe',
        name: 'Navy Running Shoe',
        price: 169,
        category: 'running',
        colors: ['navy', 'white'],
        image: 'resources/product-7.jpg',
        description: 'Athletic functionality meets natural materials. Advanced wool technology for peak performance.',
        features: ['Performance Design', 'Moisture Management', 'Athletic Support', 'Durable Construction']
    },
    {
        id: 'camel-luxury-sneaker',
        name: 'Camel Luxury Sneaker',
        price: 189,
        category: 'casual',
        colors: ['camel', 'white'],
        image: 'resources/product-8.jpg',
        description: 'Luxury craftsmanship meets sustainable materials. Premium quality for discerning customers.',
        features: ['Luxury Materials', 'Premium Craftsmanship', 'Sustainable Luxury', 'High-End Design']
    },
    {
        id: 'lavender-fashion-sneaker',
        name: 'Lavender Fashion Sneaker',
        price: 159,
        category: 'casual',
        colors: ['lavender', 'white'],
        image: 'resources/product-9.jpg',
        description: 'Contemporary design with fashion-forward aesthetics. Natural comfort meets modern style.',
        features: ['Fashion-Forward', 'Contemporary Design', 'Natural Materials', 'Modern Aesthetic']
    },
    {
        id: 'forest-hiking-boot',
        name: 'Forest Hiking Boot',
        price: 199,
        category: 'hiking',
        colors: ['forest', 'brown'],
        image: 'resources/product-10.jpg',
        description: 'Rugged outdoor performance with natural wool comfort. Ready for any adventure.',
        features: ['Outdoor Performance', 'Rugged Construction', 'Adventure Ready', 'Natural Comfort']
    },
    {
        id: 'white-court-sneaker',
        name: 'White Court Sneaker',
        price: 139,
        category: 'casual',
        colors: ['white', 'grey'],
        image: 'resources/product-11.jpg',
        description: 'Classic tennis-inspired design with modern comfort technology. Timeless style redefined.',
        features: ['Tennis-Inspired', 'Classic Design', 'Modern Comfort', 'Timeless Style']
    },
    {
        id: 'black-urban-high-top',
        name: 'Black Urban High-Top',
        price: 179,
        category: 'casual',
        colors: ['black', 'grey'],
        image: 'resources/product-12.jpg',
        description: 'Streetwear aesthetics with natural material luxury. Bold design for the fashion-forward.',
        features: ['Streetwear Style', 'Bold Design', 'Natural Luxury', 'Fashion-Forward']
    }
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    products = productData;
    filteredProducts = products;
    
    initializeApp();
    updateCartBadge();
    
    // Page-specific initialization
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    switch(currentPage) {
        case 'index.html':
        case '':
            initializeHomePage();
            break;
        case 'products.html':
            initializeProductsPage();
            break;
        case 'cart.html':
            initializeCartPage();
            break;
    }
});

// Initialize common app functionality
function initializeApp() {
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }
    
    // Scroll animations
    initializeScrollAnimations();
    
    // Newsletter form
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSubmit);
    }
}

// Initialize home page
function initializeHomePage() {
    // Hero animations
    anime({
        targets: '.floating-animation',
        translateY: [-20, 0],
        opacity: [0, 1],
        duration: 1000,
        delay: 500,
        easing: 'easeOutQuart'
    });
    
    // Animate product cards using component-level class .product-card
    anime({
        targets: '.product-card',
        translateY: [50, 0],
        opacity: [0, 1],
        duration: 800,
        delay: anime.stagger(200),
        easing: 'easeOutQuart'
    });
}

// Initialize products page
function initializeProductsPage() {
    renderProducts();
    initializeFilters();
    initializeSearch();
    initializeSort();
    
    // Mobile filters
    const mobileFiltersBtn = document.getElementById('mobile-filters-btn');
    if (mobileFiltersBtn) {
        mobileFiltersBtn.addEventListener('click', toggleMobileFilters);
    }
}

// Initialize cart page
function initializeCartPage() {
    renderCartItems();
    updateOrderSummary();
    initializeCheckout();
}

// -------------------------------
// Cart Management Functions
// -------------------------------
// Functions below are responsible for adding/removing/updating items
// in the in-memory cart array and syncing that state to localStorage.
// These functions keep the UI updated (badge, cart list, order summary).
function addToCart(id, name, price, image, quantity = 1) {
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: id,
            name: name,
            price: price,
            image: image,
            quantity: quantity
        });
    }
    
    saveCart();
    updateCartBadge();
    showAddToCartFeedback(name);
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    updateCartBadge();
    
    // Remove item with animation
    const cartItem = document.querySelector(`[data-id="${id}"]`);
    if (cartItem) {
        cartItem.classList.add('removing');
        setTimeout(() => {
            renderCartItems();
            updateOrderSummary();
        }, 300);
    }
}

function updateQuantity(id, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(id);
        return;
    }
    
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity = newQuantity;
        saveCart();
        updateCartBadge();
        updateOrderSummary();
        
        // Update quantity display
        const quantityDisplay = document.querySelector(`[data-id="${id}"] .quantity-display`);
        if (quantityDisplay) {
            quantityDisplay.textContent = newQuantity;
        }
    }
}

function saveCart() {
    // Persist cart state to localStorage so cart survives page reloads
    localStorage.setItem('wooltech-cart', JSON.stringify(cart));
}

function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    if (badge) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (totalItems > 0) {
            badge.textContent = totalItems;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }
}

function showAddToCartFeedback(productName) {
    // Create a small temporary toast-like feedback in the UI to confirm add-to-cart
    const feedback = document.createElement('div');
    // Use CSS component class for toast feedback to avoid many inline utility classes
    feedback.className = 'toast-feedback';
    feedback.textContent = `${productName} added to cart!`;
    
    document.body.appendChild(feedback);
    
    // Animate in using CSS toggle
    setTimeout(() => feedback.classList.add('show'), 100);
    
    // Animate out and remove
    setTimeout(() => {
        feedback.classList.remove('show');
        setTimeout(() => document.body.removeChild(feedback), 350);
    }, 2000);
}

// -------------------------------
// Product Rendering Functions
// -------------------------------
// Responsible for turning `filteredProducts` into DOM markup. This is
// string-template-based rendering; keep the templates simple and avoid
// inserting unescaped user content.
function renderProducts() {
    const productsGrid = document.getElementById('products-grid');
    const productCount = document.getElementById('product-count');
    const noProducts = document.getElementById('no-products');
    
    if (!productsGrid) return;
    
    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = '';
        noProducts.classList.remove('hidden');
        productCount.textContent = 'Showing 0 products';
        return;
    }
    
    noProducts.classList.add('hidden');
    productCount.textContent = `Showing ${filteredProducts.length} products`;
    
    productsGrid.innerHTML = filteredProducts.map(product => `
        <div class="product-card fade-in" data-id="${product.id}">
            <div class="position-relative">
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <div class="position-absolute top-0 start-0 w-100 h-100 product-overlay d-flex align-items-center justify-content-center">
                    <button onclick="addToCart('${product.id}', '${product.name}', ${product.price}, '${product.image}')" class="btn btn-light rounded-pill">
                        Add to Cart
                    </button>
                </div>
                <button onclick="openProductModal('${product.id}')" class="position-absolute top-3 end-3 btn btn-sm btn-light rounded-circle">
                    <svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                </button>
            </div>
            <div class="product-card__body">
                <h4 class="product-card__title">${product.name}</h4>
                <p class="text-secondary mb-3">${product.description}</p>
                <div class="d-flex justify-content-between align-items-center">
                    <span class="product-card__price">$${product.price}</span>
                    <div class="d-flex gap-1 align-items-center">
                        ${product.colors.slice(0, 3).map(color => `
                            <div class="swatch swatch--${getColorClass(color)}" title="${color}"></div>
                        `).join('')}
                        ${product.colors.length > 3 ? `<div class="small text-muted">+${product.colors.length - 3}</div>` : ''}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    // Trigger fade-in animations
    setTimeout(() => {
        document.querySelectorAll('.fade-in').forEach(el => {
            el.classList.add('visible');
        });
    }, 100);
}

function getColorClass(color) {
    // Return normalized swatch key (these map to .swatch--<key> classes in CSS)
    const available = ['white','oat','grey','black','sage','navy','lavender','camel','forest','brown'];
    return available.includes(color) ? color : 'white';
}

// -------------------------------
// Filter & Search Functions
// -------------------------------
// These read UI state (buttons, checkboxes, inputs), compute filter conditions
// and then update `filteredProducts` before re-rendering the product list.
function initializeFilters() {
    // Category filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.dataset.filter;
            filterProducts();
        });
    });
    
    // Price filters
    document.querySelectorAll('.price-filter').forEach(checkbox => {
        checkbox.addEventListener('change', filterProducts);
    });
    
    // Color filters
    document.querySelectorAll('.color-filter').forEach(btn => {
        btn.addEventListener('click', function() {
            this.classList.toggle('active');
            filterProducts();
        });
    });
    
    // Clear filters
    const clearFilters = document.getElementById('clear-filters');
    if (clearFilters) {
        clearFilters.addEventListener('click', clearAllFilters);
    }
}

function filterProducts() {
    // Apply filters cumulatively: category -> price ranges -> colors
    const activeCategory = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
    const activePriceRanges = Array.from(document.querySelectorAll('.price-filter:checked'))
        .map(cb => ({ min: parseInt(cb.dataset.min), max: parseInt(cb.dataset.max) }));
    const activeColors = Array.from(document.querySelectorAll('.color-filter.active'))
        .map(btn => btn.dataset.color);
    
    filteredProducts = products.filter(product => {
        // Category filter
        if (activeCategory !== 'all' && product.category !== activeCategory) {
            return false;
        }
        
        // Price filter
        if (activePriceRanges.length > 0) {
            const inPriceRange = activePriceRanges.some(range => 
                product.price >= range.min && product.price <= range.max
            );
            if (!inPriceRange) return false;
        }
        
        // Color filter
        if (activeColors.length > 0) {
            const hasColor = activeColors.some(color => product.colors.includes(color));
            if (!hasColor) return false;
        }
        
        return true;
    });
    
    renderProducts();
}

function clearAllFilters() {
    // Reset all filter controls and restore the full products list
    // Reset category
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('.filter-btn[data-filter="all"]').classList.add('active');
    
    // Reset price filters
    document.querySelectorAll('.price-filter').forEach(cb => cb.checked = false);
    
    // Reset color filters
    document.querySelectorAll('.color-filter').forEach(btn => btn.classList.remove('active'));
    
    // Reset search
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';
    
    // Reset sort
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) sortSelect.value = 'featured';
    
    filteredProducts = products;
    renderProducts();
}

// -------------------------------
// Search Helpers
// -------------------------------
function initializeSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
}

function handleSearch(e) {
    // Performs a text search over product fields and updates the view
    const query = e.target.value.toLowerCase().trim();
    
    if (query === '') {
        filteredProducts = products;
    } else {
        filteredProducts = products.filter(product => 
            product.name.toLowerCase().includes(query) ||
            product.description.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query) ||
            product.features.some(feature => feature.toLowerCase().includes(query))
        );
    }
    
    renderProducts();
}

// -------------------------------
// Sorting Helpers
// -------------------------------
function initializeSort() {
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', handleSort);
    }
}

function handleSort(e) {
    // Sort filteredProducts in-place depending on selected option
    const sortBy = e.target.value;
    
    switch(sortBy) {
        case 'price-low':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'name':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        default:
            // Featured - restore original order
            filteredProducts = products.filter(p => filteredProducts.includes(p));
    }
    
    renderProducts();
}

// -------------------------------
// Product Modal Functions
// -------------------------------
// The product modal is created on demand and injected into #modal-body.
// This keeps the initial DOM light and allows re-using a single modal element.
function openProductModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const modal = document.getElementById('product-modal');
    const modalBody = document.getElementById('modal-body');
    
    modalBody.innerHTML = `
        <div class="row g-4 p-4">
            <div class="col-md-6">
                <img src="${product.image}" alt="${product.name}" class="product-image rounded-4">
            </div>
            <div class="col-md-6">
                <div class="space-y-4">
                <div class="flex justify-between items-start">
                    <h3 class="text-2xl font-bold">${product.name}</h3>
                    <button onclick="closeProductModal()" class="text-gray-400 hover:text-gray-600">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                <p class="text-gray-600">${product.description}</p>
                <div class="text-3xl font-bold text-gray-900">$${product.price}</div>
                
                <div>
                    <h4 class="font-semibold mb-2">Features:</h4>
                    <ul class="space-y-1">
                        ${product.features.map(feature => `<li class="flex items-center text-sm text-gray-600">
                            <svg class="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            ${feature}
                        </li>`).join('')}
                    </ul>
                </div>
                
                <div>
                    <h4 class="font-semibold mb-2">Available Colors:</h4>
                    <div class="flex space-x-2">
                        ${product.colors.map(color => `
                            <div class="swatch swatch--${getColorClass(color)}" title="${color}"></div>
                        `).join('')}
                    </div>
                </div>
                
                <button onclick="addToCart('${product.id}', '${product.name}', ${product.price}, '${product.image}'); closeProductModal();" 
                    class="btn btn-primary w-100 rounded-pill fw-semibold py-2">
                    Add to Cart - $${product.price}
                </button>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
}

function closeProductModal() {
    const modal = document.getElementById('product-modal');
    modal.classList.remove('active');
}

// -------------------------------
// Cart Page Rendering & Helpers
// -------------------------------
// These functions control the rendering of the cart page UI from the
// current `cart` state and compute order totals for display.
function renderCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCart = document.getElementById('empty-cart');
    
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '';
        emptyCart.classList.remove('hidden');
        return;
    }
    
    emptyCart.classList.add('hidden');
    
    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <img src="${item.image}" alt="${item.name}" class="cart-item__img">

            <div class="cart-item__meta">
                <h4 class="cart-item__title">${item.name}</h4>
                <p class="text-muted mb-0">$${item.price}</p>
            </div>

            <div class="cart-item__controls">
                <button onclick="updateQuantity('${item.id}', ${item.quantity - 1})" class="quantity-btn">-</button>
                <span class="quantity-display cart-item__quantity">${item.quantity}</span>
                <button onclick="updateQuantity('${item.id}', ${item.quantity + 1})" class="quantity-btn">+</button>
            </div>

            <div class="cart-item__right">
                <div class="cart-item__price">$${(item.price * item.quantity).toFixed(2)}</div>
                <button onclick="removeFromCart('${item.id}')" class="btn btn-link text-danger small mt-1">Remove</button>
            </div>
        </div>
    `).join('');
}

function updateOrderSummary() {
    // Compute subtotal, shipping and tax and reflect these in the UI.
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 100 ? 0 : 15;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;
    
    const subtotalEl = document.getElementById('subtotal');
    const shippingEl = document.getElementById('shipping');
    const taxEl = document.getElementById('tax');
    const totalEl = document.getElementById('total');
    const modalTotalEl = document.getElementById('modal-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (shippingEl) shippingEl.textContent = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
    if (taxEl) taxEl.textContent = `$${tax.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
    if (modalTotalEl) modalTotalEl.textContent = `$${total.toFixed(2)}`;
    
    if (checkoutBtn) {
        checkoutBtn.disabled = cart.length === 0;
        checkoutBtn.textContent = cart.length === 0 ? 'Cart is Empty' : `Checkout - $${total.toFixed(2)}`;
    }
}

// -------------------------------
// Checkout Flow and Validation
// -------------------------------
// Handles UI wiring of checkout modal, validating fields, simulating order
// processing, and resetting state on success.
function initializeCheckout() {
    const checkoutBtn = document.getElementById('checkout-btn');
    const checkoutModal = document.getElementById('checkout-modal');
    const closeModal = document.getElementById('close-modal');
    const checkoutForm = document.getElementById('checkout-form');
    const successModal = document.getElementById('success-modal');
    const closeSuccessModal = document.getElementById('close-success-modal');
    
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length > 0) {
                checkoutModal.classList.add('active');
            }
        });
    }
    
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            checkoutModal.classList.remove('active');
        });
    }
    
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleCheckoutSubmit);
    }
    
    if (closeSuccessModal) {
        closeSuccessModal.addEventListener('click', () => {
            successModal.classList.remove('active');
        });
    }
    
    // Modal backdrop click
    if (checkoutModal) {
        checkoutModal.addEventListener('click', (e) => {
            if (e.target === checkoutModal) {
                checkoutModal.classList.remove('active');
            }
        });
    }
    
    if (successModal) {
        successModal.addEventListener('click', (e) => {
            if (e.target === successModal) {
                successModal.classList.remove('active');
            }
        });
    }
}

function handleCheckoutSubmit(e) {
    e.preventDefault();
    
    // Basic form validation
    const formData = new FormData(e.target);
    const requiredFields = ['firstName', 'lastName', 'email', 'address', 'city', 'state', 'zip', 'cardNumber', 'expiry', 'cvv'];
    let isValid = true;
    
    requiredFields.forEach(field => {
        const input = document.getElementById(field);
        const errorEl = document.getElementById(`${field}-error`);
        
        if (!input.value.trim()) {
            showFieldError(field, 'This field is required');
            isValid = false;
        } else {
            clearFieldError(field);
        }
    });
    
    // Email validation
    const email = document.getElementById('email').value;
    if (email && !isValidEmail(email)) {
        showFieldError('email', 'Please enter a valid email address');
        isValid = false;
    }
    
    if (isValid) {
        // Simulate order processing
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Processing...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            // Close checkout modal
            document.getElementById('checkout-modal').classList.remove('active');
            
            // Show success modal
            document.getElementById('success-modal').classList.add('active');
            
            // Clear cart
            cart = [];
            saveCart();
            updateCartBadge();
            renderCartItems();
            updateOrderSummary();
            
            // Reset form
            e.target.reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 2000);
    }
}

function showFieldError(fieldId, message) {
    const errorEl = document.getElementById(`${fieldId}-error`);
    const input = document.getElementById(fieldId);
    
    if (errorEl && input) {
        errorEl.textContent = message;
        errorEl.classList.remove('hidden');
        input.classList.add('border-red-500');
    }
}

function clearFieldError(fieldId) {
    const errorEl = document.getElementById(`${fieldId}-error`);
    const input = document.getElementById(fieldId);
    
    if (errorEl && input) {
        errorEl.classList.add('hidden');
        input.classList.remove('border-red-500');
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// -------------------------------
// Newsletter Signup (simple validation + message)
// -------------------------------
function handleNewsletterSubmit(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const messageEl = document.getElementById('newsletter-message');
    
    if (isValidEmail(email)) {
        // Simulate subscription
        messageEl.textContent = 'Thank you for subscribing! You\'ll receive our latest updates.';
        messageEl.className = 'mt-4 text-sm text-green-600';
        messageEl.classList.remove('hidden');
        
        // Reset form
        e.target.reset();
        
        // Hide message after 5 seconds
        setTimeout(() => {
            messageEl.classList.add('hidden');
        }, 5000);
    } else {
        messageEl.textContent = 'Please enter a valid email address.';
        messageEl.className = 'mt-4 text-sm text-red-600';
        messageEl.classList.remove('hidden');
    }
}

// -------------------------------
// Animation Helpers
// -------------------------------
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });
}

// -------------------------------
// Utility Functions
// -------------------------------
// Small helper utilities used across the app (debounce, smooth scroll).
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

function toggleMobileMenu() {
    // Mobile menu implementation
    alert('Mobile menu - Coming soon!');
}

function toggleMobileFilters() {
    // Mobile filters implementation
    alert('Mobile filters - Coming soon!');
}

// Global functions for onclick handlers
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.openProductModal = openProductModal;
window.closeProductModal = closeProductModal;
window.scrollToSection = scrollToSection;