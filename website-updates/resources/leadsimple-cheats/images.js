// ===================================
// Image Upload & Management System
// ===================================

// Storage key prefix
const IMAGE_STORAGE_PREFIX = 'pa_screenshot_';

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadSavedImages();
    setupDragAndDrop();
});

// Trigger file upload
function triggerUpload(uploadId) {
    document.getElementById(`upload-${uploadId}`).click();
}

// Handle image upload via file input
function handleImageUpload(input, containerId) {
    const file = input.files[0];
    if (file) {
        processImageFile(file, containerId);
    }
}

// Process the image file
function processImageFile(file, containerId) {
    if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('Image is too large. Please use an image under 5MB.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const imageData = e.target.result;
        displayImage(containerId, imageData);
        saveImage(containerId, imageData);
    };
    reader.readAsDataURL(file);
}

// Display image in container
function displayImage(containerId, imageData) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
        <img src="${imageData}" alt="Screenshot">
        <button class="remove-image-btn" onclick="removeImage('${containerId}')" title="Remove image">×</button>
    `;

    // Add styles for remove button
    const btn = container.querySelector('.remove-image-btn');
    btn.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: none;
        background: rgba(0,0,0,0.7);
        color: white;
        font-size: 20px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
    `;
    btn.onmouseover = () => btn.style.background = 'rgba(220,50,50,0.9)';
    btn.onmouseout = () => btn.style.background = 'rgba(0,0,0,0.7)';

    container.style.border = '2px solid #9CAF88';
    container.style.padding = '0';
}

// Save image to localStorage
function saveImage(containerId, imageData) {
    try {
        localStorage.setItem(IMAGE_STORAGE_PREFIX + containerId, imageData);
    } catch (e) {
        console.warn('Could not save image to localStorage:', e);
        alert('Image displayed but could not be saved. LocalStorage may be full.');
    }
}

// Remove image
function removeImage(containerId) {
    const container = document.getElementById(containerId);
    const uploadId = containerId.replace('screenshot-', '');

    // Restore placeholder
    container.innerHTML = `
        <div class="screenshot-placeholder">
            <span>📸</span>
            <p>Screenshot</p>
            <small>Drag & drop your screenshot here, or <button onclick="triggerUpload('${uploadId}')" class="btn btn-secondary" style="font-size: 0.85rem; padding: 0.5rem 1rem;">Upload Image</button></small>
        </div>
        <input type="file" id="upload-${uploadId}" accept="image/*" style="display: none;" onchange="handleImageUpload(this, '${containerId}')">
    `;

    container.style.border = '2px dashed #D1D6CD';
    container.style.padding = '2rem';

    // Remove from storage
    localStorage.removeItem(IMAGE_STORAGE_PREFIX + containerId);
}

// Load saved images on page load
function loadSavedImages() {
    const containers = document.querySelectorAll('.screenshot-container');
    containers.forEach(container => {
        const savedImage = localStorage.getItem(IMAGE_STORAGE_PREFIX + container.id);
        if (savedImage) {
            displayImage(container.id, savedImage);
        }
    });
}

// Setup drag and drop for all containers
function setupDragAndDrop() {
    const containers = document.querySelectorAll('.screenshot-container');

    containers.forEach(container => {
        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            container.style.borderColor = '#2D4739';
            container.style.background = '#E8EFE3';
        });

        container.addEventListener('dragleave', (e) => {
            e.preventDefault();
            container.style.borderColor = '#D1D6CD';
            container.style.background = '#F5F7F4';
        });

        container.addEventListener('drop', (e) => {
            e.preventDefault();
            container.style.borderColor = '#D1D6CD';
            container.style.background = '#F5F7F4';

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                processImageFile(files[0], container.id);
            }
        });
    });
}

// ===================================
// Admin Functions for Images
// ===================================

// Export all images as JSON (for backup)
function exportAllImages() {
    const images = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(IMAGE_STORAGE_PREFIX)) {
            images[key] = localStorage.getItem(key);
        }
    }

    const blob = new Blob([JSON.stringify(images)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `screenshots-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();

    console.log(`✅ Exported ${Object.keys(images).length} images`);
}

// Import images from JSON backup
function importImages(jsonFile) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const images = JSON.parse(e.target.result);
            Object.keys(images).forEach(key => {
                localStorage.setItem(key, images[key]);
            });
            console.log(`✅ Imported ${Object.keys(images).length} images. Refresh to see them.`);
            location.reload();
        } catch (err) {
            console.error('Failed to import images:', err);
        }
    };
    reader.readAsText(jsonFile);
}

// Clear all saved images
function clearAllImages() {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(IMAGE_STORAGE_PREFIX)) {
            keys.push(key);
        }
    }
    keys.forEach(key => localStorage.removeItem(key));
    console.log(`✅ Cleared ${keys.length} images. Refresh to see changes.`);
}

console.log(`
╔════════════════════════════════════════════════╗
║         IMAGE MANAGEMENT COMMANDS              ║
╠════════════════════════════════════════════════╣
║                                                ║
║  exportAllImages()  - Backup all screenshots   ║
║  clearAllImages()   - Remove all screenshots   ║
║                                                ║
╚════════════════════════════════════════════════╝
`);
