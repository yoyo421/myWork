var database = firebase.database();       
var name = "";
var password = "";
var nickname = "";
var errorMSG = "";
var match = true;

var app = angular.module('myApp', ['ngAnimate']);
app.controller('personCtrl', function($scope) {

	$scope.compare = function() {
		if ($scope.pass == null || $scope.pass == "undefined" || $scope.pass == "" || $scope.confpass == null || $scope.confpass == "undefined" || $scope.confpass == "") {
			$scope.passmatch = 'passwords cannot be empty';
			$scope.passmsgcolor = {"color" : "red"}
			match = false;
		}
		else if ($scope.pass == $scope.confpass) {
			$scope.passmatch = 'passwords are match';
			$scope.passmsgcolor = {"color" : "green"}
			match = true;
		}
		else {
			$scope.passmatch = 'passwords are NOT match';
			$scope.passmsgcolor = {"color" : "red"}
			match = false;
		}
	}
	
	$scope.back = function() {
		$scope.aaa = true;
		setTimeout(function() {
			window.location.href = 'MainWindow.html';
			}, 1500);
	}
	
    $scope.clicked = async function() {
	
		$scope.errorMSG = "";
		
        name = $scope.name;
        password = $scope.pass;
		nickname = $scope.nickname;
		
		if (nickname.length > 17) {
			$scope.errorMSG += 'nickname is too long\n';
			match = false;
		}
		
		if (name.includes(',')) {
			$scope.errorMSG += 'you can\'t use special chars\n';
			match = false;
		}
		if (name == "" || name == "undefined" || name == null) {
			$scope.errorMSG += 'you need username\n';
			match = false;
		}
		if (nickname == "" || nickname == "undefined" || nickname == null) {
			$scope.errorMSG += 'you need nickname\n';
			match = false;
		}
		
		if (!match) {
			return;
		}
		
		var a = await newUser();
		$scope.errorMSG = a;
		$scope.$apply();
		
		if (a == 'Logging in...') {
		$scope.aaa = true;
		$scope.$apply();
		setTimeout(function() {
			window.location.href = 'UserWindow.html';
			}, 1500)
		}
		}
		
		$scope.compare();
		
    });

async function newUser(){
	var uid;
	var match = true;
	while (match) {
		uid = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
		var func = firebase.database().ref('Users').orderByChild('uid').equalTo(uid);
		var snapshot = await func.once('value');
		var childSnapshot = [];
		snapshot.forEach(child => { 
			childSnapshot.push(child.val());
		});
		if (childSnapshot.length == 0) {
			match = false;
		}
	}
	
	var func = firebase.database().ref('Users').orderByChild('username').equalTo(name);
	var snapshot = await func.once('value');
	var childSnapshot = [];
	
	snapshot.forEach(child => { 
		childSnapshot.push(child.val());
	});
	return new Promise(function(resolve, reject) {
	if (childSnapshot.length != 0) {
		errorMSG = 'Username Is Already Taken :( ';
		resolve(errorMSG);
		return;
	}
	
	var data = {
        username: name,
		nickname: nickname,
        password: password,
        uid: uid,
        following: '',
		followingNUM: 0,
        followers: '',
		followersNUM: 0,
		colorDisplay: '#0199d9'
    };
	firebase.database().ref('Users/' + uid).set(data);
	
	sessionStorage.setItem('uid', uid);

	errorMSG = 'Logging in...';
	resolve(errorMSG);
	});
}