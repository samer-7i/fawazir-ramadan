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

let userName = localStorage.getItem("remy_user_name");

window.onload = () => { if (userName) showQuiz(userName); };

function enterQuiz() {
    const nameInput = document.getElementById("username").value.trim();
    if (nameInput !== "") {
        localStorage.setItem("remy_user_name", nameInput);
        showQuiz(nameInput);
    } else { alert("اكتب اسمك للمشاركة!"); }
}

function showQuiz(name) {
    userName = name;
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
            // فحص قاعدة البيانات: هل الاسم موجود في قائمة الفائزين لهذا السؤال؟
            db.ref('winners/' + qIndex).once('value', (snap) => {
                let found = false;
                snap.forEach(child => { if(child.val().name === userName) found = true; });
                
                if (found) {
                    container.innerHTML = "<h2>✅ تم تسجيل إجابتك</h2><p>انتظر السؤال التالي من Remy</p>";
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
    // إخفاء الخيارات فوراً لمنع الضغط المتكرر
    document.getElementById("question-container").innerHTML = "<h2>جاري تسجيل إجابتك...</h2>";

    const timestamp = firebase.database.ServerValue.TIMESTAMP;
    const safeName = userName.replace(/[.#$/[\]]/g, "_");

    // 1. تسجيل الإجابة (سواء صح أو خطأ) لمنع المحاولة مرة أخرى
    const isCorrect = (selected === allQuestions[qIndex].correct);
    const newAnsRef = db.ref('winners/' + qIndex).push({ name: userName, time: timestamp, correct: isCorrect });

    if (isCorrect) {
        // 2. فحص هل هو الأول ليأخذ النقطة
        db.ref('winners/' + qIndex).orderByChild('time').limitToFirst(1).once('value', (snapshot) => {
            let firstKey = "";
            snapshot.forEach(child => { firstKey = child.key; });

            if (newAnsRef.key === firstKey) {
                db.ref('totalPoints/' + safeName).transaction((pts) => (pts || 0) + 1);
                alert("🥇 مبروك! أنت الأسرع وحصلت على النقطة.");
            } else {
                alert("إجابة صحيحة ✅ لكن لست الأسرع.");
            }
            document.getElementById("question-container").innerHTML = "<h2>✅ تم تسجيل إجابتك</h2><p>انتظر السؤال التالي...</p>";
        });
    } else {
        alert("إجابة خاطئة! ❌");
        document.getElementById("question-container").innerHTML = "<h2>❌ إجابة خاطئة</h2><p>تعوضها في السؤال القادم!</p>";
    }
}
