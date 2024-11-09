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
            mainDisplay.value += input;
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
        const lastInputOperator = mainDisplay.value[mainDisplay.value.length - 1];
        if (operators.includes(lastInputOperator)) {
            mainDisplay.value = mainDisplay.value.slice(0, -1) + input;
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
        const result = compute(mainDisplay.value);
        historyDisplay.innerHTML = ''; 
        historyDisplay.innerHTML += `${mainDisplay.value} = ${result}`; 
        mainDisplay.value = ''; 
    } catch (error) {
        mainDisplay.value = "Error!";
    } finally {
        isCalculated = true;
        lastInput = 'number';
    }
}

// تابع برای محاسبه عبارات ریاضی با استفاده از Stack
function compute(expression) {
    expression = expression.replace(/\s+/g, '');

    const numbers = new Stack();
    const operators = new Stack();

    const precedence = { '+': 1, '-': 1, '*': 2, '/': 2};  // اولویت بندی عملگرها

    const tokens = expression.match(/(\d+|[+\-*/])/g); // \d+  عدد یک یا چند رقمی

    for (let token of tokens) {
        if (!isNaN(token)) {
            numbers.push(parseFloat(token));
        } else { // اگر توکن عملگر باشد
            while (!operators.isEmpty() && precedence[operators.peek()] >= precedence[token]) {
                const operator = operators.pop();
                const right = numbers.pop();
                const left = numbers.pop();
                numbers.push(applyOperator(left, right, operator));
            }
            operators.push(token);
        }
    }

    while (!operators.isEmpty()) { // پردازش باقی‌مانده عملگرها
        const operator = operators.pop();
        const right = numbers.pop();
        const left = numbers.pop();
        numbers.push(applyOperator(left, right, operator));
    }

    return parseFloat(numbers.peek().toFixed(4)); // محدود کردن به ۴ رقم اعشار
}

function applyOperator(left, right, operator) {
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
    }
}

document.addEventListener('keydown', function (event) {
    if (!isNaN(event.key)) {
        appendNumber(event.key);
    } else if (['+', '-', '*', '/'].includes(event.key)) {
        appendOperator(event.key);
    } else if (event.key === 'Enter') {
        calculate();
    } else if (event.key === 'Backspace') {
        appendOperator('Backspace');
    }
});