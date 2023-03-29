<script>
	import Counter from './Counter.svelte';
	import welcome from '$lib/images/svelte-welcome.webp';
	import welcome_fallback from '$lib/images/svelte-welcome.png';
	
	// audio
let cuckoo;

let firstVisit = true;
let running = false;
// to start or pause
let session = false;
let pause = false;
let sessionMinutes;
let pauseMinutes;
function toDefault() {
	sessionMinutes = 25;
	pauseMinutes = 5;
}
toDefault();
let dateNow = Date.now();
let newDate = new Date();
let minutes;
let seconds;
let interval;

let name = "";
let focusMode = false;

let morningStart = 7;
let lunchStart = 12;
let lunchEnd = 13;
let meal = "Lunch";
let eveningEnd = 19;

if (lunchStart <= 9 && lunchEnd <= 10 && lunchEnd - lunchStart <= 3) {
	meal = "Breakfast";
} else if (lunchStart >= 18 && lunchEnd >= 24 && lunchEnd - lunchStart <= 3) {
	meal = "Dinner";
} else if (lunchEnd - lunchStart >= 4) {
	meal = "Major break";
} else {
	meal = "Lunch";
}

let random = 0;
function setRandom(number = 1) {
	random = Math.random();
	random = Math.round(random * number);
}

let messageTime = "";

const arrayMessageFirstVisit = [
	"Welcome to Pomo d'oro !",
	"Discover Pomo d'oro, your companion for time tracking",
	"Never miss a break with Pomo d'oro",
	"Say hi to productivity ! Say hi to Pomo d'oro !",
	"Pomo d'oro will get you both productive and happy.",
	"Start your Pomo d'oro experience now !",
	"Organize yourself with Pomo d'oro. It's free like FCC."
];
let messageFirstVisit = arrayMessageFirstVisit[random];

// setRandom(Math.min(arrayMessageOpeningNoName.length,arrayMessageFirstVisit.length))

setRandom(1);
// normalement, setRandom(arrayMessageFirstVisit.length) puis setRandom à chaque changement session/break

const arrayMessageNotRunning = [
	"Come back when it feels right.",
	"Pomo d'oro will get you both productive and happy.",
	"Pomo d'oro, your companion for time tracking.",
	"Never ever miss a break with Pomo d'oro."
];
let messageNotRunning = arrayMessageNotRunning[random];

const arrayMessagePause = [
	"Time to relax",
	"Make a break and you will work faster. So you will do more breaks"
];
let messagePause = arrayMessagePause[random];

const arrayMessageSession = [
	{
		author: "Flaubert",
		source: "Correspondances",
		quote:
			"Je vais me mettre à travailler furieusement, à peine rentré; je l'espère du moins. La vie n'est tolérable qu'avec une marotte, un travail quelconque. Dès qu'on abandonne sa chimère, on meurt de tristesse. Il faut se cramponner dessus et souhaiter qu'elle nous emporte."
	},
	{
		author: "Voltaire",
		source: "Candide",
		quote:
			"Travaillons sans raisonner, c'est le seul moyen de rendre la vie supportable."
	},
	{
		author: "Voltaire",
		source: "Candide",
		quote:
			"Le travail éloigne de nous trois grands maux: l'ennui, le vice, et le besoin."
	},
	{
		author: "Antoine de Saint-Exupéry",
		source: "Le petit Prince",
		quote:
			"Peut-être bien que cet homme est absurde. Cependant il est moins absurde que le roi, que le vaniteux, que le businessman et que le buveur. Au moins son travail a-t-il un sens. Quand il allume son réverbère, c'est comme s'il faisait naître une étoile de plus, ou une fleur. Quand il éteint son réverbère, ça endort la fleur ou l'étoile. C'est une occupation très jolie. C'est véritablement utile puisque c'est joli."
	}
];
let messageSession = arrayMessageSession[random];

const history = [
	{
		date: new Date().toLocaleString("en", {
			dateStyle: "short"
		}),
		sessions: 0,
		breaks: 0
	}
];

let number = 1;

