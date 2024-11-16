const mainDisplay = document.getElementById("display");
const historyDisplay = document.getElementById("historyContent");
var isCalculated = false;
var lastInput = '';

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
    if (isCalculated) {
        isCalculated = false;
        mainDisplay.value = input;
    } else {
        if (mainDisplay.value === '0' || mainDisplay.value === "Error!" || mainDisplay.value === "Infinity") {
            mainDisplay.value = input;
        } else {
            if (mainDisplay.value.replace('.', '').length < 11) { 
                mainDisplay.value += input;
            }
        }
        lastInput = 'number';
    }
}


function appendOperator(input) {
    const operators = ['+', '-', '*', '/', '^2', 'sqrt', 'cos'];
    if (lastInput === 'number') {
        if (input === 'sqrt') {
            mainDisplay.value = parseFloat(Math.sqrt(mainDisplay.value).toFixed(4));
            lastInput = 'number';
        } else if (input === 'cos') {
            const angle = mainDisplay.value;
            mainDisplay.value = parseFloat(Math.cos(angle * (Math.PI / 180)).toFixed(4));
            lastInput = 'number';
        } else if (input === 'pm') {
            mainDisplay.value = -mainDisplay.value;
            lastInput = 'number';
        } else if (input === '^2') {
            mainDisplay.value = Math.pow(mainDisplay.value, 2);
            lastInput = 'number';
        } else if (input === 'Backspace') {
            mainDisplay.value = mainDisplay.value.slice(0, -1);
        } else {
            mainDisplay.value += input;
            lastInput = 'operator';
        }
    } else if (lastInput === 'operator') {
        if (operators.includes(input)) {
            mainDisplay.value = mainDisplay.value.slice(0, -1) + input;
        } else if (input === 'Backspace') {
            mainDisplay.value = mainDisplay.value.slice(0, -1);
            lastInput = 'number';
        }
    }
}

function clearDisplay() {
    mainDisplay.value = '0';
    historyDisplay.innerHTML = '';
    lastInput = 'number';
}

function calculate() {
    try {
        const result = _compute(mainDisplay.value);
        historyDisplay.innerHTML = `${mainDisplay.value} = ${result}`;
        mainDisplay.value = result;
    } catch (error) {
        if (error.message === "Division by zero") {
            mainDisplay.value = "infinity!";
        } else {
            mainDisplay.value = "Error";
        }
    } finally {
        isCalculated = true;
        lastInput = 'number';
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
            // اگر توکن علامت منفی و قبل از آن یک عملگر یا پرانتز باز است
            // به‌جای اپراتور، آن را به عنوان یک عدد منفی در نظر بگیریم
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
        case '+':
            return left + right;
        case '-':
            return left - right;
        case '*':
            return left * right;
        case '/':
            if (right === 0) throw new Error("Division by zero");
            return left / right;
        default:
            throw new Error("Invalid operator");
    }
}

document.addEventListener('keydown', function (event) {
    event.preventDefault(); // جلوگیری از رفتار پیش‌فرض*****
    if (!isNaN(event.key)) {
        appendNumber(event.key);
    } else if (['+', '-', '*', '/', '.'].includes(event.key)) {
        appendOperator(event.key);
    } else if (event.key === 'Enter') {
        calculate();
    } else if (event.key === 'Backspace') {
        appendOperator('Backspace');
    }
});