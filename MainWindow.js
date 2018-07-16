var database = firebase.database();       
var name = "";
var password = "";

const MSG_login = 'Logging in...';
const MSG_not_exist = 'No User Exist !';
const MSG_invalid_vars = 'Wrong Password / Username !';
const MSG_already_in = 'User Is Already In !';

var app = angular.module('myApp', ['ngAnimate']);
app.controller('personCtrl', function($scope) {
	
	resetStorageUID();
	
	if (getQueryVariable('Error') != false) {
		$scope.errorMSG = getQueryVariable('Error').replace(/\+/g,' ');
	}
	
	if (localStorage.getItem('saveUser') == 'true') {
		$scope.rememberloginuser = true;
		loggingIn($scope);
	} else {
		$scope.rememberloginuser = false;
		sessionStorage.removeItem('uid');
	}
	
    if (localStorage.getItem('saveUsername') == 'true') {
        $scope.rememberuser = true;
        $scope.name = localStorage.getItem('user');
    }
    else
    {
        $scope.rememberuser = false;
        $scope.name = "";
    }

	$scope.clickedSign_In = async function() {
		$scope.aaa = true;
		setTimeout(function() {
			window.location.href = 'SignUpWindow.html';
			}, 1500);
	}
	
    $scope.clicked = async function() {
	
        name = $scope.name;
        password = $scope.pass;
        
		localStorage.setItem('saveUser', $scope.rememberloginuser);
		
		localStorage.setItem('saveUsername', $scope.rememberuser);
        $scope.rememberuser ?
            localStorage.setItem('user', name) :
            localStorage.removeItem('user');
		
        var a = await onClicking();
		$scope.errorMSG = a;
		$scope.$apply();
		
		resetStorageUID();
		
		if (a == 'Logging in...') {
			loggingIn($scope);
			$scope.$apply();
			}
		}
		
    });
	
function loggingIn($scope) {
	$scope.aaa = true;
	setTimeout(function() {
		window.location.href = 'UserWindow.html';
		}, 1500);
}
	
async function onClicking(){
	
	var func = firebase.database().ref('Users').orderByChild('username').equalTo(name);
	var snapshot = await func.once('value');
	var childSnapshot = [];
	
	snapshot.forEach(child => { 
		childSnapshot.push(child.val());
	});
		
	return new Promise(function(resolve, reject) {
		if (childSnapshot.length == 0) {
			resolve(MSG_not_exist);
			return;
			//childSnapshot.push(newUser());
		}
		else {
			for (var CS in childSnapshot) {
				if (name == childSnapshot[CS].username && password == childSnapshot[CS].password) {
					
					setStorageUID(childSnapshot[CS].uid);
					
					var update = {};
		
					update[childSnapshot[CS].uid] = childSnapshot[CS];
					firebase.database().ref('Users').update(update);
					resolve(MSG_login);
					return;
				}
			}
		}
		
		resolve(MSG_invalid_vars);
	})
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
	if (localStorage.getItem('saveUser') == 'true') {
		sessionStorage.removeItem('uid');
	} else {
		localStorage.removeItem('uid');
	}
}