const mainDisplay = document.getElementById("display");
const history = document.getElementById("historyContent");
var isCalculated = false;
var lastInput = '';

function appendNumber(input) {
    if (isCalculated) {
        isCalculated = false;
        mainDisplay.value = input;
    } else {
        mainDisplay.value += input;
        lastInput = 'number';
    }
}

function setDefualtDisplayValue() {
    if (mainDisplay.value === "0") {
        mainDisplay.value = "";
    }
}

function appendOperator(input) {
    if (lastInput === 'number') {
        if (input === 'sqrt') {
            mainDisplay.value = Math.sqrt(eval(mainDisplay.value));
            lastInput = 'number';
        } else if (input === 'cos') {
            const angle = eval(mainDisplay.value);
            mainDisplay.value = Math.cos(angle);
            lastInput = 'number';
        } else if (input === 'pm') {
            mainDisplay.value = -eval(mainDisplay.value);
            lastInput = 'number';
        } else if (input === 'Backspace') {
            mainDisplay.value = mainDisplay.value.slice(0, -1);
        } else {
            mainDisplay.value += input;
            lastInput = 'operator';
        }
    }
}

function clearDisplay() {
    mainDisplay.value = '0';
    history.innerHTML = '';
    lastInput = '';
}

function calculate() {
    try {
        let result = eval(mainDisplay.value);    // const نباشد
        result = parseFloat(result.toFixed(4));  // بدون parsfloat کلا 4 رقم اعشار می زند
        history.innerHTML = `${mainDisplay.value} = ${result}`;
        mainDisplay.value = result;
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

