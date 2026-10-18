const timeElement = document.querySelector("#timeElement");
function updateClock() {
	timeElement.textContent = new Date().toLocaleString();
}
updateClock();
setInterval(updateClock, 1000);

const aboutWindow = document.querySelector("#about");
const aboutOpen = document.querySelector("#aboutopen");
const aboutClose = document.querySelector("#aboutclose");
const aboutHeader = document.querySelector("#aboutheader");
let biggestIndex = 1;

function bringToFront(element) {
	element.style.zIndex = ++biggestIndex;
}

function openWindow(element) {
	element.style.display = "block";
	bringToFront(element);
}

function closeWindow(element) {
	element.style.display = "none";
	aboutOpen.classList.remove("selected");
}

aboutOpen.addEventListener("click", () => {
	aboutOpen.classList.add("selected");
	openWindow(aboutWindow);
});
aboutClose.addEventListener("click", () => closeWindow(aboutWindow));
aboutWindow.addEventListener("pointerdown", () => {
	bringToFront(aboutWindow);
	aboutOpen.classList.remove("selected");
});

// Pointer events support both mouse dragging and touch dragging.
aboutHeader.addEventListener("pointerdown", (event) => {
	if (event.target === aboutClose || event.button !== 0) return;

	// Switch from the centered starting position to pixel coordinates before moving.
	const bounds = aboutWindow.getBoundingClientRect();
	aboutWindow.style.transform = "none";
	aboutWindow.style.left = `${bounds.left}px`;
	aboutWindow.style.top = `${bounds.top}px`;

	const startX = event.clientX;
	const startY = event.clientY;
	aboutHeader.setPointerCapture(event.pointerId);

	function move(pointerEvent) {
		if (pointerEvent.pointerId !== event.pointerId) return;
		aboutWindow.style.left = `${Math.max(0, Math.min(window.innerWidth - bounds.width, bounds.left + pointerEvent.clientX - startX))}px`;
		aboutWindow.style.top = `${Math.max(0, Math.min(window.innerHeight - bounds.height, bounds.top + pointerEvent.clientY - startY))}px`;
	}

	function stop(pointerEvent) {
		if (pointerEvent.pointerId !== event.pointerId) return;
		aboutHeader.removeEventListener("pointermove", move);
		aboutHeader.removeEventListener("pointerup", stop);
		aboutHeader.removeEventListener("pointercancel", stop);
	}

	aboutHeader.addEventListener("pointermove", move);
	aboutHeader.addEventListener("pointerup", stop);
	aboutHeader.addEventListener("pointercancel", stop);
});
