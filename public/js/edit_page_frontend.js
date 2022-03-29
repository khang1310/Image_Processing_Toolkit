//add eventlistener to switch to the change size menu
$("#size_button").on("click",
    function() {
        loadImage()
        if (document.getElementById("factor_text_row") && document.getElementById("factor_tools_row")) {
            $("#factor_text_row").remove().hide().fadeIn('slow');
            $("#factor_tools_row").remove().hide().fadeIn('slow');
        }
        $("#tool_header").html("Scale Image").hide().fadeIn('slow');
        $("#tools_row").load('/size_tool_menu').hide().fadeIn('slow');
        $("#apply_button").hide().fadeIn('slow');
        $("#preview_button").hide().fadeIn('slow');
    })

//add eventlistener to switch to the blur menu
$("#blur_button").on("click",
    function() {
        loadImage()
        if (document.getElementById("factor_text_row") && document.getElementById("factor_tools_row")) {
            $("#factor_text_row").remove().hide().fadeIn('slow');
            $("#factor_tools_row").remove().hide().fadeIn('slow');
        }
        $("#tool_header").html("Blur Image").hide().fadeIn('slow');
        $("#tools_row").load('/blur_tool_menu').hide().fadeIn('slow');
        $("#apply_button").hide().fadeIn('slow');
        $("#preview_button").hide().fadeIn('slow');
    })

//add eventlistener to switch to the noise menu
$("#noise_button").on("click",
    function() {
        loadImage()
        if (document.getElementById("factor_text_row") && document.getElementById("factor_tools_row")) {
            $("#factor_text_row").remove().hide().fadeIn('slow');
            $("#factor_tools_row").remove().hide().fadeIn('slow');
        }
        $("#tool_header").html("Add Noise/Denoise Image").hide().fadeIn('slow');
        $("#tools_row").load('/noise_tool_menu').hide().fadeIn('slow');
        $("#apply_button").hide().fadeIn('slow');
        $("#preview_button").hide().fadeIn('slow');
    })

//add eventlistener to switch to the filter menu
$("#filter_button").on("click",
    function() {
        loadImage()
        if (document.getElementById("factor_text_row") && document.getElementById("factor_tools_row")) {
            $("#factor_text_row").remove().hide().fadeIn('slow');
            $("#factor_tools_row").remove().hide().fadeIn('slow');
        }
        $("#tool_header").html("Apply Filters to Image").hide().fadeIn('slow');
        $("#tools_row").load('/filter_tool_menu').hide().fadeIn('slow');
        $("#apply_button").hide().fadeIn('slow');
        $("#preview_button").hide();
    })

$("#saveImage").on("click",
    function() {
        loadImage();

        let imgPath = document.getElementById("uploadedImage").getAttribute("src");
        saveAs(imgPath, sessionStorage.getItem("fileName"));
    })