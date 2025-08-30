// Debug Challenge: Fix the bugs in this code
// The function should calculate the factorial of a number
function calculateFactorial(n) {
    if (n < 0) {
        return -1; // Invalid input
    }
    
    if (n === 0) {
        return 0;
    }
    
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    
    return result;
}
