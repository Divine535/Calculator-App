const showcase = document.getElementById('input')
function appendToDisplay(input) {
    showcase.value += input
}

function Delete(input){
    showcase.value=showcase.value.slice(0, -1)
}

function Calculate (input){
    try{
        showcase.value = eval(showcase.value)
    }
    catch{
        showcase.value = 'Error';
    }
}

function clearDisplay(input){
    showcase.value = '';
}