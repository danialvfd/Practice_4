const mainDisplay = document.getElementById("display");
const historyDisplay = document.getElementById("historyContent");
var isCalculated = false;
var lastInput = '';
let expression = ""; // متغیر جدید برای ذخیره عبارت

class Stack {
    constructor() {
        this.items = [];
    }

    push(element) {
        this.items.push(element);
    }

    pop() {
        if (this.isEmpty()) {
            throw new Error("Stack is empty");
        }
        return this.items.pop();
    }

    peek() {
        if (this.isEmpty()) {
            throw new Error("Stack is empty");
        }
        return this.items[this.items.length - 1];
    }

    isEmpty() {
        return this.items.length === 0;
    }

    size() {
        return this.items.length;
    }
}

function appendNumber(input) {
    // اگر محاسبه شده باشد، نمایشگر را با عدد جدید پر کنید
    if (isCalculated) {
        isCalculated = false;
        mainDisplay.value = input; // مقدار جدید را نمایش دهید
        expression = input; // شروع یک عبارت جدید
        historyDisplay.innerHTML += input; // اضافه کردن عدد به تاریخچه
    } else {
        // اگر آخرین ورودی یک اپراتور باشد، نمایشگر را با عدد جدید پر کنید
        if (lastInput === 'operator') {
            mainDisplay.value = input; // عدد جدید را نمایش دهید
            expression += input; // اضافه کردن عدد به عبارت
            historyDisplay.innerHTML += input; // اضافه کردن عدد به تاریخچه
        } else {
            // مدیریت ورودی نقطه اعشاری
            if (input === '.' && mainDisplay.value.includes('.')) {
                return; // اگر نقطه قبلاً وجود دارد، هیچ کاری نکنید
            }

            // اگر نمایشگر 0 است یا خطا وجود دارد، مقدار جدید را نمایش دهید
            if (mainDisplay.value === '0' || mainDisplay.value === "Error!" || mainDisplay.value === "Infinity") {
                mainDisplay.value = input;
                expression = input; // شروع یک عبارت جدید
                historyDisplay.innerHTML += input; // اضافه کردن عدد به تاریخچه
            } else {
                // اضافه کردن عدد به نمایشگر و عبارت
                if (mainDisplay.value.replace('.', '').length < 11) { 
                    mainDisplay.value += input;
                    expression += input; // اضافه کردن عدد به عبارت
                    historyDisplay.innerHTML += input; // اضافه کردن عدد به تاریخچه
                }
            }
        }
        lastInput = 'number'; // آخرین ورودی را به عنوان عدد ثبت کنید
    }
}

function appendOperator(input) {
    const operators = ['+', '-', '*', '/', '^2', 'sqrt', 'cos'];
    
    if (lastInput === 'number' || lastInput === '') { // اجازه ورود اپراتور فقط بعد از عدد یا در ابتدای ورودی
        expression += input; // اضافه کردن اپراتور به عبارت

        if (lastInput === 'operator') {
            // اگر آخرین ورودی اپراتور بود، اپراتور قبلی را با جدید جایگزین کنید
            historyDisplay.innerHTML = historyDisplay.innerHTML.slice(0, -2) + ` ${input} `; 
        } else {
            historyDisplay.innerHTML += ` ${input} `; // اضافه کردن اپراتور به تاریخچه با فاصله
        }
        
        lastInput = 'operator'; // آخرین ورودی را به عنوان اپراتور ثبت کنید
    } else if (lastInput === 'operator') {
        if (operators.includes(input)) {
            expression = expression.slice(0, -1) + input; // جایگزینی اپراتور قبلی با جدید
            historyDisplay.innerHTML = historyDisplay.innerHTML.slice(0, -2) + ` ${input} `; // بروزرسانی تاریخچه 
        }
    }
}

function clearDisplay() {
    mainDisplay.value = '0';
    historyDisplay.innerHTML = '';
    expression = ""; // پاک کردن عبارت
    lastInput = 'number'; // آخرین ورودی را به عنوان عدد ثبت کنید
}

function calculate() {
    try {
        const result = _compute(expression); // استفاده از عبارت برای محاسبه
        historyDisplay.innerHTML += ` = ${result}`; // نمایش نتیجه در تاریخچه 
        mainDisplay.value = result; // نمایش نتیجه نهایی
    } catch (error) {
        if (error.message === "Division by zero") {
            mainDisplay.value = "infinity!";
        } else {
            mainDisplay.value = "Error";
        }
    } finally {
        isCalculated = true; // نشان دادن اینکه محاسبه انجام شده است
        lastInput = 'number'; // آخرین ورودی را به عنوان عدد ثبت کنید
    }
}

function _compute(expression) {
    expression = expression.replace(/\s+/g, ''); // حذف فاصله‌ها

    const _numbers = new Stack();
    const _operators = new Stack();

    const precedence = { '+': 1, '-': 1, '*': 2, '/': 2 };  // اولویت بندی عملگرها

    // جدا کردن توکن‌ها
    const _tokens = expression.match(/\d+(\.\d+)?|[+\-*/()]/g);  // \d+  عدد یک یا چند رقمی و مشکل اعشار

    for (let i = 0; i < _tokens.length; i++) {
        let token = _tokens[i];

        if (!isNaN(token)) { 
            _numbers.push(parseFloat(token)); 
        } else if (token === '-' && (i === 0 || _tokens[i - 1] === '(' || isNaN(_tokens[i - 1]))) { 
            _tokens[i + 1] = '-' + _tokens[i + 1]; 
        } else { 
            while (!_operators.isEmpty() && precedence[_operators.peek()] >= precedence[token]) { 
                const operator = _operators.pop(); 
                const right = _numbers.pop(); 
                const left = _numbers.pop(); 
                _numbers.push(_applyOperator(left, right, operator)); 
            } 
            _operators.push(token); 
        } 
    }

    while (!_operators.isEmpty()) { 
        const operator = _operators.pop(); 
        const right = _numbers.pop(); 
        const left = _numbers.pop(); 
        _numbers.push(_applyOperator(left, right, operator)); 
    }

    return parseFloat(_numbers.peek().toFixed(4)); // نتیجه نهایی با دقت 4 رقم اعشار 
}

function _applyOperator(left, right, operator) { 
    switch (operator) { 
        case '+': return left + right; 
        case '-': return left - right; 
        case '*': return left * right; 
        case '/': if (right === 0) throw new Error("Division by zero"); return left / right; 
        default: throw new Error("Invalid operator"); 
    } 
}

document.addEventListener('keydown', function(event) { 
    event.preventDefault(); 

    if (!isNaN(event.key)) { 
        appendNumber(event.key); 
    } else if (['+', '-', '*', '/'].includes(event.key)) { 
        appendOperator(event.key); 
    } else if (event.key === 'Enter') { 
        calculate(); 
    } else if (event.key === '.') { 
        appendNumber(event.key); 
    } else if (event.key === 'Backspace') { 
         appendOperator('Backspace');  
     }  
});
