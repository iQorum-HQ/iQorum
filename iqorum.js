document.addEventListener('DOMContentLoaded', function() {
    let quizData = [];

    let testResults = {
        politics: { completed: false, score: null, label: '', description: '', x: 50, y: 50, lastUpdated: null },
        iq: { completed: false, score: null, timeTaken: null, lastUpdated: null }
    };

    // Load saved results
    try {
        const saved = localStorage.getItem('iQorumTestResults');
        if (saved) testResults = JSON.parse(saved);
    } catch(e) { console.error(e); }

    // Load quiz data
    fetch('quiz_data.json')
        .then(r => r.json())
        .then(data => {
            quizData = data;
            console.log('✅ Quiz data loaded –', data.length, 'questions');
            initializeEverything();
        })
        .catch(err => console.error('JSON load error:', err));

    function initializeEverything() {
        generatePoliticsQuestions();
        generateIQQuestions();
        setupTabs();
        setupHomeButtons();
        setupPoliticsLogic();
        setupRestartButtons();
        loadSavedResultsIntoUI();
    }

    function generatePoliticsQuestions() {
        const container = document.getElementById('politics-questions-container');
        container.innerHTML = '';
        const politicsQ = quizData.filter(q => q.type === 'politics');

        politicsQ.forEach((q, i) => {
            const div = document.createElement('div');
            div.className = `question ${i === 0 ? 'active' : ''}`;
            div.id = `politics-question-${i+1}`;

            let optionsHTML = '';
            q.options.forEach(opt => {
                optionsHTML += `<div class="option" data-value="\( {opt.value}"> \){opt.text}</div>`;
            });

            div.innerHTML = `
                <div class="question-text">${q.id}. ${q.text}</div>
                <div class="options">${optionsHTML}</div>
            `;
            container.appendChild(div);
        });
    }

    function generateIQQuestions() {
        // Basic placeholder – we can expand later
        console.log('IQ questions ready (stub)');
    }

    function setupTabs() {
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));

                tab.classList.add('active');
                document.getElementById(tab.getAttribute('data-tab')).classList.add('active');

                if (tab.getAttribute('data-tab') === 'politics') {
                    loadSavedResultsIntoUI();
                }
            });
        });
    }

    function setupHomeButtons() {
        // Politics button on Home
        const politicsHomeBtn = document.querySelector('[data-test="politics"]');
        if (politicsHomeBtn) {
            politicsHomeBtn.addEventListener('click', () => {
                document.querySelector('[data-tab="politics"]').click();
            });
        }

        // IQ button on Home
        const iqHomeBtn = document.getElementById('iq-start-btn');
        if (iqHomeBtn) {
            iqHomeBtn.addEventListener('click', () => {
                document.querySelector('[data-tab="iq"]').click();
            });
        }
    }

    function setupPoliticsLogic() {
        let answers = {};
        let current = 1;

        document.getElementById('politics-questions-container').addEventListener('click', e => {
            if (!e.target.classList.contains('option')) return;

            const option = e.target;
            const questionDiv = option.closest('.question');

            questionDiv.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');

            answers[questionDiv.id] = option.getAttribute('data-value');

            // Progress
            const progress = (current / 10) * 100;
            document.getElementById('politics-progress').style.width = `${progress}%`;

            setTimeout(() => {
                questionDiv.classList.remove('active');

                if (current < 10) {
                    current++;
                    document.getElementById(`politics-question-${current}`).classList.add('active');
                } else {
                    // Finish test
                    const result = calculatePoliticalResult(answers);
                    showPoliticsResult(result);
                }
            }, 600);
        });
    }

    function calculatePoliticalResult(answers) {
        let econ = 0, auth = 0;

        Object.values(answers).forEach(v => {
            if (v === 'left')  econ -= 1;
            if (v === 'right') econ += 1;
            if (v === 'auth')  auth += 1;
            if (v === 'lib')   auth -= 1;
        });

        const x = Math.max(5, Math.min(95, 50 + econ * 11));
        const y = Math.max(5, Math.min(95, 50 + auth * 11));

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
        document.getElementById('politics-result').classList.add('active');
        document.getElementById('politics-questions-container').style.display = 'none';

        document.getElementById('politics-score').textContent = result.label;
        document.getElementById('politics-description').textContent = result.description;

        const dot = document.getElementById('user-point');
        dot.style.left = `${result.x}%`;
        dot.style.top  = `${result.y}%`;

        // Save
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

        const resultDiv = document.getElementById('politics-result');
        resultDiv.classList.add('active');
        document.getElementById('politics-questions-container').style.display = 'none';

        document.getElementById('politics-score').textContent = testResults.politics.label;
        document.getElementById('politics-description').textContent = testResults.politics.description;

        const dot = document.getElementById('user-point');
        dot.style.left = `${testResults.politics.x}%`;
        dot.style.top  = `${testResults.politics.y}%`;
    }

    function updateProfileAndHome() {
        // Update profile
        const polStat = document.getElementById('profile-politics');
        if (polStat) polStat.textContent = testResults.politics.label || '--';

        const testsStat = document.getElementById('profile-tests-taken');
        if (testsStat) testsStat.textContent = (testResults.politics.completed ? 1 : 0) + (testResults.iq.completed ? 1 : 0);

        // Update Home button
        const homeBtn = document.querySelector('[data-test="politics"]');
        if (homeBtn && testResults.politics.completed) {
            homeBtn.textContent = `View Results: ${testResults.politics.label}`;
        }
    }

    function setupRestartButtons() {
        document.getElementById('politics-restart')?.addEventListener('click', () => {
            document.getElementById('politics-result').classList.remove('active');
            document.getElementById('politics-questions-container').style.display = 'block';
            document.getElementById('politics-progress').style.width = '0%';
            document.querySelectorAll('#politics-questions-container .question').forEach((q, i) => {
                q.classList.toggle('active', i === 0);
                q.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
            });
        });
    }

    console.log('🚀 iQorum JS fully initialized');
});
