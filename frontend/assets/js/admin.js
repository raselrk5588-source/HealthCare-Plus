// Authentication check
if (localStorage.getItem('isAdmin') !== 'true') {
    window.location.href = 'admin-login.html';
}

const API_BASE = '/api/v1/cms';
const fieldTranslations = {
    name: 'নাম',
    district: 'জেলা',
    address: 'ঠিকানা',
    phone: 'ফোন নম্বর',
    hours: 'সময়সূচী',
    depts: 'বিভাগসমূহ',
    type: 'ধরন',
    overview: 'সংক্ষিপ্ত বিবরণ',
    details: 'বিস্তারিত',
    dietInfo: 'খাদ্যাভ্যাস/পথ্য',
    icon: 'আইকন (FontAwesome)',
    color: 'রঙ (Theme Color)',
    title: 'শিরোনাম',
    desc: 'বিবরণ',
    category: 'ক্যাটাগরি (যেমন: fruits)',
    items: 'আইটেমসমূহ',
    degree: 'ডিগ্রি (যেমন: MBBS, FCPS)',
    institute: 'শিক্ষা প্রতিষ্ঠান (Medical College)',
    specialty: 'বিশেষজ্ঞতা/বিভাগ',
    hospital: 'হাসপাতাল/চেম্বার',
    visitingHours: 'সাক্ষাতের সময়',
    fee: 'ভিজিট ফি',
    photo: 'ছবির লিংক (URL)',
    doctorName: 'ডাক্তারের নাম',
    feeAmount: 'ফি',
    patientName: 'রোগীর নাম',
    patientAge: 'বয়স',
    patientPhone: 'ফোন',
    paymentStatus: 'পেমেন্ট স্ট্যাটাস'
};
let currentType = 'hospital';
let currentData = [];
let editId = null;
let itemModal = null;

const typeConfig = {
    doctor: { title: 'ডাক্তার', endpoint: 'doctors', fields: ['name', 'degree', 'institute', 'specialty', 'hospital', 'district', 'phone', 'visitingHours', 'fee', 'photo'] },
    hospital: { title: 'হাসপাতাল', endpoint: 'hospitals', fields: ['name', 'district', 'address', 'phone', 'hours', 'depts'] },
    pharmacy: { title: 'ফার্মেসি', endpoint: 'pharmacies', fields: ['name', 'district', 'address', 'phone', 'hours'] },
    bloodbank: { title: 'ব্লাড ব্যাংক', endpoint: 'bloodBanks', fields: ['name', 'district', 'address', 'phone'] },
    ambulance: { title: 'অ্যাম্বুলেন্স', endpoint: 'ambulances', fields: ['name', 'district', 'address', 'phone', 'type'] },
    disease: { title: 'রোগব্যাধি', endpoint: 'diseases', fields: ['name', 'overview', 'details', 'dietInfo'] },
    homecare: { title: 'ঘরোয়া যত্ন', endpoint: 'homeCare', fields: ['title', 'desc'] },
    nutrition: { title: 'পুষ্টি ও স্বাস্থ্য', endpoint: 'nutrition', fields: ['category', 'items'] },
    appointment: { title: 'অ্যাপয়েন্টমেন্ট', endpoint: 'appointments', fields: ['doctorName', 'patientName', 'patientPhone', 'feeAmount', 'paymentStatus'] }
};

document.addEventListener('DOMContentLoaded', () => {
    itemModal = new bootstrap.Modal(document.getElementById('itemModal'));
    
    // Sidebar clicks
    document.querySelectorAll('.sidebar a[data-type]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.sidebar a').forEach(l => l.classList.remove('active'));
            e.currentTarget.classList.add('active');
            currentType = e.currentTarget.getAttribute('data-type');
            document.getElementById('pageTitle').textContent = typeConfig[currentType].title + ' তালিকা';
            fetchData();
        });
    });

    fetchData();
});

async function fetchData() {
    const tbody = document.getElementById('tableBody');
    const thead = document.getElementById('tableHead');
    const loading = document.getElementById('loadingIndicator');
    
    tbody.innerHTML = '';
    thead.innerHTML = '';
    loading.classList.remove('d-none');

    try {
        const res = await fetch(`${API_BASE}/${typeConfig[currentType].endpoint}`);
        const result = await res.json();
        currentData = Array.isArray(result) ? result : (result.data || []);
        renderTable();
    } catch (err) {
        console.error('Error fetching data', err);
        alert('ডেটা লোড করতে সমস্যা হয়েছে');
    } finally {
        loading.classList.add('d-none');
    }
}

