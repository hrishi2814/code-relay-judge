### **Main Problems (Slightly Harder but Still Easy)**

1. **"Find the Second Largest"**  
   Given an array of `N` integers, find the second largest number. If no second largest exists, return `-1`.  
   - **Input:**  
     ```
     6
     10 20 4 45 99 99
     ```
   - **Output:** `45`  
   *(Handles duplicate max values now.)*

2. **"Sort the Words"**  
   Given a sentence with words separated by spaces, sort the words in alphabetical order and return the sorted sentence.  
   - **Input:** `"the quick brown fox"`  
   - **Output:** `"brown fox quick the"`  

3. **"Count Unique Numbers"**  
   Given an array of `N` integers, return how many distinct numbers are present.  
   - **Input:**  
     ```
     7
     1 2 3 3 2 4 5
     ```
   - **Output:** `5`  
   *(Includes a few more numbers for better variation.)*

4. **"Sum of Every Second Element"**  
   Given an array of `N` integers, return the sum of every second element, starting from index `1`.  
   - **Input:**  
     ```
     6
     2 7 1 8 2 6
     ```
   - **Output:** `7 + 8 + 6 = 21`  
   *(More numbers, starts at index 1 instead of 0.)*

5. **"Check for Anagram (Ignore Case & Spaces)"**  
   Given two strings, determine if they are anagrams, ignoring spaces and capitalization.  
   - **Input:**  
     ```
     "Listen"
     "Silent "
     ```
   - **Output:** `true`  
   *(Added case insensitivity and space handling.)*

### **Main Problems (Balanced Difficulty + Complexity Constraints)**  

1. **"Find the Second Largest (O(N))"**  
   Given an array of `N` integers, find the second largest number in **O(N)** time. If no second largest exists, return `-1`.  
   - **Input:**  
     ```
     6
     10 20 4 45 99 99
     ```
   - **Output:** `45`  
   *(Now explicitly requires a single-pass O(N) solution instead of sorting.)*  

2. **"Sort the Words (O(N log N))"**  
   Given a sentence with words separated by spaces, sort the words in alphabetical order. Solve in **O(N log N)**.  
   - **Input:** `"the quick brown fox"`  
   - **Output:** `"brown fox quick the"`  

3. **"Count Unique Numbers (O(N))"**  
   Given an array of `N` integers, return how many distinct numbers are present. Solve in **O(N)** time.  
   - **Input:**  
     ```
     7
     1 2 3 3 2 4 5
     ```
   - **Output:** `5`  
   *(Hint: Use a hash set for O(N) solution.)*  

4. **"Prefix Sum Query (O(N) Preprocessing, O(1) Query)"**  
   Given an array of `N` integers, preprocess it in **O(N)** time so that sum queries for a given range `[L, R]` can be answered in **O(1)** time.  
   - **Input:**  
     ```
     6
     2 7 1 8 2 6
     1 4
     ```
   - **Output:** `18`  
   *(Ensures contestants use prefix sum technique instead of naive O(N) queries.)*  

5. **"Check for Anagram (Ignore Case & Spaces, O(N))"**  
   Given two strings, determine if they are anagrams in **O(N)** time, ignoring spaces and capitalization.  
   - **Input:**  
     ```
     "Listen"
     "Silent "
     ```
   - **Output:** `true`  
   *(Enforces frequency counting instead of sorting.)*  

---

### **Cookie Problems (Super Easy, No Complexity Constraints)**  
1. **"Reverse the Digits"** – Reverse an integer.  
2. **"Sum of Digits"** – Find sum of digits in a number.  
3. **"First Repeating Character"** – Return the first repeating character in a string.  
4. **"Find the Missing Number"** – Find a missing number in an array of `1 to N`.  
5. **"Count the Vowels"** – Count vowels in a given string.  

Got it! Here’s a refined set of **Main Problems** that emphasize **logical thinking** while keeping **arrays, sorting, and hashmaps** as the hardest concepts.

---

### **Main Problems (Logic-Based, No Advanced DSA Required)**  

1. **"Rearrange Alternating"**  
   Given an array of `N` positive and negative integers, rearrange them such that positive and negative numbers appear alternately. If there are extra elements of one type, place them at the end.  
   - **Input:**  
     ```
     8
     -1 2 -3 4 -5 6 7 -8
     ```
   - **Output:**  
     ```
     2 -1 4 -3 6 -5 7 -8
     ```
   *(Hint: Maintain two lists or use swapping in-place.)*  

2. **"Sort by Frequency"**  
   Given an array of `N` integers, sort them based on frequency (higher frequency elements come first). If frequencies are equal, maintain the original order.  
   - **Input:**  
     ```
     8
     4 3 1 6 3 4 4 1
     ```
   - **Output:**  
     ```
     4 4 4 3 3 1 1 6
     ```
   *(Hint: Use a hashmap to count occurrences, then sort.)*  

3. **"Find the Odd One Out"**  
   Given an array of `N` numbers where all numbers except one appear an even number of times, find the number that appears an odd number of times.  
   - **Input:**  
     ```
     7
     2 3 5 3 2 5 5
     ```
   - **Output:** `5`  
   *(Hint: Use a hashmap or bitwise XOR.)*  

4. **"Find the Missing and Duplicate Number"**  
   Given an array of `N` integers from `1` to `N`, one number is missing, and one number is duplicated. Find both.  
   - **Input:**  
     ```
     5
     1 2 2 4 5
     ```
   - **Output:**  
     ```
     Duplicate: 2
     Missing: 3
     ```
   *(Hint: Use a hashmap or sum formulas.)*  

5. **"Merge Two Sorted Arrays Without Extra Space"**  
   Given two sorted arrays, merge them in-place (modify the first array to contain the smallest `N` elements).  
   - **Input:**  
     ```
     arr1 = [1, 3, 5, 7]
     arr2 = [2, 4, 6, 8]
     ```
   - **Output:**  
     ```
     arr1 = [1, 2, 3, 4]
     arr2 = [5, 6, 7, 8]
     ```
   *(Hint: Use the gap method instead of extra space.)*  

---

### **Cookie Problems (Very Easy)**  
1. **"Count Digits in a Number"** – Count the number of digits in an integer.  
2. **"Find Maximum in an Array"** – Return the largest number in an array.  
3. **"Swap Two Numbers Without Temp Variable"** – Swap two numbers without using a third variable.  
4. **"Sum of First N Natural Numbers"** – Return the sum of `1` to `N`.  
5. **"Find the Smallest and Second Smallest"** – Find the smallest and second smallest number in an array.  

---

