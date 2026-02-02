/**
 * Quote Builder JavaScript
 * Process Architect Theme - Modal Version
 * Simplified: Pricing hidden until after lead capture
 */

// Process names for display
const processNames = {
    owner_sales: 'Owner Sales Pipeline',
    owner_onboarding: 'Owner/Property Onboarding',
    pma_renewal: 'PMA Renewal',
    make_ready: 'Make Ready',
    marketing: 'Property Marketing',
    renter_lead: 'Renter Lead Pipeline',
    application: 'Application / Move-In',
    lease_renewal: 'Lease Renewal',
    delinquency: 'Delinquency',
    eviction: 'Eviction / Collections',
    moveout: 'Move-Out',
    inspections: 'Periodic Inspections',
    vendor: 'Vendor Onboarding',
    work_orders: 'Work Order Management',
    emp_onboard: 'Employee Onboarding',
    emp_offboard: 'Employee Offboarding',
    hoa: 'HOA Management',
    accounting: 'Invoice & Bill Management'
};

// Pricing tiers (kept internal for form submission)
const tiers = {
    sop: [
        { min: 2, max: 2, price: 1700 },
        { min: 3, max: 3, price: 1575 },
        { min: 4, max: 6, price: 1400 },
        { min: 7, max: 9, price: 1200 },
        { min: 10, max: Infinity, price: 1000 }
    ],
    process: [
        { min: 2, max: 2, price: 3400 },
        { min: 3, max: 3, price: 3150 },
        { min: 4, max: 6, price: 2800 },
        { min: 7, max: 9, price: 2400 },
        { min: 10, max: Infinity, price: 2000 }
    ]
};

// State
let currentService = null;
let selectedProcesses = new Set();
let currentTotal = 0;
let currentPrice = 0;
let currentSavings = 0;

/**
 * Open the quote modal
 */
function openQuoteModal(service) {
    currentService = service;
    selectedProcesses.clear();

    // Reset UI
    document.querySelectorAll('.process-item').forEach(item => item.classList.remove('selected'));

    // Update modal title
    const title = service === 'process' ? 'Select Your Processes' : 'Select Your SOPs';
    document.getElementById('modal-service-title').textContent = title;
    document.getElementById('quote-count-label').textContent = service === 'process' ? 'processes selected' : 'SOPs selected';

    // Show modal step 1
    document.getElementById('modal-step-1').style.display = 'block';
    document.getElementById('modal-step-2').style.display = 'none';
    document.getElementById('modal-step-3').style.display = 'none';

    // Show modal
    document.getElementById('quote-modal').classList.add('active');
    document.body.style.overflow = 'hidden';

    // Update quote
    updateQuote();
}

/**
 * Close the modal
 */
function closeModal() {
    document.getElementById('quote-modal').classList.remove('active');
    document.body.style.overflow = '';

    // Reset state
    currentService = null;
    selectedProcesses.clear();
    currentTotal = 0;
    currentPrice = 0;
    currentSavings = 0;

    // Reset form
    const form = document.getElementById('quote-form');
    if (form) form.reset();
}

/**
 * Go to step 1 (back from step 2)
 */
function goToStep1() {
    document.getElementById('modal-step-1').style.display = 'block';
    document.getElementById('modal-step-2').style.display = 'none';
}

/**
 * Go to step 2 (lead capture)
 */
function goToStep2() {
    if (selectedProcesses.size < 2) return;

    document.getElementById('modal-step-1').style.display = 'none';
    document.getElementById('modal-step-2').style.display = 'block';

    // Update preview (just service and count)
    updateFormPreview();
}

/**
 * Toggle process selection
 */
function toggleProcess(el, id) {
    el.classList.toggle('selected');

    if (selectedProcesses.has(id)) {
        selectedProcesses.delete(id);
    } else {
        selectedProcesses.add(id);
    }

    updateQuote();
}

/**
 * Update the quote calculation (internal) and sidebar count
 */
