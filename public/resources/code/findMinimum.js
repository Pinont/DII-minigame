// Debug Challenge: Fix the bugs in this code
// The function should find the minimum value in an array
function findMinimum(arr) {
    if (arr.length === 0) {
        return Number.MAX_VALUE;
    }
    
    let min = arr[0];
    
    for (let i = 1; i <= arr.length; i++) {
        if (arr[i] < min) {
            min = arr[i];
        }
    }
    
    return min;
}
