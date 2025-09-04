public static String reverseString(String str) {
    return new StringBuilder(str).reverse().toString();
}
public static void main(String[] args) {
    System.out.println(reverseString("hello"));
}