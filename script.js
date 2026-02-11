// بيانات الربط الخاصة بك
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

let userName = "";

// دالة الدخول للمسابقة
function enterQuiz() {
    userName = document.getElementById("username").value;
    if (userName.trim() !== "") {
        // إخفاء صندوق الدخول وإظهار رسالة الانتظار
        document.getElementById("login-box").style.display = "none";
        document.getElementById("quiz-box").style.display = "block";
        
        // البدء بمراقبة الأسئلة من الأدمن
        listenToAdmin();
    } else {
        alert("يرجى إدخال اسمك أولاً!");
    }
}

function listenToAdmin() {
    db.ref('currentQuestion').on('value', (snapshot) => {
        const qIndex = snapshot.val();
        const container = document.getElementById("question-container");
        
        if (qIndex === -1 || qIndex === null) {
            container.innerHTML = "<h2>⏳ بانتظار سامر يبدأ السؤال...</h2>";
            container.style.display = "block";
        } else {
            // هنا تظهر الأسئلة (سنضع دالة loadQuestion لاحقاً)
            container.innerHTML = "<h2>السؤال رقم " + (qIndex + 1) + " ظهر الآن!</h2>";
        }
    });
}
