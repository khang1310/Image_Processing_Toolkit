// Load the image at the edit page from the database for processing
function loadImage() {
    $.ajax({
        url: "/server.js",
        method: "get",
        data: {
            q: sessionStorage.getItem("fileName")
        },

        success: function(data) {
            if (data.cod == 404) {
                result.innerHTML = data.message;
            } else {
                let timestamp = new Date().getTime();
                document.getElementById("uploadedImage").src = data[0].filePath + "?t=" + timestamp;

                if (document.getElementById("tool_header").innerHTML === "Scale Image") {
                    let myImage = new Image();
                    myImage.src = data[0].filePath;
                    myImage.onload = function() {
                        let w = myImage.width;
                        let h = myImage.height;
                        let imgDim = document.getElementById("image_size_text");
                        imgDim.innerHTML = w + "x" + h;
                    };
                }
            }
        }
    })

    return false;
}

function imageProcess(preview = 0) {
    let processOption;
    let alert;

    // Show alert message if user chooses "Apply to Image" instead of preview
    if (preview === 0) {
        alert = confirm("This will alter the image permanently. Are you sure you want to continue?")
    }

    if (alert || preview === 1) {
        // Scale image
        if (document.getElementById("tool_header").innerHTML === "Scale Image") {
            processOption = "scale";

            // Specified-size scale
            let width = image_width.value;
            let height = image_height.value;

            // Scale-factor scale (using Waifu2x)
            if (!width || !height) {
                if (document.getElementById("scale1.5").checked) {
                    width = "1.5x";
                    height = "1.5x";
                } else if (document.getElementById("scale2.0").checked) {
                    width = "2.0x";
                    height = "2.0x";
                } else if (document.getElementById("scale3.0").checked) {
                    width = "3.0x";
                    height = "3.0x";
                } else if (document.getElementById("scale4.0").checked) {
                    width = "4.0x";
                    height = "4.0x";
                } else {}
            }
            // Specified-size scale (using ImageJ)
            $.ajax({
                url: "/server.js/imageProcess",
                method: "post",
                data: {
                    width: width,
                    height: height,
                    fileName: sessionStorage.getItem("fileName"),
                    processOption: processOption,
                    preview: preview
                },

                success: function(data) {
                    if (data.cod == 404) {
                        result.innerHTML = data.message;
                    } else {
                        let timestamp = new Date().getTime();
                        document.getElementById("uploadedImage").src = data.filePath + "?t=" + timestamp;
                        document.getElementById("image_size_text").innerHTML = data.width + " X " + data.height;
                    }
                }
            })


            // Blur image
        } else if (document.getElementById("tool_header").innerHTML === "Blur Image") {
            processOption = "blur";
            let sigma = document.getElementById("gaussian_amount").value;

            $.ajax({
                url: "/server.js/imageProcess",
                method: "post",
                data: {
                    sigma: sigma,
                    fileName: sessionStorage.getItem("fileName"),
                    processOption: processOption,
                    preview: preview
                },

                success: function(data) {
                    if (data.cod == 404) {
                        result.innerHTML = data.message;
                    } else {
                        let timestamp = new Date().getTime();
                        document.getElementById("uploadedImage").src = data.filePath + "?t=" + timestamp;
                    }
                }
            })

            // Add/remove noise
        } else if (document.getElementById("tool_header").innerHTML === "Add Noise/Denoise Image") {
            processOption = "noise";
            let standardDev = document.getElementById("noise_amount").value;
            let theta = document.getElementById("denoise_amount").value;

            // Denoise settings using Waifu2X
            let denoiseButtons = document.getElementsByName("denoiseFactors");
            let denoiseFactor = "Unchecked";
            for (let i = 0, length = denoiseButtons.length; i < length; i++) {
                if (denoiseButtons[i].checked) {
                    denoiseFactor = denoiseButtons[i].value;
                    break;
                }
            }
            // Prioritize denoise slider over radio buttons
            if (theta > 0 || (denoiseFactor !== "None" && denoiseFactor !== "Unchecked")) {
                if (theta <= 30 || (theta === 0 && denoiseFactor === "Low")) {
                    theta = 1;
                } else if (theta <= 60 || (theta === 0 && denoiseFactor === "Mid")) {
                    theta = 2;
                } else {
                    theta = 3;
                }
            }

            // Add noise using imageJ
            if (standardDev > 0) {
                $.ajax({
                    url: "/server.js/imageProcess",
                    method: "post",
                    data: {
                        standardDev: standardDev,
                        theta: theta,
                        fileName: sessionStorage.getItem("fileName"),
                        processOption: processOption,
                        preview: preview
                    },

                    success: function(data) {
                        if (data.cod == 404) {
                            result.innerHTML = data.message;
                        } else {
                            let timestamp = new Date().getTime();
                            document.getElementById("uploadedImage").src = data.filePath + "?t=" + timestamp;
                        }
                    }
                })
            }
            // Remove noise using Waifu2x
            if (theta > 0) {
                processOption = "denoise"
                $.ajax({
                    url: "/server.js/imageProcess",
                    method: "post",
                    data: {
                        standardDev: standardDev,
                        theta: theta,
                        fileName: sessionStorage.getItem("fileName"),
                        processOption: processOption,
                        preview: preview
                    },

                    success: function(data) {
                        if (data.cod == 404) {
                            result.innerHTML = data.message;
                        } else {
                            let timestamp = new Date().getTime();
                            document.getElementById("uploadedImage").src = data.filePath + "?t=" + timestamp;
                        }
                    }
                })
            }
            // Apply filters to the image
        } else if (document.getElementById("tool_header").innerHTML === "Apply Filters to Image") {
            processOption = "filters";

            $.ajax({
                url: "/server.js/imageProcess",
                method: "post",
                data: {
                    fileName: sessionStorage.getItem("fileName"),
                    processOption: processOption
                },

                success: function(data) {
                    if (data.cod == 404) {
                        result.innerHTML = data.message;
                    } else {
                        let timestamp = new Date().getTime();
                        document.getElementById("uploadedImage").src = data.filePath + "?t=" + timestamp;
                    }
                }
            })
        }
    }
    return false;
}

