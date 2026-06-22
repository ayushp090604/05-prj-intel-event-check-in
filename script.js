var checkInForm = document.getElementById("checkInForm");
var attendeeNameInput = document.getElementById("attendeeName");
var teamSelect = document.getElementById("teamSelect");
var attendeeCountEl = document.getElementById("attendeeCount");
var greetingEl = document.getElementById("greeting");
var progressBar = document.getElementById("progressBar");
var waterCountEl = document.getElementById("waterCount");
var zeroCountEl = document.getElementById("zeroCount");
var powerCountEl = document.getElementById("powerCount");

var totalAttendees = 0;
var teamCounts = {
  water: 0,
  zero: 0,
  power: 0,
};
var attendees = [];
var attendanceGoal = 50;

var attendeeListEl = document.getElementById("attendeeList");

function saveCounts() {
  var attendanceData = {
    totalAttendees: totalAttendees,
    teamCounts: teamCounts,
    attendees: attendees,
  };
  localStorage.setItem("attendanceData", JSON.stringify(attendanceData));
}

function loadCounts() {
  var stored = localStorage.getItem("attendanceData");
  if (!stored) {
    return;
  }

  try {
    var attendanceData = JSON.parse(stored);
    if (typeof attendanceData.totalAttendees === "number") {
      totalAttendees = attendanceData.totalAttendees;
    }
    if (
      attendanceData.teamCounts &&
      typeof attendanceData.teamCounts === "object"
    ) {
      teamCounts.water = Number(attendanceData.teamCounts.water) || 0;
      teamCounts.zero = Number(attendanceData.teamCounts.zero) || 0;
      teamCounts.power = Number(attendanceData.teamCounts.power) || 0;
    }
    if (Array.isArray(attendanceData.attendees)) {
      attendees = attendanceData.attendees.filter(function (item) {
        return (
          item && typeof item.name === "string" && typeof item.team === "string"
        );
      });
    }
  } catch (error) {
    localStorage.removeItem("attendanceData");
  }
}

function getTeamLabel(teamValue) {
  if (teamValue === "water") {
    return "Team Water Wise";
  }
  if (teamValue === "zero") {
    return "Team Net Zero";
  }
  if (teamValue === "power") {
    return "Team Renewables";
  }
  return "";
}

function updateAttendanceDisplay() {
  attendeeCountEl.textContent = totalAttendees;

  var percent = 0;
  if (attendanceGoal > 0) {
    percent = Math.round((totalAttendees / attendanceGoal) * 100);
  }
  if (percent > 100) {
    percent = 100;
  }

  progressBar.style.width = percent + "%";
  progressBar.setAttribute("aria-valuenow", totalAttendees);
  progressBar.setAttribute("aria-valuemin", "0");
  progressBar.setAttribute("aria-valuemax", attendanceGoal.toString());

  waterCountEl.textContent = teamCounts.water;
  zeroCountEl.textContent = teamCounts.zero;
  powerCountEl.textContent = teamCounts.power;
}

function getWinningTeamLabel() {
  var winningCount = Math.max(
    teamCounts.water,
    teamCounts.zero,
    teamCounts.power,
  );
  var winners = [];

  if (teamCounts.water === winningCount) {
    winners.push(getTeamLabel("water"));
  }
  if (teamCounts.zero === winningCount) {
    winners.push(getTeamLabel("zero"));
  }
  if (teamCounts.power === winningCount) {
    winners.push(getTeamLabel("power"));
  }

  if (winners.length === 1) {
    return winners[0];
  }
  return winners.join(" and ");
}

function showGreeting(name, teamValue) {
  var teamLabel = getTeamLabel(teamValue);
  greetingEl.textContent =
    "Welcome, " + name + "! You are checked in for " + teamLabel + ".";
  greetingEl.className = "success-message";
  greetingEl.style.display = "block";
}

function showCelebration() {
  var winningTeam = getWinningTeamLabel();
  greetingEl.textContent =
    "Goal reached! Congratulations to " +
    winningTeam +
    " for leading the check-in!";
  greetingEl.className = "success-message";
  greetingEl.style.display = "block";
}

function renderAttendeeList() {
  if (!attendeeListEl) {
    return;
  }

  attendeeListEl.innerHTML = "";
  attendees.forEach(function (attendee) {
    var listItem = document.createElement("li");
    listItem.className = "attendee-item";
    listItem.textContent = attendee.name + " — " + getTeamLabel(attendee.team);
    attendeeListEl.appendChild(listItem);
  });
}

checkInForm.addEventListener("submit", function (event) {
  event.preventDefault();

  var name = attendeeNameInput.value.trim();
  var teamValue = teamSelect.value;

  if (name === "" || teamValue === "") {
    return;
  }

  totalAttendees = totalAttendees + 1;
  if (teamCounts[teamValue] !== undefined) {
    teamCounts[teamValue] = teamCounts[teamValue] + 1;
  }

  attendees.push({
    name: name,
    team: teamValue,
  });

  if (totalAttendees >= attendanceGoal) {
    showCelebration();
  } else {
    showGreeting(name, teamValue);
  }

  saveCounts();
  updateAttendanceDisplay();
  renderAttendeeList();

  checkInForm.reset();
  attendeeNameInput.focus();
});

loadCounts();
updateAttendanceDisplay();
renderAttendeeList();
