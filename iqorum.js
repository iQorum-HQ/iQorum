document.addEventListener('DOMContentLoaded', function() {
    let quizData = [];
    let testResults = {
        politics: { completed: false, score: null, label: '', description: '', x: 50, y: 50, lastUpdated: null },
        iq: { completed: false, score: null, timeTaken: null, lastUpdated: null }
    };

    let politicsAnswers = {};
    let currentPoliticsQuestion = 1;
    let politicsListenerAttached = false;

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
        setupTabs();
        setupHomeButtons();
        setupPoliticsLogic();
        setupRestartButtons();
        setupIQStartButton();
        loadSavedResultsIntoUI();
    }

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

    function setupTabs() {
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));

                tab.classList.add('active');
                document.getElementById(tab.getAttribute('data-tab')).classList.add('active');
                window.scrollTo({ top: 0, behavior: 'smooth' });

                if (tab.getAttribute('data-tab') === 'politics') loadSavedResultsIntoUI();
            });
        });
    }

    function setupHomeButtons() {
        document.querySelector('[data-test="politics"]').addEventListener('click', () => {
            document.querySelector('[data-tab="politics"]').click();
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

        const x = Math.max(5, Math.min(95, 50 + econ * 15));   // stronger scoring
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

        testResults.politics = {
            completed: true,
            label: result.label,
            description: result.description,
            x: result.x,
            y: result.y,
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('iQorumTestResults', JSON.stringify(testResults));

        updateProfileAndHome();
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

    function updateProfileAndHome() {
        const polStat = document.getElementById('profile-politics');
        if (polStat) polStat.textContent = testResults.politics.label || '--';

        const homeBtn = document.querySelector('[data-test="politics"]');
        if (homeBtn && testResults.politics.completed) {
            homeBtn.textContent = `View Results: ${testResults.politics.label}`;
        }
    }

    function setupRestartButtons() {
        document.getElementById('politics-restart').addEventListener('click', () => {
            // Full reset
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
    }

    function setupIQStartButton() {
        const startBtn = document.getElementById('iq-start-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                document.getElementById('iq-start').style.display = 'none';
                document.getElementById('iq-test').style.display = 'block';
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    }

    console.log('🚀 iQorum JS v5 - fixed retake + stronger scoring');
});
