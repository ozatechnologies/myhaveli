import { auth, database } from '../firebase-config.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { ref, get, remove } from 'firebase/database';

let currentUser = null;
let currentHaveliId = null;

// Initialize lightgallery for image viewing
document.addEventListener('DOMContentLoaded', () => {
    lightGallery(document.getElementById('lightgallery'), {
        speed: 500,
        download: false
    });
});

// Check authentication state and load haveli data
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        
        // Get haveli ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        currentHaveliId = urlParams.get('id');
        
        if (currentHaveliId) {
            await loadHaveliDetails(currentHaveliId);
        } else {
            alert('No haveli specified');
            window.location.href = 'haveli-list.html';
        }
    } else {
        window.location.href = 'auth.html';
    }
});

// Load haveli details
async function loadHaveliDetails(haveliId) {
    try {
        const haveliRef = ref(database, `havelis/${haveliId}`);
        const snapshot = await get(haveliRef);
        
        if (snapshot.exists()) {
            const haveli = snapshot.val();
            
            // Verify ownership
            if (haveli.userId !== currentUser.uid) {
                alert('You do not have permission to view this haveli');
                window.location.href = 'haveli-list.html';
                return;
            }
            
            // Update page content
            document.getElementById('haveli-name').textContent = haveli.name;
            document.getElementById('haveli-location').textContent = haveli.location;
            document.getElementById('year-built').textContent = haveli.yearBuilt || 'Not specified';
            document.getElementById('architectural-style').textContent = haveli.architecturalStyle || 'Not specified';
            document.getElementById('materials').textContent = haveli.materials || 'Not specified';
            document.getElementById('traditional-elements').textContent = haveli.traditionalElements || 'Not specified';
            document.getElementById('cultural-significance').textContent = haveli.culturalSignificance || 'Not specified';
            document.getElementById('description').textContent = haveli.description || 'No description available';
            document.getElementById('history').textContent = haveli.history || 'No historical information available';
            
            // Display images
            if (haveli.images && haveli.images.length > 0) {
                const gallery = document.getElementById('lightgallery');
                gallery.innerHTML = '';
                
                haveli.images.forEach((imageUrl, index) => {
                    const col = document.createElement('div');
                    col.className = 'col-md-4 mb-3';
                    col.innerHTML = `
                        <a href="${imageUrl}" class="gallery-item">
                            <img src="${imageUrl}" class="img-fluid rounded" 
                                 alt="Haveli image ${index + 1}">
                        </a>
                    `;
                    gallery.appendChild(col);
                });
            } else {
                document.getElementById('lightgallery').innerHTML = `
                    <div class="col-12 text-center py-5">
                        <p class="text-muted">No images available</p>
                    </div>
                `;
            }
        } else {
            alert('Haveli not found');
            window.location.href = 'haveli-list.html';
        }
    } catch (error) {
        console.error('Error loading haveli details:', error);
        alert('Failed to load haveli details');
    }
}

// Handle edit button click
window.editHaveli = function() {
    window.location.href = `add-haveli.html?id=${currentHaveliId}`;
};

// Show delete confirmation modal
window.showDeleteModal = function() {
    const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
    modal.show();
};

// Handle haveli deletion
window.deleteHaveli = async function() {
    try {
        await remove(ref(database, `havelis/${currentHaveliId}`));
        window.location.href = 'haveli-list.html';
    } catch (error) {
        console.error('Error deleting haveli:', error);
        alert('Failed to delete haveli');
    }
};

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
