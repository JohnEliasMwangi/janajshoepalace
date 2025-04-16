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




document.addEventListener('DOMContentLoaded', function() {
    const paymentMethod = document.getElementById('payment-method');
    const cardPayment = document.getElementById('card-payment');
    const mpesaPayment = document.getElementById('mpesa-payment');

    paymentMethod.addEventListener('change', function() {
        if (this.value === 'card') {
            cardPayment.style.display = 'block';
            mpesaPayment.style.display = 'none';
        } else if (this.value === 'mpesa') {
            cardPayment.style.display = 'none';
            mpesaPayment.style.display = 'block';
        }
    });
});


document.getElementById('mpesa-button').addEventListener('click', function() {
    const phoneNumber = document.getElementById('phone-number').value;
    const amount = document.getElementById('amount').value;

    if (!phoneNumber || !amount) {
        alert('Please enter your phone number and amount.');
        return;
    }

    // Example API endpoint to handle M-Pesa STK push
    const apiUrl = 'https://your-backend-api.com/mpesa/stk-push';

    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            phoneNumber: phoneNumber,
            amount: amount
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('M-Pesa payment initiated successfully. Please complete the payment on your phone.');
        } else {
            alert('Failed to initiate M-Pesa payment. Please try again.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    });
});

const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

app.use(express.json());

app.post('/mpesa/stk-push', async (req, res) => {
    const { phoneNumber, amount } = req.body;

    const mpesaConfig = {
        BusinessShortCode: 'YOUR_SHORT_CODE',
        Password: 'YOUR_PASSWORD',
        Timestamp: 'YOUR_TIMESTAMP',
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: phoneNumber,
        PartyB: 'YOUR_SHORT_CODE',
        PhoneNumber: phoneNumber,
        CallURL: 'YOUR_CALL_URL',
        ResultURL: 'YOUR_RESULT_URL',
        AccountReference: 'YOUR_ACCOUNT_REFERENCE',
        Remarks: 'Payment for goods'
    };

    try {
        const response = await axios.post('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', mpesaConfig, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer YOUR_ACCESS_TOKEN'
            }
        });

        if (response.data.ResponseCode === '0') {
            res.json({ success: true });
        } else {
            res.json({ success: false, message: response.data.ResponseDescription });
        }
    } catch (error) {
        console.error('Error:', error);
        res.json({ success: false, message: 'Failed to initiate M-Pesa payment.' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});


const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

app.use(express.json());

app.post('/mpesa/stk-push', async (req, res) => {
    const { phoneNumber, amount } = req.body;

    const mpesaConfig = {
        BusinessShortCode: 'YOUR_SHORT_CODE',
        Password: 'YOUR_PASSWORD',
        Timestamp: 'YOUR_TIMESTAMP',
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: phoneNumber,
        PartyB: 'YOUR_SHORT_CODE',
        PhoneNumber: phoneNumber,
        CallURL: 'YOUR_CALL_URL',
        ResultURL: 'YOUR_RESULT_URL',
        AccountReference: 'YOUR_ACCOUNT_REFERENCE',
        Remarks: 'Payment for goods'
    };

    try {
        const response = await axios.post('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', mpesaConfig, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer YOUR_ACCESS_TOKEN'
            }
        });

        if (response.data.ResponseCode === '0') {
            res.json({ success: true });
        } else {
            res.json({ success: false, message: response.data.ResponseDescription });
        }
    } catch (error) {
        console.error('Error:', error);
        res.json({ success: false, message: 'Failed to initiate M-Pesa payment.' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});