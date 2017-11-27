#Find the optimal path for the lift#
In this building, the lift can go to any apartment.
Find the optimal path for the lift, taking into account that
the time needed to pass through an apartment varies.

Apartments and floors are numbered from the left bottom corner
of the building, starting with 0.

##Input:##
A matrix T with N*M elements specifying the time it takes for
the lift to pass through an apartment. T[i,j] equals 0 means that there
is no way through that apartment [i,j].

##Output:##
Link to a Codepen project with 
- a building HTML layout
- input fields for floor/apartment 
- a GO! button to start lift movement

Lift movement should be animated proportionally to the time needed
to pass through an apartment. 

##Constraints:##
0 < N, M <= 100
0 <= T[i, j] <= 5000

##Example:##
const A = [
  [100, 210, 200],
  [300, 0,   40],
  [91,  50,  20]
]
Current lift position: 0, 0 (value 91)
Input: Move lift to floor 2 flat 1 (value 210)
Expected lift movement: 
[[0, 1], [0, 2], [1, 2], [2, 2], [2, 1]], total time 520 (=50+20+40+200+210)

##Solution evaluation criteria:##
- Code quality
- Visual appearance
- Implementation conciseness and simplicity
