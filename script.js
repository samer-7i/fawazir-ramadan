let currentScore = 0;
let userName = "";

// بنك الأسئلة (أضف الـ 50 هنا بنفس التنسيق)
const allQuestions = [
    { q: "من هو النبي الذي لُقب بـ كليم الله؟", options: ["إبراهيم", "موسى", "عيسى"], correct: 1 },
    { q: "أكمل المثل: القرد في عين أمه...", options: ["غزال", "فيل", "حصان"], correct: 0 },
    { q: "ما هو الشيء الذي يقرصك ولا تراه؟", options: ["النملة", "الجوع", "الهواء"], correct: 1 },
    { q: "سورة تسمى قلب القرآن؟", options: ["الملك", "الإخلاص", "يس"], correct: 2 }
];

let qIndex = 0;

function enterQuiz() {
    userName = document.getElementById("username").value;
    if (userName.trim() !== "") {
        document.getElementById("login-box").style.display = "none";
        document.getElementById("quiz-box").style.display = "block";
        document.getElementById("user-display").innerText = "المتسابق: " + userName;
        loadQuestion();
    } else {
        alert("يرجى إدخال الاسم!");
    }
}

function loadQuestion() {
    if (qIndex < allQuestions.length) {
        const qData = allQuestions[qIndex];
        document.getElementById("q-text").innerText = qData.q;
        const optionsDiv = document.getElementById("options");
        optionsDiv.innerHTML = "";

        qData.options.forEach((opt, i) => {
            const btn = document.createElement("button");
            btn.innerText = opt;
            btn.onclick = () => checkAnswer(i);
            optionsDiv.appendChild(btn);
        });
    } else {
        document.getElementById("question-container").innerHTML = "<h2>انتهت أسئلة اليوم! بطل 🌙</h2>";
    }
}

function checkAnswer(selected) {
    const timeAnswered = new Date().toLocaleTimeString(); // تسجيل وقت الإجابة للفرز
    if (selected === allQuestions[qIndex].correct) {
        currentScore += 10;
        document.getElementById("score-display").innerText = "النقاط: " + currentScore;
        console.log(`المستخدم ${userName} جاوب صح في وقت: ${timeAnswered}`);
    }
    qIndex++;
    loadQuestion();
}
