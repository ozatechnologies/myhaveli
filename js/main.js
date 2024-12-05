// Button click handlers
document.addEventListener('DOMContentLoaded', function() {
    // Navigation buttons
    const dashboardBtn = document.querySelector('[data-nav="dashboard"]');
    if (dashboardBtn) {
        dashboardBtn.addEventListener('click', () => {
            window.location.href = 'pages/dashboard.html';
        });
    }

    const haveliListBtn = document.querySelector('[data-nav="haveli-list"]');
    if (haveliListBtn) {
        haveliListBtn.addEventListener('click', () => {
            window.location.href = 'pages/haveli-list.html';
        });
    }

    // Add Haveli button
    const addHaveliBtn = document.querySelector('[data-action="add-haveli"]');
    if (addHaveliBtn) {
        addHaveliBtn.addEventListener('click', () => {
            window.location.href = 'pages/add-haveli.html';
        });
    }

    // Edit Haveli button
    const editButtons = document.querySelectorAll('[data-action="edit-haveli"]');
    editButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const haveliId = e.target.closest('[data-haveli-id]').dataset.haveliId;
            window.location.href = `pages/add-haveli.html?id=${haveliId}`;
        });
    });

    // Delete Haveli button
    const deleteButtons = document.querySelectorAll('[data-action="delete-haveli"]');
    deleteButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const haveliId = e.target.closest('[data-haveli-id]').dataset.haveliId;
            if (confirm('Are you sure you want to delete this haveli?')) {
                deleteHaveli(haveliId);
            }
        });
    });

    // View Details button
    const viewButtons = document.querySelectorAll('[data-action="view-details"]');
    viewButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const haveliId = e.target.closest('[data-haveli-id]').dataset.haveliId;
            window.location.href = `pages/haveli-details.html?id=${haveliId}`;
        });
    });

    // Search and Filter
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterHavelis, 300));
    }

    const filterSelects = document.querySelectorAll('[data-filter]');
    filterSelects.forEach(select => {
        select.addEventListener('change', filterHavelis);
    });

    // Form submission
    const haveliForm = document.getElementById('haveli-form');
    if (haveliForm) {
        haveliForm.addEventListener('submit', handleFormSubmit);
    }

    // Image upload preview
    const imageInput = document.querySelector('input[type="file"]');
    if (imageInput) {
        imageInput.addEventListener('change', handleImagePreview);
    }
});

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function filterHavelis() {
    const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
    const styleFilter = document.getElementById('style-filter')?.value || '';
    const locationFilter = document.getElementById('location-filter')?.value || '';

    const haveliCards = document.querySelectorAll('[data-haveli-id]');
    haveliCards.forEach(card => {
        const haveliName = card.querySelector('.haveli-name')?.textContent.toLowerCase() || '';
        const haveliStyle = card.querySelector('.haveli-style')?.textContent || '';
        const haveliLocation = card.querySelector('.haveli-location')?.textContent || '';

        const matchesSearch = haveliName.includes(searchTerm);
        const matchesStyle = !styleFilter || haveliStyle === styleFilter;
        const matchesLocation = !locationFilter || haveliLocation === locationFilter;

        if (matchesSearch && matchesStyle && matchesLocation) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });

    updateNoResultsMessage();
}

function updateNoResultsMessage() {
    const visibleCards = document.querySelectorAll('[data-haveli-id]:not([style*="display: none"])');
    const noResultsMessage = document.getElementById('no-results');
    
    if (noResultsMessage) {
        if (visibleCards.length === 0) {
            noResultsMessage.classList.remove('d-none');
        } else {
            noResultsMessage.classList.add('d-none');
        }
    }
}

function handleImagePreview(event) {
    const previewContainer = document.getElementById('image-preview');
    if (!previewContainer) return;

    previewContainer.innerHTML = '';
    const files = event.target.files;

    for (const file of files) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const previewDiv = document.createElement('div');
            previewDiv.className = 'col-md-4 mb-3';
            previewDiv.innerHTML = `
                <div class="position-relative">
                    <img src="${e.target.result}" class="img-fluid rounded" alt="Preview">
                    <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 m-2"
                            onclick="this.parentElement.parentElement.remove()">
                        <i class="bi bi-x"></i>
                    </button>
                </div>
            `;
            previewContainer.appendChild(previewDiv);
        };
        reader.readAsDataURL(file);
    }
}

async function handleFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    
    try {
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Saving...';
        
        // Form submission logic will be handled by the specific page's JavaScript
        // (auth.js, add-haveli.js, etc.)
        
    } catch (error) {
        console.error('Form submission error:', error);
        alert('An error occurred while saving. Please try again.');
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = 'Save';
    }
}

// Export functions for use in other modules
export {
    filterHavelis,
    handleImagePreview,
    handleFormSubmit
};
