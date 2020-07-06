const loading = document.querySelector("#loading");
const ul = document.querySelector("#search-results-list");
const clearBtn = document.querySelector("#clear");
const search = document.querySelector("#search");
const itemInfo = document.querySelector("#item-information");
let userInput = document.querySelector("input");
const previousPage = document.querySelector(".previous-page");
const h1 = document.querySelector("#search-header");
const pageNumber = document.querySelector(".page-number");
const nextPage = document.querySelector(".next-page");
const searchResults = document.querySelector("#search-results");
const closeAllBtn = document.querySelector("#close-all");
const information = document.querySelector("#information");
const totalPages = document.querySelector("#total-pages");
let pageNums = 1;
let objCount = 0;
let pageCount = 1;
let responseData; //results of http request
let totalChildren = 0;

/*IMPORTANT
when the user enters the name of a repo seperated by a space, this program will render repos that include each word that is SEPERATED BY A SPACE. Can avoid this by entering repositories that includes words seperated by a dash ("-")*/

function sendHttpRequest(method, url) {
  const promise = new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);

    xhr.responseType = "json"; //alternatively, can do "JSON.parse()"

    xhr.onload = function () {
      resolve(xhr.response);
    };

    xhr.onload = function () {
      //wifi errors
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.response);
      } else {
        console.log(xhr.status);
        reject(new Error("Something went wrong!"));
      }
      endModal();
    };

    xhr.onerror = function () {
      //error with the server itself
      console.log(xhr.response);
      console.log(xhr.status);
      endModal();
      reject(new Error("Failed to send request!"));
    };
    xhr.send();
  });
  return promise;
}

async function navigateServer(perPage, pageNumber, pageNumMargin) {
  searchResults.style.display = "none";
  h1.style.display = "none";
  ul.textContent = "";
  objCount = 0;
  responseData = await sendHttpRequest(
    "GET",
    `https://api.github.com/search/repositories?q=${userInput.value.trim()}&sort=stars&order=des&per_page=${perPage}&page=${pageNumber}` //100 per page seems to be the max...CPU will blow up--doesn't go more. Need to parse JSON data for every other page until there is no more data left
  );
  endModal();
  if (responseData.total_count === 0) {
    appendErrorToDOM();
  }
  const pageNum = document.querySelector(".page-number");
  if (responseData.total_count / 100 > 1) {
    nextPage.style.display = "inline-block";
    pageNum.style.marginLeft = "100px";
  }
  if (pageNumMargin) {
    pageNum.style.marginLeft = "0px";
  } else {
    pageNum.style.marginLeft = "100px";
  }
  searchResults.style.display = "block";
  h1.style.display = "block";
  for (let i = 0; i < responseData.items.length; i++) {
    pageCount++;
    //100 is the max repositories per page
    let path = responseData.items[i];
    const jsonObj = {
      fullName: path.full_name,
      description: path.description,
      language: path.language,
      githubUrl: path.html_url,
      homepageUrl: path.homepage,
      created: path.created_at,
      updated: path.updated_at,
      stars: path.stargazers_count,
      watchers: path.watchers_count,
      openIssues: path.open_issues_count,
    };
    const objName = {
      name: path.name,
    };
    appendToDOM(jsonObj, objName);
  }
}

