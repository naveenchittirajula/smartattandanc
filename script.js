// DOM Elements
const loginSection = document.getElementById('loginSection');
const registerSection = document.getElementById('registerSection');

// Toggle between sections
function showRegister() {
    loginSection.classList.remove('active');
    setTimeout(() => {
        loginSection.style.display = 'none';
        registerSection.style.display = 'block';
        setTimeout(() => {
            registerSection.classList.add('active');
        }, 50);
    }, 400); // Matches CSS transition duration
}

function showLogin() {
    registerSection.classList.remove('active');
    setTimeout(() => {
        registerSection.style.display = 'none';
        loginSection.style.display = 'block';
        setTimeout(() => {
            loginSection.classList.add('active');
        }, 50);
    }, 400);
}

// Dummy functions for form submission
function login() {
    const email = document.getElementById('loginEmail').value;
    const btn = document.querySelector('#loginSection .btn-primary');
    
    if(!email) return alert("Please enter email address");
    
    // Animate button
    const originalContent = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Logging in...';
    
    setTimeout(() => {
        btn.innerHTML = originalContent;
        alert('Login functionality to be implemented!');
    }, 1500);
}

function register() {
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const role = document.getElementById('registerRole').value;
    
    const btn = document.querySelector('#registerSection .btn-primary');
    
    if(!name || !email || !role) return alert("Please fill all fields");
    
    // Animate button
    const originalContent = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Creating...';
    
    setTimeout(() => {
        btn.innerHTML = originalContent;
        alert('Registration functionality to be implemented!');
        showLogin();
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
