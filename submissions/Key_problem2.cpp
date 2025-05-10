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