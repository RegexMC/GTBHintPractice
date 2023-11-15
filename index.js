let wordList = [];
let selectedHint = "";
let matchingThemes = [];
let guessedThemes = [];
let correct = 0;
const spaceRegex = new RegExp("[^ ]", "g");
let sortedThemes;
let hints;
let hintsFormatted;

let hintPossibilities = {};
let hintLengths = {};
let rangeEl = document.getElementById("hintpossibilitiesrange");

async function start() {
	let getThemesRes = await fetch("https://gtb.regexmc-noirlskills.workers.dev/getAllThemes", {
		body: "{}",
		method: "POST"
	});
	let getThemesJson = await getThemesRes.json();
	wordList = getThemesJson.map((theme) => theme.theme);
	sortedThemes = wordList.sort(function (a, b) {
		return b.length - a.length;
	});
	hints = sortedThemes
		.map((word) => word.replace(spaceRegex, "_"))
		.filter((value, index, array) => array.indexOf(value) === index);
	hintsFormatted = sortedThemes
		.map((word) => word.replace(spaceRegex, "_ ").replaceAll("  ", "    ").trim())
		.filter((value, index, array) => array.indexOf(value) === index);

	hintsFormatted.forEach((hintFormatted, index) => {
		hintLengths[hintFormatted] = hints[index].length;
		let hint = getHintFromFormatted(hintFormatted);

		let matching = wordList.filter((element) => {
			let regex = new RegExp(`^${hint.replace(/_/g, "\\S")}$`);
			return regex.test(element);
		});

		hintPossibilities[hintFormatted] = matching.length;
	});
	let maxMatching = Math.max(...Object.values(hintPossibilities));
	rangeEl.setAttribute("max", maxMatching);
	rangeEl.setAttribute("value", maxMatching);
	document.getElementById("hintlbl").innerHTML = `Max Matching Themes: ${maxMatching}`;

	hints.forEach((hint, index) => {
		var row = tbl.insertRow(0);
		row.setAttribute("onclick", `selectHint("${hintsFormatted[index]}")`);
		var cell1 = row.insertCell(0);
		var cell2 = row.insertCell(1);
		var cell3 = row.insertCell(2);

		cell1.innerHTML = `<pre>${hintsFormatted[index]}</pre>`;
		cell1.classList.add("border");

		cell2.innerHTML = getWordCharacters(hint);
		cell2.style.textAlign = "right";

		cell3.innerHTML = hint.length;
		cell3.style.borderRight = "1px solid black";
		cell3.style.borderLeft = "1px solid black";
	});
}

start();

let tbl = document.getElementById("hintTable").getElementsByTagName("tbody")[0];

rangeEl.onmouseup = function () {
	document.getElementById("hintlbl").innerHTML = `Max Matching Themes: ${this.value}`;

	const table = document.getElementById("hintTable");
	const rows = table.getElementsByTagName("tr");

	for (let i = 1; i < rows.length; i++) {
		const hintCell = rows[i].getElementsByTagName("td")[0];
		const hint = hintCell.innerText.toLowerCase();
		if (hintPossibilities[hint] > parseInt(this.value)) {
			rows[i].style.display = "none";
		} else {
			rows[i].style.display = "";
		}
	}
};

let sortDirection = 1;

function sortTable() {
	const table = document.getElementById("hintTable");
	const rows = Array.from(table.getElementsByTagName("tr"));

	rows.shift();

	if (sortDirection == 1) {
		sortDirection = -1;
	} else {
		sortDirection = 1;
	}

	rows.sort((a, b) => {
		let aValue = a.getElementsByTagName("td")[2].innerText.toLowerCase();
		let bValue = b.getElementsByTagName("td")[2].innerText.toLowerCase();
		return sortDirection * (parseInt(aValue) - parseInt(bValue));
	});

	table.getElementsByTagName("tbody")[0].append(...rows);
}

function filterTable() {
	const filterOption = document.getElementById("filterDropdown").value;
	const table = document.getElementById("hintTable");
	const rows = table.getElementsByTagName("tr");

	for (let i = 1; i < rows.length; i++) {
		const hintCell = rows[i].getElementsByTagName("td")[0];
		const hint = getHintFromFormatted(hintCell.innerText);
		let display = true;

		if (filterOption === "nospace" && hint.includes(" ")) {
			display = false;
		} else if (filterOption === "onlyspace" && !hint.includes(" ")) {
			display = false;
		}

		rows[i].style.display = display ? "" : "none";
	}
}

document.getElementById("searchBox").addEventListener("input", function () {
	const searchValue = this.value.toLowerCase();
	const table = document.getElementById("hintTable");
	const rows = table.getElementsByTagName("tr");

	for (let i = 1; i < rows.length; i++) {
		const hintCell = rows[i].getElementsByTagName("td")[0];
		const hint = getHintFromFormatted(hintCell.innerText.toLowerCase());
		const display = hint.includes(searchValue);

		rows[i].style.display = display ? "" : "none";
	}
});

function getHintFromFormatted(formattedHint) {
	return formattedHint.replaceAll("_ ", "_").replaceAll("  ", "").trim();
}

function getWordCharacters(hint) {
	let charCountGroups = hint
		.split(" ")
		.filter((f) => f.length != 0)
		.map((word) => `(${word.length})`)
		.join(" ");

	return hint.includes(" ") ? charCountGroups : `(${hint.trim().length})`;
}

function selectRandomHint() {
	const table = document.getElementById("hintTable");
	const rows = table.getElementsByTagName("tr");

	let availableHints = [];
	for (let i = 1; i < rows.length; i++) {
		const hintCell = rows[i].getElementsByTagName("td")[0];
		if (rows[i].style.display == "") {
			availableHints.push(hintCell.innerText.toLowerCase());
		}
	}
	selectHint(availableHints[Math.floor(Math.random() * availableHints.length)]);
}

function selectHint(formattedhint) {
	document.getElementById("guesses").innerHTML = "";
	let hint = getHintFromFormatted(formattedhint);

	correct = 0;
	selectedHint = hint;

	guessedThemes = [];
	matchingThemes = wordList.filter((element) => {
		let regex = new RegExp(`^${selectedHint.replace(/_/g, "\\S")}$`);
		return regex.test(element);
	});

	document.getElementById("hint").innerText = formattedhint;
	document.getElementById("guess").setAttribute("maxlength", selectedHint.length);
	document.getElementById("progress").innerText = `${correct}/${matchingThemes.length}`;
}

let guessInput = document.getElementById("guess");
guessInput.addEventListener("keydown", function (event) {
	if (event.key === "Enter") {
		event.preventDefault();
		guess();
	}
});

function guess() {
	if (matchingThemes.length == 0) return;
	const guess = guessInput.value.replaceAll(" ", "").toLowerCase();
	if (guessedThemes.includes(guess)) return;
	guessedThemes.push(guess);
	if (matchingThemes.map((theme) => theme.replaceAll(" ", "").toLowerCase()).includes(guess)) {
		correct++;
		document.getElementById("progress").innerText = `${correct}/${matchingThemes.length}`;
		document.getElementById("guesses").innerHTML += `${guessInput.value}, `;
	}
	guessInput.value = "";
}

function reveal() {
	if (matchingThemes.length == 0) return;

	let notGuessed = matchingThemes.filter((theme) => !guessedThemes.includes(theme.replaceAll(" ", "").toLowerCase()));
	document.getElementById("unknown").hidden = false;
	document.getElementById("unknown").value = notGuessed.join("\n");
}
