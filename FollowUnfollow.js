var database = firebase.database();
var timeOut;
const errorMSG_1 = 'Kicked Out';

var app = angular.module('myApp', ['ngSanitize']);
app.controller('personCtrl', function($scope) {
	
	if (getQueryVariable('User') != false) {
	}
	else if (getStorageUID() === null || FollowInit_Part1($scope) == errorMSG_1) {
		window.location.replace('MainWindow.html?Error=' + errorMSG_1.replace(/ /g, '+'));
	}
	
	INIT($scope);
	
	FollowInit_Part2($scope);
	$scope.Follow = function(other) {

		var index = $scope.self.following.includes(' , ' + other.uid);
		
		if (index) {
			while ($scope.self.following.includes(' , ' + other.uid)) {
				$scope.self.following = $scope.self.following.replace(' , ' + other.uid, '');
			}
			while (other.followers.includes(' , ' + $scope.self.uid)) {
				other.followers = other.followers.replace(' , ' + $scope.self.uid, '');
			}
		}
		else {
			$scope.self.following += ' , ' + other.uid;
			other.followers += ' , ' + $scope.self.uid;
		}
		
		$scope.self.followingNUM = $scope.self.following.split(' , ').length - 1;
		other.followersNUM = other.followers.split(' , ').length - 1;
		
		$scope.users[other.index].isFollowing = !index;
		$scope.users[other.index].followersNUM = other.followersNUM;
		
		var instanceOther = Object.assign({}, other);
		delete instanceOther.isFollowing;
		delete instanceOther.isFollower;
		delete instanceOther.index;
		delete instanceOther.$$hashKey;
		delete instanceOther.DarkerColor;
		delete instanceOther.BorderColor;
	
		var update = {};
		
		update[getStorageUID()] = $scope.self;
		update[instanceOther.uid] = instanceOther;
	
		firebase.database().ref('Users').update(update);
	}
	
	$scope.ShowFollowers = true;
	$scope.Followers_ing_statechanged = function() {
		$scope.ShowFollowers = !$scope.ShowFollowers;
	}
	
	$scope.Exit = function() {
		resetStorageUID();
		$scope.Logout();
	}
	
	$scope.Logout = function($scope) {
	
		var update = {};
		
		getStorageUID();
		window.location.replace('MainWindow.html');
	}
	
	$scope.checkColor = function() {
		if (/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test($scope.selfColor)) {
			$scope.goodChangedColor = true;
		}
		else {
			$scope.goodChangedColor = false;
		}
	}
	
	$scope.UserFinder = function() {
		$scope.usersSearched = [];
		var nickname = $scope.findUser.split('#')[0];
		var uid = $scope.findUser.split('#')[1];
		$scope.users.forEach(user => {
			if (user.nickname.includes(nickname)) {
				if (uid != '' && uid !== undefined) {
					if (user.uid.startsWith(uid)) {
						$scope.usersSearched.push(user);
					}
				}
				else {
					$scope.usersSearched.push(user);
				}
			}
		});
	}
	
	$scope.ConfirmColor = function() {
		var update = {};
		
		$scope.self.colorDisplay = $scope.selfColor;
		update[getStorageUID()] = $scope.self;
		firebase.database().ref('Users').update(update);
	}
	
	$scope.ConfirmNickname = function() {
		$scope.self.nickname = $scope.newNickname;
		var update = {};
		
		update[getStorageUID()] = $scope.self;
	
		firebase.database().ref('Users').update(update);
	}
	
	$scope.timeOut = function() {
		clearTimeout(timeOut);
		timeOut = setTimeout( function() {
			$scope.Logout($scope);
			}, 10*60*1000 /* 10 x 60 x 1000*/);
			              // min  sec  milisec
	}
	
	window.onbeforeunload = function(e) {
		console.log(e);
	}
	
	window.onload = function(e) {
		console.log(e);
	}
	
	$scope.timeOut();

});

app.filter('range2', function() {
  return function(input, total) {
    total = parseInt(total);
    for (var i=0; i<total; i+=2)
      input.push(i);
    return input;
  };
});

app.filter('range', function() {
  return function(input, total) {
    total = parseInt(total);
    for (var i=0; i<total; i++)
      input.push(i);
    return input;
  };
});

function INIT($scope) {
	$scope.self = {};
	$scope.users = [];
	$scope.usersFollowingOnly = [];
	$scope.usersFollowerOnly = [];
	$scope.usersSearched = [];
	$scope.goodChangedColor = true;
}

