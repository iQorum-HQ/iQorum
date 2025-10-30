// Base URL for data fetching
const DATA_FILE = './quiz_data.json';

// DOM Elements
const quizContainer = document.getElementById('quiz-container');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const resultsContainer = document.getElementById('results-container');
const timerElement = document.getElementById('timer');

// Quiz State
let quizData = [];
let currentQuestionIndex = 0;
let score = 0;
let answerSelected = false;

// Timer State (for IQ test part)
let countdown = 10; // Time in seconds per IQ question
let timerInterval;

/**
 * Utility function to fetch quiz data from JSON file.
 */
async function fetchQuizData() {
    try {
        // Implement exponential backoff for robustness
        const maxRetries = 3;
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            const response = await fetch(DATA_FILE);
            if (response.ok) {
                return await response.json();
            }
            if (attempt < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            }
        }
        throw new Error('Failed to fetch quiz data after multiple retries.');
    } catch (error) {
        console.error('Error fetching quiz data:', error);
        questionText.textContent = 'Error loading quiz. Please try again later.';
        return [];
    }
}

/**
 * Initializes the quiz application.
 */
async function initQuiz() {
    // Hide results initially
    resultsContainer.style.display = 'none';
    timerElement.style.display = 'none';
    
    // 1. Fetch data
    const data = await fetchQuizData();
    if (data.length === 0) return;
    quizData = data;
    
    // 2. Start the quiz
    renderQuestion();
}

/**
 * Renders the current question and its options.
 */
function renderQuestion() {
    answerSelected = false; // Reset answer state
    
    if (currentQuestionIndex >= quizData.length) {
        // Quiz is over
        showResults();
        return;
    }
    
    const question = quizData[currentQuestionIndex];
    
    // Update main display
    questionText.textContent = `Question ${currentQuestionIndex + 1}: ${question.question}`;
    optionsContainer.innerHTML = ''; // Clear previous options
    
    // Create option buttons
    question.options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'option-button';
        button.textContent = option;
        button.addEventListener('click', () => handleAnswer(button, option, question.answer));
        optionsContainer.appendChild(button);
    });
    
    // Handle Timed Questions (IQ Test)
    if (question.type === 'iq' && question.is_timed) {
        startTimer();
    } else {
        stopTimer();
    }
}

/**
 * Starts the timer for timed questions.
 */
function startTimer() {
    stopTimer(); // Clear any existing timer
    timerElement.style.display = 'block';
    countdown = 10;
    timerElement.textContent = `Time Remaining: ${countdown}s`;

    timerInterval = setInterval(() => {
        countdown--;
        timerElement.textContent = `Time Remaining: ${countdown}s`;
        
        if (countdown <= 0) {
            // Time ran out
            stopTimer();
            handleAnswer(null, 'Time Out', quizData[currentQuestionIndex].answer);
        }
    }, 1000);
}

/**
 * Stops the timer.
 */
function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        timerElement.style.display = 'none';
    }
}

/**
 * Handles the user's answer selection.
 * @param {HTMLButtonElement} button The button element clicked (or null if time out).
 * @param {string} selectedOption The text of the option selected.
 * @param {string} correctAnswer The correct answer text.
 */
function handleAnswer(button, selectedOption, correctAnswer) {
    if (answerSelected) return;
    answerSelected = true;
    stopTimer();

    const isCorrect = selectedOption === correctAnswer;
    
    // Visual feedback
    Array.from(optionsContainer.children).forEach(btn => {
        btn.disabled = true; // Disable all buttons
        if (btn.textContent === correctAnswer) {
            btn.classList.add('correct'); // Highlight correct answer
        } else if (btn === button) {
            btn.classList.add('incorrect'); // Highlight incorrect answer
        }
    });

    if (isCorrect) {
        score++;
    }
    
    // Wait briefly before moving to the next question
    setTimeout(() => {
        currentQuestionIndex++;
        renderQuestion();
    }, 1500);
}

/**
 * Displays the final results summary.
 * This is where you would implement the logic for 'political leaning' and 'approximate IQ'.
 */
function showResults() {
    quizContainer.style.display = 'none';
    resultsContainer.style.display = 'block';
    
    let politicalLeaning = 'Neutral';
    let iqApprox = 'Average';
    
    // Simple placeholder logic for roadmap items
    if (score / quizData.length > 0.8) {
        iqApprox = 'High';
    } else if (score / quizData.length < 0.4) {
        iqApprox = 'Low';
    }
    
    // In a real app, you'd analyze individual answers to determine leaning/IQ
    
    resultsContainer.innerHTML = `
        <h2>Quiz Complete!</h2>
        <p>You scored **${score} out of ${quizData.length}** correct.</p>
        <p>Based on your responses, your Political Leaning is **${politicalLeaning}**.</p>
        <p>Your Approximate IQ Level is **${iqApprox}**.</p>
        <div id="discovery-section">
            <p>***Discovery Section Placeholder***</p>
            <p>This section would contain a prewritten or AI-generated summary about your results, linking to relevant discussions or articles (per Stage 1 of your roadmap).</p>
        </div>
        <button class="option-button" onclick="window.location.reload()">Start Over</button>
    `;
}

// Start the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initQuiz);
