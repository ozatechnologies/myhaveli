// Firebase configuration
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';
import { getDatabase, ref, set, get, child, push, remove, query, orderByChild, equalTo } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-storage.js';

const firebaseConfig = {
    apiKey: "AIzaSyBRqrPEWRGXeOmKOqxZPzgGUuRRiYMWwIg",
    authDomain: "bangtanmessenger-e2c5b.firebaseapp.com",
    databaseURL: "https://bangtanmessenger-e2c5b-default-rtdb.firebaseio.com",
    projectId: "bangtanmessenger-e2c5b",
    storageBucket: "bangtanmessenger-e2c5b.appspot.com",
    messagingSenderId: "1093517274702",
    appId: "1:1093517274702:web:4e4c1a7c6b7c7d2e8c8c8c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);

// Helper function to safely get elements
function getElement(id) {
    const element = document.getElementById(id);
    return element;
}

// Navigation functions
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const section = getElement(sectionId);
    if (section) section.classList.add('active');
}

// Manorath functions
function showAddManorath() {
    const manorathsList = getElement('manorathsList');
    if (manorathsList) {
        manorathsList.innerHTML = `
            <form id="addManorathForm">
                <input type="text" id="manorathName" placeholder="Manorath Name" required>
                <input type="date" id="manorathDate" required>
                <textarea id="manorathDescription" placeholder="Description"></textarea>
                <button type="submit">Add Manorath</button>
            </form>
        `;
        
        const addManorathForm = getElement('addManorathForm');
        if (addManorathForm) {
            addManorathForm.addEventListener('submit', addManorath);
        }
    }
}

async function addManorath(e) {
    e.preventDefault();
    const manorathData = {
        name: document.getElementById('manorathName').value,
        date: document.getElementById('manorathDate').value,
        description: document.getElementById('manorathDescription').value,
        createdAt: new Date().toISOString()
    };
    
    try {
        await set(ref(database, 'manoraths/' + Date.now()), manorathData);
        alert('Manorath added successfully!');
        loadManoraths();
    } catch (error) {
        alert('Error adding manorath: ' + error.message);
    }
}

async function loadManoraths() {
    try {
        const snapshot = await get(child(ref(database), 'manoraths'));
        const manorathsList = getElement('manorathsList');
        if (manorathsList) {
            manorathsList.innerHTML = '';
            
            if (snapshot.exists()) {
                snapshot.forEach((child) => {
                    const manorath = child.val();
                    manorathsList.innerHTML += `
                        <div class="manorath-card">
                            <h3>${manorath.name}</h3>
                            <p>Date: ${manorath.date}</p>
                            <p>${manorath.description}</p>
                        </div>
                    `;
                });
            } else {
                manorathsList.innerHTML = '<p>No manoraths found</p>';
            }
        }
    } catch (error) {
        console.error('Error loading manoraths:', error);
    }
}

// User functions
function showAddUser() {
    const usersList = getElement('usersList');
    if (usersList) {
        usersList.innerHTML = `
            <form id="addUserForm">
                <input type="email" id="userEmail" placeholder="Email" required>
                <input type="text" id="userName" placeholder="Name" required>
                <select id="userRole">
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>
                <button type="submit">Add User</button>
            </form>
        `;
        
        const addUserForm = getElement('addUserForm');
        if (addUserForm) {
            addUserForm.addEventListener('submit', addUser);
        }
    }
}

async function addUser(e) {
    e.preventDefault();
    const userData = {
        email: document.getElementById('userEmail').value,
        name: document.getElementById('userName').value,
        role: document.getElementById('userRole').value,
        createdAt: new Date().toISOString()
    };
    
    try {
        await set(ref(database, 'users/' + Date.now()), userData);
        alert('User added successfully!');
        loadUsers();
    } catch (error) {
        alert('Error adding user: ' + error.message);
    }
}

