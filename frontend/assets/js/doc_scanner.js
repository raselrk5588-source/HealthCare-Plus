const fileInput = document.getElementById('fileInput');
const scannerContainer = document.getElementById('scannerContainer');
const uploadedImage = document.getElementById('uploadedImage');
const scannerUI = document.getElementById('scannerUI');
const scanningText = document.getElementById('scanningText');
const resultPlaceholder = document.getElementById('resultPlaceholder');
const resultCard = document.getElementById('resultCard');
const docTypeSelect = document.getElementById('docType');
const previewList = document.getElementById('previewList');

// Handle File Selection
function handleFileProcessing(file) {
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = function(event) {
        const result = event.target.result;
        
        // If it's already a PDF, skip canvas conversion and save it directly
        if (file.type === 'application/pdf' || result.startsWith('data:application/pdf')) {
            document.getElementById('uploadedImage').style.display = 'none';
            startScanning(result, result);
            return;
        }
        
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 800;
            let width = img.width;
            let height = img.height;
            
            if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
            }
            
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            
            ctx.filter = 'contrast(1.2) brightness(1.05)';
            ctx.drawImage(img, 0, 0, width, height);
            
            const resizedImage = canvas.toDataURL('image/jpeg', 0.8);
            
            try {
                const { jsPDF } = window.jspdf;
                const orientation = width > height ? 'l' : 'p';
                const pdf = new jsPDF(orientation, 'px', [width, height]);
                pdf.addImage(resizedImage, 'JPEG', 0, 0, width, height);
                const pdfBase64 = pdf.output('datauristring');
                
                document.getElementById('uploadedImage').style.display = 'block';
                startScanning(resizedImage, pdfBase64);
            } catch(err) {
                console.error("PDF creation failed:", err);
                document.getElementById('uploadedImage').style.display = 'block';
                startScanning(resizedImage, resizedImage);
            }
        };
        img.onerror = function() {
            alert("ফাইলটি প্রসেস করা যাচ্ছে না। দয়া করে সঠিক ফরম্যাটের ছবি বা পিডিএফ দিন।");
            resetScanner();
        };
        img.src = result;
    }
    reader.readAsDataURL(file);
}

// Event listener for Gallery upload
fileInput.addEventListener('change', function(e) {
    if (e.target.files && e.target.files[0]) {
        handleFileProcessing(e.target.files[0]);
    }
});

let currentStream = null;

async function startLiveCamera() {
    const video = document.getElementById('cameraStream');
    const controls = document.getElementById('cameraControls');
    
    try {
        currentStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        video.srcObject = currentStream;
        video.classList.remove('d-none');
        controls.classList.remove('d-none');
        scannerUI.style.display = 'none';
        document.getElementById('uploadedImage').style.display = 'none';
    } catch(err) {
        alert("ক্যামেরা ওপেন করা যাচ্ছে না! দয়া করে ব্রাউজারে ক্যামেরার পারমিশন দিন।");
        console.error(err);
    }
}

function stopLiveCamera() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        currentStream = null;
    }
    document.getElementById('cameraStream').classList.add('d-none');
    document.getElementById('cameraControls').classList.add('d-none');
    scannerUI.style.display = 'block';
}

function captureLiveImage() {
    const video = document.getElementById('cameraStream');
    if (!currentStream) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    stopLiveCamera();
    
    canvas.toBlob(blob => {
        if(blob) {
            const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
            handleFileProcessing(file);
        }
    }, 'image/jpeg', 0.9);
}

function startScanning(imgSrc, pdfData) {
    // Setup UI
    uploadedImage.src = imgSrc;
    uploadedImage.classList.add('visible');
    scannerUI.style.display = 'none';
    
    // Start Animation
    scannerContainer.classList.add('active', 'scanning');
    scanningText.innerHTML = `<span class="badge bg-success text-white px-3 py-2 rounded-pill shadow-sm"><i class="fa-solid fa-circle-notch fa-spin me-2"></i> PDF-এ কনভার্ট হচ্ছে...</span>`;
    scanningText.classList.remove('d-none');
    
    resultPlaceholder.style.display = 'none';
    resultCard.style.display = 'none';
    
    // Simulate short delay for saving
    setTimeout(() => {
        finishScanning(pdfData || imgSrc);
    }, 1500);
}

async function finishScanning(finalData) {
    scannerContainer.classList.remove('scanning');
    scanningText.classList.add('d-none');
    
    const docType = docTypeSelect.value;
    const dateStr = new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' });
    
    let scannedItem = {
        id: Date.now(),
        type: docType,
        date: dateStr,
        image: finalData // This now contains the PDF Data URL
    };
    
    let previewHTML = '';
    
    if (docType === 'prescription') {
        previewHTML += `<li><i class="fa-solid fa-file-prescription text-primary me-2"></i> <strong>ডকুমেন্ট:</strong> প্রেসক্রিপশন</li>`;
    } else if (docType === 'report') {
        previewHTML += `<li><i class="fa-solid fa-file-medical text-danger me-2"></i> <strong>ডকুমেন্ট:</strong> মেডিকেল রিপোর্ট</li>`;
    }
    
    previewHTML += `<li><i class="fa-solid fa-calendar-day text-info me-2"></i> <strong>তারিখ:</strong> ${dateStr}</li>`;
    
    const phone = localStorage.getItem('hc_user_phone') || 'anonymous';
    
    const payload = {
        phone: phone,
        type: docType,
        date: dateStr,
        image: finalData
    };
    
    // Save to Database via API
    try {
        const response = await fetch('/api/v1/documents/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        const resData = await response.json();
        if (!response.ok || !resData.success) {
            throw new Error(resData.message || 'Upload failed');
        }
    } catch (e) {
        console.error("API Upload Error:", e);
        alert("আপনার ছবিটি সেভ করতে সমস্যা হয়েছে। সার্ভার সংযোগ পরীক্ষা করুন।");
        resetScanner();
        return;
    }
    
    // Show Preview
    previewList.innerHTML = previewHTML;
    resultCard.style.display = 'block';
    
    if (window.innerWidth < 992) {
        setTimeout(() => {
            resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
    
    // Auto redirect to documents page so user can see their serial list
    setTimeout(() => {
        window.location.href = "documents.html";
    }, 3500);
}

function resetScanner() {
    uploadedImage.classList.remove('visible');
    uploadedImage.src = '';
    scannerContainer.classList.remove('active', 'scanning');
    scannerUI.style.display = 'block';
    scanningText.classList.add('d-none');
    resultPlaceholder.style.display = 'block';
    resultCard.style.display = 'none';
    fileInput.value = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
