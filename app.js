// "use strict";

// Connecting to Scaledrone channel ID
const CLIENT_ID = "La7RBo6301dbIQEa";

// Creating instance for a single connection
const drone = new ScaleDrone(CLIENT_ID, {
  // adding custom data to members
  data: {
    name: getRandomName(),
    color: getRandomColor(),
  },
});

// Stores users
let members = [];

//OPENING CONNECTION
const modalError = document.querySelector(".modal-error");

// A connection has been opened, if no errors
drone.on("open", (error) => {
  if (error) {
    modalError.classList.add("open");
    modalError.textContent =
      "An error has occured while connecting..Please, try again.";

    return console.error(error);
  }
  // console.log("Connected to Scaledrone");

  // Listening for messages
  const room = drone.subscribe("observable-room");

  // Join room, connection has been opened
  room.on("open", (error) => {
    if (error) {
      return console.error(error);
    }
    // console.log("Succsfully joined the chat");
  });

  // Shows an array of users that have joined the chat
  room.on("members", (m) => {
    members = m;
    updateUsersDOM();
  });

  //New user joins the chat
  room.on("member_join", (member) => {
    members.push(member);
    updateUsersDOM();
  });

  // User leaving the chat
  room.on("member_leave", ({ id }) => {
    const index = members.findIndex((member) => member.id === id);
    members.splice(index, 1);
    updateUsersDOM();
  });

  // Listen to messages sent by users & add them to <div> messages
  room.on("data", (text, member) => {
    if (member) {
      addMessageToListDOM(text, member);
    }
  });
});

// closing error message modal window
modalError.addEventListener("click", (e) => {
  const clearError1 = setTimeout(removeError, 1000);

  if (e.target.classList.contains("modal-error")) {
    modalError.classList.remove("open");
  }
});

// Closing connection to Scaledrone
drone.on("close", (event) => {
  console.log("Connection was closed", event);
});

//Random name
function getRandomName() {
  const adjs = [
    "consectetur",
    "cupidatat",
    "proident",
    "sunt",
    "enim",
    "qui",
    "laborum",
    "floresc",
    "fermentum",
    "sed",
    "massa",
    "llamcorper",
    "feugiat",
    "Eu",
    "viverra",
  ];
  const nouns = [
    "consectetur",
    "pellentesque",
    "scelerisque",
    "morbi",
    "magna",
    "sed",
    "semper",
    "viverra",
    "granum",
    "lobortis",
    "pooecetes",
    "consequat",
    "pharetra",
    "rna",
    "ut",
  ];

  // Name randomizer
  return (
    adjs[Math.floor(Math.random() * adjs.length)] +
    "_" +
    nouns[Math.floor(Math.random() * nouns.length)]
  );
}

// Color randomizer
function getRandomColor() {
  return "#" + Math.floor(Math.random() * 0xffffff).toString(16);
}

//// ----------------------------- DOM related

const DOM = {
  members: document.querySelector(".members"),
  messages: document.querySelector(".messages"),
  input: document.querySelector(".messageFormInput"),
  form: document.querySelector(".messageForm"),
};

// Event listener for sending messages
DOM.form.addEventListener("submit", sendMessage);

// Sending message
function sendMessage() {
  const value = DOM.input.value;

  if (value === "") {
    return;
  }

  DOM.input.value = "";
  drone.publish({
    room: "observable-room",
    message: value,
  });
}

// Updates who is online
function updateUsersDOM() {
  DOM.members.innerHTML = `${members.length} members in the chat: ${members
    .map((value) => {
      return `<span style="color: ${value.clientData.color}">${value.clientData.name}</span>`;
    })
    .join(", ")}`;
}

// Creating and adding MESSAGES to the DOM
// Separate messages from other users and "me"

function createMessageElement(text, member) {
  // Define "me"
  const clientID = drone.clientId;
  const messageFromMe = member.id === clientID;

  // Check if the messages are mine
  const className = messageFromMe ? "message currentMember" : "message";
  const { name, color } = member.clientData;

  // Creating and adding messages to DOM
  const msg = document.createElement("div");
  msg.className = "messageText";
  msg.appendChild(document.createTextNode(text));

  // Creating username profile with a name, color, and an icon
  const profile = document.createElement("div");
  profile.className = "profile";

  const character = document.createElement("div");
  character.appendChild(document.createTextNode(name));
  character.style.color = color;
  character.className = "name";

  profile.appendChild(character);

  //Combining user profile and message into one element based on whether the message is from you or other participants

  const element = document.createElement("div");
  element.appendChild(profile);
  element.appendChild(msg);
  element.className = className; // check

  return element;
}

// Add new messages to chat window
function addMessageToListDOM(text, member) {
  // auto-scroll to the bottom of the chat when the message is added
  const element = DOM.messages;
  const wasTop =
    element.scrollTop === element.scrollHeight - element.clientHeight;
  element.appendChild(createMessageElement(text, member));
  if (wasTop) {
    element.scrollTop = element.scrollHeight - element.clientHeight;
  }
}

// Alert if message maxlength reached

const input = DOM.input;

input.addEventListener("keydown", function () {
  if (this.value.length >= 500) {
    modalError.classList.add("open");
    modalError.textContent = "You have exceeded the maximum message length.";
  }
});
