const mainDisplay = document.getElementById("display");
const historyDisplay = document.getElementById("historyContent");
var isCalculated = false;
var lastInput = '';

function appendNumber(input) {
    if (isCalculated) {
        isCalculated = false;
        mainDisplay.value = input;
    } else {
        if (mainDisplay.value === '0') {
            mainDisplay.value = input; 
        } else {
            mainDisplay.value += input;
        }
        lastInput = 'number';
    }
}

function setDefualtDisplayValue() {
    if (mainDisplay.value === "0") {
        mainDisplay.value = "";
    }
}

function appendOperator(input) {
    const operators = ['+', '-', '*', '/', '^2'];
    if (lastInput === 'number') {
        if (input === 'sqrt') {
            mainDisplay.value = Math.sqrt(eval(mainDisplay.value));
            lastInput = 'number';
        } else if (input === 'cos') {
            const angle = eval(mainDisplay.value);
            mainDisplay.value = Math.cos(angle * (Math.PI / 180));
            lastInput = 'number';
        } else if (input === 'pm') {
            mainDisplay.value = -eval(mainDisplay.value);
            lastInput = 'number';
        } else if (input === '^2') {
            mainDisplay.value = Math.pow(eval(mainDisplay.value), 2);
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
        let result = eval(mainDisplay.value);    // const نباشد
        result = parseFloat(result.toFixed(4));  // بدون parsfloat کلا 4 رقم اعشار می زند
        historyDisplay.innerHTML = `${mainDisplay.value} = ${result}`;
        mainDisplay.value = '';
    }
    catch (error) {
        mainDisplay.value = "Error!"
    }
    finally {
        isCalculated = true;
        lastInput = 'number';
    }
}

document.addEventListener('keydown', function (event) {
    if (!isNaN(event.key)) {
        appendNumber(event.key);
    } else if (event.key === '+') {
        appendOperator('+');
    } else if (event.key === '-') {
        appendOperator('-');
    } else if (event.key === '*') {
        appendOperator('*');
    } else if (event.key === '/') {
        appendOperator('/');
    } else if (event.key === 'Enter') {
        calculate();
    } else if (event.key === 'Backspace') {
        appendOperator('Backspace');
    }
});


