#include <bits/stdc++.h>
int main() {
    // Read the number of kids
    int N;
    std::cin >> N;
    
    // Read the number of candies each kid holds
    std::vector<int> candies(N);
    for (int i = 0; i < N; i++) {
        std::cin >> candies[i];
    }
    
    // Read the positions A and B
    int A, B;
    std::cin >> A >> B;
    
    // Calculate the sum of candies from position A to B (inclusive)
    int sum = 0;
    for (int i = A; i <= B; i++) {
        sum += candies[i];
    }
    
    // Output the result
    std::cout << sum << std::endl;
    
    return 0;
}