function appendToDOM(obj, objName) {
  clearBtn.style.display = "inline-block";
  objCount++; //keeps track of what number element is in the DOM and displays it for
  const scrollUpBtn = document.querySelector("#scroll-up");
  const li = document.createElement("li");
  li.textContent = `${objCount}: ${objName.name}`; //displays name of repository in DOM
  ul.append(li);
  h1.style.display = "block"; //header of searched items is displayed

  li.addEventListener("click", () => {
    //when clicking on li, DOM renders a detailed view of the repository at the bottom of the page
    information.style.display = "block"; //making the "information" section visible. This will hold list items that display the repository info of the names clicked
    const listItem = document.createElement("li");
    listItem.id = "info-li"; //this list item will be appended to the information section and will hold the detailed view of the repo

    const xBtn = document.createElement("button"); //each li has a delete button that deletes the li from the information section unordered list
    xBtn.textContent = "X";
    xBtn.className = "x-btn";
    listItem.appendChild(xBtn);

    //getting the content of the repository by accessing the objName argument
    const h2 = document.createElement("h2");
    h2.textContent = objName.name;
    const p1 = document.createElement("p");
    p1.textContent = `Full Name: ${obj.fullName}`;
    const p2 = document.createElement("p");
    p2.textContent = `Description: ${obj.description}`;
    const p3 = document.createElement("p");
    p3.textContent = `Language: ${obj.language}`;
    const p4 = document.createElement("p");
    p4.textContent = `Github Url: ${obj.githubUrl}`; //making links clickable
    p4.className = "p-hover";
    p4.addEventListener("click", () => {
      open(`${obj.githubUrl}`);
    });
    p4.style.color = "blue";
    const p5 = document.createElement("p");
    p5.textContent = `Homepage Url: ${obj.homepageUrl}`;
    p5.addEventListener("click", () => {
      open(`${obj.homepageUrl}`); //making links clickable
    });
    p5.className = "p-hover";
    p5.style.color = "blue";
    const p6 = document.createElement("p");
    p6.textContent = `Created: ${obj.created}`;
    const p7 = document.createElement("p");
    p7.textContent = `Updated: ${obj.updated}`;
    const p8 = document.createElement("p");
    p8.textContent = `Stars: ${obj.stars}`;
    const p9 = document.createElement("p");
    p9.textContent = `Watchers: ${obj.watchers}`;
    const p10 = document.createElement("p");
    p10.textContent = `Open Issues: ${obj.openIssues}`;

    //appending content to the list item
    listItem.append(h2, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10);
    itemInfo.append(listItem);
    totalChildren++;
    listItem.onmouseover = () => {
      listItem.style.backgroundColor = "white";
    };

    //making buttons visible that will enhance the user experience. When scrollUp is clicked, it will scroll the user to the top of the page so they don't have to manually scroll
    scrollUpBtn.style.display = "block";
    closeAllBtn.style.display = "block";

    closeAllBtn.addEventListener("click", () => {
      //deletes all list items in the information section
      search.scrollIntoView({ behavior: "smooth" });
      itemInfo.textContent = "";
      information.style.display = "none";
    });

    scrollUpBtn.scrollIntoView({ behavior: "smooth" });
    scrollUpBtn.addEventListener("click", () => {
      const search = document.querySelector("#search");
      search.scrollIntoView({ behavior: "smooth" });
    });

    xBtn.addEventListener("click", () => {
      itemInfo.removeChild(listItem);
      totalChildren = totalChildren - 1;
      if (totalChildren === 0) {
        information.style.display = "none";
        search.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
}

function appendErrorToDOM() {
  //if nothing is found in the Github database, an error message will be displayed to the user
  ul.textContent = "";
  const li = document.createElement("li");
  li.textContent = "No Results Found";
  pageNumber.style.display = "none";
  h1.style.display = "none";
  information.style.display = "none";
  ul.append(li);
}

function endModal() {
  //loading display stops spinning and becomes invisible
  loading.style.display = "none";
}

const searchBtn = document.querySelector("#search-button"); //getting user input
searchBtn.addEventListener("click", () => {
  if (userInput.value.trim() === "") {
    alert("Enter a valid input.");
  } else {
    information.style.display = "none";
    itemInfo.textContent = "";
    nextPage.style.display = "inline-block";
    pageNumber.style.display = "inline-block";
    previousPage.style.display = "none";
    pageNums = 1;
    totalPages.textContent = "";
    pageNumber.textContent = "Page: 1";
    nextPage.style.display = "none";
    loading.style.display = "block";
    navigateServer(100, 1); //begin http request
  }
});

clearBtn.addEventListener("click", () => {
  //clears all the items rendered from search, all items rendered by clicking them, and takes them away from the DOM
  clearBtn.style.display = "none";
  pageNums = 1;
  totalPages.textContent = "";
  pageNumber.textContent = "Page: 1";
  itemInfo.textContent = "";
  userInput.value = "";
  ul.textContent = "";
  searchResults.style.display = "none";
  information.style.display = "none";
});

userInput.addEventListener("keypress", (e) => {
  //adding an enter key functionality
  if (e.key === "Enter") {
    searchBtn.click();
  }
});

nextPage.addEventListener("click", () => {
  previousPage.style.display = "inline-block";
  let pageNumMargin = true;
  //forwarding request to server for next page count
  let pageCount = responseData.total_count / 100;
  totalPages.textContent = `Page Count: ${Math.round(pageCount)}`;
  if (pageNums === pageCount) {
    return;
  } else {
    pageNums = pageNums + 1;
    pageNumber.textContent = `Page: ${Math.round(pageNums)}`;
    searchResults.style.display = "none";
    h1.style.display = "none";
    loading.style.display = "block";
    itemInfo.textContent = "";
    information.style.display = "none";
    navigateServer(100, pageNums, pageNumMargin);
  }
});

previousPage.addEventListener("click", () => {
  let pageNumberMarg;
  pageNums = pageNums - 1;
  let pageCount = responseData.total_count / 100;
  if (pageNums === 1) {
    previousPage.style.display = "none";
    pageNumberMarg = false;
  } else {
    previousPage.style.display = "inline-block";
    pageNumberMarg = true;
  }
  pageNumber.textContent = `Page: ${pageNums}`;
  searchResults.style.display = "none";
  h1.style.display = "none";
  totalPages.textContent = `Page Count: ${Math.round(pageCount)}`;
  loading.style.display = "block";
  itemInfo.textContent = "";
  information.style.display = "none";
  navigateServer(100, pageNums, pageNumberMarg); //forwarding request to server with the last page count
});

