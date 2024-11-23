const mainDisplay = document.getElementById("display");
const historyDisplay = document.getElementById("historyContent");
var isCalculated = false;
var lastInput = '';
let expression = ""; // متغیر برای ذخیره عبارت

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
        expression = input;
        historyDisplay.innerHTML += input;
    } else {
        if (lastInput === 'operator') {
            mainDisplay.value = input;
            expression += input;
            historyDisplay.innerHTML += input;
        } else {
            if (input === '.' && mainDisplay.value.includes('.')) {
                return;
            }

            if (mainDisplay.value === '0' || mainDisplay.value === "Error!" || mainDisplay.value === "Infinity") {
                mainDisplay.value = input;
                expression = input;
                historyDisplay.innerHTML += input;
            } else {
                if (mainDisplay.value.replace('.', '').length < 11) {
                    mainDisplay.value += input;
                    expression += input;
                    historyDisplay.innerHTML += input;
                }
            }
        }
    }
    lastInput = 'number';
}

function appendOperator(input) {
    const operators = ['+', '-', '*', '/', '^2', 'sqrt', 'cos'];

    if (input === 'pm') {
        // تغییر علامت عدد قبلی
        if (lastInput === 'number' && expression.length > 0) {
            let lastNumber = '';
            let i = expression.length - 1;

            while (i >= 0 && (/\d/).test(expression[i]) || expression[i] === '.') {
                lastNumber = expression[i] + lastNumber;
                i--;
            }

            if (lastNumber) {
                let newNumber = (parseFloat(lastNumber) * -1).toString();
                expression = expression.slice(0, i + 1) + newNumber;
                mainDisplay.value = expression;
                historyDisplay.innerHTML = expression;
            }
        }
    } else if (operators.includes(input)) {
        if (lastInput === 'number' || lastInput === '') {
            expression += input;
            if (lastInput === 'operator') {
                historyDisplay.innerHTML = historyDisplay.innerHTML.slice(0, -2) + ` ${input} `;
            } else {
                historyDisplay.innerHTML += ` ${input} `;
            }
            lastInput = 'operator';
        } else if (lastInput === 'operator') {
            if (operators.includes(input)) {
                expression = expression.slice(0, -1) + input;
                historyDisplay.innerHTML = historyDisplay.innerHTML.slice(0, -2) + ` ${input} `;
            }
        }
    }
}

function clearDisplay() {
    mainDisplay.value = '0';
    historyDisplay.innerHTML = '';
    expression = "";
    lastInput = 'number';
}

function calculate() {
    try {
        const result = _compute(expression);
        historyDisplay.innerHTML += ` = ${result}`;
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
function backspace() {
    // اگر عبارت بیشتر از یک کاراکتر دارد
    if (expression.length > 0) {
        // بررسی اینکه آیا آخرین ورودی عدد است یا اپراتور
        const lastChar = expression[expression.length - 1];

        // اگر آخرین ورودی عدد باشد، آن را پاک کن
        if (!isNaN(lastChar) || lastChar === '.') { // بررسی اینکه عدد باشد یا نقطه اعشاری
            // حذف آخرین کاراکتر از عبارت
            expression = expression.slice(0, -1);

            // حذف آخرین کاراکتر از نمایشگر
            mainDisplay.value = mainDisplay.value.slice(0, -1);

            // حذف آخرین کاراکتر از تاریخچه
            historyDisplay.innerHTML = historyDisplay.innerHTML.slice(0, -1);

            // اگر نمایشگر خالی شد، مقدار پیش‌فرض "0" را نشان بده
            if (mainDisplay.value === '') {
                mainDisplay.value = '0';
            }

            lastInput = 'number'; // اگر عدد پاک شده، آخرین ورودی عدد است
        }
        // اگر آخرین ورودی اپراتور باشد، هیچ کاری انجام نده
        else if (['+', '-', '*', '/', '^2', 'sqrt', 'cos'].includes(lastChar)) {
            // هیچ چیزی پاک نمی‌شود
            return;
        }
    }
}

function _compute(expression) {
    expression = expression.replace(/\s+/g, '');

    const _numbers = new Stack();
    const _operators = new Stack();

    const precedence = { '+': 1, '-': 1, '*': 2, '/': 2, '^2': 3, 'sqrt': 3, 'cos': 3 };

    const _tokens = expression.match(/\d+(\.\d+)?|[+\-*/()^2sqrtcos]/g);

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

    return parseFloat(_numbers.peek().toFixed(4));
}

function _applyOperator(left, right, operator) {
    switch (operator) {
        case '+': return left + right;
        case '-': return left - right;
        case '*': return left * right;
        case '/': if (right === 0) throw new Error("Division by zero"); return left / right;
        case '^2': return Math.pow(left, 2);
        case 'sqrt': 
            if (left < 0) throw new Error("Cannot calculate square root of a negative number"); 
            return Math.sqrt(left);
        case 'cos': return Math.cos(left);
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
