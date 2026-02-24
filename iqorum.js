document.addEventListener('DOMContentLoaded', function() {
    let quizData = {}; // Test completion tracking

    let testResults = {
        politics: {
            completed: false,
            score: null,
            label: '',
            description: '',
            lastUpdated: null
        },
        iq: {
            completed: false,
            score: null,
            timeTaken: null,
            lastUpdated: null
        }
    };

    // Load saved results
    try {
        const savedResults = localStorage.getItem('iQorumTestResults');
        if (savedResults) {
            testResults = JSON.parse(savedResults);
            console.log('Loaded saved results:', testResults);
        }
    } catch (e) {
        console.error('Error loading saved results:', e);
    }

    // Load quiz data from JSON
    fetch('quiz_data.json')
        .then(response => response.json())
        .then(data => {
            console.log('Quiz data loaded:', data);
            quizData = data;
            initializeQuizzes();
        })
        .catch(error => {
            console.error('Error loading quiz data:', error);
            initializeQuizzes(); // Fallback
        });

    function initializeQuizzes() {
        generatePoliticsQuestions();
        generateIQQuestions();
        initializeApp();
        updateHomeTabButtons();
        updateProfilePage();
    }

    function generatePoliticsQuestions() {
        const container = document.getElementById('politics-questions-container');
        if (!container) {
            console.error('Politics container not found!');
            return;
        }

        const politicsQuestions = quizData.filter(q => q.type === 'politics');
        console.log('Found politics questions:', politicsQuestions.length);

        politicsQuestions.forEach((question, index) => {
            const questionElement = document.createElement('div');
            questionElement.className = `question ${index === 0 ? 'active' : ''}`;
            questionElement.id = `politics-question-${index + 1}`; // Use index, not question.id

            questionElement.innerHTML = `
                <div class="question-text">${question.id}. ${question.text}</div>
                <div class="options">
                    ${question.options.map(option => `
                        <div class="option" data-value="\( {option.value}"> \){option.text}</div>
                    `).join('')}
                </div>
            `;

            container.appendChild(questionElement);
        });
    }

    function generateIQQuestions() {
        const container = document.getElementById('iq-questions-container');
        if (!container) return;

        const iqQuestions = quizData.filter(q => q.type === 'iq');
        iqQuestions.forEach((question, index) => {
            const questionElement = document.createElement('div');
            questionElement.className = `question ${index === 0 ? 'active' : ''}`;
            questionElement.id = `iq-question-${index + 1}`;

            questionElement.innerHTML = `
                <div class="question-text">${question.id}. ${question.text}</div>
                <div class="options">
                    ${question.options.map((option, optIndex) => {
                        const isCorrect = option === question.correctAnswer;
                        return `<div class="option" data-value="\( {isCorrect ? 'correct' : 'incorrect'}"> \){option}</div>`;
                    }).join('')}
                </div>
            `;

            container.appendChild(questionElement);
        });
    }

    function updateHomeTabButtons() {
        const homeSection = document.getElementById('home');
        if (!homeSection) return;

        const politicsBtn = homeSection.querySelector('[data-test="politics"]');
        if (politicsBtn) {
            if (testResults.politics.completed) {
                politicsBtn.textContent = `View Results: ${testResults.politics.label}`;
                politicsBtn.classList.remove('btn-accent');
                politicsBtn.classList.add('btn-secondary');
            } else {
                politicsBtn.textContent = 'Start Politics Test';
                politicsBtn.classList.remove('btn-secondary');
                politicsBtn.classList.add('btn-accent');
            }
        }

        // Similar logic can be added for IQ button later
    }

    function updateProfilePage() {
        const politicsStat = document.getElementById('profile-politics');
        if (politicsStat) {
            politicsStat.textContent = testResults.politics.completed ? testResults.politics.label : '--';
        }

        const iqStat = document.getElementById('profile-iq');
        if (iqStat) {
            iqStat.textContent = testResults.iq.completed ? testResults.iq.score : '--';
        }

        const testsTakenStat = document.getElementById('profile-tests-taken');
        if (testsTakenStat) {
            let count = (testResults.politics.completed ? 1 : 0) + (testResults.iq.completed ? 1 : 0);
            testsTakenStat.textContent = count;
        }

        updateTestHistory();
    }

    function updateTestHistory() {
        const testHistory = document.querySelector('.test-history');
        if (!testHistory) return;

        testHistory.innerHTML = '';

        if (testResults.politics.completed) {
            const item = document.createElement('li');
            item.innerHTML = `
                <div class="test-info">
                    <div class="test-name">Political Compass Test</div>
                    <div class="test-date">Completed on: ${new Date(testResults.politics.lastUpdated).toLocaleDateString()}</div>
                </div>
                <div class="test-result">${testResults.politics.label}</div>
            `;
            testHistory.appendChild(item);
        }

        if (testResults.iq.completed) {
            const item = document.createElement('li');
            item.innerHTML = `
                <div class="test-info">
                    <div class="test-name">IQ Assessment</div>
                    <div class="test-date">Completed on: ${new Date(testResults.iq.lastUpdated).toLocaleDateString()}</div>
                </div>
                <div class="test-result">${testResults.iq.score || 'N/A'}</div>
            `;
            testHistory.appendChild(item);
        }

        if (!testResults.politics.completed && !testResults.iq.completed) {
            const item = document.createElement('li');
            item.innerHTML = `
                <div class="test-info">
                    <div class="test-name">No tests completed yet</div>
                    <div class="test-date">Take a test to see your results here</div>
                </div>
                <div class="test-result">--</div>
            `;
            testHistory.appendChild(item);
        }
    }

    function initializeApp() {
        // Tab navigation
        const tabs = document.querySelectorAll('.tab');
        const sections = document.querySelectorAll('.section');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                sections.forEach(s => s.classList.remove('active'));
                document.getElementById(tab.getAttribute('data-tab')).classList.add('active');
            });
        });

        // Politics test logic
        let politicsAnswers = {};
        let currentPoliticsQuestion = 1;

        document.getElementById('politics-questions-container').addEventListener('click', function(e) {
            if (e.target.classList.contains('option')) {
                const option = e.target;
                const questionElement = option.closest('.question');

                questionElement.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');

                const questionId = questionElement.id;
                politicsAnswers[questionId] = option.getAttribute('data-value');

                console.log('Current politics answers:', politicsAnswers);

                // Update progress
                const progress = (currentPoliticsQuestion / 10) * 100;
                document.getElementById('politics-progress').style.width = `${progress}%`;

                setTimeout(() => {
                    questionElement.classList.remove('active');

                    if (currentPoliticsQuestion < 10) {
                        currentPoliticsQuestion++;
                        document.getElementById(`politics-question-${currentPoliticsQuestion}`).classList.add('active');
                    } else {
                        // Show result
                        document.getElementById('politics-result').classList.add('active');
                        const result = calculatePoliticalResult(politicsAnswers);

                        document.getElementById('politics-score').textContent = result.label;
                        document.getElementById('politics-description').textContent = result.description;

                        const point = document.getElementById('user-point');
                        if (point) {
                            point.style.left = `${result.x}%`;
                            point.style.top = `${result.y}%`;
                        }

                        // Save result
                        testResults.politics = {
                            completed: true,
                            score: `\( {result.x}, \){result.y}`,
                            label: result.label,
                            description: result.description,
                            lastUpdated: new Date().toISOString()
                        };

                        localStorage.setItem('iQorumTestResults', JSON.stringify(testResults));

                        updateHomeTabButtons();
                        updateProfilePage();
                    }
                }, 800);
            }
        });

        // Restart button
        document.getElementById('politics-restart')?.addEventListener('click', () => {
            politicsAnswers = {};
            currentPoliticsQuestion = 1;
            document.getElementById('politics-result').classList.remove('active');
            document.getElementById('politics-progress').style.width = '0%';

            document.querySelectorAll('#politics-questions-container .question').forEach(q => {
                q.classList.remove('active');
                q.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
            });

            document.getElementById('politics-question-1').classList.add('active');
        });
    }

    function calculatePoliticalResult(answers) {
        let econScore = 0;   // left = negative, right = positive
        let authScore = 0;   // auth = positive, lib = negative

        Object.values(answers).forEach(value => {
            switch (value) {
                case 'left':   econScore -= 1; break;
                case 'right':  econScore += 1; break;
                case 'auth':   authScore += 1; break;
                case 'lib':    authScore -= 1; break;
            }
        });

        // Scale to 0–100 range (centered at 50)
        const x = 50 + (econScore * 12.5);   // rough scaling — adjust later
        const y = 50 + (authScore * 12.5);

        let label = 'Centrist';
        if (x < 35 && y < 35) label = 'Libertarian Left';
        else if (x < 35 && y > 65) label = 'Authoritarian Left';
        else if (x > 65 && y < 35) label = 'Libertarian Right';
        else if (x > 65 && y > 65) label = 'Authoritarian Right';
        else if (x < 35) label = 'Left-Leaning';
        else if (x > 65) label = 'Right-Leaning';
        else if (y < 35) label = 'Libertarian';
        else if (y > 65) label = 'Authoritarian';

        return {
            x: Math.max(0, Math.min(100, x)),
            y: Math.max(0, Math.min(100, y)),
            label,
            description: 'Based on your answers, you lean toward this position.'
        };
    }
});
