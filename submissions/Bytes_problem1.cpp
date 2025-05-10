#include <bits/stdc++.h>
using namespace std;

int main () {
    int n;
    cin >> n;
    vector<int > arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];

    int a, b;
    int ans = 0;
    cin >> a >> b;
    int i = a;

       while (i <= b) {
          ans += arr[i];
          i++;
       }

   cout << ans;

}