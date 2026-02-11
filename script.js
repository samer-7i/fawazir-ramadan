// ... (بيانات FirebaseConfig تبقى كما هي بدون تغيير) ...

function listenToAdmin() {
    db.ref('currentQuestion').on('value', (snapshot) => {
        const qIndex = snapshot.val();
        const container = document.getElementById("question-container");
        
        if (qIndex === -1 || qIndex === null) {
            container.innerHTML = "<h2>⏳ بانتظار Remy يبدأ السؤال...</h2>";
        } else {
            // التحقق من قاعدة البيانات مباشرة: هل هذا المستخدم جاوب على هذا السؤال؟
            db.ref('winners/' + qIndex).once('value', (winSnapshot) => {
                let alreadyAnswered = false;
                winSnapshot.forEach(child => {
                    if (child.val().name === userName) {
                        alreadyAnswered = true;
                    }
                });

                if (alreadyAnswered) {
                    container.innerHTML = "<h2>✅ تم تسجيل إجابتك مسبقاً</h2><p>انتظر السؤال التالي من Remy</p>";
                } else {
                    loadQuestion(qIndex);
                }
            });
        }
    });
}

function checkAnswer(selected, qIndex) {
    // تعطيل الأزرار فور الضغط لمنع النقر المزدوج
    const buttons = document.querySelectorAll("#options button");
    buttons.forEach(b => b.disabled = true);

    if (selected === allQuestions[qIndex].correct) {
        const timestamp = firebase.database.ServerValue.TIMESTAMP;
        const safeName = userName.replace(/[.#$/[\]]/g, "_");

        // تسجيل الإجابة
        const newAnsRef = db.ref('winners/' + qIndex).push({ name: userName, time: timestamp });

        // التحقق من الأسرع
        db.ref('winners/' + qIndex).orderByChild('time').limitToFirst(1).once('value', (snapshot) => {
            let firstKey = "";
            snapshot.forEach(child => { firstKey = child.key; });

            if (newAnsRef.key === firstKey) {
                db.ref('totalPoints/' + safeName).transaction((pts) => (pts || 0) + 1);
                alert("🥇 مبروك! أنت الأسرع وحصلت على النقطة.");
            } else {
                alert("إجابة صحيحة ✅ لكن لست الأسرع.");
            }
            // إخفاء الأسئلة فوراً
            document.getElementById("question-container").innerHTML = "<h2>✅ تم تسجيل إجابتك</h2><p>انتظر السؤال التالي...</p>";
        });
    } else {
        // حتى لو أخطأ، نسجله في القائمة لكي لا يحاول مرة أخرى (اختياري)
        db.ref('winners/' + qIndex).push({ name: userName, status: "wrong" });
        alert("إجابة خاطئة! ❌");
        document.getElementById("question-container").innerHTML = "<h2>❌ إجابة خاطئة</h2><p>تعوضها في السؤال القادم!</p>";
    }
}
