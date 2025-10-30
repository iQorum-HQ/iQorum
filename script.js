// --- Global State ---
let allQuizData = null;
let politicsAnswers = {};
let iqAnswers = {};
let currentPoliticsIndex = 0;
let currentIqIndex = 0;
let timeLeft = 600; // 10 minutes in seconds
let iqTimer;

// --- DOM References ---
const politicsContainer = document.getElementById('politics-question-container');
const iqContainer = document.getElementById('iq-question-container');
const politicsResultDiv = document.getElementById('politics-result');
const iqResultDiv = document.getElementById('iq-result');

// --- Initialization ---

/** Fetches quiz data and initializes the app. */
async function initApp() {
    try {
        // Fetch the external JSON data
        const response = await fetch('quiz_data.json');
        const data = await response.json();
        // Separate politics and iq questions from the single array for easier indexing
        allQuizData = {
            politicsQuestions: data.filter(q => q.type === 'politics'),
            iqQuestions: data.filter(q => q.type === 'iq')
        };
    } catch (error) {
        console.error('Error loading quiz data:', error);
        // Using a custom alert replacement since window.alert() is forbidden
        document.getElementById('home').innerHTML = `
            <div style="padding: 20px; background: #fdd; border: 1px solid #f99; border-radius: 10px; text-align: center;">
                <strong>Error Loading App</strong>
                <p>Failed to load quiz questions. Please ensure <code>quiz_data.json</code> is accessible.</p>
            </div>
        `;
        return;
    }
    
    // Set up initial view and event listeners
    setupTabNavigation();
    setupAppCardNavigation();
    setupForumTabs();
    setupFaqAccordion();
    setupRestartButtons();
    setupFeedbackForm();
    
    // Render all IQ questions once (they are hidden by default)
    renderAllIqQuestions(); 
    // Render the first politics question
    renderPoliticsQuestion();
}

// --- Navigation and Utility Functions (Copied/Modified from original script) ---

function setupTabNavigation() {
    const tabs = document.querySelectorAll('.tab');
    const sections = document.querySelectorAll('.section');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === tabName) {
                    section.classList.add('active');
                    
                    // Specific logic for IQ tab
                    if (tabName === 'iq') {
                        // Start timer only if not showing results
                        if (iqResultDiv.style.display !== 'block') {
                            startIqTimer();
                        }
                    } else if (tabName !== 'iq' && iqTimer) {
                        clearInterval(iqTimer); // Stop timer if navigating away
                    }
                }
            });
        });
    });
}

function setupAppCardNavigation() {
    const appCards = document.querySelectorAll('.app-card');
    appCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Check if the click was directly on the button or the card itself
            if (e.target.classList.contains('btn') || card.getAttribute('data-app')) {
                const app = card.getAttribute('data-app');
                const targetTab = document.querySelector(`.tab[data-tab="${app}"]`);
                if (targetTab) {
                    targetTab.click(); // Simulate tab click to switch sections
                }
            }
        });
    });
}

