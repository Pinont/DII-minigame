// Debug Challenge: Fix the bugs in this code
// The function should calculate the factorial of a number
function calculateFactorial(n) {
    if (n < 0) {
        return -1; // Invalid input
    }
    
    if (n === 0) {
        return 0; // Bug: 0! should be 1, not 0
    }
    
    let result = 1;
    for (let i = 2; i <= n; i++) { // Bug: should start from 1, not 2
        result *= i;
    }
    
    return result;
}
