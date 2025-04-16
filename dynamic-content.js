document.addEventListener('DOMContentLoaded', function() {
    const featuredProducts = [
        {
            image: 'images/shoe1.jpg',
            title: 'High-Quality Sneaker',
            price: '$99.99'
        },
        {
            image: 'images/shoe2.jpg',
            title: 'Comfortable Boots',
            price: '$129.99'
        }
    ];

    let currentProductIndex = 0;

    function updateFeaturedProduct() {
        const productContainer = document.querySelector('.product');
        const image = productContainer.querySelector('img');
        const title = productContainer.querySelector('h3');
        const price = productContainer.querySelector('p');

        image.src = featuredProducts[currentProductIndex].image;
        title.textContent = featuredProducts[currentProductIndex].title;
        price.textContent = featuredProducts[currentProductIndex].price;

        currentProductIndex = (currentProductIndex + 1) % featuredProducts.length;
    }

    setInterval(updateFeaturedProduct, 5000); // Change every 5 seconds
});