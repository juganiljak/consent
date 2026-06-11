let currentStep = 0;
const steps = ['step-intro', 'step-1', 'step-2', 'step-3', 'step-4', 'step-5', 'step-result'];

function nextStep(stepIndex) {
    if (stepIndex > currentStep) {
        if (stepIndex === 2 && !validateStep1()) return;
        if (stepIndex === 3 && !validateStep2()) return;
        if (stepIndex === 5 && !signedState.p) { alert("촬영자 서명을 그려주세요."); return; }
    }
    
    document.getElementById(steps[currentStep]).classList.remove('active');
    document.getElementById(steps[currentStep]).classList.add('prev');
    
    currentStep = stepIndex;
    
    document.getElementById(steps[currentStep]).classList.remove('prev');
    document.getElementById(steps[currentStep]).classList.add('active');

    // Resize canvas when entering the signature steps
    if (steps[currentStep] === 'step-4') {
        setTimeout(() => resizeCanvas(ctxP, canvasP), 100);
    }
    if (steps[currentStep] === 'step-5') {
        setTimeout(() => resizeCanvas(ctxM, canvasM), 100);
    }
}

function prevStep(stepIndex) {
    document.getElementById(steps[currentStep]).classList.remove('active');
    currentStep = stepIndex;
    document.getElementById(steps[currentStep]).classList.remove('prev');
    document.getElementById(steps[currentStep]).classList.add('active');
}

function toggleFeeInput() {
    const condition = document.getElementById('shootCondition').value;
    const feeGroup = document.getElementById('feeAmountGroup');
    if (condition === "모델료 지급" || condition === "작가 촬영비 지급") {
        feeGroup.classList.remove('hidden');
    } else {
        feeGroup.classList.add('hidden');
        document.getElementById('feeAmount').value = '';
    }
}

function validateStep1() {
    const date = document.getElementById('shootDate').value;
    if (!date) { alert("촬영 일자를 선택해 주세요."); return false; }
    
    const condition = document.getElementById('shootCondition').value;
    if ((condition === "모델료 지급" || condition === "작가 촬영비 지급") && !document.getElementById('feeAmount').value) {
        alert("지급 금액을 입력해 주세요."); return false;
    }
    return true;
}

function validateStep2() {
    const pName = document.getElementById('photographerName').value;
    const p1 = document.getElementById('pPhone1').value;
    const p2 = document.getElementById('pPhone2').value;
    const mName = document.getElementById('modelName').value;
    const m1 = document.getElementById('mPhone1').value;
    const m2 = document.getElementById('mPhone2').value;

    if (!pName || !p1 || !p2 || !mName || !m1 || !m2) {
        alert("작가와 모델의 인적 사항을 모두 입력해 주세요."); return false;
    }
    return true;
}

// Canvas Logic
const canvasP = document.getElementById('canvasPhotographer');
const ctxP = canvasP.getContext('2d');
const canvasM = document.getElementById('canvasModel');
const ctxM = canvasM.getContext('2d');

let drawingState = { p: false, m: false };
let signedState = { p: false, m: false };

function readValue(id, fallback = '별도 기재 없음') {
    const value = document.getElementById(id).value.trim();
    return value || fallback;
}

function resizeCanvas(ctx, canvas) {
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    ctx.scale(ratio, ratio);
    
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = "#191f28";
    ctx.lineWidth = 5; // thicker for better visibility
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
}

