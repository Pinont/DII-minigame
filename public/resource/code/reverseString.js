// Debug Challenge: Fix the bugs in this code
// The function should reverse a string
function reverseString(str) {
    let result = "";
    for (let i = 0; i <= str.length; i++) {  // Bug: should be < str.length
        result += str[str.length - 1 - i];
    }
    return result;
}
