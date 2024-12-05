import { auth, database, storage } from '../firebase-config.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { ref as dbRef, get, set } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

let currentUser = null;
let editingHaveliId = null;

// Check authentication state and load data if editing
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        
        // Check if we're editing an existing haveli
        const urlParams = new URLSearchParams(window.location.search);
        editingHaveliId = urlParams.get('id');
        
        if (editingHaveliId) {
            document.getElementById('form-title').textContent = 'Edit Haveli';
            await loadHaveliData(editingHaveliId);
        }
    } else {
        window.location.href = 'auth.html';
    }
});

// Load existing haveli data for editing
async function loadHaveliData(haveliId) {
    try {
        const haveliRef = dbRef(database, `havelis/${haveliId}`);
        const snapshot = await get(haveliRef);
        
        if (snapshot.exists()) {
            const haveli = snapshot.val();
            
            // Verify ownership
            if (haveli.userId !== currentUser.uid) {
                alert('You do not have permission to edit this haveli');
                window.location.href = 'haveli-list.html';
                return;
            }
            
            // Populate form fields
            const form = document.getElementById('haveli-form');
            Object.entries(haveli).forEach(([key, value]) => {
                const input = form.elements[key];
                if (input && key !== 'images') {
                    input.value = value;
                }
            });
            
            // Display existing images
            if (haveli.images) {
                displayImagePreviews(haveli.images);
            }
        } else {
            alert('Haveli not found');
            window.location.href = 'haveli-list.html';
        }
    } catch (error) {
        console.error('Error loading haveli data:', error);
        alert('Failed to load haveli data');
    }
}

// Display image previews
function displayImagePreviews(imageUrls) {
    const previewContainer = document.getElementById('image-preview');
    previewContainer.innerHTML = '';
    
    imageUrls.forEach((url, index) => {
        const col = document.createElement('div');
        col.className = 'col-md-4';
        col.innerHTML = `
            <div class="position-relative">
                <img src="${url}" class="img-fluid rounded" alt="Haveli image ${index + 1}">
                <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 m-2"
                        onclick="removeImage(${index})">
                    <i class="bi bi-x"></i>
                </button>
            </div>
        `;
        previewContainer.appendChild(col);
    });
}

// Handle form submission
window.saveHaveli = async function(event) {
    event.preventDefault();
    
    try {
        const form = event.target;
        const formData = new FormData(form);
        const haveliData = {};
        
        // Collect form data
        for (const [key, value] of formData.entries()) {
            if (key !== 'images') {
                haveliData[key] = value;
            }
        }
        
        // Add metadata
        haveliData.userId = currentUser.uid;
        if (editingHaveliId) {
            haveliData.updatedAt = new Date().toISOString();
        } else {
            haveliData.createdAt = new Date().toISOString();
        }
        
        // Handle image uploads
        const imageFiles = form.elements.images.files;
        if (imageFiles.length > 0) {
            const imageUrls = await uploadImages(imageFiles);
            
            // If editing, merge with existing images
            if (editingHaveliId) {
                const existingHaveli = (await get(dbRef(database, `havelis/${editingHaveliId}`))).val();
                haveliData.images = [...(existingHaveli.images || []), ...imageUrls];
            } else {
                haveliData.images = imageUrls;
            }
        }
        
        // Save to database
        const haveliId = editingHaveliId || dbRef(database, 'havelis').push().key;
        await set(dbRef(database, `havelis/${haveliId}`), haveliData);
        
        // Redirect to details page
        window.location.href = `haveli-details.html?id=${haveliId}`;
    } catch (error) {
        console.error('Error saving haveli:', error);
        alert('Failed to save haveli');
    }
};

// Upload images to Firebase Storage
async function uploadImages(files) {
    const imageUrls = [];
    
    for (const file of files) {
        const fileRef = storageRef(storage, `havelis/${currentUser.uid}/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);
        imageUrls.push(url);
    }
    
    return imageUrls;
}

// Remove image from preview
window.removeImage = async function(index) {
    if (!editingHaveliId) return;
    
    try {
        const haveliRef = dbRef(database, `havelis/${editingHaveliId}`);
        const snapshot = await get(haveliRef);
        
        if (snapshot.exists()) {
            const haveli = snapshot.val();
            const images = [...haveli.images];
            images.splice(index, 1);
            
            await set(haveliRef, { ...haveli, images });
            displayImagePreviews(images);
        }
    } catch (error) {
        console.error('Error removing image:', error);
        alert('Failed to remove image');
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
