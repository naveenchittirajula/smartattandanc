// DOM Elements
// Local Database Service (Mocking Backend)
const db = {
    saveUser: function(name, email, role) {
        let users = JSON.parse(localStorage.getItem('attendance_users')) || [];
        const exists = users.find(u => u.email === email);
        if(!exists) {
            users.push({ name, email, role, createdAt: new Date().toISOString() });
            localStorage.setItem('attendance_users', JSON.stringify(users));
            console.log("DB: User registered", name);
        }
    },
    getUser: function(email) {
        let users = JSON.parse(localStorage.getItem('attendance_users')) || [];
        return users.find(u => u.email === email);
    },
    markAttendance: function() {
        const email = document.getElementById('loginEmail').value || document.getElementById('registerEmail').value || 'Unknown User';
        const locElement = document.getElementById('deviceLocation');
        const ipElement = document.getElementById('deviceIp');
        
        let location = locElement ? locElement.innerText.trim() : "Unknown";
        let ip = ipElement ? ipElement.innerText.trim() : "Unknown";

        let records = JSON.parse(localStorage.getItem('attendance_records')) || [];
        records.push({
            email,
            status: "Present",
            timestamp: new Date().toISOString(),
            location,
            ipAddress: ip
        });
        localStorage.setItem('attendance_records', JSON.stringify(records));
        console.log("DB: Attendance recorded for", email);
    }
};

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

