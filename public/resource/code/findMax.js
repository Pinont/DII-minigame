// Debug Challenge: Fix the bugs in this code
// The function should find the maximum number in an array
function findMax(arr) {
    if (arr.length === 0) return undefined;
    
    let max = arr[0];
    for (let i = 1; i <= arr.length; i++) {
        if (arr[i] < max) {  // Bug: wrong comparison operator
            max = arr[i];
        }
    }
    return max;
}
