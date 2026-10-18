const timeElement = document.querySelector("#timeElement");
function updateClock() {
	const now = new Date();
	const seconds = now.getSeconds();
	const minutes = now.getMinutes();
	const hours = now.getHours();

	const secondDeg = (seconds / 60) * 360 + 90;
	const minuteDeg = (minutes / 60) * 360 + 90;
	const hourDeg = (hours / 12) * 360 + 90;

	document.getElementById("second-hand").style.transform =
		`rotate(${secondDeg}deg)`;
	document.getElementById("minute-hand").style.transform =
		`rotate(${minuteDeg}deg)`;
	document.getElementById("hour-hand").style.transform =
		`rotate(${hourDeg}deg)`;
	timeElement.textContent = now.toLocaleString();
}
updateClock();
setInterval(updateClock, 1000);

let biggestIndex = 1;

// An app named "about" uses #about, #aboutopen, #aboutclose, and #aboutheader.
function getAppElements(name) {
	const appWindow = document.getElementById(name);
	const openButton = document.getElementById(`${name}open`);
	const closeButton = document.getElementById(`${name}close`);
	const header = document.getElementById(`${name}header`);
	if (!appWindow || !openButton || !closeButton || !header) {
		throw new Error(
			`App "${name}" needs #${name}, #${name}open, #${name}close, and #${name}header`,
		);
	}
	return { appWindow, openButton, closeButton, header };
}

function bringToFront(element) {
	element.style.zIndex = ++biggestIndex;
}

function makeDraggable(appWindow, header, closeButton) {
	// Pointer events support both mouse and touch dragging.
	header.addEventListener("pointerdown", (event) => {
		if (event.target === closeButton || event.button !== 0) return;

		// Switch from the centered starting position to pixel coordinates before moving.
		const bounds = appWindow.getBoundingClientRect();
		appWindow.style.transform = "none";
		appWindow.style.left = `${bounds.left}px`;
		appWindow.style.top = `${bounds.top}px`;

		const startX = event.clientX;
		const startY = event.clientY;
		header.setPointerCapture(event.pointerId);

		function move(pointerEvent) {
			if (pointerEvent.pointerId !== event.pointerId) return;
			appWindow.style.left = `${Math.max(0, Math.min(window.innerWidth - bounds.width, bounds.left + pointerEvent.clientX - startX))}px`;
			appWindow.style.top = `${Math.max(0, Math.min(window.innerHeight - bounds.height, bounds.top + pointerEvent.clientY - startY))}px`;
		}

		function stop(pointerEvent) {
			if (pointerEvent.pointerId !== event.pointerId) return;
			header.removeEventListener("pointermove", move);
			header.removeEventListener("pointerup", stop);
			header.removeEventListener("pointercancel", stop);
		}

		header.addEventListener("pointermove", move);
		header.addEventListener("pointerup", stop);
		header.addEventListener("pointercancel", stop);
	});
}

function setupApp(name) {
	const { appWindow, openButton, closeButton, header } = getAppElements(name);

	openButton.addEventListener("click", () => {
		document
			.querySelectorAll(".desktop-icon.selected")
			.forEach((icon) => icon.classList.remove("selected"));
		openButton.classList.add("selected");
		appWindow.style.display = "block";
		bringToFront(appWindow);
	});
	closeButton.addEventListener("click", () => {
		appWindow.style.display = "none";
		openButton.classList.remove("selected");
	});
	appWindow.addEventListener("pointerdown", () => {
		bringToFront(appWindow);
		openButton.classList.remove("selected");
	});
	makeDraggable(appWindow, header, closeButton);
}

setupApp("about");
setupApp("clock");
setupApp("terminal");
