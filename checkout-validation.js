document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('checkout-form');

    form.addEventListener('submit', function(event) {
        let isValid = true;

        // Get form fields
        const firstName = document.getElementById('first-name').value;
        const lastName = document.getElementById('last-name').value;
        const address = document.getElementById('address').value;
        const city = document.getElementById('city').value;
        const state = document.getElementById('state').value;
        const zip = document.getElementById('zip').value;
        const cardNumber = document.getElementById('card-number').value;
        const expiryDate = document.getElementById('expiry-date').value;
        const cvv = document.getElementById('cvv').value;

        // Validate first name
        if (firstName.trim() === '') {
            alert('Please enter your first name.');
            isValid = false;
        }

        // Validate last name
        if (lastName.trim() === '') {
            alert('Please enter your last name.');
            isValid = false;
        }

        // Validate address
        if (address.trim() === '') {
            alert('Please enter your address.');
            isValid = false;
        }

        // Validate city
        if (city.trim() === '') {
            alert('Please enter your city.');
            isValid = false;
        }

        // Validate state
        if (state.trim() === '') {
            alert('Please enter your state.');
            isValid = false;
        }

        // Validate ZIP code
        if (zip.trim() === '') {
            alert('Please enter your ZIP code.');
            isValid = false;
        }

        // Validate card number
        if (cardNumber.trim() === '') {
            alert('Please enter your card number.');
            isValid = false;
        }

        // Validate expiry date
        if (expiryDate.trim() === '') {
            alert('Please enter your card expiry date.');
            isValid = false;
        }

        // Validate CVV
        if (cvv.trim() === '') {
            alert('Please enter your CVV.');
            isValid = false;
        }

        // Prevent form submission if validation fails
        if (!isValid) {
            event.preventDefault();
        }
    });
});


        // Get query parameters
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('productId');
        const productName = urlParams.get('productName');
        const productPrice = urlParams.get('productPrice');

        // Display order summary
        const orderSummary = document.getElementById('order-summary');
        orderSummary.innerHTML = `
            <strong>Product ID:</strong> ${productId}<br>
            <strong>Product Name:</strong> ${productName}<br>
            <strong>Price:</strong> $${productPrice}
        `;

        // Pre-fill amount for M-Pesa payment
        document.getElementById('amount').value = productPrice;

        // Toggle payment sections
        document.getElementById('payment-method').addEventListener('change', function() {
            if (this.value === 'card') {
                document.getElementById('card-payment').style.display = 'block';
                document.getElementById('mpesa-payment').style.display = 'none';
            } else if (this.value === 'mpesa') {
                document.getElementById('card-payment').style.display = 'none';
                document.getElementById('mpesa-payment').style.display = 'block';
            }
        });