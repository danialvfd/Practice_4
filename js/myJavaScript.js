const mainDisplay = document.getElementById("display");
const historyDisplay = document.getElementById("historyContent");
var isCalculated = false;
var lastInput = '';
let expression = ""; // متغیر برای ذخیره عبارت
let memory = null;

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
        historyDisplay.innerText += input;
    } else {
        if (lastInput === 'operator') {
            mainDisplay.value = input;
            expression += input;
            historyDisplay.innerText += input;
        } else {
            if (input === '.' && mainDisplay.value.includes('.')) {
                return;
            }

            if (mainDisplay.value === '0' || mainDisplay.value === "Error!" || mainDisplay.value === "Infinity") {
                mainDisplay.value = input;
                expression = input;
                historyDisplay.innerText += input;
            } else {
                if (mainDisplay.value.replace('.', '').length < 11) {
                    mainDisplay.value += input;
                    expression += input;
                    historyDisplay.innerText += input;
                }
            }
        }
    }
    lastInput = 'number';
}

function appendOperator(input) {
    const operators = ['+', '-', '*', '/', '^2', 'sqrt', 'cos'];

    // اگر ورودی اپراتور ± باشد
    if (input === 'pm') {
        if (lastInput === 'number' && mainDisplay.value !== '') {
            let currentValue = parseFloat(mainDisplay.value);
            currentValue *= -1;
            mainDisplay.value = currentValue;
            expression = expression.slice(0, -mainDisplay.value.length) + currentValue.toString();
            historyDisplay.innerText = expression;
        }
        return;
    }

    // اگر اپراتور در لیست تعریف‌شده باشد
    if (operators.includes(input)) {
        // اگر حافظه مقدار داشته باشد و ورودی جدیدی ثبت نشده باشد
        if ((lastInput === '' || isCalculated) && memory !== null) {
            expression = memory.toString(); // استفاده از مقدار حافظه به عنوان مقدار اولیه
            historyDisplay.innerText = `${memory} ${input} `;
            isCalculated = false; // ریست حالت محاسبه
        }
        
        // اگر عددی قبل از اپراتور وارد شده باشد
        if (lastInput === 'number') {
            expression += input;
            historyDisplay.innerText += ` ${input} `;
        }
        // اگر قبلاً اپراتور دیگری ثبت شده باشد، جایگزین آن شود
        else if (lastInput === 'operator') {
            expression = expression.slice(0, -1) + input;
            historyDisplay.innerText = historyDisplay.innerText.slice(0, -2) + ` ${input} `;
        }
        lastInput = 'operator';
    }

    // اگر تعداد اپراتورها در عبارت >= 2 باشد، محاسبه شود
    const escapedOperators = operators.map(op => op.replace(/[-\/\\^$.*+?()[\]{}|]/g, '\\$&'));
    const operatorPattern = escapedOperators.join('|');
    const regex = new RegExp(operatorPattern, 'g');
    const matches = expression.match(regex);
    if (matches && matches.length >= 2) {
        calculate();

    }
}


function clearDisplay() {
    mainDisplay.value = '0';
    historyDisplay.innerText = '';
    expression = "";
    lastInput = 'number';
    memory = null;
}

function calculate() {
    try {
        const result = _compute();
        historyDisplay.innerText += ` = ${result}`;
        mainDisplay.value = result;
        memory = result;
        lastInput = ''
    } catch (error) {
        if (error.message === "Division by zero") {
            mainDisplay.value = "Infinity!";
        } else {
            mainDisplay.value = "Error";
        }
    } finally {
        isCalculated = true;
        lastInput = 'number';
    }
}

function backspace() {
    if (expression.length > 0) {
        const lastChar = expression[expression.length - 1];

        if (!isNaN(lastChar) || lastChar === '.') { 
            expression = expression.slice(0, -1);
            mainDisplay.value = mainDisplay.value.slice(0, -1);
            historyDisplay.innerText = historyDisplay.innerText.slice(0, -1);
            if (mainDisplay.value === '') {
                mainDisplay.value = '0';
            }
            lastInput = 'number'; 
        }
        else if (['+', '-', '*', '/', '^2', 'sqrt', 'cos'].includes(lastChar)) {
            return;
        }
    }
}

function _compute() {
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
        const right = !_numbers.isEmpty() ? _numbers.pop() : console.error("right is null...");
        let left = 1;
        if (operator === '+' || operator === '-') {
            left = 0;
        }
        if (!_numbers.isEmpty()) {
            left = _numbers.pop();
        }
        _numbers.push(_applyOperator(left, right, operator));
    }

    return parseFloat(_numbers.peek().toFixed(4));
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
            if (right === 0) throw new Error("infinity"); return left / right;
        case '^2': 
            return Math.pow(left, 2);
        case 'sqrt': 
            return Math.sqrt(left);
        case 'cos': 
            return Math.cos(left);
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
