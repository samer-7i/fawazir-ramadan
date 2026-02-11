// بيانات الربط الخاصة بك من صورتك (Firebase Config)
const firebaseConfig = {
  apiKey: "AIzaSyBxqfLt3o3JWy_vwnpwSQPIVdtEDGoYB6k",
  authDomain: "fawazir-jaco.firebaseapp.com",
  projectId: "fawazir-jaco",
  storageBucket: "fawazir-jaco.firebasestorage.app",
  messagingSenderId: "862747657100",
  appId: "1:862747657100:web:d52ecee9373a5e33fd8ca9",
  measurementId: "G-YNJZJBZWMB"
};

// تشغيل Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

let currentScore = 0;
let userName = "";

// بنك الـ 50 سؤالاً (تقدر تزيد عليهم بنفس النمط)
const allQuestions = [
    { q: "ما هي السورة التي تسمى عروس القرآن؟", options: ["يس", "الرحمن", "الملك"], correct: 1 },
    { q: "أكمل المثل: القرد في عين أمه...", options: ["غزال", "بطل", "حصان"], correct: 0 },
    { q: "ما هو الشيء الذي يقرصك ولا تراه؟", options: ["النملة", "الجوع", "الهواء"], correct: 1 },
    { q: "سورة تسمى قلب القرآن؟", options: ["يس", "الملك", "الواقعة"], correct: 0 },
    { q: "من هو النبي الذي لُقب بـ كليم الله؟", options: ["إبراهيم", "عيسى", "موسى"], correct: 2 },
    { q: "ما هو الشيء الذي يكتب ولا يقرأ؟", options: ["القلم", "الكتاب", "الورقة"], correct: 0 },
    { q: "كم عدد سور القرآن الكريم؟", options: ["110", "114", "120"], correct: 1 },
    { q: "أطول كلمة في القرآن الكريم؟", options: ["فأسقيناكموه", "فاسلكوه", "أنلزمكموها"], correct: 0 }
    // سأعطيك الباقي فور طلبك
];

function enterQuiz() {
    userName = document.getElementById("username").value;
    if (userName.trim() !== "") {
        document.getElementById("login-box").style.display = "none";
        document.getElementById("quiz-box").style.display = "block";
        listenToAdmin(); // المتابع يبدأ بمراقبة الأدمن
    } else {
        alert("يرجى إدخال الاسم!");
    }
}

// هذه الوظيفة تجعل المتصفح ينتظر إشارة منك (الأدمن)
function listenToAdmin() {
    db.ref('currentQuestion').on('value', (snapshot) => {
        const qIndex = snapshot.val();
        if (qIndex === -1) {
            document.getElementById("question-container").innerHTML = "<h2>انتظر السؤال القادم من الستريمر... 🌙</h2>";
        } else if (qIndex !== null) {
            loadQuestion(qIndex);
        }
    });
}

function loadQuestion(index) {
    const qData = allQuestions[index];
    const container = document.getElementById("question-container");
    container.innerHTML = `<h2 id="q-text">${qData.q}</h2><div id="options"></div>`;
    
    const optionsDiv = document.getElementById("options");
    qData.options.forEach((opt, i) => {
        const btn = document.createElement("button");
        btn.innerText = opt;
        btn.onclick = () => checkAnswer(i, index);
        optionsDiv.appendChild(btn);
    });
}

function checkAnswer(selected, qIndex) {
    if (selected === allQuestions[qIndex].correct) {
        const timeAnswered = new Date().getTime(); // تسجيل الوقت بالملي ثانية للفرز
        // إرسال النتيجة فوراً للفايربيس للأدمن
        db.ref('winners/' + qIndex).push({
            name: userName,
            time: timeAnswered
        });
        alert("إجابة صحيحة! بطل");
    } else {
        alert("إجابة خاطئة، حاول في السؤال القادم");
    }
    // إخفاء السؤال بعد الإجابة حتى يرسل الأدمن سؤالاً جديداً
    document.getElementById("question-container").innerHTML = "<h2>تم تسجيل إجابتك.. انتظر السؤال التالي ⏳</h2>";
}
}

