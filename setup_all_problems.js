const mainProblems = [
  {
    title: "Candies",
    description: "There are N kids sitting on the floor in the row. We give each kid a number from 0 to N−1 from left to right. The kid that was given number i holds Ci candies. How many candies have all the kids between positions A and B (inclusively)?",
    input: "The first line contains an integer N (1≤N≤1000000) – the number of kids.\nThe second line contains N integers C0,C1,…,CN−1 (1≤Ci≤1000) – i-th of them means that the kid with the number i holds Ci candies.\nThe third and the last line contains two integers A and B (0≤A≤B<N) – the borders of the interval in our query.",
    output: "Output a single number – the sum of candies being hold from children between positions A and B (inclusively), i.e. CA+CA+1+…+CB.",
    examples: [
      {
        input: "5\n4 5 9 10 2\n1 3",
        output: "24"
      },
      {
        input: "2\n2 3\n1 1",
        output: "3"
      },
      {
        input: "7\n1 2 3 3 3 1 3\n0 6",
        output: "16"
      }
    ],
    testCases: [
      // Example cases
      {
        input: "5\n4 5 9 10 2\n1 3",
        output: "24"
      },
      {
        input: "2\n2 3\n1 1",
        output: "3"
      },
      {
        input: "7\n1 2 3 3 3 1 3\n0 6",
        output: "16"
      },
      // Edge cases
      {
        input: "1\n5\n0 0",
        output: "5"
      },
      {
        input: "10\n1 2 3 4 5 6 7 8 9 10\n0 9",
        output: "55"
      },
      // Large numbers
      {
        input: "6\n1000 1000 1000 1000 1000 1000\n0 5",
        output: "6000"
      },
      // Single element range
      {
        input: "5\n1 2 3 4 5\n2 2",
        output: "3"
      },
      // Range at start
      {
        input: "8\n5 4 3 2 1 6 7 8\n0 2",
        output: "12"
      },
      // Range at end
      {
        input: "8\n1 2 3 4 5 6 7 8\n5 7",
        output: "21"
      },
      // Repeated values
      {
        input: "10\n5 5 5 5 5 5 5 5 5 5\n3 7",
        output: "25"
      }
    ],
    templates: {
      python: `# Read N
n = int(input())
# Read array of candies
candies = list(map(int, input().split()))
# Read A and B
a, b = map(int, input().split())
# Your code here
`,
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] candies = new int[n];
        for(int i = 0; i < n; i++) {
            candies[i] = sc.nextInt();
        }
        int a = sc.nextInt();
        int b = sc.nextInt();
        // Your code here
    }
}`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int candies[n];
    for(int i = 0; i < n; i++) {
        cin >> candies[i];
    }
    int a, b;
    cin >> a >> b;
    // Your code here
    return 0;
}`,
      js: `// Read input
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let lineCount = 0;
let n, candies, a, b;

rl.on('line', (line) => {
    if(lineCount === 0) {
        n = parseInt(line);
    } else if(lineCount === 1) {
        candies = line.split(' ').map(Number);
    } else if(lineCount === 2) {
        [a, b] = line.split(' ').map(Number);
        // Your code here
    }
    lineCount++;
});`
    }
  },
  {
    title: "Maximum Odd Sum",
    description: "Given an array of N integers, find the maximum possible odd sum by selecting some elements. If no odd sum is possible, output -1.",
    input: "First line contains N (number of integers)\nSecond line contains N space-separated integers",
    output: "A single integer representing the maximum possible odd sum, or -1 if impossible",
    examples: [
      {
        input: "5\n1 2 3 4 5",
        output: "15"
      }
    ],
    testCases: [
      // Basic case with all positive numbers
      {
        input: "5\n1 2 3 4 5",
        output: "15"
      },
      // Case with negative numbers
      {
        input: "6\n-3 -2 1 4 -5 6",
        output: "7"
      },
      // Case where only selecting some elements gives max odd sum
      {
        input: "4\n2 4 6 1",
        output: "13"
      },
      // Case where no odd sum is possible
      {
        input: "3\n2 4 6",
        output: "-1"
      },
      // Case with large numbers and mix of positive/negative
      {
        input: "5\n1000 -999 2000 -1999 3000",
        output: "4001"
      }
    ]
  },
  {
    title: "Longest Distinct Subarray",
    description: "Find the length of the longest subarray where all elements are distinct (no duplicates).",
    input: "First line contains n (length of array)\nSecond line contains n space-separated integers",
    output: "A single integer — the length of the longest subarray with distinct elements",
    examples: [
      {
        input: "6\n1 2 3 1 2 3",
        output: "3"
      },
      {
        input: "10\n1 5 3 5 2 3 4 1 5 6",
        output: "5"
      }
    ],
    testCases: [
      // Example cases
      {
        input: "6\n1 2 3 1 2 3",
        output: "3"
      },
      // Longer sequence
      {
        input: "10\n1 5 3 5 2 3 4 1 5 6",
        output: "5"
      },
      // All same numbers
      {
        input: "8\n1 1 1 1 1 1 1 1",
        output: "1"
      },
      // Already distinct
      {
        input: "5\n1 2 3 4 5",
        output: "5"
      },
      // Complex case with multiple possible subarrays
      {
        input: "15\n1 2 3 4 1 2 5 6 7 8 1 2 3 4 5",
        output: "8"
      }
    ]
  }
];
