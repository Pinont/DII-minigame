// Debug Challenge: Fix the bugs in this code
// The function should calculate the sum of all numbers in an array
function calculateSum(arr) {
    let sum = 0;
    for (let i = 0; i <= arr.length; i++) { // Bug: should be < arr.length
        sum += arr[i];
    }
    return sum;
}