// Funcionalidades específicas del carrito
document.addEventListener('DOMContentLoaded', function() {
    initializeCartFunctionality();
});

function initializeCartFunctionality() {
    // Botones de cantidad
    document.querySelectorAll('.quantity-btn').forEach(button => {
        button.addEventListener('click', handleQuantityChange);
    });

    // Inputs de cantidad
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', handleQuantityInput);
    });

    // Eliminar items
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', handleRemoveItem);
    });
}

async function handleQuantityChange(e) {
    const button = e.target;
    const productId = button.dataset.productId;
    const input = button.parentElement.querySelector('.quantity-input');
    let quantity = parseInt(input.value);

    if (button.classList.contains('plus')) {
        quantity++;
    } else if (button.classList.contains('minus')) {
        quantity = Math.max(1, quantity - 1);
    }

    await updateCartQuantity(productId, quantity);
}

async function handleQuantityInput(e) {
    const input = e.target;
    const productId = input.dataset.productId;
    let quantity = parseInt(input.value);

    if (isNaN(quantity) || quantity < 1) {
        quantity = 1;
        input.value = 1;
    }

    await updateCartQuantity(productId, quantity);
}

async function handleRemoveItem(e) {
    const button = e.target;
    const productId = button.dataset.productId;
    const productName = button.dataset.productName;

    if (confirm(`¿Estás seguro de que quieres eliminar "${productName}" del carrito?`)) {
        await removeFromCart(productId);
    }
}

async function updateCartQuantity(productId, quantity) {
    try {
        const response = await fetch('/cart/update', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                productId: parseInt(productId),
                quantity: quantity
            })
        });

        const data = await response.json();

        if (data.success) {
            // Recargar para actualizar totales
            window.location.reload();
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al actualizar cantidad', 'error');
    }
}

async function removeFromCart(productId) {
    try {
        const response = await fetch('/cart/remove', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                productId: parseInt(productId)
            })
        });

        const data = await response.json();

        if (data.success) {
            showNotification('Producto eliminado del carrito', 'success');
            // Recargar para actualizar la vista
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al eliminar producto', 'error');
    }
}

// Actualizar contador del carrito en tiempo real
function updateCartCounter() {
    fetch('/cart/count')
        .then(response => response.json())
        .then(data => {
            const counter = document.querySelector('.cart-count');
            if (counter && data.count !== undefined) {
                counter.textContent = data.count;
                counter.style.display = data.count > 0 ? 'inline' : 'none';
            }
        })
        .catch(error => console.error('Error updating cart counter:', error));
}