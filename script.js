const firebaseConfig = {
  apiKey: "AIzaSyBxqfLt3o3JWy_vwnpwSQPIVdtEDGoYB6k",
  authDomain: "fawazir-jaco.firebaseapp.com",
  databaseURL: "https://fawazir-jaco-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "fawazir-jaco",
  storageBucket: "fawazir-jaco.firebasestorage.app",
  messagingSenderId: "862747657100",
  appId: "1:862747657100:web:d52ecee9373a5e33fd8ca9"
};

if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
const db = firebase.database();

const allQuestions = [
    { q: "من هو النبي الذي لُقب بكليم الله؟", options: ["إبراهيم", "موسى", "عيسى"], correct: 1 },
    { q: "ما هي أطول سورة في القرآن الكريم؟", options: ["آل عمران", "النساء", "البقرة"], correct: 2 },
    { q: "أكمل المثل: القرد في عين أمه...", options: ["غزال", "فيل", "حصان"], correct: 0 },
    { q: "ما هو الشيء الذي يقرصك ولا تراه؟", options: ["البرد", "الجوع", "النملة"], correct: 1 },
    { q: "سورة تُسمى قلب القرآن؟", options: ["يس", "الملك", "الرحمن"], correct: 0 },
    { q: "ما هو الشيء الذي له أسنان ولا يعض؟", options: ["المنشار", "المشط", "المفتاح"], correct: 1 },
    { q: "كم عدد سجدات التلاوة في القرآن؟", options: ["12", "15", "10"], correct: 1 },
    { q: "من هو أول من صام؟", options: ["آدم عليه السلام", "نوح عليه السلام", "محمد ﷺ"], correct: 0 },
    { q: "ما هو العضو الذي يغلق تلقائياً عند العطس؟", options: ["الأذن", "العين", "الفم"], correct: 1 },
    { q: "أين تقع الكعبة المشرفة؟", options: ["المدينة", "القدس", "مكة"], correct: 2 }
];

let userName = "";

window.onload = function() {
    let savedName = localStorage.getItem("remy_user_name");
    if (savedName) {
        userName = savedName;
        startApp();
    }
};

function enterQuiz() {
    let input = document.getElementById("username").value.trim();
    if (input === "") { alert("يرجى كتابة الاسم أولاً"); return; }
    userName = input;
    localStorage.setItem("remy_user_name", userName);
    startApp();
}

function startApp() {
    document.getElementById("login-box").style.display = "none";
    document.getElementById("quiz-box").style.display = "block";
    document.getElementById("user-display").innerText = "المتسابق: " + userName;
    trackLiveScore();
    listenToAdmin();
}

function trackLiveScore() {
    const safeName = userName.replace(/[.#$/[\]]/g, "_");
    db.ref('totalPoints/' + safeName).on('value', (snapshot) => {
        document.getElementById("score-display").innerText = "النقاط: " + (snapshot.val() || 0);
    });
}

function listenToAdmin() {
    db.ref('currentQuestion').on('value', (snapshot) => {
        const qIndex = snapshot.val();
        const container = document.getElementById("question-container");
        if (qIndex === -1 || qIndex === null) {
            container.innerHTML = "<h2>⏳ بانتظار Remy يبدأ السؤال...</h2>";
        } else {
            db.ref('winners/' + qIndex).once('value', (snap) => {
                let found = false;
                snap.forEach(child => { if(child.val().name === userName) found = true; });
                if (found) {
                    container.innerHTML = "<h2>✅ تم تسجيل إجابتك</h2><p>انتظر السؤال التالي</p>";
                } else {
                    loadQuestion(qIndex);
                }
            });
        }
    });
}

function loadQuestion(index) {
    const qData = allQuestions[index];
    const container = document.getElementById("question-container");
    container.innerHTML = `<h2 id="q-text">${qData.q}</h2><div id="options"></div>`;
    qData.options.forEach((opt, i) => {
        const btn = document.createElement("button");
        btn.innerText = opt;
        btn.className = "opt-btn";
        btn.onclick = () => checkAnswer(i, index);
        document.getElementById("options").appendChild(btn);
    });
}

function checkAnswer(selected, qIndex) {
    const container = document.getElementById("question-container");
    container.innerHTML = "<h2>جاري التسجيل...</h2>";
    
    const timestamp = firebase.database.ServerValue.TIMESTAMP;
    const safeName = userName.replace(/[.#$/[\]]/g, "_");
    const isCorrect = (selected === allQuestions[qIndex].correct);

    // تسجيل الإجابة
    const newAnsRef = db.ref('winners/' + qIndex).push({ name: userName, time: timestamp, correct: isCorrect });

    if (isCorrect) {
        // حساب الترتيب (المركز)
        db.ref('winners/' + qIndex).orderByChild('time').once('value', (snapshot) => {
            let answers = [];
            snapshot.forEach(child => {
                // نحسب فقط أصحاب الإجابات الصحيحة في الترتيب
                if(child.val().correct === true) {
                    answers.push({ key: child.key, name: child.val().name });
                }
            });

            // معرفة ترتيب اللاعب الحالي في المصفوفة
            const myRank = answers.findIndex(a => a.key === newAnsRef.key) + 1;

            if (myRank === 1) {
                db.ref('totalPoints/' + safeName).transaction(pts => (pts || 0) + 1);
                container.innerHTML = "<h2>🥇 مبروك! أنت الأول وحصلت على نقطة</h2>";
            } else {
                container.innerHTML = `<h2>✅ إجابة صحيحة</h2><p>مركزك هو: <b>${myRank}</b></p><p>النقطة تذهب للأول فقط.</p>`;
            }
        });
    } else {
        container.innerHTML = "<h2>❌ إجابة خاطئة!</h2><p>تعوضها في السؤال الجاي</p>";
    }
}
