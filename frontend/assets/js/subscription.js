function sendOTP() {
            const phone = document.getElementById('phoneNumber').value;
            const errorDiv = document.getElementById('phoneError');
            
            // Validate Robi (018, 018) or Airtel (016)
            if(phone.length === 11 && (phone.startsWith('018') || phone.startsWith('016'))) {
                errorDiv.classList.add('d-none');
                
                // Show Step 2
                document.getElementById('step1').classList.add('d-none');
                document.getElementById('step2').classList.remove('d-none');
                
                // Simulate OTP via Toast
                setTimeout(() => {
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'info',
                        title: 'আপনার OTP: 123456',
                        showConfirmButton: false,
                        timer: 5000
                    });
                }, 1000);
            } else {
                errorDiv.classList.remove('d-none');
            }
        }

        async function verifyOTP() {
            const otp = document.getElementById('otpCode').value;
            const errorDiv = document.getElementById('otpError');
            const phone = document.getElementById('phoneNumber').value;
            
            if(otp === '123456') {
                errorDiv.classList.add('d-none');

                try {
                    // Call backend to charge 4 BDT via BDApps
                    const res = await fetch('/api/v1/payment/charge-direct', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ subscriberId: 'tel:+88' + phone, amount: '5.56' })
                    });
                    const data = await res.json();

                    if(data.success) {
                        // Success Notification
                        Swal.fire({
                            html: `
                                <style>
                                    .swal-heart-icon { font-size: 5.5rem; color: #f43f5e; margin-bottom: 10px; filter: drop-shadow(0 10px 15px rgba(244, 63, 94, 0.3)); }
                                    .swal-title-text { font-size: 2.2rem; background: linear-gradient(135deg, #e11d48 0%, #f43f5e 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                                    .swal-subtitle-text { font-size: 1.25rem; }
                                    @media (max-width: 576px) {
                                        div.swal2-popup { width: 90vw !important; max-width: 320px !important; margin: 0 auto !important; padding: 1em !important; }
                                        .swal-heart-icon { font-size: 4rem; margin-bottom: 5px; }
                                        .swal-title-text { font-size: 1.8rem; }
                                        .swal-subtitle-text { font-size: 1.1rem; }
                                        .swal-rocket-text { padding: 4px 10px !important; }
                                        .swal-rocket-text p { font-size: 0.75rem !important; white-space: normal; line-height: 1.2; }
                                    }
                                </style>
                                <div class="text-center py-4" style="position: relative;">
                                    <div class="swal-heart-icon">
                                        <i class="fa-solid fa-heart fa-beat" style="--fa-animation-duration: 1.2s; --fa-beat-scale: 1.2;"></i>
                                    </div>
                                    <h2 class="fw-bolder mb-2 swal-title-text">অভিনন্দন!</h2>
                                    <p class="text-dark fw-medium mt-2 mb-3 swal-subtitle-text">আপনার প্রিমিয়াম সাবস্ক্রিপশন সফল হয়েছে (৫.৫৬ টাকা চার্জ করা হয়েছে)</p>
                                    <div class="d-inline-block px-4 py-2 rounded-pill mt-2 swal-rocket-text" style="background: rgba(16, 185, 129, 0.1); border: 1px dashed #34d399;">
                                        <p class="small fw-bold mb-0" style="color: #047857;"><i class="fa-solid fa-rocket fa-beat me-2"></i>দ্রুত অ্যাপে প্রবেশ করানো হচ্ছে...</p>
                                    </div>
                                </div>
                            `,
                            showConfirmButton: false,
                            timer: 2000,
                            width: 'auto',
                            padding: '1.5em',
                            background: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%2310b981\' fill-opacity=\'0.05\' fill-rule=\'evenodd\'/%3E%3C/svg%3E") #ffffff',
                            backdrop: `rgba(15, 23, 42, 0.9)`,
                            customClass: {
                                popup: 'rounded-4 border border-success border-opacity-25 shadow-lg'
                            }
                        }).then(() => {
                            const phoneVal = document.getElementById('phoneNumber').value || 'Unknown';
                            localStorage.setItem('hc_user_phone', phoneVal);
                            localStorage.setItem('isSubscribed', 'true');
                            window.location.replace('home.html?subscribed=true');
                        });
                    } else {
                        alert('পেমেন্ট ব্যর্থ হয়েছে। দয়া করে ব্যালেন্স চেক করে আবার চেষ্টা করুন।');
                    }
                } catch(err) {
                    console.error(err);
                    alert('সার্ভারের সাথে কানেক্ট করা যাচ্ছে না।');
                }
                
            } else {
                errorDiv.classList.remove('d-none');
            }
        }
        
        function goBack() {
            document.getElementById('step2').classList.add('d-none');
            document.getElementById('step1').classList.remove('d-none');
            document.getElementById('otpCode').value = '';
        }