function updateQuote() {
    const count = selectedProcesses.size;
    const tierList = tiers[currentService];
    const basePrice = currentService === 'process' ? 3400 : 1700;

    // Find current tier (for internal calculation)
    const tier = tierList.find(t => Math.max(count, 2) >= t.min && Math.max(count, 2) <= t.max);
    currentPrice = tier ? tier.price : tierList[0].price;

    // Calculate totals (internal)
    currentTotal = count >= 2 ? count * currentPrice : 0;
    currentSavings = count >= 2 ? (count * basePrice) - currentTotal : 0;

    // Update count display only
    const quoteCount = document.getElementById('quote-count');
    if (quoteCount) quoteCount.textContent = count;

    // CTA button
    const cta = document.getElementById('quote-cta');
    if (cta) {
        if (count >= 2) {
            cta.disabled = false;
            cta.textContent = 'Get Your Quote';
        } else {
            cta.disabled = true;
            cta.textContent = `Select at least ${2 - count} more`;
        }
    }

    // Hint
    const hint = document.getElementById('quote-hint');
    if (hint) {
        if (count >= 2) {
            hint.style.display = 'none';
        } else {
            hint.style.display = 'block';
            hint.textContent = 'Minimum 2 processes required';
        }
    }
}

/**
 * Update form preview (step 2 - just service and count)
 */
function updateFormPreview() {
    const serviceName = currentService === 'process' ? 'Process Builds' : 'SOP Creation';
    const count = selectedProcesses.size;

    const previewService = document.getElementById('preview-service');
    if (previewService) previewService.textContent = serviceName;

    const previewCount = document.getElementById('preview-count');
    if (previewCount) previewCount.textContent = count;

    // Update hidden form fields
    const selectedProcessNamesList = Array.from(selectedProcesses).map(id => processNames[id] || id);
    const timeline = currentService === 'process' ? `~${count} months` : `~${count} weeks`;

    const formServiceType = document.getElementById('form-service-type');
    if (formServiceType) formServiceType.value = serviceName;

    const formProcessCount = document.getElementById('form-process-count');
    if (formProcessCount) formProcessCount.value = count;

    const formProcesses = document.getElementById('form-processes');
    if (formProcesses) formProcesses.value = selectedProcessNamesList.join(', ');

    const formPricePerUnit = document.getElementById('form-price-per-unit');
    if (formPricePerUnit) formPricePerUnit.value = currentPrice;

    const formTotal = document.getElementById('form-total');
    if (formTotal) formTotal.value = currentTotal;

    const formSavings = document.getElementById('form-savings');
    if (formSavings) formSavings.value = currentSavings;

    const formTimeline = document.getElementById('form-timeline');
    if (formTimeline) formTimeline.value = timeline;
}

/**
 * Show confirmation with full pricing details
 */
function showConfirmation(email) {
    // Hide step 2, show step 3
    document.getElementById('modal-step-2').style.display = 'none';
    document.getElementById('modal-step-3').style.display = 'block';

    // Populate confirmation data
    const serviceName = currentService === 'process' ? 'Process Builds' : 'SOP Creation';
    const count = selectedProcesses.size;
    const unit = currentService === 'process' ? 'processes' : 'SOPs';
    const timeline = currentService === 'process' ? `~${count} months` : `~${count} weeks`;

    const confirmEmail = document.getElementById('confirm-email');
    if (confirmEmail) confirmEmail.textContent = email;

    const confirmService = document.getElementById('confirm-service');
    if (confirmService) confirmService.textContent = serviceName;

    const confirmCount = document.getElementById('confirm-count');
    if (confirmCount) confirmCount.textContent = `${count} ${unit}`;

    const confirmTotal = document.getElementById('confirm-total');
    if (confirmTotal) confirmTotal.textContent = '$' + currentTotal.toLocaleString();

    const confirmPerUnit = document.getElementById('confirm-per-unit');
    if (confirmPerUnit) confirmPerUnit.textContent = '$' + currentPrice.toLocaleString();

    const confirmSavings = document.getElementById('confirm-savings');
    if (confirmSavings) confirmSavings.textContent = currentSavings > 0 ? '-$' + currentSavings.toLocaleString() : '$0';

    const confirmTimeline = document.getElementById('confirm-timeline');
    if (confirmTimeline) confirmTimeline.textContent = timeline;
}

// Form submission handler
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('quote-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const formData = new FormData(this);

            // For Netlify Forms, just show confirmation
            // Netlify handles the actual form submission
            showConfirmation(email);
        });
    }

    // Close modal on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });

    // Close modal on overlay click
    const overlay = document.getElementById('quote-modal');
    if (overlay) {
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                closeModal();
            }
        });
    }
});
