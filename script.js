const display = document.getElementById("display");
const previous = document.getElementById("previous");

const buttons = document.querySelectorAll(
    ".buttons button, .scientific button"
);

const copyBtn = document.getElementById("copyBtn");
const themeBtn = document.getElementById("themeBtn");
const historyList = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistory");

let expression = "";


// ==========================
// إضافة قيمة
// ==========================

function addValue(value) {

    if (expression === "0") {
        expression = "";
    }

    expression += value;

    display.value = expression;
}


// ==========================
// حذف آخر حرف
// ==========================

function deleteLast() {

    expression = expression.slice(0, -1);

    display.value = expression || "0";
}


// ==========================
// مسح
// ==========================

function clearCalculator() {

    expression = "";

    display.value = "0";

    previous.textContent = "";
}


// ==========================
// تحويل الرموز
// ==========================

function prepareExpression(exp) {

    exp = exp
        .replace(/π/g, "Math.PI")
        .replace(/sqrt\(/g, "Math.sqrt(")
        .replace(/sin\(/g, "Math.sin(")
        .replace(/cos\(/g, "Math.cos(")
        .replace(/tan\(/g, "Math.tan(")
        .replace(/log\(/g, "Math.log10(")
        .replace(/ln\(/g, "Math.log(")
        .replace(/\^/g, "**")
        .replace(/%/g, "/100");

    return exp;
}


// ==========================
// حساب
// ==========================

function calculate() {

    if (!expression) return;

    try {

        const originalExpression = expression;

        const prepared = prepareExpression(expression);

        const result = Function(
            `"use strict"; return (${prepared})`
        )();

        if (!Number.isFinite(result)) {
            throw new Error("Invalid");
        }

        const finalResult =
            Number.isInteger(result)
                ? result
                : Number(result.toFixed(10));

        previous.textContent = originalExpression + " =";

        display.value = finalResult;

        expression = String(finalResult);

        addHistory(
            originalExpression,
            finalResult
        );

    } catch (error) {

        display.value = "خطأ";

        setTimeout(() => {

            expression = "";

            display.value = "0";

        }, 1000);
    }
}


// ==========================
// سجل العمليات
// ==========================

function addHistory(exp, result) {

    const empty = historyList.querySelector(".empty");

    if (empty) {
        empty.remove();
    }

    const item = document.createElement("div");

    item.className = "history-item";

    item.innerHTML = `
        <div class="history-expression">
            ${escapeHTML(exp)}
        </div>

        <div class="history-result">
            = ${escapeHTML(String(result))}
        </div>
    `;

    historyList.prepend(item);

    // الاحتفاظ بآخر 20 عملية فقط
    while (historyList.children.length > 20) {
        historyList.lastElementChild.remove();
    }
}


// ==========================
// حماية سجل العمليات
// ==========================

function escapeHTML(text) {

    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ==========================
// الأزرار
// ==========================

buttons.forEach(button => {

    button.addEventListener("click", () => {

        const value = button.dataset.value;
        const action = button.dataset.action;

        if (value) {
            addValue(value);
        }

        if (action === "clear") {
            clearCalculator();
        }

        if (action === "delete") {
            deleteLast();
        }

        if (action === "calculate") {
            calculate();
        }

    });

});


// ==========================
// لوحة المفاتيح
// ==========================

document.addEventListener("keydown", (event) => {

    const key = event.key;

    if (
        /[0-9+\-*/().%^]/.test(key)
    ) {

        event.preventDefault();

        addValue(key);
    }

    if (key === "Enter" || key === "=") {

        event.preventDefault();

        calculate();
    }

    if (key === "Backspace") {

        deleteLast();
    }

    if (key === "Escape") {

        clearCalculator();
    }

});


// ==========================
// نسخ النتيجة
// ==========================

copyBtn.addEventListener("click", async () => {

    try {

        await navigator.clipboard.writeText(
            display.value
        );

        copyBtn.textContent = "✅";

        setTimeout(() => {
            copyBtn.textContent = "📋";
        }, 1000);

    } catch {
        alert("تعذر نسخ النتيجة");
    }

});


// ==========================
// الوضع الليلي/النهاري
// ==========================

let darkMode = true;

themeBtn.addEventListener("click", () => {

    darkMode = !darkMode;

    if (!darkMode) {

        document.documentElement.style.setProperty(
            "--bg",
            "#f1f5f9"
        );

        document.documentElement.style.setProperty(
            "--card",
            "#ffffff"
        );

        document.documentElement.style.setProperty(
            "--display",
            "#e2e8f0"
        );

        document.documentElement.style.setProperty(
            "--button",
            "#cbd5e1"
        );

        document.documentElement.style.setProperty(
            "--text",
            "#0f172a"
        );

        document.body.style.color = "#0f172a";

        themeBtn.textContent = "☀️";

    } else {

        document.documentElement.style.setProperty(
            "--bg",
            "#0f172a"
        );

        document.documentElement.style.setProperty(
            "--card",
            "#1e293b"
        );

        document.documentElement.style.setProperty(
            "--display",
            "#020617"
        );

        document.documentElement.style.setProperty(
            "--button",
            "#334155"
        );

        document.documentElement.style.setProperty(
            "--text",
            "#ffffff"
        );

        document.body.style.color = "#ffffff";

        themeBtn.textContent = "🌙";
    }

});


// ==========================
// مسح السجل
// ==========================

clearHistoryBtn.addEventListener("click", () => {

    historyList.innerHTML = `
        <p class="empty">
            لا توجد عمليات حتى الآن
        </p>
    `;

});
