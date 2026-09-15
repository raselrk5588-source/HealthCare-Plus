AOS.init({duration: 800, once: true});

    async function loadDocuments() {
        const phone = localStorage.getItem('hc_user_phone') || 'anonymous';
        let data = [];
        try {
            const res = await fetch(`/api/v1/documents/${phone}`);
            const resData = await res.json();
            if (res.ok && resData.success) {
                data = resData.data;
            }
        } catch (e) {
            console.error("Failed to fetch documents from server", e);
            data = [];
        }
        const galleryContainer = document.getElementById('galleryContainer');
        const emptyGallery = document.getElementById('emptyGallery');
        
        galleryContainer.innerHTML = '';

        if (data.length === 0) {
            emptyGallery.classList.remove('d-none');
            return;
        }
        
        let hasDocs = false;

        // Filter valid items and Sort data by newest first
        const validData = data.filter(item => item && item._id);
        // DB returns sorted array, but just in case:
        validData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        validData.forEach(item => {
            if (item.image && item.type !== 'food') {
                hasDocs = true;
                galleryContainer.innerHTML += `
                    <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                        <div class="card glass-card border-0 p-3 text-center h-100 position-relative shadow-sm" style="background: rgba(0,0,0,0.02); border: 1px solid rgba(0,0,0,0.05) !important;">
                            <button onclick="downloadDoc('${item._id}')" class="position-absolute top-0 end-0 m-2 btn btn-sm btn-primary rounded-circle shadow-sm" title="ডাউনলোড করুন">
                                <i class="fa-solid fa-download"></i>
                            </button>
                            <button onclick="deleteDoc('${item._id}')" class="position-absolute top-0 start-0 m-2 btn btn-sm btn-danger rounded-circle shadow-sm" title="মুছে ফেলুন">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                            <div class="rounded mb-3 mt-2 shadow-sm d-flex justify-content-center align-items-center bg-white" style="height: 180px; width: 100%; border: 1px solid #eee;">
                                <i class="fa-solid fa-file-pdf text-danger opacity-75" style="font-size: 5rem;"></i>
                            </div>
                            <h6 class="fw-bold mb-1 text-dark"><i class="fa-solid fa-file-pdf me-2 text-danger"></i> ${item.type === 'prescription' ? 'প্রেসক্রিপশন' : 'মেডিকেল রিপোর্ট'}.pdf</h6>
                            <small class="text-muted"><i class="fa-solid fa-clock me-1"></i> ${item.date}</small>
                        </div>
                    </div>
                `;
            }
        });

        if(!hasDocs) {
            emptyGallery.classList.remove('d-none');
        } else {
            emptyGallery.classList.add('d-none');
        }
    }

    async function deleteDoc(id) {
        const result = await Swal.fire({
            title: 'আপনি কি নিশ্চিত?',
            text: 'আপনি কি নিশ্চিত যে আপনি এই ডকুমেন্টটি মুছে ফেলতে চান?',
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

        if(result.isConfirmed) {
            try {
                await fetch(`/api/v1/documents/${id}`, { method: 'DELETE' });
                Swal.fire({
                    title: 'মুছে ফেলা হয়েছে!',
                    text: 'আপনার ডকুমেন্ট মুছে ফেলা হয়েছে।',
                    icon: 'success',
                    confirmButtonText: 'ঠিক আছে',
                    customClass: { popup: 'glass-popup-swal', confirmButton: 'btn btn-primary rounded-pill px-4 shadow' },
                    buttonsStyling: false
                });
                loadDocuments();
            } catch(e) {
                Swal.fire({
                    title: 'সমস্যা!',
                    text: 'সার্ভারে সমস্যা, মুছে ফেলা সম্ভব হয়নি।',
                    icon: 'error',
                    confirmButtonText: 'ঠিক আছে',
                    customClass: { popup: 'glass-popup-swal', confirmButton: 'btn btn-primary rounded-pill px-4 shadow' },
                    buttonsStyling: false
                });
            }
        }
    }

    async function downloadDoc(id) {
        const phone = localStorage.getItem('hc_user_phone') || 'anonymous';
        let data = [];
        try {
            const res = await fetch(`/api/v1/documents/${phone}`);
            const resData = await res.json();
            if (res.ok && resData.success) {
                data = resData.data;
            }
        } catch(e) { return; }
        
        const doc = data.find(item => item._id === id);
        if (doc && doc.image) {
            fetch(doc.image)
                .then(res => res.blob())
                .then(blob => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    const ext = doc.image.startsWith('data:application/pdf') ? 'pdf' : 'jpg';
                    a.download = `HealthCare_Document_${doc._id}.${ext}`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                })
                .catch(err => {
                    console.error('Download failed', err);
                    alert('ডাউনলোড করতে সমস্যা হচ্ছে।');
                });
        }
    }

    loadDocuments();
