// Debug Challenge: Fix the bugs in this code
// The function should find the minimum value in an array
function findMinimum(arr) {
    if (arr.length === 0) {
        return Number.MAX_VALUE; // Bug: should return null or handle empty array properly
    }
    
    let min = arr[0];
    
    for (let i = 1; i <= arr.length; i++) { // Bug: should be i < arr.length, not <=
        if (arr[i] < min) {
            min = arr[i];
        }
    }
    
    return min;
}
