AOS.init({duration: 800, once: true});

    async function loadDashboardData() {
        const phone = localStorage.getItem('hc_user_phone') || 'anonymous';
        let data = []; 
        try { 
            const res = await fetch(`/api/v1/documents/${phone}`);
            const resData = await res.json();
            if (res.ok && resData.success) {
                data = resData.data;
            }
        } catch(e) { console.error(e); }
        
        const foodContainer = document.getElementById('foodContainer');
        foodContainer.innerHTML = '';

        // Removed demo data generation so that empty state shows correctly when cleared
        
        // Show dashboard content area
        document.getElementById('dashboardContent').classList.remove('d-none');
        
        let hasFood = false;
        let hasDoc = false;
        const docContainer = document.getElementById('docContainer');
        if (docContainer) docContainer.innerHTML = '';

        // Sort data by newest first
        data.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt) : new Date(a._id);
            const dateB = b.createdAt ? new Date(b.createdAt) : new Date(b._id);
            return dateB - dateA;
        });

        data.forEach(item => {
            // Render Food
            if (item.type === 'food' && !hasFood) {
                hasFood = true;
                foodContainer.innerHTML += `
                    <div class="d-flex justify-content-between align-items-center p-3 mb-2 rounded shadow-sm" style="background: rgba(40,167,69,0.05); border-left: 4px solid var(--success);">
                        <div>
                            <h6 class="fw-bold mb-1">${item.foodName || 'খাবার'}</h6>
                            <small class="text-muted">${item.date}</small>
                        </div>
                        <div class="text-end">
                            <span class="badge bg-success fs-6">${item.calories || 0} Kcal</span>
                        </div>
                    </div>
                `;
            }
            
            // Render Documents
            if ((item.type === 'report' || item.type === 'prescription') && docContainer) {
                hasDoc = true;
                const isPdf = item.image && item.image.startsWith('data:application/pdf');
                const previewHTML = isPdf 
                    ? `<div class="d-flex align-items-center justify-content-center bg-light border-bottom" style="height:100px;"><i class="fa-solid fa-file-pdf text-danger" style="font-size: 3rem;"></i></div>`
                    : `<img src="${item.image}" class="card-img-top" style="height:100px; object-fit:cover;" alt="Document">`;
                    
                docContainer.innerHTML += `
                    <div class="col-6 col-md-4 col-lg-3">
                        <div class="card border-0 shadow-sm h-100" style="border-radius:15px; overflow:hidden;">
                            ${previewHTML}
                            <div class="card-body p-2 text-center">
                                <span class="badge ${item.type === 'report' ? 'bg-danger' : 'bg-primary'} mb-1" style="font-size:0.7rem;">${item.type === 'report' ? 'রিপোর্ট' : 'প্রেসক্রিপশন'}</span>
                                <small class="d-block text-muted" style="font-size:0.75rem;">${item.date}</small>
                            </div>
                        </div>
                    </div>
                `;
            }
        });

        if(!hasFood) foodContainer.innerHTML = '<p class="text-muted">কোনো খাবারের স্ক্যান নেই।</p>';
        if(!hasDoc && docContainer) docContainer.innerHTML = '<div class="col-12"><p class="text-muted">কোনো স্ক্যান করা রিপোর্ট বা প্রেসক্রিপশন নেই।</p></div>';
    }

    async function loadMedicineRoutine() {
        const medsContainer = document.getElementById('medsContainer');
        medsContainer.innerHTML = '';
        
        const phone = localStorage.getItem('hc_user_phone') || 'anonymous';
        let meds = [];
        try {
            const res = await fetch(`/api/v1/dashboard/${phone}`);
            const resData = await res.json();
            if (res.ok && resData.success && resData.data.medicines) {
                meds = resData.data.medicines;
            }
        } catch(e) { console.error(e); }
        
        if (meds.length === 0) {
            medsContainer.innerHTML = '<p class="text-muted">আপনার কোনো ঔষধের রুটিন যুক্ত করা নেই।</p>';
            return;
        }

        meds.forEach(med => {
            const timingBadge = med.timing ? `<span class="badge bg-info text-dark ms-1">${med.timing}</span>` : '';
            medsContainer.innerHTML += `
                <div class="d-flex justify-content-between align-items-center p-3 mb-2 rounded shadow-sm" style="background: rgba(0,102,255,0.05); border-left: 4px solid var(--primary);">
                    <div>
                        <h6 class="fw-bold mb-1">${med.name}</h6>
                        <small class="text-muted"><i class="fa-solid fa-clock me-1"></i> রুটিন: <span class="badge bg-primary ms-1">${med.routine}</span> ${timingBadge}</small>
                    </div>
                    <div>
                        <button onclick="editMedicine('${med.id}', '${med.name}', '${med.routine}', '${med.timing}')" class="btn btn-sm btn-outline-primary border-0 rounded-circle me-1"><i class="fa-solid fa-pen"></i></button>
                        <button onclick="deleteMedicine('${med.id}')" class="btn btn-sm btn-outline-danger border-0 rounded-circle"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            `;
        });
    }

    window.editMedicine = async function(id, currentName, currentRoutine, currentTiming) {
        const { value: formValues } = await Swal.fire({
            title: 'ওষুধ আপডেট করুন',
            html:
                `<input id="swal-input1" class="swal2-input" value="${currentName}" placeholder="ওষুধের নাম">` +
                `<select id="swal-input2" class="swal2-select" style="display:flex; width:70%; margin: 1em auto;">` +
                `<option value="সকালে ও রাতে" ${currentRoutine==='সকালে ও রাতে'?'selected':''}>সকালে ও রাতে</option>` +
                `<option value="তিন বেলা" ${currentRoutine==='তিন বেলা'?'selected':''}>তিন বেলা</option>` +
                `<option value="শুধু সকালে" ${currentRoutine==='শুধু সকালে'?'selected':''}>শুধু সকালে</option>` +
                `<option value="শুধু দুপুরে" ${currentRoutine==='শুধু দুপুরে'?'selected':''}>শুধু দুপুরে</option>` +
                `<option value="শুধু রাতে" ${currentRoutine==='শুধু রাতে'?'selected':''}>শুধু রাতে</option>` +
                `<option value="প্রয়োজন অনুযায়ী" ${currentRoutine==='প্রয়োজন অনুযায়ী'?'selected':''}>প্রয়োজন অনুযায়ী</option>` +
                `</select>` +
                `<select id="swal-input3" class="swal2-select" style="display:flex; width:70%; margin: 1em auto;">` +
                `<option value="খাবারের আগে" ${currentTiming==='খাবারের আগে'?'selected':''}>খাবারের আগে</option>` +
                `<option value="খাবারের পরে" ${currentTiming==='খাবারের পরে'?'selected':''}>খাবারের পরে</option>` +
                `<option value="খাবারের সাথে" ${currentTiming==='খাবারের সাথে'?'selected':''}>খাবারের সাথে</option>` +
                `</select>`,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'আপডেট করুন',
            cancelButtonText: 'বাতিল',
            customClass: {
                popup: 'glass-popup-swal',
                confirmButton: 'btn btn-primary rounded-pill px-4 shadow'
            },
            buttonsStyling: false,
            preConfirm: () => {
                return [
                    document.getElementById('swal-input1').value,
                    document.getElementById('swal-input2').value,
                    document.getElementById('swal-input3').value
                ]
            }
        });

        if (formValues) {
            const [name, routine, timing] = formValues;
            const phone = localStorage.getItem('hc_user_phone') || 'anonymous';
            try {
                await fetch(`/api/v1/dashboard/${phone}/medicine/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, routine, timing })
                });
                Swal.fire({
                    title: 'আপডেট হয়েছে!',
                    text: 'আপনার ওষুধটি আপডেট করা হয়েছে।',
                    icon: 'success',
                    confirmButtonText: 'ঠিক আছে',
                    customClass: { popup: 'glass-popup-swal', confirmButton: 'btn btn-primary rounded-pill px-4 shadow' },
                    buttonsStyling: false
                });
                loadMedicineRoutine();
            } catch(e) {
                Swal.fire({
                    title: 'সমস্যা!',
                    text: 'আপডেট করতে সমস্যা হচ্ছে।',
                    icon: 'error',
                    confirmButtonText: 'ঠিক আছে',
                    customClass: { popup: 'glass-popup-swal', confirmButton: 'btn btn-primary rounded-pill px-4 shadow' },
                    buttonsStyling: false
                });
            }
        }
    }

    async function deleteMedicine(id) {
        const result = await Swal.fire({
            title: 'আপনি কি নিশ্চিত?',
            text: 'ওষুধটি মুছে ফেলতে চান?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#e0e0e0',
            confirmButtonText: 'হ্যাঁ, মুছে ফেলুন',
            cancelButtonText: 'বাতিল',
            customClass: {
                popup: 'glass-popup-swal'
            },
            buttonsStyling: false
        });

        if (result.isConfirmed) {
            const phone = localStorage.getItem('hc_user_phone') || 'anonymous';
            try {
                await fetch(`/api/v1/dashboard/${phone}/medicine/${id}`, { method: 'DELETE' });
                Swal.fire({
                    title: 'মুছে ফেলা হয়েছে!',
                    text: 'আপনার ওষুধটি মুছে ফেলা হয়েছে।',
                    icon: 'success',
                    confirmButtonText: 'ঠিক আছে',
                    customClass: { popup: 'glass-popup-swal', confirmButton: 'btn btn-primary rounded-pill px-4 shadow' },
                    buttonsStyling: false
                });
                loadMedicineRoutine();
            } catch(e) {
                Swal.fire({
                    title: 'সমস্যা!',
                    text: 'মুছে ফেলতে সমস্যা হচ্ছে।',
                    icon: 'error',
                    confirmButtonText: 'ঠিক আছে',
                    customClass: { popup: 'glass-popup-swal', confirmButton: 'btn btn-primary rounded-pill px-4 shadow' },
                    buttonsStyling: false
                });
            }
        }
    }

    async function clearData() {
        const result = await Swal.fire({
            title: 'সব ড্যাশবোর্ড ডেটা মুছবেন?',
            text: 'আপনি কি নিশ্চিত যে আপনি সমস্ত ড্যাশবোর্ড ডেটা মুছে ফেলতে চান? এটি আর ফেরত পাওয়া যাবে না!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#e0e0e0',
            confirmButtonText: 'হ্যাঁ, সব মুছুন',
            cancelButtonText: 'বাতিল',
            customClass: {
                popup: 'glass-popup-swal'
            },
            buttonsStyling: false
        });

        if (result.isConfirmed) {
            const phone = localStorage.getItem('hc_user_phone') || 'anonymous';
            try {
                await fetch(`/api/v1/dashboard/${phone}/clear`, { method: 'DELETE' });
                await Swal.fire({
                    title: 'মুছে ফেলা হয়েছে!',
                    text: 'আপনার সব ডেটা মুছে ফেলা হয়েছে।',
                    icon: 'success',
                    confirmButtonText: 'ঠিক আছে',
                    customClass: { popup: 'glass-popup-swal', confirmButton: 'btn btn-primary rounded-pill px-4 shadow' },
                    buttonsStyling: false
                });
                location.reload();
            } catch (e) {
                Swal.fire({
                    title: 'সমস্যা!',
                    text: 'ডেটা মুছতে সমস্যা হচ্ছে।',
                    icon: 'error',
                    confirmButtonText: 'ঠিক আছে',
                    customClass: { popup: 'glass-popup-swal', confirmButton: 'btn btn-primary rounded-pill px-4 shadow' },
                    buttonsStyling: false
                });
            }
        }
    }

    let healthChartInstance = null;

    function initHealthTracking() {
        document.getElementById('healthDataForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const date = document.getElementById('trackDate').value;
            const bpSys = document.getElementById('bpSys').value;
            const bpDia = document.getElementById('bpDia').value;
            const sugar = document.getElementById('bloodSugar').value;
            const hr = document.getElementById('heartRate').value;
            const cr = document.getElementById('creatinine').value;
            const height = document.getElementById('height').value;
            const weight = document.getElementById('weight').value;

            const entry = { date, bpSys, bpDia, sugar, hr, cr, height, weight };
            const phone = localStorage.getItem('hc_user_phone') || 'anonymous';
            
            try {
                await fetch(`/api/v1/dashboard/${phone}/health`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(entry)
                });
                Swal.fire({
                    title: 'সেভ হয়েছে!',
                    text: 'ডেটা সেভ করা হয়েছে!',
                    icon: 'success',
                    confirmButtonText: 'ঠিক আছে',
                    customClass: { popup: 'glass-popup-swal', confirmButton: 'btn btn-primary rounded-pill px-4 shadow' },
                    buttonsStyling: false
                });
                this.reset();
                updateChart();
            } catch (e) {
                Swal.fire({
                    title: 'সমস্যা!',
                    text: 'ডেটা সেভ করতে সমস্যা হচ্ছে।',
                    icon: 'error',
                    confirmButtonText: 'ঠিক আছে',
                    customClass: { popup: 'glass-popup-swal', confirmButton: 'btn btn-primary rounded-pill px-4 shadow' },
                    buttonsStyling: false
                });
            }
        });

        document.getElementById('chartTypeSelector').addEventListener('change', updateChart);
        
        // Set today's date as default
        document.getElementById('trackDate').valueAsDate = new Date();
        updateChart();
    }

    async function updateChart() {
        const phone = localStorage.getItem('hc_user_phone') || 'anonymous';
        let history = [];
        try {
            const res = await fetch(`/api/v1/dashboard/${phone}`);
            const resData = await res.json();
            if (res.ok && resData.success && resData.data.healthHistory) {
                history = resData.data.healthHistory;
            }
        } catch(e) {}
        
        const type = document.getElementById('chartTypeSelector').value;
        const chartElement = document.getElementById('healthChart');
        
        // Sort chronologically
        history.sort((a,b) => new Date(a.date) - new Date(b.date));

        if(healthChartInstance) {
            healthChartInstance.destroy();
        }

        let labels = history.map(item => item.date);
        let series = [];
        let colors = [];

        if(history.length === 0) {
            labels = ['Jan 1', 'Jan 5', 'Jan 10', 'Jan 15', 'Jan 20'];
            if(type==='bp') {
                series = [{ name: 'Systolic (Demo)', data: [120, 122, 118, 125, 120] }, { name: 'Diastolic (Demo)', data: [80, 82, 79, 85, 80] }];
                colors = ['#ff4d4d', '#00cc66'];
            } else if(type==='sugar') { series = [{ name: 'Sugar (Demo)', data: [5.5, 5.8, 6.0, 5.7, 5.5] }]; colors = ['#ff9900']; }
            else if(type==='hr') { series = [{ name: 'HR (Demo)', data: [72, 75, 70, 78, 72] }]; colors = ['#cc0066']; }
            else if(type==='creatinine') { series = [{ name: 'Creatinine (Demo)', data: [1.0, 1.1, 1.0, 1.2, 1.0] }]; colors = ['#3366cc']; }
            else if(type==='height') { series = [{ name: 'Height (Demo)', data: [170, 170, 170.5, 170.5, 171] }]; colors = ['#9933cc']; }
            else if(type==='weight') { series = [{ name: 'Weight (Demo)', data: [70, 69.5, 69, 68.5, 68] }]; colors = ['#33cc99']; }
        } else {
            if(type === 'bp') {
                series = [{ name: 'Systolic', data: history.map(item => item.bpSys) }, { name: 'Diastolic', data: history.map(item => item.bpDia) }];
                colors = ['#ff4d4d', '#00cc66'];
            } else if (type === 'sugar') { series = [{ name: 'Blood Sugar (mmol/L)', data: history.map(item => item.sugar) }]; colors = ['#ff9900']; }
            else if (type === 'hr') { series = [{ name: 'Heart Rate (bpm)', data: history.map(item => item.hr) }]; colors = ['#cc0066']; }
            else if (type === 'creatinine') { series = [{ name: 'Creatinine (mg/dL)', data: history.map(item => item.cr) }]; colors = ['#3366cc']; }
            else if (type === 'height') { series = [{ name: 'Height (cm)', data: history.map(item => item.height) }]; colors = ['#9933cc']; }
            else if (type === 'weight') { series = [{ name: 'Weight (kg)', data: history.map(item => item.weight) }]; colors = ['#33cc99']; }
        }

        const options = {
            series: series,
            chart: {
                height: 300,
                type: 'area',
                fontFamily: "'Hind Siliguri', sans-serif",
                toolbar: { show: false },
                zoom: { enabled: false }
            },
            colors: colors,
            dataLabels: { enabled: false },
            stroke: { curve: 'smooth', width: 3 },
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 90, 100]
                }
            },
            xaxis: {
                categories: labels,
                axisBorder: { show: false },
                axisTicks: { show: false }
            },
            yaxis: {
                labels: {
                    style: { colors: '#8e8da4' }
                }
            },
            grid: {
                borderColor: 'rgba(0,0,0,0.05)',
                strokeDashArray: 4,
                yaxis: { lines: { show: true } }
            },
            markers: {
                size: 5, colors: ['#fff'], strokeColors: colors, strokeWidth: 2, hover: { size: 7 }
            },
            theme: { mode: 'light' }
        };

        healthChartInstance = new ApexCharts(chartElement, options);
        healthChartInstance.render();

        // Populate History Table
        const tbody = document.getElementById('healthHistoryTableBody');
        if (tbody) {
            tbody.innerHTML = '';
            if (history.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">কোনো রেকর্ড পাওয়া যায়নি।</td></tr>';
            } else {
                // Show newest first in table
                [...history].reverse().forEach(item => {
                    tbody.innerHTML += `
                        <tr>
                            <td>${item.date}</td>
                            <td>${item.bpSys ? item.bpSys + '/' + item.bpDia : '-'}</td>
                            <td>${item.sugar ? item.sugar : '-'}</td>
                            <td>${item.hr ? item.hr : '-'}</td>
                            <td>${item.cr ? item.cr : '-'}</td>
                            <td>${item.height ? item.height + 'cm' : '-'} / ${item.weight ? item.weight + 'kg' : '-'}</td>
                            <td class="text-end">
                                <button onclick="editHealthRecord('${item.id}', '${item.date}', '${item.bpSys}', '${item.bpDia}', '${item.sugar}', '${item.hr}', '${item.cr}', '${item.height}', '${item.weight}')" class="btn btn-sm btn-outline-primary border-0 rounded-circle me-1"><i class="fa-solid fa-pen"></i></button>
                                <button onclick="deleteHealthRecord('${item.id}')" class="btn btn-sm btn-outline-danger border-0 rounded-circle"><i class="fa-solid fa-trash"></i></button>
                            </td>
                        </tr>
                    `;
                });
            }
        }
    }

    window.editHealthRecord = async function(id, date, bpSys, bpDia, sugar, hr, cr, height, weight) {
        const { value: formValues } = await Swal.fire({
            title: 'রেকর্ড আপডেট করুন',
            html:
                `<input id="swal-h1" type="date" class="swal2-input mb-2" value="${date}">` +
                `<div class="d-flex justify-content-center gap-2 mb-2">
                    <input id="swal-h2" type="number" class="swal2-input m-0" value="${bpSys}" placeholder="Sys" style="width:45%">
                    <input id="swal-h3" type="number" class="swal2-input m-0" value="${bpDia}" placeholder="Dia" style="width:45%">
                </div>` +
                `<input id="swal-h4" type="number" step="0.1" class="swal2-input mb-2" value="${sugar}" placeholder="সুগার">` +
                `<input id="swal-h5" type="number" class="swal2-input mb-2" value="${hr}" placeholder="হার্ট রেট">` +
                `<input id="swal-h6" type="number" step="0.1" class="swal2-input mb-2" value="${cr}" placeholder="ক্রিয়েটিনিন">` +
                `<div class="d-flex justify-content-center gap-2 mb-2">
                    <input id="swal-h7" type="number" step="0.1" class="swal2-input m-0" value="${height}" placeholder="উচ্চতা" style="width:45%">
                    <input id="swal-h8" type="number" step="0.1" class="swal2-input m-0" value="${weight}" placeholder="ওজন" style="width:45%">
                </div>`,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'আপডেট করুন',
            cancelButtonText: 'বাতিল',
            customClass: { popup: 'glass-popup-swal', confirmButton: 'btn btn-primary rounded-pill px-4 shadow' },
            buttonsStyling: false,
            preConfirm: () => {
                return {
                    date: document.getElementById('swal-h1').value,
                    bpSys: document.getElementById('swal-h2').value,
                    bpDia: document.getElementById('swal-h3').value,
                    sugar: document.getElementById('swal-h4').value,
                    hr: document.getElementById('swal-h5').value,
                    cr: document.getElementById('swal-h6').value,
                    height: document.getElementById('swal-h7').value,
                    weight: document.getElementById('swal-h8').value
                };
            }
        });

        if (formValues) {
            const phone = localStorage.getItem('hc_user_phone') || 'anonymous';
            try {
                await fetch(`/api/v1/dashboard/${phone}/health/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formValues)
                });
                Swal.fire({
                    title: 'আপডেট হয়েছে!',
                    text: 'আপনার হেলথ রেকর্ড আপডেট করা হয়েছে।',
                    icon: 'success',
                    confirmButtonText: 'ঠিক আছে',
                    customClass: { popup: 'glass-popup-swal', confirmButton: 'btn btn-primary rounded-pill px-4 shadow' },
                    buttonsStyling: false
                });
                updateChart();
            } catch(e) {
                Swal.fire({
                    title: 'সমস্যা!',
                    text: 'আপডেট করতে সমস্যা হচ্ছে।',
                    icon: 'error',
                    confirmButtonText: 'ঠিক আছে',
                    customClass: { popup: 'glass-popup-swal', confirmButton: 'btn btn-primary rounded-pill px-4 shadow' },
                    buttonsStyling: false
                });
            }
        }
    }

    window.deleteHealthRecord = async function(id) {
        const result = await Swal.fire({
            title: 'আপনি কি নিশ্চিত?',
            text: 'এই রেকর্ডটি মুছে ফেলতে চান?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#e0e0e0',
            confirmButtonText: 'হ্যাঁ, মুছে ফেলুন',
            cancelButtonText: 'বাতিল',
            customClass: { popup: 'glass-popup-swal' },
            buttonsStyling: false
        });

        if (result.isConfirmed) {
            const phone = localStorage.getItem('hc_user_phone') || 'anonymous';
            try {
                await fetch(`/api/v1/dashboard/${phone}/health/${id}`, { method: 'DELETE' });
                Swal.fire({
                    title: 'মুছে ফেলা হয়েছে!',
                    text: 'আপনার রেকর্ড মুছে ফেলা হয়েছে।',
                    icon: 'success',
                    confirmButtonText: 'ঠিক আছে',
                    customClass: { popup: 'glass-popup-swal', confirmButton: 'btn btn-primary rounded-pill px-4 shadow' },
                    buttonsStyling: false
                });
                updateChart();
            } catch(e) {
                Swal.fire({
                    title: 'সমস্যা!',
                    text: 'মুছে ফেলতে সমস্যা হচ্ছে।',
                    icon: 'error',
                    confirmButtonText: 'ঠিক আছে',
                    customClass: { popup: 'glass-popup-swal', confirmButton: 'btn btn-primary rounded-pill px-4 shadow' },
                    buttonsStyling: false
                });
            }
        }
    }

    // Medicine Form Submit
    document.getElementById('addMedForm')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        const name = document.getElementById('medName').value;
        const routine = document.getElementById('medDose').value;
        const timing = document.getElementById('medTiming').value;
        
        const phone = localStorage.getItem('hc_user_phone') || 'anonymous';
        
        try {
            await fetch(`/api/v1/dashboard/${phone}/medicine`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, routine, timing })
            });
            Swal.fire({
                title: 'যুক্ত হয়েছে!',
                text: 'নতুন ঔষধ যুক্ত করা হয়েছে।',
                icon: 'success',
                confirmButtonText: 'ঠিক আছে',
                customClass: { popup: 'glass-popup-swal', confirmButton: 'btn btn-primary rounded-pill px-4 shadow' },
                buttonsStyling: false
            });
            this.reset();
            loadMedicineRoutine();
        } catch (e) {
            Swal.fire({
                title: 'সমস্যা!',
                text: 'ঔষধ যুক্ত করতে সমস্যা হচ্ছে।',
                icon: 'error',
                confirmButtonText: 'ঠিক আছে',
                customClass: { popup: 'glass-popup-swal', confirmButton: 'btn btn-primary rounded-pill px-4 shadow' },
                buttonsStyling: false
            });
        }
    });



    // Initialize
    loadUserProfile();
    loadDashboardData();
    loadMedicineRoutine();
    initHealthTracking();
    // User Profile Logic
    async function loadUserProfile() {
        const phone = localStorage.getItem('hc_user_phone') || 'Unregistered User';
        
        let name = '';
        let age = '';
        
        try {
            const res = await fetch(`/api/v1/dashboard/${phone}`);
            const resData = await res.json();
            if (res.ok && resData.success && resData.data) {
                name = resData.data.name || '';
                age = resData.data.age || '';
            }
        } catch(e) {}

        const phoneEl = document.getElementById('userPhoneDisplay');
        const nameEl = document.getElementById('userNameInput');
        const ageEl = document.getElementById('userAgeInput');

        if(phoneEl) phoneEl.value = phone;
        if(nameEl) nameEl.value = name;
        if(ageEl) ageEl.value = age;
    }

    window.toggleEditProfile = function() {
        document.getElementById('userNameInput').removeAttribute('readonly');
        document.getElementById('userAgeInput').removeAttribute('readonly');
        document.getElementById('editProfileBtn').classList.add('d-none');
        document.getElementById('saveProfileBtn').classList.remove('d-none');
        document.getElementById('userNameInput').focus();
    };

    window.saveUserProfile = async function() {
        const phone = localStorage.getItem('hc_user_phone') || 'anonymous';
        const name = document.getElementById('userNameInput').value;
        const age = document.getElementById('userAgeInput').value;
        
        try {
            await fetch(`/api/v1/dashboard/${phone}/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, age })
            });
            Swal.fire({
                title: 'সেভ হয়েছে!',
                text: 'আপনার প্রোফাইল সেভ করা হয়েছে!',
                icon: 'success',
                confirmButtonText: 'ঠিক আছে',
                customClass: { popup: 'glass-popup-swal', confirmButton: 'btn btn-primary rounded-pill px-4 shadow' },
                buttonsStyling: false
            });
            // Lock fields again
            document.getElementById('userNameInput').setAttribute('readonly', 'true');
            document.getElementById('userAgeInput').setAttribute('readonly', 'true');
            document.getElementById('editProfileBtn').classList.remove('d-none');
            document.getElementById('saveProfileBtn').classList.add('d-none');
        } catch(e) {
            Swal.fire({
                title: 'সমস্যা!',
                text: 'প্রোফাইল সেভ করতে সমস্যা হচ্ছে।',
                icon: 'error',
                confirmButtonText: 'ঠিক আছে',
                customClass: { popup: 'glass-popup-swal', confirmButton: 'btn btn-primary rounded-pill px-4 shadow' },
                buttonsStyling: false
            });
        }
    };

    