function attachCanvasEvents(canvas, ctx, type) {
    const getPos = (e) => {
        const rect = canvas.getBoundingClientRect();
        if (e.touches && e.touches.length > 0) {
            return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
        }
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const start = (e) => {
        e.preventDefault(); drawingState[type] = true; signedState[type] = true;
        const pos = getPos(e); ctx.beginPath(); ctx.moveTo(pos.x, pos.y);
    };
    const move = (e) => {
        if (!drawingState[type]) return;
        e.preventDefault(); const pos = getPos(e); ctx.lineTo(pos.x, pos.y); ctx.stroke();
    };
    const end = (e) => { if (!drawingState[type]) return; e.preventDefault(); drawingState[type] = false; };

    canvas.addEventListener('touchstart', start, {passive: false});
    canvas.addEventListener('touchmove', move, {passive: false});
    canvas.addEventListener('touchend', end);
    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', move);
    canvas.addEventListener('mouseup', end);
    canvas.addEventListener('mouseout', end);
}

attachCanvasEvents(canvasP, ctxP, 'p');
attachCanvasEvents(canvasM, ctxM, 'm');

function clearSignature(canvasId) {
    if (canvasId === 'canvasPhotographer') {
        ctxP.fillStyle = "#ffffff"; ctxP.fillRect(0, 0, canvasP.width, canvasP.height); signedState.p = false;
    } else {
        ctxM.fillStyle = "#ffffff"; ctxM.fillRect(0, 0, canvasM.width, canvasM.height); signedState.m = false;
    }
}

// Document Generation
function generateDocument() {
    if (!signedState.m) {
        alert("모델 서명을 완료해 주세요."); return;
    }

    // Populate data
    document.getElementById('resDate').innerText = document.getElementById('shootDate').value;
    const condition = document.getElementById('shootCondition').value;
    const fee = document.getElementById('feeAmount').value;
    document.getElementById('resCondition').innerText = (condition === "모델료 지급" || condition === "작가 촬영비 지급") ? `${condition} (${fee})` : condition;

    const pPhone = `010-${document.getElementById('pPhone1').value}-${document.getElementById('pPhone2').value}`;
    const mPhone = `010-${document.getElementById('mPhone1').value}-${document.getElementById('mPhone2').value}`;
    
    document.getElementById('resPhotogName').innerText = document.getElementById('photographerName').value;
    document.getElementById('resSigPhotogName').innerText = document.getElementById('photographerName').value;
    document.getElementById('resPhotogPhone').innerText = pPhone;

    document.getElementById('resModelName').innerText = document.getElementById('modelName').value;
    document.getElementById('resSigModelName').innerText = document.getElementById('modelName').value;
    document.getElementById('resModelPhone').innerText = mPhone;

    document.getElementById('resPurpose').innerText = document.getElementById('usagePurpose').value;
    document.getElementById('resCommercial').innerText = document.querySelector('input[name="commercialUse"]:checked').value;
    document.getElementById('resRetouchedCount').innerText = readValue('retouchedCount');
    document.getElementById('resFirstDeliveryDeadline').innerText = readValue('firstDeliveryDeadline');
    document.getElementById('resDeliveryMethod').innerText = readValue('deliveryMethod');
    document.getElementById('resRawFileProvision').innerText = readValue('rawFileProvision');
    document.getElementById('resAdditionalNotes').innerText = readValue('additionalNotes');
    
    const today = new Date();
    document.getElementById('resToday').innerText = `${today.getFullYear()}년 ${today.getMonth()+1}월 ${today.getDate()}일`;

    document.getElementById('resPhotogSig').src = canvasP.toDataURL("image/png");
    document.getElementById('resModelSig').src = canvasM.toDataURL("image/png");

    nextStep(6);
}

// html2canvas export
function downloadImage() {
    const template = document.getElementById('exportTemplate');
    const btn = document.querySelector('.download-btn');
    const originalText = btn.innerText;
    
    btn.innerText = "⏳ 고해상도 변환 중...";
    btn.style.pointerEvents = "none";
    btn.style.opacity = "0.7";
    
    html2canvas(template, {
        scale: 3, 
        backgroundColor: "#ffffff", 
        logging: false, 
        useCORS: true
    }).then(canvas => {
        const link = document.createElement('a');
        const pName = document.getElementById('photographerName').value;
        const mName = document.getElementById('modelName').value;
        const today = new Date();
        const dateStr = `${today.getFullYear()}${(today.getMonth()+1).toString().padStart(2,'0')}${today.getDate().toString().padStart(2,'0')}`;
        
        link.download = `초상권동의서_${pName}_${mName}_${dateStr}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        
        btn.innerText = "✅ 갤러리에 저장 완료!";
        btn.style.backgroundColor = "#27ae60";
        setTimeout(() => { 
            btn.innerText = originalText;
            btn.style.pointerEvents = "auto";
            btn.style.opacity = "1";
            btn.style.backgroundColor = "var(--primary)";
        }, 3000);
    }).catch(err => {
        alert("이미지 저장 중 오류가 발생했습니다.");
        btn.innerText = originalText;
        btn.style.pointerEvents = "auto";
        btn.style.opacity = "1";
    });
}

// Init date
window.onload = function() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    document.getElementById('shootDate').value = `${yyyy}-${mm}-${dd}`;
};
