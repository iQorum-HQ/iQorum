document.addEventListener('DOMContentLoaded', function() {
    let quizData = {};
    
    // Test completion tracking - MOVED TO TOP LEVEL
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
        }
    } catch (e) {
        console.error('Error loading saved results:', e);
    }

    // Load quiz data from JSON file
    fetch('quiz_data.json')
        .then(response => response.json())
        .then(data => {
            quizData = data;
            initializeQuizzes();
        })
        .catch(error => {
            console.error('Error loading quiz data:', error);
            // Fallback to hardcoded questions if JSON fails
            initializeQuizzes();
        });

    function initializeQuizzes() {
        // Generate politics questions
        generatePoliticsQuestions();
        
        // Generate IQ questions
        generateIQQuestions();
        
        // Initialize all other functionality
        initializeApp();
        
        // Initialize home tab buttons AFTER everything is loaded
        updateHomeTabButtons();
        
        // Update profile page with saved results
        updateProfilePage();
    }

    function generatePoliticsQuestions() {
        const container = document.getElementById('politics-questions-container');
        const politicsQuestions = quizData.filter(q => q.type === 'politics');
        
        politicsQuestions.forEach((question, index) => {
            const questionElement = document.createElement('div');
            questionElement.className = `question ${index === 0 ? 'active' : ''}`;
            questionElement.id = `politics-question-${question.id}`;
            
            questionElement.innerHTML = `
                <div class="question-text">${question.id}. ${question.text}</div>
                <div class="options">
                    ${question.options.map(option => 
                        `<div class="option" data-value="${option.value}">${option.text}</div>`
                    ).join('')}
                </div>
            `;
            
            container.appendChild(questionElement);
        });
    }

    function generateIQQuestions() {
        const container = document.getElementById('iq-questions-container');
        const iqQuestions = quizData.filter(q => q.type === 'iq');
        
        iqQuestions.forEach((question, index) => {
            const questionElement = document.createElement('div');
            questionElement.className = `question ${index === 0 ? 'active' : ''}`;
            questionElement.id = `iq-question-${question.id}`;
            
            questionElement.innerHTML = `
                <div class="question-text">${question.id}. ${question.text}</div>
                <div class="options">
                    ${question.options.map((option, optIndex) => {
                        const isCorrect = option === question.correctAnswer;
                        return `<div class="option" data-value="${isCorrect ? 'correct' : 'incorrect'}">${option}</div>`;
                    }).join('')}
                </div>
            `;
            
            container.appendChild(questionElement);
        });
    }

    function updateHomeTabButtons() {
        // Find the home tab content
        const homeSection = document.getElementById('home');
        if (!homeSection) return;
        
        // Update Politics Test button
        const politicsBtn = homeSection.querySelector('.btn[data-test="politics"]');
        if (politicsBtn) {
            if (testResults.politics.completed) {
                politicsBtn.textContent = `View Results: ${testResults.politics.label}`;
                politicsBtn.classList.remove('btn-accent');
                politicsBtn.classList.add('btn-secondary');
                // Remove existing click handlers first
                politicsBtn.replaceWith(politicsBtn.cloneNode(true));
                const newPoliticsBtn = homeSection.querySelector('.btn[data-test="politics"]');
                newPoliticsBtn.addEventListener('click', () => {
                    // Navigate to politics tab and show results
                    document.querySelector('.tab[data-tab="politics"]').click();
                    // Ensure results section is active
                    document.getElementById('politics-result').classList.add('active');
                });
            } else {
                politicsBtn.textContent = 'Start Politics Test';
                politicsBtn.classList.remove('btn-secondary');
                politicsBtn.classList.add('btn-accent');
                // Remove existing click handlers first
                politicsBtn.replaceWith(politicsBtn.cloneNode(true));
                const newPoliticsBtn = homeSection.querySelector('.btn[data-test="politics"]');
                newPoliticsBtn.addEventListener('click', () => {
                    document.querySelector('.tab[data-tab="politics"]').click();
                });
            }
        }
        
        // Update IQ Test button
        const iqBtn = homeSection.querySelector('.btn[data-test="iq"]');
        if (iqBtn) {
            if (testResults.iq.completed) {
                iqBtn.textContent = `View IQ Score: ${testResults.iq.score}`;
                iqBtn.classList.remove('btn-accent');
                iqBtn.classList.add('btn-secondary');
                // Remove existing click handlers first
                iqBtn.replaceWith(iqBtn.cloneNode(true));
                const newIqBtn = homeSection.querySelector('.btn[data-test="iq"]');
                newIqBtn.addEventListener('click', () => {
                    document.querySelector('.tab[data-tab="iq"]').click();
                    // Show IQ results if available
                    document.getElementById('iq-result').classList.add('active');
                });
            } else {
                iqBtn.textContent = 'Start IQ Test';
                iqBtn.classList.remove('btn-secondary');
                iqBtn.classList.add('btn-accent');
                // Remove existing click handlers first
                iqBtn.replaceWith(iqBtn.cloneNode(true));
                const newIqBtn = homeSection.querySelector('.btn[data-test="iq"]');
                newIqBtn.addEventListener('click', () => {
                    document.querySelector('.tab[data-tab="iq"]').click();
                });
            }
        }
    }

    function updateProfilePage() {
        // Update political compass on profile
        const politicsStat = document.querySelector('.profile-stats .stat-card:nth-child(1) .stat-value');
        if (politicsStat) {
            if (testResults.politics.completed) {
                politicsStat.textContent = testResults.politics.label;
            } else {
                politicsStat.textContent = '--';
            }
        }
        
        // Update IQ score on profile
        const iqStat = document.querySelector('.profile-stats .stat-card:nth-child(2) .stat-value');
        if (iqStat) {
            if (testResults.iq.completed) {
                iqStat.textContent = testResults.iq.score;
            } else {
                iqStat.textContent = '--';
            }
        }
        
        // Update tests taken counter
        const testsTakenStat = document.querySelector('.profile-stats .stat-card:nth-child(3) .stat-value');
        if (testsTakenStat) {
            let testsTaken = 0;
            if (testResults.politics.completed) testsTaken++;
            if (testResults.iq.completed) testsTaken++;
            testsTakenStat.textContent = testsTaken;
        }
        
        // Update test history with latest results
        updateTestHistory();
    }

    function updateTestHistory() {
        const testHistory = document.querySelector('.test-history');
        if (!testHistory) return;
        
        // Clear existing history
        testHistory.innerHTML = '';
        
        // Add politics test result if completed
        if (testResults.politics.completed) {
            const politicsItem = document.createElement('li');
            politicsItem.innerHTML = `
                <div class="test-info">
                    <div class="test-name">Political Compass Test</div>
                    <div class="test-date">Completed on: ${new Date(testResults.politics.lastUpdated).toLocaleDateString()}</div>
                </div>
                <div class="test-result">${testResults.politics.label}</div>
            `;
            testHistory.appendChild(politicsItem);
        }
        
        // Add IQ test result if completed
        if (testResults.iq.completed) {
            const iqItem = document.createElement('li');
            iqItem.innerHTML = `
                <div class="test-info">
                    <div class="test-name">IQ Assessment</div>
                    <div class="test-date">Completed on: ${new Date(testResults.iq.lastUpdated).toLocaleDateString()}</div>
                </div>
                <div class="test-result">${testResults.iq.score}</div>
            `;
            testHistory.appendChild(iqItem);
        }
        
        // If no tests completed yet
        if (!testResults.politics.completed && !testResults.iq.completed) {
            const noTestsItem = document.createElement('li');
            noTestsItem.innerHTML = `
                <div class="test-info">
                    <div class="test-name">No tests completed yet</div>
                    <div class="test-date">Take a test to see your results here</div>
                </div>
                <div class="test-result">--</div>
            `;
            testHistory.appendChild(noTestsItem);
        }
    }

    function addPoliticsRetakeButton() {
        const resultDiv = document.getElementById('politics-result');
        if (!resultDiv) return;
        
        // Remove existing retake button if present
        const existingBtn = resultDiv.querySelector('.retake-btn');
        if (existingBtn) existingBtn.remove();
        
        // Create new retake button
        const retakeBtn = document.createElement('button');
        retakeBtn.className = 'btn btn-accent retake-btn';
        retakeBtn.textContent = 'Retake Politics Test';
        retakeBtn.style.marginTop = '15px';
        retakeBtn.style.marginLeft = '10px';
        
        retakeBtn.addEventListener('click', () => {
            // Reset politics test
            testResults.politics.completed = false;
            testResults.politics.score = null;
            testResults.politics.label = '';
            testResults.politics.description = '';
            localStorage.setItem('iQorumTestResults', JSON.stringify(testResults));
            
            // Reset test UI
            document.getElementById('politics-result').classList.remove('active');
            
            // Show first question
            document.querySelectorAll('#politics .question').forEach((q, i) => {
                q.classList.remove('active');
                if (i === 0) q.classList.add('active');
            });
            
            // Clear selections
            document.querySelectorAll('#politics .option.selected').forEach(opt => {
                opt.classList.remove('selected');
            });
            
            // Reset progress bar
            document.getElementById('politics-progress').style.width = '0%';
            
            // Update home tab button and profile
            updateHomeTabButtons();
            updateProfilePage();
        });
        
        // Add button to results div
        const scoreElement = document.getElementById('politics-score');
        if (scoreElement) {
            scoreElement.parentNode.appendChild(retakeBtn);
        } else {
            resultDiv.appendChild(retakeBtn);
        }
    }

    function initializeApp() {
        // Tab navigation
        const tabs = document.querySelectorAll('.tab');
        const sections = document.querySelectorAll('.section');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.getAttribute('data-tab');
                
                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Show corresponding section
                sections.forEach(section => {
                    section.classList.remove('active');
                    if (section.id === tabName) {
                        section.classList.add('active');
                    }
                });
            });
        });
        
        // App card navigation
        const appCards = document.querySelectorAll('.app-card');
        appCards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.classList.contains('btn') || card.getAttribute('data-app')) {
                    const app = card.getAttribute('data-app');
                    
                    // Update active tab
                    tabs.forEach(t => t.classList.remove('active'));
                    document.querySelector(`.tab[data-tab="${app}"]`).classList.add('active');
                    
                    // Show corresponding section
                    sections.forEach(section => {
                        section.classList.remove('active');
                        if (section.id === app) {
                            section.classList.add('active');
                        }
                    });
                }
            });
        });
        
        // Forum tab navigation
        const forumTabs = document.querySelectorAll('.forum-tab');
        const forumContents = document.querySelectorAll('.forum-content');
        
        forumTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const forumId = tab.getAttribute('data-forum');
                
                // Update active forum tab
                forumTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Show corresponding forum content
                forumContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === `${forumId}-forum`) {
                        content.classList.add('active');
                    }
                });
            });
        });
        
        // FAQ accordion functionality
        const faqQuestions = document.querySelectorAll('.faq-question');
        
        faqQuestions.forEach(question => {
            question.addEventListener('click', () => {
                const answer = question.nextElementSibling;
                const isVisible = answer.style.display === 'block';
                
                // Close all answers
                document.querySelectorAll('.faq-answer').forEach(ans => {
                    ans.style.display = 'none';
                });
                
                // Reset all icons
                document.querySelectorAll('.faq-question i').forEach(icon => {
                    icon.className = 'fas fa-chevron-down';
                });
                
                // Open this answer if it was closed
                if (!isVisible) {
                    answer.style.display = 'block';
                    question.querySelector('i').className = 'fas fa-chevron-up';
                }
            });
        });
        
        // Politics test logic
        const politicsQuestions = document.querySelectorAll('#politics .question');
        let politicsAnswers = [];
        let currentPoliticsQuestion = 1;
        
        // Politics option click handlers (using event delegation)
        document.getElementById('politics-questions-container').addEventListener('click', function(e) {
            if (e.target.classList.contains('option')) {
                const option = e.target;
                const questionElement = option.closest('.question');
                
                // Mark selected option
                questionElement.querySelectorAll('.option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                option.classList.add('selected');
                
                // Store answer
                const questionId = questionElement.id;
                politicsAnswers[questionId] = option.getAttribute('data-value');
                
                // Update progress
                const progressPercentage = (currentPoliticsQuestion / 10) * 100;
                document.getElementById('politics-progress').style.width = `${progressPercentage}%`;
                
                // Move to next question after delay
                setTimeout(() => {
                    document.getElementById(`politics-question-${currentPoliticsQuestion}`).classList.remove('active');
                    
                    if (currentPoliticsQuestion < 10) {
                        currentPoliticsQuestion++;
                        document.getElementById(`politics-question-${currentPoliticsQuestion}`).classList.add('active');
                    } else {
                        // Show result after last question
                        document.getElementById('politics-result').classList.add('active');
                        
                        // Calculate and display result
                        const result = calculatePoliticalResult(politicsAnswers);
                        document.getElementById('politics-score').textContent = result.label;
                        document.getElementById('politics-description').textContent = result.description;
                        
                        // Position point on compass
                        document.getElementById('user-point').style.top = `${result.y}%`;
                        document.getElementById('user-point').style.left = `${result.x}%`;
                        
                        // Save results and update UI
                        testResults.politics = {
                            completed: true,
                            score: `${result.x},${result.y}`,
                            label: result.label,
                            description: result.description,
                            lastUpdated: new Date().toISOString()
                        };

                        localStorage.setItem('iQorumTestResults', JSON.stringify(testResults));
                        updateHomeTabButtons();
                        updateProfilePage();
                        addPoliticsRetakeButton();
                    }
                }, 800);
            }
        });
        
        // Calculate political result based on answers
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
            
            // Normalize scores to percentages
            const x = 50 + (leftRightScore * 10);
            const y = 50 + (authLibScore * 10);
            
            // Determine label based on position
            let label = '';
            let description = '';
            
            if (x < 40 && y < 40) {
                label = 'Libertarian Left';
                description = 'You favor personal freedom and economic equality.';
            } else if (x < 40 && y > 60) {
                label = 'Authoritarian Left';
                description = 'You favor economic equality and strong social structure.';
            } else if (x > 60 && y < 40) {
                label = 'Libertarian Right';
                description = 'You favor free markets and personal freedom.';
            } else if (x > 60 && y > 60) {
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

        // IQ Test Logic
        let iqQuestions = [];
        let currentIqQuestion = 1;
        let iqAnswers = [];
        let timeLeft = 600; // 10 minutes
        let iqTimer;
        let testStartTime;
        
        // Start test when button is clicked
        const iqStartBtn = document.getElementById('iq-start-btn');
        if (iqStartBtn) {
            iqStartBtn.addEventListener('click', startIqTest);
        }
        
        function startIqTest() {
            // Hide start screen, show test screen
            document.getElementById('iq-start').style.display = 'none';
            document.getElementById('iq-test').style.display = 'block';
            
            // Load and randomize questions
            loadRandomIQQuestions();
            
            // Start timer
            testStartTime = Date.now();
            startIqTimer();
        }
        
        function loadRandomIQQuestions() {
            const container = document.getElementById('iq-questions-container');
            container.innerHTML = '';
            
            // Get all IQ questions and shuffle them
            const allQuestions = quizData.filter(q => q.type === 'iq');
            iqQuestions = shuffleArray(allQuestions).slice(0, 10); // Pick 10 random questions
            
            // Generate the questions
            iqQuestions.forEach((question, index) => {
                const questionElement = document.createElement('div');
                questionElement.className = `question ${index === 0 ? 'active' : ''}`;
                questionElement.id = `iq-question-${index + 1}`;
                
                // Shuffle the options
                const shuffledOptions = shuffleArray([...question.options]);
                
                questionElement.innerHTML = `
                    <div class="question-text">${index + 1}. ${question.text}</div>
                    <div class="options">
                        ${shuffledOptions.map(option => {
                            const isCorrect = option === question.correctAnswer;
                            return `<div class="option" data-value="${isCorrect ? 'correct' : 'incorrect'}">${option}</div>`;
                        }).join('')}
                    </div>
                `;
                
                container.appendChild(questionElement);
            });
            
            // Reset test state
            currentIqQuestion = 1;
            iqAnswers = [];
        }
        
        // Fisher-Yates shuffle algorithm
        function shuffleArray(array) {
            const shuffled = [...array];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
        }
        
        function startIqTimer() {
            clearInterval(iqTimer);
            timeLeft = 600;
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
        
        // IQ option click handlers
        document.getElementById('iq-questions-container').addEventListener('click', function(e) {
            if (e.target.classList.contains('option')) {
                const option = e.target;
                const questionElement = option.closest('.question');
                
                // Mark selected option
                questionElement.querySelectorAll('.option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                option.classList.add('selected');
                
                // Store answer with timestamp
                const questionId = questionElement.id;
                const questionIndex = parseInt(questionId.split('-')[2]) - 1;
                const answerTime = Date.now() - testStartTime;
                
                iqAnswers[questionIndex] = {
                    answer: option.getAttribute('data-value'),
                    time: answerTime,
                    question: iqQuestions[questionIndex]
                };
                
                // Update progress
                const progressPercentage = (currentIqQuestion / 10) * 100;
                document.getElementById('iq-progress').style.width = `${progressPercentage}%`;
                
                // Move to next question after delay
                setTimeout(() => {
                    document.getElementById(`iq-question-${currentIqQuestion}`).classList.remove('active');
                    
                    if (currentIqQuestion < 10) {
                        currentIqQuestion++;
                        document.getElementById(`iq-question-${currentIqQuestion}`).classList.add('active');
                    } else {
                        // Show result after last question
                        showIqResult();
                    }
                }, 800);
            }
        });
        
        function showIqResult() {
            clearInterval(iqTimer);
            document.getElementById('iq-result').classList.add('active');
            
            // Calculate total test time
            const totalTestTime = (Date.now() - testStartTime) / 1000; // Convert to seconds
            
            // Calculate score based on accuracy and speed
            const result = calculateIQScore(iqAnswers, totalTestTime);
            
            document.getElementById('iq-score').textContent = result.iqScore;
            document.getElementById('iq-description').textContent = result.description;
            
            // Save results and update UI
            testResults.iq = {
                completed: true,
                score: result.iqScore,
                timeTaken: totalTestTime,
                lastUpdated: new Date().toISOString()
            };

            localStorage.setItem('iQorumTestResults', JSON.stringify(testResults));
            updateHomeTabButtons();
            updateProfilePage();
            
            // Update profile stats
            const profileStats = document.querySelector('.profile-stats .stat-card:nth-child(2) .stat-value');
            if (profileStats) {
                profileStats.textContent = result.iqScore;
            }
        }
        
        function calculateIQScore(answers, totalTimeSeconds) {
            const maxPoints = 170;
            const correctAnswers = answers.filter(a => a && a.answer === 'correct').length;
            const accuracy = answers.length > 0 ? correctAnswers / answers.length : 0;
            
            // Convert totalTime from milliseconds to seconds and average per question
            const totalTimeMs = answers.reduce((sum, answer) => sum + (answer ? answer.time : 0), 0);
            const avgTimeSeconds = answers.length > 0 ? (totalTimeMs / 1000) / answers.length : totalTimeSeconds;
            
            // Time penalty: steep drops as time increases
            let timePenalty = 0;
            
            if (avgTimeSeconds <= 30) {
                timePenalty = 0; // Perfect speed - 170 points
            } else if (avgTimeSeconds <= 60) {
                timePenalty = 10; // 1 min - 160 points
            } else if (avgTimeSeconds <= 120) {
                timePenalty = 40; // 2 min - 130 points  
            } else if (avgTimeSeconds <= 180) {
                timePenalty = 60; // 3 min - 110 points
            } else if (avgTimeSeconds <= 240) {
                timePenalty = 70; // 4 min - 100 points
            } else if (avgTimeSeconds <= 300) {
                timePenalty = 80; // 5 min - 90 points
            } else {
                timePenalty = 100; // 6+ min - 70 points max
            }
            
            // Accuracy penalty: lose points for wrong answers
            const accuracyPenalty = (1 - accuracy) * 50; // Up to 50 points lost for all wrong
            
            const totalScore = maxPoints - timePenalty - accuracyPenalty;
            const finalScore = Math.max(70, Math.min(170, Math.round(totalScore)));
            
            // Description based on score
            let description = '';
            if (finalScore < 90) description = 'This places you in the below average range.';
            else if (finalScore < 110) description = 'This places you in the average range.';
            else if (finalScore < 130) description = 'This places you in the above average range.';
            else description = 'This places you in the superior range.';
            
            return {
                iqScore: finalScore,
                description: description
            };
        }
        
        // Update restart button
        const iqRestartBtn = document.getElementById('iq-restart');
        if (iqRestartBtn) {
            iqRestartBtn.addEventListener('click', () => {
                document.getElementById('iq-result').classList.remove('active');
                document.getElementById('iq-start').style.display = 'block';
                document.getElementById('iq-test').style.display = 'none';
                document.getElementById('iq-progress').style.width = '0%';
            });
        }
        
        // Feedback form submission
        const feedbackBtn = document.querySelector('#faq .btn');
        if (feedbackBtn) {
            feedbackBtn.addEventListener('click', () => {
                alert('Thank you for your feedback! In a real implementation, this would be sent to our servers.');
            });
        }
    }
});