function renderTable() {
    const tbody = document.getElementById('tableBody');
    const thead = document.getElementById('tableHead');
    const config = typeConfig[currentType];
    
    if(currentType === 'nutrition') {
        // Special case for nutrition
        thead.innerHTML = `<tr><th>ক্যাটাগরি</th><th>আইটেমের সংখ্যা</th><th>অ্যাকশন</th></tr>`;
        let html = '';
        currentData.forEach(item => {
            html += `<tr>
                <td>${item.category}</td>
                <td>${item.items ? item.items.length : 0} items</td>
                <td>
                    <button class="action-btn btn-edit" onclick="editItem('${item._id}')"><i class="fa-solid fa-pen"></i></button>
                    <button class="action-btn btn-delete" onclick="deleteItem('${item._id}')"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>`;
        });
        tbody.innerHTML = html;
        return;
    }

    // Normal rendering
    let headHtml = '<tr>';
    config.fields.forEach(f => headHtml += `<th>${fieldTranslations[f] || f.toUpperCase()}</th>`);
    headHtml += '<th>অ্যাকশন</th></tr>';
    thead.innerHTML = headHtml;

    let html = '';
    currentData.forEach(item => {
        html += '<tr>';
        config.fields.forEach(f => {
            let val = item[f] || '';
            if(val.length > 50) val = val.substring(0,50) + '...';
            html += `<td>${val}</td>`;
        });
        html += `
            <td>
                <button class="action-btn btn-edit" onclick="editItem('${item._id}')"><i class="fa-solid fa-pen"></i></button>
                <button class="action-btn btn-delete" onclick="deleteItem('${item._id}')"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>`;
    });
    tbody.innerHTML = html;
}

function openAddModal() {
    editId = null;
    document.getElementById('modalTitle').textContent = 'নতুন যোগ করুন';
    buildForm({});
}

function editItem(id) {
    editId = id;
    const item = currentData.find(d => d._id === id);
    document.getElementById('modalTitle').textContent = 'এডিট করুন';
    buildForm(item);
    itemModal.show();
}

