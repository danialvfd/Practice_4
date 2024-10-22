const mainDisplay = document.getElementById("display");
const history = document.getElementById("historyContent");
var isCalculated = false;   // مشکل پاک نشدن const 

function _appendNumber(input) {
    _setMainDisplayValue(input);
    _setDefualtDisplayValue();
}

function _setMainDisplayValue(input) {
    if (isCalculated) {
        _clearDisplay();
        isCalculated = false;
        mainDisplay.value = input;
    } else {
        mainDisplay.value += input;
    }
}

function _setDefualtDisplayValue() {
    if (mainDisplay.value === "0") {
        mainDisplay.value = "";
    }
}

function _appendOperator(input) {
    if (input === 'sqrt') {
        mainDisplay.value = Math.sqrt(eval(mainDisplay.value));
    } else if (input === 'cos') {
        const angle = eval(mainDisplay.value);
        mainDisplay.value = Math.cos(angle);
    } else if (input === 'pm') {
        mainDisplay.value = -eval(mainDisplay.value);
    } else if (input === 'Backspace') {
        mainDisplay.value = mainDisplay.value.slice(0, -1);
    } else {
        mainDisplay.value += input;
    }
}

function _clearDisplay() {
    mainDisplay.value = "0";
}

function _calculate() {
    try {
        let result = eval(mainDisplay.value);    // const نباشد
        history.innerHTML = `${mainDisplay.value} = ${result}`;
        mainDisplay.value = result;
    }
    catch (error) {
        mainDisplay.value = "Error!"
    }
    finally {
        isCalculated = true;
    }
}

document.addEventListener('keydown', function (event) {
    if (!isNaN(event.key)) {
        _appendNumber(event.key);
    } else if (event.key === '+') {
        _appendOperator('+');
    } else if (event.key === '-') {
        _appendOperator('-');
    } else if (event.key === '*') {
        _appendOperator('*');
    } else if (event.key === '/') {
        _appendOperator('/');
    } else if (event.key === 'Enter') {
        _calculate();
    } else if (event.key === 'Backspace') {
        _appendOperator('Backspace');
    }
});

