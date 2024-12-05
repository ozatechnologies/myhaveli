import { auth, database } from '../firebase-config.js';
import { 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Check if user is already logged in
onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.href = 'dashboard.html';
    }
});

// Toggle between login and register forms
window.toggleForms = function() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    if (loginForm && registerForm) {
        loginForm.classList.toggle('d-none');
        registerForm.classList.toggle('d-none');
    }
};

// Handle login
window.login = async function(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    try {
        const userCredential = await signInWithEmailAndPassword(
            auth,
            formData.get('email'),
            formData.get('password')
        );
        window.location.href = 'dashboard.html';
    } catch (error) {
        console.error('Login error:', error);
        alert(error.message);
    }
};

// Handle registration
window.register = async function(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    try {
        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            formData.get('email'),
            formData.get('password')
        );
        
        // Store additional user info in Realtime Database
        await set(ref(database, 'users/' + userCredential.user.uid), {
            username: formData.get('username'),
            email: formData.get('email'),
            createdAt: new Date().toISOString()
        });

        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    } catch (error) {
        console.error('Registration error:', error);
        let errorMessage = 'Registration failed';
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'This email is already registered';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Invalid email address';
                break;
            case 'auth/operation-not-allowed':
                errorMessage = 'Email/password accounts are not enabled';
                break;
            case 'auth/weak-password':
                errorMessage = 'Password is too weak';
                break;
            default:
                errorMessage = error.message;
        }
        alert(errorMessage);
    }
};
