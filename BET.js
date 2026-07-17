const googleWebAppUrl = "https://script.google.com/macros/s/AKfycbzETrV7tj8xKNpg1x2OjO8ooQE1BCl7W0Jy0OmYoZ7u1lueaX5Pt7am7IIAU4q8Tg8y/exec";
document.addEventListener("DOMContentLoaded", function() {

    // 1. Sign Up Handler
    const signupBtn = document.getElementById("sign up");
    if (signupBtn) {
        signupBtn.addEventListener("click", function(event) {
            event.preventDefault(); 
            
            let userName = document.getElementById("signupName").value.trim();
            let gmail = document.getElementById("signupGmail").value.trim();
            let password = document.getElementById("signupPassword").value;
            
            if (!userName || !gmail || !password) {
                alert("Please fill out all sign-up fields.");
                return;
            }

            let signupPackage = {
                "action": "signup",
                "name": userName,
                "gmail": gmail,
                "password": password
            };
            
            sendToGoogle(signupPackage);
        });
    }

    // 2. Log In Handler
    const loginBtn = document.getElementById("login");
    if (loginBtn) {
        loginBtn.addEventListener("click", function(event) {
            event.preventDefault(); 
            
            let gmail = document.getElementById("loginGmail").value.trim();
            let password = document.getElementById("loginPassword").value;
            
            if (!gmail || !password) {
                alert("Please fill out all login fields.");
                return;
            }

            let loginPackage = {
                "action": "login",
                "gmail": gmail,
                "password": password
            };
            
            sendToGoogle(loginPackage);
        });
    }
});

// 3. Central Transmission Engine
function sendToGoogle(dataPackage) {
    fetch(googleWebAppUrl, {
        method: "POST",
        headers: {
            "Content-Type": "text/plain" 
        },
        body: JSON.stringify(dataPackage) 
    })
    .then(response => response.json()) 
    .then(data => {
        if (data.status === "signup_success") {
            alert("Success! Account created in database. Try logging in now.");
        } 
        else if (data.status === "login_success") {
            alert("Welcome authorized user! Access Granted.");
        } 
        else if (data.status === "exists") {
            alert("Error: This Gmail is already in use.");
        } 
        else if (data.status === "wrong_password") {
            alert("Access Denied: Incorrect password configuration.");
        } 
        else if (data.status === "not_found") {
            alert("Access Denied: Gmail not registered in ledger.");
        }
    })
    .catch(error => {
        console.error("Pipeline breakdown:", error);
        alert("Network pipeline failure. Check console log parameters.");
    });
}

const SubmitAttendanceBtn = document.getElementByld("submitAttendanceBtn");
  if(submitAttendanceBtn) {
      submitAttendanceBtn.addEventListener("click", fuction(event)
                                          }
                                         event.preventDefault();
                                         letAttendanceRecords = [];
                                         let rows = document.querySelectorAll(".attendance-row");
                                         rows.forEach(row => {
                                             let name = row.querySelector(".student-name").innerText;
                                             let statusSelect = row.querySelector(".status-select").value;
                                             

                                          
    
      
 
