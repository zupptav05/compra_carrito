// Funcionalidades generales de la aplicación
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    handleNotifications();
    
    // Inicializar funcionalidades del carrit
    initializeCart();
    
    // Manejar formularios
    handleForms();
    
    // Inicializar tooltips
    initializeTooltips();
}

// Notificaciones
function handleNotifications() {
    // Mostrar notificaciones flash si existen
    const flashMessages = document.querySelectorAll('.flash-message');
    flashMessages.forEach(message => {
        setTimeout(() => {
            message.style.opacity = '0';
            setTimeout(() => message.remove(), 300);
        }, 4000);
    });
}

// Carrito - MODIFICADO para prevenir múltiples clics
function initializeCart() {
    // Agregar productos al carrito con prevención de múltiples clics
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            // Prevenir múltiples clics rápidos
            if (this.classList.contains('loading') || this.disabled) {
                return;
            }
            
            const productId = this.dataset.productId;
            const productName = this.dataset.productName;
            
            if (productId && productName) {
                addToCart(productId, productName, this);
            }
        });
    });

    // Checkout
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', processCheckout);
    }

    // Vaciar carrito
    const clearCartBtn = document.getElementById('clear-cart-btn');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', clearCart);
    }
}

// Funciones del carrito - MODIFICADA para manejar estado del botón
async function addToCart(productId, productName, button) {
    // Deshabilitar el botón inmediatamente
    disableAddToCartButton(button);
    
    try {
        const response = await fetch('/cart/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                productId: parseInt(productId),
                quantity: 1
            })
        });

        const data = await response.json();

        if (data.success) {
            showNotification(`"${productName}" agregado al carrito`, 'success');
            updateCartCounter(data.cartCount || 1);
            
            // Feedback visual de éxito
            showAddToCartSuccess(button);
        } else {
            if (data.message === 'Debe iniciar sesión') {
                showNotification('Debes iniciar sesión para agregar productos al carrito', 'warning');
                setTimeout(() => {
                    window.location.href = '/auth/login?redirect=' + encodeURIComponent(window.location.pathname);
                }, 1500);
            } else {
                showNotification(data.message, 'error');
                // Rehabilitar el botón en caso de error
                enableAddToCartButton(button);
            }
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al agregar producto al carrito', 'error');
        // Rehabilitar el botón en caso de error
        enableAddToCartButton(button);
    }
}

// Nuevas funciones para manejar el estado del botón
function disableAddToCartButton(button) {
    if (!button) return;
    
    button.disabled = true;
    button.classList.add('loading');
    
    // Guardar el texto original si no está guardado
    if (!button.dataset.originalText) {
        button.dataset.originalText = button.innerHTML;
    }
    
    // Mostrar estado de carga
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Agregando...';
}

function enableAddToCartButton(button) {
    if (!button) return;
    
    button.disabled = false;
    button.classList.remove('loading');
    
    // Restaurar texto original
    if (button.dataset.originalText) {
        button.innerHTML = button.dataset.originalText;
    }
}

function showAddToCartSuccess(button) {
    if (!button) return;
    
    // Cambiar a estado de éxito
    button.innerHTML = '<i class="fas fa-check"></i> Agregado';
    button.classList.add('success');
    
    // Rehabilitar después de un tiempo
    setTimeout(() => {
        enableAddToCartButton(button);
        button.classList.remove('success');
    }, 2000); // 2 segundos de feedback visual
}

async function processCheckout() {
    if (!confirm('¿Confirmar compra?')) return;

    try {
        const response = await fetch('/orders/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const data = await response.json();

        if (data.success) {
            showNotification('¡Compra realizada exitosamente!', 'success');
            setTimeout(() => {
                window.location.href = `/orders/${data.orderId}`;
            }, 2000);
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al procesar la compra', 'error');
    }
}

async function clearCart() {
    if (!confirm('¿Estás seguro de que quieres vaciar el carrito?')) return;

    try {
        const response = await fetch('/cart/clear', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const data = await response.json();

        if (data.success) {
            showNotification('Carrito vaciado', 'success');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al vaciar el carrito', 'error');
    }
}

function updateCartCounter(count) {
    const cartCounts = document.querySelectorAll('.cart-badge, .cart-count');
    cartCounts.forEach(element => {
        element.textContent = count;
        if (count > 0) {
            element.style.display = 'flex';
        } else {
            element.style.display = 'none';
        }
    });
}

// Formularios
function handleForms() {
    // Validación de formularios
    const forms = document.querySelectorAll('form[data-validate="true"]');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!validateForm(this)) {
                e.preventDefault();
            }
        });
    });

    // Mostrar/ocultar contraseña
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            this.textContent = type === 'password' ? '👁️' : '🔒';
        });
    });
}

function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input[required]');

    inputs.forEach(input => {
        if (!input.value.trim()) {
            showInputError(input, 'Este campo es requerido');
            isValid = false;
        } else {
            clearInputError(input);
        }

        // Validación específica para email
        if (input.type === 'email' && input.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value)) {
                showInputError(input, 'Ingresa un email válido');
                isValid = false;
            }
        }

        // Validación para contraseña
        if (input.type === 'password' && input.value) {
            if (input.value.length < 6) {
                showInputError(input, 'La contraseña debe tener al menos 6 caracteres');
                isValid = false;
            }
        }
    });

    return isValid;
}

function showInputError(input, message) {
    clearInputError(input);
    input.classList.add('error');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'input-error';
    errorDiv.textContent = message;
    input.parentNode.appendChild(errorDiv);
}

function clearInputError(input) {
    input.classList.remove('error');
    const existingError = input.parentNode.querySelector('.input-error');
    if (existingError) {
        existingError.remove();
    }
}

// Tooltips
function initializeTooltips() {
    const tooltips = document.querySelectorAll('[data-tooltip]');
    
    tooltips.forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
}

function showTooltip(e) {
    const tooltipText = this.getAttribute('data-tooltip');
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = tooltipText;
    
    document.body.appendChild(tooltip);
    
    const rect = this.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 5 + 'px';
}

function hideTooltip() {
    const tooltip = document.querySelector('.tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

// Notificaciones
function showNotification(message, type = 'info') {
    // Remover notificaciones existentes
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        notification.remove();
    });

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span class="notification-message">${message}</span>
        <button class="notification-close">&times;</button>
    `;

    document.body.appendChild(notification);

    // Mostrar notificación
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    // Cerrar notificación
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        hideNotification(notification);
    });

    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
        hideNotification(notification);
    }, 5000);
}

function hideNotification(notification) {
    notification.classList.remove('show');
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 300);
}

// Utilidades
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(amount);
}

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

// Exportar a PDF (placeholder)
function exportToPDF() {
    showNotification('Funcionalidad de exportación a PDF en desarrollo', 'info');
}

// Cargar más productos (para paginación futura)
function loadMoreProducts() {
    showNotification('Cargando más productos...', 'info');
    // Implementar lógica de paginación
}

// Actualizar visibilidad del contador del carrito
function updateCartCountVisibility() {
    const cartCounts = document.querySelectorAll('.cart-count');
    cartCounts.forEach(element => {
        const count = parseInt(element.getAttribute('data-count') || element.textContent);
        if (count > 0) {
            element.style.display = 'inline';
        } else {
            element.style.display = 'none';
        }
    });
}

// Llamar al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    updateCartCountVisibility();
});