// found on github/AndersDJohnson/setIntervalSynchronous.js
var setIntervalSynchronous = function(func, delay) {
	var intervalFunction, timeoutId, clear;
	// Call to clear the interval.
	clear = function() {
		clearTimeout(timeoutId);
	};
	intervalFunction = function() {
		func();
		timeoutId = setTimeout(intervalFunction, delay);
	};
	// Delay start.
	timeoutId = setTimeout(intervalFunction, delay);
	// You should capture the returned function for clearing.
	return clear;
};
setIntervalSynchronous(() => {
	newDate = new Date();
	dateNow = Math.round(1679723994 / 60 - Date.now() / 60000);
}, 1000);
// chaque seconde, je recalcule tout : soit j'ai la valeur calculée mathématiquement, soit j'ai l'intervalle entre Date.now() et dateNowChange
// OU je fais confiance à l'objet Date. La seule valeur mise à jour (state) est le timestamp en millisecondes. Celui-ci est utilisé pour créer une valeur de fin, et une intervalle. à partir de cette intervalle, je calcule les variables d'état "minutes" et "secondes"

let dateNowChange = Date.now();
let minutesDate;
let secondsDate;

function resetCounter() {
	let targetMinutes;
	session ? (targetMinutes = sessionMinutes) : (targetMinutes = pauseMinutes);
	dateNowChange = Date.now() + targetMinutes * 60000;
	setIntervalToChange();
	updateCounter();
}

let intervalToChange;
function setIntervalToChange() {
	//intervalToChange est mis à jour chaque seconde avec updateCounter()
	intervalToChange = dateNowChange - Date.now();
	// minutes:seconds to display are calculated each second, based on the interval
	minutesDate = Math.ceil(intervalToChange / 60000);
	secondsDate = Math.round(intervalToChange / 1000) - (minutesDate - 1) * 60;
}
let intervalSeconds;

function updateCounter() {
	intervalSeconds = setIntervalSynchronous(() => {
		if (intervalToChange > 0) {
			setIntervalToChange();
		} else {
			// a custom message according to the timetable the user defined
			let actualTime = new Date().getHours();
			if (actualTime < morningStart) {
				// I was thinking about "Early start today !" but the problem is that the message only displays after the first session is complete, so I think it's too late to display that
				messageTime = "";
			} else if (actualTime > eveningEnd) {
				messageTime = "Your day is finished. Great job !";
			} else if (lunchStart <= actualTime < lunchEnd) {
				messageTime = "Bon appétit ! Consider having a break now.";
			}

			// adds a new day on history
			if (
				history[history.length - 1].date !==
				new Date().toLocaleString("en", {
					dateStyle: "short"
				})
			) {
				history.push({
					date: new Date().toLocaleString("en", {
						dateStyle: "short"
					}),
					sessions: 0,
					breaks: 0
				});
			}
			// updates today
			if (session) {
				history[history.length - 1].sessions += 1;
			} else {
				history[history.length - 1].breaks += 1;
			}

			// toggles between session and pause and plays a sound
			session = !session;
			pause = !pause;
			if (running) cuckoo.play();

			// reset the counter, then updates it by calling updateCounter()
			resetCounter();
			/* let targetMinutes;
																															session ? (targetMinutes = sessionMinutes) : (targetMinutes = pauseMinutes);
																															dateNowChange = Date.now() + targetMinutes * 60000;
																															setIntervalToChange();
																															updateCounter(); */
			//runningFunc();
		}
	}, 1000);
}

/* function runningFunc() {
																												let targetMinutes;
																												session ? (targetMinutes = sessionMinutes) : (targetMinutes = pauseMinutes);
																												dateNowChange = Date.now() + targetMinutes * 60000;
																												setIntervalToChange();
																												updateCounter();
																											} */

function handleClick() {
	running = !running;
	if (!running) {
		intervalSeconds();
		console.log("paused : intervalSeconds() has been cleared");
	} else {
		//randomizing the messages
		setRandom(number);
		// if never launched
		if (!session && !pause) {
			firstVisit = false;
			session = true;
			//runningFunc() toggles the session/pause and defines dateNowChange, then calls updateCounter() which updates each second
			resetCounter();
		} else {
			// dateNowChange, the timestamp (in ms) that will toggle session/pause, gets updated
			dateNowChange = Date.now() + intervalToChange;
		}
		updateCounter();
	}
}
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	<p> Bonjour, version 5 </p>
	<p> Running ? {running} </p>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

	h1 {
		width: 100%;
	}

	.welcome {
		display: block;
		position: relative;
		width: 100%;
		height: 0;
		padding: 0 0 calc(100% * 495 / 2048) 0;
	}

	.welcome img {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		display: block;
	}
</style>
