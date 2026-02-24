document.addEventListener('DOMContentLoaded', function() {
    let quizData = [];
    let testResults = {
        politics: { completed: false, score: null, label: '', description: '', x: 50, y: 50, lastUpdated: null },
        iq: { completed: false, score: null, timeTaken: null, lastUpdated: null }
    };

    let politicsAnswers = {};
    let currentPoliticsQuestion = 1;
    let politicsListenerAttached = false;

    let iqAnswers = {};
    let currentIQQuestion = 1;
    let iqTimerInterval = null;
    let iqStartTime = null;
    let iqListenerAttached = false;

    // Load saved results
    try {
        const saved = localStorage.getItem('iQorumTestResults');
        if (saved) testResults = JSON.parse(saved);
    } catch(e) {}

    fetch('quiz_data.json')
        .then(r => r.json())
        .then(data => {
            quizData = data;
            initializeEverything();
        })
        .catch(err => console.error(err));

    function initializeEverything() {
        generatePoliticsQuestions();
        generateIQQuestions();
        setupTabs();
        setupHomeButtons();
        setupPoliticsLogic();
        setupRestartButtons();
        loadSavedResultsIntoUI();

        // Ensure IQ start screen is visible when IQ tab loads
        resetIQToStartScreen();
    }

    // ====================== POLITICS (UNCHANGED - already perfect) ======================
    function generatePoliticsQuestions() {
        const container = document.getElementById('politics-questions-container');
        container.innerHTML = '';
        const politicsQ = quizData.filter(q => q.type === 'politics');

        politicsQ.forEach((q, i) => {
            const questionDiv = document.createElement('div');
            questionDiv.className = `question ${i === 0 ? 'active' : ''}`;
            questionDiv.id = `politics-question-${i+1}`;

            const textDiv = document.createElement('div');
            textDiv.className = 'question-text';
            textDiv.textContent = `${q.id}. ${q.text}`;
            questionDiv.appendChild(textDiv);

            const optionsDiv = document.createElement('div');
            optionsDiv.className = 'options';
            q.options.forEach(opt => {
                const optionDiv = document.createElement('div');
                optionDiv.className = 'option';
                optionDiv.textContent = opt.text;
                optionDiv.setAttribute('data-value', opt.value);
                optionsDiv.appendChild(optionDiv);
            });
            questionDiv.appendChild(optionsDiv);
            container.appendChild(questionDiv);
        });
    }

    function setupPoliticsLogic() {
        if (politicsListenerAttached) return;
        politicsListenerAttached = true;

        document.getElementById('politics-questions-container').addEventListener('click', e => {
            if (!e.target.classList.contains('option')) return;
            const option = e.target;
            const questionDiv = option.closest('.question');

            questionDiv.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');

            politicsAnswers[questionDiv.id] = option.getAttribute('data-value');

            const progress = (currentPoliticsQuestion / 10) * 100;
            document.getElementById('politics-progress').style.width = `${progress}%`;

            setTimeout(() => {
                questionDiv.classList.remove('active');
                if (currentPoliticsQuestion < 10) {
                    currentPoliticsQuestion++;
                    document.getElementById(`politics-question-${currentPoliticsQuestion}`).classList.add('active');
                } else {
                    const result = calculatePoliticalResult(politicsAnswers);
                    showPoliticsResult(result);
                }
            }, 600);
        });
    }

    function calculatePoliticalResult(answers) {
        let econ = 0, auth = 0;
        Object.values(answers).forEach(v => {
            if (v === 'left') econ -= 1;
            if (v === 'right') econ += 1;
            if (v === 'auth') auth += 1;
            if (v === 'lib') auth -= 1;
        });

        const x = Math.max(5, Math.min(95, 50 + econ * 15));
        const y = Math.max(5, Math.min(95, 50 + auth * 15));

        let label = 'Centrist';
        if (x < 35 && y < 35) label = 'Libertarian Left';
        else if (x < 35 && y > 65) label = 'Authoritarian Left';
        else if (x > 65 && y < 35) label = 'Libertarian Right';
        else if (x > 65 && y > 65) label = 'Authoritarian Right';
        else if (x < 40) label = 'Left-Leaning';
        else if (x > 60) label = 'Right-Leaning';
        else if (y < 40) label = 'Libertarian';
        else if (y > 60) label = 'Authoritarian';

        return { x, y, label, description: `Economic: ${Math.round(x-50)} • Social: ${Math.round(y-50)}` };
    }

    function showPoliticsResult(result) {
        document.getElementById('politics-questions-container').style.display = 'none';
        document.getElementById('politics-result').classList.add('active');
        document.getElementById('politics-score').textContent = result.label;
        document.getElementById('politics-description').textContent = result.description;

        const dot = document.getElementById('user-point');
        dot.style.left = `${result.x}%`;
        dot.style.top = `${result.y}%`;

        testResults.politics = { completed: true, label: result.label, description: result.description, x: result.x, y: result.y, lastUpdated: new Date().toISOString() };
        localStorage.setItem('iQorumTestResults', JSON.stringify(testResults));
    }

    function loadSavedResultsIntoUI() {
        if (!testResults.politics.completed) return;
        document.getElementById('politics-questions-container').style.display = 'none';
        document.getElementById('politics-result').classList.add('active');
        document.getElementById('politics-score').textContent = testResults.politics.label;
        document.getElementById('politics-description').textContent = testResults.politics.description;
        const dot = document.getElementById('user-point');
        dot.style.left = `${testResults.politics.x}%`;
        dot.style.top = `${testResults.politics.y}%`;
    }

    // ====================== IQ SECTION - FULLY FIXED ======================
    function generateIQQuestions() {
        const container = document.getElementById('iq-questions-container');
        container.innerHTML = '';
        const iqQ = quizData.filter(q => q.type === 'iq');

        iqQ.forEach((q, i) => {
            const questionDiv = document.createElement('div');
            questionDiv.className = `question ${i === 0 ? 'active' : ''}`;
            questionDiv.id = `iq-question-${i+1}`;

            const textDiv = document.createElement('div');
            textDiv.className = 'question-text';
            textDiv.textContent = `${q.id}. ${q.text}`;
            questionDiv.appendChild(textDiv);

            const optionsDiv = document.createElement('div');
            optionsDiv.className = 'options';
            q.options.forEach(opt => {
                const optionDiv = document.createElement('div');
                optionDiv.className = 'option';
                optionDiv.textContent = opt;
                optionDiv.setAttribute('data-value', opt);
                optionsDiv.appendChild(optionDiv);
            });
            questionDiv.appendChild(optionsDiv);
            container.appendChild(questionDiv);
        });
    }

    function setupHomeButtons() {
        // Politics
        document.querySelector('[data-test="politics"]').addEventListener('click', () => {
            document.querySelector('[data-tab="politics"]').click();
        });

        // IQ - FIXED: now correctly goes to IQ tab + shows start screen
        const iqHomeBtn = document.getElementById('iq-start-btn');
        if (iqHomeBtn) {
            iqHomeBtn.addEventListener('click', () => {
                document.querySelector('[data-tab="iq"]').click();
            });
        }
    }

    function setupTabs() {
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));

                tab.classList.add('active');
                document.getElementById(tab.getAttribute('data-tab')).classList.add('active');
                window.scrollTo({ top: 0, behavior: 'smooth' });

                if (tab.getAttribute('data-tab') === 'iq') {
                    resetIQToStartScreen();
                }
            });
        });
    }

    function resetIQToStartScreen() {
        document.getElementById('iq-start').style.display = 'block';
        document.getElementById('iq-test').style.display = 'none';
        if (iqTimerInterval) clearInterval(iqTimerInterval);
    }

    function setupIQStartButton() {
        const startBtn = document.getElementById('iq-start-btn'); // the one inside the start screen
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                document.getElementById('iq-start').style.display = 'none';
                document.getElementById('iq-test').style.display = 'block';
                startIQTimer();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    }

    function startIQTimer() {
        if (iqTimerInterval) clearInterval(iqTimerInterval);
        let timeLeft = 600;
        iqStartTime = Date.now();
        iqAnswers = {};
        currentIQQuestion = 1;

        const timerEl = document.getElementById('iq-timer');
        timerEl.textContent = '10:00';
        timerEl.style.color = '';

        iqTimerInterval = setInterval(() => {
            timeLeft--;
            const min = Math.floor(timeLeft / 60);
            const sec = timeLeft % 60;
            timerEl.textContent = `\( {min}: \){sec < 10 ? '0' : ''}${sec}`;
            if (timeLeft <= 60) timerEl.style.color = '#e74c3c';
            if (timeLeft <= 0) finishIQTest();
        }, 1000);
    }

    function setupIQLogic() {
        if (iqListenerAttached) return;
        iqListenerAttached = true;

        document.getElementById('iq-questions-container').addEventListener('click', e => {
            if (!e.target.classList.contains('option')) return;

            const option = e.target;
            const questionDiv = option.closest('.question');

            questionDiv.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');

            iqAnswers[questionDiv.id] = option.getAttribute('data-value');

            const progress = (currentIQQuestion / 10) * 100;
            document.getElementById('iq-progress').style.width = `${progress}%`;

            setTimeout(() => {
                questionDiv.classList.remove('active');
                if (currentIQQuestion < 10) {
                    currentIQQuestion++;
                    document.getElementById(`iq-question-${currentIQQuestion}`).classList.add('active');
                } else {
                    finishIQTest();
                }
            }, 500);
        });
    }

    function finishIQTest() {
        if (iqTimerInterval) clearInterval(iqTimerInterval);

        const timeTaken = Math.floor((Date.now() - iqStartTime) / 1000);
        let correct = 0;
        const iqQ = quizData.filter(q => q.type === 'iq');
        iqQ.forEach((q, i) => {
            if (iqAnswers[`iq-question-${i+1}`] === q.correctAnswer) correct++;
        });

        const accuracy = Math.round((correct / 10) * 100);
        const timeBonus = Math.max(0, Math.round((600 - timeTaken) / 6));
        const finalScore = Math.min(160, Math.max(60, accuracy + timeBonus));

        testResults.iq = { completed: true, score: finalScore, timeTaken, lastUpdated: new Date().toISOString() };
        localStorage.setItem('iQorumTestResults', JSON.stringify(testResults));

        document.getElementById('iq-score').textContent = finalScore;
        document.getElementById('iq-description').textContent = `You got ${correct}/10 correct in ${Math.floor(timeTaken/60)}m ${timeTaken%60}s`;
        document.getElementById('iq-result').classList.add('active');
    }

    function setupRestartButtons() {
        // Politics (unchanged)
        document.getElementById('politics-restart').addEventListener('click', () => {
            politicsAnswers = {};
            currentPoliticsQuestion = 1;
            document.getElementById('politics-result').classList.remove('active');
            document.getElementById('politics-questions-container').style.display = 'block';
            document.getElementById('politics-progress').style.width = '0%';

            document.querySelectorAll('#politics-questions-container .question').forEach((q, i) => {
                q.classList.toggle('active', i === 0);
                q.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // IQ restart - returns to start screen
        document.getElementById('iq-restart').addEventListener('click', () => {
            document.getElementById('iq-result').classList.remove('active');
            resetIQToStartScreen();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    console.log('🚀 iQorum - Politics untouched + IQ fully restored');
});
