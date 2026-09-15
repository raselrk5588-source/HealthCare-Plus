// assets/js/calculators.js — HealthCare Plus Health Calculators

function calculateBMI() {
    const weight = parseFloat(document.getElementById('bmiWeight').value);
    const heightCm = parseFloat(document.getElementById('bmiHeight').value);
    const resultDiv = document.getElementById('bmiResult');

    if (!weight || !heightCm || weight <= 0 || heightCm <= 0) {
        resultDiv.className = 'alert alert-warning text-center fw-bold';
        resultDiv.classList.remove('d-none');
        resultDiv.innerHTML = '⚠️ দয়া করে সঠিক ওজন ও উচ্চতা দিন।';
        return;
    }

    const heightM = heightCm / 100;
    const bmi = (weight / (heightM * heightM)).toFixed(1);

    let category = '';
    let colorClass = '';
    let emoji = '';

    if (bmi < 18.5) {
        category = 'কম ওজন (Underweight)';
        colorClass = 'alert-info';
        emoji = '💙';
    } else if (bmi < 25) {
        category = 'স্বাভাবিক ওজন (Normal)';
        colorClass = 'alert-success';
        emoji = '✅';
    } else if (bmi < 30) {
        category = 'অতিরিক্ত ওজন (Overweight)';
        colorClass = 'alert-warning';
        emoji = '⚠️';
    } else {
        category = 'স্থূলতা (Obese)';
        colorClass = 'alert-danger';
        emoji = '🔴';
    }

    resultDiv.className = `alert ${colorClass} text-center fw-bold`;
    resultDiv.classList.remove('d-none');
    resultDiv.innerHTML = `${emoji} আপনার BMI: <strong>${bmi}</strong><br><small>${category}</small>`;
}

function calculateBMR() {
    const gender = document.getElementById('bmrGender').value;
    const age = parseFloat(document.getElementById('bmrAge').value);
    const weight = parseFloat(document.getElementById('bmrWeight').value);
    const heightCm = parseFloat(document.getElementById('bmrHeight').value);
    const activity = parseFloat(document.getElementById('bmrActivity').value);
    const resultDiv = document.getElementById('bmrResult');

    if (!age || !weight || !heightCm) {
        resultDiv.className = 'alert alert-warning text-center fw-bold';
        resultDiv.classList.remove('d-none');
        resultDiv.innerHTML = '⚠️ দয়া করে সব তথ্য পূরণ করুন।';
        return;
    }

    let bmr;
    if (gender === 'male') {
        bmr = 88.362 + (13.397 * weight) + (4.799 * heightCm) - (5.677 * age);
    } else {
        bmr = 447.593 + (9.247 * weight) + (3.098 * heightCm) - (4.330 * age);
    }

    const dailyCalories = (bmr * activity).toFixed(0);

    resultDiv.className = 'alert alert-success text-center fw-bold';
    resultDiv.classList.remove('d-none');
    resultDiv.innerHTML = `🔥 BMR: <strong>${bmr.toFixed(0)}</strong> ক্যালরি/দিন<br>📊 দৈনিক চাহিদা: <strong>${dailyCalories}</strong> ক্যালরি/দিন`;
}

function calculateWater() {
    const weight = parseFloat(document.getElementById('waterWeight').value);
    const exercise = parseFloat(document.getElementById('waterExercise').value) || 0;
    const resultDiv = document.getElementById('waterResult');

    if (!weight || weight <= 0) {
        resultDiv.className = 'alert alert-warning text-center fw-bold';
        resultDiv.classList.remove('d-none');
        resultDiv.innerHTML = '⚠️ দয়া করে সঠিক ওজন দিন।';
        return;
    }

    const baseWater = weight * 0.033;
    const extraWater = (exercise / 30) * 0.35;
    const totalWater = (baseWater + extraWater).toFixed(1);
    const glasses = Math.round(totalWater / 0.25);

    resultDiv.className = 'alert alert-info text-center fw-bold';
    resultDiv.classList.remove('d-none');
    resultDiv.innerHTML = `💧 দৈনিক পানি: <strong>${totalWater}</strong> লিটার<br>🥛 প্রায় <strong>${glasses}</strong> গ্লাস (২৫০ মিলি)`;
}

function calculateHeartRate() {
    const age = parseFloat(document.getElementById('hrAge').value);
    const resting = parseFloat(document.getElementById('hrResting').value) || 0;
    const resultDiv = document.getElementById('hrResult');

    if (!age || age <= 0) {
        resultDiv.className = 'alert alert-warning text-center fw-bold';
        resultDiv.classList.remove('d-none');
        resultDiv.innerHTML = '⚠️ দয়া করে সঠিক বয়স দিন।';
        return;
    }

    const maxHR = 220 - age;
    const zone50 = Math.round(maxHR * 0.5);
    const zone70 = Math.round(maxHR * 0.7);
    const zone85 = Math.round(maxHR * 0.85);

    let html = `❤️ সর্বোচ্চ হার্ট রেট: <strong>${maxHR}</strong> BPM<br>`;
    html += `🏃 টার্গেট জোন: <strong>${zone50} - ${zone85}</strong> BPM<br>`;
    html += `<small>মাঝারি ব্যায়াম: ${zone50}-${zone70} | ভারী ব্যায়াম: ${zone70}-${zone85}</small>`;

    if (resting > 0) {
        html += `<br>💓 বিশ্রামরত: <strong>${resting}</strong> BPM`;
    }

    resultDiv.className = 'alert alert-success text-center fw-bold';
    resultDiv.classList.remove('d-none');
    resultDiv.innerHTML = html;
}
