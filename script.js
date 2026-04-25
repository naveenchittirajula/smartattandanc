// DOM Elements
const loginSection = document.getElementById('loginSection');
const registerSection = document.getElementById('registerSection');
const profileSection = document.getElementById('profileSection');
const profileBackground = document.getElementById('profileBackground');
const bgShapes = document.getElementById('bgShapes');

// Timer variables
let qrTimerInterval;

// Navigation functions
function hideAllSections() {
    loginSection.classList.remove('active');
    registerSection.classList.remove('active');
    profileSection.classList.remove('active');
    
    loginSection.style.display = 'none';
    registerSection.style.display = 'none';
    profileSection.style.display = 'none';
}

function showRegister() {
    hideAllSections();
    setTimeout(() => {
        registerSection.style.display = 'block';
        setTimeout(() => registerSection.classList.add('active'), 50);
    }, 400);
}

function showLogin() {
    hideAllSections();
    setTimeout(() => {
        loginSection.style.display = 'block';
        setTimeout(() => loginSection.classList.add('active'), 50);
    }, 400);
}

function showProfile(name, role) {
    // Update profile data
    document.getElementById('profileNameDisplay').innerText = name || "Student";
    const roleText = role === "teacher" ? "Teacher" : "Student";
    const roleIcon = role === "teacher" ? "fa-chalkboard-teacher" : "fa-graduation-cap";
    document.getElementById('profileRoleDisplay').innerHTML = `<i class="fas ${roleIcon}"></i> ${roleText}`;
    
    // Set avatar based on name
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "Student")}&background=random&color=fff&size=80`;
    document.getElementById('profileAvatar').src = avatarUrl;

    hideAllSections();
    
    // Fade in background image and hide floating shapes
    profileBackground.style.opacity = '1';
    bgShapes.style.opacity = '0';

    setTimeout(() => {
        profileSection.style.display = 'block';
        setTimeout(() => {
            profileSection.classList.add('active');
            startQrTimer();
        }, 50);
    }, 400);
}

function startQrTimer() {
    clearInterval(qrTimerInterval);
    let timeLeft = 390; // 390 seconds = 6m 30s
    const timerDisplay = document.getElementById('qrTimer');
    const qrBox = document.getElementById('qrBox');
    const expiredMsg = document.getElementById('qrExpiredMessage');
    
    if(!timerDisplay || !qrBox || !expiredMsg) return;
    
    qrBox.style.opacity = '1';
    qrBox.style.pointerEvents = 'auto';
    expiredMsg.style.display = 'none';
    
    // Initial display
    const initMin = Math.floor(timeLeft / 60);
    const initSec = timeLeft % 60;
    timerDisplay.innerText = `(Expires in ${initMin}:${initSec.toString().padStart(2, '0')})`;
    
    qrTimerInterval = setInterval(() => {
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.innerText = `(Expires in ${minutes}:${seconds.toString().padStart(2, '0')})`;
        
        if (timeLeft <= 0) {
            clearInterval(qrTimerInterval);
            timerDisplay.innerText = `(Expired)`;
            qrBox.style.opacity = '0.2';
            qrBox.style.pointerEvents = 'none';
            expiredMsg.style.display = 'block';
        }
    }, 1000);
}

function logout() {
    // Hide background image and show floating shapes
    profileBackground.style.opacity = '0';
    bgShapes.style.opacity = '1';
    
    // Clear inputs
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
    
    clearInterval(qrTimerInterval);
    
    showLogin();
}

// Logic implementations
function login() {
    const email = document.getElementById('loginEmail').value;
    const btnText = document.getElementById('loginBtnText');
    const btnIcon = document.getElementById('loginBtnIcon');
    
    if(!email) return alert("Please enter your email address to login.");
    
    // Extract name from email for demo purposes (e.g., john@email.com -> John)
    const name = email.split('@')[0].replace(/[^a-zA-Z]/g, ' ');
    const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
    
    // Animate button
    btnText.innerText = 'Logging in...';
    btnIcon.className = 'fas fa-circle-notch fa-spin';
    
    setTimeout(() => {
        // Reset button
        btnText.innerText = 'Login';
        btnIcon.className = 'fas fa-arrow-right';
        
        // Navigate to profile
        showProfile(formattedName || "Student", "student");
    }, 1200);
}

function register() {
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const role = document.getElementById('registerRole').value;
    
    const btnText = document.getElementById('regBtnText');
    const btnIcon = document.getElementById('regBtnIcon');
    
    if(!name || !email || !role) return alert("Please fill all fields to create an account.");
    
    // Animate button
    btnText.innerText = 'Creating Account...';
    btnIcon.className = 'fas fa-circle-notch fa-spin';
    
    setTimeout(() => {
        // Reset button
        btnText.innerText = 'Create Account';
        btnIcon.className = 'fas fa-check';
        
        // Alert and navigate
        alert('Account created successfully! Logging you in...');
        showProfile(name, role);
    }, 1500);
}

// Add input focus effects
document.querySelectorAll('input, select').forEach(element => {
    element.addEventListener('focus', function() {
        const icon = this.previousElementSibling;
        if(icon && icon.classList.contains('input-icon')) {
            icon.style.color = 'var(--primary)';
        }
    });
    
    element.addEventListener('blur', function() {
        const icon = this.previousElementSibling;
        if(icon && icon.classList.contains('input-icon')) {
            icon.style.color = 'var(--text-muted)';
        }
    });
});
