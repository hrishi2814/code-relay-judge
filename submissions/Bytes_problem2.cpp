/******************************************************************************

Welcome to GDB Online.
GDB online is an online compiler and debugger tool for C, C++, Python, Java, PHP, Ruby, Perl,
C#, OCaml, VB, Swift, Pascal, Fortran, Haskell, Objective-C, Assembly, HTML, CSS, JS, SQLite, Prolog.
Code, Compile, Run and Debug online from anywhere in world.

*******************************************************************************/
#include <iostream>
#include <bits/stdc++.h>
using namespace std;

int main () {
    long long n;
    cin >> n;
    long long sum=0;
    vector<int > nums ;
    long long num ;
    bool isfound = false;
    for (int i = 0; i < n; i++) {
        cin >> num ;
        sum += num ;
        if ( num % 2 != 0 ) {
            isfound = true ;
        }
    }
    sort( nums.begin(),nums.end()) ;
    if (!isfound ) {
        cout << -1 << endl ;
        return 0 ;
    }
    for( int i = 0 ; i < nums.size() ; i++ ) {
        if ( ( sum - nums[i]) % 2 != 0 ) {
            sum -= nums[i] ;
            break ;
        }
    }
    cout << sum << endl ;
    return 0 ;
}
    
//     Problem 2: Maximum Odd Sum

// Given an array of N integers, find the maximum possible odd sum by selecting some elements. If no odd sum is possible, output -1.
// Input

// First line contains N (number of integers)
// Second line contains N space-separated integers
// Output

// A single integer representing the maximum possible odd sum, or -1 if impossible


}