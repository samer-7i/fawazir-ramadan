// 1. بيانات الربط الخاصة بك (Remy-9)
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

// 2. بنك الأسئلة (يمكنك إضافة المزيد حتى 50 بنفس الطريقة)
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
    { q: "أين تقع الكعبة المشرفة؟", options: ["المدينة", "القدس", "مكة"], correct: 2 },
    { q: "ما هو الكوكب الأحمر؟", options: ["المريخ", "المشتري", "زحل"], correct: 0 },
    { q: "ما هو أسرع حيوان بري؟", options: ["الأسد", "الفهد", "الغزال"], correct: 1 },
    { q: "ما هو الشيء الذي تذبحه وتبكي عليه؟", options: ["البصل", "الليمون", "البطيخ"], correct: 0 },
    { q: "سورة في القرآن تسمى سورة المنجية؟", options: ["يس", "الملك", "الكهف"], correct: 1 },
    { q: "من هو الصحابي الذي لُقب بذي النورين؟", options: ["علي بن أبي طالب", "عمر بن الخطاب", "عثمان بن عفان"], correct: 2 }
];

// 3. نظام قفل الاسم (localStorage)
let userName = localStorage.getItem("remy_user_name");
let lastUpdate = localStorage.getItem("remy_user_date");
const monthInMs = 30 * 24 * 60 * 60 * 1000;
const isExpired = lastUpdate && (new Date().getTime() - lastUpdate > monthInMs);

window.onload = () => {
    if (userName && !isExpired) {
        showQuiz(userName);
    }
};

function enterQuiz() {
    const nameInput = document.getElementById("username").value;
    if (nameInput.trim() !== "") {
        localStorage.setItem("remy_user_name", nameInput);
        localStorage.setItem("remy_user_date", new Date().getTime());
        showQuiz(nameInput);
    } else {
        alert("يرجى إدخال اسمك أولاً!");
    }
}

function showQuiz(name) {
    userName = name;
    document.getElementById("login-box").style.display = "none";
    document.getElementById("quiz-box").style.display = "block";
    document.getElementById("user-display").innerText = "المتسابق: " + userName;
    listenToAdmin();
}

// 4. الربط المباشر مع لوحة تحكم Remy
function listenToAdmin() {
    db.ref('currentQuestion').on('value', (snapshot) => {
        const qIndex = snapshot.val();
        const container = document.getElementById("question-container");
        if (qIndex === -1 || qIndex === null) {
            container.innerHTML = "<h2>⏳ بانتظار Remy يبدأ السؤال...</h2>";
        } else {
            loadQuestion(qIndex);
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

// 5. تسجيل الإجابة وتحديد المركز فوراً
function checkAnswer(selected, qIndex) {
    if (selected === allQuestions[qIndex].correct) {
        const timestamp = firebase.database.ServerValue.TIMESTAMP;
        
        // إرسال الإجابة
        const newAnswerRef = db.ref('winners/' + qIndex).push({
            name: userName,
            time: timestamp
        });

        // جلب الترتيب
        db.ref('winners/' + qIndex).once('value', (snapshot) => {
            const answers = [];
            snapshot.forEach((child) => {
                answers.push({ key: child.key, ...child.val() });
            });

            answers.sort((a, b) => a.time - b.time);
            const myRank = answers.findIndex(a => a.key === newAnswerRef.key) + 1;

            let resultMsg = "";
            if (myRank === 1) resultMsg = "🥇 مبروك! أنت الأول (الأسرع)";
            else if (myRank === 2) resultMsg = "🥈 ممتاز! أنت في المركز الثاني";
            else if (myRank === 3) resultMsg = "🥉 بطل! أنت في المركز الثالث";
            else resultMsg = `صح! مركزك الحالي: ${myRank}`;

            alert(resultMsg);
            document.getElementById("question-container").innerHTML = `<h2>${resultMsg}</h2><p>انتظر السؤال التالي من Remy ⏳</p>`;
        });

    } else {
        alert("للأسف إجابة خاطئة!");
        document.getElementById("question-container").innerHTML = "<h2>إجابة خاطئة.. ركز في السؤال الجاي! ⏳</h2>";
    }
}