function setupForumTabs() {
    const forumTabs = document.querySelectorAll('.forum-tab');
    const forumContents = document.querySelectorAll('.forum-content');
    
    forumTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const forumId = tab.getAttribute('data-forum');
            
            forumTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            forumContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${forumId}-forum`) {
                    content.classList.add('active');
                }
            });
        });
    });
}

function setupFaqAccordion() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;
            const isVisible = answer.style.display === 'block';
            
            // Close all answers
            document.querySelectorAll('.faq-answer').forEach(ans => {
                ans.style.display = 'none';
                ans.previousElementSibling.querySelector('i').className = 'fas fa-chevron-down';
            });
            
            // Open this answer if it was closed
            if (!isVisible) {
                answer.style.display = 'block';
                question.querySelector('i').className = 'fas fa-chevron-up';
            }
        });
    });
}

function setupFeedbackForm() {
    // Placeholder for Feedback form submission
    document.querySelector('#faq .btn').addEventListener('click', (e) => {
        e.preventDefault(); 
        console.log('Feedback submitted (Placeholder)');
        // In the next stage (Supabase), this will be replaced with actual submission logic.
        
        // Custom modal message replacement for alert()
        const modal = document.createElement('div');
        modal.className = 'custom-modal';
        modal.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: white; padding: 30px; border-radius: 15px; box-shadow: 0 5px 25px rgba(0,0,0,0.3);
            z-index: 1000; text-align: center; max-width: 80%;
        `;
        modal.innerHTML = `
            <i class="fas fa-check-circle" style="color: var(--success); font-size: 40px; margin-bottom: 10px;"></i>
            <h3>Feedback Received!</h3>
            <p>Thank you for your feedback! (In Stage 2, this would be sent to Supabase.)</p>
            <button onclick="this.parentElement.remove()" class="btn" style="margin-top: 20px;">Close</button>
        `;
        document.body.appendChild(modal);
    });
    
    // Placeholder for Sign In button
    document.querySelector('.login-btn').addEventListener('click', () => {
        console.log('Sign In button clicked (Placeholder)');
        const modal = document.createElement('div');
        modal.className = 'custom-modal';
        modal.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: white; padding: 30px; border-radius: 15px; box-shadow: 0 5px 25px rgba(0,0,0,0.3);
            z-index: 1000; text-align: center; max-width: 80%;
        `;
        modal.innerHTML = `
            <i class="fas fa-user-circle" style="color: var(--primary); font-size: 40px; margin-bottom: 10px;"></i>
            <h3>Authentication Coming Soon!</h3>
            <p>We'll integrate Supabase authentication here in the next stage.</p>
            <button onclick="this.parentElement.remove()" class="btn" style="margin-top: 20px;">Got It</button>
        `;
        document.body.appendChild(modal);
    });
}

// --- Political Test Logic (Dynamic Rendering) ---

function renderPoliticsQuestion() {
    if (!allQuizData) return;
    const questions = allQuizData.politicsQuestions;

    // Check for end of test
    if (currentPoliticsIndex >= questions.length) {
        showPoliticsResult();
        return;
    }
    
    politicsResultDiv.style.display = 'none';
    politicsContainer.innerHTML = ''; // Clear container

    const questionData = questions[currentPoliticsIndex];
    const questionEl = document.createElement('div');
    questionEl.className = 'question active';
    questionEl.id = `politics-question-${questionData.id}`;
    
    // Question Text
    questionEl.innerHTML = `<div class="question-text">${questionData.id}. ${questionData.text}</div><div class="options"></div>`;
    
    // Options
    const optionsEl = questionEl.querySelector('.options');
    questionData.options.forEach(option => {
        const optionEl = document.createElement('div');
        optionEl.className = 'option';
        optionEl.textContent = option.text;
        optionEl.setAttribute('data-value', option.value);
        
        optionEl.addEventListener('click', () => handlePoliticsAnswer(optionEl));
        optionsEl.appendChild(optionEl);
    });
    
    politicsContainer.appendChild(questionEl);
    
    // Update progress bar
    const progressPercentage = ((currentPoliticsIndex + 1) / questions.length) * 100;
    document.getElementById('politics-progress').style.width = `${progressPercentage}%`;
}

function handlePoliticsAnswer(selectedOptionEl) {
    // Disable all options for the current question
    selectedOptionEl.parentElement.querySelectorAll('.option').forEach(opt => {
        opt.classList.remove('selected');
        opt.style.pointerEvents = 'none'; 
    });
    selectedOptionEl.classList.add('selected');

    // Store answer
    const questionId = selectedOptionEl.closest('.question').id;
    politicsAnswers[questionId] = selectedOptionEl.getAttribute('data-value');

    // Move to next question after delay
    setTimeout(() => {
        currentPoliticsIndex++;
        renderPoliticsQuestion();
    }, 800);
}

// Political Result Calculation (Copied directly from original script logic)
function calculatePoliticalResult(answers) {
    let leftRightScore = 0;
    let authLibScore = 0;
    
    for (const question in answers) {
        const answer = answers[question];
        
        if (answer === 'left') leftRightScore -= 1;
        if (answer === 'right') leftRightScore += 1;
        if (answer === 'auth') authLibScore += 1;
        if (answer === 'lib') authLibScore -= 1;
    }
    
    // Normalize scores to a 0-100 range: Max score is 10, Min is -10. Range is 20.
    // Score of -10 should be 0%, 10 should be 100%. (score * 5) + 50 achieves this.
    const x = 50 + (leftRightScore * 5); // Left/Right (Economic) axis
    const y = 50 + (authLibScore * 5); // Auth/Lib (Social) axis

    let label = '';
    let description = '';
    
    // Using the original logic's boundary conditions (e.g. < 40, > 60) based on the intended 0-100 scale.
    if (x < 25 && y < 25) {
        label = 'Libertarian Left';
        description = 'You favor personal freedom and economic equality.';
    } else if (x < 25 && y > 75) {
        label = 'Authoritarian Left';
        description = 'You favor economic equality and strong social structure.';
    } else if (x > 75 && y < 25) {
        label = 'Libertarian Right';
        description = 'You favor free markets and personal freedom.';
    } else if (x > 75 && y > 75) {
        label = 'Authoritarian Right';
        description = 'You favor strong authority and free markets.';
    } else if (x < 40) {
        label = 'Left-Leaning';
        description = 'You generally favor economic equality.';
    } else if (x > 60) {
        label = 'Right-Leaning';
        description = 'You generally favor free markets.';
    } else if (y < 40) {
        label = 'Libertarian';
        description = 'You generally favor personal freedom.';
    } else if (y > 60) {
        label = 'Authoritarian';
        description = 'You generally favor strong social structure.';
    } else {
        label = 'Centrist';
        description = 'You show balanced views on both economic and social dimensions.';
    }
    
    return { x, y, label, description };
}

function showPoliticsResult() {
    politicsContainer.innerHTML = ''; // Hide questions
    politicsResultDiv.style.display = 'block';
    
    const result = calculatePoliticalResult(politicsAnswers);
    document.getElementById('politics-score').textContent = result.label;
    document.getElementById('politics-description').textContent = result.description;
    
    // Position point on compass (0-100%)
    document.getElementById('user-point').style.top = `${result.y}%`;
    document.getElementById('user-point').style.left = `${result.x}%`;

    // Update profile stats (Placeholder)
    document.querySelector('.profile-stats .stat-card:nth-child(1) .stat-value').textContent = result.label;
}

// --- IQ Test Logic (Dynamic Rendering) ---

function renderAllIqQuestions() {
    // Only render if the data is available and the container is empty
    if (!allQuizData || iqContainer.children.length > 0) return; 
    const questions = allQuizData.iqQuestions;
    
    questions.forEach((questionData, index) => {
        const questionEl = document.createElement('div');
        questionEl.className = 'question';
        questionEl.id = `iq-question-${questionData.id}`;

        // Question Text
        questionEl.innerHTML = `<div class="question-text">${questionData.id}. ${questionData.text}</div><div class="options"></div>`;

        // Options
        const optionsEl = questionEl.querySelector('.options');
        questionData.options.forEach(optionText => {
            const optionEl = document.createElement('div');
            optionEl.className = 'option';
            optionEl.textContent = optionText;

            optionEl.addEventListener('click', () => handleIqAnswer(optionEl, questionData.correctAnswer));
            optionsEl.appendChild(optionEl);
        });
        iqContainer.appendChild(questionEl);
        
        // Activate the very first question only
        if (index === 0) {
            questionEl.classList.add('active');
        }
    });
}

function handleIqAnswer(selectedOptionEl, correctAnswer) {
    const currentQuestionEl = selectedOptionEl.closest('.question');
    const questionId = currentQuestionEl.id;

    // Check if question has already been answered (guard against double clicks)
    if (iqAnswers[questionId]) return;

    // Disable all options and mark selection
    currentQuestionEl.querySelectorAll('.option').forEach(opt => {
        opt.classList.remove('selected');
        opt.style.pointerEvents = 'none'; 
    });
    selectedOptionEl.classList.add('selected');

    // Store answer
    const selectedText = selectedOptionEl.textContent;
    iqAnswers[questionId] = selectedText === correctAnswer ? 'correct' : 'incorrect';
    
    // Update progress
    currentIqIndex++;
    const progressPercentage = (currentIqIndex / allQuizData.iqQuestions.length) * 100;
    document.getElementById('iq-progress').style.width = `${progressPercentage}%`;

    // Move to next question after delay
    setTimeout(() => {
        // Hide current, show next
        currentQuestionEl.classList.remove('active');
        
        if (currentIqIndex < allQuizData.iqQuestions.length) {
            // Find next question element by ID
            const nextQuestionEl = document.getElementById(`iq-question-${currentIqIndex + 1}`);
            if (nextQuestionEl) {
                nextQuestionEl.classList.add('active');
            }
        } else {
            showIqResult();
        }
    }, 800);
}

function startIqTimer() {
    if (iqResultDiv.style.display === 'block') return; // Don't start if results are showing
    clearInterval(iqTimer);
    timeLeft = 600; // Reset to 10 minutes
    updateIqTimer();
    
    iqTimer = setInterval(() => {
        timeLeft--;
        updateIqTimer();
        
        if (timeLeft <= 0) {
            clearInterval(iqTimer);
            showIqResult();
        }
    }, 1000);
}

function updateIqTimer() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById('iq-timer').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function showIqResult() {
    clearInterval(iqTimer);
    document.getElementById('iq-timer').textContent = 'Test Complete';
    iqContainer.innerHTML = ''; // Hide questions
    iqResultDiv.style.display = 'block';
    
    // Calculate score
    let score = 0;
    for (const question in iqAnswers) {
        if (iqAnswers[question] === 'correct') {
            score++;
        }
    }
    
    // Map score to IQ (simplified for demo, same as original script)
    const iqScore = 90 + (score * 5);
    document.getElementById('iq-score').textContent = iqScore;
    
    // Description based on score
    let description = '';
    if (iqScore < 90) description = 'This places you in the below average range.';
    else if (iqScore < 110) description = 'This places you in the average range.';
    else if (iqScore < 130) description = 'This places you in the above average range.';
    else description = 'This places you in the superior range.';
    
    document.getElementById('iq-description').textContent = description;
    
    // Update profile stats (Placeholder)
    document.querySelector('.profile-stats .stat-card:nth-child(2) .stat-value').textContent = iqScore;
}

// --- Restart Logic ---

function setupRestartButtons() {
    document.getElementById('politics-restart').addEventListener('click', () => {
        politicsResultDiv.style.display = 'none';
        politicsContainer.innerHTML = '';
        document.getElementById('politics-progress').style.width = '0%';
        politicsAnswers = {};
        currentPoliticsIndex = 0;
        renderPoliticsQuestion();
    });
    
    document.getElementById('iq-restart').addEventListener('click', () => {
        iqResultDiv.style.display = 'none';
        // Re-enable question containers
        iqContainer.innerHTML = '';
        renderAllIqQuestions();
        
        document.getElementById('iq-progress').style.width = '0%';
        iqAnswers = {};
        currentIqIndex = 0;
        startIqTimer();
    });
}

// Start the application after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);
