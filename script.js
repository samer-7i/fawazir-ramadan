// بيانات الربط الخاصة بك (Firebase Config)
const firebaseConfig = {
  apiKey: "AIzaSyBxqfLt3o3JWy_vwnpwSQPIVdtEDGoYB6k",
  authDomain: "fawazir-jaco.firebaseapp.com",
  databaseURL: "https://fawazir-jaco-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "fawazir-jaco",
  storageBucket: "fawazir-jaco.firebasestorage.app",
  messagingSenderId: "862747657100",
  appId: "1:862747657100:web:d52ecee9373a5e33fd8ca9"
};

// تشغيل فايربيس
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

let currentScore = 0;
let userName = "";

// --- هنا تضع أسئلتك (أضف حتى 50 سؤالاً بنفس الطريقة) ---
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

function enterQuiz() {
    userName = document.getElementById("username").value;
    if (userName.trim() !== "") {
        document.getElementById("login-box").style.display = "none";
        document.getElementById("quiz-box").style.display = "block";
        document.getElementById("user-display").innerText = "المتسابق: " + userName;
        listenToAdmin();
    } else {
        alert("يرجى إدخال اسمك!");
    }
}

function listenToAdmin() {
    db.ref('currentQuestion').on('value', (snapshot) => {
        const qIndex = snapshot.val();
        if (qIndex === -1 || qIndex === null) {
            document.getElementById("question-container").innerHTML = "<h2>⏳ بانتظار Remy يبدأ السؤال...</h2>";
        } else {
            loadQuestion(qIndex);
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
        btn.onclick = () => checkAnswer(i, index);
        document.getElementById("options").appendChild(btn);
    });
}

function checkAnswer(selected, qIndex) {
    if (selected === allQuestions[qIndex].correct) {
        const timeAnswered = new Date().getTime();
        db.ref('winners/' + qIndex).push({
            name: userName,
            time: timeAnswered
        });
        alert("إجابة صحيحة!");
    } else {
        alert("للأسف إجابة خاطئة!");
    }
    document.getElementById("question-container").innerHTML = "<h2>تم تسجيل إجابتك.. انتظر السؤال التالي من Remy ⏳</h2>";
}