async function loadUsers() {
    try {
        const snapshot = await get(child(ref(database), 'users'));
        const usersList = getElement('usersList');
        if (usersList) {
            usersList.innerHTML = '';
            
            if (snapshot.exists()) {
                snapshot.forEach((child) => {
                    const user = child.val();
                    usersList.innerHTML += `
                        <div class="user-card">
                            <h3>${user.name}</h3>
                            <p>Email: ${user.email}</p>
                            <p>Role: ${user.role}</p>
                        </div>
                    `;
                });
            } else {
                usersList.innerHTML = '<p>No users found</p>';
            }
        }
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Update UI based on authentication state
function updateUI(user) {
    const navDashboard = getElement('nav-dashboard');
    const navHavelis = getElement('nav-havelis');
    const navLogin = getElement('nav-login');

    if (user) {
        // User is signed in
        if (navDashboard) navDashboard.style.display = 'block';
        if (navHavelis) navHavelis.style.display = 'block';
        if (navLogin) navLogin.style.display = 'none';
    } else {
        // No user is signed in
        if (navDashboard) navDashboard.style.display = 'none';
        if (navHavelis) navHavelis.style.display = 'none';
        if (navLogin) navLogin.style.display = 'block';
    }
}

// Handle page-specific initialization
function initializePage() {
    const currentPath = window.location.pathname;
    
    if (currentPath.includes('dashboard.html')) {
        const dashboardSection = getElement('dashboard');
        if (dashboardSection) {
            dashboardSection.style.display = 'block';
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Initialize page-specific elements
    initializePage();
    
    // Listen for auth state changes
    onAuthStateChanged(auth, (user) => {
        updateUI(user);
        
        // Handle redirects based on authentication state
        const currentPath = window.location.pathname;
        if (user) {
            // User is signed in
            if (currentPath.includes('auth.html')) {
                window.location.href = 'dashboard.html';
            }
        } else {
            // No user is signed in
            if (currentPath.includes('dashboard.html') || 
                currentPath.includes('haveli-list.html') || 
                currentPath.includes('add-haveli.html')) {
                window.location.href = 'auth.html';
            }
        }
    });
    
    showSection('dashboard');
    loadManoraths();
    loadUsers();
});

// Global state
let currentUser = null;

// UI Helper Functions
window.showLoginForm = function() {
    const loginForm = getElement('login-form');
    const registerForm = getElement('register-form');
    if (loginForm) loginForm.classList.remove('d-none');
    if (registerForm) registerForm.classList.add('d-none');
};

window.showRegisterForm = function() {
    const loginForm = getElement('login-form');
    const registerForm = getElement('register-form');
    if (loginForm) loginForm.classList.add('d-none');
    if (registerForm) registerForm.classList.remove('d-none');
};

window.showHaveliForm = function() {
    const haveliForm = getElement('haveli-form');
    if (haveliForm) haveliForm.classList.remove('d-none');
};

// Auth Functions
window.register = async function(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    try {
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            formData.get('email'),
            formData.get('password')
        );
        
        // Store additional user info in the database
        await set(ref(database, 'users/' + userCredential.user.uid), {
            username: formData.get('username'),
            email: formData.get('email'),
            createdAt: new Date().toISOString()
        });

        alert('Registration successful! Please login.');
        showLoginForm();
    } catch (error) {
        alert('Registration failed: ' + error.message);
    }
};

window.login = async function(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    try {
        const userCredential = await signInWithEmailAndPassword(
            auth,
            formData.get('email'),
            formData.get('password')
        );
        currentUser = userCredential.user;
        updateUI(userCredential.user);
    } catch (error) {
        alert('Login failed: ' + error.message);
    }
};

window.logout = async function() {
    try {
        await signOut(auth);
        currentUser = null;
        updateUI(null);
    } catch (error) {
        alert('Logout failed: ' + error.message);
    }
};

// Haveli Management Functions
window.createHaveli = async function(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    try {
        // Create a new haveli reference
        const newHaveliRef = push(ref(database, 'havelis'));
        
        // Upload images if any
        const imageFiles = formData.getAll('images');
        const imageUrls = [];
        
        for (const imageFile of imageFiles) {
            const imageRef = storageRef(storage, `haveli-images/${newHaveliRef.key}/${imageFile.name}`);
            const snapshot = await uploadBytes(imageRef, imageFile);
            const downloadUrl = await getDownloadURL(snapshot.ref);
            imageUrls.push(downloadUrl);
        }

        // Save haveli data
        await set(newHaveliRef, {
            userId: currentUser.uid,
            name: formData.get('name'),
            location: formData.get('location'),
            yearBuilt: formData.get('year_built'),
            architecturalStyle: formData.get('architectural_style'),
            nyochavar: formData.get('nyochavar'),
            description: formData.get('description'),
            history: formData.get('history'),
            images: imageUrls,
            createdAt: new Date().toISOString()
        });

        alert('Haveli created successfully!');
        event.target.reset();
        const haveliForm = getElement('haveli-form');
        if (haveliForm) haveliForm.classList.add('d-none');
        loadHavelis();
    } catch (error) {
        alert('Failed to create haveli: ' + error.message);
    }
};

async function loadHavelis() {
    try {
        const haveliQuery = query(
            ref(database, 'havelis'),
            orderByChild('userId'),
            equalTo(currentUser.uid)
        );
        
        const snapshot = await get(haveliQuery);
        const haveliList = getElement('haveli-list');
        if (haveliList) {
            haveliList.innerHTML = '';

            if (snapshot.exists()) {
                snapshot.forEach((childSnapshot) => {
                    const haveli = childSnapshot.val();
                    const card = document.createElement('div');
                    card.className = 'col-md-4 mb-4';
                    card.innerHTML = `
                        <div class="card">
                            ${haveli.images && haveli.images.length > 0 ? 
                                `<img src="${haveli.images[0]}" class="card-img-top" alt="${haveli.name}">` : ''}
                            <div class="card-body">
                                <h5 class="card-title">${haveli.name}</h5>
                                <h6 class="card-subtitle mb-2 text-muted">${haveli.location}</h6>
                                <p class="card-text">${haveli.description}</p>
                                <button class="btn btn-primary btn-sm me-2" onclick="viewHaveli('${childSnapshot.key}')">View Details</button>
                                <button class="btn btn-danger btn-sm" onclick="deleteHaveli('${childSnapshot.key}')">Delete</button>
                            </div>
                        </div>
                    `;
                    haveliList.appendChild(card);
                });
            }
        }
    } catch (error) {
        alert('Failed to load havelis: ' + error.message);
    }
}

window.viewHaveli = async function(haveliId) {
    try {
        const snapshot = await get(ref(database, `havelis/${haveliId}`));
        if (snapshot.exists()) {
            const haveli = snapshot.val();
            alert(`
                Name: ${haveli.name}
                Location: ${haveli.location}
                Year Built: ${haveli.yearBuilt || 'N/A'}
                Architectural Style: ${haveli.architecturalStyle || 'N/A'}
                Nyochavar: ${haveli.nyochavar || 'N/A'}
                History: ${haveli.history || 'N/A'}
            `);
        }
    } catch (error) {
        alert('Failed to view haveli: ' + error.message);
    }
};

window.deleteHaveli = async function(haveliId) {
    if (!confirm('Are you sure you want to delete this haveli?')) {
        return;
    }

    try {
        await remove(ref(database, `havelis/${haveliId}`));
        alert('Haveli deleted successfully!');
        loadHavelis();
    } catch (error) {
        alert('Failed to delete haveli: ' + error.message);
    }
};
