document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const donationForm = document.getElementById('donation-form');
    const amountBtns = document.querySelectorAll('.amount-btn');
    const customAmountInput = document.getElementById('custom-amount');
    const successModal = document.getElementById('success-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    
    let selectedAmount = 2500; // Default amount

    // --- CMS Content Loading ---
    const loadCmsContent = async () => {
        try {
            const response = await fetch('/_data/settings.json');
            if (!response.ok) throw new Error('Could not fetch settings');
            const data = await response.json();
            
            document.getElementById('cms-headline').textContent = data.headline;
            document.getElementById('cms-subheadline').textContent = data.subheadline;
            document.getElementById('cms-donation-plea').textContent = data.donation_plea;
            document.getElementById('cms-stat1-value').textContent = data.stat1_value;
            document.getElementById('cms-stat1-label').textContent = data.stat1_label;
            document.getElementById('cms-stat2-value').textContent = data.stat2_value;
            document.getElementById('cms-stat2-label').textContent = data.stat2_label;
            document.getElementById('cms-stat3-value').textContent = data.stat3_value;
            document.getElementById('cms-stat3-label').textContent = data.stat3_label;
        } catch (error) {
            console.error("Failed to load CMS content:", error);
        }
    };

    // --- Donation Form Logic ---
    amountBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            amountBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            selectedAmount = parseInt(e.target.dataset.amount, 10);
            customAmountInput.value = '';
        });
    });

    customAmountInput.addEventListener('input', () => {
        amountBtns.forEach(b => b.classList.remove('active'));
        selectedAmount = parseInt(customAmountInput.value, 10) || 0;
    });

    donationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const finalAmount = selectedAmount * 100; // Amount in paise
        const email = document.getElementById('donor-email').value;
        const name = document.getElementById('donor-name').value;

        if (finalAmount < 100) {
            alert('Please enter a valid donation amount.');
            return;
        }

        try {
            // 1. Create a Razorpay Order from our backend
            const orderResponse = await fetch('/.netlify/functions/create-order', {
                method: 'POST',
                body: JSON.stringify({ amount: finalAmount })
            });
            const orderData = await orderResponse.json();

            // 2. Open Razorpay Checkout
            const options = {
                key: "[YOUR_RAZORPAY_KEY_ID]", // Get this from your Razorpay Dashboard
                amount: orderData.amount,
                currency: "INR",
                name: "Social Good Donations",
                description: "Donation for our cause",
                order_id: orderData.id,
                handler: async function (response) {
                    // 3. Verify the payment on our backend
                    const verifyResponse = await fetch('/.netlify/functions/verify-payment', {
                        method: 'POST',
                        body: JSON.stringify(response)
                    });

                    if (verifyResponse.ok) {
                        // 4. If verified, trigger the thank-you email function
                        await fetch('/.netlify/functions/send-thank-you', {
                            method: 'POST',
                            body: JSON.stringify({ name, email, amount: finalAmount })
                        });
                        
                        // 5. Show success message
                        successModal.style.display = 'flex';
                    } else {
                        alert('Payment verification failed. Please contact support.');
                    }
                },
                prefill: { name, email },
                theme: { color: "#0d6efd" }
            };
            const rzp = new Razorpay(options);
            rzp.open();

        } catch (error) {
            console.error('Donation process failed:', error);
            alert('Something went wrong. Please try again.');
        }
    });
    
    closeModalBtn.addEventListener('click', () => {
        successModal.style.display = 'none';
    });
    
    // --- Initialize ---
    loadCmsContent();
});