function buildForm(data) {
    const formDiv = document.getElementById('dynamicFormFields');
    const config = typeConfig[currentType];
    let html = '';

    if (currentType === 'nutrition') {
        let itemsHtml = '';
        const items = data.items || [];
        if(items.length === 0) items.push({name: '', desc: '', icon: '', color: 'primary'});
        
        items.forEach((it, index) => {
            itemsHtml += getNutritionItemHtml(index, it);
        });

        html += `
        <div class="col-12 mb-3">
            <label class="form-label fw-bold">ক্যাটাগরি (যেমন: fruits, vegetables)</label>
            <select class="form-select" id="form_category" required>
                <option value="fruits" ${data.category==='fruits'?'selected':''}>Fruits (ফলমূল)</option>
                <option value="vegetables" ${data.category==='vegetables'?'selected':''}>Vegetables (শাকসবজি)</option>
                <option value="proteins" ${data.category==='proteins'?'selected':''}>Proteins (আমিষ)</option>
                <option value="dairy" ${data.category==='dairy'?'selected':''}>Dairy (দুগ্ধজাত)</option>
            </select>
        </div>
        <div class="col-12">
            <label class="form-label fw-bold mb-3">নিউট্রিশন আইটেমসমূহ</label>
            <div id="nutrition_items_container">
                ${itemsHtml}
            </div>
            <button type="button" class="btn btn-outline-primary btn-sm mt-2" onclick="addNutritionItemField()"><i class="fa-solid fa-plus me-1"></i> নতুন আইটেম যোগ করুন</button>
        </div>`;
    } else {
        config.fields.forEach(f => {
            const isTextarea = ['details', 'dietInfo', 'overview', 'desc'].includes(f);
            if(isTextarea) {
                html += `
                <div class="col-12">
                    <label class="form-label fw-bold">${fieldTranslations[f] || f.toUpperCase()}</label>
                    <textarea class="form-control" id="form_${f}" rows="3">${data[f] || ''}</textarea>
                </div>`;
            } else {
                let inputHtml = '';
                
                if (f === 'photo') {
                    inputHtml = `
                    <input type="file" class="form-control" id="form_photo_file" accept="image/*">
                    <input type="hidden" id="form_${f}" value="${data[f] || ''}">
                    ${data[f] ? `<div class="mt-2"><small class="text-muted d-block mb-1">বর্তমান ছবি:</small><img src="${data[f]}" style="height: 50px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"></div>` : ''}
                    `;
                } else if (f === 'icon') {
                    inputHtml = `
                    <select class="form-select" id="form_${f}">
                        <option value="fa-virus" ${data[f]==='fa-virus'?'selected':''}>Virus (ভাইরাস)</option>
                        <option value="fa-pills" ${data[f]==='fa-pills'?'selected':''}>Pills (ওষুধ)</option>
                        <option value="fa-hospital-user" ${data[f]==='fa-hospital-user'?'selected':''}>Hospital User (রোগী)</option>
                        <option value="fa-lungs" ${data[f]==='fa-lungs'?'selected':''}>Lungs (ফুসফুস)</option>
                        <option value="fa-heart-pulse" ${data[f]==='fa-heart-pulse'?'selected':''}>Heart (হৃদপিণ্ড)</option>
                        <option value="fa-brain" ${data[f]==='fa-brain'?'selected':''}>Brain (মস্তিষ্ক)</option>
                        <option value="fa-tooth" ${data[f]==='fa-tooth'?'selected':''}>Tooth (দাঁত)</option>
                        <option value="fa-bone" ${data[f]==='fa-bone'?'selected':''}>Bone (হাড়)</option>
                        <option value="fa-eye" ${data[f]==='fa-eye'?'selected':''}>Eye (চোখ)</option>
                        <option value="fa-staff-snake" ${data[f]==='fa-staff-snake'?'selected':''}>Medical (মেডিকেল)</option>
                        <option value="fa-apple-whole" ${data[f]==='fa-apple-whole'?'selected':''}>Apple (আপেল)</option>
                        <option value="fa-carrot" ${data[f]==='fa-carrot'?'selected':''}>Carrot (গাজর)</option>
                        <option value="fa-leaf" ${data[f]==='fa-leaf'?'selected':''}>Leaf (পাতা)</option>
                    </select>
                    `;
                } else if (f === 'color') {
                    inputHtml = `
                    <select class="form-select" id="form_${f}">
                        <option value="primary" ${data[f]==='primary'?'selected':''}>নীল (Primary)</option>
                        <option value="danger" ${data[f]==='danger'?'selected':''}>লাল (Danger)</option>
                        <option value="success" ${data[f]==='success'?'selected':''}>সবুজ (Success)</option>
                        <option value="warning" ${data[f]==='warning'?'selected':''}>হলুদ (Warning)</option>
                        <option value="info" ${data[f]==='info'?'selected':''}>হালকা নীল (Info)</option>
                        <option value="secondary" ${data[f]==='secondary'?'selected':''}>ধূসর (Secondary)</option>
                    </select>
                    `;
                } else {
                    inputHtml = `<input type="text" class="form-control" id="form_${f}" value="${data[f] || ''}">`;
                }
                
                html += `
                <div class="col-md-6">
                    <label class="form-label fw-bold">${fieldTranslations[f] || f.toUpperCase()}</label>
                    ${inputHtml}
                </div>`;
            }
        });
    }
    formDiv.innerHTML = html;
}

function getNutritionItemHtml(index, it = {name:'', desc:''}) {
    return `
    <div class="nutrition-item-row card p-3 mb-3 bg-light border-0 shadow-sm position-relative">
        <button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0 m-2 rounded-circle" onclick="this.parentElement.remove()" style="width: 30px; height: 30px; padding: 0;"><i class="fa-solid fa-times"></i></button>
        <div class="row g-2">
            <div class="col-md-12">
                <label class="form-label small">নাম</label>
                <input type="text" class="form-control form-control-sm nut-name" value="${it.name}">
            </div>
            <div class="col-12">
                <label class="form-label small">বিবরণ</label>
                <input type="text" class="form-control form-control-sm nut-desc" value="${it.desc}">
            </div>
        </div>
    </div>`;
}

function addNutritionItemField() {
    const container = document.getElementById('nutrition_items_container');
    container.insertAdjacentHTML('beforeend', getNutritionItemHtml(Date.now()));
}

