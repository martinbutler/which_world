#In Which Bubbles

Here's the back-end challenge, which you have 3 days to complete (due Friday):

I've attached two JSON datasets. The "sample.json" is a series of simplified "world" objects (databubbles). The radius value in each world object is in meters, and it represents the radial size of the world itself, using the "loc" point (formatted as longitude/latitude) as the center. Some worlds have a "timestart" and "timeend" which is the time in which the world is active. Otherwise, the world is always active.

The "user.json" is a mock user's current information (their lon/lat location "userloc", and their current time "usertime").

The task is to determine which active worlds the user is inside (within a world's radius and within the world's time period) based on the user's current location and time. Then, develop a system of ranking the worlds the user is in based on relevance between the "tags" string array associated with each world and the user "tags" string array.

The task can be done in Node.js, Python, or another language (except Ruby) and with libraries for geo, etc.

____________________________________________________________________________________
## Install:

npm install node-geo-distance


requires sample.json and user.json to reside in the same directory as inWhichBubbles.js

## Run:

node inWhichBubbles.js

## Output:

File: myActiveRankWorlds.json
Description: File will contain the active worlds in descending ranked order.

File: worldRankList.log
Description: File will contain a list in descending order of world's weight, name, and id
