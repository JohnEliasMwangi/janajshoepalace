document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');

    form.addEventListener('submit', function(event) {
        let isValid = true;

        // Get form fields
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;

        // Validate name
        if (name.trim() === '') {
            alert('Please enter your name.');
            isValid = false;
        }

        // Validate email
        if (email.trim() === '') {
            alert('Please enter your email.');
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            alert('Please enter a valid email address.');
            isValid = false;
        }

        // Validate message
        if (message.trim() === '') {
            alert('Please enter a message.');
            isValid = false;
        }

        // Prevent form submission if validation fails
        if (!isValid) {
            event.preventDefault();
        }
    });
});