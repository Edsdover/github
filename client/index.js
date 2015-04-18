'use strict';

$(document).ready(init);

function init() {
  // generateTiles();
  populateProfiles();
}

var currTime = moment.utc();
var profiles = [];


function populateProfiles(){
  $.getJSON('https://api.github.com/orgs/coding-house-apr2015/members', function(loginResponse){
    loginResponse.forEach(function(profile){
      profiles.push({'un': profile.login});
    });
    generateTiles();
  });
}

function generateTiles() {
  profiles.forEach(function(profile, index, array){
    var profileUrl = 'https://api.github.com/users/' + profile.un;
    var eventsUrl = profileUrl + '/events';
    $.getJSON(profileUrl, function(profileresponse){
      $.getJSON(eventsUrl, function(eventsresponse){
        var commitCount = countCommits(eventsresponse);
        var commentCount = countComments(eventsresponse);
        array[index].comments = commentCount;
        array[index].commits = commitCount;
        var $newRow = $("#template").clone();
        $newRow.find(".image").attr("src", profileresponse.avatar_url);
        $newRow.find(".name").text(profileresponse.name);
        $newRow.find(".commits").text(commitCount);
        $newRow.find(".comments").text(commentCount);
        $newRow.find(".card.row").css('background-color',colorTiles(commitCount));
        $newRow.removeClass("hidden");
        $('#cards-container').append($newRow);
      });
    });
  });
}

function colorTiles(dc){
  return dc > 4 ? 'green' : 'red';
}

function countCommits(eventsresponse){
  var commitCount = 0;
  eventsresponse.forEach(function(event){
    if(event.payload.comment !== '' && moment.utc(event.created_at).diff(currTime, 'hours') > -24){
     commitCount++;
    }
  });
  return commitCount;
}

function countComments(eventsresponse){
  var commentCount = 0;
  eventsresponse.forEach(function(event){
    if(event.type.match(/(comment)/gi)){
      commentCount++;
    }
  });
  return commentCount;
}
