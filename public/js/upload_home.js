// Show the image when upload the file.
function previewImage(input) {
    let image = input.files[0];
    let reader = new FileReader();

    reader.readAsDataURL(image);
    reader.onload = function() {
        document.getElementById('output_image').src = reader.result;
    }

    return false;
}