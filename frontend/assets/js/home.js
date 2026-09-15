document.addEventListener('DOMContentLoaded', () => {
    // Initialize AOS Safely
    if (typeof AOS !== 'undefined') {
        try {
            AOS.init({
                duration: 800,
                once: true,
                offset: 80
            });
        } catch(e) {}
    }
    
    // Set Year Safely
    try {
        const yearEl = document.getElementById('year');
        if (yearEl) yearEl.textContent = new Date().getFullYear();
    } catch(e) {}
    
    // Set Date in Bengali Safely
    try {
        const dateEl = document.getElementById('currentDate');
        if (dateEl) {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            dateEl.textContent = new Date().toLocaleDateString('bn-BD', options);
        }
    } catch(e) {}

    // Scroll to top button
    window.addEventListener('scroll', () => {
        const btn = document.getElementById('scrollTopBtn');
        if (btn) {
            if (window.scrollY > 400) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }
        }
    });

    // Navbar background on scroll
    window.addEventListener('scroll', () => {
        const nav = document.querySelector('.glass-nav');
        if (nav) {
            if (window.scrollY > 100) {
                nav.style.background = 'rgba(255, 255, 255, 0.95)';
                nav.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.1)';
            } else {
                nav.style.background = 'rgba(255, 255, 255, 0.72)';
                nav.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.05)';
            }
        }
    });

    // ==========================================
    // Live Search Logic for Home Page
    // ==========================================
    const searchForm = document.getElementById('globalSearchForm');
    const searchInput = document.getElementById('globalSearchInput');
    const searchDropdown = document.getElementById('searchResultsDropdown');
    const searchContent = document.getElementById('searchResultsContent');
    const searchLoading = document.getElementById('searchLoading');
    let searchTimeout = null;

    if (searchInput && searchDropdown && searchForm) {
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchForm.contains(e.target) && !searchDropdown.contains(e.target)) {
                searchDropdown.classList.add('d-none');
            }
        });

        // Reopen if focused and has value
        searchInput.addEventListener('focus', () => {
            if (searchInput.value.trim().length > 0 && searchContent.innerHTML !== '') {
                searchDropdown.classList.remove('d-none');
            }
        });

        const performSearch = async (query) => {
            if (query.length === 0) {
                searchDropdown.classList.add('d-none');
                return;
            }

            searchDropdown.classList.remove('d-none');
            searchContent.innerHTML = '';
            searchLoading.style.display = 'block';

            try {
                const response = await fetch('/api/v1/cms/data');
                if (!response.ok) throw new Error('API Error');
                const data = await response.json();
                
                let resultsHTML = '';
                let matchCount = 0;

                // Helper to render items
                const renderItem = (title, subtitle, icon, color, link) => {
                    matchCount++;
                    return `
                        <a href="${link}" class="search-result-item">
                            <div class="search-result-icon bg-${color} bg-opacity-10 text-${color}">
                                <i class="fa-solid ${icon}"></i>
                            </div>
                            <div>
                                <div class="search-result-title">${title}</div>
                                <div class="search-result-category">${subtitle}</div>
                            </div>
                        </a>
                    `;
                };

                // Search Hospitals
                if(data.hospitals) {
                    data.hospitals.filter(h => (h.name && h.name.toLowerCase().includes(query)) || (h.address && h.address.toLowerCase().includes(query))).slice(0, 3).forEach(item => {
                        resultsHTML += renderItem(item.name, 'হাসপাতাল • ' + item.district, 'fa-hospital', 'primary', 'hospitals.html');
                    });
                }
                
                // Search Pharmacies
                if(data.pharmacies) {
                    data.pharmacies.filter(p => (p.name && p.name.toLowerCase().includes(query))).slice(0, 2).forEach(item => {
                        resultsHTML += renderItem(item.name, 'ফার্মেসি • ' + item.district, 'fa-pills', 'success', 'pharmacies.html');
                    });
                }

                // Search Diseases
                if(data.diseases) {
                    data.diseases.filter(d => (d.name && d.name.toLowerCase().includes(query)) || (d.overview && d.overview.toLowerCase().includes(query))).slice(0, 3).forEach(item => {
                        resultsHTML += renderItem(item.name, 'রোগব্যাধি', 'fa-viruses', 'danger', 'diseases.html');
                    });
                }
                
                // Search Ambulances
                if(data.ambulances) {
                    data.ambulances.filter(a => (a.name && a.name.toLowerCase().includes(query))).slice(0, 2).forEach(item => {
                        resultsHTML += renderItem(item.name, 'অ্যাম্বুলেন্স • ' + item.district, 'fa-truck-medical', 'info', 'ambulances.html');
                    });
                }
                
                // Search Blood Banks
                if(data.bloodBanks) {
                    data.bloodBanks.filter(b => (b.name && b.name.toLowerCase().includes(query))).slice(0, 2).forEach(item => {
                        resultsHTML += renderItem(item.name, 'ব্লাড ব্যাংক • ' + item.district, 'fa-droplet', 'danger', 'blood_banks.html');
                    });
                }

                searchLoading.style.display = 'none';
                
                if (matchCount === 0) {
                    searchContent.innerHTML = '<div class="p-4 text-center text-muted"><i class="fa-solid fa-box-open fa-2x mb-2" style="color: #cbd5e1;"></i><br>কোনো ফলাফল পাওয়া যায়নি</div>';
                } else {
                    searchContent.innerHTML = resultsHTML;
                }

            } catch (error) {
                console.error("Search Error:", error);
                searchLoading.style.display = 'none';
                searchContent.innerHTML = '<div class="p-3 text-center text-danger">ডেটা লোড করতে সমস্যা হয়েছে!</div>';
            }
        };

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim().toLowerCase();
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                performSearch(query);
            }, 400); // 400ms debounce
        });

        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = searchInput.value.trim().toLowerCase();
            clearTimeout(searchTimeout);
            performSearch(query);
        });
    }

});
