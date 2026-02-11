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
let lastUpdate = localStorage.getItem("remy_user_date");
const monthInMs = 30 * 24 * 60 * 60 * 1000;

window.onload = () => {
    if (userName && (new Date().getTime() - lastUpdate < monthInMs)) {
        showQuiz(userName);
    }
};

function enterQuiz() {
    const nameInput = document.getElementById("username").value;
    if (nameInput.trim() !== "") {
        localStorage.setItem("remy_user_name", nameInput.trim());
        localStorage.setItem("remy_user_date", new Date().getTime());
        showQuiz(nameInput.trim());
    } else {
        alert("اكتب اسمك للمشاركة!");
    }
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
        const score = snapshot.val() || 0;
        document.getElementById("score-display").innerText = "النقاط: " + score;
    });
}

function listenToAdmin() {
    db.ref('currentQuestion').on('value', (snapshot) => {
        const qIndex = snapshot.val();
        const container = document.getElementById("question-container");
        
        if (qIndex === -1 || qIndex === null) {
            // عند إيقاف المسابقة، نمسح ذاكرة الإجابة للسؤال السابق ليكون جاهزاً للسؤال الجديد
            localStorage.removeItem("answered_q");
            container.innerHTML = "<h2>⏳ بانتظار Remy يبدأ السؤال...</h2>";
        } else {
            // التحقق إذا كان قد جاوب على هذا السؤال تحديداً
            const lastAnswered = localStorage.getItem("answered_q");
            if (lastAnswered == qIndex) {
                container.innerHTML = "<h2>✅ تم تسجيل إجابتك مسبقاً</h2><p>انتظر السؤال التالي من Remy</p>";
            } else {
                loadQuestion(qIndex);
            }
        }
    });
}

function loadQuestion(index) {
    const qData = allQuestions[index];
    if(!qData) return;
    const container = document.getElementById("question-container");
    container.innerHTML = `<h2 id="q-text">${qData.q}</h2><div id="options" style="display:grid; gap:10px;"></div>`;
    
    qData.options.forEach((opt, i) => {
        const btn = document.createElement("button");
        btn.innerText = opt;
        btn.style = "padding:15px; cursor:pointer; border-radius:10px; border:none; background:#e94560; color:white; font-weight:bold;";
        btn.onclick = () => checkAnswer(i, index);
        document.getElementById("options").appendChild(btn);
    });
}

function checkAnswer(selected, qIndex) {
    // تخزين رقم السؤال فور الإجابة (سواء صح أو خطأ) لمنع التكرار حتى عند التحديث
    localStorage.setItem("answered_q", qIndex);

    if (selected === allQuestions[qIndex].correct) {
        const timestamp = firebase.database.ServerValue.TIMESTAMP;
        const safeName = userName.replace(/[.#$/[\]]/g, "_");

        const newAnsRef = db.ref('winners/' + qIndex).push({ name: userName, time: timestamp });

        db.ref('winners/' + qIndex).orderByChild('time').limitToFirst(1).once('value', (snapshot) => {
            let firstKey = "";
            snapshot.forEach(child => { firstKey = child.key; });

            if (newAnsRef.key === firstKey) {
                db.ref('totalPoints/' + safeName).transaction((pts) => (pts || 0) + 1);
                alert("🥇 مبروك! أنت الأسرع وحصلت على النقطة.");
                document.getElementById("question-container").innerHTML = `<h2>✅ مبروك! حصلت على النقطة</h2><p>انتظر السؤال التالي من Remy</p>`;
            } else {
                alert("إجابة صحيحة ✅ لكن لست الأسرع.");
                document.getElementById("question-container").innerHTML = `<h2>✅ إجابة صحيحة</h2><p>لكن لست الأسرع، حاول في المرة القادمة!</p>`;
            }
        });
    } else {
        alert("إجابة خاطئة! ❌");
        document.getElementById("question-container").innerHTML = `<h2>❌ إجابة خاطئة</h2><p>انتظر السؤال التالي من Remy</p>`;
    }
}
    } else {
        alert("إجابة خاطئة! ❌");
    }
}

