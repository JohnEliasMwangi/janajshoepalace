document.addEventListener('DOMContentLoaded', function() {
    const buyButtons = document.querySelectorAll('.product button');

    buyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const product = this.closest('.product');
            const title = product.querySelector('h3').textContent;
            alert(`You have added ${title} to your cart!`);
        });
    });
});

function addToCart(productId, productName, productPrice) {
    // Redirect to checkout page with product details as query parameters
    window.location.href = `checkout.html?productId=${productId}&productName=${encodeURIComponent(productName)}&productPrice=${productPrice}`;
}