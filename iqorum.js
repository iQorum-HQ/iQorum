document.addEventListener('DOMContentLoaded', function() {
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
    const politicsOptions = document.querySelectorAll('#politics .option');
    let politicsAnswers = [];
    let currentPoliticsQuestion = 1;
    
    // Hide all politics questions except the first one
    politicsQuestions.forEach((question, index) => {
        if (index !== 0) {
            question.classList.remove('active');
        }
    });
    
    politicsOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Mark selected option
            option.parentElement.querySelectorAll('.option').forEach(opt => {
                opt.classList.remove('selected');
            });
            option.classList.add('selected');
            
            // Store answer
            const questionId = option.closest('.question').id;
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
                }
            }, 800);
        });
    });
    
    // Calculate political result based on answers
    function calculatePoliticalResult(answers) {
        // Simplified calculation for demo purposes
        // In a real app, this would be more sophisticated
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
    
    // IQ test logic
    const iqQuestions = document.querySelectorAll('#iq .question');
    const iqOptions = document.querySelectorAll('#iq .option');
    let iqAnswers = [];
    let currentIqQuestion = 1;
    let timeLeft = 600; // 10 minutes in seconds
    let iqTimer;
    
    // Hide all IQ questions except the first one
    iqQuestions.forEach((question, index) => {
        if (index !== 0) {
            question.classList.remove('active');
        }
    });
    
    // Start timer when IQ test is opened
    document.querySelector('.tab[data-tab="iq"]').addEventListener('click', startIqTimer);
    
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
    
    iqOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Mark selected option
            option.parentElement.querySelectorAll('.option').forEach(opt => {
                opt.classList.remove('selected');
            });
            option.classList.add('selected');
            
            // Store answer
            const questionId = option.closest('.question').id;
            iqAnswers[questionId] = option.getAttribute('data-value');
            
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
        });
    });
    
    function showIqResult() {
        clearInterval(iqTimer);
        document.getElementById('iq-result').classList.add('active');
        
        // Calculate score
        let score = 0;
        for (const question in iqAnswers) {
            if (iqAnswers[question] === 'correct') {
                score++;
            }
        }
        
        // Map score to IQ (simplified for demo)
        const iqScore = 90 + (score * 5);
        document.getElementById('iq-score').textContent = iqScore;
        
        // Description based on score
        let description = '';
        if (iqScore < 90) description = 'This places you in the below average range.';
        else if (iqScore < 110) description = 'This places you in the average range.';
        else if (iqScore < 130) description = 'This places you in the above average range.';
        else description = 'This places you in the superior range.';
        
        document.getElementById('iq-description').textContent = description;
        
        // Update profile stats
        document.querySelector('.profile-stats .stat-card:nth-child(2) .stat-value').textContent = iqScore;
    }
    
    // Restart buttons
    document.getElementById('politics-restart').addEventListener('click', () => {
        document.getElementById('politics-result').classList.remove('active');
        politicsQuestions.forEach((question, index) => {
            if (index === 0) {
                question.classList.add('active');
            } else {
                question.classList.remove('active');
            }
        });
        document.getElementById('politics-progress').style.width = '0%';
        politicsAnswers = [];
        currentPoliticsQuestion = 1;
    });
    
    document.getElementById('iq-restart').addEventListener('click', () => {
        document.getElementById('iq-result').classList.remove('active');
        iqQuestions.forEach((question, index) => {
            if (index === 0) {
                question.classList.add('active');
            } else {
                question.classList.remove('active');
            }
        });
        document.getElementById('iq-progress').style.width = '0%';
        iqAnswers = [];
        currentIqQuestion = 1;
        startIqTimer();
    });
    
    // Feedback form submission
    document.querySelector('#faq .btn').addEventListener('click', () => {
        alert('Thank you for your feedback! In a real implementation, this would be sent to our servers.');
    });
});
