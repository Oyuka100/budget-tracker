const { response } = require("express");

const indexedDb = window.indexedDB || window.shimIndexedDB;

let database;

var request = indexedDB.open("budget", 1);

request.onupgradeneeded = function (data) {
  let database = data.result;
  database.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function (data) {
  database = data.result;
  if (navigator.onLine) {
    getDataBase();
  }
};

function getDataBase() {
  const transaction = database.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");
  const getAll = store.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application.json, */*",
          "Content-Type": "application.json",
        },
      })
        .then((response) => {
          return response.json();
        })
        .then(() => {
          const transaction = database.transaction(["pending"], "readwrite");
          const store = transaction.objectStore("pending");
          // delete transaction from indexDB
          store.clear();
        });
    }
  };
}
function saveRecord(record) {
  const transaction = database.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");
  store.add(record);
}

request.onerror = function (event) {
  console.log(event.target.errorCode);
};

window.addEventListener("online", getDataBase);
