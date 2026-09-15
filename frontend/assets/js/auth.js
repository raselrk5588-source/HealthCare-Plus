// BDApps Auth Check
let isSubscribed = false;

// 1. Check URL Params (Fallback for local file:// testing)
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('subscribed') === 'true') {
    isSubscribed = true;
    try { 
        localStorage.setItem('isSubscribed', 'true'); 
        sessionStorage.setItem('isSubscribed', 'true'); 
    } catch(e) {}
}

// 2. Check Storage
try {
    if (localStorage.getItem('isSubscribed') === 'true' || sessionStorage.getItem('isSubscribed') === 'true') {
        isSubscribed = true;
    }
} catch(e) {}

// 3. Redirect if not subscribed
if (!isSubscribed && window.location.pathname.indexOf('index.html') === -1 && window.location.pathname.indexOf('subscribe.html') === -1) {
    window.location.replace('index.html');
}

// 4. Propagate state across links if running locally
if (isSubscribed) {
    document.addEventListener('DOMContentLoaded', () => {
        const links = document.querySelectorAll('a');
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.endsWith('.html') && !href.startsWith('http')) {
                link.setAttribute('href', href + '?subscribed=true');
            }
        });
    });
}

// Global Unsubscribe function
window.unsubscribeUser = function() {
    const showSwal = () => {
        Swal.fire({
            title: 'আপনি কি নিশ্চিত?',
            text: 'আনসাবস্ক্রাইব করলে আপনি আর প্রিমিয়াম ফিচারগুলো ব্যবহার করতে পারবেন না।',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#e0e0e0',
            confirmButtonText: 'হ্যাঁ, আনসাবস্ক্রাইব করুন',
            cancelButtonText: 'বাতিল',
            customClass: {
                popup: 'glass-popup-swal',
                confirmButton: 'btn btn-danger rounded-pill px-4 shadow me-2',
                cancelButton: 'btn btn-secondary rounded-pill px-4 shadow'
            },
            buttonsStyling: false
        }).then((result) => {
            if (result.isConfirmed) {
                try {
                    localStorage.removeItem('isSubscribed');
                    localStorage.removeItem('hc_user_phone');
                    sessionStorage.removeItem('isSubscribed');
                } catch(e) {}
                window.location.replace('index.html');
            }
        });
    };

    if (typeof Swal !== 'undefined') {
        showSwal();
    } else {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
        script.onload = showSwal;
        document.body.appendChild(script);
    }
};

// Close mobile navbar when clicking outside
document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('click', function(event) {
        const navbar = document.getElementById('navbarNav');
        const toggler = document.querySelector('.navbar-toggler');
        
        if (navbar && navbar.classList.contains('show')) {
            // If click is outside the navbar and outside the toggler button
            if (!navbar.contains(event.target) && toggler && !toggler.contains(event.target)) {
                if (typeof bootstrap !== 'undefined') {
                    const bsCollapse = bootstrap.Collapse.getInstance(navbar) || new bootstrap.Collapse(navbar, { toggle: false });
                    bsCollapse.hide();
                } else {
                    navbar.classList.remove('show');
                }
            }
        }
    });
});
