var geo = require('node-geo-distance')
var fs = require('fs')
var user = JSON.parse(fs.readFileSync('user.json', 'utf8'))
var worlds = JSON.parse(fs.readFileSync('sample.json', 'utf8'))
var outputFile = 'myActiveRankWorlds.json'
var outputLog = 'worldRankList.log'

inWhichBubbles = function(user, worlds) {
  var activeWorlds = [],
      activeWorldsLargestTagsLength = 0;
  // Loop through the world's
  // First check if the world is open based on user's time
  // If so, build the activeWorlds array if the user is within
  //   the radius of the bubble
  worlds.forEach(function (world) {
    if (worldIsOpen(user.usertime, world.time)) {
      if(userInWorldsRadius(user.userloc.coordinates, world.loc.coordinates, world.radius)) {
        activeWorlds.push(world)
        if (world.tags.length > activeWorldsLargestTagsLength) {
          activeWorldsLargestTagsLength = world.tags.length
        }
      }
    }
  })
  return rankedByWeightingOfTags(user.tags, activeWorlds, activeWorldsLargestTagsLength)
}

worldIsOpen = function(userTime, worldTime) {
  if(!worldTime.timestart){
    return true
  }
  if (userTime >= worldTime.timestart && userTime <= worldTime.timeend) {
    return true
  }
  return false
}

userInWorldsRadius = function(userCoor, worldCoor, radius) {
  // using the node-geo-distance library and it's Vincenty's formulae
  //   http://en.wikipedia.org/wiki/Vincenty%27s_formulae
  var distance = geo.vincentySync({
                    latitude: userCoor[1],
                    longitude: userCoor[0]
                  }, {
                    latitude: worldCoor[1],
                    longitude: worldCoor[0]
                  })
  if(radius >= distance) {
    return true
  } else {
    return false
  }
}

rankedByWeightingOfTags = function(userTags, activeWorlds, worldsWeightNormalized) {
  // Weighting calculation is based on order of tags in both the user's
  //   and world's tag array.
  // The USER tags value:
  //    tag value = user tags array length - the tag's index
  //
  // The WORLD tags: Due to the various lengths in each world, we
  //   will normalize the values based on the largest length of all the
  //   worlds tags arrays to prevent inflated values by worlds with
  //   larger number of tags, therefore:
  // The WORLD tags value:
  //    tag value = length of largest worlds tags array - the tag's index
  //
  // The value of each tag on a match would be multiplied together and
  //   added to the total weight for each world.
  var userTagsTotal = userTags.length,
      worldWeights = [] // capture weighted score and the associated world

  activeWorlds.forEach(function (world) {
    var weightedScore = 0,
        worldTagsTotal = world.tags.length

    for (var i = 0; i < worldTagsTotal; i++) {
      var tagFound = userTags.indexOf(world.tags[i])
      if (tagFound >= 0) {
        var tagWeight = (userTagsTotal - tagFound) * (worldsWeightNormalized - i)
        weightedScore += tagWeight
      }
    }
    worldWeights.push([weightedScore, world])
  })

  worldWeights.sort(function(a, b){return b[0]-a[0]})

  // init the object to be returned
  var ranked = {}
  ranked.data = []

  var theRankListLog = 'Active Worlds by Weight\n'
                      + '----------------------\n'
                      + 'Weight\t\tWorld\t\tID\n'


  // strip out the world's data and push on to the return object
  // and produce the ranked list log
  worldWeights.forEach(function(weight) {
    ranked.data.push(weight[1])
    theRankListLog += '\n' + weight[0]
                    + '\t\t' + weight[1].name
                    + '\t\t' + weight[1]._id
  })
  fs.writeFile(outputLog, theRankListLog)
  return ranked
}

fs.writeFile(outputFile, JSON.stringify(inWhichBubbles(user.user, worlds.data)))
