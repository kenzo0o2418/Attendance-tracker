var spreadsheetId = "1-weatenEXUbU4nKx67hvOAdK7htgsPC5qMqEOaSNXcE"; 

function doGet(e) {
  try {
    var rawPayload = e.parameter.payload;
    if (!rawPayload) {
      return createJsonResponse({ success: false, message: "No payload provided." });
    }

    var jsonPacket = JSON.parse(rawPayload);
    var action = jsonPacket.action;
    var ss = SpreadsheetApp.openById(spreadsheetId);

    // 1. REGISTRATION LOGIC
    if (action === "register") {
      var usersSheet = ss.getSheetByName("Users");
      if (!usersSheet) {
        usersSheet = ss.insertSheet("Users");
        usersSheet.appendRow(["Name", "Email", "Password", "School", "Role", "Batch"]);
      }
      
      var data = usersSheet.getDataRange().getValues();
      for (var i = 1; i < data.length; i++) {
        if (data[i][1] === jsonPacket.email) {
          return createJsonResponse({ success: false, message: "User with this email already exists." });
        }
      }
      
      usersSheet.appendRow([
        jsonPacket.name, 
        jsonPacket.email, 
        jsonPacket.password, 
        jsonPacket.school, 
        jsonPacket.role, 
        jsonPacket.batch
      ]);
      
      if (jsonPacket.role === "Student" && jsonPacket.batch && jsonPacket.batch !== "None") {
        var batchSheet = ss.getSheetByName(jsonPacket.batch);
        if (!batchSheet) {
          batchSheet = ss.insertSheet(jsonPacket.batch);
          batchSheet.getRange(1, 1).setValue("Student Name");
        }
        batchSheet.appendRow([jsonPacket.name]);
      }
      
      return createJsonResponse({ success: true, message: "Registration successful!" });
    }

    // 2. LOGIN LOGIC
    else if (action === "login") {
      var usersSheet = ss.getSheetByName("Users");
      if (!usersSheet) return createJsonResponse({ success: false, message: "User database empty." });
      
      var data = usersSheet.getDataRange().getValues();
      for (var i = 1; i < data.length; i++) {
        if (data[i][1].toString().toLowerCase() === jsonPacket.email.toString().toLowerCase()) {
          if (data[i][2].toString() === jsonPacket.password.toString()) {
            return createJsonResponse({
              success: true,
              user: {
                name: data[i][0],
                email: data[i][1],
                role: data[i][3],
                batch: data[i][4]
              }
            });
          } else {
            return createJsonResponse({ success: false, message: "Incorrect password." });
          }
        }
      }
      return createJsonResponse({ success: false, message: "User not found." });
    }

    // 3. FETCH ROSTER LOGIC
    else if (action === "getStudents") {
      var batchSheet = ss.getSheetByName(jsonPacket.batch);
      var students = [];
      
      if (batchSheet) {
        var data = batchSheet.getDataRange().getValues();
        for (var i = 1; i < data.length; i++) {
          if (data[i][0]) {
            students.push({ id: "S" + i, name: data[i][0] });
          }
        }
      }
      return createJsonResponse({ success: true, students: students });
    }

    // 4. ATTENDANCE SUBMISSION
    else if (action === "submitAttendance") {
      var batchSheet = ss.getSheetByName(jsonPacket.batch);
      if (!batchSheet) {
        batchSheet = ss.insertSheet(jsonPacket.batch);
        batchSheet.getRange(1, 1).setValue("Student Name");
      }
      
      var today = jsonPacket.date || new Date().toISOString().split("T")[0];
      var data = batchSheet.getDataRange().getValues();
      var headers = data[0] || ["Student Name"];
      
      var dateColumnIndex = headers.indexOf(today) + 1; 
      if (dateColumnIndex === 0) {
        dateColumnIndex = batchSheet.getLastColumn() + 1;
        batchSheet.getRange(1, dateColumnIndex).setValue(today);
      }
      
      var records = jsonPacket.records;
      for (var r = 0; r < records.length; r++) {
        var studentName = records[r].studentName;
        var status = records[r].status;
        
        var studentRowIndex = -1;
        for (var i = 1; i < data.length; i++) {
          if (data[i][0] === studentName) {
            studentRowIndex = i + 1;
            break;
          }
        }
        
        if (studentRowIndex === -1) {
          batchSheet.appendRow([studentName]);
          studentRowIndex = batchSheet.getLastRow();
        }
        
        batchSheet.getRange(studentRowIndex, dateColumnIndex).setValue(status);
      }
      return createJsonResponse({ success: true, message: "Attendance recorded successfully!" });
    }

    return createJsonResponse({ success: false, message: "Unknown action." });

  } catch(error) {
    return createJsonResponse({ success: false, message: error.toString() });
  }
}

function createJsonResponse(outputObject) {
  return ContentService.createTextOutput(JSON.stringify(outputObject))
                        .setMimeType(ContentService.MimeType.JSON);
}
