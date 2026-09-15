// Assets/js/app_data.js - Dynamic Data Fetcher

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Fetch CMS data from local backend
        const response = await fetch('/api/v1/cms/data');
        if (!response.ok) throw new Error('Failed to fetch CMS data');
        
        window.healthcareData = await response.json();
    } catch (err) {
        console.error('Error loading dynamic data, falling back to empty:', err);
        window.healthcareData = {
            districts: [], hospitals: [], pharmacies: [], bloodBanks: [], ambulances: [], diseases: [], homeCare: [], nutrition: {}
        };
    }

    // Start Rendering logic originally from mock_data.js
    function renderDirectoryList(listId, dataArray, iconType, colorClass) {
        const list = document.getElementById(listId);
        if (!list) return;

        let visibleCount = 10;
        let currentFilter = 'all';
        let currentDistrictFilter = 'all';
        let currentSearch = '';

        function updateView() {
            let filtered = dataArray || [];
            if (listId === 'doctorList') {
                if (currentFilter !== 'all') {
                    filtered = filtered.filter(i => i.specialty === currentFilter);
                }
                if (currentDistrictFilter !== 'all') {
                    filtered = filtered.filter(i => i.district === currentDistrictFilter);
                }
            } else {
                if (currentFilter !== 'all') {
                    filtered = filtered.filter(i => i.district === currentFilter);
                }
            }
            if (currentSearch) {
                filtered = filtered.filter(i => 
                    (i.name && i.name.toLowerCase().includes(currentSearch)) || 
                    (i.address && i.address.toLowerCase().includes(currentSearch)) || 
                    (i.specialty && i.specialty.toLowerCase().includes(currentSearch)) ||
                    (i.district && i.district.toLowerCase().includes(currentSearch)) ||
                    (i.hospital && i.hospital.toLowerCase().includes(currentSearch)) ||
                    (i.institute && i.institute.toLowerCase().includes(currentSearch))
                );
            }

            let displayData = filtered.slice(0, visibleCount);

            if (displayData.length === 0) {
                list.innerHTML = '<div class="col-12 text-center text-muted"><p>কোনো তথ্য পাওয়া যায়নি</p></div>';
                return;
            }

            let html = '';
            displayData.forEach(item => {
                const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name + ' ' + item.district + ' Bangladesh')}`;
                const locText = item.address || item.hospital || '';
                
                html += `
                <div class="col-md-6 col-lg-4 directory-item" data-district="${item.district}">
                    <a href="${mapLink}" target="_blank" class="text-decoration-none h-100 d-block">
                        <div class="card glass-card border-0 h-100 p-3 card-shine" style="color: inherit;">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <div class="d-flex align-items-center gap-2">
                                    ${item.photo ? `<img src="${item.photo}" alt="Doctor" style="width: 45px; height: 45px; object-fit: cover; border-radius: 50%; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">` : ''}
                                    <div>
                                        <h6 class="fw-bold mb-0 text-${colorClass}">${item.name}</h6>
                                        ${item.degree ? `<small class="text-muted d-block" style="font-size: 0.8rem; margin-top: 2px;">${item.degree}</small>` : ''}
                                        ${item.institute ? `<small class="text-secondary d-block" style="font-size: 0.75rem;"><i class="fa-solid fa-graduation-cap me-1"></i>${item.institute}</small>` : ''}
                                    </div>
                                </div>
                                <span class="badge bg-light text-dark border">${item.district}</span>
                            </div>
                            ${locText ? `<p class="text-muted small mb-2"><i class="fa-solid fa-location-dot me-1"></i> ${locText}</p>` : ''}
                            <div class="d-flex justify-content-between text-muted small mt-auto pt-2 border-top flex-wrap gap-2">
                                ${item.specialty ? `<span><i class="fa-solid fa-stethoscope me-1 text-primary"></i> ${item.specialty}</span>` : ''}
                                ${item.phone ? `<span><i class="fa-solid fa-phone me-1"></i> ${item.phone}</span>` : ''}
                                ${item.hours ? `<span><i class="fa-regular fa-clock me-1"></i> ${item.hours}</span>` : ''}
                                ${item.visitingHours ? `<span><i class="fa-regular fa-clock me-1 text-warning"></i> ${item.visitingHours}</span>` : ''}
                                ${item.fee ? `<span><i class="fa-solid fa-money-bill me-1 text-success"></i> ${item.fee}</span>` : ''}
                                ${item.type ? `<span><i class="fa-solid fa-truck-medical me-1"></i> ${item.type}</span>` : ''}
                                ${item.depts ? `<span><i class="fa-solid fa-building me-1"></i> ${item.depts}</span>` : ''}
                            </div>
                            ${listId === 'doctorList' ? `
                            <div class="mt-3">
                                <button class="btn btn-sm btn-success w-100 rounded-pill shadow-sm" onclick="event.preventDefault(); window.bookDoctor('${item.name}', '${item.fee ? item.fee.replace(/[^0-9]/g, '') : '500'}')">
                                    <i class="fa-solid fa-calendar-check me-1"></i> বুকিং করুন (bKash)
                                </button>
                            </div>
                            ` : ''}
                        </div>
                    </a>
                </div>`;
            });

            if (filtered.length > visibleCount) {
                html += `<div class="col-12 text-center mt-3"><button id="loadMoreBtn" class="btn btn-outline-${colorClass} rounded-pill px-4">আরও দেখুন <i class="fa-solid fa-chevron-down ms-1"></i></button></div>`;
            }
            list.innerHTML = html;

            const loadMoreBtn = document.getElementById('loadMoreBtn');
            if (loadMoreBtn) {
                loadMoreBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    visibleCount += 10;
                    updateView();
                });
            }
        }

        updateView();

        const districtSelect = document.getElementById('districtSelect');
        const districtFilter = document.getElementById('districtFilter');
        const searchInput = document.getElementById('searchInput');

        if (districtSelect) {
            let options = '<option value="all">সব জেলা</option>';
            if (listId === 'doctorList') {
                options = '<option value="all">সব বিভাগ (Department)</option>';
                const specialties = [...new Set(dataArray.map(d => d.specialty).filter(Boolean))];
                specialties.forEach(s => {
                    options += `<option value="${s}">${s}</option>`;
                });
            } else {
                window.healthcareData.districts.forEach(d => {
                    options += `<option value="${d}">${d}</option>`;
                });
            }
            districtSelect.innerHTML = options;

            districtSelect.addEventListener('change', (e) => {
                currentFilter = e.target.value;
                visibleCount = 10;
                updateView();
            });
        }

        if (districtFilter && listId === 'doctorList') {
            let distOptions = '<option value="all">সব জেলা</option>';
            window.healthcareData.districts.forEach(d => {
                distOptions += `<option value="${d}">${d}</option>`;
            });
            districtFilter.innerHTML = distOptions;
            
            districtFilter.addEventListener('change', (e) => {
                currentDistrictFilter = e.target.value;
                visibleCount = 10;
                updateView();
            });
        }

        if (searchInput) {
            // Live search on type
            searchInput.addEventListener('input', (e) => {
                currentSearch = e.target.value.toLowerCase();
                visibleCount = 10;
                updateView();
            });

            // Search on button click
            const searchBtn = searchInput.nextElementSibling;
            if (searchBtn && searchBtn.tagName === 'BUTTON') {
                searchBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    currentSearch = searchInput.value.toLowerCase();
                    visibleCount = 10;
                    updateView();
                });
            }
        }
    }

    // Global function to handle Doctor Booking via BDApps bKash
    window.bookDoctor = function(doctorName, feeAmount) {
        if (!feeAmount || feeAmount === '0') feeAmount = 500; // default fee
        
        document.getElementById('modalDoctorName').innerText = doctorName;
        document.getElementById('modalDoctorFee').innerText = feeAmount;
        document.getElementById('bookingDoctorName').value = doctorName;
        document.getElementById('bookingFeeAmount').value = feeAmount;
        
        const modal = new bootstrap.Modal(document.getElementById('doctorBookingModal'));
        modal.show();
    };

    const bookingForm = document.getElementById('doctorBookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const doctorName = document.getElementById('bookingDoctorName').value;
            const feeAmount = document.getElementById('bookingFeeAmount').value;
            const patientName = document.getElementById('patientName').value;
            const patientAge = document.getElementById('patientAge').value;
            const patientPhone = document.getElementById('patientPhone').value;
            
            const submitBtn = bookingForm.querySelector('button[type="submit"]');
            const originalBtnHtml = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-1"></i> প্রসেস হচ্ছে...';
            submitBtn.disabled = true;

            try {
                // Hit the official bKash Create Payment endpoint
                const res = await fetch('/api/v1/payment/bkash/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ doctorName, feeAmount, patientName, patientAge, patientPhone })
                });
                const data = await res.json();
                
                if (data.success && data.paymentUrl) {
                    window.location.href = data.paymentUrl;
                } else {
                    alert('পেমেন্ট শুরু করতে সমস্যা হয়েছে: ' + (data.message || 'জানা নেই'));
                    submitBtn.innerHTML = originalBtnHtml;
                    submitBtn.disabled = false;
                }
            } catch (error) {
                console.error('Booking Error:', error);
                alert('সার্ভারের সাথে কানেক্ট করা যাচ্ছে না।');
                submitBtn.innerHTML = originalBtnHtml;
                submitBtn.disabled = false;
            }
        });
    }

    renderDirectoryList('hospitalList', window.healthcareData.hospitals, 'fa-hospital', 'primary');
    renderDirectoryList('pharmacyList', window.healthcareData.pharmacies, 'fa-pills', 'success');
    renderDirectoryList('bloodBankList', window.healthcareData.bloodBanks, 'fa-droplet', 'danger');
    renderDirectoryList('ambulanceList', window.healthcareData.ambulances, 'fa-truck-medical', 'info');
    renderDirectoryList('doctorList', window.healthcareData.doctors, 'fa-user-doctor', 'primary');


    // Diseases
    window.currentDiseaseFilter = '';
    window.currentDiseaseLimit = 6;
    window.renderDiseases = function() {
        const list = document.getElementById('diseaseList');
        if(!list || !window.healthcareData.diseases) return;
        
        let filtered = window.healthcareData.diseases;
        if(window.currentDiseaseFilter) {
            filtered = filtered.filter(d => (d.name && d.name.toLowerCase().includes(window.currentDiseaseFilter)) || (d.overview && d.overview.toLowerCase().includes(window.currentDiseaseFilter)));
        }
        
        let displayData = filtered.slice(0, window.currentDiseaseLimit);
        
        if (displayData.length === 0) {
            list.innerHTML = '<div class="col-12 text-center text-muted"><p>কোনো তথ্য পাওয়া যায়নি</p></div>';
            return;
        }

        let html = '';
        displayData.forEach(d => {
            const icon = d.icon || 'fa-notes-medical';
            const color = d.color || 'primary';
            html += `
            <div class="col-md-6 col-lg-4" data-aos="fade-up">
                <div class="card glass-card h-100 p-4 card-shine border-0 shadow-sm">
                    <div class="d-flex align-items-center mb-3">
                        <div class="icon-box bg-${color} bg-opacity-10 text-${color} rounded-circle p-3 me-3">
                            <i class="fa-solid ${icon} fa-xl"></i>
                        </div>
                        <h5 class="fw-bold mb-0">${d.name}</h5>
                    </div>
                    <p class="text-muted small fw-bold mb-2">${d.overview}</p>
                    <p class="small text-muted mb-3">${d.details}</p>
                    <div class="mt-auto pt-3 border-top">
                        <h6 class="small fw-bold text-success mb-2"><i class="fa-solid fa-utensils me-1"></i> খাদ্যতালিকায় যা রাখবেন:</h6>
                        <p class="small text-muted mb-0">${d.dietInfo}</p>
                    </div>
                </div>
            </div>`;
        });
        
        if(filtered.length > window.currentDiseaseLimit) {
             html += `<div class="col-12 text-center mt-3"><button onclick="window.currentDiseaseLimit += 6; window.renderDiseases();" class="btn btn-outline-primary rounded-pill px-4">আরও দেখুন <i class="fa-solid fa-chevron-down ms-1"></i></button></div>`;
        }
        list.innerHTML = html;
    };

    // Home Care
    window.renderHomeCare = function() {
        const list = document.getElementById('homeCareList');
        if(!list || !window.healthcareData.homeCare) return;
        
        let html = '';
        window.healthcareData.homeCare.forEach(h => {
            const icon = h.icon || 'fa-house-medical';
            const color = h.color || 'success';
            html += `
            <div class="col-md-6 col-lg-4" data-aos="fade-up">
                <div class="card glass-card h-100 p-4 card-shine border-0 shadow-sm" style="border-left: 4px solid var(--bs-${color}) !important;">
                    <div class="d-flex mb-3">
                        <i class="fa-solid ${icon} text-${color} fa-2x me-3"></i>
                        <h5 class="fw-bold mb-0 align-self-center">${h.title}</h5>
                    </div>
                    <p class="text-muted small mb-0">${h.desc}</p>
                </div>
            </div>`;
        });
        list.innerHTML = html;
    };

    // Nutrition
    window.renderNutrition = function() {
        if(!window.healthcareData.nutrition || !window.healthcareData.nutrition.length) return;
        
        const renderSection = (category, containerId) => {
            const list = document.getElementById(containerId);
            if(!list) return;

            const categoryData = window.healthcareData.nutrition.find(n => n.category === category);
            if(!categoryData || !categoryData.items) return;

            let html = '';
            categoryData.items.forEach(n => {
                const icon = n.icon || 'fa-apple-whole';
                const color = n.color || 'primary';
                html += `
                <div class="col-md-6 col-lg-4" data-aos="fade-up">
                    <div class="card glass-card h-100 p-4 border-0 shadow-sm">
                        <h5 class="fw-bold mb-3 d-flex align-items-center">
                            <i class="fa-solid ${icon} text-${color} me-2"></i> ${n.name}
                        </h5>
                        <p class="small text-muted mb-0">${n.desc}</p>
                    </div>
                </div>`;
            });
            list.innerHTML = html;
        };
        
        renderSection('fruits', 'nutritionFruits');
        renderSection('vegetables', 'nutritionVeg');
        renderSection('proteins', 'nutritionProteins');
        renderSection('dairy', 'nutritionDairy');
    };

    // Call them all
    if (document.getElementById('diseaseList')) window.renderDiseases();
    if (document.getElementById('homeCareList')) window.renderHomeCare();
    if (document.getElementById('nutritionFruits')) window.renderNutrition();

});
