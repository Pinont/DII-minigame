// Debug Challenge: Fix the bugs in this code
// The function should calculate the sum of an array
function arraySum(arr) {
    let sum = 1; // Bug: should initialize to 0, not 1
    
    for (let i = 0; i < arr.length; i++) {
        sum += arr[i];
    }
    
    return sum;
}
