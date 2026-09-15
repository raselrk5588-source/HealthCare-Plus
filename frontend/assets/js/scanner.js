
const fileInput = document.getElementById('fileInput');
const scannerContainer = document.getElementById('scannerContainer');
const uploadedImage = document.getElementById('uploadedImage');
const scannerUI = document.getElementById('scannerUI');
const scanningText = document.getElementById('scanningText');
const resultPlaceholder = document.getElementById('resultPlaceholder');
const resultCard = document.getElementById('resultCard');



// Handle File Selection
fileInput.addEventListener('change', function(e) {
    if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            startScanning(e.target.result);
        }
        reader.readAsDataURL(e.target.files[0]);
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
        document.getElementById('scannerUI').style.display = 'none';
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
    document.getElementById('scannerUI').style.display = 'block';
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
    
    const imgSrc = canvas.toDataURL('image/jpeg', 0.9);
    startScanning(imgSrc);
}

async function startScanning(imgSrc) {
    // Setup UI
    uploadedImage.src = imgSrc;
    uploadedImage.classList.add('visible');
    scannerUI.style.display = 'none';
    
    // Start Animation
    scannerContainer.classList.add('active', 'scanning');
    scanningText.classList.remove('d-none');
    
    resultPlaceholder.style.display = 'none';
    resultCard.style.display = 'none';
    
    try {
        const response = await fetch('/api/v1/ai/scan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ image: imgSrc })
        });
        
        const data = await response.json();
        
        if (data.success && data.result) {
            finishScanning(data.result);
        } else {
            throw new Error(data.message || "Failed to scan image");
        }
    } catch (error) {
        console.error("Classification error:", error);
        alert("ছবি প্রসেস করতে সমস্যা হচ্ছে, অন্য একটি ছবি চেষ্টা করুন। (" + error.message + ")");
        resetScanner();
    }
}

function finishScanning(nutritionInfo) {
    scannerContainer.classList.remove('scanning');
    scanningText.classList.add('d-none');
    
    // Populate Results
    document.getElementById('resName').textContent = nutritionInfo.name;
    document.getElementById('resCal').textContent = nutritionInfo.cal;
    document.getElementById('resPro').textContent = nutritionInfo.pro;
    document.getElementById('resCarb').textContent = nutritionInfo.carb;
    document.getElementById('resFat').textContent = nutritionInfo.fat;
    document.getElementById('resMatch').innerHTML = `<i class="fa-solid fa-check-circle me-1"></i> ${nutritionInfo.match}% Match`;
    document.getElementById('resAdvice').textContent = nutritionInfo.advice;
    
    // Fade in result
    resultCard.style.display = 'block';
    
    // Save to Database via API
    try {
        const phone = localStorage.getItem('hc_user_phone') || 'anonymous';
        const dateStr = new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' });
        
        const payload = {
            phone: phone,
            type: 'food',
            date: dateStr,
            image: uploadedImage.src,
            foodName: nutritionInfo.name,
            calories: nutritionInfo.cal
        };
        
        fetch('/api/v1/documents/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        }).catch(e => console.error("API Upload Error:", e));
        
    } catch(e) {
        console.error("Storage error:", e);
    }
    
    setTimeout(() => {
        resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
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