async function FollowInit_Part1($scope) {

	var selffunc = firebase.database().ref('Users/' + getStorageUID());
	var selfsnapshot = await selffunc.once('value');
	var selfdata = selfsnapshot.val();
	
	return new Promise(function(resolve, reject) {
	if (!selfsnapshot.hasChild(getStorageUID())) {
		resolve(errorMSG_1);
	}
		firebase.database().ref('Users').once('value', function(snapshot) {
			childSnapshot = [];
			
			snapshot.forEach(child => { 
				childSnapshot.push(child.val());
			});
			
			var i = 0;
			if ($scope.users.length == 0) {
				for (var CS in childSnapshot) {
					if (getStorageUID() == childSnapshot[CS].uid) {
						$scope.self = childSnapshot[CS];
						$scope.selfColor = $scope.self.colorDisplay;
						continue;
					}
					var isFollowing = selfdata.following.includes(' , ' + childSnapshot[CS].uid);
					var isFollower = childSnapshot[CS].following.includes(' , ' + selfdata.uid);
					$scope.users.push( 
						Object.assign(childSnapshot[CS], {
						isFollowing:isFollowing,
						isFollower:isFollower,
						index:i,
						DarkerColor:LightenDarkenColor(childSnapshot[CS].colorDisplay, -20),
						BorderColor: [ '#0199d9', '#d31010']
					}));
					
					if (isFollowing) {
						$scope.usersFollowingOnly.push($scope.users[i]);
					}
					
					if (isFollower) {
						$scope.usersFollowerOnly.push($scope.users[i]);
					}
					
					i++;
				}
				$scope.$apply();
			}
		});
	});
}

function FollowInit_Part2($scope) {

	firebase.database().ref('Users').on('value', function(snapshot) {
		childSnapshot = [];
		
		snapshot.forEach(child => { 
			childSnapshot.push(child.val());
		});
		setTimeout(function() {
			ReloadFollows($scope, childSnapshot);
			}, 10);
		
	});
}

function ReloadFollows($scope, childSnapshot) {
	var i = 0;
	$scope.usersFollowerOnly = [];
	$scope.usersFollowingOnly = [];
	if ($scope.users.length != 0) {
		for (var CS in childSnapshot) {
			if (getStorageUID() == childSnapshot[CS].uid) {
				$scope.self = childSnapshot[CS];
				continue;
			}
			var isFollower = childSnapshot[CS].following.includes(' , ' + getStorageUID());
			var isFollowing = $scope.self.following.includes(' , ' + childSnapshot[CS].uid);
			$scope.users[i].isFollower = isFollower;
			$scope.users[i].following = childSnapshot[CS].following;
			$scope.users[i].colorDisplay = childSnapshot[CS].colorDisplay;
			$scope.users[i].followers = childSnapshot[CS].followers;
			var followingNUM = childSnapshot[CS].following.split(' , ').length - 1;
			var followersNUM = childSnapshot[CS].followers.split(' , ').length - 1;
			$scope.users[i].nickname = childSnapshot[CS].nickname;
			$scope.users[i].followingNUM = followingNUM;
			$scope.users[i].followersNUM = followersNUM;
			
			if ($scope.users[i].isFollower) {
				$scope.usersFollowerOnly.push($scope.users[i]);
			}
			
			if ($scope.users[i].isFollowing) {
				$scope.usersFollowingOnly.push($scope.users[i]);
			}
			i++;
		}
		$scope.$apply();
	}
}

function getQueryVariable(variable) {
var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return pair[1];}
       }
       return(false);
}

function LightenDarkenColor(color, percent) {
  
    var num = parseInt(color.slice(1),16), amt = Math.round(2.55 * percent), R = (num >> 16) + amt, G = (num >> 8 & 0x00FF) + amt, B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255)).toString(16).slice(1);
  
}

function getStorageUID() {
	if (localStorage.getItem('saveUser') == 'false') {
		return sessionStorage.getItem('uid');
	} else {
		return localStorage.getItem('uid');
	}
}

function setStorageUID(data) {
	if (localStorage.getItem('saveUser') == 'false') {
		sessionStorage.setItem('uid', data);
	} else {
		localStorage.setItem('uid', data);
	}
}

function resetStorageUID() {
	sessionStorage.removeItem('uid');
	localStorage.removeItem('uid');
	localStorage.setItem('saveUser', 'false');
}