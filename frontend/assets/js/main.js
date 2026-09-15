// assets/js/main.js — HealthCare Plus Entry Point
// This file is loaded by index.html and provides site-wide helpers and Medication Notifications.

document.addEventListener('DOMContentLoaded', function () {
    // ─── Smooth Scroll for all anchor links ───
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ─── Scroll reveal (for elements with class 'reveal-up') ───
    function revealOnScroll() {
        const reveals = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-scale');
        reveals.forEach(function(el) {
            const windowHeight = window.innerHeight;
            const elementTop = el.getBoundingClientRect().top;
            if (elementTop < windowHeight - 80) {
                el.classList.add('revealed');
            }
        });
    }
    
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Initial check

    // ─── Global Notification System (Medication Reminders) ───
    initNotificationSystem();

    // ─── Mobile Navbar Scroll Lock ───
    document.querySelectorAll('.navbar-collapse').forEach(function(collapseEl) {
        collapseEl.addEventListener('show.bs.collapse', function () {
            document.body.style.overflow = 'hidden';
        });
        collapseEl.addEventListener('hidden.bs.collapse', function () {
            document.body.style.overflow = '';
        });
    });
});

function initNotificationSystem() {
    // Inject Toast Container into DOM
    const toastContainerHTML = `
        <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 1080;">
            <div id="medToast" class="toast glass-card border-0 shadow-lg" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header border-0 bg-transparent text-white" style="background: linear-gradient(135deg, var(--primary), var(--info)) !important; border-radius: var(--radius-md) var(--radius-md) 0 0;">
                    <i class="fa-solid fa-bell me-2"></i>
                    <strong class="me-auto">মেডিকেশন রিমাইন্ডার</strong>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
                <div class="toast-body fw-bold" id="medToastBody" style="font-size: 1.1rem; color: var(--text-dark);">
                    <!-- Message goes here -->
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', toastContainerHTML);

    // Check for newly scanned prescriptions
    try {
        if (localStorage.getItem('hc_new_meds') === 'true') {
            localStorage.removeItem('hc_new_meds');
            setTimeout(() => {
                showToast('✅ নতুন প্রেসক্রিপশন স্ক্যান করা হয়েছে! আপনার ওষুধের রুটিন আপডেট করা হয়েছে।');
            }, 1500);
        }
    } catch(e) {}

    // Simulate an automatic medication reminder every 60 seconds (for demo purposes)
    setInterval(() => {
        try {
            const data = JSON.parse(localStorage.getItem('hc_scanned_data')) || [];
            // Find if there is any prescription data
            const rxData = data.find(item => item.type === 'prescription');
            if (rxData && rxData.meds && rxData.meds.length > 0) {
                // Pick a random medicine from the user's actual prescription to remind them
                const randomMed = rxData.meds[Math.floor(Math.random() * rxData.meds.length)];
                const timeNow = new Date().toLocaleTimeString('bn-BD', { hour: 'numeric', minute: 'numeric' });
                showToast(`⏰ এখন ${timeNow} বাজে। আপনার <b>${randomMed.name}</b> ওষুধটি খাওয়ার সময় হয়েছে! (${randomMed.time})`);
            }
        } catch(e) {}
    }, 60000); // 60 seconds
}

function showToast(message) {
    const toastEl = document.getElementById('medToast');
    if(toastEl) {
        document.getElementById('medToastBody').innerHTML = message;
        // Make sure Bootstrap is loaded
        if (typeof bootstrap !== 'undefined') {
            const toast = new bootstrap.Toast(toastEl, { autohide: true, delay: 6000 });
            toast.show();
        }
    }
}