// Preview image
function preview() {
    return imageProcess(1);
}

// Apply no filter to the image
function noFilter() {
    processOption = "no filter";

    $.ajax({
        url: "/server.js/imageProcess",
        method: "post",
        data: {
            fileName: sessionStorage.getItem("fileName"),
            processOption: processOption
        },

        success: function(data) {
            if (data.cod == 404) {
                result.innerHTML = data.message;
            } else {
                let timestamp = new Date().getTime();
                document.getElementById("uploadedImage").src = data.filePath + "?t=" + timestamp;
            }
        }
    })

    return false;
}

// Vertical mirror
function verticalMirror() {
    processOption = "vertical mirror";

    $.ajax({
        url: "/server.js/imageProcess",
        method: "post",
        data: {
            fileName: sessionStorage.getItem("fileName"),
            processOption: processOption
        },

        success: function(data) {
            if (data.cod == 404) {
                result.innerHTML = data.message;
            } else {
                let timestamp = new Date().getTime();
                document.getElementById("uploadedImage").src = data.filePath + "_filtered" + "?t=" + timestamp;
            }
        }
    })

    return false;
}

// Horizontal Mirror
function horizontalMirror() {
    processOption = "horizontal mirror";

    $.ajax({
        url: "/server.js/imageProcess",
        method: "post",
        data: {
            fileName: sessionStorage.getItem("fileName"),
            processOption: processOption
        },

        success: function(data) {
            if (data.cod == 404) {
                result.innerHTML = data.message;
            } else {
                let timestamp = new Date().getTime();
                document.getElementById("uploadedImage").src = data.filePath + "_filtered" + "?t=" + timestamp;
            }
        }
    })

    return false;
}

// Grayscale
function grayScale() {
    processOption = "grayscale";

    $.ajax({
        url: "/server.js/imageProcess",
        method: "post",
        data: {
            fileName: sessionStorage.getItem("fileName"),
            processOption: processOption
        },

        success: function(data) {
            if (data.cod == 404) {
                result.innerHTML = data.message;
            } else {
                let timestamp = new Date().getTime();
                document.getElementById("uploadedImage").src = data.filePath + "_filtered" + "?t=" + timestamp;
            }
        }
    })

    return false;
}

// Invert the image
function invert() {
    processOption = "invert";

    $.ajax({
        url: "/server.js/imageProcess",
        method: "post",
        data: {
            fileName: sessionStorage.getItem("fileName"),
            processOption: processOption
        },

        success: function(data) {
            if (data.cod == 404) {
                result.innerHTML = data.message;
            } else {
                let timestamp = new Date().getTime();
                document.getElementById("uploadedImage").src = data.filePath + "_filtered" + "?t=" + timestamp;
            }
        }
    })

    return false;
}

// Smooth the image
function smooth() {
    processOption = "smooth";

    $.ajax({
        url: "/server.js/imageProcess",
        method: "post",
        data: {
            fileName: sessionStorage.getItem("fileName"),
            processOption: processOption
        },

        success: function(data) {
            if (data.cod == 404) {
                result.innerHTML = data.message;
            } else {
                let timestamp = new Date().getTime();
                document.getElementById("uploadedImage").src = data.filePath + "_filtered" + "?t=" + timestamp;
            }
        }
    })

    return false;
}

// Sharpen the image
function sharpen() {
    processOption = "sharpen";

    $.ajax({
        url: "/server.js/imageProcess",
        method: "post",
        data: {
            fileName: sessionStorage.getItem("fileName"),
            processOption: processOption
        },

        success: function(data) {
            if (data.cod == 404) {
                result.innerHTML = data.message;
            } else {
                let timestamp = new Date().getTime();
                document.getElementById("uploadedImage").src = data.filePath + "_filtered" + "?t=" + timestamp;
            }
        }
    })

    return false;
}