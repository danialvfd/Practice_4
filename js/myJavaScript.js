const display = document.getElementById("display");

function main() {
    _appendNumber();
    _appendOperator();
    _clearDisplay();
}

function _appendNumber (input){
    display.value += input;
}

function _appendOperator (input){
    display.value += input;
}

function _clearDisplay (){
    display.value = "";
}

function _calculate(){
    try {
        display.value = eval (display.value);
    }
    catch {
        display.value = "Error!"
    }
}

main();