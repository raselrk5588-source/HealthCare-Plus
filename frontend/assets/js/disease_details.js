AOS.init({duration: 800, once: true});
    
    document.addEventListener('DOMContentLoaded', () => {
        const urlParams = new URLSearchParams(window.location.search);
        const diseaseId = urlParams.get('id');
        const disease = healthcareData.diseases.find(d => d.id === diseaseId);
        
        const contentDiv = document.getElementById('diseaseContent');
        
        if (disease) {
            document.title = disease.name + " - HealthCare Plus";
            contentDiv.innerHTML = `
                <div class="text-center mb-5">
                    <div class="d-inline-flex align-items-center justify-content-center mb-3" style="width:100px; height:100px; border-radius:24px; background: var(--${disease.color}-soft, rgba(0,102,255,0.1));">
                        <i class="fa-solid ${disease.icon}" style="font-size:40px; color: var(--${disease.color});"></i>
                    </div>
                    <h1 class="fw-bold" style="color: var(--${disease.color});">${disease.name}</h1>
                </div>
                <div class="content text-muted fs-5 lh-lg">
                    <p><strong>প্রাথমিক ধারণা:</strong> ${disease.overview}</p>
                    <p><strong>বিস্তারিত চিকিৎসা ও প্রতিরোধ:</strong> ${disease.details}</p>
                </div>
                <div class="text-center mt-5">
                    <a href="diseases.html" class="btn btn-outline-secondary rounded-pill px-4"><i class="fa-solid fa-arrow-left me-1"></i> ফিরে যান</a>
                </div>
            `;
        } else {
            contentDiv.innerHTML = `<h3 class="text-center" style="color: var(--danger);">রোগের তথ্য পাওয়া যায়নি।</h3><div class="text-center mt-4"><a href="diseases.html" class="btn btn-outline-secondary rounded-pill px-4"><i class="fa-solid fa-arrow-left me-1"></i> ফিরে যান</a></div>`;
        }
    });\n\n