function showProfile(name, role, email) {
    // Update profile data
    document.getElementById('profileNameDisplay').innerText = name || "Student";
    const roleText = role === "teacher" ? "Teacher" : "Student";
    const roleIcon = role === "teacher" ? "fa-chalkboard-teacher" : "fa-graduation-cap";
    document.getElementById('profileRoleDisplay').innerHTML = `<i class="fas ${roleIcon}"></i> ${roleText}`;
    
    // Set avatar based on name
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "Student")}&background=random&color=fff&size=80`;
    document.getElementById('profileAvatar').src = avatarUrl;

    // Generate unique dynamic QR code for the student
    const qrData = encodeURIComponent(`user:${email}|name:${name}|role:${role}`);
    const qrImage = document.getElementById('dynamicQRCode');
    const qrPlaceholder = document.getElementById('qrPlaceholder');
    
    if (qrImage && qrPlaceholder) {
        qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrData}`;
        qrImage.style.display = 'block';
        qrPlaceholder.style.display = 'none';
    }

    // Reset status to pending
    const statusEl = document.getElementById('attendanceStatus');
    if(statusEl) {
        statusEl.className = 'status pending';
        statusEl.style.color = '#F59E0B';
        statusEl.innerHTML = `<i class="fas fa-clock"></i> Pending Scan`;
    }
    
    // Hide overlay
    const overlay = document.getElementById('scanSuccessOverlay');
    if(overlay) overlay.style.display = 'none';

    // Detect device details
    const platform = navigator.platform || 'Unknown OS';
    const ua = navigator.userAgent;
    let browser = "Unknown Browser";
    
    if(ua.includes("Firefox")) browser = "Firefox";
    else if(ua.includes("Edg")) browser = "Edge";
    else if(ua.includes("Chrome")) browser = "Chrome";
    else if(ua.includes("Safari")) browser = "Safari";
    
    document.getElementById('devicePlatform').innerHTML = `<i class="fas fa-mobile-alt"></i> ${platform}`;
    document.getElementById('deviceBrowser').innerHTML = `<i class="fas fa-globe"></i> ${browser}`;

    // Detect Location
    const locElement = document.getElementById('deviceLocation');
    locElement.innerHTML = `<i class="fas fa-map-marker-alt"></i> Requesting Location...`;
    
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18`);
                    const data = await response.json();
                    let locationName = "Unknown Location";
                    if (data && data.address) {
                        const road = data.address.road || data.address.pedestrian || "";
                        const localArea = data.address.suburb || data.address.neighbourhood || data.address.residential || data.address.village || data.address.city_district || "";
                        const city = data.address.city || data.address.town || data.address.county || "";
                        
                        let placeName = "";
                        if (road && localArea) {
                            placeName = `${road}, ${localArea}`;
                        } else if (localArea && city) {
                            placeName = `${localArea}, ${city}`;
                        } else if (localArea || city) {
                            placeName = localArea || city;
                        } else {
                            placeName = data.address.state || "Location Found";
                        }
                        
                        // Give the most accurate location by including exact coordinates
                        locationName = `${placeName} (Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)})`;
                    }
                    locElement.innerHTML = `<i class="fas fa-map-marker-alt" style="color: #10B981;"></i> ${locationName}`;
                } catch(e) {
                    locElement.innerHTML = `<i class="fas fa-map-marker-alt" style="color: #10B981;"></i> Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`;
                }
            },
            (error) => {
                locElement.innerHTML = `<i class="fas fa-map-marker-alt" style="color: #ef4444;"></i> Location Denied/Error`;
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    } else {
        locElement.innerHTML = `<i class="fas fa-map-marker-alt" style="color: #ef4444;"></i> Not Supported`;
    }

    // Detect IP (Anti-Cheat)
    const ipElement = document.getElementById('deviceIp');
    fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            ipElement.innerHTML = `<i class="fas fa-network-wired" style="color: #10B981;"></i> IP: ${data.ip}`;
        })
        .catch(err => {
            ipElement.innerHTML = `<i class="fas fa-network-wired" style="color: #ef4444;"></i> Network Error`;
        });

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
    let timeLeft = 45; // 45 seconds
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
    
    // Reset QR Code
    const qrImage = document.getElementById('dynamicQRCode');
    const qrPlaceholder = document.getElementById('qrPlaceholder');
    if (qrImage && qrPlaceholder) {
        qrImage.src = '';
        qrImage.style.display = 'none';
        qrPlaceholder.style.display = 'block';
    }
    
    clearInterval(qrTimerInterval);
    
    showLogin();
}

// Simulate scanning the QR code
function simulateScan() {
    if(!qrTimerInterval) return; // If timer is not running, it's either expired or already scanned

    // Stop the timer
    clearInterval(qrTimerInterval);
    qrTimerInterval = null;

    // Update Timer Text
    const timerDisplay = document.getElementById('qrTimer');
    if(timerDisplay) {
        timerDisplay.innerText = `(Attendance Marked)`;
        timerDisplay.style.color = '#10B981';
    }

    // Show Success Overlay on QR
    const overlay = document.getElementById('scanSuccessOverlay');
    if(overlay) {
        overlay.style.display = 'flex';
    }

    // Update Status to Present
    const statusEl = document.getElementById('attendanceStatus');
    if(statusEl) {
        statusEl.className = 'status present';
        statusEl.style.color = '#10B981';
        statusEl.innerHTML = `<i class="fas fa-check-circle"></i> Present`;
    }
    
    // Save to Database
    db.markAttendance();
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
    
    const user = db.getUser(email);
    const finalName = user ? user.name : (formattedName || "Student");
    const finalRole = user ? user.role : "student";
    
    // Animate button
    btnText.innerText = 'Logging in...';
    btnIcon.className = 'fas fa-circle-notch fa-spin';
    
    setTimeout(() => {
        // Reset button
        btnText.innerText = 'Login';
        btnIcon.className = 'fas fa-arrow-right';
        
        // Navigate to profile
        showProfile(finalName, finalRole, email);
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
        
        // Save to Database
        db.saveUser(name, email, role);
        
        // Alert and navigate
        alert('Account created successfully! Logging you in...');
        showProfile(name, role, email);
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

// Anti-Cheating: Tab Visibility Monitoring
document.addEventListener("visibilitychange", function() {
    if (document.visibilityState === 'hidden' && qrTimerInterval) {
        // User switched tabs while timer is running! Invalidate QR
        clearInterval(qrTimerInterval);
        const timerDisplay = document.getElementById('qrTimer');
        const qrBox = document.getElementById('qrBox');
        const expiredMsg = document.getElementById('qrExpiredMessage');
        
        if(timerDisplay && qrBox && expiredMsg) {
            timerDisplay.innerText = `(Invalidated: Tab Switched!)`;
            timerDisplay.style.color = '#ef4444';
            qrBox.style.opacity = '0.2';
            qrBox.style.pointerEvents = 'none';
            expiredMsg.innerText = 'WARNING: Proxy attendance attempt detected. QR Code Invalidated.';
            expiredMsg.style.display = 'block';
        }
    }
});

// Anti-Cheating: UI Lockdown
document.addEventListener('contextmenu', event => event.preventDefault()); // Disable right click
document.addEventListener('keydown', function(e) {
    // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
    if(e.key === 'F12' || 
      (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) || 
      (e.ctrlKey && (e.key === 'U' || e.key === 'S' || e.key === 'P'))) {
        e.preventDefault();
        alert("Anti-Cheating: Developer tools and saving are disabled.");
    }
});
