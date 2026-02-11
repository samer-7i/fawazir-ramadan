// 1. بيانات الربط (Firebase Config)
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

// 2. بنك الأسئلة (يمكنك إضافة المزيد بنفس النمط حتى 50)
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
    { q: "ما هو أسرع حيوان بري؟", options: ["الأسد", "الفهد", "الغزال"], correct: 1 }
];

// 3. نظام قفل الاسم لمدة شهر (localStorage)
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
        alert("يرجى إدخال اسمك!");
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
    container.innerHTML = `<h2 id="q-text">${qData.q}</h2><div id="options"></div>`;
    
    qData.options.forEach((opt, i) => {
        const btn = document.createElement("button");
        btn.innerText = opt;
        btn.onclick = () => checkAnswer(i, index);
        document.getElementById("options").appendChild(btn);
    });
}

// 5. تسجيل الإجابة وتحديد الأسرع
function checkAnswer(selected, qIndex) {
    if (selected === allQuestions[qIndex].correct) {
        const timestamp = firebase.database.ServerValue.TIMESTAMP;
        
        // 1. إرسال الإجابة أولاً
        const newAnswerRef = db.ref('winners/' + qIndex).push({
            name: userName,
            time: timestamp
        });

        // 2. حساب المركز فوراً من قاعدة البيانات
        db.ref('winners/' + qIndex).once('value', (snapshot) => {
            let count = 0;
            const answers = [];
            
            snapshot.forEach((child) => {
                answers.push({ key: child.key, ...child.val() });
            });

            // ترتيب الإجابات حسب الوقت للتأكد من المركز
            answers.sort((a, b) => a.time - b.time);
            
            // البحث عن ترتيب اللاعب الحالي
            const myRank = answers.findIndex(a => a.key === newAnswerRef.key) + 1;

            // 3. إظهار النتيجة للمتسابقة بالمركز
            let rankText = "";
            if (myRank === 1) rankText = "🥇 مبروك! أنت الأول (الأسرع)";
            else if (myRank === 2) rankText = "🥈 ممتاز! أنت في المركز الثاني";
            else if (myRank === 3) rankText = "🥉 بطل! أنت في المركز الثالث";
            else rankText = `صح! مركزك الحالي: ${myRank}`;

            alert(rankText);
            document.getElementById("question-container").innerHTML = `<h2>${rankText}</h2><p>انتظر السؤال التالي من Remy ⏳</p>`;
        });

    } else {
        alert("للأسف إجابة خاطئة!");
        document.getElementById("question-container").innerHTML = "<h2>إجابة خاطئة.. تعوضها في السؤال الجاي! ⏳</h2>";
    }