async function saveItem() {
    const config = typeConfig[currentType];
    let payload = {};

    const token = localStorage.getItem('adminToken');
    let uploadedPhotoUrl = document.getElementById('form_photo') ? document.getElementById('form_photo').value : '';

    if (currentType === 'nutrition') {
        payload.category = document.getElementById('form_category').value;
        const itemRows = document.querySelectorAll('.nutrition-item-row');
        payload.items = Array.from(itemRows).map(row => ({
            name: row.querySelector('.nut-name').value,
            desc: row.querySelector('.nut-desc').value
        })).filter(it => it.name.trim() !== ''); // ignore empty names
    } else {
        // Handle file upload if present
        const photoFile = document.getElementById('form_photo_file');
        if (photoFile && photoFile.files.length > 0) {
            const formData = new FormData();
            formData.append('image', photoFile.files[0]);
            
            try {
                const uploadRes = await fetch(`${API_BASE}/upload`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });
                const uploadData = await uploadRes.json();
                if (uploadData.success) {
                    uploadedPhotoUrl = uploadData.url;
                } else {
                    alert('ছবি আপলোড করতে সমস্যা হয়েছে: ' + (uploadData.message || ''));
                    return;
                }
            } catch (err) {
                console.error(err);
                alert('ছবি আপলোডে সার্ভার এরর');
                return;
            }
        }

        config.fields.forEach(f => {
            if (f === 'photo') {
                payload[f] = uploadedPhotoUrl;
            } else {
                payload[f] = document.getElementById(`form_${f}`).value;
            }
        });
    }

    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `${API_BASE}/${typeConfig[currentType].endpoint}/${editId}` : `${API_BASE}/${typeConfig[currentType].endpoint}`;

    
    try {
        const res = await fetch(url, {
            method: method,
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });
        
        if (res.status === 401) {
            adminLogout();
            return;
        }

        if(res.ok) {
            itemModal.hide();
            fetchData();
        } else {
            alert('ডেটা সংরক্ষণ করতে সমস্যা হয়েছে');
        }
    } catch (err) {
        console.error(err);
        alert('সার্ভার এরর');
    }
}

async function deleteItem(id) {
    const result = await Swal.fire({
        title: 'আপনি কি নিশ্চিত?',
        text: "এই ডেটা একবার মুছলে আর ফিরে পাওয়া যাবে না!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#94a3b8',
        confirmButtonText: '<i class="fa-solid fa-trash me-1"></i> হ্যাঁ, মুছে ফেলুন',
        cancelButtonText: 'বাতিল',
        customClass: {
            popup: 'swal2-premium-popup',
            title: 'swal2-premium-title',
            htmlContainer: 'swal2-premium-text',
            confirmButton: 'swal2-premium-confirm',
            cancelButton: 'swal2-premium-cancel'
        },
        showClass: {
            popup: 'animate__animated animate__fadeInDown animate__faster'
        },
        hideClass: {
            popup: 'animate__animated animate__fadeOutUp animate__faster'
        }
    });

    if (!result.isConfirmed) return;
    
    const token = localStorage.getItem('adminToken');
    try {
        const res = await fetch(`${API_BASE}/${typeConfig[currentType].endpoint}/${id}`, { 
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (res.status === 401) {
            adminLogout();
            return;
        }

        if(res.ok) {
            fetchData();
            Swal.fire({
                title: 'সফল!',
                text: 'ডেটা সফলভাবে মুছে ফেলা হয়েছে।',
                icon: 'success',
                confirmButtonColor: '#4361ee',
                timer: 2000,
                showConfirmButton: false,
                customClass: {
                    popup: 'swal2-premium-popup',
                    title: 'swal2-premium-title',
                    htmlContainer: 'swal2-premium-text'
                }
            });
        } else {
            Swal.fire({
                title: 'সমস্যা!',
                text: 'ডেটা মুছতে সমস্যা হয়েছে।',
                icon: 'error',
                confirmButtonColor: '#ef4444',
                customClass: {
                    popup: 'swal2-premium-popup',
                    title: 'swal2-premium-title',
                    htmlContainer: 'swal2-premium-text',
                    confirmButton: 'swal2-premium-confirm'
                }
            });
        }
    } catch(err) {
        console.error(err);
        Swal.fire({
            title: 'এরর!',
            text: 'সার্ভারে কোনো সমস্যা হয়েছে।',
            icon: 'error',
            confirmButtonColor: '#ef4444',
            customClass: {
                popup: 'swal2-premium-popup',
                title: 'swal2-premium-title',
                htmlContainer: 'swal2-premium-text',
                confirmButton: 'swal2-premium-confirm'
            }
        });
    }
}

function adminLogout() {
    // Show the custom Bootstrap modal instead of default browser confirm
    const logoutModal = new bootstrap.Modal(document.getElementById('logoutModal'));
    logoutModal.show();
}

function executeLogout() {
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminToken');
    window.location.href = 'admin-login.html';
}
