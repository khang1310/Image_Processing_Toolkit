// File Info for retrieving image.
let fileInfo = {
    fileName: "",
    fileExt: ""
};

//add eventlistener to choose file to name of file input
$("#inputFile").on("change",
    function() {
        fileInfo.fileName = $("#inputFile")[0].files[0].name;
        fileInfo.fileExt = getFileExtension(fileInfo.fileName);
        $("#inputFileLabel").text(fileInfo.fileName);
    })

//add eventlistener to switch to editing page upon 
$("#uploadBtn").on("click",
    function() {
        // Redirect to editing page if the file name is not the default greeting text
        if (fileInfo.fileName != "Choose image file to process") {
            // Send the image to the server.
            let file = $("#inputFile")[0].files[0];
            let formData = new FormData();

            fileInfo.fileName = Date.now() + "_" + file.name;
            sessionStorage.setItem("fileName", fileInfo.fileName);

            formData.append("photo", file, fileInfo.fileName);

            // Send the post request to the server
            $.ajax({
                url: "/server.js",
                method: "post",
                data: formData,
                processData: false,
                contentType: false,

                success: function(data) {
                    if (data.cod == 404) {
                        result.innerHTML = data.message;
                    } else {
                        console.log("Image successfully uploaded to the server.");

                        // Redirect to the edit page
                        window.location.href = "/edit_page";
                    }
                },
            })
        }
    })

// Get file extension (from VisioN on StackOverflow)
function getFileExtension(fileName) {
    return fileName.slice((fileName.lastIndexOf(".") - 1 >>> 0) + 2);
}