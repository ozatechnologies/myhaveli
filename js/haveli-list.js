import { auth, database } from '../firebase-config.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { ref, get, query, orderByChild, equalTo, remove, set } from 'firebase/database';

let currentUser = null;
let haveliList = [];

// Check authentication state
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        loadHavelis();
        populateFilters();
    } else {
        window.location.href = 'auth.html';
    }
});

// Load all havelis for the current user
async function loadHavelis() {
    try {
        console.log('Loading havelis for user:', currentUser.uid);
        const haveliQuery = query(
            ref(database, 'havelis'),
            orderByChild('userId'),
            equalTo(currentUser.uid)
        );
        
        console.log('Fetching havelis from database...');
        const snapshot = await get(haveliQuery);
        
        haveliList = [];
        if (snapshot.exists()) {
            console.log('Found havelis:', snapshot.val());
            snapshot.forEach((childSnapshot) => {
                haveliList.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });
            console.log('Processed haveli list:', haveliList);
        } else {
            console.log('No havelis found in database');
        }
        
        displayHavelis(haveliList);
    } catch (error) {
        console.error('Error loading havelis:', error);
        alert('Failed to load havelis. Error: ' + error.message);
    }
}

// Display havelis in the grid
function displayHavelis(havelis) {
    const grid = document.getElementById('haveli-grid');
    const noResults = document.getElementById('no-results');
    
    grid.innerHTML = '';
    
    if (havelis.length === 0) {
        grid.classList.add('d-none');
        noResults.classList.remove('d-none');
        return;
    }
    
    grid.classList.remove('d-none');
    noResults.classList.add('d-none');
    
    havelis.forEach(haveli => {
        const card = document.createElement('div');
        card.className = 'col-md-6 col-lg-4';
        card.innerHTML = `
            <div class="card h-100">
                <div class="card-img-top" style="height: 200px; background-image: url('${haveli.images?.[0] || '../assets/placeholder.jpg'}'); 
                     background-size: cover; background-position: center;">
                </div>
                <div class="card-body">
                    <h5 class="card-title">${haveli.name}</h5>
                    <p class="card-text text-muted">
                        <i class="bi bi-geo-alt"></i> ${haveli.location}
                    </p>
                    <p class="card-text">${haveli.description?.substring(0, 100)}...</p>
                </div>
                <div class="card-footer bg-transparent">
                    <div class="d-flex justify-content-between align-items-center">
                        <a href="haveli-details.html?id=${haveli.id}" class="btn btn-primary">
                            View Details
                        </a>
                        <div>
                            <button class="btn btn-outline-primary btn-sm" 
                                    onclick="editHaveli('${haveli.id}')">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-outline-danger btn-sm" 
                                    onclick="showDeleteModal('${haveli.id}')">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Populate filter dropdowns
function populateFilters() {
    const styles = new Set();
    const locations = new Set();
    
    haveliList.forEach(haveli => {
        if (haveli.architecturalStyle) styles.add(haveli.architecturalStyle);
        if (haveli.location) locations.add(haveli.location);
    });
    
    const styleFilter = document.getElementById('style-filter');
    const locationFilter = document.getElementById('location-filter');
    
    styles.forEach(style => {
        const option = document.createElement('option');
        option.value = style;
        option.textContent = style;
        styleFilter.appendChild(option);
    });
    
    locations.forEach(location => {
        const option = document.createElement('option');
        option.value = location;
        option.textContent = location;
        locationFilter.appendChild(option);
    });
}

// Apply search and filters
window.applyFilters = function() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const selectedStyle = document.getElementById('style-filter').value;
    const selectedLocation = document.getElementById('location-filter').value;
    
    const filteredHavelis = haveliList.filter(haveli => {
        const matchesSearch = !searchTerm || 
            haveli.name.toLowerCase().includes(searchTerm) ||
            haveli.description?.toLowerCase().includes(searchTerm);
            
        const matchesStyle = !selectedStyle || 
            haveli.architecturalStyle === selectedStyle;
            
        const matchesLocation = !selectedLocation || 
            haveli.location === selectedLocation;
            
        return matchesSearch && matchesStyle && matchesLocation;
    });
    
    displayHavelis(filteredHavelis);
};

// Navigate to edit page
window.editHaveli = function(haveliId) {
    window.location.href = `add-haveli.html?id=${haveliId}`;
};

// Show delete confirmation modal
window.showDeleteModal = function(haveliId) {
    const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
    modal.show();
    
    document.querySelector('#deleteModal .btn-danger')
            .onclick = () => confirmDelete(haveliId);
};

// Handle haveli deletion
async function confirmDelete(haveliId) {
    try {
        await remove(ref(database, `havelis/${haveliId}`));
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
        modal.hide();
        loadHavelis();
    } catch (error) {
        console.error('Error deleting haveli:', error);
        alert('Failed to delete haveli');
    }
}

// Handle logout
window.logout = async function() {
    try {
        await signOut(auth);
        window.location.href = 'auth.html';
    } catch (error) {
        console.error('Error signing out:', error);
        alert('Failed to log out');
    }
};

// Add a test haveli (temporary function for testing)
async function addTestHaveli() {
    try {
        const newHaveliRef = ref(database, `havelis/${Date.now()}`);
        const testHaveli = {
            name: "Test Haveli",
            location: "Test Location",
            description: "This is a test haveli entry",
            userId: currentUser.uid,
            createdAt: new Date().toISOString()
        };
        
        await set(newHaveliRef, testHaveli);
        console.log('Test haveli added successfully');
        loadHavelis(); // Reload the list
    } catch (error) {
        console.error('Error adding test haveli:', error);
        alert('Failed to add test haveli: ' + error.message);
    }
}

// Add button to test functionality
document.addEventListener('DOMContentLoaded', () => {
    const addButton = document.querySelector('[data-action="add-haveli"]');
    if (addButton) {
        addButton.addEventListener('click', (e) => {
            e.preventDefault();
            addTestHaveli();
        });
    }
});
