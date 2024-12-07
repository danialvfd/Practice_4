const mainDisplay = document.getElementById("display");
const historyDisplay = document.getElementById("historyContent");
var isFinalResultCalculated = false;
var lastInput = '';
var expression = "";
var memory = null;

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
    if (isFinalResultCalculated) {
        _resetForNewInput(input);
    } else {
        _handleNumberInput(input);
    }
    lastInput = 'number';
}

function _resetForNewInput(input) {
    isFinalResultCalculated = false;
    mainDisplay.value = input;
    expression = input;
    historyDisplay.innerText = input;
}

function _handleNumberInput(input) {
    if (lastInput === 'operator') {
        mainDisplay.value = input;
        expression += input;
        historyDisplay.innerText += input;
    } else if (input === '.' && mainDisplay.value.includes('.')) {
        return;
    } else if (mainDisplay.value === '0' || mainDisplay.value === "Error!" || mainDisplay.value === "Infinity") {
        mainDisplay.value = input;
        expression = input;
        historyDisplay.innerText += input;
    } else if (mainDisplay.value.replace('.', '').length < 11) {
        mainDisplay.value += input;
        expression += input;
        historyDisplay.innerText += input;
    }
}

function appendOperator(input) {
    const operators = ['+', '-', '*', '/', '^2', 'sqrt', 'cos'];

    if (input === 'pm') {
        _appendPnSign();
        return;
    }

    if (input === 'sqrt') {
        _appendSqrtOperator(input);
        return;
    }

    if (operators.includes(input)) {
        _appendStandardOperator(input);
        _autoCalculate();
    }
}

function _appendPnSign() {
    if (lastInput === 'number' && mainDisplay.value) {
        const currentValue = parseFloat(mainDisplay.value) * -1;
        mainDisplay.value = currentValue;
        expression = currentValue.toString();
        historyDisplay.innerText = expression;
    }
}

function _appendSqrtOperator(input) {
    if (lastInput === 'number') {
        expression += input;
        historyDisplay.innerText += ` ${input} `;
    }
}

function _appendStandardOperator(input) {
    if ((lastInput === '' || isFinalResultCalculated) && memory !== null) {
        expression = `${memory}${input}`;
        historyDisplay.innerText = `${memory} ${input} `;
        isFinalResultCalculated = false;
    } else if (lastInput === 'number') {
        expression += input;
        historyDisplay.innerText += ` ${input} `;
    } else if (lastInput === 'operator') {
        expression = expression.slice(0, -1) + input;
        historyDisplay.innerText = historyDisplay.innerText.slice(0, -2) + ` ${input} `;
    }
    lastInput = 'operator';
}

function _autoCalculate() {
    const operators = ['+', '-', '*', '/', '^2', 'sqrt', 'cos'];
    const regex = new RegExp(operators.map(op => `\\${op}`).join('|'), 'g');
    const matches = expression.match(regex);
    if (matches && matches.length >= 2) {
        calculate(true);
    }
}


function calculate(isFromOperator) {
    try {
        const result = _compute();
        mainDisplay.value = result;
        memory = result;
        if (!isFromOperator){
            _finalizeHistory(result);
        } 
    } catch (error) {
        _handleCalculationError(error);
    } finally {
        _updateCalculationState(isFromOperator);
    }
}

function _finalizeHistory(result) {
    _removeOperatorAftercalculation();
    historyDisplay.innerText += ` = ${result}`;
}

function _removeOperatorAftercalculation() {
    const lastChar = historyDisplay.innerText.trim().slice(-1);
    const operators = ['+', '-', '*', '/'];
    if (operators.includes(lastChar)) {
        historyDisplay.innerText = historyDisplay.innerText.trim().slice(0, -1);
    }
}

function _handleCalculationError(error) {
    if (error.message === "Division by zero") {
        mainDisplay.value = "Infinity!";
    } else {
        mainDisplay.value = "Error";
        console.error(error.message);
    }
}

function _updateCalculationState(isFromOperator) {
    isFinalResultCalculated = !isFromOperator;
    lastInput = isFromOperator ? 'operator' : 'number';
}

function _compute(isFromOperatore) {
    if (!isFromOperatore) {
        expression = expression.replace(/\s+/g, '');
    }

    const _numbers = new Stack();
    const _operators = new Stack();
    const precedence = { '+': 1, '-': 1, '*': 2, '/': 2, '^2': 3, 'sqrt': 3, 'cos': 3 };

    const _tokens = expression.match(/\d+(\.\d+)?|sqrt| |cos|\^2|[+\-*/()^]/g);
    for (let i = 0; i < _tokens.length; i++) {
        let token = _tokens[i];

        if (!isNaN(token)) {
            _numbers.push(parseFloat(token));
        } else if (token === '-' && (i === 0 || isNaN(_tokens[i - 1]))) {
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
        let right = !_numbers.isEmpty() ? _numbers.pop() : console.error("right is null...");
        let left = 1;
        if (operator === '+') {
            left = 0;
        }
        if (!_numbers.isEmpty()) {
            left = _numbers.pop();
        } else if (operator === '-') {
            left = right;
            right = 0;
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
            return Math.pow(right, 2);
        case 'sqrt':
            return Math.sqrt(right);
        case 'cos':
            return Math.cos(right * Math.PI / 180);
        default: throw new Error("Invalid operator");
    }
}

function clearDisplay() {
    mainDisplay.value = '0';
    historyDisplay.innerText = '';
    expression = "";
    lastInput = 'number';
    memory = null;
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

document.addEventListener('keydown', function (event) {
    event.preventDefault();
    if (!isNaN(event.key)) {
        appendNumber(event.key);
    } else if (['+', '-', '*', '/'].includes(event.key)) {
        appendOperator(event.key);
    } else if (event.key === 'Enter') {
        calculate(false);
    } else if (event.key === '.') {
        appendNumber(event.key);
    } else if (event.key === 'Backspace') {
        appendOperator('Backspace');
    }
});
