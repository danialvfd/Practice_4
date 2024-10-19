const display = document.getElementById("display");
const history = document.getElementById("historyContent");

function main() {
    _appendNumber();
    _appendOperator();
    _clearDisplay();
}

function _appendNumber(input) {
    display.value += input;
}

function _appendOperator(input) {
    if (input === 'sqrt') {
        display.value = Math.sqrt(eval(display.value));
    } else if (input === 'cos') {
        const angle = eval(display.value);
        display.value = Math.cos(angle);
    } else if (input === 'pm') {
        display.value = -eval(display.value);
    } else if (input === 'Backspace') {
        display.value = display.value.slice(0, -1);
    } else {
        display.value += input;
    }
}

function _clearDisplay() {
    display.value = "";
}

function _calculate() {
    try {
        const result = eval(display.value);
        history.innerHTML = `${display.value} = ${result}`;
        display.value = result;
    }
    catch {
        display.value = "Error!"
    }
}

main();