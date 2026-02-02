// ===================================
// Process Health Quiz Logic
// With Netlify Forms Integration
// ===================================

// Quiz state
let quizAnswers = {
    q1: null,
    q2: null,
    q3: null,
    q4: null,
    q5: null
};

let leadData = {
    name: '',
    email: '',
    company: '',
    doors: ''
};

// Start quiz
function startQuiz() {
    showScreen('quiz-q1');
}

// Show specific screen
function showScreen(screenId) {
    document.querySelectorAll('.quiz-screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// Answer question and move to next
function answerQuestion(questionNum, answer) {
    quizAnswers[`q${questionNum}`] = answer;

    // Move to next question or capture form
    if (questionNum < 5) {
        showScreen(`quiz-q${questionNum + 1}`);
    } else {
        showScreen('quiz-capture');
    }
}

// Submit lead form
async function submitLeadForm(event) {
    event.preventDefault();

    // Collect lead data
    leadData.name = document.getElementById('lead-name').value;
    leadData.email = document.getElementById('lead-email').value;
    leadData.company = document.getElementById('lead-company').value || 'Not provided';
    leadData.doors = document.getElementById('lead-doors').value || 'Not provided';

    // Calculate diagnosis
    const diagnosis = calculateDiagnosis();

    // Show loading state
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;

    // Submit to Netlify Forms
    try {
        await submitToNetlify(diagnosis);
        console.log('✅ Submission sent to Netlify Forms');
    } catch (error) {
        console.error('Failed to submit to Netlify:', error);
        // Continue anyway - show results even if submission fails
    }

    // Restore button
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;

    // Show results
    showResults();
}

// Submit to Netlify Forms
async function submitToNetlify(diagnosis) {
    const formData = new URLSearchParams();

    // Required Netlify field
    formData.append('form-name', 'quiz-submissions');

    // Lead info
    formData.append('name', leadData.name);
    formData.append('email', leadData.email);
    formData.append('company', leadData.company);
    formData.append('doors', leadData.doors);

    // Quiz answers (with descriptive names)
    formData.append('q1-process-completion', quizAnswers.q1 === 'yes' ? 'Below 75%' : '75% or higher');
    formData.append('q2-task-completion', formatQ2Answer(quizAnswers.q2));
    formData.append('q3-processes-per-door', quizAnswers.q3 === 'yes' ? 'Above 40%' : 'Below 40%');
    formData.append('q4-overdue-percentage', quizAnswers.q4 === 'yes' ? 'Above 50% overdue' : 'Below 50% overdue');
    formData.append('q5-processes-90-days', quizAnswers.q5 === 'yes' ? 'More than 150' : 'Fewer than 150');

    // Diagnosis results
    formData.append('diagnosis-status', diagnosis.status.toUpperCase());
    formData.append('diagnosis-title', diagnosis.title);
    formData.append('diagnosis-findings', diagnosis.findings.join('\n• '));
    formData.append('diagnosis-recommendations', diagnosis.recommendations.join('\n• '));

    const response = await fetch('/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString()
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
}

// Format Q2 answer for readability
function formatQ2Answer(answer) {
    switch(answer) {
        case 'below97': return 'Below 97%';
        case 'above97': return '97% or higher';
        case '100': return 'Exactly 100%';
        default: return answer;
    }
}

// Calculate diagnosis based on answers
function calculateDiagnosis() {
    let yesCount = 0;
    let diagnosis = {
        status: 'healthy',
        title: '',
        subtitle: '',
        findings: [],
        recommendations: []
    };

    // Count "yes" answers (problem indicators)
    if (quizAnswers.q1 === 'yes') yesCount++;
    if (quizAnswers.q2 === 'below97') yesCount++;
    if (quizAnswers.q3 === 'yes') yesCount++;
    if (quizAnswers.q4 === 'yes') yesCount++;
    if (quizAnswers.q5 === 'no') yesCount++; // "No" on Q5 is bad

    // Special case: 100% task completion is a warning
    const has100TaskCompletion = quizAnswers.q2 === '100';

    // Generate findings based on specific answer combinations
    if (quizAnswers.q1 === 'no' && (quizAnswers.q2 === 'below97' || quizAnswers.q2 === '100')) {
        diagnosis.findings.push("Your team is checking off tasks but not meaningfully completing processes. This suggests tasks may be getting skipped or auto-completed without the actual work being done.");
        diagnosis.recommendations.push("Audit task skipping behavior and review your process logic to ensure tasks are meaningful.");
    }

    if (quizAnswers.q1 === 'yes' && quizAnswers.q2 === 'above97') {
        diagnosis.findings.push("Tasks are getting done, but processes are stalling. This indicates bottlenecks, poor due date settings, or unclear ownership.");
        diagnosis.recommendations.push("Review your default due dates and ensure each process has clear ownership assigned.");
    }

    if (quizAnswers.q3 === 'yes') {
        diagnosis.findings.push("You have more active processes than recommended for your door count. This could indicate stuck, old, or backlogged processes.");
        diagnosis.recommendations.push("Clean up old processes and consider simplifying your workflow to reduce work-in-progress.");
    }

    if (quizAnswers.q4 === 'yes') {
        diagnosis.findings.push("Overdue processes are stacking up, which slows down your entire operation.");
        diagnosis.recommendations.push("Implement better pacing, regular review cycles, and accountability measures.");
    }

    if (quizAnswers.q5 === 'no') {
        diagnosis.findings.push("You're not running enough processes to support your team or portfolio. Your systems may feel irrelevant or too clunky to use consistently.");
        diagnosis.recommendations.push("Re-evaluate whether your processes match your actual business needs. Consider simplifying to increase adoption.");
    }

    if (has100TaskCompletion) {
        diagnosis.findings.push("⚠️ A 100% task completion rate is often misleading. Your team may not know the 'skip' button exists, meaning they could be completing tasks without actually doing the work.");
        diagnosis.recommendations.push("Train your team on when to use 'skip' vs 'complete' to get accurate data.");
    }

    // Determine overall status
    if (yesCount === 0 && !has100TaskCompletion) {
        diagnosis.status = 'healthy';
        diagnosis.title = '✅ Healthy Processes';
        diagnosis.subtitle = 'Your systems are running smoothly!';
        if (diagnosis.findings.length === 0) {
            diagnosis.findings.push("Great news! Your process completion and task metrics are within healthy ranges.");
            diagnosis.findings.push("Your active process count is manageable relative to your door count.");
            diagnosis.findings.push("You're actively using your system with good throughput.");
        }
        diagnosis.recommendations.push("Keep tracking your metrics and continue refining your workflows.");
        diagnosis.recommendations.push("Consider setting up regular review cycles to maintain this performance.");
    } else if (yesCount <= 2) {
        diagnosis.status = 'attention';
        diagnosis.title = '⚠️ Needs Attention';
        diagnosis.subtitle = "You're doing some things well, but there are areas to address.";
        if (diagnosis.recommendations.length === 0) {
            diagnosis.recommendations.push("Schedule time for a workflow cleanup session.");
            diagnosis.recommendations.push("Consider a process audit to identify specific bottlenecks.");
        }
    } else {
        diagnosis.status = 'critical';
        diagnosis.title = '🚨 Critical Issues Detected';
        diagnosis.subtitle = 'Your operations likely feel reactive or overwhelming.';
        if (diagnosis.recommendations.length === 0) {
            diagnosis.recommendations.push("It's time to simplify, re-engage your team, and rebuild processes with intention.");
            diagnosis.recommendations.push("Consider booking a consultation to get expert help with your process reset.");
        }
    }

    return diagnosis;
}

// Show results
function showResults() {
    const diagnosis = calculateDiagnosis();

    let html = `
        <div class="results-header">
            <h2>Your Process Health Report</h2>
            <p>Here's what we found based on your answers, ${leadData.name.split(' ')[0]}:</p>
        </div>

        <div class="results-score ${diagnosis.status}">
            <h3>${diagnosis.title}</h3>
            <p>${diagnosis.subtitle}</p>
        </div>

        <div class="diagnosis-details">
            <h4>📋 Key Findings:</h4>
            <ul>
                ${diagnosis.findings.map(f => `<li>${f}</li>`).join('')}
            </ul>
        </div>

        <div class="diagnosis-details">
            <h4>💡 Recommendations:</h4>
            <ul>
                ${diagnosis.recommendations.map(r => `<li>${r}</li>`).join('')}
            </ul>
        </div>
    `;

    document.getElementById('results-content').innerHTML = html;
    showScreen('quiz-results');
}

// Reset quiz
function resetQuiz() {
    quizAnswers = { q1: null, q2: null, q3: null, q4: null, q5: null };
    leadData = { name: '', email: '', company: '', doors: '' };

    // Clear form
    document.getElementById('lead-form').reset();

    // Go back to intro
    showScreen('quiz-intro');
}
